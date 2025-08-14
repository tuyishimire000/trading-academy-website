-- COMPLETE DATABASE SETUP FOR PRIME AURA TRADING ACADEMY
-- Run this script in your Supabase SQL Editor

-- Step 1: Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Step 2: Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 3: Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 4: Create profile trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Handle new user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create user signup trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Step 8: Create User Subscriptions Table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 9: Create Course Categories Table
CREATE TABLE IF NOT EXISTS public.course_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

-- Step 10: Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.course_categories(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    estimated_duration INTEGER,
    required_plan VARCHAR(20) DEFAULT 'basic',
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Step 11: Create Course Modules Table
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content_type VARCHAR(20) NOT NULL,
    content_url TEXT,
    content_data JSONB,
    duration INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Step 12: Create User Course Progress Table
CREATE TABLE IF NOT EXISTS public.user_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;

-- Step 13: Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    meeting_url TEXT,
    max_participants INTEGER,
    required_plan VARCHAR(20) DEFAULT 'basic',
    instructor_id UUID REFERENCES auth.users(id),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Step 14: Create RLS Policies
-- Subscription plans - readable by all authenticated users
DROP POLICY IF EXISTS "Subscription plans are viewable by authenticated users" ON public.subscription_plans;
CREATE POLICY "Subscription plans are viewable by authenticated users" ON public.subscription_plans
    FOR SELECT TO authenticated USING (true);

-- User subscriptions - users can only see their own
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Course categories - readable by all authenticated users
DROP POLICY IF EXISTS "Course categories are viewable by authenticated users" ON public.course_categories;
CREATE POLICY "Course categories are viewable by authenticated users" ON public.course_categories
    FOR SELECT TO authenticated USING (true);

-- Courses - readable by all authenticated users
DROP POLICY IF EXISTS "Courses are viewable by authenticated users" ON public.courses;
CREATE POLICY "Courses are viewable by authenticated users" ON public.courses
    FOR SELECT TO authenticated USING (true);

-- Course modules - readable by all authenticated users
DROP POLICY IF EXISTS "Course modules are viewable by authenticated users" ON public.course_modules;
CREATE POLICY "Course modules are viewable by authenticated users" ON public.course_modules
    FOR SELECT TO authenticated USING (true);

-- User course progress - users can only see their own
DROP POLICY IF EXISTS "Users can view own course progress" ON public.user_course_progress;
DROP POLICY IF EXISTS "Users can insert own course progress" ON public.user_course_progress;
DROP POLICY IF EXISTS "Users can update own course progress" ON public.user_course_progress;

CREATE POLICY "Users can view own course progress" ON public.user_course_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course progress" ON public.user_course_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own course progress" ON public.user_course_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Events - readable by all authenticated users
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON public.events;
CREATE POLICY "Events are viewable by authenticated users" ON public.events
    FOR SELECT TO authenticated USING (true);

-- Step 15: Add updated_at triggers
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
DROP TRIGGER IF EXISTS update_course_modules_updated_at ON public.course_modules;
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;

CREATE TRIGGER update_subscription_plans_updated_at 
    BEFORE UPDATE ON public.subscription_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON public.user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at 
    BEFORE UPDATE ON public.courses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at 
    BEFORE UPDATE ON public.course_modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 16: Insert Sample Data
-- Subscription plans
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
)
ON CONFLICT (name) DO NOTHING;

-- Course categories
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
('advanced', 'Advanced Topics', 'Zap', 10)
ON CONFLICT DO NOTHING;

-- Sample courses
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
    (crypto_id, 'Cryptocurrency Trading Guide', 'Complete guide to trading Bitcoin, Ethereum, and altcoins.', 'intermediate', 300, 'pro', 1, true)
    ON CONFLICT DO NOTHING;
END $$;

-- Sample events
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
)
ON CONFLICT DO NOTHING;
