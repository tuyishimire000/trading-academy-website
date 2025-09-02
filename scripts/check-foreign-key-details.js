const mysql = require('mysql2/promise');

async function checkForeignKeyDetails() {
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

    // Check the exact foreign key constraint for forum_posts.user_id
    console.log('📋 Foreign key constraint details for forum_posts.user_id:');
    const [fkDetails] = await connection.execute(`
      SELECT 
        rc.CONSTRAINT_NAME,
        kcu.COLUMN_NAME,
        kcu.REFERENCED_TABLE_NAME,
        kcu.REFERENCED_COLUMN_NAME,
        rc.UPDATE_RULE,
        rc.DELETE_RULE
      FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
        ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE kcu.TABLE_NAME = 'forum_posts' 
        AND kcu.COLUMN_NAME = 'user_id'
        AND kcu.REFERENCED_TABLE_NAME = 'users'
    `);
    
    if (fkDetails.length > 0) {
      fkDetails.forEach(fk => {
        console.log(`   Constraint: ${fk.CONSTRAINT_NAME}`);
        console.log(`   Column: ${fk.COLUMN_NAME}`);
        console.log(`   References: ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        console.log(`   Update Rule: ${fk.UPDATE_RULE}`);
        console.log(`   Delete Rule: ${fk.DELETE_RULE}`);
      });
    } else {
      console.log('   No foreign key constraint found');
    }

    // Check all columns in users table that could be referenced
    console.log('\n📋 All ID-like columns in users table:');
    const [allColumns] = await connection.execute(`
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE, 
        COLUMN_KEY,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users' 
      AND COLUMN_NAME LIKE '%id%'
      ORDER BY COLUMN_NAME
    `);
    
    allColumns.forEach(col => {
      console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY === 'PRI' ? 'PRIMARY KEY' : ''} ${col.EXTRA || ''}`);
    });

    // Check which ID column is actually used in forum_posts
    console.log('\n📋 Checking which users.id is actually referenced:');
    const [referencedColumn] = await connection.execute(`
      SELECT DISTINCT
        kcu.REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
      WHERE kcu.TABLE_NAME = 'forum_posts' 
        AND kcu.COLUMN_NAME = 'user_id'
        AND kcu.REFERENCED_TABLE_NAME = 'users'
    `);
    
    if (referencedColumn.length > 0) {
      console.log(`   forum_posts.user_id references users.${referencedColumn[0].REFERENCED_COLUMN_NAME}`);
    } else {
      console.log('   No reference found');
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
checkForeignKeyDetails();
