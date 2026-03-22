-- ═══════════════════════════════════════════════════════════
-- CELPIP ACE — Reading Questions Table
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- 1. Create the table
CREATE TABLE IF NOT EXISTS reading_questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part           TEXT NOT NULL,           -- 'R1' | 'R2' | 'R3' | 'R4'
  set_title      TEXT NOT NULL,           -- groups questions into a named practice set
  passage        TEXT,                    -- reading passage (shared across questions in a set)
  instruction    TEXT NOT NULL,           -- "Read the email below..."
  scenario       TEXT,                    -- short descriptor e.g. "Tenant Correspondence"
  difficulty     TEXT NOT NULL DEFAULT 'medium', -- 'easy' | 'medium' | 'hard' | 'advanced'
  question_order INT  NOT NULL DEFAULT 1, -- display order within a set
  question_text  TEXT NOT NULL,
  options        JSONB NOT NULL,          -- ["A) ...", "B) ...", "C) ...", "D) ..."]
  correct_index  INT  NOT NULL,           -- 0-based index into options array
  explanation    TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index for fast lookup by part
CREATE INDEX IF NOT EXISTS idx_reading_questions_part
  ON reading_questions (part);

-- 3. Enable Row Level Security
ALTER TABLE reading_questions ENABLE ROW LEVEL SECURITY;

-- 4. Public read policy (anyone can read questions — no login required)
CREATE POLICY "Public can read reading_questions"
  ON reading_questions
  FOR SELECT
  USING (true);

-- 5. Seed: 5 questions per part (R1–R4), easy → advanced
-- ── R1: Correspondence ──────────────────────────────────────
INSERT INTO reading_questions
  (part, set_title, instruction, scenario, difficulty, question_order, passage, question_text, options, correct_index, explanation)
VALUES

-- R1 Q1 — Easy
('R1', 'Email — Noise Complaint to Property Manager',
 'Read the email below, then answer the questions.',
 'Residential — Tenant Correspondence', 'easy', 1,
 E'Subject: Ongoing Noise Disturbance — Unit 4B\n\nDear Ms. Harrington,\n\nI am writing to bring a recurring issue to your attention. Over the past three weeks, the tenant in the unit directly above mine (4B) has been causing significant noise disturbances late at night — specifically between 11:00 PM and 2:00 AM on weekdays. The noise includes loud music, footsteps, and what sounds like furniture being moved repeatedly.\n\nI have attempted to resolve this informally by speaking with the tenant directly, but the behaviour has continued without improvement. As a long-term resident of this building, I would appreciate your assistance in addressing this matter in accordance with the building\'s noise policy.\n\nI am available to speak at your convenience and can provide dates and times of the specific incidents if needed.\n\nSincerely,\nJames Kowalski\nUnit 3B',
 'Who is James Kowalski writing to?',
 '["A) The tenant in Unit 4B", "B) The building''s property manager", "C) A city noise inspector", "D) His next-door neighbour"]',
 1,
 'The email is addressed "Dear Ms. Harrington" and James identifies her as the property manager by requesting her assistance in enforcing the building noise policy.'),

-- R1 Q2 — Easy
('R1', 'Email — Noise Complaint to Property Manager',
 'Read the email below, then answer the questions.',
 'Residential — Tenant Correspondence', 'easy', 2,
 NULL,
 'At what times does the noise disturbance occur?',
 '["A) Weekday mornings from 6:00 AM to 9:00 AM", "B) Weekday evenings from 9:00 PM to 11:00 PM", "C) Late at night between 11:00 PM and 2:00 AM on weekdays", "D) Throughout the day on weekends"]',
 2,
 'James states clearly: "specifically between 11:00 PM and 2:00 AM on weekdays." This is directly stated in the first paragraph.'),

-- R1 Q3 — Medium
('R1', 'Email — Noise Complaint to Property Manager',
 'Read the email below, then answer the questions.',
 'Residential — Tenant Correspondence', 'medium', 3,
 NULL,
 'Why does James mention that he already spoke with the upstairs tenant?',
 '["A) To prove that the upstairs tenant is hostile.", "B) To show he tried to solve the problem before contacting the manager.", "C) To ask the manager to speak to the tenant on his behalf.", "D) To provide evidence that the noise is intentional."]',
 1,
 'James says he "attempted to resolve this informally by speaking with the tenant directly." This demonstrates good faith — he escalated to the manager only after the informal approach failed.'),

-- R1 Q4 — Hard
('R1', 'Email — Noise Complaint to Property Manager',
 'Read the email below, then answer the questions.',
 'Residential — Tenant Correspondence', 'hard', 4,
 NULL,
 'What does James offer to do to support his complaint?',
 '["A) Provide a signed statement from other neighbours.", "B) Record the noise and submit a video as evidence.", "C) Supply specific dates and times of the incidents.", "D) Move to a different unit until the issue is resolved."]',
 2,
 'In the final paragraph James writes: "I can provide dates and times of the specific incidents if needed." He is offering documentation to support the complaint.'),

-- R1 Q5 — Advanced
('R1', 'Email — Noise Complaint to Property Manager',
 'Read the email below, then answer the questions.',
 'Residential — Tenant Correspondence', 'advanced', 5,
 NULL,
 'Which of the following best describes the overall tone and purpose of this email?',
 '["A) Threatening — James is warning Ms. Harrington of legal consequences.", "B) Casual — James is informally updating his property manager.", "C) Formal and measured — James is professionally escalating an unresolved issue.", "D) Apologetic — James is sorry for causing a dispute with his neighbour."]',
 2,
 'The language is consistently formal ("I am writing to bring a recurring issue to your attention," "I would appreciate your assistance") and restrained rather than emotional or threatening. The purpose is professional escalation after an informal attempt failed.'),


-- ── R2: Apply a Diagram ─────────────────────────────────────
-- R2 Q1 — Easy
('R2', 'Community Centre — Spring Fitness Schedule',
 'Read the passage and schedule, then answer the questions.',
 'Community Centre — Program Information', 'easy', 1,
 E'The Riverside Community Centre has updated its weekly fitness schedule for the spring season. Yoga classes run on Monday and Wednesday mornings from 9:00 AM to 10:00 AM. The aquatic fitness class for seniors is offered Tuesday and Thursday afternoons from 2:00 PM to 3:00 PM. Indoor cycling is available Monday through Friday at 6:00 PM. All classes require advance registration, which can be completed online or at the front desk.\n\nNote: The pool will be closed for maintenance on Thursday, April 10th. The aquatic fitness class on that date will be replaced by a chair yoga session in Room 2.\n\nSCHEDULE (Week of April 7–11):\nMon Apr 7:  Yoga (9AM), Indoor Cycling (6PM)\nTue Apr 8:  Aquatic Fitness (2PM), Indoor Cycling (6PM)\nWed Apr 9:  Yoga (9AM), Indoor Cycling (6PM)\nThu Apr 10: Chair Yoga – Room 2 (2PM), Indoor Cycling (6PM)\nFri Apr 11: Indoor Cycling (6PM)',
 'Which class is available every day Monday through Friday?',
 '["A) Yoga", "B) Aquatic Fitness", "C) Indoor Cycling", "D) Chair Yoga"]',
 2,
 'The passage states: "Indoor cycling is available Monday through Friday at 6:00 PM." This is confirmed in the schedule where 6PM cycling appears on all five days.'),

-- R2 Q2 — Easy
('R2', 'Community Centre — Spring Fitness Schedule',
 'Read the passage and schedule, then answer the questions.',
 'Community Centre — Program Information', 'easy', 2,
 NULL,
 'How can members register for classes?',
 '["A) By calling the front desk only", "B) By emailing the instructor directly", "C) Online or at the front desk", "D) Only in person on the day of the class"]',
 2,
 'The passage explicitly states: "All classes require advance registration, which can be completed online or at the front desk."'),

-- R2 Q3 — Medium
('R2', 'Community Centre — Spring Fitness Schedule',
 'Read the passage and schedule, then answer the questions.',
 'Community Centre — Program Information', 'medium', 3,
 NULL,
 'A senior wants to attend an aquatic fitness class during the week of April 7–11. Which is the ONLY day they can do so?',
 '["A) Monday, April 7", "B) Tuesday, April 8", "C) Thursday, April 10", "D) Friday, April 11"]',
 1,
 'Aquatic Fitness runs Tuesday and Thursday. However, on Thursday April 10 the pool is closed and the class is replaced by Chair Yoga. Therefore Tuesday April 8 is the only day aquatic fitness actually runs that week.'),

-- R2 Q4 — Hard
('R2', 'Community Centre — Spring Fitness Schedule',
 'Read the passage and schedule, then answer the questions.',
 'Community Centre — Program Information', 'hard', 4,
 NULL,
 'How many total class sessions are scheduled at the community centre during the week of April 7–11?',
 '["A) Seven", "B) Eight", "C) Nine", "D) Ten"]',
 2,
 'Counting from the schedule: Mon (2), Tue (2), Wed (2), Thu (2), Fri (1) = 9 sessions total. Each day except Friday has two sessions listed.'),

-- R2 Q5 — Advanced
('R2', 'Community Centre — Spring Fitness Schedule',
 'Read the passage and schedule, then answer the questions.',
 'Community Centre — Program Information', 'advanced', 5,
 NULL,
 'A member read that aquatic fitness runs on Thursdays and shows up on April 10 expecting that class. Based on the passage and schedule, which statement best describes their situation?',
 '["A) They will find the class cancelled with no alternative offered.", "B) They can still attend a water-based fitness class in the pool.", "C) They will find a chair yoga session in Room 2 instead.", "D) They should have registered for the Tuesday session to avoid this."]',
 2,
 'The passage specifically states that on April 10 the pool is closed for maintenance and the aquatic class is REPLACED by a chair yoga session in Room 2. So a member arriving that day will find chair yoga, not aquatic fitness.'),


-- ── R3: Information ─────────────────────────────────────────
-- R3 Q1 — Easy
('R3', 'The Rise of Urban Beekeeping in Canadian Cities',
 'Read the passage below, then answer the questions.',
 'General Interest — Environment & Urban Life', 'easy', 1,
 E'Urban beekeeping has grown steadily across Canadian cities over the past decade, driven by a combination of environmental concern, community food initiatives, and changing municipal regulations. Cities like Toronto, Vancouver, and Montreal now permit residential beekeeping under specific conditions, and rooftop hives have become a visible presence in many downtown neighbourhoods.\n\nProponents argue that urban bees provide measurable ecological benefits. Because cities are often warmer than surrounding rural areas and contain a diverse range of flowering plants in gardens and parks, urban bees can actually thrive more consistently than their rural counterparts. Studies from several European cities have shown higher honey production per hive in urban environments compared to agricultural zones, largely because monoculture farming reduces the variety of plants available to rural bees.\n\nCritics, however, raise concerns about the welfare of bees kept in high-density areas. Without the biodiversity of natural landscapes, urban bees may face nutritional gaps if flowering sources are limited or seasonal. There are also concerns about the spread of disease between hives kept in close proximity, and about what happens to colonies when inexperienced hobby beekeepers abandon the practice.\n\nDespite these debates, urban beekeeping continues to expand. Many cities now offer training programs and community hive projects that allow residents to participate without managing a hive individually. Whether urban beekeeping represents a meaningful contribution to pollinator health or simply a well-intentioned hobby remains an open question — but its presence in Canadian cities shows no sign of diminishing.',
 'Which three Canadian cities are mentioned in the passage as allowing residential beekeeping?',
 '["A) Ottawa, Calgary, and Halifax", "B) Toronto, Vancouver, and Montreal", "C) Edmonton, Winnipeg, and Quebec City", "D) Hamilton, Victoria, and Saskatoon"]',
 1,
 'The first paragraph directly names "Toronto, Vancouver, and Montreal" as cities that now permit residential beekeeping under specific conditions.'),

-- R3 Q2 — Easy
('R3', 'The Rise of Urban Beekeeping in Canadian Cities',
 'Read the passage below, then answer the questions.',
 'General Interest — Environment & Urban Life', 'easy', 2,
 NULL,
 'According to the passage, what has helped urban beekeeping grow?',
 '["A) Government grants for hobby farmers", "B) Environmental concern, food initiatives, and changing regulations", "C) A decline in rural bee populations forcing a shift to cities", "D) New technology making hive management easier"]',
 1,
 'The opening sentence lists the three drivers: "environmental concern, community food initiatives, and changing municipal regulations."'),

-- R3 Q3 — Medium
('R3', 'The Rise of Urban Beekeeping in Canadian Cities',
 'Read the passage below, then answer the questions.',
 'General Interest — Environment & Urban Life', 'medium', 3,
 NULL,
 'Why might urban bees produce more honey than rural bees, according to the passage?',
 '["A) Urban beekeepers are better trained than rural ones.", "B) Cities are cooler, which slows down honey consumption.", "C) Monoculture farming limits the variety of plants available to rural bees.", "D) Urban hives are kept in more controlled, sheltered conditions."]',
 2,
 'The passage explains that European studies show higher urban honey production "largely because monoculture farming reduces the variety of plants available to rural bees," while urban areas offer diverse gardens and parks.'),

-- R3 Q4 — Hard
('R3', 'The Rise of Urban Beekeeping in Canadian Cities',
 'Read the passage below, then answer the questions.',
 'General Interest — Environment & Urban Life', 'hard', 4,
 NULL,
 'What concern do critics raise about disease in urban beekeeping?',
 '["A) Urban pollution weakens bees'' immune systems over time.", "B) Hives kept close together make it easier for disease to spread between colonies.", "C) Imported bee species introduce new diseases to Canadian ecosystems.", "D) Urban bees transmit disease to nearby community gardens."]',
 1,
 'Critics specifically mention "concerns about the spread of disease between hives kept in close proximity." The word proximity means nearness — urban hives are densely packed, making disease transmission more likely.'),

-- R3 Q5 — Advanced
('R3', 'The Rise of Urban Beekeeping in Canadian Cities',
 'Read the passage below, then answer the questions.',
 'General Interest — Environment & Urban Life', 'advanced', 5,
 NULL,
 'The author concludes that urban beekeeping "shows no sign of diminishing." Based on the overall passage, which statement most accurately reflects the author''s position?',
 '["A) The author strongly supports urban beekeeping and wants it expanded.", "B) The author presents a balanced view — acknowledging both ecological benefits and legitimate risks.", "C) The author believes urban beekeeping is harmful and should be regulated more strictly.", "D) The author is uncertain whether bees can survive in cities and calls for more research."]',
 1,
 'The passage presents benefits (ecological, honey production) and concerns (nutrition, disease, abandonment) without taking a strong personal stance. The final sentence is neutral — noting the trend continues while the value remains an "open question." This is a balanced, impartial tone.'),


-- ── R4: Viewpoints ──────────────────────────────────────────
-- R4 Q1 — Easy
('R4', 'Should Remote Work Become a Permanent Right?',
 'Read both viewpoints below, then answer the questions.',
 'Opinion Texts — Workplace Policy', 'easy', 1,
 E'VIEWPOINT A — Maria Delacroix, HR Director\n\nRemote work has proven itself. Productivity data from our organization shows no decline in output, employee satisfaction scores are at an all-time high, and we have successfully hired talent from cities we could not previously recruit from. The commute is the most universally disliked part of work life, and eliminating it has given employees back hours every week. Companies that refuse to offer flexible work will simply lose their best people to competitors who do.\n\nThat said, remote work is not appropriate for every role or every employee. Some positions require physical presence, and some individuals work better in a structured office environment. What we need is not a blanket policy but a framework that treats remote work as a default right — available to all unless the role requires otherwise.\n\nVIEWPOINT B — Kevin Tanaka, Operations Manager\n\nThe enthusiasm for remote work ignores a significant problem: collaboration suffers. The spontaneous hallway conversation, the whiteboard session, the sense of shared momentum in a team working toward the same goal — these things do not translate to video calls. Junior employees in particular lose out: they learn their craft by being near experienced colleagues, and that informal mentorship disappears when everyone is working from home.\n\nI am not arguing that remote work has no place. For focused, independent tasks, it is often better. But codifying it as a right risks normalizing a model that works well for senior individual contributors and poorly for everyone else. Organizations should retain the authority to determine what arrangements serve their teams best.',
 'What is Maria''s job title?',
 '["A) Operations Manager", "B) HR Director", "C) Chief Executive Officer", "D) Team Lead"]',
 1,
 'The viewpoint header clearly states: "Maria Delacroix, HR Director."'),

-- R4 Q2 — Easy
('R4', 'Should Remote Work Become a Permanent Right?',
 'Read both viewpoints below, then answer the questions.',
 'Opinion Texts — Workplace Policy', 'easy', 2,
 NULL,
 'According to Kevin, which group of employees is most negatively affected by remote work?',
 '["A) Senior managers who travel frequently", "B) Employees with poor internet connections", "C) Junior employees who rely on informal mentorship", "D) Part-time workers who share desks in the office"]',
 2,
 'Kevin writes: "Junior employees in particular lose out: they learn their craft by being near experienced colleagues, and that informal mentorship disappears when everyone is working from home."'),

-- R4 Q3 — Medium
('R4', 'Should Remote Work Become a Permanent Right?',
 'Read both viewpoints below, then answer the questions.',
 'Opinion Texts — Workplace Policy', 'medium', 3,
 NULL,
 'What is Maria''s main argument for treating remote work as a default right?',
 '["A) Remote work saves companies money on office rent.", "B) All employees perform better without the distractions of an open office.", "C) Productivity data and satisfaction scores show remote work has proven itself.", "D) Remote work is already the legal standard in most Canadian provinces."]',
 2,
 'Maria cites "productivity data from our organization shows no decline in output" and "employee satisfaction scores are at an all-time high" as her evidence that remote work has proven itself and should be a default right.'),

-- R4 Q4 — Hard
('R4', 'Should Remote Work Become a Permanent Right?',
 'Read both viewpoints below, then answer the questions.',
 'Opinion Texts — Workplace Policy', 'hard', 4,
 NULL,
 'Kevin says he is "not arguing that remote work has no place." What does he mean by this?',
 '["A) He supports making remote work a permanent legal right for all employees.", "B) He believes remote work is acceptable for some tasks but should not be codified as a universal right.", "C) He thinks remote work is only suitable for companies with fewer than 50 employees.", "D) He wants remote work to be studied further before any policy is made."]',
 1,
 'Kevin acknowledges remote work is "often better" for focused, independent tasks, but argues it should not be "codified as a right" because it works poorly for junior employees and collaborative work. He supports situational use, not universal entitlement.'),

-- R4 Q5 — Advanced
('R4', 'Should Remote Work Become a Permanent Right?',
 'Read both viewpoints below, then answer the questions.',
 'Opinion Texts — Workplace Policy', 'advanced', 5,
 NULL,
 'On which point do Maria and Kevin MOST clearly agree, despite their different conclusions?',
 '["A) Organizations should let individual employees choose whether to work remotely.", "B) Remote work is not appropriate for every role or every individual.", "C) The commute is the most harmful part of office work.", "D) Productivity always improves when employees work from home."]',
 1,
 'Maria explicitly states: "remote work is not appropriate for every role or every employee. Some positions require physical presence." Kevin agrees: "For focused, independent tasks, it is often better" — implying other tasks require in-person work. Both accept that remote work is not universally suitable, even though they disagree on how to respond to that fact.');
