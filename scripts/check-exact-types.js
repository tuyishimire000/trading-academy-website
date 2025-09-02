const mysql = require('mysql2/promise');

async function checkExactTypes() {
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

    // Check exact data types for users.id
    console.log('📋 Users table ID column details:');
    const [userColumns] = await connection.execute(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        CHARACTER_OCTET_LENGTH,
        IS_NULLABLE, 
        COLUMN_DEFAULT, 
        COLUMN_KEY,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'id'
    `);
    
    userColumns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''} ${col.COLUMN_KEY === 'PRI' ? 'PRIMARY KEY' : ''} ${col.EXTRA || ''}`);
    });

    // Check exact data types for forum_posts.id
    console.log('\n📋 Forum posts table ID column details:');
    const [postColumns] = await connection.execute(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        CHARACTER_OCTET_LENGTH,
        IS_NULLABLE, 
        COLUMN_DEFAULT, 
        COLUMN_KEY,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'forum_posts' 
      AND COLUMN_NAME = 'id'
    `);
    
    postColumns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''} ${col.COLUMN_KEY === 'PRI' ? 'PRIMARY KEY' : ''} ${col.EXTRA || ''}`);
    });

    // Check exact data types for forum_posts.user_id
    console.log('\n📋 Forum posts user_id column details:');
    const [userIdColumns] = await connection.execute(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        CHARACTER_OCTET_LENGTH,
        IS_NULLABLE, 
        COLUMN_DEFAULT, 
        COLUMN_KEY,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'forum_posts' 
      AND COLUMN_NAME = 'user_id'
    `);
    
    userIdColumns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE}(${col.CHARACTER_MAXIMUM_LENGTH}) ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''} ${col.COLUMN_KEY === 'PRI' ? 'PRIMARY KEY' : ''} ${col.EXTRA || ''}`);
    });

    // Check sample data lengths
    console.log('\n📋 Sample data length check:');
    const [users] = await connection.execute('SELECT id, LENGTH(id) as id_length FROM users LIMIT 3');
    users.forEach((user, index) => {
      console.log(`   User ${index + 1} ID: ${user.id} (length: ${user.id_length})`);
    });

    const [posts] = await connection.execute('SELECT id, LENGTH(id) as id_length FROM forum_posts LIMIT 3');
    posts.forEach((post, index) => {
      console.log(`   Post ${index + 1} ID: ${post.id} (length: ${post.id_length})`);
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
checkExactTypes();

