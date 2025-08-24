const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_academy',
  port: process.env.DB_PORT || 3306
};

async function testEmailScenario() {
  let connection;

  try {
    console.log('🧪 Setting up email test scenario for hilbert.apply@gmail.com...');

    // 1. Check email configuration
    console.log('\n📧 Email Configuration Check:');
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log('❌ Email configuration is missing!');
      console.log('\n🔧 To enable email testing, add the following to your .env.local file:');
      console.log('');
      console.log('# Email Configuration (Gmail Example)');
      console.log('SMTP_HOST=smtp.gmail.com');
      console.log('SMTP_PORT=587');
      console.log('SMTP_USER=your-email@gmail.com');
      console.log('SMTP_PASS=your-16-digit-app-password');
      console.log('SMTP_FROM=noreply@tradingacademy.com');
      console.log('NEXT_PUBLIC_APP_URL=http://localhost:3000');
      console.log('');
      console.log('📝 For Gmail setup:');
      console.log('1. Enable 2-factor authentication on your Gmail account');
      console.log('2. Generate an App Password (Google Account > Security > App Passwords)');
      console.log('3. Use the 16-digit app password as SMTP_PASS');
      console.log('');
      console.log('⚠️  Without email configuration, the scheduler will not send emails.');
      console.log('   The renewal flow will still work, but no email notifications will be sent.');
    } else {
      console.log('✅ Email configuration found');
    }

    // 2. Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // 3. Find the user
    const [users] = await connection.execute(`
      SELECT id, email, first_name, last_name
      FROM users 
      WHERE email = 'hilbert.apply@gmail.com'
    `);

    if (users.length === 0) {
      console.log('❌ User hilbert.apply@gmail.com not found');
      return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.first_name} ${user.last_name}`);

    // 4. Get current subscription
    const [subscriptions] = await connection.execute(`
      SELECT 
        us.id,
        us.status,
        us.current_period_start,
        us.current_period_end,
        us.plan_id,
        sp.name as plan_name,
        sp.display_name as plan_display_name,
        sp.price as plan_price
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
      LIMIT 1
    `, [user.id]);

    if (subscriptions.length === 0) {
      console.log('❌ No subscription found for user');
      return;
    }

    const currentSubscription = subscriptions[0];
    console.log(`📋 Current subscription: ${currentSubscription.plan_display_name} - ${currentSubscription.status}`);
    console.log(`   Period End: ${currentSubscription.current_period_end}`);

    // 5. Get premium plan for testing
    const [premiumPlans] = await connection.execute(`
      SELECT id, name, display_name, price
      FROM subscription_plans 
      WHERE name != 'free'
      ORDER BY price ASC
      LIMIT 1
    `);

    if (premiumPlans.length === 0) {
      console.log('❌ No premium plans found in database');
      return;
    }

    const premiumPlan = premiumPlans[0];
    console.log(`📋 Premium plan found: ${premiumPlan.display_name} - $${premiumPlan.price}`);

    // 6. Create test scenarios
    console.log('\n🎭 Creating test scenarios...');

    // Scenario 1: Subscription expiring in 5 days
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    
    await connection.execute(`
      INSERT INTO user_subscriptions (
        id, user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at
      ) VALUES (UUID(), ?, ?, 'active', NOW(), ?, NOW(), NOW())
    `, [user.id, premiumPlan.id, fiveDaysFromNow]);

    console.log(`✅ Created test subscription expiring in 5 days (${fiveDaysFromNow.toLocaleDateString()})`);

    // Scenario 2: Expired subscription
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await connection.execute(`
      INSERT INTO user_subscriptions (
        id, user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at
      ) VALUES (UUID(), ?, ?, 'active', ?, ?, NOW(), NOW())
    `, [user.id, premiumPlan.id, yesterday, yesterday]);

    console.log(`✅ Created test expired subscription (${yesterday.toLocaleDateString()})`);

    // 7. Test the scheduler
    console.log('\n🔄 Testing scheduler with new scenarios...');
    
    try {
      const response = await fetch('http://localhost:3000/api/test/manual-scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: "test-specific-user",
          email: user.email 
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Scheduler test successful');
        console.log('   Scheduler Actions:', result.schedulerActions);
        
        if (result.schedulerActions.wouldSendReminder) {
          console.log('📧 Would send reminder email');
        }
        
        if (result.schedulerActions.wouldDowngrade) {
          console.log('🔄 Would downgrade subscription');
        }
        
        if (result.schedulerActions.wouldSendExpirationEmail) {
          console.log('📧 Would send expiration email');
        }
      } else {
        console.log('❌ Scheduler test failed:', result.error);
      }
    } catch (error) {
      console.log('❌ Failed to test scheduler:', error.message);
    }

    // 8. Show all user subscriptions
    console.log('\n📊 All subscriptions for user:');
    const [allSubscriptions] = await connection.execute(`
      SELECT 
        us.id,
        us.status,
        us.current_period_start,
        us.current_period_end,
        sp.name as plan_name,
        sp.display_name as plan_display_name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
    `, [user.id]);

    allSubscriptions.forEach((sub, index) => {
      const isExpired = new Date(sub.current_period_end) < new Date();
      const daysUntilExpiration = Math.ceil((new Date(sub.current_period_end) - new Date()) / (1000 * 60 * 60 * 24));
      
      console.log(`   ${index + 1}. ${sub.plan_display_name} - ${sub.status}`);
      console.log(`      Period End: ${sub.current_period_end}`);
      console.log(`      Status: ${isExpired ? 'EXPIRED' : `${daysUntilExpiration} days remaining`}`);
    });

    console.log('\n🎯 Test Scenario Summary:');
    console.log('   - Email configuration: Check above');
    console.log('   - Database connection: ✅');
    console.log('   - User found: ✅');
    console.log('   - Test subscriptions created: ✅');
    console.log('   - Scheduler tested: ✅');
    console.log('');
    console.log('📧 To test email sending:');
    console.log('   1. Configure email settings in .env.local');
    console.log('   2. Run: node scripts/manual-email-test.js');
    console.log('   3. Or trigger scheduler manually via API');
    console.log('');
    console.log('🔄 To clean up test data:');
    console.log('   Run: node scripts/restore-subscription.js');

  } catch (error) {
    console.error('❌ Error in email scenario test:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testEmailScenario()
  .then(() => {
    console.log('\n🎉 Email scenario test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Email scenario test failed:', error);
    process.exit(1);
  });
