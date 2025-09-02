-- Create user_votes table for forum post voting
CREATE TABLE IF NOT EXISTS user_votes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  post_id CHAR(36) NOT NULL,
  vote_type ENUM('up', 'down') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Add unique constraint to prevent multiple votes from same user on same post
  UNIQUE KEY unique_user_post_vote (user_id, post_id),
  
  -- Add foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
  
  -- Add indexes for performance
  INDEX idx_user_votes_user_id (user_id),
  INDEX idx_user_votes_post_id (post_id),
  INDEX idx_user_votes_vote_type (vote_type)
);

-- Add vote counts to forum_posts table if they don't exist
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS dislikes_count INT DEFAULT 0;

-- Update existing posts to have default vote counts
UPDATE forum_posts 
SET likes_count = 0, dislikes_count = 0 
WHERE likes_count IS NULL OR dislikes_count IS NULL;

