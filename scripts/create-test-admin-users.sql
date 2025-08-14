-- Create test admin users for each role
-- This script creates users in both auth.users and profiles tables
-- Run this script in Supabase SQL Editor

BEGIN;

-- First, let's ensure we have the admin roles created
INSERT INTO admin_roles (id, name, display_name, description, permissions, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'super_admin',
    'Super Administrator',
    'Full access to all admin features and settings',
    '["users:read", "users:write", "users:delete", "courses:read", "courses:write", "courses:delete", "events:read", "events:write", "events:delete", "analytics:read", "subscriptions:read", "subscriptions:write", "community:read", "community:write", "settings:read", "settings:write", "admin:manage"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'content_manager',
    'Content Manager',
    'Can manage courses and events, view analytics',
    '["courses:read", "courses:write", "courses:delete", "events:read", "events:write", "events:delete", "analytics:read"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'user_manager',
    'User Manager',
    'Can manage users and subscriptions, view analytics',
    '["users:read", "users:write", "subscriptions:read", "subscriptions:write", "analytics:read"]'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Get the role IDs and plan ID for our inserts
DO $$
DECLARE
    super_admin_role_id UUID;
    content_manager_role_id UUID;
    user_manager_role_id UUID;
    basic_plan_id UUID;
    super_admin_user_id UUID := gen_random_uuid();
    content_manager_user_id UUID := gen_random_uuid();
    user_manager_user_id UUID := gen_random_uuid();
BEGIN
    -- Get role IDs
    SELECT id INTO super_admin_role_id FROM admin_roles WHERE name = 'super_admin';
    SELECT id INTO content_manager_role_id FROM admin_roles WHERE name = 'content_manager';
    SELECT id INTO user_manager_role_id FROM admin_roles WHERE name = 'user_manager';
    
    -- Get a subscription plan ID
    SELECT id INTO basic_plan_id FROM subscription_plans WHERE name = 'Basic' LIMIT 1;
    IF basic_plan_id IS NULL THEN
        SELECT id INTO basic_plan_id FROM subscription_plans LIMIT 1;
    END IF;

    -- Create Super Admin User in auth.users
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
        email_change,
        email_change_confirm_status,
        banned_until,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        recovery_token,
        reauthentication_token,
        reauthentication_sent_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        super_admin_user_id,
        'authenticated',
        'authenticated',
        'superadmin@primeaura.com',
        crypt('SuperAdmin123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Super", "last_name": "Admin"}',
        FALSE,
        NOW(),
        NOW(),
        NOW(),
        NULL,
        '',
        0,
        NULL,
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        '',
        NULL
    );

    -- Create Super Admin Profile
    INSERT INTO profiles (
        id,
        email,
        full_name,
        first_name,
        last_name,
        avatar_url,
        subscription_plan_id,
        is_admin,
        admin_role,
        created_at,
        updated_at
    ) VALUES (
        super_admin_user_id,
        'superadmin@primeaura.com',
        'Super Admin',
        'Super',
        'Admin',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
        basic_plan_id,
        true,
        'super_admin',
        NOW(),
        NOW()
    );

    -- Assign super admin role
    INSERT INTO user_admin_roles (user_id, role_id, assigned_by, assigned_at)
    VALUES (super_admin_user_id, super_admin_role_id, super_admin_user_id, NOW());

    -- Create Content Manager User in auth.users
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
        email_change,
        email_change_confirm_status,
        banned_until,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        recovery_token,
        reauthentication_token,
        reauthentication_sent_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        content_manager_user_id,
        'authenticated',
        'authenticated',
        'contentmanager@primeaura.com',
        crypt('ContentManager123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Content", "last_name": "Manager"}',
        FALSE,
        NOW(),
        NOW(),
        NOW(),
        NULL,
        '',
        0,
        NULL,
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        '',
        NULL
    );

    -- Create Content Manager Profile
    INSERT INTO profiles (
        id,
        email,
        full_name,
        first_name,
        last_name,
        avatar_url,
        subscription_plan_id,
        is_admin,
        admin_role,
        created_at,
        updated_at
    ) VALUES (
        content_manager_user_id,
        'contentmanager@primeaura.com',
        'Content Manager',
        'Content',
        'Manager',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=contentmanager',
        basic_plan_id,
        true,
        'content_manager',
        NOW(),
        NOW()
    );

    -- Assign content manager role
    INSERT INTO user_admin_roles (user_id, role_id, assigned_by, assigned_at)
    VALUES (content_manager_user_id, content_manager_role_id, super_admin_user_id, NOW());

    -- Create User Manager User in auth.users
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
        email_change,
        email_change_confirm_status,
        banned_until,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        recovery_token,
        reauthentication_token,
        reauthentication_sent_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        user_manager_user_id,
        'authenticated',
        'authenticated',
        'usermanager@primeaura.com',
        crypt('UserManager123!', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "User", "last_name": "Manager"}',
        FALSE,
        NOW(),
        NOW(),
        NOW(),
        NULL,
        '',
        0,
        NULL,
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        '',
        NULL
    );

    -- Create User Manager Profile
    INSERT INTO profiles (
        id,
        email,
        full_name,
        first_name,
        last_name,
        avatar_url,
        subscription_plan_id,
        is_admin,
        admin_role,
        created_at,
        updated_at
    ) VALUES (
        user_manager_user_id,
        'usermanager@primeaura.com',
        'User Manager',
        'User',
        'Manager',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=usermanager',
        basic_plan_id,
        true,
        'user_manager',
        NOW(),
        NOW()
    );

    -- Assign user manager role
    INSERT INTO user_admin_roles (user_id, role_id, assigned_by, assigned_at)
    VALUES (user_manager_user_id, user_manager_role_id, super_admin_user_id, NOW());

    -- Create some additional test users for analytics
    FOR i IN 1..15 LOOP
        DECLARE
            test_user_id UUID := gen_random_uuid();
            random_plan_id UUID;
        BEGIN
            -- Get a random subscription plan
            SELECT id INTO random_plan_id FROM subscription_plans ORDER BY random() LIMIT 1;
            
            -- Create test user in auth.users
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
                email_change,
                email_change_confirm_status,
                banned_until,
                phone,
                phone_confirmed_at,
                phone_change,
                phone_change_token,
                phone_change_sent_at,
                recovery_token,
                reauthentication_token,
                reauthentication_sent_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                test_user_id,
                'authenticated',
                'authenticated',
                'testuser' || i || '@primeaura.com',
                crypt('TestUser123!', gen_salt('bf')),
                NOW(),
                NOW(),
                NOW(),
                '{"provider": "email", "providers": ["email"]}',
                '{"first_name": "Test", "last_name": "User"}',
                FALSE,
                NOW() - interval '1 day' * floor(random() * 30),
                NOW(),
                NOW() - interval '1 day' * floor(random() * 7),
                NULL,
                '',
                0,
                NULL,
                NULL,
                NULL,
                '',
                '',
                NULL,
                '',
                '',
                NULL
            );

            -- Create test user profile
            INSERT INTO profiles (
                id,
                email,
                full_name,
                first_name,
                last_name,
                avatar_url,
                subscription_plan_id,
                is_admin,
                admin_role,
                created_at,
                updated_at
            ) VALUES (
                test_user_id,
                'testuser' || i || '@primeaura.com',
                'Test User ' || i,
                'Test',
                'User ' || i,
                'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser' || i,
                random_plan_id,
                false,
                NULL,
                NOW() - interval '1 day' * floor(random() * 30),
                NOW()
            );
        END;
    END LOOP;

    RAISE NOTICE 'Successfully created test admin users:';
    RAISE NOTICE 'Super Admin: superadmin@primeaura.com / SuperAdmin123!';
    RAISE NOTICE 'Content Manager: contentmanager@primeaura.com / ContentManager123!';
    RAISE NOTICE 'User Manager: usermanager@primeaura.com / UserManager123!';
    RAISE NOTICE 'Also created 15 additional test users for analytics testing';

END $$;

-- Create some sample user progress for analytics testing
INSERT INTO user_progress (
    user_id,
    course_id,
    module_id,
    status,
    progress_percentage,
    completed_at,
    created_at,
    updated_at
)
SELECT 
    p.id,
    c.id,
    m.id,
    CASE 
        WHEN random() > 0.7 THEN 'completed'
        WHEN random() > 0.4 THEN 'in_progress'
        ELSE 'not_started'
    END,
    CASE 
        WHEN random() > 0.7 THEN 100
        WHEN random() > 0.4 THEN floor(random() * 80 + 20)::integer
        ELSE 0
    END,
    CASE 
        WHEN random() > 0.7 THEN NOW() - interval '1 day' * floor(random() * 30)
        ELSE NULL
    END,
    NOW(),
    NOW()
FROM profiles p
CROSS JOIN courses c
CROSS JOIN modules m
WHERE m.course_id = c.id
AND random() > 0.6 -- Only create progress for some combinations
LIMIT 200; -- Limit to prevent too much data

-- Create some event registrations for testing
INSERT INTO event_registrations (
    user_id,
    event_id,
    status,
    registered_at,
    created_at,
    updated_at
)
SELECT 
    p.id,
    e.id,
    CASE 
        WHEN random() > 0.8 THEN 'cancelled'
        WHEN random() > 0.9 THEN 'no_show'
        ELSE 'registered'
    END,
    NOW() - interval '1 day' * floor(random() * 7),
    NOW(),
    NOW()
FROM profiles p
CROSS JOIN events e
WHERE random() > 0.7 -- Only register for some events
LIMIT 100; -- Limit registrations

-- Display the created admin users for verification
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.is_admin,
    p.admin_role,
    ar.display_name as role_display_name,
    p.created_at
FROM profiles p
LEFT JOIN user_admin_roles uar ON p.id = uar.user_id
LEFT JOIN admin_roles ar ON uar.role_id = ar.id
WHERE p.email IN (
    'superadmin@primeaura.com',
    'contentmanager@primeaura.com', 
    'usermanager@primeaura.com'
)
ORDER BY p.admin_role;

COMMIT;
