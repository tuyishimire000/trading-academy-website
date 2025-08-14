-- Add admin role system to the database

-- Add is_admin column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create admin_roles table for more granular permissions
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_admin_roles junction table
CREATE TABLE IF NOT EXISTS public.user_admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_admin_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_roles
CREATE POLICY "Admin roles viewable by admins" ON public.admin_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- Create RLS policies for user_admin_roles
CREATE POLICY "User admin roles viewable by admins" ON public.user_admin_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

CREATE POLICY "User admin roles manageable by admins" ON public.user_admin_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- Insert default admin roles
INSERT INTO public.admin_roles (name, description, permissions) VALUES
(
    'super_admin',
    'Full system access',
    '{
        "users": ["create", "read", "update", "delete"],
        "courses": ["create", "read", "update", "delete"],
        "events": ["create", "read", "update", "delete"],
        "analytics": ["read"],
        "settings": ["read", "update"],
        "admin_management": ["create", "read", "update", "delete"]
    }'::jsonb
),
(
    'content_manager',
    'Manage courses and events',
    '{
        "courses": ["create", "read", "update", "delete"],
        "events": ["create", "read", "update", "delete"],
        "analytics": ["read"]
    }'::jsonb
),
(
    'user_manager',
    'Manage users and subscriptions',
    '{
        "users": ["read", "update"],
        "subscriptions": ["read", "update"],
        "analytics": ["read"]
    }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- Create a demo admin user (update this with your actual admin email)
DO $$
DECLARE
    admin_user_id UUID;
    super_admin_role_id UUID;
BEGIN
    -- Update the demo user to be admin
    UPDATE public.profiles 
    SET is_admin = true 
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'demo@primeaura.com'
    );
    
    -- Get the user ID and role ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'demo@primeaura.com';
    SELECT id INTO super_admin_role_id FROM public.admin_roles WHERE name = 'super_admin';
    
    -- Assign super admin role if user exists
    IF admin_user_id IS NOT NULL AND super_admin_role_id IS NOT NULL THEN
        INSERT INTO public.user_admin_roles (user_id, role_id, assigned_by)
        VALUES (admin_user_id, super_admin_role_id, admin_user_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
END $$;
