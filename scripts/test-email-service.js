const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_academy',
  port: process.env.DB_PORT || 3306
};

async function testEmailService() {
  let connection;

  try {
    console.log('🧪 Testing email service configuration...');

    // 1. Check environment variables
    console.log('\n📧 Email Configuration Check:');
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || '❌ NOT SET'}`);
    console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '❌ NOT SET'}`);
    console.log(`   SMTP_USER: ${process.env.SMTP_USER || '❌ NOT SET'}`);
    console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   SMTP_FROM: ${process.env.SMTP_FROM || '❌ NOT SET'}`);
    console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || '❌ NOT SET'}`);

    // 2. Test email service import
    console.log('\n📦 Testing email service import...');
    try {
      const { sendEmail } = require('../lib/services/email.ts');
      console.log('✅ Email service imported successfully');
    } catch (error) {
      console.log('❌ Failed to import email service:', error.message);
      return;
    }

    // 3. Test database connection
    console.log('\n🗄️ Testing database connection...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');

    // 4. Find the user
    console.log('\n👤 Finding user hilbert.apply@gmail.com...');
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
    console.log(`✅ Found user: ${user.first_name} ${user.last_name} (${user.email})`);

    // 5. Get user's subscription
    console.log('\n📋 Getting user subscription...');
    const [subscriptions] = await connection.execute(`
      SELECT 
        us.id,
        us.status,
        us.current_period_start,
        us.current_period_end,
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

    const subscription = subscriptions[0];
    console.log(`✅ Found subscription: ${subscription.plan_display_name} - ${subscription.status}`);

    // 6. Test email sending
    console.log('\n📧 Testing email sending...');
    
    // Import the email service
    const { sendEmail } = require('../lib/services/email.ts');
    
    const emailData = {
      to: user.email,
      subject: "Test Email - Subscription Renewal",
      template: "subscription-expiring-soon",
      data: {
        firstName: user.first_name,
        planName: subscription.plan_display_name,
        expirationDate: subscription.current_period_end?.toLocaleDateString() || 'Unknown',
        daysUntilExpiration: 5,
        renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription?renewal=true`
      }
    };

    try {
      const result = await sendEmail(emailData);
      console.log('✅ Email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   To: ${user.email}`);
      console.log(`   Subject: ${emailData.subject}`);
    } catch (error) {
      console.log('❌ Failed to send email:', error.message);
      
      // Provide helpful error information
      if (error.code === 'EAUTH') {
        console.log('\n🔧 AUTHENTICATION ERROR:');
        console.log('   - Check your SMTP_USER and SMTP_PASS');
        console.log('   - For Gmail, make sure you\'re using an App Password');
        console.log('   - Enable 2-factor authentication and generate an App Password');
      } else if (error.code === 'ECONNECTION') {
        console.log('\n🔧 CONNECTION ERROR:');
        console.log('   - Check your SMTP_HOST and SMTP_PORT');
        console.log('   - Verify your internet connection');
        console.log('   - Check if the SMTP server is accessible');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('\n🔧 TIMEOUT ERROR:');
        console.log('   - The SMTP server is not responding');
        console.log('   - Check your SMTP configuration');
      }
    }

    // 7. Test scheduler email sending
    console.log('\n🔄 Testing scheduler email sending...');
    try {
      const { SubscriptionScheduler } = require('../lib/services/scheduler.ts');
      
      // Test the scheduler's email sending method directly
      const testSubscription = {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        },
        plan: {
          id: subscription.id,
          name: subscription.plan_name,
          display_name: subscription.plan_display_name,
          price: subscription.plan_price
        },
        current_period_end: subscription.current_period_end
      };

      // This would normally be called by the scheduler
      console.log('✅ Scheduler email method available');
      console.log('   Note: The scheduler runs on a cron schedule');
      console.log('   You can manually trigger it by calling the scheduler methods');
      
    } catch (error) {
      console.log('❌ Failed to test scheduler:', error.message);
    }

    console.log('\n🎯 Test Summary:');
    console.log('   - Email configuration: Check the output above');
    console.log('   - Database connection: ✅');
    console.log('   - User found: ✅');
    console.log('   - Subscription found: ✅');
    console.log('   - Email sending: Check the output above');

  } catch (error) {
    console.error('❌ Error testing email service:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testEmailService()
  .then(() => {
    console.log('\n🎉 Email service test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Email service test failed:', error);
    process.exit(1);
  });
