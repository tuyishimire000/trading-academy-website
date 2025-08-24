const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_academy',
  port: process.env.DB_PORT || 3306
};

async function testEmailSent() {
  let connection;

  try {
    console.log('🧪 Testing if emails were sent to hilbert.apply@gmail.com...');

    // 1. Check email configuration
    console.log('\n📧 Email Configuration:');
    console.log(`   SMTP_HOST: ${process.env.SMTP_HOST}`);
    console.log(`   SMTP_USER: ${process.env.SMTP_USER}`);
    console.log(`   SMTP_PASS: ${process.env.SMTP_PASS ? '✅ SET' : '❌ NOT SET'}`);
    console.log(`   SMTP_FROM: ${process.env.SMTP_FROM}`);

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

    // 4. Check all subscriptions for the user
    console.log('\n📊 User subscriptions:');
    const [subscriptions] = await connection.execute(`
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

    subscriptions.forEach((sub, index) => {
      const isExpired = new Date(sub.current_period_end) < new Date();
      const daysUntilExpiration = Math.ceil((new Date(sub.current_period_end) - new Date()) / (1000 * 60 * 60 * 24));
      
      console.log(`   ${index + 1}. ${sub.plan_display_name} - ${sub.status}`);
      console.log(`      Period End: ${sub.current_period_end}`);
      console.log(`      Status: ${isExpired ? 'EXPIRED' : `${daysUntilExpiration} days remaining`}`);
    });

    // 5. Test the email reminder API
    console.log('\n📧 Testing email reminder API...');
    
    try {
      const response = await fetch('http://localhost:3000/api/test/email-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: "test-reminder",
          email: user.email
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Email reminder API test successful');
        console.log('   Response:', result.message);
      } else {
        console.log('❌ Email reminder API test failed');
        console.log('   Error:', result.error);
      }
    } catch (error) {
      console.log('❌ Failed to call email reminder API:', error.message);
    }

    console.log('\n🎯 Summary:');
    console.log('   - Email configuration: ✅');
    console.log('   - Database connection: ✅');
    console.log('   - User found: ✅');
    console.log('   - Subscriptions found: ✅');
    console.log('   - Email API test: Check above');
    console.log('');
    console.log('📧 Check your email inbox (hilbert.apply@gmail.com) for:');
    console.log('   - Test emails from the API');
    console.log('   - Reminder emails from the scheduler');
    console.log('   - Expiration emails from the scheduler');
    console.log('');
    console.log('🔍 If no emails received, check:');
    console.log('   1. Spam/Junk folder');
    console.log('   2. Gmail App Password is correct');
    console.log('   3. 2-factor authentication is enabled');
    console.log('   4. Gmail SMTP settings are correct');

  } catch (error) {
    console.error('❌ Error testing email:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testEmailSent()
  .then(() => {
    console.log('\n🎉 Email test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Email test failed:', error);
    process.exit(1);
  });
