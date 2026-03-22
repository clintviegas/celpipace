-- ═══════════════════════════════════════════════════════════════════════════
-- CELPIP ACE — Schema v4
-- Normalized 3-table schema replacing flat reading_questions table.
-- Run in Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. DROP OLD TABLE ────────────────────────────────────────────────────
DROP TABLE IF EXISTS reading_questions CASCADE;

-- ── 1. TABLES ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS practice_sets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  section      TEXT        NOT NULL,  -- 'reading' | 'listening' | 'writing' | 'speaking'
  part         TEXT        NOT NULL,  -- 'R1'..'R4' | 'L1'..'L6' | 'W1' | 'W2' | 'S1'..'S6'
  set_number   INT         NOT NULL,  -- 1..5
  set_type     TEXT        NOT NULL DEFAULT 'mcq',  -- 'mcq' | 'diagram_email' | 'writing' | 'speaking'
  set_title    TEXT        NOT NULL,
  instruction  TEXT        NOT NULL,
  scenario     TEXT,
  difficulty   TEXT        NOT NULL DEFAULT 'medium',
  passage      TEXT,
  diagram_html TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id         UUID        NOT NULL REFERENCES practice_sets(id) ON DELETE CASCADE,
  question_order INT         NOT NULL,
  question_type  TEXT        NOT NULL DEFAULT 'mcq',  -- 'mcq' | 'fill_blank'
  question_text  TEXT        NOT NULL,
  options        JSONB       NOT NULL,
  correct_index  INT         NOT NULL,
  explanation    TEXT        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_attempts (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id    UUID        NOT NULL REFERENCES questions(id)   ON DELETE CASCADE,
  selected_index INT         NOT NULL,
  is_correct     BOOLEAN     NOT NULL,
  attempted_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. INDEXES ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_ps_section_part ON practice_sets (section, part, set_number);
CREATE INDEX IF NOT EXISTS idx_q_set_order     ON questions     (set_id, question_order);
CREATE INDEX IF NOT EXISTS idx_ua_user         ON user_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_ua_question     ON user_attempts (question_id);

-- ── 3. ROW LEVEL SECURITY ──────────────────────────────────────────────────

ALTER TABLE practice_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_attempts  ENABLE ROW LEVEL SECURITY;

-- Public read for practice_sets and questions
CREATE POLICY "Public read practice_sets"
  ON practice_sets FOR SELECT USING (true);

CREATE POLICY "Public read questions"
  ON questions FOR SELECT USING (true);

-- Users can only see / insert / update / delete their own attempts
CREATE POLICY "Users read own attempts"
  ON user_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own attempts"
  ON user_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own attempts"
  ON user_attempts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own attempts"
  ON user_attempts FOR DELETE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. SEED — READING  (R1, R2, R3, R4 — 5 sets each)
--    Strategy: INSERT practice_sets rows with explicit IDs, then reference
--    those IDs when inserting questions.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- R1 — CORRESPONDENCE  (5 sets × 5 MCQ = 25 questions)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO practice_sets (id, section, part, set_number, set_type, set_title, instruction, scenario, difficulty, passage)
VALUES

('11111111-0001-0001-0001-000000000001'::uuid,
 'reading','R1',1,'mcq',
 'Email — Noise Complaint to Property Manager',
 'Read the email below, then answer the questions.',
 'Residential — Tenant Correspondence','easy',
 E'Subject: Ongoing Noise Disturbance — Unit 4B\n\nDear Ms. Harrington,\n\nI am writing to bring a recurring issue to your attention. Over the past three weeks, the tenant in the unit directly above mine (4B) has been causing significant noise disturbances late at night — specifically between 11:00 PM and 2:00 AM on weekdays. The noise includes loud music, footsteps, and what sounds like furniture being moved repeatedly.\n\nI have attempted to resolve this informally by speaking with the tenant directly, but the behaviour has continued without improvement. As a long-term resident of this building, I would appreciate your assistance in addressing this matter in accordance with the building\'s noise policy.\n\nI am available to speak at your convenience and can provide dates and times of the specific incidents if needed.\n\nSincerely,\nJames Kowalski\nUnit 3B'),

('11111111-0001-0002-0001-000000000001'::uuid,
 'reading','R1',2,'mcq',
 'Email — Request to Renew a Lease Early',
 'Read the email below, then answer the questions.',
 'Residential — Tenant to Landlord','easy',
 E'Subject: Early Lease Renewal — Unit 12\n\nDear Mr. Patterson,\n\nI hope you are well. I am writing to express my interest in renewing my lease for Unit 12 before the current term ends on September 30th. I have been a tenant here for four years and would like to continue living in the building.\n\nI would prefer to lock in a renewal now to avoid any uncertainty about my housing situation. If possible, I would appreciate discussing the new rental rate at your earliest convenience, as I am aware that market rents have increased since my last renewal.\n\nPlease let me know your availability for a brief call or meeting. I am flexible and happy to work around your schedule.\n\nThank you for your time.\n\nBest regards,\nPriya Sharma\nUnit 12'),

('11111111-0001-0003-0001-000000000001'::uuid,
 'reading','R1',3,'mcq',
 'Email — Complaint About Renovation Noise and Dust',
 'Read the email below, then answer the questions.',
 'Commercial Building — Tenant Complaint','medium',
 E'Subject: Disruption from Ongoing Renovation — Suite 305\n\nDear Building Manager,\n\nI am writing to formally raise concerns about the renovation work currently taking place on the fourth floor of our building. While I understand that improvements to the building are necessary, the noise and dust generated by the work are significantly impacting my ability to conduct business from Suite 305.\n\nThe drilling and demolition begin as early as 7:00 AM and often continue until after 6:00 PM, well beyond what I understand to be the approved working hours of 8:00 AM to 5:00 PM. In addition, fine dust has been entering our suite through the ventilation system, causing discomfort to my staff and potential damage to our equipment.\n\nI am requesting that the contractor strictly adhere to the approved working hours and that the ventilation issue be addressed immediately. I would also appreciate being kept informed of the renovation timeline so that we can make appropriate arrangements.\n\nI look forward to your prompt response.\n\nSincerely,\nDavid Nguyen\nSuite 305'),

('11111111-0001-0004-0001-000000000001'::uuid,
 'reading','R1',4,'mcq',
 'Letter — Notice to Vacate from Landlord',
 'Read the letter below, then answer the questions.',
 'Legal — Landlord Notice','hard',
 E'Date: February 15\n\nDear Ms. Chen,\n\nThis letter serves as formal notice that your tenancy at 88 Birchwood Avenue, Unit 7, will be terminated effective April 30th of this year. This notice is being issued pursuant to Section 48 of the Residential Tenancies Act, which permits a landlord to recover possession of a rental unit for the purpose of personal use by the landlord or an immediate family member.\n\nOur records confirm that you have been a tenant since March 2019 and your current monthly rent is $1,650. As required by law, you are entitled to one month''s compensation equivalent to your monthly rent, which will be applied as a credit against your April rent payment.\n\nIf you have any questions or wish to discuss this matter, please contact our office at the number below. Should you choose to dispute this notice, you have the right to file an application with the Landlord and Tenant Board within the prescribed time period.\n\nSincerely,\nHarold Forsythe\nProperty Management, Birchwood Residences'),

('11111111-0001-0005-0001-000000000001'::uuid,
 'reading','R1',5,'mcq',
 'Email — Formal Complaint to a Retail Company',
 'Read the email below, then answer the questions.',
 'Consumer — Customer Complaint','advanced',
 E'Subject: Formal Complaint — Order #47821 / Damaged Item and Unfulfilled Replacement Promise\n\nTo Whom It May Concern,\n\nI am writing to formally document my dissatisfaction with the handling of a recent order and to request a satisfactory resolution. My order (#47821), placed on January 8th, arrived on January 14th with the primary item — a glass display cabinet — damaged beyond use. Three panels were cracked, and the metal frame was visibly bent.\n\nI contacted your customer service team on January 15th and was assured by your representative, who identified herself as "Sarah," that a replacement unit would be dispatched within five to seven business days. It has now been three weeks since that conversation, and I have received neither the replacement nor any follow-up communication.\n\nI have made two additional attempts to contact your support line, both of which resulted in holds exceeding forty-five minutes and no resolution. At this point, I am formally requesting either an immediate replacement shipment with express delivery, or a full refund of the purchase price of $389. If I do not receive a satisfactory response within five business days of this email, I will escalate this matter to the Better Business Bureau and my credit card provider.\n\nI trust this matter will receive the attention it warrants.\n\nSincerely,\nMargaret O''Brien');

-- R1 Questions
INSERT INTO questions (set_id, question_order, question_type, question_text, options, correct_index, explanation) VALUES

-- Set 1
('11111111-0001-0001-0001-000000000001'::uuid,1,'mcq',
 'Who is James Kowalski writing to?',
 '["A) The tenant in Unit 4B","B) The building''s property manager","C) A city noise inspector","D) His next-door neighbour"]',
 1,'The email is addressed "Dear Ms. Harrington." James is requesting her help enforcing the building noise policy — her role is property manager.'),
('11111111-0001-0001-0001-000000000001'::uuid,2,'mcq',
 'At what times does the disturbance occur?',
 '["A) Weekday mornings 6–9 AM","B) Weekday evenings 9–11 PM","C) Late at night between 11 PM and 2 AM on weekdays","D) Throughout the day on weekends"]',
 2,'James states clearly: "specifically between 11:00 PM and 2:00 AM on weekdays."'),
('11111111-0001-0001-0001-000000000001'::uuid,3,'mcq',
 'Why does James mention speaking with the upstairs tenant?',
 '["A) To prove the tenant is hostile","B) To show he tried to solve the issue before escalating","C) To ask the manager to speak to the tenant directly","D) To prove the noise is intentional"]',
 1,'He says he "attempted to resolve this informally." This shows he escalated only after the informal approach failed.'),
('11111111-0001-0001-0001-000000000001'::uuid,4,'mcq',
 'What does James offer to provide to support his complaint?',
 '["A) A signed statement from other neighbours","B) A video recording of the noise","C) Specific dates and times of the incidents","D) A copy of the building noise policy"]',
 2,'James writes: "I can provide dates and times of the specific incidents if needed."'),
('11111111-0001-0001-0001-000000000001'::uuid,5,'mcq',
 'Which best describes the tone and purpose of this email?',
 '["A) Threatening — warning of legal action","B) Casual — informally updating the manager","C) Formal and measured — professionally escalating an unresolved issue","D) Apologetic — sorry for causing a dispute"]',
 2,'The language is formal and restrained throughout. The purpose is professional escalation after an informal attempt failed.'),

-- Set 2
('11111111-0001-0002-0001-000000000001'::uuid,1,'mcq',
 'Why is Priya writing this email?',
 '["A) To complain about a rent increase","B) To request an early lease renewal","C) To give notice that she is moving out","D) To ask for repairs to her unit"]',
 1,'The subject line and opening sentence make clear she wants to renew her lease before it expires.'),
('11111111-0001-0002-0001-000000000001'::uuid,2,'mcq',
 'When does Priya''s current lease end?',
 '["A) December 31st","B) June 30th","C) September 30th","D) March 31st"]',
 2,'Priya states: "before the current term ends on September 30th."'),
('11111111-0001-0002-0001-000000000001'::uuid,3,'mcq',
 'What is Priya''s main reason for wanting to renew early?',
 '["A) She wants to negotiate a lower rent","B) She wants to avoid uncertainty about her housing","C) She is concerned the landlord will rent to someone else","D) Her employer requires a stable address"]',
 1,'She writes: "I would prefer to lock in a renewal now to avoid any uncertainty about my housing situation."'),
('11111111-0001-0002-0001-000000000001'::uuid,4,'mcq',
 'Why does Priya mention that market rents have increased?',
 '["A) To argue that her current rent is too high","B) To show she understands the landlord may raise the rate","C) To threaten to report the landlord to a housing authority","D) To compare her building to others nearby"]',
 1,'She says she is "aware that market rents have increased" — showing she expects a higher rate and is signalling she is prepared to discuss it, not resist it.'),
('11111111-0001-0002-0001-000000000001'::uuid,5,'mcq',
 'What impression does Priya create by saying she is "flexible and happy to work around your schedule"?',
 '["A) She is uncertain whether she actually wants to renew","B) She is pressuring the landlord to respond immediately","C) She is being cooperative to encourage a positive response","D) She has no other options and is worried"]',
 2,'The phrase is a politeness strategy — signalling flexibility to make it easier for the landlord to agree to meet. It creates a cooperative, low-pressure tone.'),

-- Set 3
('11111111-0001-0003-0001-000000000001'::uuid,1,'mcq',
 'What is the main purpose of this email?',
 '["A) To request a rent reduction for disruption","B) To formally complain about renovation noise and dust exceeding approved limits","C) To report a health and safety violation to the city","D) To ask the building manager to stop the renovation entirely"]',
 1,'David is formally raising concerns about noise beyond approved hours and dust entering through ventilation — this is a complaint requesting specific corrective action.'),
('11111111-0001-0003-0001-000000000001'::uuid,2,'mcq',
 'What are the approved working hours mentioned in the email?',
 '["A) 7:00 AM to 6:00 PM","B) 9:00 AM to 5:00 PM","C) 8:00 AM to 5:00 PM","D) 8:00 AM to 6:00 PM"]',
 2,'David states: "the approved working hours of 8:00 AM to 5:00 PM."'),
('11111111-0001-0003-0001-000000000001'::uuid,3,'mcq',
 'How is the dust reaching Suite 305?',
 '["A) Through gaps under the office door","B) Through the ventilation system","C) Through cracks in the ceiling","D) Through an open window facing the work area"]',
 1,'David writes: "fine dust has been entering our suite through the ventilation system."'),
('11111111-0001-0003-0001-000000000001'::uuid,4,'mcq',
 'David asks to be kept informed of the renovation timeline. Why is this request significant?',
 '["A) He wants to report the project to the city","B) He plans to terminate his lease if work continues","C) He needs to make arrangements to manage the disruption to his business","D) He suspects the renovation is taking longer than planned"]',
 2,'He writes: "so that we can make appropriate arrangements" — meaning advance notice allows him to plan around the disruption.'),
('11111111-0001-0003-0001-000000000001'::uuid,5,'mcq',
 'The phrase "formally raise concerns" in the first paragraph signals which of the following?',
 '["A) David has already contacted a lawyer","B) This is David''s first communication with the building manager on this topic","C) David is establishing an official record, suggesting he may escalate if not resolved","D) David is unsure whether his complaint is valid"]',
 2,'Using "formally" signals this is not a casual mention — it suggests David is creating a documented record, which typically precedes escalation if ignored.'),

-- Set 4
('11111111-0001-0004-0001-000000000001'::uuid,1,'mcq',
 'Why is Ms. Chen being asked to vacate?',
 '["A) She has not paid her rent","B) The landlord wants the unit for personal or family use","C) She has violated her lease terms","D) The building is being sold"]',
 1,'The letter states it is issued "for the purpose of personal use by the landlord or an immediate family member" under Section 48 of the Residential Tenancies Act.'),
('11111111-0001-0004-0001-000000000001'::uuid,2,'mcq',
 'What compensation is Ms. Chen entitled to?',
 '["A) Two months'' free rent","B) A refund of her last month''s deposit","C) One month''s rent as a credit on her April payment","D) A moving allowance paid directly to her"]',
 2,'The letter states: "you are entitled to one month''s compensation equivalent to your monthly rent, which will be applied as a credit against your April rent payment."'),
('11111111-0001-0004-0001-000000000001'::uuid,3,'mcq',
 'When must Ms. Chen vacate the unit?',
 '["A) March 31st","B) February 28th","C) April 30th","D) May 15th"]',
 2,'The letter states: "your tenancy… will be terminated effective April 30th of this year."'),
('11111111-0001-0004-0001-000000000001'::uuid,4,'mcq',
 'What option does the letter mention if Ms. Chen wants to challenge the notice?',
 '["A) She can refuse to leave and call the police","B) She can file an application with the Landlord and Tenant Board","C) She can negotiate a new lease directly with the landlord","D) She can contact the city housing authority"]',
 1,'The letter states: "you have the right to file an application with the Landlord and Tenant Board within the prescribed time period."'),
('11111111-0001-0004-0001-000000000001'::uuid,5,'mcq',
 'The phrase "pursuant to Section 48 of the Residential Tenancies Act" serves which purpose in the letter?',
 '["A) It warns Ms. Chen that failure to comply is a criminal offence","B) It establishes that the notice is legally grounded and formally enforceable","C) It indicates the landlord has already filed a case at the Tribunal","D) It is included only as a courtesy to explain the reason"]',
 1,'Citing specific legislation establishes the legal basis for the notice — it signals the action is formally grounded in law.'),

-- Set 5
('11111111-0001-0005-0001-000000000001'::uuid,1,'mcq',
 'What was wrong with the item Margaret received?',
 '["A) The wrong item was delivered","B) The item arrived late with no explanation","C) The glass panels were cracked and the frame was bent","D) The item was missing parts and required assembly"]',
 2,'Margaret describes: "three panels were cracked, and the metal frame was visibly bent."'),
('11111111-0001-0005-0001-000000000001'::uuid,2,'mcq',
 'What did the customer service representative promise on January 15th?',
 '["A) A full refund within five business days","B) A replacement would be sent within five to seven business days","C) A technician would come to repair the item","D) A store credit would be applied to her account"]',
 1,'The representative promised "a replacement unit would be dispatched within five to seven business days."'),
('11111111-0001-0005-0001-000000000001'::uuid,3,'mcq',
 'What two resolutions does Margaret request?',
 '["A) A repair or store credit","B) A replacement with express delivery, or a full refund of $389","C) An apology letter and a discount on a future order","D) A refund of $389 or free delivery on her next purchase"]',
 1,'She writes: "I am formally requesting either an immediate replacement shipment with express delivery, or a full refund of the purchase price of $389."'),
('11111111-0001-0005-0001-000000000001'::uuid,4,'mcq',
 'Margaret mentions the Better Business Bureau and her credit card provider. What is the purpose of this?',
 '["A) To inform the company she has already filed a complaint","B) To threaten escalation if her complaint is not resolved within five business days","C) To suggest the company is already under investigation","D) To show she is aware of her consumer rights in general"]',
 1,'She says "If I do not receive a satisfactory response within five business days… I will escalate." This is a conditional threat intended to prompt action.'),
('11111111-0001-0005-0001-000000000001'::uuid,5,'mcq',
 'The phrase "I trust this matter will receive the attention it warrants" is an example of which rhetorical strategy?',
 '["A) An apology for being demanding","B) A polite but firm closing that implies the company has an obligation to respond","C) A sincere expression of confidence in the company","D) A suggestion that the matter is not very serious"]',
 1,'This is a formal closing formula that sounds polite but carries implicit pressure — "the attention it warrants" implies the complaint is serious.');


-- ─────────────────────────────────────────────────────────────────────────
-- R2 — APPLY A DIAGRAM  (5 sets × 8 Q: 5 fill_blank + 3 MCQ = 40 questions)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO practice_sets (id, section, part, set_number, set_type, set_title, instruction, scenario, difficulty, passage, diagram_html)
VALUES

('22222222-0002-0001-0002-000000000002'::uuid,
 'reading','R2',1,'diagram_email',
 'Downtown Bike Rentals',
 'Read the following email. Use the rental guide to fill in the blanks. Then answer the questions below.',
 'Practical — Leisure Planning','easy',
 E'Hey Derek,\n\nGreat to hear you\'re heading downtown with Lisa and Jake this Saturday and Sunday! I had a blast cycling around last weekend, so I\'m glad you want to give it a go.\n\nOne thing to watch out for: Jake is only 14, so he won''t be able to rent from Wheelhouse since 1___. You''d have to go with Pedal City for him — they have options for younger riders. Speaking of Pedal City, I noticed they''re right beside 2___, which is convenient if you''re coming by boat.\n\nNow, if you and Lisa want bikes for both days, the weekend bundle at Wheelhouse actually saves you 3___ compared to paying for two separate full days at Pedal City. Plus there''s a little freebie thrown in with the deal. But since Jake can''t rent there, you might want to keep things simple and stick to one shop.\n\nLisa mentioned she just wants to take it easy and soak in the waterfront scenery without having to figure out routes — 4___ would be ideal for her. She could join the afternoon group while you and Jake ride around on your own.\n\nBy the way, I wanted to call Wheelhouse to confirm what time they close, but 5___. You''ll have to look it up online instead.\n\nTalk soon,\nTom',
 '<table class="r2-table">
  <thead><tr><th>Shop</th><th>Min. Age</th><th>Half Day</th><th>Full Day</th><th>Weekend Bundle</th><th>Guided Tour</th><th>Location</th><th>Phone</th></tr></thead>
  <tbody>
    <tr><td>Wheelhouse Cycles</td><td>16+</td><td>$18</td><td>$30</td><td>$50 (incl. water bottle)</td><td>No</td><td>Near ferry terminal</td><td>Listed online</td></tr>
    <tr><td>Pedal City</td><td>No min.</td><td>$22</td><td>$35</td><td>$65</td><td>Yes – 10 AM &amp; 2 PM</td><td>Near marina</td><td>416-555-0192</td></tr>
  </tbody>
</table>'),

('22222222-0002-0002-0002-000000000002'::uuid,
 'reading','R2',2,'diagram_email',
 'Maplewood Recreation Centre — Program Guide',
 'Read the following email. Use the program guide to fill in the blanks. Then answer the questions below.',
 'Community Services — Program Registration','easy',
 E'Hi Priya,\n\nThanks for asking about programs at Maplewood Rec Centre! I looked through the guide for you.\n\nFor your son Aiden (he''s 8, right?), the Swim Lessons – Beginner program runs 1___ and would be perfect for him at his age. He''d need to be registered in advance though, so don''t leave it too late.\n\nFor your mom, the Senior Fitness class is 2___, which I think she''ll love. Best of all, 3___. No need to book — she can just show up.\n\nYou mentioned you want to try something creative in the evenings. The Adult Pottery class meets on 4___ from 7 to 9 PM in the Craft Room. It''s $20 per session. Make sure you register ahead of time.\n\nOh, and if your nephew visits on Fridays, Teen Basketball runs in the 5___ from 6 to 8 PM — no registration needed.\n\nHope this helps!\nDana',
 '<table class="r2-table">
  <thead><tr><th>Program</th><th>Day</th><th>Time</th><th>Ages</th><th>Fee (per session)</th><th>Registration</th><th>Room</th></tr></thead>
  <tbody>
    <tr><td>Family Yoga</td><td>Saturday</td><td>9:00–10:00 AM</td><td>All ages</td><td>$12</td><td>Required</td><td>Studio A</td></tr>
    <tr><td>Swim Lessons – Beginner</td><td>Monday &amp; Wednesday</td><td>4:00–4:45 PM</td><td>5–12</td><td>$15</td><td>Required</td><td>Pool</td></tr>
    <tr><td>Senior Fitness</td><td>Tuesday &amp; Thursday</td><td>10:00–11:00 AM</td><td>55+</td><td>Free</td><td>Walk-in</td><td>Gym B</td></tr>
    <tr><td>Teen Basketball</td><td>Friday</td><td>6:00–8:00 PM</td><td>13–17</td><td>$8</td><td>Walk-in</td><td>Gymnasium</td></tr>
    <tr><td>Adult Pottery</td><td>Thursday</td><td>7:00–9:00 PM</td><td>18+</td><td>$20</td><td>Required</td><td>Craft Room</td></tr>
  </tbody>
</table>'),

('22222222-0002-0003-0002-000000000002'::uuid,
 'reading','R2',3,'diagram_email',
 'Harborview Hotel — Guest Amenities',
 'Read the following email. Use the hotel amenity guide to fill in the blanks. Then answer the questions below.',
 'Travel — Hotel Services','medium',
 E'Hi Marcus,\n\nSo glad you''re joining us at Harborview next week! I stayed there last month and wanted to give you a few tips before you arrive.\n\nFirst, the rooftop pool is gorgeous — it''s on 1___ and is free for guests. You don''t need to book in advance, but remember 2___. I wish I had known that when I arrived!\n\nIf you''re an early riser, the Fitness Centre is great — it opens at 3___, so you can squeeze in a workout before breakfast. Towels are not provided there, FYI — you''ll need to bring a lock for the lockers.\n\nFor dinner, the Harbour Restaurant is excellent. I''d recommend booking a table in advance. Keep in mind that 4___ — so if you''re not on that plan, you''ll be paying à la carte.\n\nFinally, if you want to book a spa treatment, do it 5___ — they require a full day''s notice for reservations.\n\nEnjoy your stay!\nClara',
 '<table class="r2-table">
  <thead><tr><th>Facility</th><th>Hours</th><th>Floor</th><th>Fee</th><th>Reservation</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>Rooftop Pool</td><td>7 AM – 10 PM</td><td>12</td><td>Free (guests)</td><td>Not required</td><td>Towels provided; no outside food</td></tr>
    <tr><td>Fitness Centre</td><td>5 AM – 11 PM</td><td>2</td><td>Free (guests)</td><td>Not required</td><td>Bring your own lock for lockers</td></tr>
    <tr><td>Harbour Restaurant</td><td>7 AM – 10 PM</td><td>1</td><td>À la carte</td><td>Recommended for dinner</td><td>Breakfast included for guests on full-board plan</td></tr>
    <tr><td>Business Centre</td><td>8 AM – 8 PM</td><td>3</td><td>$5/hour printing; Wi-Fi free</td><td>Not required</td><td>Printing, scanning, computers available</td></tr>
    <tr><td>Spa &amp; Wellness</td><td>9 AM – 7 PM</td><td>11</td><td>Prices vary</td><td>Required (24 hrs notice)</td><td>Discounts available for 3+ day stays</td></tr>
  </tbody>
</table>'),

('22222222-0002-0004-0002-000000000002'::uuid,
 'reading','R2',4,'diagram_email',
 'Northgate Public Library — Branch & Services Guide',
 'Read the following email. Use the library guide to fill in the blanks. Then answer the questions below.',
 'Public Services — Library Information','hard',
 E'Hi Jenna,\n\nI looked into the library branches for you — here''s what I found.\n\nFor your project, you need to use the 3D printer. The Central Branch has one, but 1___. The Eastview Branch also has one — you can use it 2___, which is handy if you''re in a rush.\n\nYou mentioned you only have a physical library card, not an eCard. Just so you know, 3___ — so you''d need to visit in person.\n\nIf you want to study on Sunday, 4___ is your best option since both the Central Branch and Eastview Branch are open that day, but most branches are closed. The Westside and Northgate branches are both closed Sundays.\n\nFinally, you mentioned taking transit. If you''re coming from downtown, the Central Branch is closest to 5___.\n\nGood luck with the project!\nRobert',
 '<table class="r2-table">
  <thead><tr><th>Branch</th><th>Hours (Mon–Fri)</th><th>Sat</th><th>Sun</th><th>3D Printer</th><th>Study Rooms</th><th>eCard Access</th><th>Nearest Transit</th></tr></thead>
  <tbody>
    <tr><td>Central Branch</td><td>9 AM – 9 PM</td><td>10 AM – 6 PM</td><td>12–5 PM</td><td>Yes (book online)</td><td>6 rooms (bookable)</td><td>Yes</td><td>King St. Station</td></tr>
    <tr><td>Westside Branch</td><td>10 AM – 7 PM</td><td>10 AM – 5 PM</td><td>Closed</td><td>No</td><td>2 rooms (walk-in)</td><td>Yes</td><td>Westside Mall stop</td></tr>
    <tr><td>Northgate Branch</td><td>9 AM – 8 PM</td><td>10 AM – 4 PM</td><td>Closed</td><td>No</td><td>None</td><td>No</td><td>Northgate Terminal</td></tr>
    <tr><td>Eastview Branch</td><td>11 AM – 7 PM</td><td>11 AM – 5 PM</td><td>11 AM – 4 PM</td><td>Yes (walk-in only)</td><td>4 rooms (bookable)</td><td>Yes</td><td>Eastview Dr. bus</td></tr>
  </tbody>
</table>'),

('22222222-0002-0005-0002-000000000002'::uuid,
 'reading','R2',5,'diagram_email',
 'Greenfield Corp — Staff Training Schedule Q2',
 'Read the following email. Use the training schedule to fill in the blanks. Then answer the questions below.',
 'Corporate — Staff Development','advanced',
 E'Hi Sandra,\n\nJust a heads-up about the Q2 training schedule — a few things worth flagging for your team.\n\nFirst, 1___ is mandatory for all staff and takes place on April 8th. Make sure everyone on your team attends — there are no exceptions.\n\nFor managers, 2___ is listed as mandatory for that group, running all day on April 22nd. Given it''s a full-day session, you may want to plan coverage for that day.\n\nIf anyone on your team wants to take Advanced Excel, they should know 3___ — so anyone who hasn''t done that yet won''t be eligible.\n\nThe Customer Service Excellence course has the most availability with 4___ seats, which should make it easier for your whole team to enroll if they''re interested.\n\nFinally, I noticed that 5___ of the five courses are delivered online, so those staff will need a reliable internet connection and a quiet workspace on those days.\n\nLet me know if you have questions.\nTom',
 '<table class="r2-table">
  <thead><tr><th>Course</th><th>Date</th><th>Time</th><th>Delivery</th><th>Seats</th><th>Mandatory</th><th>Facilitator</th><th>Prerequisites</th></tr></thead>
  <tbody>
    <tr><td>Data Privacy &amp; Compliance</td><td>April 8</td><td>9 AM – 12 PM</td><td>In-person</td><td>20</td><td>Yes (all staff)</td><td>HR Dept.</td><td>None</td></tr>
    <tr><td>Advanced Excel</td><td>April 15</td><td>1 PM – 4 PM</td><td>Online</td><td>15</td><td>No</td><td>External – TechLearn</td><td>Basic Excel</td></tr>
    <tr><td>Leadership Essentials</td><td>April 22</td><td>9 AM – 5 PM</td><td>In-person</td><td>12</td><td>No (managers only)</td><td>Clara Vance</td><td>None</td></tr>
    <tr><td>Customer Service Excellence</td><td>May 6</td><td>10 AM – 1 PM</td><td>Online</td><td>25</td><td>No</td><td>HR Dept.</td><td>None</td></tr>
    <tr><td>Project Management Basics</td><td>May 13</td><td>9 AM – 4 PM</td><td>In-person</td><td>18</td><td>No</td><td>Paul Renner</td><td>None</td></tr>
  </tbody>
</table>');

-- R2 Questions
INSERT INTO questions (set_id, question_order, question_type, question_text, options, correct_index, explanation) VALUES

-- Set 1 — Bike Rentals
('22222222-0002-0001-0002-000000000002'::uuid,1,'fill_blank',
 'Jake is only 14, so he won''t be able to rent from Wheelhouse since 1___.',
 '["A) they only offer guided tours","B) their minimum age requirement is 16","C) they are closed on weekends","D) they only rent to adults with a credit card"]',
 1,'The diagram shows Wheelhouse Cycles has a minimum age of 16. Jake is 14, so he does not meet this requirement.'),
('22222222-0002-0001-0002-000000000002'::uuid,2,'fill_blank',
 'Pedal City is right beside 2___.',
 '["A) the ferry terminal","B) City Hall","C) the marina","D) the central park entrance"]',
 2,'The diagram shows Pedal City is located near the marina.'),
('22222222-0002-0001-0002-000000000002'::uuid,3,'fill_blank',
 'The weekend bundle at Wheelhouse saves you 3___ compared to two separate full days at Pedal City.',
 '["A) $5","B) $10","C) $15","D) $20"]',
 3,'Two full days at Pedal City = $35 × 2 = $70. The Wheelhouse weekend bundle = $50. Saving = $70 − $50 = $20.'),
('22222222-0002-0001-0002-000000000002'::uuid,4,'fill_blank',
 '4___ would be ideal for Lisa — she could join the afternoon group.',
 '["A) Renting from Wheelhouse for both days","B) The 2 PM guided tour at Pedal City","C) The 10 AM guided tour at Pedal City","D) A solo cycling route along the waterfront"]',
 1,'The diagram shows Pedal City offers guided tours at 10 AM and 2 PM. Tom suggests Lisa join the afternoon group — the 2 PM tour.'),
('22222222-0002-0001-0002-000000000002'::uuid,5,'fill_blank',
 'Tom wanted to call Wheelhouse but 5___.',
 '["A) the line was busy all day","B) they do not have a listed phone number","C) the shop was already closed","D) he lost his phone"]',
 1,'The diagram shows Wheelhouse''s phone is listed as "Listed online" — no direct phone number is provided in the guide, so Tom cannot call them.'),
('22222222-0002-0001-0002-000000000002'::uuid,6,'mcq',
 'What is the main purpose of Tom''s email?',
 '["A) To invite Derek to go cycling with him this weekend","B) To help Derek plan a bike rental trip using the guide Tom sent","C) To compare the prices of all rental shops in the city","D) To warn Derek that Jake will not be allowed to rent a bike anywhere"]',
 1,'Tom is responding to Derek''s plans and using the rental guide to help him make decisions — his purpose is practical guidance, not an invitation or a warning.'),
('22222222-0002-0001-0002-000000000002'::uuid,7,'mcq',
 'What does Tom refer to as the "little freebie" included with the Wheelhouse weekend deal?',
 '["A) A free guided tour","B) A free half-day rental on Monday","C) A water bottle","D) A discount coupon for next visit"]',
 2,'The diagram shows the Wheelhouse weekend bundle includes a water bottle. Tom calls this the "little freebie."'),
('22222222-0002-0001-0002-000000000002'::uuid,8,'mcq',
 'Why does Tom suggest the afternoon departure time for Lisa''s guided tour?',
 '["A) Morning tours are fully booked","B) The afternoon tour is cheaper","C) Lisa said she wants to take it easy and enjoy the scenery at a relaxed pace","D) Tom and Jake plan to use the bikes in the morning"]',
 2,'Tom says Lisa "just wants to take it easy and soak in the waterfront scenery without having to figure out routes" — the afternoon tour suits this preference.'),

-- Set 2 — Recreation Centre
('22222222-0002-0002-0002-000000000002'::uuid,1,'fill_blank',
 'The Swim Lessons program for Aiden runs 1___.',
 '["A) Saturday mornings","B) Monday and Wednesday afternoons","C) Tuesday and Thursday mornings","D) Friday evenings"]',
 1,'The guide shows Swim Lessons – Beginner runs Monday & Wednesday, 4:00–4:45 PM.'),
('22222222-0002-0002-0002-000000000002'::uuid,2,'fill_blank',
 'The Senior Fitness class is 2___.',
 '["A) on Saturdays in Studio A","B) on Tuesday and Thursday mornings in Gym B","C) on Mondays only, in the pool","D) on Fridays in the Gymnasium"]',
 1,'The guide shows Senior Fitness runs Tuesday & Thursday, 10:00–11:00 AM, in Gym B.'),
('22222222-0002-0002-0002-000000000002'::uuid,3,'fill_blank',
 'Best of all, 3___ for the Senior Fitness class.',
 '["A) the session lasts two hours","B) refreshments are provided","C) it is free","D) a certified trainer leads every class"]',
 2,'The guide shows the Senior Fitness fee is "Free."'),
('22222222-0002-0002-0002-000000000002'::uuid,4,'fill_blank',
 'The Adult Pottery class meets on 4___.',
 '["A) Monday","B) Tuesday","C) Wednesday","D) Thursday"]',
 3,'The guide shows Adult Pottery is on Thursday evenings.'),
('22222222-0002-0002-0002-000000000002'::uuid,5,'fill_blank',
 'Teen Basketball runs in the 5___.',
 '["A) Studio A","B) Craft Room","C) Pool","D) Gymnasium"]',
 3,'The guide shows Teen Basketball is held in the Gymnasium.'),
('22222222-0002-0002-0002-000000000002'::uuid,6,'mcq',
 'Which programs require advance registration?',
 '["A) Senior Fitness and Teen Basketball","B) Family Yoga, Swim Lessons, and Adult Pottery","C) All programs listed in the guide","D) Swim Lessons and Senior Fitness only"]',
 1,'The guide marks Family Yoga, Swim Lessons, and Adult Pottery as "Required." Senior Fitness and Teen Basketball are walk-in.'),
('22222222-0002-0002-0002-000000000002'::uuid,7,'mcq',
 'What is the purpose of Dana''s email?',
 '["A) To advertise the recreation centre to new members","B) To help Priya find suitable programs for herself and her family","C) To remind Priya about a registration deadline she missed","D) To describe all the programs offered at the centre"]',
 1,'Dana is responding to Priya''s specific questions about programs for different family members.'),
('22222222-0002-0002-0002-000000000002'::uuid,8,'mcq',
 'Which program could both Priya''s 8-year-old son and her 55-year-old mother attend at the same time on a Tuesday?',
 '["A) Family Yoga and Senior Fitness","B) Swim Lessons and Senior Fitness","C) Teen Basketball and Adult Pottery","D) There is no overlap — their programs run on different days"]',
 3,'Swim Lessons runs Monday & Wednesday. Senior Fitness runs Tuesday & Thursday. There is no shared Tuesday program for both.'),

-- Set 3 — Hotel Amenities
('22222222-0002-0003-0002-000000000002'::uuid,1,'fill_blank',
 'The rooftop pool is on 1___.',
 '["A) Floor 2","B) Floor 11","C) Floor 12","D) Floor 3"]',
 2,'The guide shows the Rooftop Pool is on Floor 12.'),
('22222222-0002-0003-0002-000000000002'::uuid,2,'fill_blank',
 'Remember 2___ at the rooftop pool.',
 '["A) to bring your own towel","B) to book in advance","C) not to bring outside food","D) to wear hotel-issued swimwear"]',
 2,'The guide notes: "no outside food" at the Rooftop Pool.'),
('22222222-0002-0003-0002-000000000002'::uuid,3,'fill_blank',
 'The Fitness Centre opens at 3___.',
 '["A) 6 AM","B) 5 AM","C) 7 AM","D) 8 AM"]',
 1,'The guide shows the Fitness Centre hours are 5 AM – 11 PM.'),
('22222222-0002-0003-0002-000000000002'::uuid,4,'fill_blank',
 'At the Harbour Restaurant, 4___ — so if you''re not on that plan, you''ll pay à la carte.',
 '["A) a reservation is always required","B) breakfast is only included for guests on the full-board plan","C) the restaurant closes at 9 PM","D) tipping is included in all bills"]',
 1,'The guide notes: "Breakfast included for guests on full-board plan."'),
('22222222-0002-0003-0002-000000000002'::uuid,5,'fill_blank',
 'Book a spa treatment 5___ — they require a full day''s notice.',
 '["A) the same morning you want to go","B) at least 24 hours in advance","C) through the hotel app only","D) only on weekdays"]',
 1,'The guide shows the Spa requires reservations with "24 hrs notice."'),
('22222222-0002-0003-0002-000000000002'::uuid,6,'mcq',
 'What is the main purpose of Clara''s email?',
 '["A) To describe the hotel''s policies in full detail","B) To share personal tips to help Marcus make the most of his stay","C) To warn Marcus about poor service at the hotel","D) To compare Harborview with other hotels she has stayed in"]',
 1,'Clara uses her personal experience to give Marcus practical, friendly tips — her goal is to help him have a good stay.'),
('22222222-0002-0003-0002-000000000002'::uuid,7,'mcq',
 'Which facility requires a reservation and gives discounts for longer stays?',
 '["A) Rooftop Pool","B) Harbour Restaurant","C) Business Centre","D) Spa & Wellness"]',
 3,'The guide shows the Spa requires a reservation (24 hrs notice) and offers "Discounts available for 3+ day stays."'),
('22222222-0002-0003-0002-000000000002'::uuid,8,'mcq',
 'Marcus wants to print documents at 8:30 PM. Is the Business Centre available to him?',
 '["A) Yes — the Business Centre is open until 11 PM","B) No — it closes at 8 PM","C) Yes — but only for Wi-Fi, not printing","D) No — printing requires a reservation made in advance"]',
 1,'The guide shows the Business Centre hours are 8 AM – 8 PM. At 8:30 PM it is already closed.'),

-- Set 4 — Library Branches
('22222222-0002-0004-0002-000000000002'::uuid,1,'fill_blank',
 'The Central Branch 3D printer requires that 1___.',
 '["A) you bring your own filament","B) the printer is only available on weekdays","C) you book it online in advance","D) you have a paid premium library membership"]',
 2,'The guide shows the Central Branch 3D printer requires booking online ("Yes (book online)").'),
('22222222-0002-0004-0002-000000000002'::uuid,2,'fill_blank',
 'The Eastview Branch 3D printer can be used 2___.',
 '["A) only after booking 48 hours in advance","B) on a walk-in basis","C) only for members with an eCard","D) on weekends only"]',
 1,'The guide shows Eastview''s 3D printer is "walk-in only."'),
('22222222-0002-0004-0002-000000000002'::uuid,3,'fill_blank',
 '3___ — so you''d need to visit in person without an eCard.',
 '["A) the Central Branch does not accept physical cards","B) the Northgate Branch does not offer eCard access","C) all branches require an eCard for 3D printer use","D) the Westside Branch is the only branch without eCard access"]',
 1,'The guide shows the Northgate Branch has "No" eCard access.'),
('22222222-0002-0004-0002-000000000002'::uuid,4,'fill_blank',
 'If you want to study on Sunday, 4___ is your best option.',
 '["A) the Westside Branch","B) the Northgate Branch","C) the Central Branch or Eastview Branch","D) any branch — they are all open on Sundays"]',
 2,'The guide shows only Central Branch (12–5 PM) and Eastview Branch (11 AM–4 PM) are open on Sundays.'),
('22222222-0002-0004-0002-000000000002'::uuid,5,'fill_blank',
 'The Central Branch is closest to 5___ for transit from downtown.',
 '["A) Northgate Terminal","B) Westside Mall stop","C) Eastview Dr. bus","D) King St. Station"]',
 3,'The guide shows the Central Branch nearest transit is King St. Station.'),
('22222222-0002-0004-0002-000000000002'::uuid,6,'mcq',
 'Jenna needs to use a 3D printer on a Sunday afternoon without booking in advance. Which branch should she go to?',
 '["A) Central Branch","B) Westside Branch","C) Northgate Branch","D) Eastview Branch"]',
 3,'Eastview Branch: open Sundays (11 AM–4 PM), has a 3D printer on a walk-in basis.'),
('22222222-0002-0004-0002-000000000002'::uuid,7,'mcq',
 'Which branch has the most study rooms available for booking?',
 '["A) Eastview Branch with 4 bookable rooms","B) Westside Branch with 2 walk-in rooms","C) Central Branch with 6 bookable rooms","D) Northgate Branch with no rooms"]',
 2,'The guide shows Central Branch has 6 bookable study rooms — the most of any branch.'),
('22222222-0002-0004-0002-000000000002'::uuid,8,'mcq',
 'Robert''s email is best described as:',
 '["A) A formal recommendation letter for library membership","B) A friendly, practical summary of relevant branch information tailored to Jenna''s specific needs","C) A complaint about inconsistent library services across branches","D) An official library system announcement about new services"]',
 1,'Robert uses casual, direct language and connects each piece of information to Jenna''s stated needs.'),

-- Set 5 — Corporate Training
('22222222-0002-0005-0002-000000000002'::uuid,1,'fill_blank',
 'The training that is mandatory for all staff is 1___.',
 '["A) Advanced Excel","B) Leadership Essentials","C) Data Privacy & Compliance","D) Project Management Basics"]',
 2,'The guide shows Data Privacy & Compliance is "Mandatory: Yes (all staff)."'),
('22222222-0002-0005-0002-000000000002'::uuid,2,'fill_blank',
 'For managers, 2___ is listed as mandatory for that group.',
 '["A) Project Management Basics","B) Leadership Essentials","C) Customer Service Excellence","D) Data Privacy & Compliance"]',
 1,'The guide shows Leadership Essentials is "Mandatory: No (managers only)" — mandatory for managers specifically.'),
('22222222-0002-0005-0002-000000000002'::uuid,3,'fill_blank',
 'For Advanced Excel, staff should know 3___ is a prerequisite.',
 '["A) Project Management experience","B) completing Customer Service Excellence first","C) Basic Excel","D) approval from HR"]',
 2,'The guide shows Advanced Excel has the prerequisite: "Basic Excel."'),
('22222222-0002-0005-0002-000000000002'::uuid,4,'fill_blank',
 'The Customer Service Excellence course has 4___ seats available.',
 '["A) 12","B) 15","C) 18","D) 25"]',
 3,'The guide shows Customer Service Excellence has 25 seats — the most of any course.'),
('22222222-0002-0005-0002-000000000002'::uuid,5,'fill_blank',
 '5___ of the five courses are delivered online.',
 '["A) One","B) Two","C) Three","D) Four"]',
 1,'Counting from the guide: Advanced Excel (Online), Customer Service Excellence (Online) = 2 online courses.'),
('22222222-0002-0005-0002-000000000002'::uuid,6,'mcq',
 'Why does Tom suggest Sandra plan coverage for April 22nd?',
 '["A) The office will be closed for renovations on that date","B) Leadership Essentials is a full-day session so managers may be unavailable","C) The company has a staff retreat scheduled that day","D) The Project Management course conflicts with regular meetings"]',
 1,'Tom says it''s a full-day session, so Sandra''s managers will be away all day in Leadership Essentials training.'),
('22222222-0002-0005-0002-000000000002'::uuid,7,'mcq',
 'A new staff member with no Excel experience wants to take Advanced Excel on April 15th. Based on the schedule, what is the problem?',
 '["A) The course is only available to managers","B) The course is mandatory and already fully booked","C) They do not meet the Basic Excel prerequisite","D) The course is in-person and they work remotely"]',
 2,'The guide lists "Basic Excel" as a prerequisite for Advanced Excel.'),
('22222222-0002-0005-0002-000000000002'::uuid,8,'mcq',
 'The phrase "there are no exceptions" regarding the mandatory training implies:',
 '["A) The HR department will not process complaints about the training","B) Every staff member is required to attend, regardless of role or schedule","C) The training content cannot be customised for different departments","D) Latecomers will not be admitted to the session"]',
 1,'Tom uses "no exceptions" to emphasise that Data Privacy & Compliance is required for all staff without exemptions.');


-- ─────────────────────────────────────────────────────────────────────────
-- R3 — INFORMATION  (5 sets × 5 MCQ = 25 questions)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO practice_sets (id, section, part, set_number, set_type, set_title, instruction, scenario, difficulty, passage)
VALUES

('33333333-0003-0001-0003-000000000003'::uuid,
 'reading','R3',1,'mcq',
 'The Rise of Urban Beekeeping in Canadian Cities',
 'Read the passage below, then answer the questions.',
 'General Interest — Environment','easy',
 E'Urban beekeeping has grown steadily across Canadian cities over the past decade, driven by a combination of environmental concern, community food initiatives, and changing municipal regulations. Cities like Toronto, Vancouver, and Montreal now permit residential beekeeping under specific conditions, and rooftop hives have become a visible presence in many downtown neighbourhoods.\n\nProponents argue that urban bees provide measurable ecological benefits. Because cities are often warmer than surrounding rural areas and contain a diverse range of flowering plants in gardens and parks, urban bees can actually thrive more consistently than their rural counterparts. Studies from several European cities have shown higher honey production per hive in urban environments compared to agricultural zones, largely because monoculture farming reduces the variety of plants available to rural bees.\n\nCritics, however, raise concerns about the welfare of bees kept in high-density areas. Without the biodiversity of natural landscapes, urban bees may face nutritional gaps if flowering sources are limited or seasonal. There are also concerns about the spread of disease between hives kept in close proximity, and about what happens to colonies when inexperienced hobby beekeepers abandon the practice.\n\nDespite these debates, urban beekeeping continues to expand. Many cities now offer training programs and community hive projects that allow residents to participate without managing a hive individually. Whether urban beekeeping represents a meaningful contribution to pollinator health or simply a well-intentioned hobby remains an open question — but its presence in Canadian cities shows no sign of diminishing.'),

('33333333-0003-0002-0003-000000000003'::uuid,
 'reading','R3',2,'mcq',
 'Minimum Wage in Canada: A Provincial Patchwork',
 'Read the passage below, then answer the questions.',
 'Social Policy — Labour','easy',
 E'Unlike many countries where a single federal minimum wage applies to all workers, Canada sets minimum wages at the provincial and territorial level. As of 2024, rates range from approximately $15.00 per hour in some provinces to over $17.00 per hour in others. Ontario, British Columbia, and Alberta consistently rank among the highest, while several Atlantic provinces remain below the national average.\n\nThe rationale for provincial variation is that the cost of living differs significantly across the country. Housing, transportation, and food costs in Vancouver or Toronto are substantially higher than in rural Nova Scotia or New Brunswick. Advocates for a national minimum wage argue that workers deserve a baseline standard regardless of where they live. Opponents contend that a single rate would harm smaller regional economies where businesses cannot absorb the same labour costs as large urban firms.\n\nSeveral provinces have introduced automatic annual increases tied to inflation, a policy designed to prevent wages from eroding over time. Critics of this approach argue that tying wages to inflation alone does not adequately address the gap between wages and actual living costs, particularly in rapidly growing urban centres.'),

('33333333-0003-0003-0003-000000000003'::uuid,
 'reading','R3',3,'mcq',
 'Why Sleep Matters More Than You Think',
 'Read the passage below, then answer the questions.',
 'Health & Science — General Interest','medium',
 E'Sleep is increasingly recognized by researchers as one of the most powerful factors affecting physical and cognitive health. Despite this, surveys consistently show that a significant portion of adults in developed countries sleep fewer than the recommended seven to nine hours per night. The consequences, scientists warn, extend far beyond feeling tired.\n\nDuring sleep, the brain undergoes a process of cellular repair and memory consolidation. The glymphatic system — a network of channels that clears waste from the brain — is most active during deep sleep stages. Inadequate sleep has been linked to higher rates of Alzheimer''s disease, partly because the protein associated with the disease accumulates faster when sleep is disrupted.\n\nBeyond neurology, chronic sleep deprivation is associated with increased risk of cardiovascular disease, type 2 diabetes, and obesity. Sleep affects hormone regulation: insufficient sleep elevates cortisol (the stress hormone) and disrupts leptin and ghrelin, the hormones that control appetite. This disruption can increase cravings for high-calorie food and reduce the body''s ability to process glucose efficiently.\n\nDespite the evidence, sleep is often treated as a luxury rather than a health necessity. Cultural attitudes that equate long working hours with productivity, combined with the prevalence of screens before bedtime, continue to undermine healthy sleep habits across populations.'),

('33333333-0003-0004-0003-000000000003'::uuid,
 'reading','R3',4,'mcq',
 'Urban Heat Islands: The Hidden Climate of Cities',
 'Read the passage below, then answer the questions.',
 'Environment & Urban Planning','hard',
 E'Urban heat islands (UHIs) are a well-documented phenomenon in which cities experience significantly higher temperatures than the surrounding rural areas. The primary cause is the replacement of natural vegetation with heat-absorbing surfaces: asphalt roads, concrete buildings, and dark rooftops absorb solar radiation during the day and release it slowly at night, preventing the urban environment from cooling at the same rate as adjacent countryside.\n\nThe effect is measurable: cities can be 1 to 7 degrees Celsius warmer than nearby rural areas, with the greatest differences occurring on calm, clear nights. This thermal gap has serious consequences — elevated temperatures increase energy consumption for cooling, worsen air quality by accelerating the formation of ground-level ozone, and significantly increase heat-related illness and death, particularly among elderly populations and those without air conditioning.\n\nMitigating UHIs requires addressing their structural causes. Green roofs — layers of vegetation installed on building tops — reduce heat absorption and provide insulation. Expanding urban tree canopy cools streets through shade and evapotranspiration. Reflective or "cool" paving materials reduce solar heat gain at street level. Several Canadian cities have begun integrating these measures into building codes and urban planning frameworks, though implementation remains uneven and largely voluntary.\n\nAs climate change intensifies heatwaves globally, the risks posed by UHIs are expected to grow. Researchers note that cities with high proportions of elderly residents, limited green space, and dense older building stock face disproportionate risk — creating both a public health and an equity challenge.'),

('33333333-0003-0005-0003-000000000003'::uuid,
 'reading','R3',5,'mcq',
 'Confirmation Bias and the Limits of Self-Awareness',
 'Read the passage below, then answer the questions.',
 'Psychology — Critical Thinking','advanced',
 E'Confirmation bias — the tendency to search for, interpret, and recall information in a way that confirms one''s pre-existing beliefs — is one of the most studied and consequential cognitive biases in psychology. Unlike many biases that operate unconsciously, confirmation bias persists even when individuals are aware of it. Simply knowing that you are susceptible to a bias does not reliably reduce its influence on your reasoning.\n\nThe mechanism operates at multiple levels. At the information-gathering stage, people tend to seek out sources that align with their views and avoid or discount those that challenge them. At the interpretation stage, ambiguous evidence is almost always read in ways consistent with existing beliefs. At the memory stage, confirming evidence is more easily recalled than disconfirming evidence — a phenomenon known as selective recall.\n\nThe implications are significant in several domains. In medicine, confirmation bias can lead clinicians to favour a diagnosis they formed early and overlook contradictory symptoms. In law, it can cause investigators to pursue evidence consistent with their initial theory of a crime and give less weight to exculpatory findings. In everyday decision-making, it reinforces existing choices rather than prompting genuine re-evaluation.\n\nCounteracting confirmation bias requires deliberate structural interventions: seeking out opposing viewpoints actively, using pre-registered hypotheses in research, and establishing processes — such as red-teaming — that institutionalize dissent. Individual willpower alone is insufficient.');

-- R3 Questions
INSERT INTO questions (set_id, question_order, question_type, question_text, options, correct_index, explanation) VALUES

-- Set 1 — Urban Beekeeping
('33333333-0003-0001-0003-000000000003'::uuid,1,'mcq',
 'Which cities are named as permitting residential beekeeping?',
 '["A) Ottawa, Calgary, Halifax","B) Toronto, Vancouver, Montreal","C) Edmonton, Winnipeg, Quebec City","D) Hamilton, Victoria, Saskatoon"]',
 1,'The first paragraph names Toronto, Vancouver, and Montreal.'),
('33333333-0003-0001-0003-000000000003'::uuid,2,'mcq',
 'What three factors have driven urban beekeeping growth?',
 '["A) Government grants, technology, and social media","B) Environmental concern, food initiatives, and changing regulations","C) Declining rural bee populations, rising honey prices, and tourism","D) Hobby culture, cheaper equipment, and relaxed zoning laws"]',
 1,'The opening sentence lists: "environmental concern, community food initiatives, and changing municipal regulations."'),
('33333333-0003-0001-0003-000000000003'::uuid,3,'mcq',
 'Why might urban bees produce more honey than rural bees?',
 '["A) Urban beekeepers are better trained","B) Cities are cooler, slowing honey consumption","C) Monoculture farming limits plant variety for rural bees","D) Urban hives are in more controlled conditions"]',
 2,'The passage explains higher urban production is "largely because monoculture farming reduces the variety of plants available to rural bees."'),
('33333333-0003-0001-0003-000000000003'::uuid,4,'mcq',
 'What concern do critics raise about disease?',
 '["A) Urban pollution weakens bees'' immune systems","B) Hives close together make disease spread easier","C) Imported species bring new diseases","D) Urban bees infect community gardens"]',
 1,'Critics mention "concerns about the spread of disease between hives kept in close proximity."'),
('33333333-0003-0001-0003-000000000003'::uuid,5,'mcq',
 'What best reflects the author''s overall position on urban beekeeping?',
 '["A) Strongly supports it and wants expansion","B) Presents a balanced view of benefits and risks","C) Believes it is harmful and needs stricter regulation","D) Uncertain if bees survive in cities — calls for research"]',
 1,'The passage presents both sides without taking a stance, ending with "an open question." This is a balanced, impartial perspective.'),

-- Set 2 — Minimum Wage
('33333333-0003-0002-0003-000000000003'::uuid,1,'mcq',
 'Who sets minimum wages in Canada?',
 '["A) The federal government for all workers","B) Each province and territory individually","C) A joint federal-provincial committee","D) The Bank of Canada based on inflation data"]',
 1,'The passage opens: "Canada sets minimum wages at the provincial and territorial level."'),
('33333333-0003-0002-0003-000000000003'::uuid,2,'mcq',
 'Which provinces are named as having among the highest minimum wages?',
 '["A) Nova Scotia, New Brunswick, and PEI","B) Ontario, British Columbia, and Alberta","C) Quebec, Manitoba, and Saskatchewan","D) Newfoundland, Yukon, and the Northwest Territories"]',
 1,'The passage states: "Ontario, British Columbia, and Alberta consistently rank among the highest."'),
('33333333-0003-0002-0003-000000000003'::uuid,3,'mcq',
 'What is the main argument FOR allowing provincial variation in minimum wages?',
 '["A) It gives businesses more freedom to pay workers less","B) Cost of living varies significantly across the country","C) Provinces have more experience managing labour markets","D) Federal interference in wages is unconstitutional"]',
 1,'The passage states: "The rationale for provincial variation is that the cost of living differs significantly across the country."'),
('33333333-0003-0002-0003-000000000003'::uuid,4,'mcq',
 'What criticism is raised about tying wages to inflation?',
 '["A) Inflation data is often inaccurate and unreliable","B) It causes wages to rise faster than businesses can manage","C) It does not close the gap between wages and actual living costs","D) It only benefits workers in provinces with high inflation rates"]',
 2,'The passage states critics argue "tying wages to inflation alone does not adequately address the gap between wages and actual living costs."'),
('33333333-0003-0002-0003-000000000003'::uuid,5,'mcq',
 'The passage describes Canada''s minimum wage system as a "patchwork." This metaphor suggests:',
 '["A) The system is colourful and well-designed","B) The system is fragmented and inconsistent across regions","C) Workers are poorly paid across all provinces","D) The government has no control over wages"]',
 1,'A patchwork is made of many uneven, mismatched pieces. Here it suggests the wage system is varied and inconsistent without a unified national standard.'),

-- Set 3 — Sleep Science
('33333333-0003-0003-0003-000000000003'::uuid,1,'mcq',
 'How many hours of sleep per night do researchers recommend for adults?',
 '["A) Five to six hours","B) Six to eight hours","C) Seven to nine hours","D) Eight to ten hours"]',
 2,'The passage states: "fewer than the recommended seven to nine hours per night."'),
('33333333-0003-0003-0003-000000000003'::uuid,2,'mcq',
 'What is the glymphatic system?',
 '["A) A system that regulates appetite hormones during sleep","B) A network of channels that clears waste from the brain","C) The part of the brain responsible for memory storage","D) A biological clock that controls sleep cycles"]',
 1,'The passage defines it as "a network of channels that clears waste from the brain."'),
('33333333-0003-0003-0003-000000000003'::uuid,3,'mcq',
 'How does poor sleep affect appetite?',
 '["A) It reduces the production of cortisol, making people less hungry","B) It disrupts leptin and ghrelin, increasing cravings for high-calorie food","C) It slows metabolism, making weight loss impossible","D) It causes the stomach to shrink, reducing hunger signals"]',
 1,'The passage explains that sleep deprivation "disrupts leptin and ghrelin, the hormones that control appetite. This disruption can increase cravings for high-calorie food."'),
('33333333-0003-0003-0003-000000000003'::uuid,4,'mcq',
 'Why is inadequate sleep linked to a higher risk of Alzheimer''s disease?',
 '["A) Sleep deprivation accelerates ageing of brain cells","B) A protein associated with Alzheimer''s accumulates faster when sleep is disrupted","C) The brain cannot form new memories without sufficient sleep","D) Lack of sleep increases inflammation that destroys neurons"]',
 1,'The passage states: "the protein associated with the disease accumulates faster when sleep is disrupted."'),
('33333333-0003-0003-0003-000000000003'::uuid,5,'mcq',
 'The author says sleep is "often treated as a luxury rather than a health necessity." This contrast implies:',
 '["A) Sleep is genuinely optional for people with busy schedules","B) Society undervalues sleep despite strong scientific evidence of its importance","C) Wealthy people sleep more because they can afford to","D) Sleep research is not yet conclusive enough to change public behaviour"]',
 1,'The contrast highlights a gap between public attitude and scientific reality. The author is critiquing a cultural misunderstanding.'),

-- Set 4 — Urban Heat Islands
('33333333-0003-0004-0003-000000000003'::uuid,1,'mcq',
 'What is the primary cause of urban heat islands?',
 '["A) Increased vehicle traffic producing exhaust heat","B) Industrial manufacturing releasing thermal energy","C) Replacement of vegetation with heat-absorbing surfaces like asphalt and concrete","D) Reduced wind speed in cities compared to rural areas"]',
 2,'The passage states: "The primary cause is the replacement of natural vegetation with heat-absorbing surfaces."'),
('33333333-0003-0004-0003-000000000003'::uuid,2,'mcq',
 'By how much can cities be warmer than nearby rural areas?',
 '["A) 0.5 to 2 degrees Celsius","B) 1 to 7 degrees Celsius","C) 5 to 10 degrees Celsius","D) 3 to 5 degrees Celsius"]',
 1,'The passage states: "cities can be 1 to 7 degrees Celsius warmer than nearby rural areas."'),
('33333333-0003-0004-0003-000000000003'::uuid,3,'mcq',
 'How do green roofs help reduce urban heat?',
 '["A) They reflect sunlight away from buildings using white paint","B) They pump cooled air into the building below","C) They reduce heat absorption and provide insulation","D) They filter pollutants from the air around buildings"]',
 2,'The passage states: "Green roofs — layers of vegetation installed on building tops — reduce heat absorption and provide insulation."'),
('33333333-0003-0004-0003-000000000003'::uuid,4,'mcq',
 'According to the passage, which populations face the greatest risk from urban heat islands?',
 '["A) Children under five and pregnant women","B) Outdoor workers and athletes","C) Elderly populations and those without air conditioning","D) Residents of newer, high-rise buildings"]',
 2,'The passage states: "significantly increase heat-related illness and death, particularly among elderly populations and those without air conditioning."'),
('33333333-0003-0004-0003-000000000003'::uuid,5,'mcq',
 'The author describes UHIs as creating "both a public health and an equity challenge." What does calling it an equity challenge add to the argument?',
 '["A) It suggests that UHIs are caused by inequality in city planning","B) It implies that the health risks are not distributed equally — vulnerable groups are disproportionately affected","C) It argues that wealthy residents should pay more for cooling infrastructure","D) It suggests that UHI research has been unfairly underfunded"]',
 1,'An equity challenge means the harms fall disproportionately on certain groups — elderly, lower-income residents with no AC in dense older buildings.'),

-- Set 5 — Confirmation Bias
('33333333-0003-0005-0003-000000000003'::uuid,1,'mcq',
 'What is confirmation bias?',
 '["A) The tendency to change your beliefs based on new information","B) The tendency to seek and recall information that confirms existing beliefs","C) The inability to form opinions without consulting others","D) A bias toward negative rather than positive information"]',
 1,'The passage defines it as "the tendency to search for, interpret, and recall information in a way that confirms one''s pre-existing beliefs."'),
('33333333-0003-0005-0003-000000000003'::uuid,2,'mcq',
 'What is "selective recall" as described in the passage?',
 '["A) Deliberately choosing which memories to share with others","B) The tendency to remember confirming evidence more easily than disconfirming evidence","C) A medical condition causing memory loss after biased thinking","D) The process of selectively reading only confirming sources"]',
 1,'The passage defines it: "Confirming evidence is more easily recalled than disconfirming evidence — a phenomenon known as selective recall."'),
('33333333-0003-0005-0003-000000000003'::uuid,3,'mcq',
 'According to the passage, what happens when someone becomes aware of their confirmation bias?',
 '["A) Awareness reliably reduces the bias''s influence","B) They become immune to it in professional settings","C) Awareness alone does not reliably reduce the bias","D) They tend to overcorrect and become too sceptical"]',
 2,'The passage states: "Simply knowing that you are susceptible to a bias does not reliably reduce its influence on your reasoning."'),
('33333333-0003-0005-0003-000000000003'::uuid,4,'mcq',
 'In legal investigations, how does confirmation bias cause harm?',
 '["A) It causes lawyers to argue too confidently in court","B) Investigators pursue evidence matching their initial theory and discount exculpatory findings","C) Judges favour defendants who present more confirming evidence","D) It prevents investigators from forming any initial theory of the crime"]',
 1,'The passage states confirmation bias "can cause investigators to pursue evidence consistent with their initial theory of a crime and give less weight to exculpatory findings."'),
('33333333-0003-0005-0003-000000000003'::uuid,5,'mcq',
 'The author argues that "individual willpower alone is insufficient" to counteract confirmation bias. What does this imply about the nature of the bias?',
 '["A) It affects only people who lack discipline or intelligence","B) It is so deeply embedded that structural and institutional solutions are required","C) It can be cured through therapy and self-reflection","D) It is primarily a problem for professionals, not ordinary people"]',
 1,'Saying willpower is insufficient implies the bias operates below the level of conscious control — structural interventions are needed.');


-- ─────────────────────────────────────────────────────────────────────────
-- R4 — VIEWPOINTS  (5 sets × 5 MCQ = 25 questions)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO practice_sets (id, section, part, set_number, set_type, set_title, instruction, scenario, difficulty, passage)
VALUES

('44444444-0004-0001-0004-000000000004'::uuid,
 'reading','R4',1,'mcq',
 'Should Remote Work Become a Permanent Right?',
 'Read both viewpoints, then answer the questions.',
 'Opinion — Workplace Policy','easy',
 E'VIEWPOINT A — Maria Delacroix, HR Director\n\nRemote work has proven itself. Productivity data from our organization shows no decline in output, employee satisfaction scores are at an all-time high, and we have successfully hired talent from cities we could not previously recruit from. The commute is the most universally disliked part of work life, and eliminating it has given employees back hours every week. Companies that refuse to offer flexible work will simply lose their best people to competitors who do.\n\nThat said, remote work is not appropriate for every role or every employee. Some positions require physical presence, and some individuals work better in a structured office environment. What we need is not a blanket policy but a framework that treats remote work as a default right — available to all unless the role requires otherwise.\n\nVIEWPOINT B — Kevin Tanaka, Operations Manager\n\nThe enthusiasm for remote work ignores a significant problem: collaboration suffers. The spontaneous hallway conversation, the whiteboard session, the sense of shared momentum in a team working toward the same goal — these things do not translate to video calls. Junior employees in particular lose out: they learn their craft by being near experienced colleagues, and that informal mentorship disappears when everyone is working from home.\n\nI am not arguing that remote work has no place. For focused, independent tasks, it is often better. But codifying it as a right risks normalizing a model that works well for senior individual contributors and poorly for everyone else. Organizations should retain the authority to determine what arrangements serve their teams best.'),

('44444444-0004-0002-0004-000000000004'::uuid,
 'reading','R4',2,'mcq',
 'Should Social Media Platforms Have a Minimum Age?',
 'Read both viewpoints, then answer the questions.',
 'Opinion — Technology & Youth','easy',
 E'VIEWPOINT A — Dr. Fiona Wells, Child Psychologist\n\nThe evidence is now difficult to ignore. Rates of anxiety, depression, and body image issues among adolescents have risen sharply over the same period that social media use became widespread. While correlation is not causation, the consistency of findings across multiple countries and age groups suggests a meaningful relationship. Social media platforms are designed by engineers using the same behavioural techniques as slot machines — variable reward, infinite scroll, social comparison. These mechanisms are especially powerful on developing brains.\n\nI support a minimum age of 16 for social media accounts, with identity verification enforced by platforms rather than relying on parental supervision. This is not about banning technology — it is about recognizing that certain products carry age-appropriate risks, just as we do with driving, alcohol, and voting.\n\nVIEWPOINT B — James Okafor, Digital Rights Advocate\n\nAge restrictions on social media sound reasonable until you examine the practical consequences. Identity verification at scale means collecting biometric or government ID data from millions of teenagers — creating privacy risks that may outlast any mental health benefit. Restricting access does not remove the underlying social pressures that drive anxiety; it simply removes one channel through which they operate.\n\nFurthermore, social media provides genuine benefits for many young people: access to supportive communities, creative expression, and civic engagement. For LGBTQ+ youth and young people in isolated communities, online spaces are often vital lifelines. A blunt age restriction removes these benefits for everyone in the name of protecting a subset of vulnerable users. Better regulation — algorithmic transparency, time limits, mental health resources built into platforms — would be more proportionate and effective.'),

('44444444-0004-0003-0004-000000000004'::uuid,
 'reading','R4',3,'mcq',
 'Universal Basic Income: Economic Safety Net or Fiscal Fantasy?',
 'Read both viewpoints, then answer the questions.',
 'Opinion — Economics & Social Policy','medium',
 E'VIEWPOINT A — Sandra Obi, Economist\n\nUniversal Basic Income (UBI) — a regular, unconditional cash payment to all citizens regardless of employment status — deserves serious consideration as automation increasingly displaces workers in sectors from manufacturing to professional services. The existing social safety net was designed for an era of stable employment and is poorly equipped to handle a labour market where large numbers of people cycle between short-term contracts, gig work, and periods of no income.\n\nEvidence from pilot programs in Finland, Kenya, and Stockton, California, shows that recipients of guaranteed income spend it on essentials, improve their mental health, and maintain or increase employment. UBI would simplify a tangled web of means-tested benefits, reduce administrative overhead, and eliminate the "welfare trap" — where earning more income causes benefit clawbacks that make working financially punishing.\n\nVIEWPOINT B — Paul Renner, Fiscal Policy Analyst\n\nThe appeal of UBI lies in its simplicity, but simplicity masks serious problems. The cost of providing even a modest payment to every adult Canadian — say $1,000 per month — would exceed $300 billion annually. This is not a rounding error in the federal budget; it represents a fundamental restructuring of public finances that would either require massive tax increases or crowd out spending on healthcare, education, and infrastructure.\n\nFurthermore, UBI''s universality is its weakness. Directing the same payment to a billionaire and a single parent in poverty dilutes resources and reduces the targeted support available to those who need it most. A well-funded, modernized targeted benefit system would do more for the vulnerable at a fraction of the cost.'),

('44444444-0004-0004-0004-000000000004'::uuid,
 'reading','R4',4,'mcq',
 'Should Canada Expand Nuclear Energy?',
 'Read both viewpoints, then answer the questions.',
 'Opinion — Energy Policy & Environment','hard',
 E'VIEWPOINT A — Dr. Amara Diallo, Energy Policy Researcher\n\nThe climate math is unforgiving. To reach net-zero by 2050, Canada must decarbonize its electricity grid while also electrifying transportation and heating — nearly tripling electricity demand. Renewables are essential, but they have a fundamental limitation: intermittency. Wind doesn''t always blow; the sun doesn''t always shine. Grid-scale battery storage remains expensive and limited. Nuclear energy provides firm, low-carbon baseload power that complements renewables without depending on weather or geography.\n\nModern reactor designs — including small modular reactors (SMRs) — are safer, more flexible, and can be built at lower cost than legacy plants. Canada already has world-class expertise in CANDU reactor technology. Expanding nuclear is not a retreat from clean energy ambition; it is a practical bridge to a fully decarbonized grid.\n\nVIEWPOINT B — Linda Cho, Environmental Campaigner\n\nNuclear energy''s proponents speak of its potential as if the problems of the past have been solved. They have not. The question of long-term radioactive waste storage remains unresolved globally — Canada included. We are building power plants today whose waste will remain hazardous for tens of thousands of years, with no permanent storage solution in place.\n\nMoreover, the economics do not support the enthusiasm. Every major nuclear construction project in the West in recent decades has come in massively over budget and years behind schedule — Hinkley Point C in the UK being the most prominent recent example. SMRs sound promising in theory, but no commercial SMR has yet been deployed at scale. In the time and money it would take to build even one nuclear plant, we could deploy vast amounts of solar and wind capacity that are already cost-competitive today.'),

('44444444-0004-0005-0004-000000000004'::uuid,
 'reading','R4',5,'mcq',
 'Should Voting Be Mandatory in Canada?',
 'Read both viewpoints, then answer the questions.',
 'Opinion — Democracy & Civics','advanced',
 E'VIEWPOINT A — Professor Elena Vasquez, Political Scientist\n\nDemocracy functions best when it reflects the will of all citizens, not just the motivated minority who choose to show up on election day. In Canada, federal voter turnout has hovered between 60 and 68 percent in recent elections — meaning that governments are elected by a fraction of eligible voters. The predictable consequence is that political parties target their policies at groups most likely to vote: older, wealthier, and already politically engaged citizens.\n\nMandatory voting — as practised in Australia, Belgium, and Luxembourg, among others — produces turnout above 90 percent and forces parties to develop platforms that appeal to the full electorate rather than an activist base. It treats voting as a civic duty equivalent to jury service or paying taxes: something we require of citizens because functioning democratic institutions depend on it.\n\nVIEWPOINT B — Marcus Bell, Civil Liberties Lawyer\n\nThe state compelling a citizen to perform a political act — even the minimal act of marking a ballot — crosses a fundamental line. Freedom of political expression necessarily includes the freedom not to participate. Compelled voting does not produce an informed electorate; it produces a larger pool of disengaged voters who mark ballots randomly or spoil them in protest, potentially distorting election outcomes rather than improving them.\n\nAustralia''s example is cited often but examined rarely. Australian law technically requires attendance at a polling station, not a valid vote — and spoiled ballots run at approximately 5 percent. If the goal is a more representative democracy, the better path is removing structural barriers to participation: automatic voter registration, expanded polling locations, and making election day a public holiday.');

-- R4 Questions
INSERT INTO questions (set_id, question_order, question_type, question_text, options, correct_index, explanation) VALUES

-- Set 1 — Remote Work
('44444444-0004-0001-0004-000000000004'::uuid,1,'mcq',
 'What is Maria''s job title?',
 '["A) Operations Manager","B) HR Director","C) Chief Executive Officer","D) Team Lead"]',
 1,'The header states: "Maria Delacroix, HR Director."'),
('44444444-0004-0001-0004-000000000004'::uuid,2,'mcq',
 'Which group does Kevin say loses out most from remote work?',
 '["A) Senior managers","B) Part-time workers","C) Junior employees","D) IT staff"]',
 2,'Kevin writes: "Junior employees in particular lose out: they learn their craft by being near experienced colleagues."'),
('44444444-0004-0001-0004-000000000004'::uuid,3,'mcq',
 'What does Maria use as evidence that remote work has succeeded?',
 '["A) Cost savings on office rent","B) Productivity data and high satisfaction scores","C) Reduced turnover rates among all employees","D) Better performance reviews for remote workers"]',
 1,'Maria cites: "Productivity data from our organization shows no decline in output, employee satisfaction scores are at an all-time high."'),
('44444444-0004-0001-0004-000000000004'::uuid,4,'mcq',
 'Kevin says he is "not arguing that remote work has no place." What does this mean?',
 '["A) He wants to make remote work mandatory for all staff","B) He accepts remote work for focused tasks but not as a universal right","C) He thinks remote work should be studied before any decision","D) He agrees with Maria that remote work is the future"]',
 1,'Kevin acknowledges remote work is "often better" for focused, independent tasks — but opposes making it a codified universal right.'),
('44444444-0004-0001-0004-000000000004'::uuid,5,'mcq',
 'On which point do both Maria and Kevin most clearly agree?',
 '["A) Remote work should be available to all employees without exception","B) Remote work is not appropriate for every role or individual","C) The commute is the most harmful part of office work","D) Productivity always improves when employees work from home"]',
 1,'Maria: "remote work is not appropriate for every role or every employee." Kevin implies other tasks need in-person presence. Both agree it is not universally suitable.'),

-- Set 2 — Social Media Age Limits
('44444444-0004-0002-0004-000000000004'::uuid,1,'mcq',
 'What minimum age does Dr. Wells recommend for social media?',
 '["A) 13","B) 14","C) 16","D) 18"]',
 2,'Dr. Wells states: "I support a minimum age of 16 for social media accounts."'),
('44444444-0004-0002-0004-000000000004'::uuid,2,'mcq',
 'What is James Okafor''s job title?',
 '["A) Child Psychologist","B) Social Media Executive","C) Digital Rights Advocate","D) Government Policy Advisor"]',
 2,'The header states: "James Okafor, Digital Rights Advocate."'),
('44444444-0004-0002-0004-000000000004'::uuid,3,'mcq',
 'What is James''s main concern about identity verification?',
 '["A) It is too expensive for small platforms to implement","B) It creates privacy risks by collecting sensitive data from teenagers","C) It will be easily bypassed by determined young users","D) It places too much responsibility on parents"]',
 1,'James warns: "Identity verification at scale means collecting biometric or government ID data from millions of teenagers — creating privacy risks."'),
('44444444-0004-0002-0004-000000000004'::uuid,4,'mcq',
 'Dr. Wells compares social media to driving, alcohol, and voting. What point is she making?',
 '["A) Social media is as dangerous as drunk driving","B) Age limits already exist for other risky activities, so restricting social media is consistent","C) Teenagers should not have access to anything until they are adults","D) Social media companies should be regulated like the alcohol industry"]',
 1,'She argues that we already accept age-appropriate restrictions for "driving, alcohol, and voting" — applying the same logic to social media is consistent, not extreme.'),
('44444444-0004-0002-0004-000000000004'::uuid,5,'mcq',
 'James proposes "better regulation" as an alternative to age restrictions. Compared to Dr. Wells'' proposal, his approach is best described as:',
 '["A) Stricter — it imposes more rules on platforms","B) More targeted — addressing specific harms without restricting access entirely","C) Weaker — it relies on voluntary compliance from companies","D) Unproven — there is no evidence that algorithmic changes help"]',
 1,'James proposes "algorithmic transparency, time limits, mental health resources" — addressing the mechanisms of harm while preserving access.'),

-- Set 3 — UBI
('44444444-0004-0003-0004-000000000004'::uuid,1,'mcq',
 'What does UBI stand for?',
 '["A) United Basic Investment","B) Universal Basic Income","C) Uniform Benefit Index","D) Urban Basic Initiative"]',
 1,'The passage defines it: "Universal Basic Income (UBI)."'),
('44444444-0004-0003-0004-000000000004'::uuid,2,'mcq',
 'What does Sandra say evidence from pilot programs shows?',
 '["A) UBI causes inflation and reduces work incentives","B) Recipients spend money on luxuries rather than essentials","C) Recipients improve mental health and maintain or increase employment","D) UBI only works in wealthy countries with high GDP"]',
 2,'Sandra states: "recipients of guaranteed income spend it on essentials, improve their mental health, and maintain or increase employment."'),
('44444444-0004-0003-0004-000000000004'::uuid,3,'mcq',
 'What is the "welfare trap" mentioned by Sandra?',
 '["A) A system where wealthy people also receive benefits they do not need","B) A situation where earning more income triggers benefit reductions that make working financially punishing","C) A bureaucratic process that delays benefit payments for months","D) A trap where unemployed people become too dependent on welfare to seek work"]',
 1,'Sandra defines it as: "where earning more income causes benefit clawbacks that make working financially punishing."'),
('44444444-0004-0003-0004-000000000004'::uuid,4,'mcq',
 'Paul argues that UBI''s universality is "its weakness." What does he mean?',
 '["A) Everyone receiving the same payment leads to inflation","B) Giving the same amount to everyone — rich or poor — dilutes resources and reduces targeted support for those who need it most","C) Universal programs are harder to administer than targeted ones","D) A universal payment cannot address regional cost-of-living differences"]',
 1,'Paul argues that paying a billionaire and a single parent the same amount wastes resources — money that could be concentrated on those in genuine need.'),
('44444444-0004-0003-0004-000000000004'::uuid,5,'mcq',
 'Both Sandra and Paul acknowledge a problem with the current benefits system. What is the key difference in how they propose to fix it?',
 '["A) Sandra wants to eliminate all benefits; Paul wants to keep them unchanged","B) Sandra proposes replacing the current system with UBI; Paul proposes modernizing targeted benefits instead","C) Sandra focuses on mental health; Paul focuses only on financial outcomes","D) Sandra supports government spending cuts; Paul supports tax increases"]',
 1,'Sandra wants UBI to replace the "tangled web of means-tested benefits." Paul wants "a well-funded, modernized targeted benefit system" — improving the existing approach.'),

-- Set 4 — Nuclear Energy
('44444444-0004-0004-0004-000000000004'::uuid,1,'mcq',
 'What does SMR stand for?',
 '["A) Standard Modular Reactor","B) Small Modular Reactor","C) Safe Modern Reactor","D) Scaled Municipal Reactor"]',
 1,'The passage states: "small modular reactors (SMRs)."'),
('44444444-0004-0004-0004-000000000004'::uuid,2,'mcq',
 'What limitation of renewables does Dr. Diallo identify?',
 '["A) They produce too much power in summer and not enough in winter","B) They are too expensive to build in northern climates","C) They are intermittent — wind and solar do not always generate power","D) They require more land than nuclear plants"]',
 2,'Dr. Diallo states: "renewables… have a fundamental limitation: intermittency. Wind doesn''t always blow; the sun doesn''t always shine."'),
('44444444-0004-0004-0004-000000000004'::uuid,3,'mcq',
 'What is Linda''s primary concern about nuclear waste?',
 '["A) It is being illegally transported to other countries","B) The storage facilities are leaking and contaminating groundwater","C) There is no permanent storage solution for waste that remains hazardous for thousands of years","D) Nuclear waste is increasing cancer rates near existing plants"]',
 2,'Linda states: "The question of long-term radioactive waste storage remains unresolved globally… waste will remain hazardous for tens of thousands of years, with no permanent storage solution in place."'),
('44444444-0004-0004-0004-000000000004'::uuid,4,'mcq',
 'Linda mentions Hinkley Point C. What point does this example support?',
 '["A) Nuclear energy is unsafe when built near populated areas","B) Nuclear construction projects frequently exceed budget and schedule","C) The UK has abandoned its nuclear energy ambitions","D) SMRs are a better alternative to traditional large reactors"]',
 1,'Linda says "every major nuclear construction project in the West… has come in massively over budget and years behind schedule" and cites Hinkley Point C as "the most prominent recent example."'),
('44444444-0004-0004-0004-000000000004'::uuid,5,'mcq',
 'Both Dr. Diallo and Linda agree that climate change is a serious problem requiring action. Their disagreement is best described as:',
 '["A) A disagreement about whether climate change is real","B) A disagreement about the best technology to decarbonize the electricity grid","C) A disagreement about whether Canada should reach net-zero at all","D) A disagreement about the cost of renewable energy"]',
 1,'Both accept the need to decarbonize. Their disagreement is about the right tool — nuclear alongside renewables vs. renewables alone.'),

-- Set 5 — Mandatory Voting
('44444444-0004-0005-0004-000000000004'::uuid,1,'mcq',
 'Which countries does Professor Vasquez cite as examples of mandatory voting?',
 '["A) France, Germany, and Italy","B) Australia, Belgium, and Luxembourg","C) Brazil, Argentina, and Uruguay","D) Sweden, Norway, and Denmark"]',
 1,'The passage states: "as practised in Australia, Belgium, and Luxembourg, among others."'),
('44444444-0004-0005-0004-000000000004'::uuid,2,'mcq',
 'What voter turnout range does Professor Vasquez cite for recent Canadian federal elections?',
 '["A) 45–55 percent","B) 55–65 percent","C) 60–68 percent","D) 70–80 percent"]',
 2,'She states: "federal voter turnout has hovered between 60 and 68 percent in recent elections."'),
('44444444-0004-0005-0004-000000000004'::uuid,3,'mcq',
 'What is Marcus Bell''s main objection to mandatory voting?',
 '["A) It is too expensive to enforce","B) It would benefit left-wing parties unfairly","C) Compelling a political act violates the freedom not to participate","D) Low-information voters already have too much influence"]',
 2,'Marcus argues: "The state compelling a citizen to perform a political act… crosses a fundamental line. Freedom of political expression necessarily includes the freedom not to participate."'),
('44444444-0004-0005-0004-000000000004'::uuid,4,'mcq',
 'Marcus points out that Australian law requires attendance at a polling station, not a valid vote. How does this undermine the case for mandatory voting?',
 '["A) It shows Australians do not take elections seriously","B) It suggests mandatory voting only increases turnout numbers without necessarily producing more meaningful participation","C) It proves that spoiled ballots cause election outcomes to be invalid","D) It shows that mandatory voting is not actually enforced in Australia"]',
 1,'If only showing up is required and spoiled ballots run at 5%, mandatory voting may increase attendance without increasing meaningful democratic engagement.'),
('44444444-0004-0005-0004-000000000004'::uuid,5,'mcq',
 'Both writers agree that Canadian democracy has a participation problem. Their core disagreement is about:',
 '["A) Whether low turnout matters for election outcomes","B) Whether the solution should be compulsion or removing structural barriers to voluntary participation","C) Whether Canada should adopt a proportional representation system","D) Whether older and wealthier voters should have more influence"]',
 1,'Vasquez argues compulsion (mandatory voting) is the fix. Bell argues for removing structural barriers. The debate is about compulsion vs. structural reform.');
