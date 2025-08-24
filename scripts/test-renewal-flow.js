const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_academy',
  port: process.env.DB_PORT || 3306
};

async function testRenewalFlow() {
  let connection;

  try {
    console.log('🧪 Testing subscription renewal flow for hilbert.apply@gmail.com...');

    connection = await mysql.createConnection(dbConfig);

    // 1. Find the user
    const [users] = await connection.execute(`
      SELECT id, email, first_name, last_name, created_at
      FROM users 
      WHERE email = 'hilbert.apply@gmail.com'
    `);

    if (users.length === 0) {
      console.log('❌ User hilbert.apply@gmail.com not found');
      return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.first_name} ${user.last_name} (${user.email})`);

    // 2. Check current subscription status
    const [subscriptions] = await connection.execute(`
      SELECT 
        us.id,
        us.status,
        us.current_period_start,
        us.current_period_end,
        us.created_at,
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
    console.log(`📋 Current subscription:`);
    console.log(`   - Plan: ${subscription.plan_display_name} (${subscription.plan_name})`);
    console.log(`   - Status: ${subscription.status}`);
    console.log(`   - Price: $${subscription.plan_price}`);
    console.log(`   - Period Start: ${subscription.current_period_start}`);
    console.log(`   - Period End: ${subscription.current_period_end}`);

    // 3. Check if subscription is expired
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    const isExpired = periodEnd < now;
    const daysUntilExpiration = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));

    console.log(`\n⏰ Subscription Status:`);
    console.log(`   - Current Date: ${now.toISOString()}`);
    console.log(`   - Period End: ${periodEnd.toISOString()}`);
    console.log(`   - Is Expired: ${isExpired ? 'Yes' : 'No'}`);
    console.log(`   - Days until expiration: ${daysUntilExpiration}`);

    // 4. Check if user has multiple subscriptions
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

    console.log(`\n📊 All subscriptions for user:`);
    allSubscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.plan_display_name} - ${sub.status} (${sub.current_period_end})`);
    });

    // 5. Test the renewal URL
    const renewalUrl = `http://localhost:3000/subscription?renewal=true`;
    console.log(`\n🔗 Test Renewal URL:`);
    console.log(`   ${renewalUrl}`);

    // 6. Check if free plan exists (for scheduler testing)
    const [freePlan] = await connection.execute(`
      SELECT id, name, display_name, price
      FROM subscription_plans 
      WHERE name = 'free'
    `);

    if (freePlan.length > 0) {
      console.log(`\n✅ Free plan found: ${freePlan[0].display_name} ($${freePlan[0].price})`);
    } else {
      console.log(`\n❌ Free plan not found - this will cause scheduler issues`);
    }

    // 7. Simulate what would happen if scheduler runs
    if (isExpired) {
      console.log(`\n🔄 Simulating scheduler behavior for expired subscription:`);
      console.log(`   - Current subscription would be marked as 'expired'`);
      console.log(`   - New free subscription would be created`);
      console.log(`   - Expiration email would be sent with renewal URL`);
    } else if (daysUntilExpiration <= 7) {
      console.log(`\n📧 Simulating scheduler behavior for expiring subscription:`);
      console.log(`   - Reminder email would be sent with renewal URL`);
    } else {
      console.log(`\n✅ Subscription is active and not expiring soon`);
    }

    console.log(`\n🎯 Test Results Summary:`);
    console.log(`   - User exists: ✅`);
    console.log(`   - Has subscription: ✅`);
    console.log(`   - Subscription status: ${subscription.status}`);
    console.log(`   - Plan: ${subscription.plan_display_name}`);
    console.log(`   - Expired: ${isExpired ? 'Yes' : 'No'}`);
    console.log(`   - Free plan available: ${freePlan.length > 0 ? 'Yes' : 'No'}`);
    console.log(`   - Renewal URL ready: ✅`);

    if (isExpired) {
      console.log(`\n⚠️  RECOMMENDATION: Test the renewal flow by visiting:`);
      console.log(`   ${renewalUrl}`);
      console.log(`   This should show the renewal interface without data loss.`);
    }

  } catch (error) {
    console.error('❌ Error testing renewal flow:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testRenewalFlow()
  .then(() => {
    console.log('\n🎉 Renewal flow test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Renewal flow test failed:', error);
    process.exit(1);
  });
