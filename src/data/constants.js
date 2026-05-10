const viteEnv = import.meta.env || {}
const nodeEnv = typeof process !== 'undefined' ? process.env : {}

// ─── CDN base URL for audio/images ────────────────────────────────
// Empty in dev (serves from /public), R2 URL in production
export const CDN_URL = viteEnv.VITE_CDN_URL || nodeEnv.VITE_CDN_URL || ''

/** Prefix a static asset path with the CDN URL */
export const asset = (path) => `${CDN_URL}${path}`

export const BRAND_NAME = 'CELPIPACE'
export const SUPPORT_EMAIL = 'hello@celpipace.ca'
export const PUBLIC_SITE_URL = (viteEnv.VITE_SITE_URL || nodeEnv.VITE_SITE_URL || 'https://celpipace.ca').replace(/\/$/, '')
export const TERMS_VERSION = '2026-05-07'
export const AUTH_CONSENT_STORAGE_KEY = 'celpipace_pending_auth_consent'

// Canonical public copy. "Question items" includes objective questions plus
// writing/speaking prompts, so it is broader than official 38-question test sections.
export const PRODUCT_STATS = {
  questionItems: '1,190+',
  practiceSets: '220+',
  mockExams: '8',
  listeningSets: '120',
  readingSets: '46',
  writingSets: '40',
  speakingPrompts: '120',
  listeningOfficialQuestions: '38',
  readingOfficialQuestions: '38',
}

export const SECTION_LIBRARY = {
  listening: { label: 'Listening', icon: '🎧', desc: `${PRODUCT_STATS.listeningSets} practice sets`, path: '/celpip-listening-practice' },
  reading: { label: 'Reading', icon: '📖', desc: `${PRODUCT_STATS.readingSets} practice sets`, path: '/celpip-reading-practice' },
  writing: { label: 'Writing', icon: '✍️', desc: `${PRODUCT_STATS.writingSets} writing prompts`, path: '/celpip-writing-practice' },
  speaking: { label: 'Speaking', icon: '🎙️', desc: `8 tasks · ${PRODUCT_STATS.speakingPrompts} prompts`, path: '/celpip-speaking-practice' },
}

// ─── Section metadata ─────────────────────────────────────────────
export const SECTIONS = [
  { id: 'listening', label: 'Listening', icon: '🎧', color: '#4A90D9', questions: 8, freeQuestions: 3, duration: '47–55 min', celpipParts: 6 },
  { id: 'reading',   label: 'Reading',   icon: '📖', color: '#2D8A56', questions: 8, freeQuestions: 3, duration: '55–60 min', celpipParts: 4 },
  { id: 'writing',   label: 'Writing',   icon: '✍️',  color: '#C8972A', questions: 4, freeQuestions: 1, duration: '53–60 min', celpipParts: 2 },
  { id: 'speaking',  label: 'Speaking',  icon: '🎤', color: '#C8102E', questions: 8, freeQuestions: 2, duration: '15–20 min', celpipParts: 8 },
]

// ─── Strategy Tips ────────────────────────────────────────────────
export const TIPS = {
  listening: [
    { title: 'Note-taking Strategy',   content: 'Focus on keywords, names, numbers, and transition words. Don\'t try to write everything — jot abbreviations.', free: true },
    { title: 'Prediction Technique',   content: 'Before each audio plays, read the questions first. Predict what type of info you need (date, name, reason, etc.).', free: true },
    { title: 'Distractor Awareness',   content: 'CELPIP often includes "near-miss" answers. The speaker may mention something then correct themselves — listen for the FINAL answer.', free: false },
    { title: 'Tone & Attitude Cues',   content: 'Pay attention to intonation. Rising tone = question/uncertainty. Stress on a word = emphasis/importance. Sarcasm is rare but does appear.', free: false },
  ],
  reading: [
    { title: 'Skim → Scan → Read',       content: 'First skim the passage (30 sec), then scan questions to know what to look for, then read carefully for answers.', free: true },
    { title: 'Correspondence Questions', content: 'For email/letter tasks, focus on the PURPOSE of each message and how the tone shifts between replies.', free: true },
    { title: 'Viewpoint Questions',      content: 'When asked about the author\'s opinion, look for qualifying words: "however", "despite", "although" — these signal the real viewpoint.', free: false },
    { title: 'Vocabulary in Context',    content: 'Don\'t pick the dictionary definition. Ask: which meaning fits THIS sentence? Substitute each option and see which sounds natural.', free: false },
  ],
  writing: [
    { title: 'Email Structure (Task 1)',  content: 'Use a clear format: greeting → reason for writing → 3 key points → polite closing. Match the tone to who you\'re writing to.', free: true },
    { title: 'Survey Response (Task 2)', content: 'Pick ONE clear position. Use: opinion → reason 1 + example → reason 2 + example → restate opinion. Aim for 200+ words.', free: false },
    { title: 'Vocabulary Range',         content: 'Replace basic words: good→beneficial, bad→detrimental, important→crucial. Use 2–3 complex sentences with subordinate clauses.', free: false },
    { title: 'Time Management',         content: 'Task 1: 25 min (150+ words). Task 2: 30 min (200+ words). Leave 3 min to proofread each. Spelling errors hurt your score.', free: false },
  ],
  speaking: [
    { title: 'Preparation Time',      content: 'You get 20–30 seconds of prep time. Use it to note 2–3 key points. Don\'t write full sentences — just trigger words.', free: true },
    { title: 'Fluency Over Accuracy', content: 'Keep talking! Pauses hurt more than minor grammar mistakes. If you lose your train of thought, rephrase and continue.', free: true },
    { title: 'Describe a Scene',      content: 'Use spatial language: "In the foreground… In the background… On the left side…" This shows vocabulary range.', free: false },
    { title: 'Opinion Tasks',         content: 'Structure: state opinion → give reason → provide personal example → conclude. Use phrases like "From my perspective…" and "Based on my experience…"', free: false },
  ],
}

// ─── Mock Practice Questions ──────────────────────────────────────
export const MOCK_QUESTIONS = {
  listening: [
    {
      id: 1, free: true,
      type: 'Part 1 – Practice', scenario: 'Listening to Problem Solving',
      prompt: 'You will hear a conversation between two coworkers discussing a scheduling conflict. Listen carefully and answer the question.',
      question: 'What does Sarah suggest as a solution to the scheduling conflict?',
      options: ['Moving the meeting to Thursday', 'Having the meeting online instead', 'Splitting the team into two groups', 'Cancelling the meeting entirely'],
      correct: 1,
      explanation: 'Sarah explicitly suggests switching to an online format, saying "Why don\'t we just do it virtually? That way everyone can attend regardless of location."',
    },
    {
      id: 2, free: true,
      type: 'Part 2 – Practice', scenario: 'Daily Life Conversation',
      prompt: 'You will hear a conversation at a community centre about signing up for programs.',
      question: 'Why can\'t the man register for the swimming class today?',
      options: ['The class is already full', 'Registration hasn\'t opened yet', 'He needs to bring photo ID', 'The class was cancelled this semester'],
      correct: 1,
      explanation: 'The receptionist says registration for winter programs opens next Monday, so he cannot register today.',
    },
    {
      id: 3, free: true,
      type: 'Part 3 – Practice', scenario: 'Listening for Information',
      prompt: 'You will hear a news report about changes to public transit routes in a Canadian city.',
      question: 'According to the report, when will the new bus routes take effect?',
      options: ['Immediately', 'Next Monday', 'In two weeks', 'Next month'],
      correct: 1,
      explanation: 'The reporter states the changes will be implemented "starting next Monday morning."',
    },
    { id: 4, free: false, type: 'Part 3 – Full', scenario: 'Listening for Information', prompt: 'Listen to an announcement about a workplace policy change.', question: 'What is the main reason given for the new remote work policy?', options: ['To reduce office costs', 'To improve employee satisfaction', 'To comply with new regulations', 'To increase productivity'], correct: 1 },
    { id: 5, free: false, type: 'Part 4', scenario: 'Listening to a News Item', prompt: 'Listen to a radio segment about environmental initiatives.', question: 'What action did the city council approve?', options: ['A ban on single-use plastics', 'A new recycling facility', 'Tax incentives for green businesses', 'Mandatory composting for residents'], correct: 2 },
    { id: 6, free: false, type: 'Part 5', scenario: 'Listening to a Discussion', prompt: 'Listen to a panel discussion about housing affordability.', question: 'Which expert disagrees with the proposed government intervention?', options: ['Dr. Chen', 'Professor Williams', 'Ms. Rodriguez', 'Mr. Thompson'], correct: 3 },
    { id: 7, free: false, type: 'Part 6', scenario: 'Listening for Viewpoints', prompt: 'Listen to a debate about education funding priorities.', question: 'What is Speaker B\'s main argument against the proposal?', options: ['It costs too much', 'It won\'t help rural areas', 'It ignores teacher shortages', 'It was tried before and failed'], correct: 2 },
    { id: 8, free: false, type: 'Part 6 – Full', scenario: 'Listening for Viewpoints', prompt: 'Continue with the education debate.', question: 'How does the moderator summarize the key disagreement?', options: ['Funding vs. training', 'Urban vs. rural priorities', 'Short-term vs. long-term goals', 'Federal vs. provincial responsibility'], correct: 2 },
  ],
  reading: [
    {
      id: 1, free: true,
      type: 'Part 1 – Practice', scenario: 'Reading Correspondence',
      prompt: 'Read the following email exchange between a tenant and a property manager about a maintenance request.',
      passage: 'From: David Kim\nTo: Greenfield Property Management\nSubject: Urgent – Heating Issue in Unit 4B\n\nDear Property Management Team,\n\nI am writing to report that the heating system in my apartment has stopped working as of yesterday evening. The temperature inside has dropped significantly, and given that it is currently -15°C outside, this is an urgent matter that needs immediate attention.\n\nI have already checked the thermostat and replaced the batteries, but the system still does not respond. Could you please send a technician as soon as possible?\n\nThank you,\nDavid Kim',
      question: 'What has David already done to try to fix the problem?',
      options: ['Called the heating company directly', 'Checked and replaced thermostat batteries', 'Turned the system off and back on', 'Asked a neighbour for help'],
      correct: 1,
      explanation: 'David states he has "checked the thermostat and replaced the batteries" — this matches option B.',
    },
    {
      id: 2, free: true,
      type: 'Part 2 – Practice', scenario: 'Reading for Charts & Graphs',
      prompt: 'A bar chart shows monthly visitor numbers to a national park:\nJan: 2,000 | Feb: 2,500 | Mar: 4,000 | Apr: 7,500 | May: 12,000 | Jun: 18,000\nJul: 22,000 | Aug: 20,000 | Sep: 14,000 | Oct: 8,000 | Nov: 3,500 | Dec: 2,200',
      question: 'During which period did visitor numbers increase the most rapidly?',
      options: ['January to March', 'March to May', 'May to July', 'September to November'],
      correct: 1,
      explanation: 'March to May shows the steepest increase: from 4,000 to 12,000 (an increase of 8,000 — tripling the count).',
    },
    {
      id: 3, free: true,
      type: 'Part 3 – Practice', scenario: 'Reading for Information',
      prompt: 'Read the following article about a new Canadian immigration policy.',
      passage: 'The Government of Canada announced changes to the Express Entry system that will take effect in the coming months. Under the new category-based selection system, candidates with specific work experience in healthcare, STEM fields, trades, transport, and agriculture may receive targeted invitations to apply for permanent residence.\n\nWhile the traditional Comprehensive Ranking System (CRS) score will still play a role, the Minister of Immigration will now have the authority to establish categories based on economic priorities. Critics argue this gives too much discretionary power to the minister, while supporters say it better aligns immigration with labour market needs.',
      question: 'What is a key criticism of the new system?',
      options: ['It ignores CRS scores entirely', 'It gives the minister too much power', 'It only benefits healthcare workers', 'It makes PR applications slower'],
      correct: 1,
      explanation: 'The passage states critics argue the system "gives too much discretionary power to the minister."',
    },
    { id: 4, free: false, type: 'Part 3 – Full', scenario: 'Reading for Information', question: 'According to the passage, which fields are specifically targeted?', options: ['Technology and finance', 'Healthcare, STEM, trades, transport, agriculture', 'Education and government', 'Arts and hospitality'], correct: 1 },
    { id: 5, free: false, type: 'Part 4', scenario: 'Reading for Viewpoints', question: 'What is the author\'s overall tone toward urban expansion?', options: ['Strongly supportive', 'Cautiously critical', 'Neutral and factual', 'Aggressively opposed'], correct: 1 },
    { id: 6, free: false, type: 'Part 4', scenario: 'Reading for Viewpoints', question: 'Which word best describes Dr. Patel\'s position on remote work?', options: ['Dismissive', 'Enthusiastic', 'Pragmatic', 'Indifferent'], correct: 2 },
    { id: 7, free: false, type: 'Part 4', scenario: 'Reading for Viewpoints', question: 'The editorial argues that public transit funding should be…', options: ['Eliminated', 'Maintained at current levels', 'Significantly increased', 'Privatized'], correct: 2 },
    { id: 8, free: false, type: 'Part 4 – Full', scenario: 'Reading for Viewpoints', question: 'How does the author counter the opposing viewpoint?', options: ['By citing research data', 'By using emotional appeal', 'By referencing legal precedent', 'By dismissing it entirely'], correct: 0 },
  ],
  writing: [
    {
      id: 1, free: true,
      type: 'Task 1 – Practice', scenario: 'Writing an Email',
      prompt: 'You received a notice that your local community centre will be closing the children\'s after-school program due to budget cuts. Write an email to the community centre manager. In your email:\n\n• Express your concern about the closure\n• Explain why the program is important to your family\n• Suggest an alternative solution',
      wordLimit: '150–200 words', timeLimit: '27 minutes',
    },
    {
      id: 2, free: false,
      type: 'Task 1 – Full', scenario: 'Writing an Email',
      prompt: 'Your neighbour has been renovating their home, causing excessive noise during evenings and weekends. Write an email to your building\'s strata council.',
      wordLimit: '150–200 words', timeLimit: '27 minutes',
    },
    {
      id: 3, free: false,
      type: 'Task 2 – Practice', scenario: 'Survey Response',
      prompt: 'A local newspaper is conducting a survey:\n\n"Should the government invest more in public transportation or road infrastructure?"\n\nChoose ONE option and support your choice with reasons and examples.',
      wordLimit: '200–300 words', timeLimit: '30 minutes',
    },
    {
      id: 4, free: false,
      type: 'Task 2 – Full', scenario: 'Survey Response',
      prompt: 'An online forum asks:\n\n"Is working from home better for employees than working in an office?"\n\nProvide your opinion with supporting arguments.',
      wordLimit: '200–300 words', timeLimit: '30 minutes',
    },
  ],
  speaking: [
    { id: 1, free: true,  type: 'Task 1', scenario: 'Giving Advice',                   prompt: 'A friend is thinking about moving to a new city for a job opportunity but is worried about leaving family behind. Give your friend advice about what they should do.', prepTime: 30, speakTime: 90 },
    { id: 2, free: true,  type: 'Task 2', scenario: 'Personal Experience',              prompt: 'Talk about a time when you had to learn a new skill quickly. What was the skill? How did you learn it? What was the result?', prepTime: 30, speakTime: 60 },
    { id: 3, free: false, type: 'Task 3', scenario: 'Describing a Scene',               prompt: 'Look at the image of a busy farmer\'s market on a Saturday morning. Describe what you see in as much detail as possible.', prepTime: 30, speakTime: 60 },
    { id: 4, free: false, type: 'Task 4', scenario: 'Making Predictions',               prompt: 'Based on the scene you just described, predict what might happen next and explain why.', prepTime: 30, speakTime: 60 },
    { id: 5, free: false, type: 'Task 5', scenario: 'Comparing & Persuading',           prompt: 'A community has two options for a new public space: a playground for children OR a dog park. You prefer the playground. Persuade the community council to choose your option.', prepTime: 60, speakTime: 60 },
    { id: 6, free: false, type: 'Task 6', scenario: 'Difficult Situation',              prompt: 'You ordered a product online and it arrived damaged. Call the company\'s customer service and explain the problem, ask for a solution, and express your dissatisfaction politely.', prepTime: 60, speakTime: 60 },
    { id: 7, free: false, type: 'Task 7', scenario: 'Expressing Opinions',              prompt: 'Do you think social media has a positive or negative effect on society? State and support your opinion.', prepTime: 30, speakTime: 90 },
    { id: 8, free: false, type: 'Task 8', scenario: 'Describing an Unusual Situation',  prompt: 'Imagine you arrive at work and find that your office has been completely rearranged overnight with no explanation. Describe the situation and explain how you would handle it.', prepTime: 30, speakTime: 60 },
  ],
}

// ─── CELPIP Score / CLB Table ─────────────────────────────────────
export const SCORE_LEVELS = [
  { level: 'M',     label: 'M (0)',       desc: 'Minimal proficiency',     clb: '—' },
  { level: '1',     label: 'Level 1',     desc: 'Beginner',                clb: '1' },
  { level: '2',     label: 'Level 2',     desc: 'Elementary',              clb: '2' },
  { level: '3–4',   label: 'Level 3–4',   desc: 'Low Intermediate',        clb: '3–4' },
  { level: '5',     label: 'Level 5',     desc: 'Intermediate',            clb: '5' },
  { level: '6',     label: 'Level 6',     desc: 'Upper Intermediate',      clb: '6' },
  { level: '7',     label: 'Level 7',     desc: 'High Intermediate',       clb: '7',    highlight: true, note: 'Min. for most PR programs' },
  { level: '8',     label: 'Level 8',     desc: 'Functional Proficiency',  clb: '8' },
  { level: '9',     label: 'Level 9',     desc: 'Upper Proficiency',       clb: '9',    highlight: true, note: 'Strong CRS points' },
  { level: '10–12', label: 'Level 10–12', desc: 'Advanced / Native-like',  clb: '10', highlight: true, note: 'Max CRS points' },
]

// ─── CRS Age points ───────────────────────────────────────────────
// Source: Official IRCC CRS JS (crs-tool-udit.js)
// [withSpouse, withoutSpouse]
export const CRS_AGE_WITH_SPOUSE    = { 17:0, 18:90, 19:95, 20:100, 21:100, 22:100, 23:100, 24:100, 25:100, 26:100, 27:100, 28:100, 29:100, 30:95, 31:90, 32:85, 33:80, 34:75, 35:70, 36:65, 37:60, 38:55, 39:50, 40:45, 41:35, 42:25, 43:15, 44:5, 45:0 }
export const CRS_AGE_NO_SPOUSE      = { 17:0, 18:99, 19:105, 20:110, 21:110, 22:110, 23:110, 24:110, 25:110, 26:110, 27:110, 28:110, 29:110, 30:105, 31:99, 32:94, 33:88, 34:83, 35:77, 36:72, 37:66, 38:61, 39:55, 40:50, 41:39, 42:28, 43:17, 44:6, 45:0 }
// Keep backward compat alias (no spouse)
export const CRS_AGE = CRS_AGE_NO_SPOUSE

// ─── CRS Education points ─────────────────────────────────────────
// Source: Official IRCC CRS JS
// With spouse: secondary=28, 1yr=84, 2yr=91, bachelors=112, 2+=119, masters=126, doctoral=140
// Without spouse: secondary=30, 1yr=90, 2yr=98, bachelors=120, 2+=128, masters=135, doctoral=150
export const CRS_EDUCATION_WITH_SPOUSE = { 'none':0, 'secondary':28, 'one_year':84, 'two_year':91, 'bachelors':112, 'two_or_more':119, 'masters':126, 'doctoral':140 }
export const CRS_EDUCATION_NO_SPOUSE   = { 'none':0, 'secondary':30, 'one_year':90, 'two_year':98, 'bachelors':120, 'two_or_more':128, 'masters':135, 'doctoral':150 }
// Keep backward compat alias
export const CRS_EDUCATION = CRS_EDUCATION_NO_SPOUSE

// ─── CRS Canadian work experience ────────────────────────────────
// Source: Official IRCC CRS JS
export const CRS_CAN_EXP_WITH_SPOUSE = { 0:0, 1:35, 2:46, 3:56, 4:63, 5:70 }
export const CRS_CAN_EXP_NO_SPOUSE   = { 0:0, 1:40, 2:53, 3:64, 4:72, 5:80 }
export const CRS_CAN_EXP = CRS_CAN_EXP_NO_SPOUSE

// ─── CRS Foreign work experience ─────────────────────────────────
// Source: Official IRCC CRS JS — only in skill transferability, no direct core pts
// (IRCC Q6ii foreign adds 0 core pts — foreign exp only matters for skill transferability)
export const CRS_FOREIGN_EXP = { 0:0, 1:0, 2:0, 3:0 }

// ─── CRS First official language (per skill, per CLB) ────────────
// Source: Official IRCC CRS JS — CELPIP array z[i][6]=with_spouse, z[i][7]=no_spouse
// CLB: 10=34/32, 9=31/29, 8=23/22, 7=17/16, 6=9/8, 5=6/6, 4=6/6, <4=0/0
export const CRS_LANG_POINTS_WITH_SPOUSE = {
  4:  { listen:6,  read:6,  write:6,  speak:6  },
  5:  { listen:6,  read:6,  write:6,  speak:6  },
  6:  { listen:8,  read:8,  write:8,  speak:8  },
  7:  { listen:16, read:16, write:16, speak:16 },
  8:  { listen:22, read:22, write:22, speak:22 },
  9:  { listen:29, read:29, write:29, speak:29 },
  10: { listen:32, read:32, write:32, speak:32 },
}
export const CRS_LANG_POINTS_NO_SPOUSE = {
  4:  { listen:6,  read:6,  write:6,  speak:6  },
  5:  { listen:6,  read:6,  write:6,  speak:6  },
  6:  { listen:9,  read:9,  write:9,  speak:9  },
  7:  { listen:17, read:17, write:17, speak:17 },
  8:  { listen:23, read:23, write:23, speak:23 },
  9:  { listen:31, read:31, write:31, speak:31 },
  10: { listen:34, read:34, write:34, speak:34 },
}
export const CRS_LANG_POINTS = CRS_LANG_POINTS_NO_SPOUSE

// ─── CRS Second official language (per skill, per CLB) ───────────
// Source: Official IRCC CRS JS — z[i][8]=with_spouse, z[i][9]=no_spouse
// CLB: 10=6/6, 9=6/6, 8=3/3, 7=3/3, 6=1/1, 5=1/1, <=4=0/0
// Max 22 pts total (enforced in calculator)
export const CRS_LANG2_POINTS = {
  0:  { listen:0, read:0, write:0, speak:0 },
  4:  { listen:0, read:0, write:0, speak:0 },
  5:  { listen:1, read:1, write:1, speak:1 },
  6:  { listen:1, read:1, write:1, speak:1 },
  7:  { listen:3, read:3, write:3, speak:3 },
  8:  { listen:3, read:3, write:3, speak:3 },
  9:  { listen:6, read:6, write:6, speak:6 },
  10: { listen:6, read:6, write:6, speak:6 },
}

// ─── Spouse education points (Section B) ─────────────────────────
// Source: Official IRCC CRS JS q10
export const CRS_SPOUSE_EDUCATION = {
  'none':0, 'secondary':2, 'one_year':6, 'two_year':7,
  'bachelors':8, 'two_or_more':9, 'masters':10, 'doctoral':10,
}

// ─── Spouse Canadian work experience (Section B) ─────────────────
// Source: Official IRCC CRS JS q11: 0=0, 1=5, 2=7, 3=8, 4=9, 5=10
export const CRS_SPOUSE_CAN_EXP = { 0:0, 1:5, 2:7, 3:8, 4:9, 5:10 }

// ─── Free-tier part access ────────────────────────────────────────
// Parts listed here give free users access to Set 1 only.
// All other parts require premium for any set (including Set 1).
export const FREE_PARTS = new Set(['L1', 'L2', 'R1', 'R2', 'W1', 'S1', 'S2', 'S3'])

// ─── Pricing ─────────────────────────────────────────────────────
export const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    badge: null,
    active: true,
    features: [
      '3 practice questions per section',
      'Basic tips & strategies',
      'Score level reference guide',
      'CLB equivalency chart',
      'Interactive CRS Calculator',
    ],
    locked: [
      'Full mock tests (all 28 questions)',
      'Detailed answer explanations',
      'Premium strategy guides',
      'Writing templates & samples',
      'Speaking model answers',
      'Progress tracking',
    ],
    cta: 'Current Plan',
    ctaStyle: 'inactive',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    badge: '🔥 Most Popular',
    features: [
      'Everything in Free',
      'Full mock tests — all 28 questions',
      'Detailed answer explanations',
      'All premium tips & strategies',
      'Writing templates & sample answers',
      'Speaking model responses',
      'Progress tracking dashboard',
    ],
    locked: [],
    cta: 'Start 7-Day Free Trial',
    ctaStyle: 'primary',
  },
  {
    name: 'Premium',
    price: '$49.99',
    period: '/year',
    badge: '🏆 Best Value',
    features: [
      'Everything in Pro',
      'Annual subscription',
      '8 full-length mock tests',
      'Instant writing feedback',
      'Real-time speaking assessment',
      'Personalised study plan',
      'Priority email support',
    ],
    locked: [],
    cta: 'Get Annual Premium',
    ctaStyle: 'gold',
  },
]
