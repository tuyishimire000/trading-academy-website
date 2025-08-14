-- Add sample modules for the courses
DO $$
DECLARE
    course_record RECORD;
    module_count INTEGER;
BEGIN
    -- Loop through each course and add sample modules
    FOR course_record IN SELECT id, title FROM courses WHERE is_published = true
    LOOP
        -- Add 3-5 modules per course
        module_count := 3 + (RANDOM() * 3)::INTEGER;
        
        FOR i IN 1..module_count
        LOOP
            INSERT INTO course_modules (
                course_id, 
                title, 
                description, 
                content_type, 
                duration, 
                sort_order, 
                is_published
            ) VALUES (
                course_record.id,
                'Module ' || i || ': ' || course_record.title || ' Part ' || i,
                'Detailed explanation of key concepts in this module.',
                CASE 
                    WHEN i = 1 THEN 'video'
                    WHEN i = module_count THEN 'quiz'
                    ELSE (ARRAY['video', 'text'])[1 + (RANDOM())::INTEGER]
                END,
                15 + (RANDOM() * 30)::INTEGER, -- 15-45 minutes
                i,
                true
            );
        END LOOP;
    END LOOP;
END $$;
