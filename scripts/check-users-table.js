const mysql = require('mysql2/promise');

async function checkUsersTable() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'trading_academy'
    });

    console.log('✅ Connected to database\n');

    // Check users table structure more carefully
    console.log('📋 Users table structure (detailed):');
    const [userColumns] = await connection.execute(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE, 
        COLUMN_DEFAULT, 
        COLUMN_KEY,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      ORDER BY ORDINAL_POSITION
    `);
    
    userColumns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''} ${col.COLUMN_KEY === 'PRI' ? 'PRIMARY KEY' : ''} ${col.EXTRA || ''}`);
    });

    // Check which ID column is actually used in forum_posts
    console.log('\n📋 Checking forum_posts foreign key relationships:');
    const [fkInfo] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_NAME = 'forum_posts' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (fkInfo.length > 0) {
      fkInfo.forEach(fk => {
        console.log(`   ${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('   No foreign key constraints found');
    }

    // Check sample data from users table
    console.log('\n📋 Sample user data:');
    const [users] = await connection.execute('SELECT * FROM users LIMIT 3');
    users.forEach((user, index) => {
      console.log(`   User ${index + 1}:`);
      Object.keys(user).forEach(key => {
        if (key.toLowerCase().includes('id') || key.toLowerCase().includes('name') || key.toLowerCase().includes('email')) {
          console.log(`     ${key}: ${user[key]}`);
        }
      });
    });

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkUsersTable();

