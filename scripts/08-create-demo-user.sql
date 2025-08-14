-- Create demo user for testing
DO $$
DECLARE
    demo_user_id UUID;
    basic_plan_id UUID;
    pro_plan_id UUID;
    course_id UUID;
    module_id UUID;
BEGIN
    -- Get plan IDs
    SELECT id INTO basic_plan_id FROM subscription_plans WHERE name = 'basic';
    SELECT id INTO pro_plan_id FROM subscription_plans WHERE name = 'pro';
    
    -- Create demo user
    INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        is_email_verified
    ) VALUES (
        'demo@primeaura.com',
        '$2b$10$rQZ8kHWKtGKHZH.fQHWKtOyX8kHWKtGKHZH.fQHWKtOyX8kHWKtGKH', -- hashed 'demo123'
        'John',
        'Demo',
        true
    ) RETURNING id INTO demo_user_id;
    
    -- Create pro subscription for demo user
    INSERT INTO user_subscriptions (
        user_id,
        plan_id,
        status,
        current_period_start,
        current_period_end
    ) VALUES (
        demo_user_id,
        pro_plan_id,
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '1 month'
    );
    
    -- Add some course progress for demo user
    FOR course_id IN SELECT id FROM courses WHERE is_published = true LIMIT 3
    LOOP
        INSERT INTO user_course_progress (
            user_id,
            course_id,
            status,
            progress_percentage,
            started_at,
            last_accessed
        ) VALUES (
            demo_user_id,
            course_id,
            CASE 
                WHEN RANDOM() < 0.3 THEN 'completed'
                WHEN RANDOM() < 0.7 THEN 'in_progress'
                ELSE 'not_started'
            END,
            (RANDOM() * 100)::INTEGER,
            CURRENT_TIMESTAMP - INTERVAL '1 week' * RANDOM(),
            CURRENT_TIMESTAMP - INTERVAL '1 day' * RANDOM()
        );
        
        -- Add module progress for some modules
        FOR module_id IN SELECT id FROM course_modules WHERE course_id = course_id LIMIT 2
        LOOP
            INSERT INTO user_module_progress (
                user_id,
                module_id,
                course_id,
                status,
                progress_percentage,
                time_spent,
                started_at,
                completed_at,
                last_accessed
            ) VALUES (
                demo_user_id,
                module_id,
                course_id,
                CASE WHEN RANDOM() < 0.6 THEN 'completed' ELSE 'in_progress' END,
                (RANDOM() * 100)::INTEGER,
                (RANDOM() * 1800)::INTEGER, -- 0-30 minutes in seconds
                CURRENT_TIMESTAMP - INTERVAL '1 week' * RANDOM(),
                CASE WHEN RANDOM() < 0.6 THEN CURRENT_TIMESTAMP - INTERVAL '1 day' * RANDOM() ELSE NULL END,
                CURRENT_TIMESTAMP - INTERVAL '1 day' * RANDOM()
            );
        END LOOP;
    END LOOP;
    
    -- Add user preferences
    INSERT INTO user_preferences (user_id) VALUES (demo_user_id);
    
    -- Add some achievements
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT demo_user_id, id FROM achievements WHERE name IN ('First Steps', 'Knowledge Seeker', 'Community Member') LIMIT 3;
    
    -- Add some sample trades
    INSERT INTO trading_accounts (user_id, account_name, account_type, initial_balance, current_balance) 
    VALUES (demo_user_id, 'Demo Trading Account', 'demo', 10000.00, 12500.00);
    
END $$;
