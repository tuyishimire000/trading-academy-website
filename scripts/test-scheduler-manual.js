const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_academy',
  port: process.env.DB_PORT || 3306
};

async function testSchedulerManual() {
  let connection;

  try {
    console.log('🧪 Testing manual scheduler for hilbert.apply@gmail.com...');

    // 1. Test database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected');

    // 2. Find the user
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

    // 3. Test the manual scheduler API
    console.log('\n🔄 Testing manual scheduler API...');
    
    const testData = {
      action: "test-specific-user",
      email: user.email
    };

    try {
      const response = await fetch('http://localhost:3000/api/test/manual-scheduler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Manual scheduler test successful');
        console.log('   User:', result.user);
        console.log('   Subscription:', result.subscription);
        console.log('   Scheduler Actions:', result.schedulerActions);
        
        // 4. Test specific scheduler actions based on subscription status
        if (result.schedulerActions.wouldSendReminder) {
          console.log('\n📧 Testing reminder sending...');
          await testSchedulerAction('send-reminders');
        }
        
        if (result.schedulerActions.wouldDowngrade) {
          console.log('\n🔄 Testing expired subscription check...');
          await testSchedulerAction('check-expired');
        }
        
      } else {
        console.log('❌ Manual scheduler test failed');
        console.log('   Error:', result.error);
      }
    } catch (error) {
      console.log('❌ Failed to call manual scheduler API:', error.message);
      console.log('   Make sure your Next.js server is running on http://localhost:3000');
    }

    console.log('\n🎯 Test Summary:');
    console.log('   - Database connection: ✅');
    console.log('   - User found: ✅');
    console.log('   - Manual scheduler API: Check above');

  } catch (error) {
    console.error('❌ Error in manual scheduler test:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function testSchedulerAction(action) {
  try {
    const response = await fetch('http://localhost:3000/api/test/manual-scheduler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${action} completed successfully`);
      console.log('   Message:', result.message);
    } else {
      console.log(`❌ ${action} failed`);
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.log(`❌ Failed to execute ${action}:`, error.message);
  }
}

testSchedulerManual()
  .then(() => {
    console.log('\n🎉 Manual scheduler test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Manual scheduler test failed:', error);
    process.exit(1);
  });
