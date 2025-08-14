-- Get category IDs for reference
DO $$
DECLARE
    fundamentals_id UUID;
    technical_id UUID;
    risk_id UUID;
    psychology_id UUID;
    strategies_id UUID;
    crypto_id UUID;
BEGIN
    SELECT id INTO fundamentals_id FROM course_categories WHERE name = 'fundamentals';
    SELECT id INTO technical_id FROM course_categories WHERE name = 'technical-analysis';
    SELECT id INTO risk_id FROM course_categories WHERE name = 'risk-management';
    SELECT id INTO psychology_id FROM course_categories WHERE name = 'psychology';
    SELECT id INTO strategies_id FROM course_categories WHERE name = 'strategies';
    SELECT id INTO crypto_id FROM course_categories WHERE name = 'crypto';

    -- Insert sample courses
    INSERT INTO courses (category_id, title, description, difficulty_level, estimated_duration, required_plan, sort_order, is_published) VALUES
    (fundamentals_id, 'Trading Basics: Getting Started', 'Learn the fundamental concepts of trading, market structure, and basic terminology.', 'beginner', 120, 'basic', 1, true),
    (fundamentals_id, 'Understanding Market Orders', 'Master different types of orders and when to use them effectively.', 'beginner', 90, 'basic', 2, true),
    (technical_id, 'Chart Patterns Masterclass', 'Identify and trade the most profitable chart patterns in any market.', 'intermediate', 180, 'pro', 1, true),
    (technical_id, 'Advanced Chart Patterns', 'Deep dive into complex patterns like Head and Shoulders, Triangles, and more.', 'advanced', 240, 'pro', 2, true),
    (risk_id, 'Risk Management Fundamentals', 'Learn how to protect your capital and manage risk effectively.', 'beginner', 150, 'basic', 1, true),
    (risk_id, 'Position Sizing Strategies', 'Master the art of position sizing for consistent profitability.', 'intermediate', 120, 'pro', 2, true),
    (psychology_id, 'Trading Psychology Mastery', 'Overcome emotional trading and develop a winning mindset.', 'intermediate', 200, 'pro', 1, true),
    (strategies_id, 'Scalping Strategies', 'Learn high-frequency trading strategies for quick profits.', 'advanced', 180, 'pro', 1, true),
    (crypto_id, 'Cryptocurrency Trading Guide', 'Complete guide to trading Bitcoin, Ethereum, and altcoins.', 'intermediate', 300, 'pro', 1, true);
END $$;
