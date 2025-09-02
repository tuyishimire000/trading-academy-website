-- Create resources schema for external content
-- This script creates tables for videos, books, and podcasts

-- Drop existing tables if they exist
DROP TABLE IF EXISTS resource_categories;
DROP TABLE IF EXISTS resource_videos;
DROP TABLE IF EXISTS resource_books;
DROP TABLE IF EXISTS resource_podcasts;
DROP TABLE IF EXISTS user_resource_progress;
DROP TABLE IF EXISTS resource_favorites;

-- Create resource categories table
CREATE TABLE resource_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create resource videos table
CREATE TABLE resource_videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration_seconds INT,
    source VARCHAR(100) NOT NULL, -- 'youtube', 'vimeo', 'custom', etc.
    source_id VARCHAR(100), -- video ID from source platform
    category_id INT,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    tags JSON,
    views_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES resource_categories(id) ON DELETE SET NULL
);

-- Create resource books table
CREATE TABLE resource_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    file_url VARCHAR(500), -- downloadable file URL
    file_size_mb DECIMAL(8,2),
    file_type VARCHAR(20), -- 'pdf', 'epub', 'mobi', etc.
    pages INT,
    isbn VARCHAR(20),
    publisher VARCHAR(255),
    publication_year INT,
    category_id INT,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    tags JSON,
    downloads_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES resource_categories(id) ON DELETE SET NULL
);

-- Create resource podcasts table
CREATE TABLE resource_podcasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    host VARCHAR(255),
    url VARCHAR(500) NOT NULL,
    platform VARCHAR(100) NOT NULL, -- 'youtube', 'spotify', 'apple', 'google', etc.
    platform_id VARCHAR(100), -- podcast ID from platform
    cover_image_url VARCHAR(500),
    duration_seconds INT,
    episode_number INT,
    season_number INT,
    category_id INT,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    tags JSON,
    listens_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES resource_categories(id) ON DELETE SET NULL
);

-- Create user resource progress table
CREATE TABLE user_resource_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    resource_type ENUM('video', 'book', 'podcast') NOT NULL,
    resource_id INT NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent_seconds INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_resource (user_id, resource_type, resource_id)
);

-- Create resource favorites table
CREATE TABLE resource_favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    resource_type ENUM('video', 'book', 'podcast') NOT NULL,
    resource_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_favorite (user_id, resource_type, resource_id)
);

-- Insert default resource categories
INSERT INTO resource_categories (name, description, icon, color) VALUES
('Trading Basics', 'Fundamental trading concepts and strategies', 'book-open', '#3B82F6'),
('Technical Analysis', 'Chart patterns, indicators, and technical strategies', 'trending-up', '#10B981'),
('Fundamental Analysis', 'Economic indicators and company analysis', 'bar-chart-3', '#F59E0B'),
('Risk Management', 'Position sizing, stop losses, and risk control', 'shield', '#EF4444'),
('Psychology', 'Trading psychology and mindset', 'brain', '#8B5CF6'),
('Cryptocurrency', 'Digital currency trading and blockchain', 'bitcoin', '#F97316'),
('Forex', 'Foreign exchange trading', 'globe', '#06B6D4'),
('Stocks', 'Stock market trading and analysis', 'building-2', '#84CC16'),
('Options', 'Options trading strategies', 'zap', '#EC4899'),
('Futures', 'Futures and commodities trading', 'clock', '#6366F1');

-- Create indexes for better performance
CREATE INDEX idx_videos_category ON resource_videos(category_id);
CREATE INDEX idx_videos_difficulty ON resource_videos(difficulty_level);
CREATE INDEX idx_videos_featured ON resource_videos(is_featured);
CREATE INDEX idx_videos_active ON resource_videos(is_active);

CREATE INDEX idx_books_category ON resource_books(category_id);
CREATE INDEX idx_books_difficulty ON resource_books(difficulty_level);
CREATE INDEX idx_books_featured ON resource_books(is_featured);
CREATE INDEX idx_books_active ON resource_books(is_active);

CREATE INDEX idx_podcasts_category ON resource_podcasts(category_id);
CREATE INDEX idx_podcasts_difficulty ON resource_podcasts(difficulty_level);
CREATE INDEX idx_podcasts_featured ON resource_podcasts(is_featured);
CREATE INDEX idx_podcasts_active ON resource_podcasts(is_active);

CREATE INDEX idx_user_progress_user ON user_resource_progress(user_id);
CREATE INDEX idx_user_progress_resource ON user_resource_progress(resource_type, resource_id);

CREATE INDEX idx_favorites_user ON resource_favorites(user_id);
CREATE INDEX idx_favorites_resource ON resource_favorites(resource_type, resource_id);



