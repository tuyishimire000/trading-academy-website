-- Seed achievements/badges
INSERT INTO achievements (name, description, icon, criteria, points) VALUES
(
    'First Steps',
    'Complete your first course module',
    'Play',
    '{"type": "module_completion", "count": 1}'::jsonb,
    10
),
(
    'Knowledge Seeker',
    'Complete 5 course modules',
    'BookOpen',
    '{"type": "module_completion", "count": 5}'::jsonb,
    50
),
(
    'Course Master',
    'Complete your first full course',
    'Award',
    '{"type": "course_completion", "count": 1}'::jsonb,
    100
),
(
    'Dedicated Learner',
    'Maintain a 7-day learning streak',
    'Calendar',
    '{"type": "learning_streak", "days": 7}'::jsonb,
    75
),
(
    'Community Member',
    'Join the Discord community',
    'Users',
    '{"type": "discord_join"}'::jsonb,
    25
),
(
    'Active Trader',
    'Log your first trade',
    'TrendingUp',
    '{"type": "trade_log", "count": 1}'::jsonb,
    50
),
(
    'Profitable Trader',
    'Achieve 10 profitable trades',
    'DollarSign',
    '{"type": "profitable_trades", "count": 10}'::jsonb,
    200
),
(
    'Event Attendee',
    'Attend your first live session',
    'Video',
    '{"type": "event_attendance", "count": 1}'::jsonb,
    30
),
(
    'Elite Member',
    'Upgrade to Elite subscription',
    'Star',
    '{"type": "subscription_upgrade", "plan": "elite"}'::jsonb,
    500
);
