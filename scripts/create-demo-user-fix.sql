-- Create demo user with proper credentials
DO $$
DECLARE
    demo_user_id UUID;
    basic_plan_id UUID;
BEGIN
    -- Delete existing demo user if exists
    DELETE FROM auth.users WHERE email = 'demo@primeaura.com';
    
    -- Get basic plan ID
    SELECT id INTO basic_plan_id FROM public.subscription_plans WHERE name = 'basic';
    
    -- Insert demo user directly into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        last_sign_in_at,
        email_change_sent_at,
        phone_change_sent_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'demo@primeaura.com',
        crypt('demo123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Demo", "last_name": "User"}',
        FALSE,
        NOW(),
        NOW(),
        NOW(),
        NOW(),
        NOW()
    ) RETURNING id INTO demo_user_id;
    
    -- Create subscription for demo user
    INSERT INTO public.user_subscriptions (
        user_id,
        plan_id,
        status,
        current_period_start,
        current_period_end
    ) VALUES (
        demo_user_id,
        basic_plan_id,
        'active',
        NOW(),
        NOW() + INTERVAL '1 month'
    );
    
    RAISE NOTICE 'Demo user created with ID: %', demo_user_id;
END $$;
