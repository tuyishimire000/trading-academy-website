-- Create user_subscription_history table
CREATE TABLE IF NOT EXISTS `user_subscription_history` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `subscription_id` CHAR(36) NOT NULL,
  `action_type` VARCHAR(50) NOT NULL,
  `previous_plan_id` CHAR(36) NULL,
  `new_plan_id` CHAR(36) NOT NULL,
  `payment_method` VARCHAR(50) NULL,
  `payment_amount` DECIMAL(10,2) NULL,
  `payment_currency` VARCHAR(3) NULL,
  `payment_status` VARCHAR(20) NULL,
  `billing_cycle` VARCHAR(20) NOT NULL,
  `transaction_id` VARCHAR(255) NULL,
  `gateway_reference` VARCHAR(255) NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_subscription_id` (`subscription_id`),
  INDEX `idx_action_type` (`action_type`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key constraints after table creation
ALTER TABLE `user_subscription_history` 
ADD CONSTRAINT `fk_ush_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `user_subscription_history` 
ADD CONSTRAINT `fk_ush_subscription_id` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`) ON DELETE CASCADE;

ALTER TABLE `user_subscription_history` 
ADD CONSTRAINT `fk_ush_previous_plan_id` FOREIGN KEY (`previous_plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE SET NULL;

ALTER TABLE `user_subscription_history` 
ADD CONSTRAINT `fk_ush_new_plan_id` FOREIGN KEY (`new_plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE CASCADE;
