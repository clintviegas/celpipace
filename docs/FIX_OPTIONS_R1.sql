-- UPDATE questions table with the correct options from the static READING_SETS data
-- This SQL will update R1 questions with their options

-- R1 Question 1: What is the main purpose of Sarah's email?
UPDATE questions SET 
  option_a = 'A) To complain about the high cost of the membership.',
  option_b = 'B) To request information about the student discount and membership details.',
  option_c = 'C) To cancel her fitness centre membership.',
  option_d = 'D) To schedule a personal training session.'
WHERE section = 'Reading' AND part = 'R1' AND number = 1;

-- R1 Question 2: How much does the annual student membership cost at Fitness Elite?
UPDATE questions SET 
  option_a = 'A) CA$30',
  option_b = 'B) CA$149',
  option_c = 'C) CA$199',
  option_d = 'D) CA$349'
WHERE section = 'Reading' AND part = 'R1' AND number = 2;

-- R1 Question 3: What documents can Sarah use to verify her student status?
UPDATE questions SET 
  option_a = 'A) Only a valid student ID card.',
  option_b = 'B) Only a letter from her university registrar.',
  option_c = 'C) Either a student ID or a dated letter from the registrar''s office.',
  option_d = 'D) A bank statement or proof of address.'
WHERE section = 'Reading' AND part = 'R1' AND number = 3;

-- R1 Question 4
UPDATE questions SET 
  option_a = 'A) Only on Monday, Wednesday, or Friday mornings.',
  option_b = 'B) Only on Tuesday or Thursday evenings.',
  option_c = 'C) Either Monday/Wednesday/Friday mornings or Tuesday/Thursday evenings.',
  option_d = 'D) Any time during the week since yoga is offered daily.'
WHERE section = 'Reading' AND part = 'R1' AND number = 4;

-- R1 Question 5
UPDATE questions SET 
  option_a = 'A) CA$199',
  option_b = 'B) CA$229',
  option_c = 'C) CA$349',
  option_d = 'D) CA$379'
WHERE section = 'Reading' AND part = 'R1' AND number = 5;

-- R1 Question 6
UPDATE questions SET 
  option_a = 'A) To express concern that Sarah may be unhappy.',
  option_b = 'B) To show genuine enthusiasm and make the customer feel welcomed.',
  option_c = 'C) To indicate that most students do not join.',
  option_d = 'D) To suggest Sarah should hurry before the offer expires.'
WHERE section = 'Reading' AND part = 'R1' AND number = 6;

-- R1 Question 7
UPDATE questions SET 
  option_a = 'A) He is suggesting Sarah should not join without visiting first.',
  option_b = 'B) He is inviting Sarah to experience the facility to help her make an informed decision.',
  option_c = 'C) He is discouraging her from joining online.',
  option_d = 'D) He is implying the facility may not meet her expectations.'
WHERE section = 'Reading' AND part = 'R1' AND number = 7;

-- R1 Question 8
UPDATE questions SET 
  option_a = 'A) Unlimited yoga classes.',
  option_b = 'B) Access to the swimming pool.',
  option_c = 'C) Strength training.',
  option_d = 'D) Sauna and massage therapy services.'
WHERE section = 'Reading' AND part = 'R1' AND number = 8;

-- R1 Question 9
UPDATE questions SET 
  option_a = 'A) To increase their revenue by charging for additional sessions.',
  option_b = 'B) To help new members start safely and feel supported in their fitness journey.',
  option_c = 'C) To demonstrate that their facilities are overcrowded with trainers.',
  option_d = 'D) To replace the need for a gym orientation.'
WHERE section = 'Reading' AND part = 'R1' AND number = 9;

-- R1 Question 10
UPDATE questions SET 
  option_a = 'A) Dismissive and unhelpful.',
  option_b = 'B) Professional yet overly formal and cold.',
  option_c = 'C) Warm, helpful, and customer-focused.',
  option_d = 'D) Skeptical and cautious.'
WHERE section = 'Reading' AND part = 'R1' AND number = 10;

-- R1 Question 11
UPDATE questions SET 
  option_a = 'A) Pay the CA$199 membership fee immediately online.',
  option_b = 'B) Provide her student ID or a letter from her registrar''s office and then visit the facility to complete the registration process.',
  option_c = 'C) Contact Marcus to schedule a specific personal training session.',
  option_d = 'D) Attend a mandatory orientation class before using the facilities.'
WHERE section = 'Reading' AND part = 'R1' AND number = 11;

-- Verify the updates
SELECT COUNT(*) as updated_count FROM questions 
WHERE section = 'Reading' AND part = 'R1' AND option_a IS NOT NULL AND option_a != '';
