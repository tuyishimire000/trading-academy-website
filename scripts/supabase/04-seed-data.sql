-- Seed subscription plans
INSERT INTO public.subscription_plans (name, display_name, description, price, billing_cycle, features) VALUES
(
    'basic',
    'Basic',
    'Perfect for beginners',
    14.99,
    'monthly',
    '{
        "features": [
            "Basic trading strategies",
            "Discord community access",
            "Weekly market updates",
            "Email support",
            "Mobile app access"
        ],
        "max_courses": 10,
        "live_sessions_per_month": 2,
        "one_on_one_sessions": 0,
        "priority_support": false
    }'::jsonb
),
(
    'pro',
    'Pro',
    'For serious traders',
    24.99,
    'monthly',
    '{
        "features": [
            "All Basic features",
            "Advanced trading strategies",
            "Live trading sessions (3x/week)",
            "Priority Discord support",
            "1-on-1 monthly session",
            "Trading signals & alerts"
        ],
        "max_courses": -1,
        "live_sessions_per_month": 12,
        "one_on_one_sessions": 1,
        "priority_support": true
    }'::jsonb
),
(
    'elite',
    'Elite',
    'Lifetime access',
    499.99,
    'lifetime',
    '{
        "features": [
            "All Pro features",
            "Lifetime access to all content",
            "Exclusive VIP Discord channels",
            "Weekly 1-on-1 sessions",
            "Portfolio review & optimization",
            "Direct access to head trader"
        ],
        "max_courses": -1,
        "live_sessions_per_month": -1,
        "one_on_one_sessions": 4,
        "priority_support": true,
        "vip_access": true
    }'::jsonb
);

-- Seed course categories
INSERT INTO public.course_categories (name, description, icon, sort_order) VALUES
('fundamentals', 'Trading Fundamentals', 'BookOpen', 1),
('technical-analysis', 'Technical Analysis', 'BarChart3', 2),
('risk-management', 'Risk Management', 'Shield', 3),
('psychology', 'Trading Psychology', 'Brain', 4),
('strategies', 'Trading Strategies', 'Target', 5),
('crypto', 'Cryptocurrency Trading', 'Bitcoin', 6),
('forex', 'Forex Trading', 'DollarSign', 7),
('stocks', 'Stock Trading', 'TrendingUp', 8),
('options', 'Options Trading', 'Settings', 9),
('advanced', 'Advanced Topics', 'Zap', 10);

-- Seed sample courses
DO $$
DECLARE
    fundamentals_id UUID;
    technical_id UUID;
    risk_id UUID;
    psychology_id UUID;
    strategies_id UUID;
    crypto_id UUID;
BEGIN
    SELECT id INTO fundamentals_id FROM public.course_categories WHERE name = 'fundamentals';
    SELECT id INTO technical_id FROM public.course_categories WHERE name = 'technical-analysis';
    SELECT id INTO risk_id FROM public.course_categories WHERE name = 'risk-management';
    SELECT id INTO psychology_id FROM public.course_categories WHERE name = 'psychology';
    SELECT id INTO strategies_id FROM public.course_categories WHERE name = 'strategies';
    SELECT id INTO crypto_id FROM public.course_categories WHERE name = 'crypto';

    INSERT INTO public.courses (category_id, title, description, difficulty_level, estimated_duration, required_plan, sort_order, is_published) VALUES
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

-- Seed sample events
INSERT INTO public.events (title, description, event_type, start_time, end_time, meeting_url, max_participants, required_plan, status) VALUES
(
    'Live Trading Session - Market Analysis',
    'Join our expert traders for live market analysis and trading opportunities.',
    'live_session',
    CURRENT_TIMESTAMP + INTERVAL '2 hours',
    CURRENT_TIMESTAMP + INTERVAL '3 hours',
    'https://discord.gg/trading-session',
    100,
    'basic',
    'scheduled'
),
(
    'Q&A Webinar with Head Trader',
    'Ask questions and get answers from our head trader about market strategies.',
    'webinar',
    CURRENT_TIMESTAMP + INTERVAL '1 day 19 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day 20 hours',
    'https://zoom.us/webinar/qa-session',
    200,
    'basic',
    'scheduled'
),
(
    'Options Trading Workshop',
    'Advanced workshop covering options strategies and risk management.',
    'workshop',
    CURRENT_TIMESTAMP + INTERVAL '4 days 15 hours',
    CURRENT_TIMESTAMP + INTERVAL '4 days 17 hours',
    'https://discord.gg/options-workshop',
    50,
    'pro',
    'scheduled'
);
