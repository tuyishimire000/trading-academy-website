const mysql = require('mysql2/promise');

async function testCommunity() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'trading_academy'
    });

    console.log('✅ Connected to database');

    // Test 1: Check if user_votes table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "user_votes"');
    if (tables.length > 0) {
      console.log('✅ user_votes table exists');
    } else {
      console.log('❌ user_votes table does not exist');
    }

    // Test 2: Check if forum_posts has vote count columns
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'forum_posts' 
      AND COLUMN_NAME IN ('likes_count', 'dislikes_count')
    `);
    
    if (columns.length === 2) {
      console.log('✅ forum_posts has vote count columns');
    } else {
      console.log('❌ forum_posts missing vote count columns');
      console.log('Found columns:', columns.map(c => c.COLUMN_NAME));
    }

    // Test 3: Check forum categories
    const [categories] = await connection.execute('SELECT * FROM forum_categories LIMIT 5');
    console.log(`✅ Found ${categories.length} forum categories`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    // Test 4: Check forum posts
    const [posts] = await connection.execute(`
      SELECT fp.*, u.first_name, u.last_name, fc.name as category_name
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      JOIN forum_categories fc ON fp.category_id = fc.id
      WHERE fp.parent_id IS NULL
      LIMIT 5
    `);
    
    console.log(`✅ Found ${posts.length} forum posts`);
    posts.forEach(post => {
      console.log(`   - "${post.title || post.content.substring(0, 50)}..." by ${post.first_name} ${post.last_name} in ${post.category_name}`);
      console.log(`     Likes: ${post.likes_count}, Dislikes: ${post.dislikes_count}`);
    });

    // Test 5: Check if we can create a test vote
    if (posts.length > 0 && categories.length > 0) {
      const testPostId = posts[0].id;
      const testUserId = posts[0].user_id;
      
      try {
        await connection.execute(`
          INSERT INTO user_votes (id, user_id, post_id, vote_type) 
          VALUES (UUID(), ?, ?, 'up')
          ON DUPLICATE KEY UPDATE vote_type = 'up'
        `, [testUserId, testPostId]);
        
        console.log('✅ Successfully created test vote');
        
        // Update post vote count
        await connection.execute(`
          UPDATE forum_posts 
          SET likes_count = likes_count + 1 
          WHERE id = ?
        `, [testPostId]);
        
        console.log('✅ Successfully updated post vote count');
        
      } catch (error) {
        console.log('❌ Failed to create test vote:', error.message);
      }
    }

    console.log('\n🎉 Community functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testCommunity();

