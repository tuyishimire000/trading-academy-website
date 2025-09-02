-- Clear existing user achievements to start fresh
DELETE FROM user_achievements;

-- Clear existing achievements to start fresh
DELETE FROM achievements;

-- Insert comprehensive achievements with points
INSERT INTO achievements (id, name, description, icon, criteria, points, is_active, created_at) VALUES
-- Learning Achievements
(UUID(), 'First Steps', 'Complete your first course module', '🎯', '{"type": "module_completion", "count": 1}', 10, true, NOW()),
(UUID(), 'Knowledge Seeker', 'Complete 5 course modules', '📚', '{"type": "module_completion", "count": 5}', 50, true, NOW()),
(UUID(), 'Course Master', 'Complete your first full course', '🎓', '{"type": "course_completion", "count": 1}', 100, true, NOW()),
(UUID(), 'Learning Champion', 'Complete 3 full courses', '🏆', '{"type": "course_completion", "count": 3}', 300, true, NOW()),
(UUID(), 'Dedicated Learner', 'Maintain a 7-day learning streak', '🔥', '{"type": "learning_streak", "days": 7}', 75, true, NOW()),
(UUID(), 'Learning Legend', 'Maintain a 30-day learning streak', '⭐', '{"type": "learning_streak", "days": 30}', 500, true, NOW()),

-- Community Achievements
(UUID(), 'Community Member', 'Join the Discord community', '👥', '{"type": "discord_join"}', 25, true, NOW()),
(UUID(), 'Active Contributor', 'Make 5 forum posts', '💬', '{"type": "forum_posts", "count": 5}', 50, true, NOW()),
(UUID(), 'Community Leader', 'Make 25 forum posts', '👑', '{"type": "forum_posts", "count": 25}', 200, true, NOW()),
(UUID(), 'Helpful Member', 'Receive 10 upvotes on your posts', '👍', '{"type": "post_upvotes", "count": 10}', 100, true, NOW()),

-- Trading Achievements
(UUID(), 'Active Trader', 'Log your first trade', '📊', '{"type": "trade_log", "count": 1}', 50, true, NOW()),
(UUID(), 'Dedicated Trader', 'Log 10 trades', '📈', '{"type": "trade_log", "count": 10}', 150, true, NOW()),
(UUID(), 'Profitable Trader', 'Achieve 5 profitable trades', '💰', '{"type": "profitable_trades", "count": 5}', 200, true, NOW()),
(UUID(), 'Trading Expert', 'Achieve 25 profitable trades', '💎', '{"type": "profitable_trades", "count": 25}', 1000, true, NOW()),
(UUID(), 'Portfolio Growth', 'Achieve 10% portfolio growth', '📈', '{"type": "portfolio_growth", "percentage": 10}', 200, true, NOW()),
(UUID(), 'Portfolio Master', 'Achieve 50% portfolio growth', '🚀', '{"type": "portfolio_growth", "percentage": 50}', 1000, true, NOW()),

-- Event Achievements
(UUID(), 'Event Attendee', 'Attend your first live session', '🎥', '{"type": "event_attendance", "count": 1}', 30, true, NOW()),
(UUID(), 'Regular Attendee', 'Attend 5 live sessions', '📅', '{"type": "event_attendance", "count": 5}', 150, true, NOW()),
(UUID(), 'Event Enthusiast', 'Attend 15 live sessions', '🎉', '{"type": "event_attendance", "count": 15}', 500, true, NOW()),

-- Subscription Achievements
(UUID(), 'Premium Member', 'Upgrade to Premium subscription', '⭐', '{"type": "subscription_upgrade", "plan": "premium"}', 200, true, NOW()),
(UUID(), 'Pro Trader', 'Upgrade to Pro subscription', '💎', '{"type": "subscription_upgrade", "plan": "pro"}', 500, true, NOW()),
(UUID(), 'Elite Member', 'Upgrade to Elite subscription', '👑', '{"type": "subscription_upgrade", "plan": "elite"}', 1000, true, NOW()),

-- Special Achievements
(UUID(), 'Early Bird', 'Join the platform in the first month', '🐦', '{"type": "early_join", "month": 1}', 100, true, NOW()),
(UUID(), 'Referral Master', 'Refer 5 friends to the platform', '🤝', '{"type": "referrals", "count": 5}', 300, true, NOW()),
(UUID(), 'Feedback Provider', 'Submit 3 feedback surveys', '📝', '{"type": "feedback_surveys", "count": 3}', 75, true, NOW()),
(UUID(), 'Mobile User', 'Use the mobile app for 7 consecutive days', '📱', '{"type": "mobile_usage", "days": 7}', 50, true, NOW()),

-- Milestone Achievements
(UUID(), '100 Points', 'Earn your first 100 points', '🎯', '{"type": "points_milestone", "points": 100}', 0, true, NOW()),
(UUID(), '500 Points', 'Earn 500 points', '🎯', '{"type": "points_milestone", "points": 500}', 0, true, NOW()),
(UUID(), '1000 Points', 'Earn 1000 points', '🎯', '{"type": "points_milestone", "points": 1000}', 0, true, NOW()),
(UUID(), '2000 Points', 'Earn 2000 points - Claim 1 month free upgrade!', '🎯', '{"type": "points_milestone", "points": 2000}', 0, true, NOW()),
(UUID(), '5000 Points', 'Earn 5000 points - Claim 3 months free upgrade!', '🎯', '{"type": "points_milestone", "points": 5000}', 0, true, NOW()),
(UUID(), '10000 Points', 'Earn 10000 points - Claim 6 months free upgrade!', '🎯', '{"type": "points_milestone", "points": 10000}', 0, true, NOW());

-- Create points_rewards table for subscription upgrades
CREATE TABLE IF NOT EXISTS points_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_required INTEGER NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- 'subscription_upgrade', 'course_access', 'feature_unlock'
    reward_value JSONB NOT NULL, -- {"plan": "pro", "duration": "1_month", "description": "Free Pro plan for 1 month"}
    claimed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_points table to track total points
CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    points_spent INTEGER DEFAULT 0,
    current_level VARCHAR(50) DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create points_history table to track point transactions
CREATE TABLE IF NOT EXISTS points_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL, -- positive for earned, negative for spent
    reason VARCHAR(100) NOT NULL, -- 'achievement_earned', 'reward_claimed', 'subscription_upgrade'
    achievement_id UUID NULL REFERENCES achievements(id),
    metadata JSONB NULL, -- additional context about the points change
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default points rewards
INSERT INTO points_rewards (id, points_required, reward_type, reward_value, expires_at) VALUES
(UUID(), 2000, 'subscription_upgrade', '{"plan": "pro", "duration": "1_month", "description": "Free Pro plan for 1 month", "value": 24.99}', NOW() + INTERVAL 1 YEAR),
(UUID(), 5000, 'subscription_upgrade', '{"plan": "pro", "duration": "3_months", "description": "Free Pro plan for 3 months", "value": 74.97}', NOW() + INTERVAL 1 YEAR),
(UUID(), 10000, 'subscription_upgrade', '{"plan": "elite", "duration": "6_months", "description": "Free Elite plan for 6 months", "value": 249.99}', NOW() + INTERVAL 1 YEAR);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_points_rewards_user_id ON points_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_points_rewards_points_required ON points_rewards(points_required);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at);



