-- ═══════════════════════════════════════════════════════════════════════════
-- CELPIP ACE — Writing Practice Schema
-- Run in Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. TABLES ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS writing_sets (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  set_number  INT         NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS writing_tasks (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id           UUID        NOT NULL REFERENCES writing_sets(id) ON DELETE CASCADE,
  task_number      INT         NOT NULL,  -- 1 or 2
  task_type        TEXT        NOT NULL,  -- 'email' | 'survey'
  difficulty       TEXT        NOT NULL,  -- 'easy' | 'intermediate' | 'advanced'
  prompt_text      TEXT        NOT NULL,
  scenario_context TEXT,
  bullet_points    JSONB,                 -- array of strings, Task 1 only
  option_a         TEXT,                 -- Task 2 only
  option_b         TEXT,                 -- Task 2 only
  word_limit       INT         NOT NULL DEFAULT 200,
  time_limit_minutes INT       NOT NULL,  -- 27 for Task 1, 26 for Task 2
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (set_id, task_number)
);

CREATE TABLE IF NOT EXISTS writing_responses (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id          UUID        NOT NULL REFERENCES writing_tasks(id) ON DELETE CASCADE,
  response_text    TEXT        NOT NULL DEFAULT '',
  word_count       INT         NOT NULL DEFAULT 0,
  time_spent_seconds INT       NOT NULL DEFAULT 0,
  overtime_seconds   INT       NOT NULL DEFAULT 0,
  submitted_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, task_id)
);

-- ── 2. INDEXES ──────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_writing_tasks_set    ON writing_tasks (set_id, task_number);
CREATE INDEX IF NOT EXISTS idx_writing_responses_user ON writing_responses (user_id, task_id);

-- ── 3. ROW LEVEL SECURITY ───────────────────────────────────────────────────

ALTER TABLE writing_sets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_tasks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_responses ENABLE ROW LEVEL SECURITY;

-- writing_sets: everyone can read
CREATE POLICY "Public read writing_sets"
  ON writing_sets FOR SELECT USING (true);

-- writing_tasks: everyone can read
CREATE POLICY "Public read writing_tasks"
  ON writing_tasks FOR SELECT USING (true);

-- writing_responses: users own their responses
CREATE POLICY "Users read own writing responses"
  ON writing_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own writing responses"
  ON writing_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own writing responses"
  ON writing_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- ── 4. SEED DATA — 20 Sets ──────────────────────────────────────────────────

-- Insert sets
INSERT INTO writing_sets (set_number) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
(11),(12),(13),(14),(15),(16),(17),(18),(19),(20)
ON CONFLICT (set_number) DO NOTHING;

-- Insert tasks using a CTE to reference set IDs by set_number
WITH sets AS (SELECT id, set_number FROM writing_sets)

INSERT INTO writing_tasks (set_id, task_number, task_type, difficulty, prompt_text, scenario_context, bullet_points, option_a, option_b, word_limit, time_limit_minutes)

SELECT s.id, t.task_number, t.task_type, t.difficulty, t.prompt_text, t.scenario_context,
       t.bullet_points::jsonb, t.option_a, t.option_b, 200, t.time_limit
FROM sets s
JOIN (VALUES

-- SET 1
(1, 1, 'email', 'easy',
 'You recently moved into a new apartment. The heating in your unit has not been working properly for two weeks. You need to write an email to your landlord.',
 'Your landlord''s name is Mr. David Park. You are a tenant.',
 '["Describe the heating problem and how long it has been happening","Explain how it is affecting you","Ask for the problem to be fixed and suggest a timeline"]'::text,
 NULL, NULL, 27),

(1, 2, 'survey', 'intermediate',
 'A city planning organization is asking residents for their opinion on the following topic: Some people believe that expanding public transit (buses and subways) is the best way to reduce traffic in cities. Others believe that building more roads and highways is the better solution. Which approach do you think the city should prioritize? Give specific reasons to support your choice.',
 NULL,
 NULL,
 'Expanding public transit (buses and subways)',
 'Building more roads and highways', 26),

-- SET 2
(2, 1, 'email', 'intermediate',
 'You work full-time during the week. Your current work schedule is Monday to Friday, 9 AM to 5 PM. You need to request a schedule change from your manager.',
 'Your manager''s name is Ms. Jennifer Watts. You have worked at the company for three years.',
 '["Explain why you need a schedule change and what change you are requesting","Describe how you will ensure your work responsibilities are still met","Thank your manager and offer to discuss the request further"]'::text,
 NULL, NULL, 27),

(2, 2, 'survey', 'advanced',
 'A school board is surveying parents and community members on the following topic: Some educators argue that technology — tablets, laptops, and apps — should be used extensively in classrooms from an early age because it prepares children for the modern world. Others believe that excessive screen time in schools is harmful and that traditional hands-on learning is more effective for young children. What is your opinion? Should schools use technology extensively in early childhood education? Support your position with specific reasons and examples.',
 NULL,
 NULL,
 'Technology should be used extensively in early childhood classrooms',
 'Traditional hands-on learning is more effective for young children', 26),

-- SET 3
(3, 1, 'email', 'easy',
 'Your friend is coming to visit your city next month and you want to invite them to a community event you are organizing. Write an email to invite your friend.',
 'Your friend''s name is Maria. The event is a neighbourhood potluck dinner.',
 '["Tell your friend about the event and when it is happening","Explain why you think they would enjoy it","Give them the information they need to attend and ask them to confirm"]'::text,
 NULL, NULL, 27),

(3, 2, 'survey', 'easy',
 'A community organization is asking residents for their views: Some people believe governments should strictly limit social media access for children under 16 to protect their mental health. Others argue that restricting social media takes away young people''s freedom and that parents — not governments — should decide. What is your view? Should governments set age restrictions on social media? Explain your position with specific reasons.',
 NULL,
 NULL,
 'Governments should set strict age restrictions on social media',
 'Parents — not governments — should decide children''s social media access', 26),

-- SET 4
(4, 1, 'email', 'intermediate',
 'You missed an important project deadline at work because of a personal emergency. Your colleague had to cover for you. Write an email to your colleague.',
 'Your colleague''s name is Alex. You work in the same department.',
 '["Apologize sincerely and briefly explain what happened","Acknowledge the extra work Alex had to take on because of you","Offer to help Alex with a future task as a gesture of appreciation"]'::text,
 NULL, NULL, 27),

(4, 2, 'survey', 'intermediate',
 'A housing authority is gathering opinions on urban development: Some people prefer living in high-rise apartments in the city centre because they are close to work, transit, and amenities. Others prefer suburban houses because they offer more space, privacy, and a quieter environment. Which type of housing do you think is better for families? Explain your position with specific reasons and examples.',
 NULL,
 NULL,
 'High-rise apartments in the city centre',
 'Houses in suburban neighbourhoods', 26),

-- SET 5
(5, 1, 'email', 'advanced',
 'You are a recent graduate and you want to ask one of your university professors to write a reference letter for a competitive job application. Write an email to your professor.',
 'The professor''s name is Dr. Rebecca Stone. The job is at a national research institute.',
 '["Remind the professor who you are and mention the course you took with them","Explain the position you are applying for and why you chose them as a reference","Provide any details they might need and ask if they are willing to help"]'::text,
 NULL, NULL, 27),

(5, 2, 'survey', 'advanced',
 'A health policy think tank is collecting public opinions: Some people argue that governments should invest the majority of healthcare funding in preventive care — education, screenings, and lifestyle programs — to reduce the burden of disease before it occurs. Others believe that healthcare funding should focus on treatment — hospitals, emergency care, and medication — to help people who are already sick. Where do you think healthcare funding should be prioritized? Explain your view with specific reasoning.',
 NULL,
 NULL,
 'Governments should prioritize preventive healthcare (education and screenings)',
 'Governments should prioritize treatment (hospitals and emergency care)', 26),

-- SET 6
(6, 1, 'email', 'easy',
 'You recently had a meal at a restaurant that you enjoyed very much. You want to share your feedback with the restaurant manager. Write an email.',
 'The restaurant is called The Maple Leaf Bistro. You visited last Saturday.',
 '["Describe the specific things you enjoyed about your experience","Mention one small suggestion for improvement","Say that you plan to return and recommend the restaurant to others"]'::text,
 NULL, NULL, 27),

(6, 2, 'survey', 'easy',
 'A city council is asking residents for input on a local issue: Your city is deciding whether to ban single-use plastic bags in all retail stores. Some people support the ban because it reduces pollution and encourages sustainable habits. Others oppose it because it increases costs and inconvenience for shoppers and businesses. Do you support or oppose the ban on single-use plastic bags? Give specific reasons.',
 NULL,
 NULL,
 'I support the ban on single-use plastic bags',
 'I oppose the ban on single-use plastic bags', 26),

-- SET 7
(7, 1, 'email', 'intermediate',
 'You are the representative of a group of condo residents. Your building''s outdoor common area has been neglected and needs improvements. Write an email to the condo board.',
 'The condo board president is Ms. Sandra Lee. You represent 12 households.',
 '["Describe the current state of the outdoor common area and the specific problems","Explain why these improvements are important to residents","Propose two specific changes and ask for a meeting to discuss further"]'::text,
 NULL, NULL, 27),

(7, 2, 'survey', 'intermediate',
 'A municipal government is surveying residents on community spending: Your city has extra funding available and needs to decide whether to spend it on expanding the community recreation centre (adding a gym, pool, and daycare) or on improving roads and sidewalks in the neighbourhood. Which do you think is a better use of the funds? Support your opinion with specific reasons.',
 NULL,
 NULL,
 'Expand the community recreation centre',
 'Improve roads and sidewalks in the neighbourhood', 26),

-- SET 8
(8, 1, 'email', 'advanced',
 'Your flight was recently cancelled by an airline and your checked luggage was lost. You have been waiting five days with no response from the airline. Write a formal complaint email.',
 'The airline is called NorthStar Air. Your booking reference is NSA-28471.',
 '["Clearly state the flight cancellation issue and the lost luggage problem with relevant details","Describe how this situation has inconvenienced you","State what you expect the airline to do to resolve this, including a specific deadline"]'::text,
 NULL, NULL, 27),

(8, 2, 'survey', 'advanced',
 'A parenting magazine is gathering views on child-rearing: Some people believe strict parenting — with clear rules, high expectations, and firm consequences — produces more disciplined and successful children. Others believe relaxed, child-led parenting — with more freedom, self-expression, and minimal rules — produces happier, more creative children. Which parenting style do you believe is more effective for raising well-rounded children? Give specific reasons and examples.',
 NULL,
 NULL,
 'Strict parenting with clear rules and high expectations',
 'Relaxed, child-led parenting with freedom and minimal rules', 26),

-- SET 9
(9, 1, 'email', 'easy',
 'Your neighbour plays loud music late at night on weeknights, which is affecting your sleep and your ability to work the next day. Write a polite email to your neighbour.',
 'You do not know your neighbour''s name — address the email as "Dear Neighbour." You want to resolve this politely.',
 '["Describe the problem clearly and when it occurs","Explain how it is affecting you personally","Ask them politely to make a change and suggest a compromise"]'::text,
 NULL, NULL, 27),

(9, 2, 'survey', 'intermediate',
 'An economics research group is asking for public opinion: Some people believe that immigration has a positive effect on a local economy because immigrants fill important labour shortages, start businesses, and contribute to innovation. Others believe that immigration puts pressure on local housing, public services, and wages for existing residents. What is your view on the effect of immigration on the local economy? Support your position with specific reasons and examples.',
 NULL,
 NULL,
 'Immigration has an overall positive effect on the local economy',
 'Immigration puts excessive pressure on housing, services, and wages', 26),

-- SET 10
(10, 1, 'email', 'intermediate',
 'You have recently completed a job interview at a company you are very interested in working for. Write a follow-up email to the hiring manager.',
 'The hiring manager''s name is Mr. Thomas Yuen. The role is a Marketing Coordinator position.',
 '["Thank the hiring manager for their time and the opportunity to interview","Reference one specific thing discussed in the interview that excited you about the role","Reaffirm your interest and mention that you are available if they need any further information"]'::text,
 NULL, NULL, 27),

(10, 2, 'survey', 'easy',
 'A career guidance organization is collecting opinions: Some people believe that a university degree is the best investment young people can make for their future career because it opens more doors and leads to higher salaries. Others believe that skilled trades training (plumbing, electrical, carpentry) is a better choice because it leads to stable, well-paying jobs without the cost and time of a degree. Which path do you think is better for young people entering the workforce today? Give specific reasons.',
 NULL,
 NULL,
 'A university degree is the better investment for young people',
 'Skilled trades training is the better path for young people', 26),

-- SET 11
(11, 1, 'email', 'easy',
 'You are planning to move to a new city and want to inquire about enrolling your child in a local school. Write an email to the school.',
 'The school is called Maplewood Elementary. You are moving to the area in two months.',
 '["Introduce yourself and explain your situation","Ask about the enrollment process and what documents are required","Ask if there is a particular grade level that has open spots and when you should apply"]'::text,
 NULL, NULL, 27),

(11, 2, 'survey', 'intermediate',
 'A youth development foundation is gathering opinions: Some educators and community leaders believe that mandatory community service should be a requirement for high school graduation because it builds empathy, responsibility, and civic engagement. Others believe that mandatory volunteering removes the genuine spirit of service and that students should choose how to spend their time outside school. What is your opinion? Should community service be mandatory for high school students? Support your view with specific reasons.',
 NULL,
 NULL,
 'Community service should be mandatory for high school graduation',
 'Community service should be voluntary — not a graduation requirement', 26),

-- SET 12
(12, 1, 'email', 'advanced',
 'You are applying for a volunteer position with a local non-profit organization that supports newcomers to Canada. Write an inquiry email expressing your interest.',
 'The organization is called New Horizons Support Centre. The volunteer coordinator''s name is Ms. Angela Torres.',
 '["Introduce yourself and explain why you are interested in volunteering with this specific organization","Describe the relevant skills or experience you would bring to the role","Ask about available volunteer positions and the application process"]'::text,
 NULL, NULL, 27),

(12, 2, 'survey', 'advanced',
 'A technology ethics panel is gathering public views: Some experts argue that artificial intelligence (AI) is transforming the workplace in positive ways — increasing productivity, reducing repetitive tasks, and creating new job categories. Others warn that AI will lead to widespread job losses, growing inequality, and a workforce that is unprepared for rapid change. What is your view on the impact of AI on the workplace? Give a clear position and support it with specific reasons and examples.',
 NULL,
 NULL,
 'AI is transforming the workplace in largely positive ways',
 'AI poses serious risks of job loss and inequality in the workplace', 26),

-- SET 13
(13, 1, 'email', 'intermediate',
 'You recently joined a gym and want to cancel your membership because of a personal financial hardship. The contract says there is a cancellation fee. Write an email to the gym manager.',
 'The gym is called FitCore. The manager''s name is Mr. Sam Patel.',
 '["Explain your situation clearly and why you need to cancel your membership","Reference the contract terms and ask if there is a waiver option given your circumstances","Ask for a response within a specific number of days"]'::text,
 NULL, NULL, 27),

(13, 2, 'survey', 'easy',
 'A community wellness group is surveying residents: Parents, educators, and health experts are debating how much screen time teenagers should have outside of school. Some believe there should be strict daily limits (no more than 2 hours) to protect mental health and encourage physical activity. Others believe that teenagers are responsible enough to manage their own screen time without adult-imposed limits. What is your view? Should there be limits on teen screen time? Give specific reasons.',
 NULL,
 NULL,
 'There should be strict daily limits on teenagers'' screen time',
 'Teenagers should manage their own screen time without imposed limits', 26),

-- SET 14
(14, 1, 'email', 'easy',
 'You had a positive experience with a mentor at your workplace who helped you develop new skills. You are leaving the company for a new job and want to write a thank-you email.',
 'Your mentor''s name is Ms. Patricia Lam. You have worked together for two years.',
 '["Thank your mentor for their specific help and the time they invested in you","Mention one or two things you learned from them that made a real difference","Say that you hope to stay in touch and wish them well"]'::text,
 NULL, NULL, 27),

(14, 2, 'survey', 'intermediate',
 'A business association is gathering opinions from community members: Some people prefer to shop at locally owned small businesses because it supports the community, creates local jobs, and maintains the unique character of neighbourhoods. Others prefer large chain stores because they offer lower prices, wider selection, and more consistent quality. Which do you prefer and why? Give specific reasons and examples to support your choice.',
 NULL,
 NULL,
 'I prefer locally owned small businesses',
 'I prefer large chain stores', 26),

-- SET 15
(15, 1, 'email', 'advanced',
 'You live near a city park that has been poorly maintained. You want to write to your local city councillor to advocate for park improvements.',
 'The councillor''s name is Councillor Maria Santos. You represent a group of concerned residents.',
 '["Describe the current state of the park and the specific problems with evidence or examples","Explain why the park matters to the community and who is affected","Make two or three specific, realistic requests for improvement and offer to participate in a community meeting"]'::text,
 NULL, NULL, 27),

(15, 2, 'survey', 'advanced',
 'An energy policy organization is asking citizens for input: Some people believe governments should invest heavily in renewable energy (solar, wind, hydro) to combat climate change, even if it means higher short-term costs for taxpayers and consumers. Others argue that until renewable technologies become cost-competitive on their own, governments should continue supporting affordable conventional energy sources to protect household budgets. What is your view on government investment in renewable energy? Give a clear, supported position.',
 NULL,
 NULL,
 'Governments should invest heavily in renewable energy now, even at higher short-term cost',
 'Governments should wait until renewable energy is cost-competitive before major investment', 26),

-- SET 16
(16, 1, 'email', 'intermediate',
 'You recently purchased a product from an online retailer and it arrived damaged. You have tried to contact their customer service but received no response after 10 days. Write a formal complaint email.',
 'The retailer is called HomeStyle Direct. Your order number is HS-99217.',
 '["Describe the product you ordered and the damage you found when it arrived","Explain your attempts to contact customer service and the lack of response","State clearly what resolution you are expecting, and by what date"]'::text,
 NULL, NULL, 27),

(16, 2, 'survey', 'intermediate',
 'A workplace research organization is collecting opinions: Many companies around the world are experimenting with a four-day work week (32 hours instead of 40, with no reduction in pay). Supporters say it improves employee wellbeing, productivity, and retention. Critics argue it is impractical, increases costs, and reduces the ability to serve customers and clients. What is your opinion on the four-day work week? Give a clear position and specific reasons.',
 NULL,
 NULL,
 'The four-day work week should be adopted widely — it benefits both employees and employers',
 'The four-day work week is impractical and would harm businesses and service delivery', 26),

-- SET 17
(17, 1, 'email', 'easy',
 'A colleague at work is leaving for a new job in another city. You are organizing a small farewell gathering for them and want to invite another coworker. Write an email.',
 'Your departing colleague''s name is James. The coworker you are inviting is named Priya.',
 '["Tell Priya about James leaving and the reason for the gathering","Give the details of the event (when, where, and format)","Ask Priya to confirm attendance and suggest she keep it a surprise"]'::text,
 NULL, NULL, 27),

(17, 2, 'survey', 'easy',
 'A city safety committee is gathering public views: Some people strongly support the expansion of public surveillance cameras in city streets, parks, and transit stations because they deter crime and help police solve cases faster. Others oppose surveillance cameras because they invade privacy, create a culture of distrust, and are often misused by authorities. What is your view? Should cities expand their network of public surveillance cameras? Give specific reasons to support your position.',
 NULL,
 NULL,
 'Cities should expand their network of public surveillance cameras',
 'Cities should not expand public surveillance cameras — they invade privacy', 26),

-- SET 18
(18, 1, 'email', 'advanced',
 'You are interested in applying for a position at a new company in your field. You have not seen a posted job opening but believe you would be a strong fit. Write a cover letter-style email to introduce yourself.',
 'The company is called Novex Solutions. The hiring contact is Ms. Rachel Kim, Head of Talent.',
 '["Introduce yourself, briefly describe your professional background, and explain why you are reaching out to this specific company","Highlight two or three skills or accomplishments that make you a strong candidate","Express your interest in exploring any current or upcoming opportunities and offer to share your resume"]'::text,
 NULL, NULL, 27),

(18, 2, 'survey', 'advanced',
 'A civic engagement organization is asking residents for input: Some people believe that allowing pets — especially dogs — in apartment buildings should be a right for all tenants, as pets improve mental health and quality of life. Others believe that building managers and strata councils should have the authority to ban pets because they cause noise, property damage, and allergic reactions for other residents. What is your view on pet ownership in apartments? Give a clear position with specific supporting reasons.',
 NULL,
 NULL,
 'Tenants should have the right to keep pets in apartment buildings',
 'Building managers should have authority to ban pets in apartments', 26),

-- SET 19
(19, 1, 'email', 'intermediate',
 'Your building management recently sent a notice prohibiting the use of the rooftop terrace for personal gatherings. Many residents feel this is unfair. You want to write a respectful email requesting a review of this policy.',
 'The building manager''s name is Mr. Kevin Marsh. You are writing on behalf of several residents.',
 '["Acknowledge the building management''s concern and show you understand the reason for the policy","Explain why the rooftop terrace is valued by residents and give specific examples of responsible use","Propose a compromise (such as a booking system or noise curfew) and ask for a review of the policy"]'::text,
 NULL, NULL, 27),

(19, 2, 'survey', 'intermediate',
 'A city digital access committee is surveying residents: Some people believe the city''s top priority for free public Wi-Fi should be low-income neighbourhoods and community centres, where residents have the greatest need and least access to affordable internet. Others believe the city should focus on expanding free Wi-Fi in high-traffic public spaces like transit stations, parks, and downtown areas to benefit the largest number of people. What do you think should be the top priority for public Wi-Fi expansion in cities? Give specific reasons.',
 NULL,
 NULL,
 'Free public Wi-Fi should be prioritized in low-income neighbourhoods and community centres',
 'Free public Wi-Fi should be expanded in high-traffic public spaces for the most users', 26),

-- SET 20
(20, 1, 'email', 'advanced',
 'You recently visited a library in your community and noticed that it has very limited programming for adults — the focus is entirely on children''s events. You want to write to the library director suggesting a new adult community program.',
 'The library director''s name is Ms. Frances Okafor.',
 '["Acknowledge the library''s existing programs and mention your positive history as a library user","Describe a specific adult programming idea you are proposing and explain its value to the community","Ask if the library would consider your suggestion and offer to help organize or volunteer"]'::text,
 NULL, NULL, 27),

(20, 2, 'survey', 'advanced',
 'A national debate organization is asking participants to share their views: Remote work — where employees work from home full-time or most of the time — has become much more common since 2020. Some people believe remote work is a permanent positive shift that benefits employees'' wellbeing, productivity, and work-life balance. Others argue that office work is essential for collaboration, company culture, mentoring junior staff, and maintaining clear boundaries between work and personal life. What is your view? Is remote work a positive long-term shift, or should offices remain central to how we work? Give a clear, supported position.',
 NULL,
 NULL,
 'Remote work is a positive long-term shift that should be widely adopted',
 'Office-based work should remain central — remote work has significant limitations', 26)

) AS t(set_number, task_number, task_type, difficulty, prompt_text, scenario_context, bullet_points, option_a, option_b, time_limit)
ON s.set_number = t.set_number
ON CONFLICT (set_id, task_number) DO NOTHING;
