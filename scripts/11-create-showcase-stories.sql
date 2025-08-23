-- Create showcase_stories table
CREATE TABLE IF NOT EXISTS `showcase_stories` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `caption` TEXT NULL,
  `image_url` TEXT NOT NULL,
  `group_name` VARCHAR(100) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_group_name` (`group_name`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_expires_at` (`expires_at`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
