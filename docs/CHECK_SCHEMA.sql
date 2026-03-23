-- Check practice_sets table structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'practice_sets' 
ORDER BY ordinal_position;
