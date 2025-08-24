-- Seed user_subscription_history with sample data
-- This simulates various subscription activities for testing

-- Get user IDs and plan IDs for seeding
SET @user1_id = (SELECT id FROM users WHERE email = 'blackyrwanda@gmail.com' LIMIT 1);
SET @user2_id = (SELECT id FROM users WHERE email = 'hilbert.apply@gmail.com' LIMIT 1);
SET @free_plan_id = (SELECT id FROM subscription_plans WHERE name = 'free' LIMIT 1);
SET @premium_plan_id = (SELECT id FROM subscription_plans WHERE name = 'premium' LIMIT 1);
SET @pro_plan_id = (SELECT id FROM subscription_plans WHERE name = 'pro' LIMIT 1);

-- Get subscription IDs
SET @user1_subscription_id = (SELECT id FROM user_subscriptions WHERE user_id = @user1_id ORDER BY created_at DESC LIMIT 1);
SET @user2_subscription_id = (SELECT id FROM user_subscriptions WHERE user_id = @user2_id ORDER BY created_at DESC LIMIT 1);

-- Insert sample subscription history for User 1 (blackyrwanda@gmail.com)
INSERT INTO `user_subscription_history` (
  `id`, `user_id`, `subscription_id`, `action_type`, `previous_plan_id`, `new_plan_id`,
  `payment_method`, `payment_amount`, `payment_currency`, `payment_status`,
  `billing_cycle`, `transaction_id`, `gateway_reference`, `metadata`, `created_at`
) VALUES
-- Initial subscription
(UUID(), @user1_id, @user1_subscription_id, 'payment', NULL, @premium_plan_id,
 'stripe', 29.99, 'USD', 'completed', 'monthly', 'txn_123456789', 'pi_123456789',
 '{"stripe_payment_intent_id": "pi_123456789", "customer_email": "blackyrwanda@gmail.com"}',
 DATE_SUB(NOW(), INTERVAL 30 DAY)),

-- Renewal
(UUID(), @user1_id, @user1_subscription_id, 'renewal', @premium_plan_id, @premium_plan_id,
 'stripe', 29.99, 'USD', 'completed', 'monthly', 'txn_987654321', 'pi_987654321',
 '{"stripe_payment_intent_id": "pi_987654321", "auto_renewal": true}',
 DATE_SUB(NOW(), INTERVAL 15 DAY)),

-- Upgrade to Pro
(UUID(), @user1_id, @user1_subscription_id, 'upgrade', @premium_plan_id, @pro_plan_id,
 'stripe', 99.99, 'USD', 'completed', 'monthly', 'txn_456789123', 'pi_456789123',
 '{"stripe_payment_intent_id": "pi_456789123", "upgrade_reason": "user_requested"}',
 DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Insert sample subscription history for User 2 (hilbert.apply@gmail.com)
INSERT INTO `user_subscription_history` (
  `id`, `user_id`, `subscription_id`, `action_type`, `previous_plan_id`, `new_plan_id`,
  `payment_method`, `payment_amount`, `payment_currency`, `payment_status`,
  `billing_cycle`, `transaction_id`, `gateway_reference`, `metadata`, `created_at`
) VALUES
-- Initial subscription
(UUID(), @user2_id, @user2_subscription_id, 'payment', NULL, @pro_plan_id,
 'crypto', 99.99, 'USD', 'completed', 'monthly', 'crypto_txn_001', 'np_001',
 '{"crypto_currency": "USDT", "wallet_address": "0x1234567890abcdef"}',
 DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- Failed renewal attempt
(UUID(), @user2_id, @user2_subscription_id, 'renewal', @pro_plan_id, @pro_plan_id,
 'crypto', 99.99, 'USD', 'failed', 'monthly', 'crypto_txn_002', 'np_002',
 '{"crypto_currency": "USDT", "failure_reason": "insufficient_funds"}',
 DATE_SUB(NOW(), INTERVAL 20 DAY)),

-- Successful renewal after retry
(UUID(), @user2_id, @user2_subscription_id, 'renewal', @pro_plan_id, @pro_plan_id,
 'crypto', 99.99, 'USD', 'completed', 'monthly', 'crypto_txn_003', 'np_003',
 '{"crypto_currency": "USDT", "retry_attempt": 2}',
 DATE_SUB(NOW(), INTERVAL 18 DAY)),

-- Downgrade to Premium
(UUID(), @user2_id, @user2_subscription_id, 'downgrade', @pro_plan_id, @premium_plan_id,
 NULL, 29.99, 'USD', 'completed', 'monthly', 'downgrade_001', NULL,
 '{"downgrade_reason": "cost_reduction", "proration_amount": -70.00}',
 DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Insert some additional sample data for different payment methods
INSERT INTO `user_subscription_history` (
  `id`, `user_id`, `subscription_id`, `action_type`, `previous_plan_id`, `new_plan_id`,
  `payment_method`, `payment_amount`, `payment_currency`, `payment_status`,
  `billing_cycle`, `transaction_id`, `gateway_reference`, `metadata`, `created_at`
) VALUES
-- Mobile Money payment
(UUID(), @user1_id, @user1_subscription_id, 'renewal', @premium_plan_id, @premium_plan_id,
 'mobile_money', 29.99, 'USD', 'completed', 'monthly', 'mm_txn_001', 'flw_001',
 '{"provider": "MTN", "phone_number": "+233241234567", "country": "Ghana"}',
 DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Bank Transfer
(UUID(), @user2_id, @user2_subscription_id, 'renewal', @premium_plan_id, @premium_plan_id,
 'bank_transfer', 29.99, 'USD', 'pending', 'monthly', 'bt_txn_001', 'bank_ref_001',
 '{"bank_name": "GT Bank", "account_number": "1234567890", "reference": "TA-2024-001"}',
 DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Google Pay
(UUID(), @user1_id, @user1_subscription_id, 'upgrade', @premium_plan_id, @pro_plan_id,
 'google_pay', 99.99, 'USD', 'completed', 'monthly', 'gp_txn_001', 'google_pay_001',
 '{"google_pay_token": "token_123", "device_info": "Android"}',
 NOW());
