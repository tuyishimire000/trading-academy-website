-- Fix RLS policies for subscription plans to allow public access
-- This allows unauthenticated users to see pricing on the homepage

-- Drop existing policy
DROP POLICY IF EXISTS "Subscription plans are viewable by authenticated users" ON public.subscription_plans;

-- Create new policy that allows public access
CREATE POLICY "Subscription plans are publicly viewable" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

-- Verify the plans exist
SELECT name, display_name, price, billing_cycle, is_active 
FROM public.subscription_plans 
ORDER BY price;
