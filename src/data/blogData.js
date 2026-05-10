/* ─── CELPIPACE Blog Articles ──────────────────────────────────
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
    slug: 'express-entry-2026-language-scores',
    title: 'Express Entry 2026: Why Language Scores Matter More Than Ever',
    category: 'immigration',
    tag: 'Immigration',
    tagColor: '#6B4FAF',
    tagColorLight: '#F3EFFF',
    readTime: '6 min read',
    date: 'May 10, 2026',
    excerpt:
      "Canada's Express Entry pool added only 897 profiles in a recent two-week window — a 60% slowdown. But competition among high-scoring candidates keeps intensifying. Here's why language scores have become the most important differentiator in 2026.",
    sections: [
      {
        heading: 'Pool Growth Slows, But Competition Keeps Rising',
        body: `Between April 12 and April 26, the Express Entry pool added only 897 profiles — a sharp 60% decline from the previous two-week increase of 2,193 profiles. On the surface, this sounds like good news for candidates.\n\nBut the data tells a different story. Despite slower pool growth, competition among high-scoring candidates continues to intensify. Recent draws have issued fewer Invitations to Apply with higher cut-offs, meaning the bar is rising even as fewer new candidates enter.`,
      },
      {
        heading: 'Why the CRS Race Is Getting Harder',
        body: `The latest Canadian Experience Class (CEC) draw issued only 2,000 ITAs with a cut-off of 514 — the third consecutive draw with reduced volumes. Several forces are compressing competition at the top:`,
        list: [
          'The 501–600 CRS range continues to grow as high-scoring candidates cluster near the cutoff',
          'Provincial nominees receiving 600-point boosts are increasing, raising the apparent bar for everyone else',
          'IRCC is continuing category-based selection draws throughout 2026, pulling strong candidates from targeted pools',
          'More applicants are competing in the highest score bands than at any prior point',
        ],
        body2: `This means applicants can no longer rely on "average" scores to receive an invitation. Even marginal CRS improvements now matter significantly.`,
      },
      {
        heading: 'The Fastest Way to Gain CRS Points: Language',
        body: `Language proficiency is one of the few CRS factors fully within a candidate's control — and one of the highest-value areas available. Strong CELPIP scores improve:`,
        list: [
          'Core CRS language points (up to 136 for FSW, 160 for CEC)',
          'Skill transferability points (additional bonus for CLB 7+ across all four skills)',
          'Eligibility for French-language and other category-based draws',
          'Provincial Nominee Program opportunities tied to language thresholds',
        ],
        body2: `In most cases, improving from CLB 8 to CLB 9 across all four skills adds +32 CRS points. For a candidate sitting at 490, that single improvement can push them above a recent draw cut-off.`,
      },
      {
        heading: 'What to Expect in the Second Half of 2026',
        body: `Current immigration trends point to four pressures that applicants should prepare for.\n\nHigher CRS cut-offs are likely to persist, especially for CEC candidates. Recent draws have remained above the 510 mark for competitive profiles.\n\nCategory-based selection will continue to expand. IRCC has signalled prioritization of French-language proficiency, healthcare workers, trades, and other targeted occupations — meaning candidates in these categories need language scores that meet eligibility thresholds, not just average requirements.\n\nExpress Entry reform consultations are underway, with Canada exploring changes that may prioritize higher-earning workers and update labour market needs. The direction of reforms suggests language performance will remain central.\n\nStronger language expectations across the board are emerging as the pool self-selects toward higher-scoring candidates. As lower-scoring profiles age out or withdraw, the effective competition floor rises.`,
      },
      {
        heading: 'What to Focus on Now',
        body: `If you are planning to immigrate through Express Entry in 2026, improving your language profile is the highest-return preparation you can do.`,
        list: [
          'Identify your weakest CELPIP skill and target it first — one weak skill can cost you 8–17 CRS points',
          'Aim for CLB 9 across all four skills — the jump from CLB 8 to CLB 9 is worth 32 CRS points total',
          'Use full-length mock exams to simulate real test conditions before booking your actual exam',
          'Maximize speaking and writing scores — these two skills are where most candidates leave points on the table',
          'Consider a second language test (TEF Canada) if French is part of your background — it can add up to 24 more CRS points',
        ],
      },
      {
        heading: 'Prepare Smarter with CELPIPACE',
        body: `As Express Entry competition intensifies, better preparation matters more than ever. CELPIPACE offers full-length CELPIP mock exams, real-time scoring simulations, AI-evaluated speaking practice, writing feedback, and targeted CLB improvement drills — everything you need to maximize your score before test day.\n\nStart practicing today and see exactly where your CLB stands.`,
      },
    ],
  },

  /* ── 3 ── */
  {
    slug: 'celpip-8-week-study-plan',
    title: 'CELPIP Study Plan: 8 Weeks to Your Target CLB Score',
    category: 'strategy',
    tag: 'Strategy',
    tagColor: '#0F7490',
    tagColorLight: '#E0F7FA',
    readTime: '8 min read',
    date: 'May 8, 2026',
    excerpt:
      'Most CELPIP candidates prepare without a structured plan — and plateau weeks before their test date. This 8-week schedule takes you from baseline to test-ready, skill by skill.',
    sections: [
      {
        heading: 'Before You Start: Take a Baseline Test',
        body: `Before following any study plan, you need to know where you currently stand. Take one full-length CELPIP practice test under timed conditions — not a single section, the entire exam. Score every skill and identify your two weakest areas.\n\nThis baseline determines your starting point. A candidate starting at CLB 6–7 needs a different plan than one starting at CLB 8. The schedule below assumes you are starting around CLB 7–8 and targeting CLB 9+ across all skills.`,
      },
      {
        heading: 'Weeks 1–2: Listening and Reading Foundation',
        body: `Listening and Reading respond fastest to structured practice because both are input-based skills — comprehension improves quickly with volume and correct technique. Complete one Listening set and one Reading set every two days.`,
        list: [
          'Week 1: Learn the format of each part (L1–L6, R1–R4) — understand what each one tests before drilling',
          'Week 2: Identify which parts you consistently miss and drill those specifically',
          'Daily habit: 30 minutes of active Canadian English listening (CBC Radio, podcasts) without subtitles',
          'Weekly benchmark: 80%+ accuracy on L1–L6 and R1–R4 within the time limit',
        ],
        body2: `Do not skip the timed format even in early weeks. Timing pressure is a real factor on test day, and your brain needs to adapt early rather than cramming it into Week 7.`,
      },
      {
        heading: 'Weeks 3–4: Writing Skill Building',
        body: `Writing requires output practice, not input. Write every two days, alternating between Task 1 (email) and Task 2 (survey response). Use CELPIPACE's instant scoring to get feedback on all four criteria — Content, Organization, Vocabulary, and Conventions — after each attempt.\n\nWeek 3 focus: Organization and Content. Every response must address the exact task requirements in a clear structure from the first sentence.`,
        list: [
          'Email format: state purpose → address three bullet points in order → appropriate closing',
          'Survey format: clear position in sentence 1 → two supported reasons with examples → conclusion',
          'Target word count: 150–200 words for both tasks — going under or over loses marks',
        ],
        body2: `Week 4 shift: Move focus to Vocabulary. Replace your most overused words with precise alternatives. Write each response twice — once naturally, once with upgraded vocabulary — and compare the two.`,
      },
      {
        heading: 'Weeks 5–6: Speaking Development',
        body: `Speaking is the most anxiety-producing skill for most candidates because it is recorded with no retry. The solution is volume: record yourself at least once a day so the recording environment stops feeling foreign.`,
        list: [
          'Days 1–3: Complete CELPIPACE speaking tasks, listen back, note hesitations and filler words',
          'Days 4–5: Redo the same tasks without listening to your previous attempt — measure improvement',
          'Days 6–7: Complete a new task set focusing exclusively on using the full Preparation Window every time',
        ],
        body2: `If you hear more than two filler words per 30 seconds of speech, that is your primary weakness. Slow down — most candidates speed up when nervous, which produces more errors, not fewer.`,
      },
      {
        heading: 'Weeks 7–8: Full Mock Exams and Refinement',
        body: `Two weeks before your test date, shift entirely to full-length mock exams. Complete one full exam per week under real test conditions: no pausing, no checking answers mid-section, all sections timed.\n\nAfter each mock exam:`,
        list: [
          'Review every wrong answer — understand not just the correct answer but why each wrong option was designed to mislead',
          'Track your CLB per skill across both exams to see whether you are improving or plateauing',
          'Flag any new weaknesses that appeared under full-exam pressure that did not appear in section drills',
        ],
        body2: `By the end of Week 8, you should have a clear picture of your realistic test-day range. If any skill is still below your target CLB, consider booking your test 2–4 weeks later rather than going in underprepared.`,
      },
      {
        heading: 'The Week Before: Peak and Taper',
        body: `The final week is for maintenance, not learning. Do not attempt new material or change your approach.`,
        list: [
          'Days 1–2: Review only your weakest sections from the Week 7 and 8 mock exams',
          'Days 3–4: One short drilling session per skill — 20 minutes maximum',
          'Day 5: Complete rest. No practice.',
          'Day 6: Confirm test centre logistics, prepare your ID, sleep early',
          'Day 7: Test day — arrive 30 minutes early',
        ],
        body2: `Fatigue on test day costs more CLB points than any last-minute review session can recover. Trust the eight weeks of structured work you have completed.`,
      },
    ],
  },

  /* ── 4 ── */
  {
    slug: 'celpip-score-requirements-citizenship-2026',
    title: 'CELPIP Score Requirements: Permanent Residence vs. Canadian Citizenship',
    category: 'immigration',
    tag: 'Immigration',
    tagColor: '#6B4FAF',
    tagColorLight: '#F3EFFF',
    readTime: '6 min read',
    date: 'May 5, 2026',
    excerpt:
      'CELPIP requirements for PR and citizenship are not the same — and confusing the two is one of the most common (and costly) immigration mistakes. Here is exactly what you need for each pathway in 2026.',
    sections: [
      {
        heading: 'Two Pathways, Two Different Standards',
        body: `Most CELPIP guides focus entirely on Express Entry and permanent residence. But if your goal is Canadian citizenship, the requirements are different — different minimum CLB levels, different skills tested, and critically, a two-year validity window that can expire between your PR and citizenship applications.\n\nThis article breaks down the exact CELPIP requirements for each pathway, the mistakes that delay applications, and how to plan your test strategy around your specific goal.`,
      },
      {
        heading: 'CELPIP Requirements for Permanent Residence',
        body: `For Express Entry, CELPIP General is accepted by IRCC as official proof of English proficiency. Minimum scores vary by program:`,
        list: [
          'Federal Skilled Worker (FSW): CLB 7 minimum in all four skills (CELPIP 7 in each)',
          'Canadian Experience Class (CEC): CLB 7 minimum in all four skills',
          'Federal Skilled Trades (FST): CLB 5 in Reading and Writing, CLB 6 in Listening and Speaking',
          'Competitive CRS score in current draws: CLB 9+ required (CELPIP 9 per skill)',
        ],
        body2: `Meeting the minimum gets your profile into the pool. Competitive scores that actually generate ITAs in the current Express Entry environment require CLB 9 or higher across all four skills.`,
      },
      {
        heading: 'CELPIP Requirements for Canadian Citizenship',
        body: `For citizenship, IRCC requires proof of English (or French) proficiency at CLB 4 or higher. CELPIP General is one of the accepted tests. For citizenship purposes, IRCC evaluates Reading and Listening only — Writing and Speaking are not required.\n\nRequired minimum: CLB 4 in both Reading and Listening (CELPIP 4 in each).\n\nThis is significantly lower than the CLB 7+ required for PR — but the result must come from an official test taken within the two-year validity window, and the correct test must be used.`,
      },
      {
        heading: 'Score Validity: The Detail That Trips Up Applicants',
        body: `CELPIP scores are valid for two years from the test date. This creates a timeline problem many applicants discover too late:`,
        list: [
          'If you took CELPIP for your PR application two or more years ago, that result cannot be used for citizenship',
          'You will need to retest — even if your English has not changed at all',
          'PR applications, residency requirements, and processing delays can easily push the citizenship timeline past the 24-month mark',
        ],
        body2: `If you are currently preparing for PR and also plan to apply for citizenship later, take your CELPIP as late as possible in the PR process to preserve maximum validity for the citizenship stage.`,
      },
      {
        heading: 'Common Mistakes That Delay Applications',
        body: `Three errors that appear regularly in IRCC submissions:`,
        list: [
          'Submitting an expired CELPIP result — IRCC will reject the application or request a new result, adding months to the timeline',
          'Taking CELPIP General LS (Listening and Speaking only) for citizenship — citizenship requires Reading and Listening, which CELPIP General LS does not include',
          'Confusing the citizenship CLB 4 minimum with the PR CLB 7 minimum and under-preparing, then failing to reach even the lower bar',
        ],
        body2: `The correct test for both PR and citizenship is CELPIP General (all four skills). CELPIP General LS is accepted for some employer and provincial purposes but is not suitable for citizenship proof.`,
      },
      {
        heading: 'Planning Your Test Strategy for Both Goals',
        body: `If you are preparing CELPIP for both pathways, the efficient approach is straightforward.\n\nTake CELPIP General and target CLB 9 across all four skills. This result satisfies both Express Entry requirements and the citizenship minimum in one test. Even if citizenship is years away, a strong score on file creates flexibility and may not need to be retaken.\n\nIf citizenship is your only current goal, you still need CLB 4 in Reading and Listening from CELPIP General — and the two-year validity window means you should time your test within 18 months of your planned citizenship application date.`,
      },
    ],
  },

  /* ── 5 ── */
  {
    slug: 'celpip-speaking-tasks-1-to-8-guide',
    title: 'CELPIP Speaking Tasks 1 to 8: What Each Task Tests and How to Score Higher',
    category: 'speaking',
    tag: 'Speaking',
    tagColor: '#C8102E',
    tagColorLight: '#FEF2F2',
    readTime: '9 min read',
    date: 'May 3, 2026',
    excerpt:
      'The CELPIP Speaking section has 8 different tasks — and each one tests a different skill. Most candidates prepare with a one-size-fits-all approach. Here is what examiners actually look for in each task.',
    sections: [
      {
        heading: 'The Format: 8 Tasks, One Recording Session',
        body: `The CELPIP Speaking section contains 8 tasks delivered entirely by computer. You record your response into a microphone — there is no live examiner. Each task gives you a preparation window (30–60 seconds) followed by a response window (60–90 seconds). Your response is recorded once with no retakes.\n\nScoring uses four criteria across all tasks: Coherence, Vocabulary, Listenability, and Pronunciation. The weighting is equal — neglecting any one criterion costs you points across all 8 tasks.`,
      },
      {
        heading: 'Tasks 1–2: Giving Advice',
        body: `Task 1 asks you to give advice in an informal context — to a friend, family member, or colleague. Task 2 presents the same structure but in a formal relationship: an employee, a business contact, or a client.\n\nMost candidates give vague advice ("I think you should consider..."). High-scoring responses give specific, actionable recommendations with at least two supporting reasons.`,
        list: [
          'Structure: recommendation → reason 1 → reason 2 → brief closing statement',
          'Task 1 register: natural, warm, direct ("Here is what I would do...")',
          'Task 2 register: professional, measured, clear ("I would recommend that you...")',
          'Avoid: hedging ("It depends..."), over-qualifying, or failing to take a clear position',
        ],
      },
      {
        heading: 'Tasks 3–4: Describing a Personal Experience',
        body: `Tasks 3 and 4 ask you to describe a personal experience or a familiar situation. These tend to produce strong Vocabulary scores but weak Coherence scores — because candidates narrate a timeline of events without a clear point.\n\nExaminers score Coherence on whether your response has a clear development and resolution, not just a sequence of events.`,
        list: [
          'Opening: set the scene in one sentence ("A few years ago, I had to...")',
          'Development: describe the key moment or challenge specifically — avoid vague references',
          'Vocabulary: use cause-and-effect connectors ("As a result...", "This led to...", "Consequently...")',
          'Closing: end with a reflection or insight ("Looking back, I realize that...")',
        ],
        body2: `Replace filler transitions like "and then... and then..." with connectors that show logical progression. This single change can raise your Coherence score by a full CLB level.`,
      },
      {
        heading: 'Task 5: Comparing and Persuading',
        body: `Task 5 presents two options and asks you to argue in favour of one. This is the highest-difficulty task for most candidates because it requires building a persuasive argument under time pressure rather than describing a situation.\n\nThe most common mistake: trying to be balanced. Hesitation and hedging ("both options have their advantages...") immediately lowers your Coherence score.`,
        list: [
          'State your preference clearly in the first sentence — do not build up to it',
          'Give one strong reason with a concrete example rather than two weak reasons without support',
          'Briefly acknowledge the alternative and then explain why your choice is stronger',
          'Close with a forward-looking statement ("For these reasons, Option A is clearly the better choice for...")',
        ],
      },
      {
        heading: 'Tasks 6–7: Handling a Difficult Situation',
        body: `Tasks 6 and 7 simulate real communication challenges: responding to a complaint, making a difficult request, or navigating an uncomfortable conversation. You see a scenario and must respond to an imagined listener.\n\nThese tasks test whether your language sounds natural under social pressure. What examiners listen for:`,
        list: [
          'Appropriate tone — empathetic for complaints, assertive for setting boundaries',
          'Direct language — reach the point without over-apologizing or under-explaining',
          'Practical resolution — state clearly what will happen next, not just acknowledgment of the problem',
          'Vocabulary range — avoid repeating the same phrases ("I understand... I understand...")',
        ],
      },
      {
        heading: 'Task 8: Describing an Unusual Situation',
        body: `Task 8 presents an unusual image or hypothetical scenario and asks you to describe or speculate about what is happening. This is the only task that explicitly rewards imaginative vocabulary and the natural use of modal verbs.\n\nHigh-scoring structure: Scene description → Possible explanation → Speculation → Personal reaction.\n\nExample: "This image appears to show a city street completely covered in sand. This could suggest a recent sandstorm or some kind of unusual environmental event. The expressions on people's faces seem surprised but calm, which makes me think this occurred recently. Personally, I would find this both alarming and fascinating..."\n\nThe key is sustained speculation — keep developing possibilities rather than stopping after one or two sentences.`,
      },
      {
        heading: 'Preparation Habits That Work Across All 8 Tasks',
        body: `These habits separate CLB 9 responses from CLB 7 responses regardless of the task type:`,
        list: [
          'Always use the full preparation window — even 30 seconds is enough to plan your opening and closing sentences',
          'Never open with "Um" or "So" — start with a content word or direct statement',
          'Vary your sentence openings — three consecutive sentences starting with "I" signals a limited range to the examiner',
          'Speak at 90% of your natural speed — clarity matters more than pace, and nerves cause most people to rush',
          'Record yourself doing all 8 tasks once per week and listen back — patterns you cannot hear in real time become obvious on playback',
        ],
      },
    ],
  },

  /* ── 6 ── */
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
        body: `Write one email and one survey response every 2–3 days. After writing, read the task again and check: Did I address all three bullet points? Is my position clear in the first sentence? Did I use at least 3 different sentence structures? Then use CELPIPACE's instant scoring to get feedback on all four criteria.`,
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
        body: `Use CELPIPACE's CRS Calculator to see your current estimated score. Then run three scenarios: (1) Improve all skills by 1 CLB, (2) Improve only your two weakest skills by 1 CLB, (3) Add a second language test. Compare the CRS gain. In most cases, improving your weakest two skills by 1 CLB yields 30–40 more CRS points — and that is achievable in 6–8 weeks of focused practice.`,
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
        body: `Your official score arrives in 4–8 business days via email. While you wait, do not second-guess your answers — there is nothing actionable. Use the time to review your practice history on CELPIPiQ so that if you need to retake, your preparation for the next attempt starts immediately.`,
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
