-- Create user_course_progress table
-- This table tracks user progress through courses

CREATE TABLE IF NOT EXISTS user_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    progress_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_status ON user_course_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_last_accessed ON user_course_progress(last_accessed);
