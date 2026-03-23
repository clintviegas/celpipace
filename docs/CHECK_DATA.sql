-- Check what's in the questions table
SELECT 
  section, 
  part, 
  COUNT(*) as count,
  STRING_AGG(DISTINCT difficulty, ', ') as difficulties
FROM questions
GROUP BY section, part
ORDER BY section, part;

-- Check a sample row
SELECT * FROM questions LIMIT 1;
