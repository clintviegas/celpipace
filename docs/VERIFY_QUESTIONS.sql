-- Verify questions are in the database
SELECT COUNT(*) as total_questions FROM questions;

-- Check what sections and parts we have
SELECT DISTINCT section, part, COUNT(*) as count 
FROM questions 
GROUP BY section, part 
ORDER BY section, part;

-- Check first question to see the structure
SELECT 
  id,
  section,
  part,
  number,
  question_text,
  correct_answer,
  option_a,
  option_b,
  option_c,
  option_d
FROM questions 
LIMIT 1;
