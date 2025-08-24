const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_academy',
  port: process.env.DB_PORT || 3306
};

async function testExpiredRenewal() {
  let connection;

  try {
    console.log('🧪 Testing expired subscription renewal flow for hilbert.apply@gmail.com...');

    connection = await mysql.createConnection(dbConfig);

    // 1. Find the user
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

    // 2. Get current subscription
    const [subscriptions] = await connection.execute(`
      SELECT 
        us.id,
        us.status,
        us.current_period_start,
        us.current_period_end,
        us.plan_id,
        sp.name as plan_name,
        sp.display_name as plan_display_name
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
    console.log(`📋 Current subscription:`);
    console.log(`   - ID: ${subscription.id}`);
    console.log(`   - Plan: ${subscription.plan_display_name} (${subscription.plan_name})`);
    console.log(`   - Status: ${subscription.status}`);
    console.log(`   - Period End: ${subscription.current_period_end}`);

    // 3. Temporarily expire the subscription for testing
    console.log(`\n🔄 Temporarily expiring subscription for testing...`);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await connection.execute(`
      UPDATE user_subscriptions 
      SET current_period_end = ?, updated_at = NOW()
      WHERE id = ?
    `, [yesterday, subscription.id]);

    console.log(`✅ Subscription expired (set to ${yesterday.toISOString()})`);

    // 4. Check if free plan exists
    const [freePlan] = await connection.execute(`
      SELECT id, name, display_name, price
      FROM subscription_plans 
      WHERE name = 'free'
    `);

    if (freePlan.length === 0) {
      console.log('❌ Free plan not found - cannot test scheduler');
      return;
    }

    // 5. Simulate scheduler behavior - mark as expired and create free subscription
    console.log(`\n🔄 Simulating scheduler behavior...`);
    
    // Mark current subscription as expired
    await connection.execute(`
      UPDATE user_subscriptions 
      SET status = 'expired', updated_at = NOW()
      WHERE id = ?
    `, [subscription.id]);

    console.log(`✅ Marked subscription as expired`);

    // Create new free subscription
    const now = new Date();
    const freeEndDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    
    const [newSubscription] = await connection.execute(`
      INSERT INTO user_subscriptions (
        user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at
      ) VALUES (?, ?, 'active', ?, ?, NOW(), NOW())
    `, [user.id, freePlan[0].id, now, freeEndDate]);

    console.log(`✅ Created new free subscription`);

    // 6. Verify the changes
    const [updatedSubscriptions] = await connection.execute(`
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

    console.log(`\n📊 Updated subscription status:`);
    updatedSubscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.plan_display_name} - ${sub.status} (${sub.current_period_end})`);
    });

    // 7. Test the renewal URL
    const renewalUrl = `http://localhost:3000/subscription?renewal=true`;
    console.log(`\n🔗 Test Renewal URL:`);
    console.log(`   ${renewalUrl}`);

    console.log(`\n🎯 Test Setup Complete:`);
    console.log(`   - Original subscription marked as 'expired'`);
    console.log(`   - New free subscription created`);
    console.log(`   - User should now see renewal interface when visiting:`);
    console.log(`     ${renewalUrl}`);
    console.log(`\n⚠️  IMPORTANT: This is a test setup. The user's subscription has been temporarily modified.`);
    console.log(`   To restore the original subscription, run the restore script.`);

  } catch (error) {
    console.error('❌ Error testing expired renewal flow:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testExpiredRenewal()
  .then(() => {
    console.log('\n🎉 Expired renewal test setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Expired renewal test setup failed:', error);
    process.exit(1);
  });
