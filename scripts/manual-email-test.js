const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_academy',
  port: process.env.DB_PORT || 3306
};

async function manualEmailTest() {
  let connection;

  try {
    console.log('🧪 Manual email test for hilbert.apply@gmail.com...');

    // 1. Check if email configuration is set up
    console.log('\n📧 Email Configuration Status:');
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log('❌ Email configuration is missing!');
      console.log('\n🔧 To fix this, add the following to your .env.local file:');
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
      console.log('📝 For other email providers, check the ENVIRONMENT_VARIABLES.md file');
      return;
    }

    console.log('✅ Email configuration found');
    console.log(`   SMTP_HOST: ${smtpHost}`);
    console.log(`   SMTP_USER: ${smtpUser}`);
    console.log(`   SMTP_PASS: ${smtpPass ? '✅ SET' : '❌ NOT SET'}`);

    // 2. Test database connection
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

    // 4. Test the email reminder API endpoint
    console.log('\n📧 Testing email reminder API endpoint...');
    
    const testData = {
      action: "test-reminder",
      email: user.email
    };

    try {
      const response = await fetch('http://localhost:3000/api/test/email-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Email reminder API test successful');
        console.log('   Response:', result);
      } else {
        console.log('❌ Email reminder API test failed');
        console.log('   Error:', result.error);
      }
    } catch (error) {
      console.log('❌ Failed to call email reminder API:', error.message);
      console.log('   Make sure your Next.js server is running on http://localhost:3000');
    }

    // 5. Alternative: Test direct email sending
    console.log('\n📧 Testing direct email sending...');
    
    try {
      // Import the email service
      const { sendEmail } = require('../lib/services/email.js');
      
      const emailData = {
        to: user.email,
        subject: "Test Email - Subscription Renewal",
        template: "subscription-expiring-soon",
        data: {
          firstName: user.first_name,
          planName: "Premium Plan",
          expirationDate: new Date().toLocaleDateString(),
          daysUntilExpiration: 5,
          renewalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscription?renewal=true`
        }
      };

      const result = await sendEmail(emailData);
      console.log('✅ Direct email sent successfully!');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   To: ${user.email}`);
      
    } catch (error) {
      console.log('❌ Direct email sending failed:', error.message);
      
      if (error.code === 'EAUTH') {
        console.log('\n🔧 AUTHENTICATION ERROR:');
        console.log('   - Check your SMTP_USER and SMTP_PASS');
        console.log('   - For Gmail, make sure you\'re using an App Password');
      } else if (error.code === 'ECONNECTION') {
        console.log('\n🔧 CONNECTION ERROR:');
        console.log('   - Check your SMTP_HOST and SMTP_PORT');
        console.log('   - Verify your internet connection');
      }
    }

    console.log('\n🎯 Test Summary:');
    console.log('   - Email configuration: Check above');
    console.log('   - Database connection: ✅');
    console.log('   - User found: ✅');
    console.log('   - API test: Check above');
    console.log('   - Direct email: Check above');

  } catch (error) {
    console.error('❌ Error in manual email test:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

manualEmailTest()
  .then(() => {
    console.log('\n🎉 Manual email test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Manual email test failed:', error);
    process.exit(1);
  });
