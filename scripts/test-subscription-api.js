const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_academy',
  port: process.env.DB_PORT || 3306
};

async function testSubscriptionAPI() {
  let connection;

  try {
    console.log('🧪 Testing subscription API for hilbert.apply@gmail.com...');

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

    // 2. Test the subscription query that the API uses
    console.log(`\n🔍 Testing subscription API query...`);
    
    const [subscriptions] = await connection.execute(`
      SELECT 
        us.id,
        us.plan_id,
        us.status,
        us.current_period_start,
        us.current_period_end,
        sp.id as plan_id,
        sp.name as plan_name,
        sp.display_name as plan_display_name,
        sp.price as plan_price,
        sp.billing_cycle as plan_billing_cycle,
        sp.features as plan_features
      FROM user_subscriptions us
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
      LIMIT 1
    `, [user.id]);

    if (subscriptions.length === 0) {
      console.log('❌ No subscription found');
      return;
    }

    const subscription = subscriptions[0];
    console.log(`📋 Subscription API Response:`);
    console.log(`   - ID: ${subscription.id}`);
    console.log(`   - Status: ${subscription.status}`);
    console.log(`   - Plan ID: ${subscription.plan_id}`);
    console.log(`   - Plan Name: ${subscription.plan_name || 'NULL'}`);
    console.log(`   - Plan Display Name: ${subscription.plan_display_name || 'NULL'}`);
    console.log(`   - Plan Price: ${subscription.plan_price || 'NULL'}`);
    console.log(`   - Period End: ${subscription.current_period_end}`);

    // 3. Test the fallback plan fetching (our fix)
    if (!subscription.plan_name && subscription.plan_id) {
      console.log(`\n🔄 Testing fallback plan fetching...`);
      
      const [plan] = await connection.execute(`
        SELECT id, name, display_name, price, billing_cycle, features
        FROM subscription_plans 
        WHERE id = ?
      `, [subscription.plan_id]);

      if (plan.length > 0) {
        console.log(`✅ Fallback plan found:`);
        console.log(`   - Name: ${plan[0].name}`);
        console.log(`   - Display Name: ${plan[0].display_name}`);
        console.log(`   - Price: $${plan[0].price}`);
      } else {
        console.log(`❌ Fallback plan not found for plan_id: ${subscription.plan_id}`);
      }
    }

    // 4. Check all subscriptions for the user
    console.log(`\n📊 All subscriptions for user:`);
    const [allSubscriptions] = await connection.execute(`
      SELECT 
        us.id,
        us.status,
        us.plan_id,
        sp.name as plan_name,
        sp.display_name as plan_display_name,
        us.current_period_end
      FROM user_subscriptions us
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
    `, [user.id]);

    allSubscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.plan_display_name || 'Unknown Plan'} - ${sub.status} (${sub.current_period_end})`);
    });

    // 5. Test the renewal scenario
    console.log(`\n🎯 Testing renewal scenario:`);
    const activeSubscription = allSubscriptions.find(sub => sub.status === 'active');
    const expiredSubscription = allSubscriptions.find(sub => sub.status === 'expired');

    if (activeSubscription && expiredSubscription) {
      console.log(`✅ Renewal scenario detected:`);
      console.log(`   - Active subscription: ${activeSubscription.plan_display_name || 'Unknown'}`);
      console.log(`   - Expired subscription: ${expiredSubscription.plan_display_name || 'Unknown'}`);
      console.log(`   - User should see renewal interface`);
    } else if (activeSubscription) {
      console.log(`✅ User has active subscription: ${activeSubscription.plan_display_name || 'Unknown'}`);
    } else {
      console.log(`❌ No active subscription found`);
    }

    console.log(`\n🔗 Test URLs:`);
    console.log(`   - Regular subscription: http://localhost:3000/subscription`);
    console.log(`   - Renewal subscription: http://localhost:3000/subscription?renewal=true`);

  } catch (error) {
    console.error('❌ Error testing subscription API:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testSubscriptionAPI()
  .then(() => {
    console.log('\n🎉 Subscription API test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Subscription API test failed:', error);
    process.exit(1);
  });
