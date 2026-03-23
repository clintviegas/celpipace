-- Populate practice_sets from synced questions
-- This groups the 38 questions into their respective parts

-- R1: Email Inquiry (11 questions)
INSERT INTO practice_sets (name, section, part, set_number, set_title, instruction, scenario, difficulty)
VALUES 
  ('R1-Email', 'Reading', 'R1', 1, 'Email Inquiry', 
   'Read the email below and answer the following questions.',
   'Residential — Tenant Correspondence',
   'easy')
ON CONFLICT DO NOTHING;

-- R2: Schedule Matching (8 questions)
INSERT INTO practice_sets (name, section, part, set_number, set_title, instruction, scenario, difficulty)
VALUES 
  ('R2-Schedule', 'Reading', 'R2', 1, 'Schedule Matching',
   'Use the schedule to match members with appropriate classes.',
   'Fitness — Class Scheduling',
   'medium')
ON CONFLICT DO NOTHING;

-- R3: Digital Literacy (9 questions)
INSERT INTO practice_sets (name, section, part, set_number, set_title, instruction, scenario, difficulty)
VALUES 
  ('R3-Digital', 'Reading', 'R3', 1, 'Digital Literacy in Canadian Schools',
   'Read the passage and answer the questions below.',
   'Education — Policy Analysis',
   'upper_intermediate')
ON CONFLICT DO NOTHING;

-- R4: AI Regulation (10 questions)
INSERT INTO practice_sets (name, section, part, set_number, set_title, instruction, scenario, difficulty)
VALUES 
  ('R4-AI', 'Reading', 'R4', 1, 'AI Regulation in Canadian Schools',
   'Analyze and compare the two speakers'' positions on AI in schools.',
   'Education — Opinion Comparison',
   'advanced')
ON CONFLICT DO NOTHING;

-- Now link questions to practice_sets using the part + number from questions table
-- This is a workaround because we synced flat questions instead of practice_sets first

UPDATE questions
SET practice_set_id = (
  SELECT id FROM practice_sets 
  WHERE practice_sets.part = questions.part AND practice_sets.section = 'Reading'
  LIMIT 1
)
WHERE section = 'Reading' AND practice_set_id IS NULL;

-- Verify counts
SELECT part, COUNT(*) as count FROM questions WHERE section = 'Reading' GROUP BY part;
