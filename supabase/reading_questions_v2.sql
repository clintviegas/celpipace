-- ═══════════════════════════════════════════════════════════
-- CELPIP ACE — Reading Questions v2
-- Adds set_number column so each part has 5 distinct sets.
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- 0. Drop old table cleanly and recreate
DROP TABLE IF EXISTS reading_questions;

-- 1. Create table with set_number
CREATE TABLE reading_questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  part           TEXT        NOT NULL,           -- 'R1'|'R2'|'R3'|'R4'
  set_number     INT         NOT NULL,           -- 1..5  (which practice set within the part)
  set_title      TEXT        NOT NULL,           -- displayed as the card heading
  passage        TEXT,                           -- full passage text (only on Q1 of each set)
  instruction    TEXT        NOT NULL,
  scenario       TEXT,
  difficulty     TEXT        NOT NULL DEFAULT 'medium',
  question_order INT         NOT NULL DEFAULT 1, -- 1..5 within the set
  question_text  TEXT        NOT NULL,
  options        JSONB       NOT NULL,
  correct_index  INT         NOT NULL,
  explanation    TEXT        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rq_part_set ON reading_questions (part, set_number, question_order);

ALTER TABLE reading_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON reading_questions FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════
-- SEED — 5 sets × 4 parts = 20 sets, 5 Q each = 100 rows
-- Difficulty per set: easy / easy / medium / hard / advanced
-- ═══════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────
-- R1 — CORRESPONDENCE  (5 sets)
-- ──────────────────────────────────────────────────────────
INSERT INTO reading_questions (part,set_number,set_title,instruction,scenario,difficulty,question_order,passage,question_text,options,correct_index,explanation) VALUES

-- R1 Set 1 — Easy (Noise Complaint Email)
('R1',1,'Email — Noise Complaint to Property Manager','Read the email below, then answer the questions.','Residential — Tenant Correspondence','easy',1,
E'Subject: Ongoing Noise Disturbance — Unit 4B\n\nDear Ms. Harrington,\n\nI am writing to bring a recurring issue to your attention. Over the past three weeks, the tenant in the unit directly above mine (4B) has been causing significant noise disturbances late at night — specifically between 11:00 PM and 2:00 AM on weekdays. The noise includes loud music, footsteps, and what sounds like furniture being moved repeatedly.\n\nI have attempted to resolve this informally by speaking with the tenant directly, but the behaviour has continued without improvement. As a long-term resident of this building, I would appreciate your assistance in addressing this matter in accordance with the building\'s noise policy.\n\nI am available to speak at your convenience and can provide dates and times of the specific incidents if needed.\n\nSincerely,\nJames Kowalski\nUnit 3B',
'Who is James Kowalski writing to?',
'["A) The tenant in Unit 4B","B) The building''s property manager","C) A city noise inspector","D) His next-door neighbour"]',
1,'The email is addressed "Dear Ms. Harrington." James is requesting her help enforcing the building noise policy — her role is property manager.'),

('R1',1,'Email — Noise Complaint to Property Manager','Read the email below, then answer the questions.','Residential — Tenant Correspondence','easy',2,NULL,
'At what times does the disturbance occur?',
'["A) Weekday mornings 6–9 AM","B) Weekday evenings 9–11 PM","C) Late at night between 11 PM and 2 AM on weekdays","D) Throughout the day on weekends"]',
2,'James states clearly: "specifically between 11:00 PM and 2:00 AM on weekdays."'),

('R1',1,'Email — Noise Complaint to Property Manager','Read the email below, then answer the questions.','Residential — Tenant Correspondence','medium',3,NULL,
'Why does James mention speaking with the upstairs tenant?',
'["A) To prove the tenant is hostile","B) To show he tried to solve the issue before escalating","C) To ask the manager to speak to the tenant directly","D) To prove the noise is intentional"]',
1,'He says he "attempted to resolve this informally." This shows he escalated only after the informal approach failed.'),

('R1',1,'Email — Noise Complaint to Property Manager','Read the email below, then answer the questions.','Residential — Tenant Correspondence','hard',4,NULL,
'What does James offer to provide to support his complaint?',
'["A) A signed statement from other neighbours","B) A video recording of the noise","C) Specific dates and times of the incidents","D) A copy of the building noise policy"]',
2,'James writes: "I can provide dates and times of the specific incidents if needed."'),

('R1',1,'Email — Noise Complaint to Property Manager','Read the email below, then answer the questions.','Residential — Tenant Correspondence','advanced',5,NULL,
'Which best describes the tone and purpose of this email?',
'["A) Threatening — warning of legal action","B) Casual — informally updating the manager","C) Formal and measured — professionally escalating an unresolved issue","D) Apologetic — sorry for causing a dispute"]',
2,'The language is formal and restrained throughout. The purpose is professional escalation after an informal attempt failed.'),

-- R1 Set 2 — Easy (Request for Lease Renewal)
('R1',2,'Email — Request to Renew a Lease Early','Read the email below, then answer the questions.','Residential — Tenant to Landlord','easy',1,
E'Subject: Early Lease Renewal — Unit 12\n\nDear Mr. Patterson,\n\nI hope you are well. I am writing to express my interest in renewing my lease for Unit 12 before the current term ends on September 30th. I have been a tenant here for four years and would like to continue living in the building.\n\nI would prefer to lock in a renewal now to avoid any uncertainty about my housing situation. If possible, I would appreciate discussing the new rental rate at your earliest convenience, as I am aware that market rents have increased since my last renewal.\n\nPlease let me know your availability for a brief call or meeting. I am flexible and happy to work around your schedule.\n\nThank you for your time.\n\nBest regards,\nPriya Sharma\nUnit 12',
'Why is Priya writing this email?',
'["A) To complain about a rent increase","B) To request an early lease renewal","C) To give notice that she is moving out","D) To ask for repairs to her unit"]',
1,'The subject line and opening sentence make clear she wants to renew her lease before it expires.'),

('R1',2,'Email — Request to Renew a Lease Early','Read the email below, then answer the questions.','Residential — Tenant to Landlord','easy',2,NULL,
'When does Priya''s current lease end?',
'["A) December 31st","B) June 30th","C) September 30th","D) March 31st"]',
2,'Priya states: "before the current term ends on September 30th."'),

('R1',2,'Email — Request to Renew a Lease Early','Read the email below, then answer the questions.','Residential — Tenant to Landlord','medium',3,NULL,
'What is Priya''s main reason for wanting to renew early?',
'["A) She wants to negotiate a lower rent","B) She wants to avoid uncertainty about her housing","C) She is concerned the landlord will rent to someone else","D) Her employer requires a stable address"]',
1,'She writes: "I would prefer to lock in a renewal now to avoid any uncertainty about my housing situation."'),

('R1',2,'Email — Request to Renew a Lease Early','Read the email below, then answer the questions.','Residential — Tenant to Landlord','hard',4,NULL,
'Why does Priya mention that market rents have increased?',
'["A) To argue that her current rent is too high","B) To show she understands the landlord may raise the rate","C) To threaten to report the landlord to a housing authority","D) To compare her building to others nearby"]',
1,'She says she is "aware that market rents have increased" — showing she expects a higher rate and is signalling she is prepared to discuss it, not resist it.'),

('R1',2,'Email — Request to Renew a Lease Early','Read the email below, then answer the questions.','Residential — Tenant to Landlord','advanced',5,NULL,
'What impression does Priya create by saying she is "flexible and happy to work around your schedule"?',
'["A) She is uncertain whether she actually wants to renew","B) She is pressuring the landlord to respond immediately","C) She is being cooperative to encourage a positive response","D) She has no other options and is worried"]',
2,'The phrase is a politeness strategy — signalling flexibility to make it easier for the landlord to agree to meet. It creates a cooperative, low-pressure tone.'),

-- R1 Set 3 — Medium (Complaint about a Renovation)
('R1',3,'Email — Complaint About Renovation Noise and Dust','Read the email below, then answer the questions.','Commercial Building — Tenant Complaint','medium',1,
E'Subject: Disruption from Ongoing Renovation — Suite 305\n\nDear Building Manager,\n\nI am writing to formally raise concerns about the renovation work currently taking place on the fourth floor of our building. While I understand that improvements to the building are necessary, the noise and dust generated by the work are significantly impacting my ability to conduct business from Suite 305.\n\nThe drilling and demolition begin as early as 7:00 AM and often continue until after 6:00 PM, well beyond what I understand to be the approved working hours of 8:00 AM to 5:00 PM. In addition, fine dust has been entering our suite through the ventilation system, causing discomfort to my staff and potential damage to our equipment.\n\nI am requesting that the contractor strictly adhere to the approved working hours and that the ventilation issue be addressed immediately. I would also appreciate being kept informed of the renovation timeline so that we can make appropriate arrangements.\n\nI look forward to your prompt response.\n\nSincerely,\nDavid Nguyen\nSuite 305',
'What is the main purpose of this email?',
'["A) To request a rent reduction for disruption","B) To formally complain about renovation noise and dust exceeding approved limits","C) To report a health and safety violation to the city","D) To ask the building manager to stop the renovation entirely"]',
1,'David is formally raising concerns about noise beyond approved hours and dust entering through ventilation — this is a complaint requesting specific corrective action.'),

('R1',3,'Email — Complaint About Renovation Noise and Dust','Read the email below, then answer the questions.','Commercial Building — Tenant Complaint','medium',2,NULL,
'What are the approved working hours mentioned in the email?',
'["A) 7:00 AM to 6:00 PM","B) 9:00 AM to 5:00 PM","C) 8:00 AM to 5:00 PM","D) 8:00 AM to 6:00 PM"]',
2,'David states: "the approved working hours of 8:00 AM to 5:00 PM."'),

('R1',3,'Email — Complaint About Renovation Noise and Dust','Read the email below, then answer the questions.','Commercial Building — Tenant Complaint','medium',3,NULL,
'How is the dust reaching Suite 305?',
'["A) Through gaps under the office door","B) Through the ventilation system","C) Through cracks in the ceiling","D) Through an open window facing the work area"]',
1,'David writes: "fine dust has been entering our suite through the ventilation system."'),

('R1',3,'Email — Complaint About Renovation Noise and Dust','Read the email below, then answer the questions.','Commercial Building — Tenant Complaint','hard',4,NULL,
'David asks to be kept informed of the renovation timeline. Why is this request significant?',
'["A) He wants to report the project to the city","B) He plans to terminate his lease if work continues","C) He needs to make arrangements to manage the disruption to his business","D) He suspects the renovation is taking longer than planned"]',
2,'He writes: "so that we can make appropriate arrangements" — meaning advance notice allows him to plan around the disruption, for example by scheduling important meetings away from the building.'),

('R1',3,'Email — Complaint About Renovation Noise and Dust','Read the email below, then answer the questions.','Commercial Building — Tenant Complaint','advanced',5,NULL,
'The phrase "formally raise concerns" in the first paragraph signals which of the following?',
'["A) David has already contacted a lawyer","B) This is David''s first communication with the building manager on this topic","C) David is establishing an official record, suggesting he may escalate if not resolved","D) David is unsure whether his complaint is valid"]',
2,'Using "formally" signals this is not a casual mention — it suggests David is creating a documented record, which typically precedes escalation to higher authorities or legal action if ignored.'),

-- R1 Set 4 — Hard (Landlord Notice to Vacate)
('R1',4,'Letter — Notice to Vacate from Landlord','Read the letter below, then answer the questions.','Legal — Landlord Notice','hard',1,
E'Date: February 15\n\nDear Ms. Chen,\n\nThis letter serves as formal notice that your tenancy at 88 Birchwood Avenue, Unit 7, will be terminated effective April 30th of this year. This notice is being issued pursuant to Section 48 of the Residential Tenancies Act, which permits a landlord to recover possession of a rental unit for the purpose of personal use by the landlord or an immediate family member.\n\nOur records confirm that you have been a tenant since March 2019 and your current monthly rent is $1,650. As required by law, you are entitled to one month''s compensation equivalent to your monthly rent, which will be applied as a credit against your April rent payment.\n\nIf you have any questions or wish to discuss this matter, please contact our office at the number below. Should you choose to dispute this notice, you have the right to file an application with the Landlord and Tenant Board within the prescribed time period.\n\nSincerely,\nHarold Forsythe\nProperty Management, Birchwood Residences',
'Why is Ms. Chen being asked to vacate?',
'["A) She has not paid her rent","B) The landlord wants the unit for personal or family use","C) She has violated her lease terms","D) The building is being sold"]',
1,'The letter states it is issued "for the purpose of personal use by the landlord or an immediate family member" under Section 48 of the Residential Tenancies Act.'),

('R1',4,'Letter — Notice to Vacate from Landlord','Read the letter below, then answer the questions.','Legal — Landlord Notice','hard',2,NULL,
'What compensation is Ms. Chen entitled to?',
'["A) Two months'' free rent","B) A refund of her last month''s deposit","C) One month''s rent as a credit on her April payment","D) A moving allowance paid directly to her"]',
2,'The letter states: "you are entitled to one month''s compensation equivalent to your monthly rent, which will be applied as a credit against your April rent payment."'),

('R1',4,'Letter — Notice to Vacate from Landlord','Read the letter below, then answer the questions.','Legal — Landlord Notice','hard',3,NULL,
'When must Ms. Chen vacate the unit?',
'["A) March 31st","B) February 28th","C) April 30th","D) May 15th"]',
2,'The letter states: "your tenancy… will be terminated effective April 30th of this year."'),

('R1',4,'Letter — Notice to Vacate from Landlord','Read the letter below, then answer the questions.','Legal — Landlord Notice','hard',4,NULL,
'What option does the letter mention if Ms. Chen wants to challenge the notice?',
'["A) She can refuse to leave and call the police","B) She can file an application with the Landlord and Tenant Board","C) She can negotiate a new lease directly with the landlord","D) She can contact the city housing authority"]',
1,'The letter states: "you have the right to file an application with the Landlord and Tenant Board within the prescribed time period."'),

('R1',4,'Letter — Notice to Vacate from Landlord','Read the letter below, then answer the questions.','Legal — Landlord Notice','advanced',5,NULL,
'The phrase "pursuant to Section 48 of the Residential Tenancies Act" serves which purpose in the letter?',
'["A) It warns Ms. Chen that failure to comply is a criminal offence","B) It establishes that the notice is legally grounded and formally enforceable","C) It indicates the landlord has already filed a case at the Tribunal","D) It is included only as a courtesy to explain the reason"]',
1,'Citing specific legislation establishes the legal basis for the notice — it signals the action is formally grounded in law, making the notice harder to ignore and signalling awareness of tenant rights too.'),

-- R1 Set 5 — Advanced (Formal Complaint to Customer Service)
('R1',5,'Email — Formal Complaint to a Retail Company','Read the email below, then answer the questions.','Consumer — Customer Complaint','advanced',1,
E'Subject: Formal Complaint — Order #47821 / Damaged Item and Unfulfilled Replacement Promise\n\nTo Whom It May Concern,\n\nI am writing to formally document my dissatisfaction with the handling of a recent order and to request a satisfactory resolution. My order (#47821), placed on January 8th, arrived on January 14th with the primary item — a glass display cabinet — damaged beyond use. Three panels were cracked, and the metal frame was visibly bent.\n\nI contacted your customer service team on January 15th and was assured by your representative, who identified herself as "Sarah," that a replacement unit would be dispatched within five to seven business days. It has now been three weeks since that conversation, and I have received neither the replacement nor any follow-up communication.\n\nI have made two additional attempts to contact your support line, both of which resulted in holds exceeding forty-five minutes and no resolution. At this point, I am formally requesting either an immediate replacement shipment with express delivery, or a full refund of the purchase price of $389. If I do not receive a satisfactory response within five business days of this email, I will escalate this matter to the Better Business Bureau and my credit card provider.\n\nI trust this matter will receive the attention it warrants.\n\nSincerely,\nMargaret O''Brien',
'What was wrong with the item Margaret received?',
'["A) The wrong item was delivered","B) The item arrived late with no explanation","C) The glass panels were cracked and the frame was bent","D) The item was missing parts and required assembly"]',
2,'Margaret describes: "three panels were cracked, and the metal frame was visibly bent."'),

('R1',5,'Email — Formal Complaint to a Retail Company','Read the email below, then answer the questions.','Consumer — Customer Complaint','advanced',2,NULL,
'What did the customer service representative promise on January 15th?',
'["A) A full refund within five business days","B) A replacement would be sent within five to seven business days","C) A technician would come to repair the item","D) A store credit would be applied to her account"]',
1,'The representative promised "a replacement unit would be dispatched within five to seven business days."'),

('R1',5,'Email — Formal Complaint to a Retail Company','Read the email below, then answer the questions.','Consumer — Customer Complaint','advanced',3,NULL,
'What two resolutions does Margaret request?',
'["A) A repair or store credit","B) A replacement with express delivery, or a full refund of $389","C) An apology letter and a discount on a future order","D) A refund of $389 or free delivery on her next purchase"]',
1,'She writes: "I am formally requesting either an immediate replacement shipment with express delivery, or a full refund of the purchase price of $389."'),

('R1',5,'Email — Formal Complaint to a Retail Company','Read the email below, then answer the questions.','Consumer — Customer Complaint','advanced',4,NULL,
'Margaret mentions the Better Business Bureau and her credit card provider. What is the purpose of this?',
'["A) To inform the company she has already filed a complaint","B) To threaten escalation if her complaint is not resolved within five business days","C) To suggest the company is already under investigation","D) To show she is aware of her consumer rights in general"]',
1,'She says "If I do not receive a satisfactory response within five business days… I will escalate." This is a conditional threat — intended to prompt action by showing the consequences of inaction.'),

('R1',5,'Email — Formal Complaint to a Retail Company','Read the email below, then answer the questions.','Consumer — Customer Complaint','advanced',5,NULL,
'The phrase "I trust this matter will receive the attention it warrants" is an example of which rhetorical strategy?',
'["A) An apology for being demanding","B) A polite but firm closing that implies the company has an obligation to respond","C) A sincere expression of confidence in the company","D) A suggestion that the matter is not very serious"]',
1,'This is a formal closing formula that sounds polite but carries implicit pressure — "the attention it warrants" implies the complaint is serious and the company is expected to treat it as such.'),


-- ──────────────────────────────────────────────────────────
-- R2 — APPLY A DIAGRAM  (5 sets)
-- ──────────────────────────────────────────────────────────

-- R2 Set 1 — Easy (Community Centre Schedule)
('R2',1,'Community Centre — Spring Fitness Schedule','Read the passage and schedule, then answer the questions.','Community Centre — Program Information','easy',1,
E'The Riverside Community Centre has updated its weekly fitness schedule for the spring season. Yoga classes run on Monday and Wednesday mornings from 9:00 AM to 10:00 AM. The aquatic fitness class for seniors is offered Tuesday and Thursday afternoons from 2:00 PM to 3:00 PM. Indoor cycling is available Monday through Friday at 6:00 PM. All classes require advance registration, which can be completed online or at the front desk.\n\nNote: The pool will be closed for maintenance on Thursday, April 10th. The aquatic fitness class on that date will be replaced by a chair yoga session in Room 2.\n\nSCHEDULE (Week of April 7–11):\nMon Apr 7:  Yoga (9AM), Indoor Cycling (6PM)\nTue Apr 8:  Aquatic Fitness (2PM), Indoor Cycling (6PM)\nWed Apr 9:  Yoga (9AM), Indoor Cycling (6PM)\nThu Apr 10: Chair Yoga – Room 2 (2PM), Indoor Cycling (6PM)\nFri Apr 11: Indoor Cycling (6PM)',
'Which class runs every weekday?',
'["A) Yoga","B) Aquatic Fitness","C) Indoor Cycling","D) Chair Yoga"]',
2,'The passage states: "Indoor cycling is available Monday through Friday at 6:00 PM." Confirmed in the schedule.'),

('R2',1,'Community Centre — Spring Fitness Schedule','Read the passage and schedule, then answer the questions.','Community Centre — Program Information','easy',2,NULL,
'How do members register for classes?',
'["A) By calling the front desk only","B) By emailing the instructor","C) Online or at the front desk","D) In person on the day"]',
2,'The passage states: "registration… can be completed online or at the front desk."'),

('R2',1,'Community Centre — Spring Fitness Schedule','Read the passage and schedule, then answer the questions.','Community Centre — Program Information','medium',3,NULL,
'A senior wants aquatic fitness during the week of April 7–11. Which is the only available day?',
'["A) Monday April 7","B) Tuesday April 8","C) Thursday April 10","D) Friday April 11"]',
1,'Thursday April 10 the pool is closed; aquatic fitness is replaced by chair yoga. Tuesday April 8 is the only option.'),

('R2',1,'Community Centre — Spring Fitness Schedule','Read the passage and schedule, then answer the questions.','Community Centre — Program Information','hard',4,NULL,
'How many total class sessions are offered that week (April 7–11)?',
'["A) Seven","B) Eight","C) Nine","D) Ten"]',
2,'Mon(2)+Tue(2)+Wed(2)+Thu(2)+Fri(1) = 9 sessions.'),

('R2',1,'Community Centre — Spring Fitness Schedule','Read the passage and schedule, then answer the questions.','Community Centre — Program Information','advanced',5,NULL,
'A member arrives Thursday April 10 expecting aquatic fitness. What will they find?',
'["A) The class is cancelled with no alternative","B) A water-based fitness class in the pool","C) A chair yoga session in Room 2","D) They should have registered Tuesday instead"]',
2,'The passage states the aquatic class is REPLACED by chair yoga in Room 2 on that date.'),

-- R2 Set 2 — Easy (Library Floor Plan)
('R2',2,'Library — Floor Plan and Borrowing Policy','Read the passage and floor plan, then answer the questions.','Public Library — Visitor Information','easy',1,
E'The Maplewood Public Library is arranged across two floors. The ground floor contains the children''s section (Room A), the periodicals lounge (Room B), and the main circulation desk near the entrance. The second floor houses the non-fiction collection (Room C), the quiet study room (Room D), and the computer lab (Room E).\n\nBorrowing rules: Adult members may borrow up to 10 items for 3 weeks. Children''s items may be borrowed for 2 weeks. DVDs and magazines are reference-only and cannot be taken out of the building. The computer lab is available on a 1-hour session basis and must be booked at the circulation desk.\n\nFLOOR PLAN (simplified):\nGround Floor: [Entrance] → Circulation Desk | Room A (Children) | Room B (Periodicals)\nSecond Floor: Room C (Non-Fiction) | Room D (Quiet Study) | Room E (Computer Lab)',
'Where is the circulation desk located?',
'["A) Second floor near Room C","B) Ground floor near the entrance","C) Next to the quiet study room","D) Inside the children''s section"]',
1,'The passage states: "the main circulation desk near the entrance" on the ground floor.'),

('R2',2,'Library — Floor Plan and Borrowing Policy','Read the passage and floor plan, then answer the questions.','Public Library — Visitor Information','easy',2,NULL,
'How long can adults borrow items?',
'["A) 1 week","B) 2 weeks","C) 3 weeks","D) 4 weeks"]',
2,'The passage states: "Adult members may borrow up to 10 items for 3 weeks."'),

('R2',2,'Library — Floor Plan and Borrowing Policy','Read the passage and floor plan, then answer the questions.','Public Library — Visitor Information','medium',3,NULL,
'A visitor wants to read today''s newspaper at the library. Where should they go, and can they take it home?',
'["A) Room B, but they cannot take it home","B) Room C, and they can borrow it for 3 weeks","C) Room A, but only children can access it","D) Room D, and they can borrow it for 2 weeks"]',
0,'Newspapers are periodicals → Room B (Periodicals Lounge). DVDs and magazines are reference-only, and periodicals follow the same rule — cannot leave the building.'),

('R2',2,'Library — Floor Plan and Borrowing Policy','Read the passage and floor plan, then answer the questions.','Public Library — Visitor Information','hard',4,NULL,
'A student needs 90 minutes of computer time. Based on the policy, what must they do?',
'["A) Book two 1-hour sessions at the circulation desk","B) Ask a librarian for special permission","C) Use the computer lab on a walk-in basis","D) Access computers in the children''s section instead"]',
0,'Sessions are 1-hour each, must be booked at the circulation desk. For 90 minutes, the student needs to book two sessions.'),

('R2',2,'Library — Floor Plan and Borrowing Policy','Read the passage and floor plan, then answer the questions.','Public Library — Visitor Information','advanced',5,NULL,
'A parent wants to borrow 8 children''s books and 3 adult novels today. Which statement is accurate?',
'["A) They can borrow all 11 items under the adult limit of 10","B) They can borrow the 8 children''s books for 2 weeks and the 3 novels for 3 weeks separately","C) They cannot borrow adult novels on a children''s card","D) They can only borrow 10 items total, so they must choose between books"]',
1,'Children''s items have a 2-week loan; adult items have a 3-week loan. The borrowing periods differ by category, so the 8 and 3 would be borrowed under separate loan periods — both within individual limits.'),

-- R2 Set 3 — Medium (Bus Route Map)
('R2',3,'City Transit — Route 12 Schedule and Map','Read the passage and timetable, then answer the questions.','City Transit — Passenger Information','medium',1,
E'Route 12 operates between Westgate Terminal and Eastfield Station, with stops at City Hall, Central Market, and Riverside Park. On weekdays, buses depart Westgate every 20 minutes from 6:00 AM to 9:00 PM. On weekends, service runs every 30 minutes from 8:00 AM to 6:00 PM. The journey from Westgate to Eastfield takes approximately 35 minutes with no delays.\n\nNote: Effective Saturday May 3rd, Route 12 weekend service will be suspended between Central Market and Eastfield Station due to road construction. A shuttle bus will operate between Central Market and Eastfield Station every 40 minutes.\n\nTIMETABLE (Saturday May 3 — Westgate departures):\n8:00 AM, 8:30 AM, 9:00 AM, 9:30 AM … (every 30 min to 6:00 PM)\nShuttle (Central Market → Eastfield): 8:20 AM, 9:00 AM, 9:40 AM … (every 40 min)',
'How often does Route 12 run on weekdays?',
'["A) Every 15 minutes","B) Every 20 minutes","C) Every 30 minutes","D) Every 40 minutes"]',
1,'The passage states: "buses depart Westgate every 20 minutes from 6:00 AM to 9:00 PM" on weekdays.'),

('R2',3,'City Transit — Route 12 Schedule and Map','Read the passage and timetable, then answer the questions.','City Transit — Passenger Information','medium',2,NULL,
'How long does the full Route 12 journey normally take?',
'["A) 20 minutes","B) 30 minutes","C) 35 minutes","D) 40 minutes"]',
2,'The passage states: "The journey from Westgate to Eastfield takes approximately 35 minutes with no delays."'),

('R2',3,'City Transit — Route 12 Schedule and Map','Read the passage and timetable, then answer the questions.','City Transit — Passenger Information','medium',3,NULL,
'A passenger boards the 9:00 AM Route 12 bus from Westgate on Saturday May 3rd. They need to reach Eastfield. What will they need to do?',
'["A) Ride Route 12 directly to Eastfield as usual","B) Take Route 12 to Central Market, then catch the shuttle to Eastfield","C) Wait for a direct bus — the shuttle does not go to Eastfield","D) Take a taxi from Central Market as no alternative is provided"]',
1,'The notice says Route 12 is suspended between Central Market and Eastfield on May 3rd. Passengers must transfer to the shuttle at Central Market.'),

('R2',3,'City Transit — Route 12 Schedule and Map','Read the passage and timetable, then answer the questions.','City Transit — Passenger Information','hard',4,NULL,
'A passenger arrives at Central Market at 9:10 AM on May 3rd and needs the shuttle to Eastfield. How long will they wait?',
'["A) 10 minutes","B) 20 minutes","C) 30 minutes","D) 40 minutes"]',
2,'The shuttle runs at 9:00 AM, 9:40 AM, etc. (every 40 min). Arriving at 9:10 AM, the next shuttle is at 9:40 AM — a 30-minute wait.'),

('R2',3,'City Transit — Route 12 Schedule and Map','Read the passage and timetable, then answer the questions.','City Transit — Passenger Information','advanced',5,NULL,
'A passenger wants to travel from Westgate to Eastfield on Saturday May 3rd and arrive by 9:15 AM. Which bus should they take?',
'["A) 8:00 AM from Westgate (arrives Central Market ~8:18 AM, shuttle at 8:20 AM → Eastfield by ~9:00 AM)","B) 8:30 AM from Westgate (arrives Central Market ~8:48 AM, shuttle at 9:00 AM → Eastfield by ~9:40 AM)","C) 9:00 AM from Westgate — the Route 12 suspension does not apply before 9 AM","D) Either the 8:00 or 8:30 bus — both arrive before 9:15 AM"]',
0,'8:00 AM bus reaches Central Market around 8:18 AM (18 min portion of the route). The 8:20 AM shuttle departs just after, arriving Eastfield roughly 40 min later ≈ 9:00 AM — just within the 9:15 window. The 8:30 AM bus misses the 8:20 shuttle and catches the 9:00 AM one, arriving too late.'),

-- R2 Set 4 — Hard (Office Seating Plan)
('R2',4,'Office Memo — New Seating Arrangement','Read the memo and seating plan, then answer the questions.','Corporate — Office Administration','hard',1,
E'MEMO\nTo: All Staff, Floor 3\nFrom: Facilities Management\nRe: Revised Seating Plan — Effective Monday March 10\n\nFollowing the expansion of the Sales team, we are updating the seating arrangement on Floor 3. Please review the changes carefully and ensure you are seated in your assigned location by 9:00 AM on Monday.\n\nKey changes:\n- The Sales team (6 staff) will now occupy the east wing (Desks E1–E6)\n- The Marketing team (4 staff) moves from the east wing to the central area (Desks C1–C4)\n- The IT team remains in the west wing (Desks W1–W5)\n- The large meeting room (Room 3A) will now be a dedicated Sales war room and is no longer available for general booking\n- The small meeting room (Room 3B) remains bookable by all staff via the online calendar\n\nSEATING PLAN:\nWest Wing: IT (W1–W5)\nCentral: Marketing (C1–C4)\nEast Wing: Sales (E1–E6)\nRoom 3A: Sales war room (Sales only)\nRoom 3B: Bookable meeting room (all staff)',
'Where will the Marketing team sit after March 10?',
'["A) East wing, Desks E1–E4","B) West wing, Desks W1–W4","C) Central area, Desks C1–C4","D) They stay in the east wing"]',
2,'The memo states: "the Marketing team moves from the east wing to the central area (Desks C1–C4)."'),

('R2',4,'Office Memo — New Seating Arrangement','Read the memo and seating plan, then answer the questions.','Corporate — Office Administration','hard',2,NULL,
'Which meeting room can all staff still book?',
'["A) Room 3A","B) Room 3B","C) Both rooms","D) Neither — all rooms are now reserved"]',
1,'Room 3A is now the Sales war room. "Room 3B remains bookable by all staff via the online calendar."'),

('R2',4,'Office Memo — New Seating Arrangement','Read the memo and seating plan, then answer the questions.','Corporate — Office Administration','hard',3,NULL,
'Why is the seating plan changing?',
'["A) The IT team is being relocated to another floor","B) The office is undergoing a renovation","C) The Sales team has expanded and needs more space","D) Marketing and Sales are merging into one department"]',
2,'The memo states: "Following the expansion of the Sales team, we are updating the seating arrangement."'),

('R2',4,'Office Memo — New Seating Arrangement','Read the memo and seating plan, then answer the questions.','Corporate — Office Administration','hard',4,NULL,
'How many desks does the Sales team now occupy?',
'["A) Four","B) Five","C) Six","D) Eight"]',
2,'The east wing has desks E1–E6 — six desks for the Sales team.'),

('R2',4,'Office Memo — New Seating Arrangement','Read the memo and seating plan, then answer the questions.','Corporate — Office Administration','advanced',5,NULL,
'A Marketing employee wants to book Room 3A for a team brainstorming session next week. Based on the memo, what should they do?',
'["A) Book it through the online calendar as usual","B) Ask Sales for permission since they now control it","C) Book Room 3B instead — Room 3A is no longer available to them","D) Ask Facilities Management to make a special exception"]',
2,'Room 3A is now a "dedicated Sales war room" and is "no longer available for general booking." Room 3B is the only option available to all staff.'),

-- R2 Set 5 — Advanced (Hospital Visitor Policy)
('R2',5,'Hospital — Visitor Policy and Ward Map','Read the passage and ward map, then answer the questions.','Healthcare — Visitor Information','advanced',1,
E'Eastview General Hospital has updated its visitor policy effective January 1st. Visiting hours are 10:00 AM to 8:00 PM daily. Each patient may receive a maximum of two visitors at one time. Children under 12 are not permitted in the Intensive Care Unit (ICU) or the Oncology Ward.\n\nAll visitors must check in at the main reception on the ground floor and receive a visitor pass before proceeding to any ward. Passes are valid for the day of issue only. Visitors to the ICU must also obtain secondary authorization from the nursing station on Floor 2 before entering.\n\nWARD MAP:\nGround Floor: Reception, Emergency, Radiology\nFloor 1: General Medical (Wards A, B), Maternity\nFloor 2: ICU, Oncology\nFloor 3: Surgical Recovery, Rehabilitation',
'What is the maximum number of visitors allowed with a patient at one time?',
'["A) One","B) Two","C) Three","D) Four"]',
1,'The policy states: "Each patient may receive a maximum of two visitors at one time."'),

('R2',5,'Hospital — Visitor Policy and Ward Map','Read the passage and ward map, then answer the questions.','Healthcare — Visitor Information','advanced',2,NULL,
'Where must all visitors go before going to any ward?',
'["A) The nursing station on Floor 2","B) The emergency department","C) Main reception on the ground floor","D) The ward entrance directly"]',
2,'The policy states: "All visitors must check in at the main reception on the ground floor and receive a visitor pass."'),

('R2',5,'Hospital — Visitor Policy and Ward Map','Read the passage and ward map, then answer the questions.','Healthcare — Visitor Information','advanced',3,NULL,
'A 10-year-old child wants to visit a grandparent in the Oncology Ward. Is this permitted?',
'["A) Yes, as long as an adult accompanies them","B) Yes, children under 12 are only restricted from the ICU","C) No, children under 12 are not permitted in the Oncology Ward","D) It depends on the patient''s doctor''s approval"]',
2,'The policy explicitly states: "Children under 12 are not permitted in the Intensive Care Unit (ICU) or the Oncology Ward."'),

('R2',5,'Hospital — Visitor Policy and Ward Map','Read the passage and ward map, then answer the questions.','Healthcare — Visitor Information','advanced',4,NULL,
'A visitor wants to see a patient in the ICU. What two steps must they complete before entering?',
'["A) Check in at reception and get approval from the attending physician","B) Check in at reception for a visitor pass, then get secondary authorization at the Floor 2 nursing station","C) Call ahead to book a visiting slot, then check in at reception","D) Get a visitor pass from reception and sign a waiver at the ICU entrance"]',
1,'The policy describes two steps: get a visitor pass at reception, then "obtain secondary authorization from the nursing station on Floor 2 before entering" the ICU.'),

('R2',5,'Hospital — Visitor Policy and Ward Map','Read the passage and ward map, then answer the questions.','Healthcare — Visitor Information','advanced',5,NULL,
'Visitor passes are valid "for the day of issue only." What is the likely reason for this policy?',
'["A) The hospital wants to charge a daily fee for passes","B) It limits unauthorized access and ensures all visitors check in each day they visit","C) It prevents visitors from staying overnight in the building","D) It is required by provincial health regulations for all hospitals"]',
1,'A single-day pass means every visitor must check in at reception each day, ensuring security staff track who is in the building each day. This limits unauthorized repeat access and maintains accurate visitor records.'),


-- ──────────────────────────────────────────────────────────
-- R3 — INFORMATION  (5 sets)
-- ──────────────────────────────────────────────────────────

-- R3 Set 1 — Easy (Urban Beekeeping)
('R3',1,'The Rise of Urban Beekeeping in Canadian Cities','Read the passage below, then answer the questions.','General Interest — Environment','easy',1,
E'Urban beekeeping has grown steadily across Canadian cities over the past decade, driven by a combination of environmental concern, community food initiatives, and changing municipal regulations. Cities like Toronto, Vancouver, and Montreal now permit residential beekeeping under specific conditions, and rooftop hives have become a visible presence in many downtown neighbourhoods.\n\nProponents argue that urban bees provide measurable ecological benefits. Because cities are often warmer than surrounding rural areas and contain a diverse range of flowering plants in gardens and parks, urban bees can actually thrive more consistently than their rural counterparts. Studies from several European cities have shown higher honey production per hive in urban environments compared to agricultural zones, largely because monoculture farming reduces the variety of plants available to rural bees.\n\nCritics, however, raise concerns about the welfare of bees kept in high-density areas. Without the biodiversity of natural landscapes, urban bees may face nutritional gaps if flowering sources are limited or seasonal. There are also concerns about the spread of disease between hives kept in close proximity, and about what happens to colonies when inexperienced hobby beekeepers abandon the practice.\n\nDespite these debates, urban beekeeping continues to expand. Many cities now offer training programs and community hive projects that allow residents to participate without managing a hive individually. Whether urban beekeeping represents a meaningful contribution to pollinator health or simply a well-intentioned hobby remains an open question — but its presence in Canadian cities shows no sign of diminishing.',
'Which cities are named as permitting residential beekeeping?',
'["A) Ottawa, Calgary, Halifax","B) Toronto, Vancouver, Montreal","C) Edmonton, Winnipeg, Quebec City","D) Hamilton, Victoria, Saskatoon"]',
1,'The first paragraph names Toronto, Vancouver, and Montreal.'),

('R3',1,'The Rise of Urban Beekeeping in Canadian Cities','Read the passage below, then answer the questions.','General Interest — Environment','easy',2,NULL,
'What three factors have driven urban beekeeping growth?',
'["A) Government grants, technology, and social media","B) Environmental concern, food initiatives, and changing regulations","C) Declining rural bee populations, rising honey prices, and tourism","D) Hobby culture, cheaper equipment, and relaxed zoning laws"]',
1,'The opening sentence lists: "environmental concern, community food initiatives, and changing municipal regulations."'),

('R3',1,'The Rise of Urban Beekeeping in Canadian Cities','Read the passage below, then answer the questions.','General Interest — Environment','medium',3,NULL,
'Why might urban bees produce more honey than rural bees?',
'["A) Urban beekeepers are better trained","B) Cities are cooler, slowing honey consumption","C) Monoculture farming limits plant variety for rural bees","D) Urban hives are in more controlled conditions"]',
2,'The passage explains higher urban production is "largely because monoculture farming reduces the variety of plants available to rural bees."'),

('R3',1,'The Rise of Urban Beekeeping in Canadian Cities','Read the passage below, then answer the questions.','General Interest — Environment','hard',4,NULL,
'What concern do critics raise about disease?',
'["A) Urban pollution weakens bees'' immune systems","B) Hives close together make disease spread easier","C) Imported species bring new diseases","D) Urban bees infect community gardens"]',
1,'Critics mention "concerns about the spread of disease between hives kept in close proximity."'),

('R3',1,'The Rise of Urban Beekeeping in Canadian Cities','Read the passage below, then answer the questions.','General Interest — Environment','advanced',5,NULL,
'What best reflects the author''s overall position on urban beekeeping?',
'["A) Strongly supports it and wants expansion","B) Presents a balanced view of benefits and risks","C) Believes it is harmful and needs stricter regulation","D) Uncertain if bees survive in cities — calls for research"]',
1,'The passage presents both sides without taking a stance, ending with "an open question." This is a balanced, impartial perspective.'),

-- R3 Set 2 — Easy (Canadian Minimum Wage)
('R3',2,'Minimum Wage in Canada: A Provincial Patchwork','Read the passage below, then answer the questions.','Social Policy — Labour','easy',1,
E'Unlike many countries where a single federal minimum wage applies to all workers, Canada sets minimum wages at the provincial and territorial level. As of 2024, rates range from approximately $15.00 per hour in some provinces to over $17.00 per hour in others. Ontario, British Columbia, and Alberta consistently rank among the highest, while several Atlantic provinces remain below the national average.\n\nThe rationale for provincial variation is that the cost of living differs significantly across the country. Housing, transportation, and food costs in Vancouver or Toronto are substantially higher than in rural Nova Scotia or New Brunswick. Advocates for a national minimum wage argue that workers deserve a baseline standard regardless of where they live. Opponents contend that a single rate would harm smaller regional economies where businesses cannot absorb the same labour costs as large urban firms.\n\nSeveral provinces have introduced automatic annual increases tied to inflation, a policy designed to prevent wages from eroding over time. Critics of this approach argue that tying wages to inflation alone does not adequately address the gap between wages and actual living costs, particularly in rapidly growing urban centres.',
'Who sets minimum wages in Canada?',
'["A) The federal government for all workers","B) Each province and territory individually","C) A joint federal-provincial committee","D) The Bank of Canada based on inflation data"]',
1,'The passage opens: "Canada sets minimum wages at the provincial and territorial level."'),

('R3',2,'Minimum Wage in Canada: A Provincial Patchwork','Read the passage below, then answer the questions.','Social Policy — Labour','easy',2,NULL,
'Which provinces are named as having among the highest minimum wages?',
'["A) Nova Scotia, New Brunswick, and PEI","B) Ontario, British Columbia, and Alberta","C) Quebec, Manitoba, and Saskatchewan","D) Newfoundland, Yukon, and the Northwest Territories"]',
1,'The passage states: "Ontario, British Columbia, and Alberta consistently rank among the highest."'),

('R3',2,'Minimum Wage in Canada: A Provincial Patchwork','Read the passage below, then answer the questions.','Social Policy — Labour','medium',3,NULL,
'What is the main argument FOR allowing provincial variation in minimum wages?',
'["A) It gives businesses more freedom to pay workers less","B) Cost of living varies significantly across the country","C) Provinces have more experience managing labour markets","D) Federal interference in wages is unconstitutional"]',
1,'The passage states: "The rationale for provincial variation is that the cost of living differs significantly across the country."'),

('R3',2,'Minimum Wage in Canada: A Provincial Patchwork','Read the passage below, then answer the questions.','Social Policy — Labour','hard',4,NULL,
'What criticism is raised about tying wages to inflation?',
'["A) Inflation data is often inaccurate and unreliable","B) It causes wages to rise faster than businesses can manage","C) It does not close the gap between wages and actual living costs","D) It only benefits workers in provinces with high inflation rates"]',
2,'The passage states critics argue "tying wages to inflation alone does not adequately address the gap between wages and actual living costs."'),

('R3',2,'Minimum Wage in Canada: A Provincial Patchwork','Read the passage below, then answer the questions.','Social Policy — Labour','advanced',5,NULL,
'The passage describes Canada''s minimum wage system as a "patchwork." This metaphor suggests:',
'["A) The system is colourful and well-designed","B) The system is fragmented and inconsistent across regions","C) Workers are poorly paid across all provinces","D) The government has no control over wages"]',
1,'A patchwork is made of many uneven, mismatched pieces. Here it suggests the wage system is varied and inconsistent — differing by province without a unified national standard.'),

-- R3 Set 3 — Medium (Sleep Science)
('R3',3,'Why Sleep Matters More Than You Think','Read the passage below, then answer the questions.','Health & Science — General Interest','medium',1,
E'Sleep is increasingly recognized by researchers as one of the most powerful factors affecting physical and cognitive health. Despite this, surveys consistently show that a significant portion of adults in developed countries sleep fewer than the recommended seven to nine hours per night. The consequences, scientists warn, extend far beyond feeling tired.\n\nDuring sleep, the brain undergoes a process of cellular repair and memory consolidation. The glymphatic system — a network of channels that clears waste from the brain — is most active during deep sleep stages. Inadequate sleep has been linked to higher rates of Alzheimer''s disease, partly because the protein associated with the disease accumulates faster when sleep is disrupted.\n\nBeyond neurology, chronic sleep deprivation is associated with increased risk of cardiovascular disease, type 2 diabetes, and obesity. Sleep affects hormone regulation: insufficient sleep elevates cortisol (the stress hormone) and disrupts leptin and ghrelin, the hormones that control appetite. This disruption can increase cravings for high-calorie food and reduce the body''s ability to process glucose efficiently.\n\nDespite the evidence, sleep is often treated as a luxury rather than a health necessity. Cultural attitudes that equate long working hours with productivity, combined with the prevalence of screens before bedtime, continue to undermine healthy sleep habits across populations.',
'How many hours of sleep per night do researchers recommend for adults?',
'["A) Five to six hours","B) Six to eight hours","C) Seven to nine hours","D) Eight to ten hours"]',
2,'The passage states: "fewer than the recommended seven to nine hours per night."'),

('R3',3,'Why Sleep Matters More Than You Think','Read the passage below, then answer the questions.','Health & Science — General Interest','medium',2,NULL,
'What is the glymphatic system?',
'["A) A system that regulates appetite hormones during sleep","B) A network of channels that clears waste from the brain","C) The part of the brain responsible for memory storage","D) A biological clock that controls sleep cycles"]',
1,'The passage defines it as "a network of channels that clears waste from the brain."'),

('R3',3,'Why Sleep Matters More Than You Think','Read the passage below, then answer the questions.','Health & Science — General Interest','medium',3,NULL,
'How does poor sleep affect appetite?',
'["A) It reduces the production of cortisol, making people less hungry","B) It disrupts leptin and ghrelin, increasing cravings for high-calorie food","C) It slows metabolism, making weight loss impossible","D) It causes the stomach to shrink, reducing hunger signals"]',
1,'The passage explains that sleep deprivation "disrupts leptin and ghrelin, the hormones that control appetite. This disruption can increase cravings for high-calorie food."'),

('R3',3,'Why Sleep Matters More Than You Think','Read the passage below, then answer the questions.','Health & Science — General Interest','hard',4,NULL,
'Why is inadequate sleep linked to a higher risk of Alzheimer''s disease?',
'["A) Sleep deprivation accelerates ageing of brain cells","B) A protein associated with Alzheimer''s accumulates faster when sleep is disrupted","C) The brain cannot form new memories without sufficient sleep","D) Lack of sleep increases inflammation that destroys neurons"]',
1,'The passage states: "the protein associated with the disease accumulates faster when sleep is disrupted."'),

('R3',3,'Why Sleep Matters More Than You Think','Read the passage below, then answer the questions.','Health & Science — General Interest','advanced',5,NULL,
'The author says sleep is "often treated as a luxury rather than a health necessity." This contrast implies:',
'["A) Sleep is genuinely optional for people with busy schedules","B) Society undervalues sleep despite strong scientific evidence of its importance","C) Wealthy people sleep more because they can afford to","D) Sleep research is not yet conclusive enough to change public behaviour"]',
1,'The contrast between "luxury" (perceived as optional/indulgent) and "health necessity" (medically required) highlights a gap between public attitude and scientific reality. The author is critiquing a cultural misunderstanding.'),

-- R3 Set 4 — Hard (Urban Heat Islands)
('R3',4,'Urban Heat Islands: The Hidden Climate of Cities','Read the passage below, then answer the questions.','Environment & Urban Planning','hard',1,
E'Urban heat islands (UHIs) are a well-documented phenomenon in which cities experience significantly higher temperatures than the surrounding rural areas. The primary cause is the replacement of natural vegetation with heat-absorbing surfaces: asphalt roads, concrete buildings, and dark rooftops absorb solar radiation during the day and release it slowly at night, preventing the urban environment from cooling at the same rate as adjacent countryside.\n\nThe effect is measurable: cities can be 1 to 7 degrees Celsius warmer than nearby rural areas, with the greatest differences occurring on calm, clear nights. This thermal gap has serious consequences — elevated temperatures increase energy consumption for cooling, worsen air quality by accelerating the formation of ground-level ozone, and significantly increase heat-related illness and death, particularly among elderly populations and those without air conditioning.\n\nMitigating UHIs requires addressing their structural causes. Green roofs — layers of vegetation installed on building tops — reduce heat absorption and provide insulation. Expanding urban tree canopy cools streets through shade and evapotranspiration. Reflective or "cool" paving materials reduce solar heat gain at street level. Several Canadian cities have begun integrating these measures into building codes and urban planning frameworks, though implementation remains uneven and largely voluntary.\n\nAs climate change intensifies heatwaves globally, the risks posed by UHIs are expected to grow. Researchers note that cities with high proportions of elderly residents, limited green space, and dense older building stock face disproportionate risk — creating both a public health and an equity challenge.',
'What is the primary cause of urban heat islands?',
'["A) Increased vehicle traffic producing exhaust heat","B) Industrial manufacturing releasing thermal energy","C) Replacement of vegetation with heat-absorbing surfaces like asphalt and concrete","D) Reduced wind speed in cities compared to rural areas"]',
2,'The passage states: "The primary cause is the replacement of natural vegetation with heat-absorbing surfaces: asphalt roads, concrete buildings, and dark rooftops."'),

('R3',4,'Urban Heat Islands: The Hidden Climate of Cities','Read the passage below, then answer the questions.','Environment & Urban Planning','hard',2,NULL,
'By how much can cities be warmer than nearby rural areas?',
'["A) 0.5 to 2 degrees Celsius","B) 1 to 7 degrees Celsius","C) 5 to 10 degrees Celsius","D) 3 to 5 degrees Celsius"]',
1,'The passage states: "cities can be 1 to 7 degrees Celsius warmer than nearby rural areas."'),

('R3',4,'Urban Heat Islands: The Hidden Climate of Cities','Read the passage below, then answer the questions.','Environment & Urban Planning','hard',3,NULL,
'How do green roofs help reduce urban heat?',
'["A) They reflect sunlight away from buildings using white paint","B) They pump cooled air into the building below","C) They reduce heat absorption and provide insulation","D) They filter pollutants from the air around buildings"]',
2,'The passage states: "Green roofs — layers of vegetation installed on building tops — reduce heat absorption and provide insulation."'),

('R3',4,'Urban Heat Islands: The Hidden Climate of Cities','Read the passage below, then answer the questions.','Environment & Urban Planning','hard',4,NULL,
'According to the passage, which populations face the greatest risk from urban heat islands?',
'["A) Children under five and pregnant women","B) Outdoor workers and athletes","C) Elderly populations and those without air conditioning","D) Residents of newer, high-rise buildings"]',
2,'The passage states: "significantly increase heat-related illness and death, particularly among elderly populations and those without air conditioning."'),

('R3',4,'Urban Heat Islands: The Hidden Climate of Cities','Read the passage below, then answer the questions.','Environment & Urban Planning','advanced',5,NULL,
'The author describes UHIs as creating "both a public health and an equity challenge." What does calling it an equity challenge add to the argument?',
'["A) It suggests that UHIs are caused by inequality in city planning","B) It implies that the health risks are not distributed equally — vulnerable groups are disproportionately affected","C) It argues that wealthy residents should pay more for cooling infrastructure","D) It suggests that UHI research has been unfairly underfunded"]',
1,'An equity challenge means the harms fall disproportionately on certain groups — here, elderly, lower-income residents with no AC in dense older buildings. Calling it an equity issue goes beyond health risk to highlight unfair distribution of that risk.'),

-- R3 Set 5 — Advanced (Cognitive Bias)
('R3',5,'Confirmation Bias and the Limits of Self-Awareness','Read the passage below, then answer the questions.','Psychology — Critical Thinking','advanced',1,
E'Confirmation bias — the tendency to search for, interpret, and recall information in a way that confirms one''s pre-existing beliefs — is one of the most studied and consequential cognitive biases in psychology. Unlike many biases that operate unconsciously, confirmation bias persists even when individuals are aware of it. Simply knowing that you are susceptible to a bias does not reliably reduce its influence on your reasoning.\n\nThe mechanism operates at multiple levels. At the information-gathering stage, people tend to seek out sources that align with their views and avoid or discount those that challenge them. At the interpretation stage, ambiguous evidence is almost always read in ways consistent with existing beliefs. At the memory stage, confirming evidence is more easily recalled than disconfirming evidence — a phenomenon known as selective recall.\n\nThe implications are significant in several domains. In medicine, confirmation bias can lead clinicians to favour a diagnosis they formed early and overlook contradictory symptoms. In law, it can cause investigators to pursue evidence consistent with their initial theory of a crime and give less weight to exculpatory findings. In everyday decision-making, it reinforces existing choices rather than prompting genuine re-evaluation.\n\nCounteracting confirmation bias requires deliberate structural interventions: seeking out opposing viewpoints actively, using pre-registered hypotheses in research, and establishing processes — such as red-teaming — that institutionalize dissent. Individual willpower alone is insufficient.',
'What is confirmation bias?',
'["A) The tendency to change your beliefs based on new information","B) The tendency to seek and recall information that confirms existing beliefs","C) The inability to form opinions without consulting others","D) A bias toward negative rather than positive information"]',
1,'The passage defines it as "the tendency to search for, interpret, and recall information in a way that confirms one''s pre-existing beliefs."'),

('R3',5,'Confirmation Bias and the Limits of Self-Awareness','Read the passage below, then answer the questions.','Psychology — Critical Thinking','advanced',2,NULL,
'What is "selective recall" as described in the passage?',
'["A) Deliberately choosing which memories to share with others","B) The tendency to remember confirming evidence more easily than disconfirming evidence","C) A medical condition causing memory loss after biased thinking","D) The process of selectively reading only confirming sources"]',
1,'The passage defines it: "Confirming evidence is more easily recalled than disconfirming evidence — a phenomenon known as selective recall."'),

('R3',5,'Confirmation Bias and the Limits of Self-Awareness','Read the passage below, then answer the questions.','Psychology — Critical Thinking','advanced',3,NULL,
'According to the passage, what happens when someone becomes aware of their confirmation bias?',
'["A) Awareness reliably reduces the bias''s influence","B) They become immune to it in professional settings","C) Awareness alone does not reliably reduce the bias","D) They tend to overcorrect and become too sceptical"]',
2,'The passage states: "Simply knowing that you are susceptible to a bias does not reliably reduce its influence on your reasoning."'),

('R3',5,'Confirmation Bias and the Limits of Self-Awareness','Read the passage below, then answer the questions.','Psychology — Critical Thinking','advanced',4,NULL,
'In legal investigations, how does confirmation bias cause harm?',
'["A) It causes lawyers to argue too confidently in court","B) Investigators pursue evidence matching their initial theory and discount exculpatory findings","C) Judges favour defendants who present more confirming evidence","D) It prevents investigators from forming any initial theory of the crime"]',
1,'The passage states confirmation bias "can cause investigators to pursue evidence consistent with their initial theory of a crime and give less weight to exculpatory findings."'),

('R3',5,'Confirmation Bias and the Limits of Self-Awareness','Read the passage below, then answer the questions.','Psychology — Critical Thinking','advanced',5,NULL,
'The author argues that "individual willpower alone is insufficient" to counteract confirmation bias. What does this imply about the nature of the bias?',
'["A) It affects only people who lack discipline or intelligence","B) It is so deeply embedded that structural and institutional solutions are required","C) It can be cured through therapy and self-reflection","D) It is primarily a problem for professionals, not ordinary people"]',
1,'Saying willpower is insufficient implies the bias operates below the level of conscious control — you cannot simply decide to stop. The author argues structural interventions (red-teaming, pre-registration) are needed, implying the bias is systemic, not just personal.'),


-- ──────────────────────────────────────────────────────────
-- R4 — VIEWPOINTS  (5 sets)
-- ──────────────────────────────────────────────────────────

-- R4 Set 1 — Easy (Remote Work)
('R4',1,'Should Remote Work Become a Permanent Right?','Read both viewpoints, then answer the questions.','Opinion — Workplace Policy','easy',1,
E'VIEWPOINT A — Maria Delacroix, HR Director\n\nRemote work has proven itself. Productivity data from our organization shows no decline in output, employee satisfaction scores are at an all-time high, and we have successfully hired talent from cities we could not previously recruit from. The commute is the most universally disliked part of work life, and eliminating it has given employees back hours every week. Companies that refuse to offer flexible work will simply lose their best people to competitors who do.\n\nThat said, remote work is not appropriate for every role or every employee. Some positions require physical presence, and some individuals work better in a structured office environment. What we need is not a blanket policy but a framework that treats remote work as a default right — available to all unless the role requires otherwise.\n\nVIEWPOINT B — Kevin Tanaka, Operations Manager\n\nThe enthusiasm for remote work ignores a significant problem: collaboration suffers. The spontaneous hallway conversation, the whiteboard session, the sense of shared momentum in a team working toward the same goal — these things do not translate to video calls. Junior employees in particular lose out: they learn their craft by being near experienced colleagues, and that informal mentorship disappears when everyone is working from home.\n\nI am not arguing that remote work has no place. For focused, independent tasks, it is often better. But codifying it as a right risks normalizing a model that works well for senior individual contributors and poorly for everyone else. Organizations should retain the authority to determine what arrangements serve their teams best.',
'What is Maria''s job title?',
'["A) Operations Manager","B) HR Director","C) Chief Executive Officer","D) Team Lead"]',
1,'The header states: "Maria Delacroix, HR Director."'),

('R4',1,'Should Remote Work Become a Permanent Right?','Read both viewpoints, then answer the questions.','Opinion — Workplace Policy','easy',2,NULL,
'Which group does Kevin say loses out most from remote work?',
'["A) Senior managers","B) Part-time workers","C) Junior employees","D) IT staff"]',
2,'Kevin writes: "Junior employees in particular lose out: they learn their craft by being near experienced colleagues."'),

('R4',1,'Should Remote Work Become a Permanent Right?','Read both viewpoints, then answer the questions.','Opinion — Workplace Policy','medium',3,NULL,
'What does Maria use as evidence that remote work has succeeded?',
'["A) Cost savings on office rent","B) Productivity data and high satisfaction scores","C) Reduced turnover rates among all employees","D) Better performance reviews for remote workers"]',
1,'Maria cites: "Productivity data from our organization shows no decline in output, employee satisfaction scores are at an all-time high."'),

('R4',1,'Should Remote Work Become a Permanent Right?','Read both viewpoints, then answer the questions.','Opinion — Workplace Policy','hard',4,NULL,
'Kevin says he is "not arguing that remote work has no place." What does this mean?',
'["A) He wants to make remote work mandatory for all staff","B) He accepts remote work for focused tasks but not as a universal right","C) He thinks remote work should be studied before any decision","D) He agrees with Maria that remote work is the future"]',
1,'Kevin acknowledges remote work is "often better" for focused, independent tasks — but opposes making it a codified universal right, since it works poorly for collaboration and junior staff.'),

('R4',1,'Should Remote Work Become a Permanent Right?','Read both viewpoints, then answer the questions.','Opinion — Workplace Policy','advanced',5,NULL,
'On which point do both Maria and Kevin most clearly agree?',
'["A) Remote work should be available to all employees without exception","B) Remote work is not appropriate for every role or individual","C) The commute is the most harmful part of office work","D) Productivity always improves when employees work from home"]',
1,'Maria: "remote work is not appropriate for every role or every employee." Kevin: "For focused, independent tasks, it is often better" — implying other tasks need in-person presence. Both agree it is not universally suitable.'),

-- R4 Set 2 — Easy (Social Media Age Limits)
('R4',2,'Should Social Media Platforms Have a Minimum Age?','Read both viewpoints, then answer the questions.','Opinion — Technology & Youth','easy',1,
E'VIEWPOINT A — Dr. Fiona Wells, Child Psychologist\n\nThe evidence is now difficult to ignore. Rates of anxiety, depression, and body image issues among adolescents have risen sharply over the same period that social media use became widespread. While correlation is not causation, the consistency of findings across multiple countries and age groups suggests a meaningful relationship. Social media platforms are designed by engineers using the same behavioural techniques as slot machines — variable reward, infinite scroll, social comparison. These mechanisms are especially powerful on developing brains.\n\nI support a minimum age of 16 for social media accounts, with identity verification enforced by platforms rather than relying on parental supervision. This is not about banning technology — it is about recognizing that certain products carry age-appropriate risks, just as we do with driving, alcohol, and voting.\n\nVIEWPOINT B — James Okafor, Digital Rights Advocate\n\nAge restrictions on social media sound reasonable until you examine the practical consequences. Identity verification at scale means collecting biometric or government ID data from millions of teenagers — creating privacy risks that may outlast any mental health benefit. Restricting access does not remove the underlying social pressures that drive anxiety; it simply removes one channel through which they operate.\n\nFurthermore, social media provides genuine benefits for many young people: access to supportive communities, creative expression, and civic engagement. For LGBTQ+ youth and young people in isolated communities, online spaces are often vital lifelines. A blunt age restriction removes these benefits for everyone in the name of protecting a subset of vulnerable users. Better regulation — algorithmic transparency, time limits, mental health resources built into platforms — would be more proportionate and effective.',
'What minimum age does Dr. Wells recommend for social media?',
'["A) 13","B) 14","C) 16","D) 18"]',
2,'Dr. Wells states: "I support a minimum age of 16 for social media accounts."'),

('R4',2,'Should Social Media Platforms Have a Minimum Age?','Read both viewpoints, then answer the questions.','Opinion — Technology & Youth','easy',2,NULL,
'What is James Okafor''s job title?',
'["A) Child Psychologist","B) Social Media Executive","C) Digital Rights Advocate","D) Government Policy Advisor"]',
2,'The header states: "James Okafor, Digital Rights Advocate."'),

('R4',2,'Should Social Media Platforms Have a Minimum Age?','Read both viewpoints, then answer the questions.','Opinion — Technology & Youth','medium',3,NULL,
'What is James''s main concern about identity verification?',
'["A) It is too expensive for small platforms to implement","B) It creates privacy risks by collecting sensitive data from teenagers","C) It will be easily bypassed by determined young users","D) It places too much responsibility on parents"]',
1,'James warns: "Identity verification at scale means collecting biometric or government ID data from millions of teenagers — creating privacy risks."'),

('R4',2,'Should Social Media Platforms Have a Minimum Age?','Read both viewpoints, then answer the questions.','Opinion — Technology & Youth','hard',4,NULL,
'Dr. Wells compares social media to driving, alcohol, and voting. What point is she making?',
'["A) Social media is as dangerous as drunk driving","B) Age limits already exist for other risky activities, so restricting social media is consistent","C) Teenagers should not have access to anything until they are adults","D) Social media companies should be regulated like the alcohol industry"]',
1,'She argues that we already accept age-appropriate restrictions for "driving, alcohol, and voting" — applying the same logic to social media is consistent, not extreme.'),

('R4',2,'Should Social Media Platforms Have a Minimum Age?','Read both viewpoints, then answer the questions.','Opinion — Technology & Youth','advanced',5,NULL,
'James proposes "better regulation" as an alternative to age restrictions. Compared to Dr. Wells'' proposal, his approach is best described as:',
'["A) Stricter — it imposes more rules on platforms","B) More targeted — addressing specific harms without restricting access entirely","C) Weaker — it relies on voluntary compliance from companies","D) Unproven — there is no evidence that algorithmic changes help"]',
1,'James proposes "algorithmic transparency, time limits, mental health resources" — addressing the mechanisms of harm while preserving access. This is more targeted than a blanket age ban, which removes all access regardless of individual circumstances.'),

-- R4 Set 3 — Medium (Universal Basic Income)
('R4',3,'Universal Basic Income: Economic Safety Net or Fiscal Fantasy?','Read both viewpoints, then answer the questions.','Opinion — Economics & Social Policy','medium',1,
E'VIEWPOINT A — Sandra Obi, Economist\n\nUniversal Basic Income (UBI) — a regular, unconditional cash payment to all citizens regardless of employment status — deserves serious consideration as automation increasingly displaces workers in sectors from manufacturing to professional services. The existing social safety net was designed for an era of stable employment and is poorly equipped to handle a labour market where large numbers of people cycle between short-term contracts, gig work, and periods of no income.\n\nEvidence from pilot programs in Finland, Kenya, and Stockton, California, shows that recipients of guaranteed income spend it on essentials, improve their mental health, and maintain or increase employment. UBI would simplify a tangled web of means-tested benefits, reduce administrative overhead, and eliminate the "welfare trap" — where earning more income causes benefit clawbacks that make working financially punishing.\n\nVIEWPOINT B — Paul Renner, Fiscal Policy Analyst\n\nThe appeal of UBI lies in its simplicity, but simplicity masks serious problems. The cost of providing even a modest payment to every adult Canadian — say $1,000 per month — would exceed $300 billion annually. This is not a rounding error in the federal budget; it represents a fundamental restructuring of public finances that would either require massive tax increases or crowd out spending on healthcare, education, and infrastructure.\n\nFurthermore, UBI''s universality is its weakness. Directing the same payment to a billionaire and a single parent in poverty dilutes resources and reduces the targeted support available to those who need it most. A well-funded, modernized targeted benefit system would do more for the vulnerable at a fraction of the cost.',
'What does UBI stand for?',
'["A) United Basic Investment","B) Universal Basic Income","C) Uniform Benefit Index","D) Urban Basic Initiative"]',
1,'The passage defines it: "Universal Basic Income (UBI)."'),

('R4',3,'Universal Basic Income: Economic Safety Net or Fiscal Fantasy?','Read both viewpoints, then answer the questions.','Opinion — Economics & Social Policy','medium',2,NULL,
'What does Sandra say evidence from pilot programs shows?',
'["A) UBI causes inflation and reduces work incentives","B) Recipients spend money on luxuries rather than essentials","C) Recipients improve mental health and maintain or increase employment","D) UBI only works in wealthy countries with high GDP"]',
2,'Sandra states: "recipients of guaranteed income spend it on essentials, improve their mental health, and maintain or increase employment."'),

('R4',3,'Universal Basic Income: Economic Safety Net or Fiscal Fantasy?','Read both viewpoints, then answer the questions.','Opinion — Economics & Social Policy','medium',3,NULL,
'What is the "welfare trap" mentioned by Sandra?',
'["A) A system where wealthy people also receive benefits they do not need","B) A situation where earning more income triggers benefit reductions that make working financially punishing","C) A bureaucratic process that delays benefit payments for months","D) A trap where unemployed people become too dependent on welfare to seek work"]',
1,'Sandra defines it as: "where earning more income causes benefit clawbacks that make working financially punishing."'),

('R4',3,'Universal Basic Income: Economic Safety Net or Fiscal Fantasy?','Read both viewpoints, then answer the questions.','Opinion — Economics & Social Policy','hard',4,NULL,
'Paul argues that UBI''s universality is "its weakness." What does he mean?',
'["A) Everyone receiving the same payment leads to inflation","B) Giving the same amount to everyone — rich or poor — dilutes resources and reduces targeted support for those who need it most","C) Universal programs are harder to administer than targeted ones","D) A universal payment cannot address regional cost-of-living differences"]',
1,'Paul argues that paying a billionaire and a single parent the same amount wastes resources — money that could be concentrated on those in genuine need.'),

('R4',3,'Universal Basic Income: Economic Safety Net or Fiscal Fantasy?','Read both viewpoints, then answer the questions.','Opinion — Economics & Social Policy','advanced',5,NULL,
'Both Sandra and Paul acknowledge a problem with the current benefits system. What is the key difference in how they propose to fix it?',
'["A) Sandra wants to eliminate all benefits; Paul wants to keep them unchanged","B) Sandra proposes replacing the current system with UBI; Paul proposes modernizing targeted benefits instead","C) Sandra focuses on mental health; Paul focuses only on financial outcomes","D) Sandra supports government spending cuts; Paul supports tax increases"]',
1,'Sandra wants UBI to replace the "tangled web of means-tested benefits." Paul wants "a well-funded, modernized targeted benefit system" — improving the existing targeted approach rather than replacing it with universality.'),

-- R4 Set 4 — Hard (Nuclear Energy)
('R4',4,'Should Canada Expand Nuclear Energy?','Read both viewpoints, then answer the questions.','Opinion — Energy Policy & Environment','hard',1,
E'VIEWPOINT A — Dr. Amara Diallo, Energy Policy Researcher\n\nThe climate math is unforgiving. To reach net-zero by 2050, Canada must decarbonize its electricity grid while also electrifying transportation and heating — nearly tripling electricity demand. Renewables are essential, but they have a fundamental limitation: intermittency. Wind doesn''t always blow; the sun doesn''t always shine. Grid-scale battery storage remains expensive and limited. Nuclear energy provides firm, low-carbon baseload power that complements renewables without depending on weather or geography.\n\nModern reactor designs — including small modular reactors (SMRs) — are safer, more flexible, and can be built at lower cost than legacy plants. Canada already has world-class expertise in CANDU reactor technology. Expanding nuclear is not a retreat from clean energy ambition; it is a practical bridge to a fully decarbonized grid.\n\nVIEWPOINT B — Linda Cho, Environmental Campaigner\n\nNuclear energy''s proponents speak of its potential as if the problems of the past have been solved. They have not. The question of long-term radioactive waste storage remains unresolved globally — Canada included. We are building power plants today whose waste will remain hazardous for tens of thousands of years, with no permanent storage solution in place.\n\nMoreover, the economics do not support the enthusiasm. Every major nuclear construction project in the West in recent decades has come in massively over budget and years behind schedule — Hinkley Point C in the UK being the most prominent recent example. SMRs sound promising in theory, but no commercial SMR has yet been deployed at scale. In the time and money it would take to build even one nuclear plant, we could deploy vast amounts of solar and wind capacity that are already cost-competitive today.',
'What does SMR stand for?',
'["A) Standard Modular Reactor","B) Small Modular Reactor","C) Safe Modern Reactor","D) Scaled Municipal Reactor"]',
1,'The passage states: "small modular reactors (SMRs)."'),

('R4',4,'Should Canada Expand Nuclear Energy?','Read both viewpoints, then answer the questions.','Opinion — Energy Policy & Environment','hard',2,NULL,
'What limitation of renewables does Dr. Diallo identify?',
'["A) They produce too much power in summer and not enough in winter","B) They are too expensive to build in northern climates","C) They are intermittent — wind and solar do not always generate power","D) They require more land than nuclear plants"]',
2,'Dr. Diallo states: "renewables… have a fundamental limitation: intermittency. Wind doesn''t always blow; the sun doesn''t always shine."'),

('R4',4,'Should Canada Expand Nuclear Energy?','Read both viewpoints, then answer the questions.','Opinion — Energy Policy & Environment','hard',3,NULL,
'What is Linda''s primary concern about nuclear waste?',
'["A) It is being illegally transported to other countries","B) The storage facilities are leaking and contaminating groundwater","C) There is no permanent storage solution for waste that remains hazardous for thousands of years","D) Nuclear waste is increasing cancer rates near existing plants"]',
2,'Linda states: "The question of long-term radioactive waste storage remains unresolved globally… We are building power plants today whose waste will remain hazardous for tens of thousands of years, with no permanent storage solution in place."'),

('R4',4,'Should Canada Expand Nuclear Energy?','Read both viewpoints, then answer the questions.','Opinion — Energy Policy & Environment','hard',4,NULL,
'Linda mentions Hinkley Point C. What point does this example support?',
'["A) Nuclear energy is unsafe when built near populated areas","B) Nuclear construction projects frequently exceed budget and schedule","C) The UK has abandoned its nuclear energy ambitions","D) SMRs are a better alternative to traditional large reactors"]',
1,'Linda says "every major nuclear construction project in the West… has come in massively over budget and years behind schedule" and cites Hinkley Point C as "the most prominent recent example."'),

('R4',4,'Should Canada Expand Nuclear Energy?','Read both viewpoints, then answer the questions.','Opinion — Energy Policy & Environment','advanced',5,NULL,
'Both Dr. Diallo and Linda agree that climate change is a serious problem requiring action. Their disagreement is best described as:',
'["A) A disagreement about whether climate change is real","B) A disagreement about the best technology to decarbonize the electricity grid","C) A disagreement about whether Canada should reach net-zero at all","D) A disagreement about the cost of renewable energy"]',
1,'Both accept the need to decarbonize. Dr. Diallo argues nuclear is necessary alongside renewables; Linda argues renewables alone are sufficient and nuclear introduces unacceptable risks and costs. The disagreement is about the right tool, not the goal.'),

-- R4 Set 5 — Advanced (Mandatory Voting)
('R4',5,'Should Voting Be Mandatory in Canada?','Read both viewpoints, then answer the questions.','Opinion — Democracy & Civics','advanced',1,
E'VIEWPOINT A — Professor Elena Vasquez, Political Scientist\n\nDemocracy functions best when it reflects the will of all citizens, not just the motivated minority who choose to show up on election day. In Canada, federal voter turnout has hovered between 60 and 68 percent in recent elections — meaning that governments are elected by a fraction of eligible voters. The predictable consequence is that political parties target their policies at groups most likely to vote: older, wealthier, and already politically engaged citizens.\n\nMandatory voting — as practised in Australia, Belgium, and Luxembourg, among others — produces turnout above 90 percent and forces parties to develop platforms that appeal to the full electorate rather than an activist base. It treats voting as a civic duty equivalent to jury service or paying taxes: something we require of citizens because functioning democratic institutions depend on it.\n\nVIEWPOINT B — Marcus Bell, Civil Liberties Lawyer\n\nThe state compelling a citizen to perform a political act — even the minimal act of marking a ballot — crosses a fundamental line. Freedom of political expression necessarily includes the freedom not to participate. Compelled voting does not produce an informed electorate; it produces a larger pool of disengaged voters who mark ballots randomly or spoil them in protest, potentially distorting election outcomes rather than improving them.\n\nAustralia''s example is cited often but examined rarely. Australian law technically requires attendance at a polling station, not a valid vote — and spoiled ballots run at approximately 5 percent. If the goal is a more representative democracy, the better path is removing structural barriers to participation: automatic voter registration, expanded polling locations, and making election day a public holiday.',
'Which countries does Professor Vasquez cite as examples of mandatory voting?',
'["A) France, Germany, and Italy","B) Australia, Belgium, and Luxembourg","C) Brazil, Argentina, and Uruguay","D) Sweden, Norway, and Denmark"]',
1,'The passage states: "as practised in Australia, Belgium, and Luxembourg, among others."'),

('R4',5,'Should Voting Be Mandatory in Canada?','Read both viewpoints, then answer the questions.','Opinion — Democracy & Civics','advanced',2,NULL,
'What voter turnout range does Professor Vasquez cite for recent Canadian federal elections?',
'["A) 45–55 percent","B) 55–65 percent","C) 60–68 percent","D) 70–80 percent"]',
2,'She states: "federal voter turnout has hovered between 60 and 68 percent in recent elections."'),

('R4',5,'Should Voting Be Mandatory in Canada?','Read both viewpoints, then answer the questions.','Opinion — Democracy & Civics','advanced',3,NULL,
'What is Marcus Bell''s main objection to mandatory voting?',
'["A) It is too expensive to enforce","B) It would benefit left-wing parties unfairly","C) Compelling a political act violates the freedom not to participate","D) Low-information voters already have too much influence"]',
2,'Marcus argues: "The state compelling a citizen to perform a political act… crosses a fundamental line. Freedom of political expression necessarily includes the freedom not to participate."'),

('R4',5,'Should Voting Be Mandatory in Canada?','Read both viewpoints, then answer the questions.','Opinion — Democracy & Civics','advanced',4,NULL,
'Marcus points out that Australian law requires attendance at a polling station, not a valid vote. How does this undermine the case for mandatory voting?',
'["A) It shows Australians do not take elections seriously","B) It suggests mandatory voting only increases turnout numbers without necessarily producing more meaningful participation","C) It proves that spoiled ballots cause election outcomes to be invalid","D) It shows that mandatory voting is not actually enforced in Australia"]',
1,'If the law only requires showing up — not casting a valid vote — and spoiled ballots run at 5 percent, then mandatory voting may increase attendance without increasing meaningful democratic engagement, undermining the claim that it improves representation.'),

('R4',5,'Should Voting Be Mandatory in Canada?','Read both viewpoints, then answer the questions.','Opinion — Democracy & Civics','advanced',5,NULL,
'Both writers agree that Canadian democracy has a participation problem. Their core disagreement is about:',
'["A) Whether low turnout matters for election outcomes","B) Whether the solution should be compulsion or removing structural barriers to voluntary participation","C) Whether Canada should adopt a proportional representation system","D) Whether older and wealthier voters should have more influence"]',
1,'Both accept there is a problem with who votes. Vasquez argues compulsion (mandatory voting) is the fix. Bell argues for removing barriers (automatic registration, public holiday, more polling locations) to make voluntary participation easier. The debate is about compulsion vs. structural reform.');
