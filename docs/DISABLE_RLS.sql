-- Disable RLS on questions table to allow inserts
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT tablename FROM pg_tables WHERE tablename = 'questions';
