const mysql = require('mysql2/promise');

async function setupUserVotes() {
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

    // Create user_votes table without foreign keys first
    console.log('Creating user_votes table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_votes (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        post_id CHAR(36) NOT NULL,
        vote_type ENUM('up', 'down') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE KEY unique_user_post_vote (user_id, post_id),
        
        INDEX idx_user_votes_user_id (user_id),
        INDEX idx_user_votes_post_id (post_id),
        INDEX idx_user_votes_vote_type (vote_type)
      )
    `);
    console.log('✅ user_votes table created successfully');

    // Verify table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "user_votes"');
    if (tables.length > 0) {
      console.log('✅ user_votes table verified');
    } else {
      console.log('❌ user_votes table creation failed');
      return;
    }

    // Check if forum_posts has vote count columns
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'forum_posts' 
      AND COLUMN_NAME IN ('likes_count', 'dislikes_count')
    `);
    
    if (columns.length === 2) {
      console.log('✅ forum_posts already has vote count columns');
    } else {
      console.log('Adding vote count columns to forum_posts...');
      await connection.execute(`
        ALTER TABLE forum_posts 
        ADD COLUMN likes_count INT DEFAULT 0,
        ADD COLUMN dislikes_count INT DEFAULT 0
      `);
      console.log('✅ Vote count columns added to forum_posts');
    }

    // Update existing posts to have default vote counts
    await connection.execute(`
      UPDATE forum_posts 
      SET likes_count = 0, dislikes_count = 0 
      WHERE likes_count IS NULL OR dislikes_count IS NULL
    `);
    console.log('✅ Existing posts updated with default vote counts');

    // Test the voting system
    console.log('\n🧪 Testing voting system...');
    
    // Get a test post
    const [posts] = await connection.execute(`
      SELECT id, user_id FROM forum_posts WHERE parent_id IS NULL LIMIT 1
    `);
    
    if (posts.length > 0) {
      const testPostId = posts[0].id;
      const testUserId = posts[0].user_id;
      
      // Create a test vote
      const crypto = require('crypto');
      const voteId = crypto.randomUUID();
      await connection.execute(`
        INSERT INTO user_votes (id, user_id, post_id, vote_type) 
        VALUES (?, ?, ?, 'up')
        ON DUPLICATE KEY UPDATE vote_type = 'up'
      `, [voteId, testUserId, testPostId]);
      
      console.log('✅ Test vote created successfully');
      
      // Update post vote count
      await connection.execute(`
        UPDATE forum_posts 
        SET likes_count = likes_count + 1 
        WHERE id = ?
      `, [testPostId]);
      
      console.log('✅ Post vote count updated successfully');
      
      // Verify the vote was recorded
      const [votes] = await connection.execute(`
        SELECT * FROM user_votes WHERE post_id = ? AND user_id = ?
      `, [testPostId, testUserId]);
      
      if (votes.length > 0) {
        console.log('✅ Vote verification successful');
      } else {
        console.log('❌ Vote verification failed');
      }
    }

    console.log('\n🎉 User votes table setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your application');
    console.log('2. Test the community functionality');
    console.log('3. Run: node scripts/test-community.js');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupUserVotes();
