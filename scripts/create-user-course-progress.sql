-- Create user_course_progress table
-- Run this in your MySQL client (phpMyAdmin, MySQL Workbench, or command line)

USE trading_academy;

-- Create the user_course_progress table
CREATE TABLE IF NOT EXISTS user_course_progress (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'not_started',
    progress_percentage INT DEFAULT 0,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_course (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX idx_user_course_progress_status ON user_course_progress(status);
CREATE INDEX idx_user_course_progress_last_accessed ON user_course_progress(last_accessed);

-- Seed with test data (replace the UUIDs with actual user and course IDs from your database)
-- First, let's get a user ID and course IDs
SELECT 'Available users:' as info;
SELECT id, email FROM users LIMIT 5;

SELECT 'Available courses:' as info;
SELECT id, title FROM courses WHERE is_published = true LIMIT 5;

-- Now insert test progress data (replace the UUIDs below with actual IDs from above queries)
-- Example: If your user ID is '091c3f7d-6ff6-4b06-9752-3dd066587093' and you have courses with IDs 'course-id-1', 'course-id-2', etc.

/*
INSERT INTO user_course_progress (id, user_id, course_id, status, progress_percentage, last_accessed) VALUES
(UUID(), '091c3f7d-6ff6-4b06-9752-3dd066587093', 'course-id-1', 'in_progress', 45, NOW()),
(UUID(), '091c3f7d-6ff6-4b06-9752-3dd066587093', 'course-id-2', 'completed', 100, NOW()),
(UUID(), '091c3f7d-6ff6-4b06-9752-3dd066587093', 'course-id-3', 'not_started', 0, NOW());
*/

-- Verify the table was created
SELECT 'Table created successfully!' as status;
DESCRIBE user_course_progress;
