-- ═══════════════════════════════════════════════════════════
-- CELPIP ACE — Reading Questions v3 patch
-- Adds diagram_html and question_type columns, then replaces
-- all 5 R2 sets with proper diagram + fill-blank + MCQ sets.
-- Run in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. Add new columns (safe to run even after v2)
ALTER TABLE reading_questions
  ADD COLUMN IF NOT EXISTS diagram_html  TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS question_type TEXT    NOT NULL DEFAULT 'mcq';

-- 2. Delete old R2 rows
DELETE FROM reading_questions WHERE part = 'R2';

-- 3. Insert 5 new R2 sets
--    Each set:  Q 1-5  fill_blank  (from diagram)
--               Q 6-8  mcq         (comprehension of the email)
--    diagram_html stored only on Q1 of each set (reused for display)
--    passage (the email text) stored only on Q1 of each set

-- ══════════════════════════════════════════════════════════
-- R2 SET 1 — Downtown Bike Rentals (Easy)
-- ══════════════════════════════════════════════════════════
INSERT INTO reading_questions
  (part,set_number,set_title,instruction,scenario,difficulty,question_order,
   question_type,diagram_html,passage,question_text,options,correct_index,explanation)
VALUES

('R2',1,'Downtown Bike Rentals',
 'Read the following email. Use the rental guide to fill in the blanks. Then answer the questions below.',
 'Practical — Leisure Planning','easy',1,
 'fill_blank',
 '<table class="r2-table">
  <thead><tr><th>Shop</th><th>Min. Age</th><th>Half Day</th><th>Full Day</th><th>Weekend Bundle</th><th>Guided Tour</th><th>Location</th><th>Phone</th></tr></thead>
  <tbody>
    <tr><td>Wheelhouse Cycles</td><td>16+</td><td>$18</td><td>$30</td><td>$50 (incl. water bottle)</td><td>No</td><td>Near ferry terminal</td><td>Listed online</td></tr>
    <tr><td>Pedal City</td><td>No min.</td><td>$22</td><td>$35</td><td>$65</td><td>Yes – 10 AM & 2 PM</td><td>Near marina</td><td>416-555-0192</td></tr>
  </tbody>
</table>',
 E'Hey Derek,\n\nGreat to hear you\'re heading downtown with Lisa and Jake this Saturday and Sunday! I had a blast cycling around last weekend, so I\'m glad you want to give it a go.\n\nOne thing to watch out for: Jake is only 14, so he won\'t be able to rent from Wheelhouse since 1___. You\'d have to go with Pedal City for him — they have options for younger riders. Speaking of Pedal City, I noticed they\'re right beside 2___, which is convenient if you\'re coming by boat.\n\nNow, if you and Lisa want bikes for both days, the weekend bundle at Wheelhouse actually saves you 3___ compared to paying for two separate full days at Pedal City. Plus there\'s a little freebie thrown in with the deal. But since Jake can\'t rent there, you might want to keep things simple and stick to one shop.\n\nLisa mentioned she just wants to take it easy and soak in the waterfront scenery without having to figure out routes — 4___ would be ideal for her. She could join the afternoon group while you and Jake ride around on your own.\n\nBy the way, I wanted to call Wheelhouse to confirm what time they close, but 5___. You\'ll have to look it up online instead.\n\nTalk soon,\nTom',
 'Jake is only 14, so he won''t be able to rent from Wheelhouse since 1___.',
 '["A) they only offer guided tours","B) their minimum age requirement is 16","C) they are closed on weekends","D) they only rent to adults with a credit card"]',
 1,'The diagram shows Wheelhouse Cycles has a minimum age of 16. Jake is 14, so he does not meet this requirement.'),

('R2',1,'Downtown Bike Rentals','Read the following email. Use the rental guide to fill in the blanks. Then answer the questions below.','Practical — Leisure Planning','easy',2,
 'fill_blank',NULL,NULL,
 'Pedal City is right beside 2___.',
 '["A) the ferry terminal","B) City Hall","C) the marina","D) the central park entrance"]',
 2,'The diagram shows Pedal City is located near the marina.'),

('R2',1,'Downtown Bike Rentals','Read the following email. Use the rental guide to fill in the blanks. Then answer the questions below.','Practical — Leisure Planning','easy',3,
 'fill_blank',NULL,NULL,
 'The weekend bundle at Wheelhouse saves you 3___ compared to two separate full days at Pedal City.',
 '["A) $5","B) $10","C) $15","D) $20"]',
 3,'Two full days at Pedal City = $35 × 2 = $70. The Wheelhouse weekend bundle = $50. Saving = $70 − $50 = $20.'),

('R2',1,'Downtown Bike Rentals','Read the following email. Use the rental guide to fill in the blanks. Then answer the questions below.','Practical — Leisure Planning','easy',4,
 'fill_blank',NULL,NULL,
 '4___ would be ideal for Lisa — she could join the afternoon group.',
 '["A) Renting from Wheelhouse for both days","B) The 2 PM guided tour at Pedal City","C) The 10 AM guided tour at Pedal City","D) A solo cycling route along the waterfront"]',
 1,'The diagram shows Pedal City offers guided tours at 10 AM and 2 PM. Tom suggests Lisa join the afternoon group — the 2 PM tour.'),

('R2',1,'Downtown Bike Rentals','Read the following email. Use the rental guide to fill in the blanks. Then answer the questions below.','Practical — Leisure Planning','easy',5,
 'fill_blank',NULL,NULL,
 'Tom wanted to call Wheelhouse but 5___.',
 '["A) the line was busy all day","B) they do not have a listed phone number","C) the shop was already closed","D) he lost his phone"]',
 1,'The diagram shows Wheelhouse''s phone is listed as "Listed online" — no direct phone number is provided in the guide, so Tom cannot call them.'),

('R2',1,'Downtown Bike Rentals','Read the following email. Use the rental guide to fill in the blanks. Then answer the questions below.','Practical — Leisure Planning','easy',6,
 'mcq',NULL,NULL,
 'What is the main purpose of Tom''s email?',
 '["A) To invite Derek to go cycling with him this weekend","B) To help Derek plan a bike rental trip using the guide Tom sent","C) To compare the prices of all rental shops in the city","D) To warn Derek that Jake will not be allowed to rent a bike anywhere"]',
 1,'Tom is responding to Derek''s plans and using the rental guide to help him make decisions — his purpose is practical guidance, not an invitation or a warning.'),

('R2',1,'Downtown Bike Rentals','Read the following email. Use the rental guide to fill in the blanks. Then answer the questions below.','Practical — Leisure Planning','easy',7,
 'mcq',NULL,NULL,
 'What does Tom refer to as the "little freebie" included with the Wheelhouse weekend deal?',
 '["A) A free guided tour","B) A free half-day rental on Monday","C) A water bottle","D) A discount coupon for next visit"]',
 2,'The diagram shows the Wheelhouse weekend bundle includes a water bottle. Tom calls this the "little freebie."'),

('R2',1,'Downtown Bike Rentals','Read the following email. Use the rental guide to fill in the blanks. Then answer the questions below.','Practical — Leisure Planning','easy',8,
 'mcq',NULL,NULL,
 'Why does Tom suggest the afternoon departure time for Lisa''s guided tour?',
 '["A) Morning tours are fully booked","B) The afternoon tour is cheaper","C) Lisa said she wants to take it easy and enjoy the scenery at a relaxed pace","D) Tom and Jake plan to use the bikes in the morning"]',
 2,'Tom says Lisa "just wants to take it easy and soak in the waterfront scenery without having to figure out routes" — the afternoon tour suits this preference. There is no mention of morning availability or pricing differences.'),


-- ══════════════════════════════════════════════════════════
-- R2 SET 2 — Community Recreation Centre (Easy)
-- ══════════════════════════════════════════════════════════
('R2',2,'Maplewood Recreation Centre — Program Guide',
 'Read the following email. Use the program guide to fill in the blanks. Then answer the questions below.',
 'Community Services — Program Registration','easy',1,
 'fill_blank',
 '<table class="r2-table">
  <thead><tr><th>Program</th><th>Day</th><th>Time</th><th>Ages</th><th>Fee (per session)</th><th>Registration</th><th>Room</th></tr></thead>
  <tbody>
    <tr><td>Family Yoga</td><td>Saturday</td><td>9:00–10:00 AM</td><td>All ages</td><td>$12</td><td>Required</td><td>Studio A</td></tr>
    <tr><td>Swim Lessons – Beginner</td><td>Monday &amp; Wednesday</td><td>4:00–4:45 PM</td><td>5–12</td><td>$15</td><td>Required</td><td>Pool</td></tr>
    <tr><td>Senior Fitness</td><td>Tuesday &amp; Thursday</td><td>10:00–11:00 AM</td><td>55+</td><td>Free</td><td>Walk-in</td><td>Gym B</td></tr>
    <tr><td>Teen Basketball</td><td>Friday</td><td>6:00–8:00 PM</td><td>13–17</td><td>$8</td><td>Walk-in</td><td>Gymnasium</td></tr>
    <tr><td>Adult Pottery</td><td>Thursday</td><td>7:00–9:00 PM</td><td>18+</td><td>$20</td><td>Required</td><td>Craft Room</td></tr>
  </tbody>
</table>',
 E'Hi Priya,\n\nThanks for asking about programs at Maplewood Rec Centre! I looked through the guide for you.\n\nFor your son Aiden (he\'s 8, right?), the Swim Lessons – Beginner program runs 1___ and would be perfect for him at his age. He\'d need to be registered in advance though, so don\'t leave it too late.\n\nFor your mom, the Senior Fitness class is 2___, which I think she\'ll love. Best of all, 3___. No need to book — she can just show up.\n\nYou mentioned you want to try something creative in the evenings. The Adult Pottery class meets on 4___ from 7 to 9 PM in the Craft Room. It\'s $20 per session. Make sure you register ahead of time.\n\nOh, and if your nephew visits on Fridays, Teen Basketball runs in the 5___ from 6 to 8 PM — no registration needed.\n\nHope this helps!\nDana',
 'The Swim Lessons program for Aiden runs 1___.',
 '["A) Saturday mornings","B) Monday and Wednesday afternoons","C) Tuesday and Thursday mornings","D) Friday evenings"]',
 1,'The guide shows Swim Lessons – Beginner runs Monday & Wednesday, 4:00–4:45 PM.'),

('R2',2,'Maplewood Recreation Centre — Program Guide','Read the following email. Use the program guide to fill in the blanks. Then answer the questions below.','Community Services — Program Registration','easy',2,
 'fill_blank',NULL,NULL,
 'The Senior Fitness class is 2___.',
 '["A) on Saturdays in Studio A","B) on Tuesday and Thursday mornings in Gym B","C) on Mondays only, in the pool","D) on Fridays in the Gymnasium"]',
 1,'The guide shows Senior Fitness runs Tuesday & Thursday, 10:00–11:00 AM, in Gym B.'),

('R2',2,'Maplewood Recreation Centre — Program Guide','Read the following email. Use the program guide to fill in the blanks. Then answer the questions below.','Community Services — Program Registration','easy',3,
 'fill_blank',NULL,NULL,
 'Best of all, 3___ for the Senior Fitness class.',
 '["A) the session lasts two hours","B) refreshments are provided","C) it is free","D) a certified trainer leads every class"]',
 2,'The guide shows the Senior Fitness fee is "Free."'),

('R2',2,'Maplewood Recreation Centre — Program Guide','Read the following email. Use the program guide to fill in the blanks. Then answer the questions below.','Community Services — Program Registration','easy',4,
 'fill_blank',NULL,NULL,
 'The Adult Pottery class meets on 4___.',
 '["A) Monday","B) Tuesday","C) Wednesday","D) Thursday"]',
 3,'The guide shows Adult Pottery is on Thursday evenings.'),

('R2',2,'Maplewood Recreation Centre — Program Guide','Read the following email. Use the program guide to fill in the blanks. Then answer the questions below.','Community Services — Program Registration','easy',5,
 'fill_blank',NULL,NULL,
 'Teen Basketball runs in the 5___.',
 '["A) Studio A","B) Craft Room","C) Pool","D) Gymnasium"]',
 3,'The guide shows Teen Basketball is held in the Gymnasium.'),

('R2',2,'Maplewood Recreation Centre — Program Guide','Read the following email. Use the program guide to fill in the blanks. Then answer the questions below.','Community Services — Program Registration','easy',6,
 'mcq',NULL,NULL,
 'Which programs require advance registration?',
 '["A) Senior Fitness and Teen Basketball","B) Family Yoga, Swim Lessons, and Adult Pottery","C) All programs listed in the guide","D) Swim Lessons and Senior Fitness only"]',
 1,'The guide marks Family Yoga, Swim Lessons, and Adult Pottery as "Required" for registration. Senior Fitness and Teen Basketball are walk-in.'),

('R2',2,'Maplewood Recreation Centre — Program Guide','Read the following email. Use the program guide to fill in the blanks. Then answer the questions below.','Community Services — Program Registration','easy',7,
 'mcq',NULL,NULL,
 'What is the purpose of Dana''s email?',
 '["A) To advertise the recreation centre to new members","B) To help Priya find suitable programs for herself and her family","C) To remind Priya about a registration deadline she missed","D) To describe all the programs offered at the centre"]',
 1,'Dana is responding to Priya''s specific questions about programs for different family members — her goal is to help Priya find the right fit.'),

('R2',2,'Maplewood Recreation Centre — Program Guide','Read the following email. Use the program guide to fill in the blanks. Then answer the questions below.','Community Services — Program Registration','easy',8,
 'mcq',NULL,NULL,
 'Which program could both Priya''s 8-year-old son and her 55-year-old mother attend at the same time on a Tuesday?',
 '["A) Family Yoga and Senior Fitness","B) Swim Lessons and Senior Fitness","C) Teen Basketball and Adult Pottery","D) There is no overlap — their programs run on different days"]',
 3,'Swim Lessons runs Monday & Wednesday — Aiden has no class on Tuesday. Senior Fitness runs Tuesday & Thursday for the mother. Since they have no program in common on Tuesdays, they cannot attend the same program at the same time.'),


-- ══════════════════════════════════════════════════════════
-- R2 SET 3 — Hotel Amenities Guide (Medium)
-- ══════════════════════════════════════════════════════════
('R2',3,'Harborview Hotel — Guest Amenities',
 'Read the following email. Use the hotel amenity guide to fill in the blanks. Then answer the questions below.',
 'Travel — Hotel Services','medium',1,
 'fill_blank',
 '<table class="r2-table">
  <thead><tr><th>Facility</th><th>Hours</th><th>Floor</th><th>Fee</th><th>Reservation</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>Rooftop Pool</td><td>7 AM – 10 PM</td><td>12</td><td>Free (guests)</td><td>Not required</td><td>Towels provided; no outside food</td></tr>
    <tr><td>Fitness Centre</td><td>5 AM – 11 PM</td><td>2</td><td>Free (guests)</td><td>Not required</td><td>Bring your own lock for lockers</td></tr>
    <tr><td>Harbour Restaurant</td><td>7 AM – 10 PM</td><td>1</td><td>À la carte</td><td>Recommended for dinner</td><td>Breakfast included for guests on full-board plan</td></tr>
    <tr><td>Business Centre</td><td>8 AM – 8 PM</td><td>3</td><td>$5/hour printing; Wi-Fi free</td><td>Not required</td><td>Printing, scanning, computers available</td></tr>
    <tr><td>Spa &amp; Wellness</td><td>9 AM – 7 PM</td><td>11</td><td>Prices vary</td><td>Required (24 hrs notice)</td><td>Discounts available for 3+ day stays</td></tr>
  </tbody>
</table>',
 E'Hi Marcus,\n\nSo glad you\'re joining us at Harborview next week! I stayed there last month and wanted to give you a few tips before you arrive.\n\nFirst, the rooftop pool is gorgeous — it\'s on 1___ and is free for guests. You don\'t need to book in advance, but remember 2___. I wish I had known that when I arrived!\n\nIf you\'re an early riser, the Fitness Centre is great — it opens at 3___, so you can squeeze in a workout before breakfast. Towels are not provided there, FYI — you\'ll need to bring a lock for the lockers.\n\nFor dinner, the Harbour Restaurant is excellent. I\'d recommend booking a table in advance. Keep in mind that 4___ — so if you\'re not on that plan, you\'ll be paying à la carte.\n\nFinally, if you want to book a spa treatment, do it 5___ — they require a full day\'s notice for reservations.\n\nEnjoy your stay!\nClara',
 'The rooftop pool is on 1___.',
 '["A) Floor 2","B) Floor 11","C) Floor 12","D) Floor 3"]',
 2,'The guide shows the Rooftop Pool is on Floor 12.'),

('R2',3,'Harborview Hotel — Guest Amenities','Read the following email. Use the hotel amenity guide to fill in the blanks. Then answer the questions below.','Travel — Hotel Services','medium',2,
 'fill_blank',NULL,NULL,
 'Remember 2___ at the rooftop pool.',
 '["A) to bring your own towel","B) to book in advance","C) not to bring outside food","D) to wear hotel-issued swimwear"]',
 2,'The guide notes: "no outside food" at the Rooftop Pool — this is the rule Clara wishes she had known.'),

('R2',3,'Harborview Hotel — Guest Amenities','Read the following email. Use the hotel amenity guide to fill in the blanks. Then answer the questions below.','Travel — Hotel Services','medium',3,
 'fill_blank',NULL,NULL,
 'The Fitness Centre opens at 3___.',
 '["A) 6 AM","B) 5 AM","C) 7 AM","D) 8 AM"]',
 1,'The guide shows the Fitness Centre hours are 5 AM – 11 PM.'),

('R2',3,'Harborview Hotel — Guest Amenities','Read the following email. Use the hotel amenity guide to fill in the blanks. Then answer the questions below.','Travel — Hotel Services','medium',4,
 'fill_blank',NULL,NULL,
 'At the Harbour Restaurant, 4___ — so if you''re not on that plan, you''ll pay à la carte.',
 '["A) a reservation is always required","B) breakfast is only included for guests on the full-board plan","C) the restaurant closes at 9 PM","D) tipping is included in all bills"]',
 1,'The guide notes: "Breakfast included for guests on full-board plan." This implies guests not on that plan pay separately.'),

('R2',3,'Harborview Hotel — Guest Amenities','Read the following email. Use the hotel amenity guide to fill in the blanks. Then answer the questions below.','Travel — Hotel Services','medium',5,
 'fill_blank',NULL,NULL,
 'Book a spa treatment 5___ — they require a full day''s notice.',
 '["A) the same morning you want to go","B) at least 24 hours in advance","C) through the hotel app only","D) only on weekdays"]',
 1,'The guide shows the Spa requires reservations with "24 hrs notice."'),

('R2',3,'Harborview Hotel — Guest Amenities','Read the following email. Use the hotel amenity guide to fill in the blanks. Then answer the questions below.','Travel — Hotel Services','medium',6,
 'mcq',NULL,NULL,
 'What is the main purpose of Clara''s email?',
 '["A) To describe the hotel''s policies in full detail","B) To share personal tips to help Marcus make the most of his stay","C) To warn Marcus about poor service at the hotel","D) To compare Harborview with other hotels she has stayed in"]',
 1,'Clara uses her personal experience ("I stayed there last month") to give Marcus practical, friendly tips — her goal is to help him have a good stay.'),

('R2',3,'Harborview Hotel — Guest Amenities','Read the following email. Use the hotel amenity guide to fill in the blanks. Then answer the questions below.','Travel — Hotel Services','medium',7,
 'mcq',NULL,NULL,
 'Which facility requires a reservation and gives discounts for longer stays?',
 '["A) Rooftop Pool","B) Harbour Restaurant","C) Business Centre","D) Spa & Wellness"]',
 3,'The guide shows the Spa requires a reservation (24 hrs notice) and offers "Discounts available for 3+ day stays."'),

('R2',3,'Harborview Hotel — Guest Amenities','Read the following email. Use the hotel amenity guide to fill in the blanks. Then answer the questions below.','Travel — Hotel Services','medium',8,
 'mcq',NULL,NULL,
 'Marcus wants to print documents at 8:30 PM. Is the Business Centre available to him?',
 '["A) Yes — the Business Centre is open until 11 PM","B) No — it closes at 8 PM","C) Yes — but only for Wi-Fi, not printing","D) No — printing requires a reservation made in advance"]',
 1,'The guide shows the Business Centre hours are 8 AM – 8 PM. At 8:30 PM it is already closed.'),


-- ══════════════════════════════════════════════════════════
-- R2 SET 4 — City Library Branch Guide (Hard)
-- ══════════════════════════════════════════════════════════
('R2',4,'Northgate Public Library — Branch & Services Guide',
 'Read the following email. Use the library guide to fill in the blanks. Then answer the questions below.',
 'Public Services — Library Information','hard',1,
 'fill_blank',
 '<table class="r2-table">
  <thead><tr><th>Branch</th><th>Hours (Mon–Fri)</th><th>Sat</th><th>Sun</th><th>3D Printer</th><th>Study Rooms</th><th>eCard Access</th><th>Nearest Transit</th></tr></thead>
  <tbody>
    <tr><td>Central Branch</td><td>9 AM – 9 PM</td><td>10 AM – 6 PM</td><td>12–5 PM</td><td>Yes (book online)</td><td>6 rooms (bookable)</td><td>Yes</td><td>King St. Station</td></tr>
    <tr><td>Westside Branch</td><td>10 AM – 7 PM</td><td>10 AM – 5 PM</td><td>Closed</td><td>No</td><td>2 rooms (walk-in)</td><td>Yes</td><td>Westside Mall stop</td></tr>
    <tr><td>Northgate Branch</td><td>9 AM – 8 PM</td><td>10 AM – 4 PM</td><td>Closed</td><td>No</td><td>None</td><td>No</td><td>Northgate Terminal</td></tr>
    <tr><td>Eastview Branch</td><td>11 AM – 7 PM</td><td>11 AM – 5 PM</td><td>11 AM – 4 PM</td><td>Yes (walk-in only)</td><td>4 rooms (bookable)</td><td>Yes</td><td>Eastview Dr. bus</td></tr>
  </tbody>
</table>',
 E'Hi Jenna,\n\nI looked into the library branches for you — here\'s what I found.\n\nFor your project, you need to use the 3D printer. The Central Branch has one, but 1___. The Eastview Branch also has one — you can use it 2___, which is handy if you\'re in a rush.\n\nYou mentioned you only have a physical library card, not an eCard. Just so you know, 3___ — so you\'d need to visit in person.\n\nIf you want to study on Sunday, 4___ is your best option since both the Central Branch and Eastview Branch are open that day, but most branches are closed. The Westside and Northgate branches are both closed Sundays.\n\nFinally, you mentioned taking transit. If you\'re coming from downtown, the Central Branch is closest to 5___.\n\nGood luck with the project!\nRobert',
 'The Central Branch 3D printer requires that 1___.',
 '["A) you bring your own filament","B) the printer is only available on weekdays","C) you book it online in advance","D) you have a paid premium library membership"]',
 2,'The guide shows the Central Branch 3D printer requires booking online ("Yes (book online)").'),

('R2',4,'Northgate Public Library — Branch & Services Guide','Read the following email. Use the library guide to fill in the blanks. Then answer the questions below.','Public Services — Library Information','hard',2,
 'fill_blank',NULL,NULL,
 'The Eastview Branch 3D printer can be used 2___.',
 '["A) only after booking 48 hours in advance","B) on a walk-in basis","C) only for members with an eCard","D) on weekends only"]',
 1,'The guide shows Eastview''s 3D printer is "walk-in only."'),

('R2',4,'Northgate Public Library — Branch & Services Guide','Read the following email. Use the library guide to fill in the blanks. Then answer the questions below.','Public Services — Library Information','hard',3,
 'fill_blank',NULL,NULL,
 '3___ — so you''d need to visit in person without an eCard.',
 '["A) the Central Branch does not accept physical cards","B) the Northgate Branch does not offer eCard access","C) all branches require an eCard for 3D printer use","D) the Westside Branch is the only branch without eCard access"]',
 1,'The guide shows the Northgate Branch has "No" eCard access. Robert is telling Jenna which branch she cannot access digitally. (The Northgate Branch is the one that lacks eCard access in the guide.)'),

('R2',4,'Northgate Public Library — Branch & Services Guide','Read the following email. Use the library guide to fill in the blanks. Then answer the questions below.','Public Services — Library Information','hard',4,
 'fill_blank',NULL,NULL,
 'If you want to study on Sunday, 4___ is your best option.',
 '["A) the Westside Branch","B) the Northgate Branch","C) the Central Branch or Eastview Branch","D) any branch — they are all open on Sundays"]',
 2,'The guide shows only Central Branch (12–5 PM) and Eastview Branch (11 AM–4 PM) are open on Sundays. Westside and Northgate are closed.'),

('R2',4,'Northgate Public Library — Branch & Services Guide','Read the following email. Use the library guide to fill in the blanks. Then answer the questions below.','Public Services — Library Information','hard',5,
 'fill_blank',NULL,NULL,
 'The Central Branch is closest to 5___ for transit from downtown.',
 '["A) Northgate Terminal","B) Westside Mall stop","C) Eastview Dr. bus","D) King St. Station"]',
 3,'The guide shows the Central Branch nearest transit is King St. Station.'),

('R2',4,'Northgate Public Library — Branch & Services Guide','Read the following email. Use the library guide to fill in the blanks. Then answer the questions below.','Public Services — Library Information','hard',6,
 'mcq',NULL,NULL,
 'Jenna needs to use a 3D printer on a Sunday afternoon without booking in advance. Which branch should she go to?',
 '["A) Central Branch","B) Westside Branch","C) Northgate Branch","D) Eastview Branch"]',
 3,'Eastview Branch: open Sundays (11 AM–4 PM), has a 3D printer on a walk-in basis. Central Branch requires online booking. Westside and Northgate are closed Sundays and have no 3D printer anyway.'),

('R2',4,'Northgate Public Library — Branch & Services Guide','Read the following email. Use the library guide to fill in the blanks. Then answer the questions below.','Public Services — Library Information','hard',7,
 'mcq',NULL,NULL,
 'Which branch has the most study rooms available for booking?',
 '["A) Eastview Branch with 4 bookable rooms","B) Westside Branch with 2 walk-in rooms","C) Central Branch with 6 bookable rooms","D) Northgate Branch with no rooms"]',
 2,'The guide shows Central Branch has 6 bookable study rooms — the most of any branch.'),

('R2',4,'Northgate Public Library — Branch & Services Guide','Read the following email. Use the library guide to fill in the blanks. Then answer the questions below.','Public Services — Library Information','hard',8,
 'mcq',NULL,NULL,
 'Robert''s email is best described as:',
 '["A) A formal recommendation letter for library membership","B) A friendly, practical summary of relevant branch information tailored to Jenna''s specific needs","C) A complaint about inconsistent library services across branches","D) An official library system announcement about new services"]',
 1,'Robert uses casual, direct language and explicitly connects each piece of information to Jenna''s stated needs (3D printer, no eCard, Sunday study, transit). This is informal, targeted practical help.'),


-- ══════════════════════════════════════════════════════════
-- R2 SET 5 — Corporate Training Schedule (Advanced)
-- ══════════════════════════════════════════════════════════
('R2',5,'Greenfield Corp — Staff Training Schedule Q2',
 'Read the following email. Use the training schedule to fill in the blanks. Then answer the questions below.',
 'Corporate — Staff Development','advanced',1,
 'fill_blank',
 '<table class="r2-table">
  <thead><tr><th>Course</th><th>Date</th><th>Time</th><th>Delivery</th><th>Seats</th><th>Mandatory</th><th>Facilitator</th><th>Prerequisites</th></tr></thead>
  <tbody>
    <tr><td>Data Privacy &amp; Compliance</td><td>April 8</td><td>9 AM – 12 PM</td><td>In-person</td><td>20</td><td>Yes (all staff)</td><td>HR Dept.</td><td>None</td></tr>
    <tr><td>Advanced Excel</td><td>April 15</td><td>1 PM – 4 PM</td><td>Online</td><td>15</td><td>No</td><td>External – TechLearn</td><td>Basic Excel</td></tr>
    <tr><td>Leadership Essentials</td><td>April 22</td><td>9 AM – 5 PM</td><td>In-person</td><td>12</td><td>No (managers only)</td><td>Clara Vance</td><td>None</td></tr>
    <tr><td>Customer Service Excellence</td><td>May 6</td><td>10 AM – 1 PM</td><td>Online</td><td>25</td><td>No</td><td>HR Dept.</td><td>None</td></tr>
    <tr><td>Project Management Basics</td><td>May 13</td><td>9 AM – 4 PM</td><td>In-person</td><td>18</td><td>No</td><td>Paul Renner</td><td>None</td></tr>
  </tbody>
</table>',
 E'Hi Sandra,\n\nJust a heads-up about the Q2 training schedule — a few things worth flagging for your team.\n\nFirst, 1___ is mandatory for all staff and takes place on April 8th. Make sure everyone on your team attends — there are no exceptions.\n\nFor managers, 2___ is listed as mandatory for that group, running all day on April 22nd. Given it\'s a full-day session, you may want to plan coverage for that day.\n\nIf anyone on your team wants to take Advanced Excel, they should know 3___ — so anyone who hasn\'t done that yet won''t be eligible.\n\nThe Customer Service Excellence course has the most availability with 4___ seats, which should make it easier for your whole team to enroll if they''re interested.\n\nFinally, I noticed that 5___ of the five courses are delivered online, so those staff will need a reliable internet connection and a quiet workspace on those days.\n\nLet me know if you have questions.\nTom',
 'The training that is mandatory for all staff is 1___.',
 '["A) Advanced Excel","B) Leadership Essentials","C) Data Privacy & Compliance","D) Project Management Basics"]',
 2,'The guide shows Data Privacy & Compliance is "Mandatory: Yes (all staff)."'),

('R2',5,'Greenfield Corp — Staff Training Schedule Q2','Read the following email. Use the training schedule to fill in the blanks. Then answer the questions below.','Corporate — Staff Development','advanced',2,
 'fill_blank',NULL,NULL,
 'For managers, 2___ is listed as mandatory for that group.',
 '["A) Project Management Basics","B) Leadership Essentials","C) Customer Service Excellence","D) Data Privacy & Compliance"]',
 1,'The guide shows Leadership Essentials is "Mandatory: No (managers only)" — meaning it is mandatory specifically for managers.'),

('R2',5,'Greenfield Corp — Staff Training Schedule Q2','Read the following email. Use the training schedule to fill in the blanks. Then answer the questions below.','Corporate — Staff Development','advanced',3,
 'fill_blank',NULL,NULL,
 'For Advanced Excel, staff should know 3___ is a prerequisite.',
 '["A) Project Management experience","B) completing Customer Service Excellence first","C) Basic Excel","D) approval from HR"]',
 2,'The guide shows Advanced Excel has the prerequisite: "Basic Excel."'),

('R2',5,'Greenfield Corp — Staff Training Schedule Q2','Read the following email. Use the training schedule to fill in the blanks. Then answer the questions below.','Corporate — Staff Development','advanced',4,
 'fill_blank',NULL,NULL,
 'The Customer Service Excellence course has 4___ seats available.',
 '["A) 12","B) 15","C) 18","D) 25"]',
 3,'The guide shows Customer Service Excellence has 25 seats — the most of any course.'),

('R2',5,'Greenfield Corp — Staff Training Schedule Q2','Read the following email. Use the training schedule to fill in the blanks. Then answer the questions below.','Corporate — Staff Development','advanced',5,
 'fill_blank',NULL,NULL,
 '5___ of the five courses are delivered online.',
 '["A) One","B) Two","C) Three","D) Four"]',
 1,'Counting from the guide: Advanced Excel (Online), Customer Service Excellence (Online) = 2 online courses. The other 3 are in-person.'),

('R2',5,'Greenfield Corp — Staff Training Schedule Q2','Read the following email. Use the training schedule to fill in the blanks. Then answer the questions below.','Corporate — Staff Development','advanced',6,
 'mcq',NULL,NULL,
 'Why does Tom suggest Sandra plan coverage for April 22nd?',
 '["A) The office will be closed for renovations on that date","B) Leadership Essentials is a full-day session so managers may be unavailable","C) The company has a staff retreat scheduled that day","D) The Project Management course conflicts with regular meetings"]',
 1,'Tom says: "it''s a full-day session, you may want to plan coverage for that day" — meaning Sandra''s managers will be away all day in the Leadership Essentials training.'),

('R2',5,'Greenfield Corp — Staff Training Schedule Q2','Read the following email. Use the training schedule to fill in the blanks. Then answer the questions below.','Corporate — Staff Development','advanced',7,
 'mcq',NULL,NULL,
 'A new staff member with no Excel experience wants to take Advanced Excel on April 15th. Based on the schedule, what is the problem?',
 '["A) The course is only available to managers","B) The course is mandatory and already fully booked","C) They do not meet the Basic Excel prerequisite","D) The course is in-person and they work remotely"]',
 2,'The guide lists "Basic Excel" as a prerequisite for Advanced Excel. A staff member with no Excel experience does not qualify.'),

('R2',5,'Greenfield Corp — Staff Training Schedule Q2','Read the following email. Use the training schedule to fill in the blanks. Then answer the questions below.','Corporate — Staff Development','advanced',8,
 'mcq',NULL,NULL,
 'The phrase "there are no exceptions" regarding the mandatory training implies:',
 '["A) The HR department will not process complaints about the training","B) Every staff member is required to attend, regardless of role or schedule","C) The training content cannot be customised for different departments","D) Latecomers will not be admitted to the session"]',
 1,'Tom uses "no exceptions" to emphasise that the Data Privacy & Compliance training is required for all staff without exemptions — role, seniority, or schedule conflicts do not exempt anyone.');
