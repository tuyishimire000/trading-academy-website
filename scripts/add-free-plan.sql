-- Add free plan to existing subscription_plans table
INSERT INTO subscription_plans (name, display_name, description, price, billing_cycle, features, is_active, created_at, updated_at) VALUES
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
    }'::jsonb,
    true,
    NOW(),
    NOW()
) ON CONFLICT (name) DO NOTHING;

