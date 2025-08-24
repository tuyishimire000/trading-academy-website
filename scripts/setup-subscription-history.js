const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trading_academy',
  port: process.env.DB_PORT || 3306
};

async function setupSubscriptionHistory() {
  let connection;
  
  try {
    console.log('🔧 Setting up subscription history table...');
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    
    // Read and execute the table creation SQL
    const createTableSQL = fs.readFileSync(
      path.join(__dirname, 'create-user-subscription-history.sql'), 
      'utf8'
    );
    
    console.log('📋 Creating user_subscription_history table...');
    
    // Split the SQL into individual statements and execute them
    const statements = createTableSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          console.log(`⚠️  Warning: ${error.message}`);
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Table created successfully');
    
    // Read and execute the seed data SQL
    const seedDataSQL = fs.readFileSync(
      path.join(__dirname, 'seed-subscription-history.sql'), 
      'utf8'
    );
    
    console.log('🌱 Seeding subscription history data...');
    
    // Split the SQL into individual statements and execute them
    const seedStatements = seedDataSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of seedStatements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
        } catch (error) {
          console.log(`⚠️  Warning: ${error.message}`);
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Subscription history data seeded successfully');
    
    // Verify the setup
    console.log('🔍 Verifying setup...');
    
    const [rows] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT action_type) as action_types
      FROM user_subscription_history
    `);
    
    console.log('📊 Setup Summary:');
    console.log(`   Total records: ${rows[0].total_records}`);
    console.log(`   Unique users: ${rows[0].unique_users}`);
    console.log(`   Action types: ${rows[0].action_types}`);
    
    // Show sample data
    const [sampleData] = await connection.execute(`
      SELECT 
        ush.action_type,
        ush.payment_method,
        ush.payment_amount,
        ush.payment_status,
        ush.created_at,
        u.email as user_email,
        sp1.display_name as previous_plan,
        sp2.display_name as new_plan
      FROM user_subscription_history ush
      LEFT JOIN users u ON ush.user_id = u.id
      LEFT JOIN subscription_plans sp1 ON ush.previous_plan_id = sp1.id
      LEFT JOIN subscription_plans sp2 ON ush.new_plan_id = sp2.id
      ORDER BY ush.created_at DESC
      LIMIT 5
    `);
    
    console.log('\n📋 Sample Data:');
    sampleData.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.action_type.toUpperCase()} - ${record.user_email}`);
      console.log(`      ${record.previous_plan || 'None'} → ${record.new_plan}`);
      console.log(`      ${record.payment_method || 'N/A'} - $${record.payment_amount || 0} (${record.payment_status || 'N/A'})`);
      console.log(`      ${record.created_at.toLocaleDateString()}`);
      console.log('');
    });
    
    console.log('🎉 Subscription history setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up subscription history:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupSubscriptionHistory()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupSubscriptionHistory };
