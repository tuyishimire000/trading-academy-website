const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_academy',
  port: process.env.DB_PORT || 3306
};

async function restoreSubscription() {
  let connection;

  try {
    console.log('🔄 Restoring original subscription for hilbert.apply@gmail.com...');

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

    // 2. Get all subscriptions for the user
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
    `, [user.id]);

    console.log(`📊 Current subscriptions:`);
    subscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.plan_display_name} - ${sub.status} (${sub.current_period_end})`);
    });

    // 3. Find the original premium subscription (should be the expired one)
    const premiumSubscription = subscriptions.find(sub => sub.plan_name === 'premium');
    const freeSubscription = subscriptions.find(sub => sub.plan_name === 'free');

    if (!premiumSubscription) {
      console.log('❌ No premium subscription found to restore');
      return;
    }

    // 4. Restore the premium subscription
    console.log(`\n🔄 Restoring premium subscription...`);
    
    // Set the premium subscription back to active and extend the period
    const now = new Date();
    const newEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    await connection.execute(`
      UPDATE user_subscriptions 
      SET status = 'active', 
          current_period_start = ?, 
          current_period_end = ?, 
          updated_at = NOW()
      WHERE id = ?
    `, [now, newEndDate, premiumSubscription.id]);

    console.log(`✅ Restored premium subscription to active status`);
    console.log(`   - New period end: ${newEndDate.toISOString()}`);

    // 5. Remove the free subscription (if it exists)
    if (freeSubscription) {
      console.log(`\n🗑️  Removing test free subscription...`);
      
      await connection.execute(`
        DELETE FROM user_subscriptions 
        WHERE id = ?
      `, [freeSubscription.id]);

      console.log(`✅ Removed free subscription`);
    }

    // 6. Verify the restoration
    const [restoredSubscriptions] = await connection.execute(`
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

    console.log(`\n📊 Restored subscription status:`);
    restoredSubscriptions.forEach((sub, index) => {
      console.log(`   ${index + 1}. ${sub.plan_display_name} - ${sub.status} (${sub.current_period_end})`);
    });

    console.log(`\n🎯 Restoration Complete:`);
    console.log(`   - Premium subscription restored to active status`);
    console.log(`   - Test free subscription removed`);
    console.log(`   - User can now access premium features again`);

  } catch (error) {
    console.error('❌ Error restoring subscription:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

restoreSubscription()
  .then(() => {
    console.log('\n🎉 Subscription restoration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Subscription restoration failed:', error);
    process.exit(1);
  });
