-- Seed subscription plans data
INSERT INTO subscription_plans (name, display_name, description, price, billing_cycle, features) VALUES
(
    'free',
    'Free',
    'Get started with trading',
    0.00,
    'monthly',
    '{
        "features": [
            "Basic trading introduction",
            "Limited course access (3 courses)",
            "Community forum access",
            "Email support",
            "Mobile app access"
        ],
        "max_courses": 3,
        "live_sessions_per_month": 0,
        "one_on_one_sessions": 0,
        "priority_support": false
    }'::jsonb
),
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
