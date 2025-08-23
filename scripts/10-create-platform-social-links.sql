-- Create platform_social_links table
CREATE TABLE IF NOT EXISTS `platform_social_links` (
  `id` CHAR(36) NOT NULL,
  `platform` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `url` TEXT NOT NULL,
  `description` TEXT NULL,
  `required_plan` VARCHAR(50) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_platform` (`platform`),
  INDEX `idx_required_plan` (`required_plan`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
