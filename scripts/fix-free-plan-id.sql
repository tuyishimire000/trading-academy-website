-- Fix the free plan ID by updating it with a proper UUID
UPDATE subscription_plans 
SET id = UUID() 
WHERE name = 'free' AND (id = '' OR id IS NULL);

-- Verify the update
SELECT id, name, display_name, price FROM subscription_plans WHERE name = 'free';

