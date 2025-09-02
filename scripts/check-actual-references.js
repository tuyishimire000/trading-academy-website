const mysql = require('mysql2/promise');

async function checkActualReferences() {
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

    // Check which users.id column is actually being used
    console.log('📋 Checking which users.id column is actually referenced:');
    
    // Get a sample post with its user
    const [posts] = await connection.execute(`
      SELECT fp.id as post_id, fp.user_id, u.id as user_id_from_users
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      LIMIT 3
    `);
    
    if (posts.length > 0) {
      console.log('   Sample post-user relationships:');
      posts.forEach((post, index) => {
        console.log(`   Post ${index + 1}:`);
        console.log(`     Post ID: ${post.post_id}`);
        console.log(`     User ID from forum_posts: ${post.user_id}`);
        console.log(`     User ID from users table: ${post.user_id_from_users}`);
        console.log(`     Match: ${post.user_id === post.user_id_from_users ? '✅' : '❌'}`);
      });
    }

    // Check the exact column definition that's being referenced
    console.log('\n📋 Exact column definition for the referenced users.id:');
    const [columnDef] = await connection.execute(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE, 
        COLUMN_DEFAULT, 
        COLUMN_KEY,
        EXTRA,
        ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'id'
      ORDER BY ORDINAL_POSITION
    `);
    
    columnDef.forEach((col, index) => {
      console.log(`   Column ${index + 1}: ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_DEFAULT ? `DEFAULT ${col.COLUMN_DEFAULT}` : ''} ${col.COLUMN_KEY === 'PRI' ? 'PRIMARY KEY' : ''} ${col.EXTRA || ''} (Position: ${col.ORDINAL_POSITION})`);
    });

    // Try to find which column is actually the first one (most likely to be referenced)
    console.log('\n📋 First id column in users table:');
    const [firstIdColumn] = await connection.execute(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'id'
      ORDER BY ORDINAL_POSITION
      LIMIT 1
    `);
    
    if (firstIdColumn.length > 0) {
      const col = firstIdColumn[0];
      console.log(`   First id column: ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} (Position: ${col.ORDINAL_POSITION})`);
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkActualReferences();

