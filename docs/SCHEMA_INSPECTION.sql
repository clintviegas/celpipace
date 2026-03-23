-- Check the actual structure of practice_sets and questions tables
-- This will help us understand what fields exist

SELECT 'practice_sets' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'practice_sets'
ORDER BY ordinal_position

UNION ALL

SELECT 'questions' as table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'questions'
ORDER BY ordinal_position;
