-- CELPIP Question Bank Schema v4
-- Run this in Supabase SQL Editor to create the questions table

-- Create practice_sets table (optional, for organizing questions by section)
CREATE TABLE IF NOT EXISTS practice_sets (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  section VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create questions table (main table for all CELPIP questions)
CREATE TABLE IF NOT EXISTS questions (
  id BIGSERIAL PRIMARY KEY,
  practice_set_id BIGINT REFERENCES practice_sets(id) ON DELETE SET NULL,
  section VARCHAR(50) NOT NULL,
  part VARCHAR(10) NOT NULL,
  number INT NOT NULL,
  title VARCHAR(255),
  passage TEXT,
  instruction TEXT,
  question_text TEXT NOT NULL,
  type VARCHAR(50),
  correct_answer TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  explanation TEXT,
  difficulty VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section);
CREATE INDEX IF NOT EXISTS idx_questions_part ON questions(part);
CREATE INDEX IF NOT EXISTS idx_questions_number ON questions(number);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);

-- Enable RLS (Row Level Security) - optional
-- ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access (optional)
-- CREATE POLICY "Allow public read" ON questions
--   FOR SELECT USING (true);

COMMIT;
