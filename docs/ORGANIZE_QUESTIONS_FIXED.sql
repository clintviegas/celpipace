-- Insert practice sets for Reading without the 'part' column
-- The part info is already in the questions table

INSERT INTO practice_sets (name, section, description, created_at)
VALUES 
  ('R1 - Email Inquiry', 'Reading', 'Read an email and answer questions about its purpose, tone, and details.', NOW()),
  ('R2 - Schedule Matching', 'Reading', 'Use a schedule to match members with appropriate classes.', NOW()),
  ('R3 - Digital Literacy', 'Reading', 'Read an informational passage and answer comprehension questions.', NOW()),
  ('R4 - AI Regulation', 'Reading', 'Analyze and compare two different viewpoints on a topic.', NOW())
ON CONFLICT DO NOTHING;

-- Link questions to practice sets based on part
UPDATE questions q
SET practice_set_id = (
  SELECT id FROM practice_sets ps 
  WHERE ps.section = 'Reading'
  AND (
    (q.part = 'R1' AND ps.name LIKE '%R1%') OR
    (q.part = 'R2' AND ps.name LIKE '%R2%') OR
    (q.part = 'R3' AND ps.name LIKE '%R3%') OR
    (q.part = 'R4' AND ps.name LIKE '%R4%')
  )
  LIMIT 1
)
WHERE q.section = 'Reading' AND q.practice_set_id IS NULL;

-- Verify
SELECT part, COUNT(*) as count FROM questions WHERE section = 'Reading' GROUP BY part ORDER BY part;
SELECT name, COUNT(q.id) as question_count FROM practice_sets ps 
LEFT JOIN questions q ON ps.id = q.practice_set_id
WHERE ps.section = 'Reading'
GROUP BY ps.id, ps.name;
