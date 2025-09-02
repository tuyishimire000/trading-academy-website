const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTradingJournal() {
  let connection;

  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'trading_academy',
      charset: 'utf8mb4'
    });

    console.log('Connected to database successfully');

    // Check what trading journal tables exist
    const [tables] = await connection.execute('SHOW TABLES LIKE "trading_journal_%"');
    console.log('Trading journal tables:', tables.map(t => Object.values(t)[0]));

    // Check each table for data
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`${tableName}: ${count[0].count} rows`);
      
      if (count[0].count > 0) {
        const [sample] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 1`);
        console.log(`Sample data from ${tableName}:`, sample[0]);
      }
    }

    // Check if there are any users
    const [users] = await connection.execute('SELECT id, email FROM users LIMIT 5');
    console.log('Users in database:', users);

  } catch (error) {
    console.error('Error checking trading journal:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkTradingJournal().catch(console.error);


