/* ─── CELPIPace Blog Articles ──────────────────────────────────
   Each article has:
     slug, title, category, tag, readTime, date, excerpt,
     author, sections: [ { heading, body, list? } ]
   ─────────────────────────────────────────────────────────── */

export const BLOG_CATEGORIES = [
  { id: 'all',        label: 'All Articles' },
  { id: 'writing',    label: 'Writing'      },
  { id: 'listening',  label: 'Listening'    },
  { id: 'reading',    label: 'Reading'      },
  { id: 'speaking',   label: 'Speaking'     },
  { id: 'immigration',label: 'Immigration'  },
  { id: 'strategy',   label: 'Strategy'     },
]

export const BLOG_ARTICLES = [
  /* ── 1 ── */
  {
    slug: 'how-to-score-clb-10-writing',
    title: 'How to Score CLB 10+ on CELPIP Writing',
    category: 'writing',
    tag: 'Writing',
    tagColor: '#C8972A',
    tagColorLight: '#FFFBEB',
    readTime: '7 min read',
    date: 'March 28, 2026',
    excerpt:
      'Most test-takers leave 2–3 CLB points on the table in Writing because they focus on grammar alone. Here\'s the full scoring blueprint.',
    sections: [
      {
        heading: 'Why Grammar Is Not Enough',
        body: `The CELPIP Writing section is scored on four criteria: Content, Organization, Vocabulary, and Conventions (grammar/punctuation). Each criterion carries equal weight. Most test-takers spend 90% of their preparation on grammar — which only accounts for 25% of your final score.\n\nThe highest-scoring responses show coherent argument development, clear paragraph structure, and a wide range of sophisticated vocabulary used accurately. A response full of complex sentences that wanders off-topic will not achieve CLB 10.`,
      },
      {
        heading: 'Task 1: Writing an Email — The Formula',
        body: `You have 27 minutes to write a 150–200 word email. The task specifies a relationship (formal / informal) and three bullet points you must address. Use this structure:`,
        list: [
          'Opening line: state your purpose directly (one sentence)',
          'Bullet 1 paragraph: ~40 words, address the first point, use a connector (Moreover / Additionally)',
          'Bullet 2 paragraph: ~40 words, second point, opposite connector (However / On the other hand)',
          'Bullet 3 paragraph: ~40 words, third point, signal agreement/recommendation',
          'Closing line: forward-looking statement + sign-off matching the register',
        ],
        body2: `Keep every paragraph to 2–3 sentences. Examiners reward conciseness. Aim for exactly 150–180 words — going over rarely helps and often introduces new errors.`,
      },
      {
        heading: 'Task 2: Responding to Survey Questions — Structure Wins',
        body: `26 minutes, 150–200 words, defend a position on a social/workplace topic. The single biggest mistake: writing a list of reasons without elaborating. Each reason must be supported with a concrete example or explanation.\n\nUse the P-E-E structure: Point → Explain → Example. "I believe remote work increases productivity (P). Without office interruptions, employees complete focused tasks faster (E). For instance, a 2023 Stanford study showed remote workers were 13% more productive than their office counterparts (E2)."`,
      },
      {
        heading: 'Vocabulary: The Difference Between CLB 8 and CLB 10',
        body: `CLB 8 uses common, correct vocabulary. CLB 10 uses precise, varied vocabulary. Practice replacing overused words:`,
        list: [
          'good → beneficial, advantageous, commendable',
          'bad → detrimental, counterproductive, problematic',
          'say → assert, contend, emphasize, note',
          'important → crucial, paramount, indispensable',
          'help → facilitate, enable, bolster, alleviate',
        ],
        body2: `Don't force rare words — examiners deduct marks for misuse. Learn 5 new "upgrade" synonyms per week and use them deliberately in practice.`,
      },
      {
        heading: 'Practice Routine That Works',
        body: `Write one email and one survey response every 2–3 days. After writing, read the task again and check: Did I address all three bullet points? Is my position clear in the first sentence? Did I use at least 3 different sentence structures? Then use CELPIPace's AI scoring to get instant feedback on all four criteria.`,
      },
    ],
  },

  /* ── 2 ── */
  {
    slug: 'celpip-listening-strategies-clb-9',
    title: '7 Listening Strategies to Reach CLB 9+',
    category: 'listening',
    tag: 'Listening',
    tagColor: '#4A90D9',
    tagColorLight: '#EEF4FF',
    readTime: '6 min read',
    date: 'March 22, 2026',
    excerpt:
      'CELPIP Listening is unique — it tests real Canadian English with accents, contractions, and reduced speech. Most IELTS-trained learners are unprepared.',
    sections: [
      {
        heading: 'What Makes CELPIP Listening Different',
        body: `Unlike IELTS, CELPIP Listening uses exclusively Canadian-accented speech — a blend of General American and British influences, with regional variations. Speakers use contractions, discourse markers ("So like, the thing is..."), and informal reductions ("gonna", "wanna", "kinda") that many academic learners have never practised actively listening to.`,
      },
      {
        heading: 'Strategy 1: Pre-read Every Question',
        body: `Before each audio clip plays, you have ~10 seconds. Use every second. Read the question stem AND all four answer options. Underline the key noun/verb in each option. This trains your brain to listen for specific information rather than trying to process everything at once.`,
      },
      {
        heading: 'Strategy 2: Identify the Speaker\'s Purpose',
        body: `Part L3 and L6 questions frequently ask about the speaker's attitude, tone, or intention rather than factual details. While listening, ask yourself: Is the speaker agreeing? Complaining? Warning? Explaining? Persuading? The tone of the final sentence is often the key clue.`,
      },
      {
        heading: 'Strategy 3: Watch for Contrast Signals',
        body: `Answers to CLB 9+ questions often hinge on contrasting information. Train yourself to react to these words: "but", "however", "although", "actually", "turns out", "the problem is", "to be honest". When you hear them, the critical information is about to come.`,
      },
      {
        heading: 'Strategy 4: Process of Elimination on Audio Parts',
        body: `For Parts L1–L4 (shorter clips), eliminate answers that: (a) were not mentioned, (b) were mentioned but in the wrong context, or (c) are too extreme. CELPIP distractors often use words from the audio but pair them with incorrect conclusions.`,
      },
      {
        heading: 'Strategies 5–7: Practice Habits',
        body: `These three habits build listening stamina:`,
        list: [
          'Passive immersion: Watch Canadian TV (CBC News, Schitt\'s Creek, Kim\'s Convenience) 30 min/day without subtitles',
          'Shadowing: Play audio, pause every sentence, repeat aloud matching the speaker\'s speed and rhythm',
          'Timed drills: Do full L1–L6 sets in one sitting once a week to build stamina for the real test',
        ],
      },
    ],
  },

  /* ── 3 ── */
  {
    slug: 'celpip-reading-inference-questions',
    title: 'Mastering Inference Questions in CELPIP Reading',
    category: 'reading',
    tag: 'Reading',
    tagColor: '#2D8A56',
    tagColorLight: '#F0FDF4',
    readTime: '5 min read',
    date: 'March 15, 2026',
    excerpt:
      'R3 and R4 inference questions trip up the most test-takers. Here\'s the exact framework to approach them with confidence.',
    sections: [
      {
        heading: 'What Is an Inference Question?',
        body: `An inference question asks you to draw a conclusion that is not directly stated in the text but is logically supported by the text. The phrasing is usually: "What can be inferred from paragraph X?", "The author implies that...", or "Which statement is most likely true according to the passage?"\n\nThese differ from detail questions (where you find the answer word-for-word) and main idea questions (where you summarize). Inference requires logical reasoning.`,
      },
      {
        heading: 'The CELPIP Reading Structure',
        body: `There are four reading parts:`,
        list: [
          'R1 — Correspondence (emails/letters): tone and purpose',
          'R2 — Apply a Diagram: extract data from visuals',
          'R3 — Information (400–500 word passage): mix of detail and inference',
          'R4 — Viewpoints (two opinion pieces): compare perspectives',
        ],
        body2: `Inference questions are most common in R3 and R4, appearing in ~40% of questions in those parts.`,
      },
      {
        heading: 'The 3-Step Inference Framework',
        body: `When you hit an inference question:`,
        list: [
          'Locate: Find the paragraph referenced in the question. Read 2 sentences before and after the key line.',
          'Eliminate extremes: Remove any answer that uses absolute language ("always", "never", "all", "only") unless the text specifically supports it.',
          'Test the logic: For each remaining answer, ask — "If the passage says X, does this answer HAVE to be true, or just might be true?" Correct inference answers must be strongly supported — not just possible.',
        ],
      },
      {
        heading: 'Common Traps in R4 (Viewpoints)',
        body: `R4 presents two writers with different opinions on one topic. Trap answers: (a) Attribute Writer A's opinion to Writer B, (b) State a view that neither writer holds, (c) Overgeneralize one writer's position.\n\nAlways re-read the question's reference — "According to Writer 1..." vs "Both writers agree..." require completely different reading strategies.`,
      },
      {
        heading: 'Time Management for Reading',
        body: `Total reading time is approximately 55 minutes for 38 questions across 4 parts. Allocate: R1 (10 min), R2 (12 min), R3 (17 min), R4 (16 min). If you hit an inference question you're unsure about, mark it and come back. Don't spend more than 90 seconds on any single question on the first pass.`,
      },
    ],
  },

  /* ── 4 ── */
  {
    slug: 'celpip-speaking-fluency-tips',
    title: 'CELPIP Speaking: How Fluency Is Actually Scored',
    category: 'speaking',
    tag: 'Speaking',
    tagColor: '#C8102E',
    tagColorLight: '#FEF2F2',
    readTime: '6 min read',
    date: 'March 10, 2026',
    excerpt:
      'Fluency doesn\'t mean speaking fast without pauses. It means speaking smoothly without unnecessary hesitation. Here\'s how examiners measure it.',
    sections: [
      {
        heading: 'The Four Scoring Criteria',
        body: `CELPIP Speaking is scored on: Coherence, Vocabulary, Listenability (fluency), and Pronunciation. Listenability is the most misunderstood. It is NOT a measure of accent neutrality. It measures whether a listener can follow your speech without effort — regardless of your accent.`,
      },
      {
        heading: 'What Hurts Listenability',
        body: `The most common Listenability deductions:`,
        list: [
          'Excessive filler words: "um", "uh", "like", "you know" more than once every 15 seconds',
          'False starts: beginning a sentence, stopping, starting again',
          'Long silences: pauses over 3 seconds in the middle of a response',
          'Word repetition: repeating the same 3-word phrase to buy thinking time',
          'Choppy rhythm: delivering speech in short, disconnected bursts',
        ],
      },
      {
        heading: 'The Preparation Window Is Your Friend',
        body: `Each CELPIP Speaking task gives you a preparation time (30 seconds – 60 seconds). Most test-takers stare at the screen and panic. Instead, use this time to:\n\n1. Identify your main point (one sentence)\n2. Write/think of 2 supporting examples\n3. Plan your closing sentence\n\nHaving a mental roadmap eliminates false starts and dramatically reduces filler words.`,
      },
      {
        heading: 'Task S3: Describing a Scene — The SAVE Formula',
        body: `S3 asks you to describe an image. Use this structure: Setting → Action → Vibe → Extension.`,
        list: [
          'Setting: "This appears to be a busy downtown street on a weekday morning..."',
          'Action: "In the foreground, a woman in a red coat is hailing a taxi while checking her phone..."',
          'Vibe: "The overall atmosphere suggests a hurried, fast-paced urban environment..."',
          'Extension: "This scene reminds me of commuting in Toronto, where..."',
        ],
      },
      {
        heading: 'Pronunciation: What Actually Matters',
        body: `Examiners assess whether individual sounds are produced clearly enough to be understood. You do not need a Canadian accent. You need consistent vowel sounds, clear consonant endings (especially -ed, -s endings in past tense and plurals), and appropriate stress on content words.\n\nPractice by recording yourself, then listening back. Most pronunciation errors are invisible until you hear yourself from the outside.`,
      },
    ],
  },

  /* ── 5 ── */
  {
    slug: 'celpip-vs-ielts-which-is-easier',
    title: 'CELPIP vs IELTS: Which Test Should You Take for Canadian PR?',
    category: 'immigration',
    tag: 'Immigration',
    tagColor: '#6B4FAF',
    tagColorLight: '#F3EFFF',
    readTime: '8 min read',
    date: 'March 5, 2026',
    excerpt:
      'Both tests are accepted for Canadian PR and citizenship — but they are very different exams. Here\'s the honest comparison with no marketing spin.',
    sections: [
      {
        heading: 'The Core Difference',
        body: `IELTS (Academic/General) is a British English-based test created in the UK, used globally for immigration, universities, and professional licensing in dozens of countries. CELPIP (General) is a Canadian English-based test designed specifically for Canadian immigration and citizenship — it is exclusively computer-delivered.\n\nFor Canadian PR, both IELTS General Training and CELPIP General are accepted by IRCC. They are NOT interchangeable for other purposes (e.g., IELTS Academic is used for universities; CELPIP is not).`,
      },
      {
        heading: 'Format Comparison',
        body: `Key format differences:`,
        list: [
          'CELPIP: 3 hours, fully computer-based, single sitting (all 4 skills at once)',
          'IELTS: ~2h 45min computer or paper, Speaking is a live face-to-face interview',
          'CELPIP results: 4–8 business days. IELTS results: 3–13 days depending on delivery',
          'CELPIP retakes: Available every few weeks. IELTS: Same flexibility at most centres',
          'Cost: Similar (~$300–$340 CAD for both)',
        ],
      },
      {
        heading: 'Which Is "Easier"?',
        body: `This is the wrong question — it depends entirely on your background. CELPIP tends to be easier for people who: live in Canada and are immersed in Canadian English daily, are comfortable with computers, prefer straightforward multiple-choice formats (Listening, Reading), and speak North American English.\n\nIELTS tends to be easier for people who: trained in British English contexts (India, Nigeria, UK-based schools), prefer a live speaking interview over computer recording, or are familiar with IELTS from previous immigration applications.`,
      },
      {
        heading: 'CLB to CRS Conversion',
        body: `For Express Entry, language is worth up to 310 CRS points (160 first language + 24 second language for FSW). IRCC maps CELPIP scores to CLB levels as follows: CELPIP 9 = CLB 9 = 31 CRS points per skill. CELPIP 10 = CLB 10 = 34 points. CELPIP 12 (max) = CLB 12 = same as CLB 10+ (capped at maximum).\n\nThe jump from CLB 8 to CLB 9 across all four skills is worth +28 CRS points — an enormous gain that can change whether you receive an ITA or not.`,
      },
      {
        heading: 'Our Recommendation',
        body: `If you are already living in Canada and your daily life is in Canadian English — take CELPIP. The exam mirrors the Canadian English you already hear. If you are preparing from abroad and your English education was British-influenced — consider IELTS General Training first. Either way, take at least one full official practice test before booking your real exam.`,
      },
    ],
  },

  /* ── 6 ── */
  {
    slug: 'crs-points-language-breakdown',
    title: 'How Language Skills Affect Your CRS Score: The Complete Breakdown',
    category: 'immigration',
    tag: 'Immigration',
    tagColor: '#6B4FAF',
    tagColorLight: '#F3EFFF',
    readTime: '7 min read',
    date: 'February 27, 2026',
    excerpt:
      'Language is the single largest controllable factor in your CRS score. Most applicants under-invest in it. Here\'s exactly how the points work.',
    sections: [
      {
        heading: 'The Maximum Language Points in CRS',
        body: `Under the Comprehensive Ranking System (CRS) for Express Entry, language proficiency can earn you up to:\n- Federal Skilled Worker (FSW): 136 points (first language)\n- Canadian Experience Class (CEC): 160 points (first language)\n- Spouse/partner combinations add additional second-language points\n\nThis makes language the single largest controllable factor in your CRS score — larger than education (up to 150 pts) or work experience (up to 80 pts).`,
      },
      {
        heading: 'Points Per CLB Level (First Language — Core Points)',
        body: `For a single applicant under FSW, each CELPIP skill contributes these core points:`,
        list: [
          'CLB 10+ (CELPIP 10–12): 34 points per skill → 136 total',
          'CLB 9 (CELPIP 9): 31 points per skill → 124 total',
          'CLB 8 (CELPIP 8): 23 points per skill → 92 total',
          'CLB 7 (CELPIP 7): 17 points per skill → 68 total',
          'CLB 6 (CELPIP 6): 9 points per skill → 36 total',
        ],
        body2: `Notice the enormous jump from CLB 8 to CLB 9: +8 points per skill = +32 total CRS points. That is frequently the difference between an ITA draw cutoff and not receiving an invitation.`,
      },
      {
        heading: 'Skill Area Weights',
        body: `All four skills carry the same weight under IRCC's CRS formula. Listening, Reading, Writing, and Speaking each contribute their respective CLB-based points independently. A CLB 10 in Listening but CLB 7 in Writing pulls your total score down significantly — you must improve your weakest skill first.`,
      },
      {
        heading: 'Second Language Bonus',
        body: `If you take a second official language test (CELPIP + TEF Canada, or IELTS + CELPIP), you can earn up to 24 additional CRS points. To qualify for any second-language bonus, you must score at least CLB 5 in each skill on the second test. Most applicants leave this on the table entirely.`,
      },
      {
        heading: 'Strategy: Where to Focus',
        body: `Use CELPIPace's CRS Calculator to see your current estimated score. Then run three scenarios: (1) Improve all skills by 1 CLB, (2) Improve only your two weakest skills by 1 CLB, (3) Add a second language test. Compare the CRS gain. In most cases, improving your weakest two skills by 1 CLB yields 30–40 more CRS points — and that is achievable in 6–8 weeks of focused practice.`,
      },
    ],
  },

  /* ── 7 ── */
  {
    slug: 'celpip-test-day-checklist',
    title: 'CELPIP Test Day: The Complete Preparation Checklist',
    category: 'strategy',
    tag: 'Strategy',
    tagColor: '#0F7490',
    tagColorLight: '#E0F7FA',
    readTime: '4 min read',
    date: 'February 20, 2026',
    excerpt:
      'The day before and day of the test can make or break your score. Use this checklist to arrive calm, prepared, and ready to perform.',
    sections: [
      {
        heading: '1 Week Before',
        body: `Complete at least one full-length mock exam under timed conditions. Review every answer you got wrong — not just the correct answer, but why each distractor was wrong. Identify your weakest sub-section (e.g., L6 Viewpoints or R3 Inference) and do 2–3 targeted drills in that area.`,
      },
      {
        heading: 'The Night Before',
        body: `Do not study. Seriously. You cannot absorb meaningful new skills in 12 hours, and fatigue will cost you more CLB points than any last-minute review can recover. Instead:`,
        list: [
          'Confirm your test centre address and travel time (add 30 minutes buffer)',
          'Prepare your ID — a valid passport is the safest option',
          'Pack ear plugs in case the test centre is noisy (you often cannot use them, but some centres allow it)',
          'Set two alarms — 30 minutes apart',
          'Sleep 7–8 hours minimum',
        ],
      },
      {
        heading: 'Morning of the Test',
        body: `Eat a real breakfast with protein — your brain needs sustained energy for 3 hours of concentration. Arrive at the test centre 30 minutes early. Use the first 10 minutes to do a few light breathing exercises to regulate anxiety. Do not review notes in the waiting room — it increases stress without benefit.`,
      },
      {
        heading: 'During the Test',
        body: `Key in-test strategies:`,
        list: [
          'Listening: If you miss an answer, let it go immediately. Replaying it in your head means missing the next question.',
          'Reading: If you\'re stuck on an inference question for >90 seconds, mark your best guess and move on.',
          'Writing: Write your first draft, then use the last 3–4 minutes to proofread — not rewrite.',
          'Speaking: Use the preparation window every time. No exceptions.',
        ],
      },
      {
        heading: 'After the Test',
        body: `Your official score arrives in 4–8 business days via email. While you wait, do not second-guess your answers — there is nothing actionable. Use the time to review your practice history on CELPIPace so that if you need to retake, your preparation for the next attempt starts immediately.`,
      },
    ],
  },

  /* ── 8 ── */
  {
    slug: 'reading-r2-apply-diagram-guide',
    title: 'R2 "Apply a Diagram" — The Most Underestimated CELPIP Reading Part',
    category: 'reading',
    tag: 'Reading',
    tagColor: '#2D8A56',
    tagColorLight: '#F0FDF4',
    readTime: '5 min read',
    date: 'February 12, 2026',
    excerpt:
      'Test-takers who practise R3 and R4 obsessively often drop easy marks on R2. Here\'s why R2 deserves dedicated attention.',
    sections: [
      {
        heading: 'What R2 Actually Tests',
        body: `Reading Part 2 presents a visual (a form, schedule, chart, floor plan, table, or diagram) alongside a short text scenario. Questions ask you to extract information from the visual, apply it to the scenario, or identify inconsistencies between the text and the visual. There are typically 8–11 questions and you have approximately 12 minutes.`,
      },
      {
        heading: 'Common Visual Types',
        body: `The diagram can be any of these:`,
        list: [
          'Registration or application forms with various fields',
          'Weekly schedules or shift rosters',
          'Event programs or agendas',
          'Maps or floor plans',
          'Product comparison tables',
          'Price lists or order forms',
        ],
        body2: `Each type requires a slightly different reading strategy. Forms: read field labels carefully. Schedules: track rows (person/item) vs columns (time/day) independently.`,
      },
      {
        heading: 'Why Test-Takers Lose Points Here',
        body: `The most common errors:\n\n1. Misreading units — a schedule lists times in 24-hour format but you read them as 12-hour\n2. Confusing rows and columns in tables\n3. Missing a single word in a form field that changes the entire meaning (e.g., "not available" vs "available")\n4. Answering from memory rather than re-checking the visual`,
      },
      {
        heading: 'The R2 Approach',
        body: `Before reading any questions: scan the entire visual for 20 seconds. Identify the visual type and what each row/column represents. Then read each question and go directly to the visual — do not rely on your memory of it. For each question, physically trace the row and column to the cell you need.`,
      },
      {
        heading: 'Practice Tip',
        body: `R2 is the easiest part to improve with targeted practice because it is purely about careful reading — no inference, no tone analysis. Aim to score 100% on R2 in every practice set. If you are getting any R2 questions wrong, it is almost always a reading-too-fast problem, not a comprehension problem.`,
      },
    ],
  },
]
