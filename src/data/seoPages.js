import { BRAND_NAME, PRODUCT_STATS, PUBLIC_SITE_URL } from './constants.js'

const SIBLING_INFO = {
  practice:   { to: '/celpip-practice-test',    label: 'CELPIP Practice Tests',   blurb: 'Free section drills across Listening, Reading, Writing, and Speaking.' },
  mock:       { to: '/celpip-mock-test',        label: 'CELPIP Mock Tests',       blurb: 'Full-length timed mock exams with instant CLB score reports.' },
  score:      { to: '/celpip-score-calculator', label: 'CELPIP Score Calculator', blurb: 'Convert CELPIP scores to CLB levels and estimate CRS language points.' },
  comparison: { to: '/celpip-vs-ielts',         label: 'CELPIP vs IELTS',         blurb: 'Compare formats, scoring, and prep strategy for Canadian PR.' },
}

const SECTION_LINKS = {
  listening: { to: '/celpip-listening-practice', label: 'CELPIP Listening Practice', blurb: 'Audio drills across all 6 CELPIP Listening parts with instant scoring.' },
  reading:   { to: '/celpip-reading-practice',   label: 'CELPIP Reading Practice',   blurb: 'Correspondence, diagrams, information, and viewpoints — timed and scored.' },
  writing:   { to: '/celpip-writing-practice',   label: 'CELPIP Writing Practice',   blurb: 'Email and survey prompts with real-time AI feedback on grammar and band.' },
  speaking:  { to: '/celpip-speaking-practice',  label: 'CELPIP Speaking Practice',  blurb: 'Timed prompts across all 8 speaking tasks with instant fluency feedback.' },
}

const BLOG_CATEGORY_TO_LANDINGS = {
  listening:   ['listening', 'practice'],
  reading:     ['reading', 'practice'],
  writing:     ['writing', 'practice'],
  speaking:    ['speaking', 'practice'],
  strategy:    ['practice', 'mock'],
  immigration: ['score', 'comparison'],
}

export function landingsForBlogCategory(category) {
  const keys = BLOG_CATEGORY_TO_LANDINGS[category] || ['practice', 'mock']
  return keys.map(k => SIBLING_INFO[k] || SECTION_LINKS[k]).filter(Boolean)
}

function siblingsExcept(currentKey) {
  return Object.entries(SIBLING_INFO)
    .filter(([key]) => key !== currentKey)
    .map(([, info]) => info)
}

// Internal links for a section page: the other three skills + the mock hub.
function sectionSiblings(currentKey) {
  const others = Object.entries(SECTION_LINKS)
    .filter(([key]) => key !== currentKey)
    .map(([, info]) => info)
  return [...others, SIBLING_INFO.mock]
}

export const LANDING_PAGES = {
  practice: {
    canonical: '/celpip-practice-test',
    eyebrow: 'Free CELPIP practice test',
    title: 'CELPIP Practice Tests Built Around Your Target CLB',
    seoTitle: 'CELPIP Practice Test Online - Listening, Reading, Writing & Speaking',
    description: `Practice CELPIP online with ${PRODUCT_STATS.questionItems} question items, section drills, mock exams, real-time scoring, and saved progress for your target CLB.`,
    primaryCta: 'Start Free Practice',
    primaryPath: '/practice',
    secondaryCta: 'Try a Mock Exam',
    secondaryPath: '/exam',
    icon: 'ClipboardCheck',
    proof: [`${PRODUCT_STATS.questionItems} question items`, `${PRODUCT_STATS.practiceSets} practice sets`, 'CLB 4-12 score tracking'],
    sections: [
      ['Listening practice', 'Canadian English audio drills across all 6 CELPIP Listening parts.'],
      ['Reading practice', 'Correspondence, diagrams, information passages, and viewpoints.'],
      ['Writing practice', 'Email and survey prompts with real-time feedback.'],
      ['Speaking practice', 'Timed prompts across all 8 speaking tasks.'],
    ],
    intent: 'Users searching for CELPIP practice are not browsing casually. They are deciding which platform deserves their study time. This page converts that intent into a free diagnostic path.',
    faqs: [
      ['Can I take a CELPIP practice test for free?', 'Yes. CELPIPACE lets you start with free practice and then upgrade when you need full mock exams, real-time scoring, and saved reports.'],
      ['Does CELPIPACE cover all 4 skills?', 'Yes. The platform covers Listening, Reading, Writing, and Speaking with section-specific drills and full mock exams.'],
      ['Is this affiliated with CELPIP?', `${BRAND_NAME} is an independent CELPIP preparation platform and is not affiliated with Paragon Testing Enterprises.`],
    ],
    siblings: siblingsExcept('practice'),
    relatedBlogSlugs: ['how-to-practice-for-celpip', 'celpip-test-format-complete-guide', 'celpip-8-week-study-plan'],
  },
  mock: {
    canonical: '/celpip-mock-test',
    eyebrow: 'Full-length CELPIP mock exams',
    title: 'CELPIP Mock Tests With Timed Sections and CLB Reports',
    seoTitle: 'CELPIP Mock Test Online With CLB Score Report',
    description: `Take ${PRODUCT_STATS.mockExams} full-length CELPIP mock exams online with timed sections, instant scoring, real-time writing and speaking feedback, and saved score reports.`,
    primaryCta: 'Start a Mock Exam',
    primaryPath: '/exam',
    secondaryCta: 'See Pricing',
    secondaryPath: '/pricing',
    icon: 'Sparkles',
    proof: [`${PRODUCT_STATS.mockExams} mock exams`, '86 items per exam', 'Saved score reports'],
    sections: [
      ['Real exam flow', 'Move through Listening, Reading, Writing, and Speaking in one timed simulation.'],
      ['CLB score report', 'Review your objective scores plus real-time writing and speaking bands.'],
      ['Retake strategy', 'Use saved reports to see weak sections before your next attempt.'],
      ['Premium conversion wedge', 'Full mock attempts are the clearest paid value proposition.'],
    ],
    intent: 'Mock-test searchers are closest to buying because they already believe practice is necessary. The offer must show the report, not just say "practice."',
    faqs: [
      ['How long is a CELPIP mock test?', 'A full CELPIP General mock test takes roughly 3 hours when completed under realistic timing.'],
      ['Does the mock test include writing and speaking?', 'Yes. CELPIPACE includes Writing and Speaking tasks with real-time scoring when users submit responses for evaluation.'],
      ['Can I view my previous mock score?', 'Yes. Completed mock attempts are saved so users can reopen their score report from the mock exam page.'],
    ],
    siblings: siblingsExcept('mock'),
    relatedBlogSlugs: ['celpip-test-format-complete-guide', 'celpip-8-week-study-plan', 'celpip-test-day-checklist'],
  },
  score: {
    canonical: '/celpip-score-calculator',
    eyebrow: 'CELPIP score and CRS planning',
    title: 'CELPIP Score to CLB and CRS Calculator',
    seoTitle: 'CELPIP Score to CLB Calculator for Express Entry CRS Points',
    description: 'Convert CELPIP scores to CLB levels, estimate CRS language points, and see which section improvements can raise your Express Entry profile.',
    primaryCta: 'Calculate My CRS Gap',
    primaryPath: '/calculator',
    secondaryCta: 'Practice Weak Skills',
    secondaryPath: '/practice',
    icon: 'Gauge',
    proof: ['CLB conversion', 'CRS language points', 'Immigration-focused planning'],
    sections: [
      ['CLB conversion', 'Translate CELPIP bands into the CLB levels immigration programs use.'],
      ['CRS impact', 'See how a higher language score can change Express Entry competitiveness.'],
      ['Weak-skill targeting', 'Move users from calculator intent into the right practice section.'],
      ['Top-of-funnel value', 'Calculator traffic is broad, useful, and easy to retarget.'],
    ],
    intent: 'Score calculator users may not be ready to buy, but they reveal their immigration goal. That makes them ideal for personalized study-plan conversion.',
    faqs: [
      ['What CELPIP score equals CLB 9?', 'CELPIP 9 in each skill maps to CLB 9 for Canadian immigration language scoring.'],
      ['Does CRS use CELPIP directly?', 'Express Entry uses CLB levels, which can be calculated from CELPIP scores.'],
      ['Which language score matters most?', 'All four skills matter. Improving the lowest skill can unlock eligibility or CRS gains.'],
    ],
    siblings: siblingsExcept('score'),
    relatedBlogSlugs: ['is-celpip-7-a-good-score', 'celpip-score-required-express-entry-pr', 'crs-points-language-breakdown'],
  },
  comparison: {
    canonical: '/celpip-vs-ielts',
    eyebrow: 'Choose the right immigration test',
    title: 'CELPIP vs IELTS: Which Test Is Better for Canadian PR?',
    seoTitle: 'CELPIP vs IELTS - Which Is Easier for Canadian PR?',
    description: 'Compare CELPIP and IELTS for Canadian immigration, including format, scoring, speaking style, listening accents, and preparation strategy.',
    primaryCta: 'Try CELPIP Practice',
    primaryPath: '/practice',
    secondaryCta: 'Calculate CRS Points',
    secondaryPath: '/calculator',
    icon: 'Search',
    proof: ['Canadian English focus', 'Computer-based speaking', 'Immigration score planning'],
    sections: [
      ['Test format', 'CELPIP is fully computer-delivered, including Speaking. IELTS may include a live speaking interview.'],
      ['Listening style', 'CELPIP uses Canadian English and everyday contexts. IELTS includes a broader range of accents.'],
      ['Preparation fit', 'CELPIPACE can own the Canada-specific test-prep angle better than broad IELTS platforms.'],
      ['Decision-stage capture', 'Comparison traffic arrives before users commit to a test, which makes it strategically valuable.'],
    ],
    intent: 'Comparison pages capture applicants before they choose a test or prep provider. That is earlier than competitors who only target practice-test searches.',
    faqs: [
      ['Is CELPIP easier than IELTS?', 'It depends on the test-taker. CELPIP may feel more natural for people comfortable with Canadian English and computer-based speaking.'],
      ['Is CELPIP accepted for Canadian PR?', 'Yes. CELPIP General is accepted for many Canadian immigration pathways, including Express Entry language testing.'],
      ['Should I prepare differently for CELPIP?', 'Yes. CELPIP requires comfort with Canadian English, computer typing, recorded speaking, and the CELPIP-specific task formats.'],
    ],
    siblings: siblingsExcept('comparison'),
    relatedBlogSlugs: ['is-celpip-harder-than-ielts', 'celpip-vs-ielts-which-is-easier', 'celpip-score-required-express-entry-pr'],
  },
  listening: {
    canonical: '/celpip-listening-practice',
    eyebrow: 'CELPIP Listening practice',
    title: 'CELPIP Listening Practice — All 6 Parts With Canadian English Audio',
    seoTitle: 'CELPIP Listening Practice Online — All 6 Parts With Answers',
    description: `Practice every CELPIP Listening part — Problem Solving, Daily Life, Information, News Item, Discussion, and Viewpoints — with ${PRODUCT_STATS.listeningSets} Canadian English audio sets, instant scoring, answer explanations, and CLB tracking.`,
    primaryCta: 'Start Listening Practice',
    primaryPath: '/celpip-listening-practice',
    secondaryCta: 'Try a Full Mock Exam',
    secondaryPath: '/exam',
    icon: 'Headphones',
    proof: [`${PRODUCT_STATS.listeningSets} listening sets`, 'Canadian English audio', 'All 6 Listening parts', 'Instant CLB scoring'],
    sections: [
      ['All 6 Listening parts', 'Drill Part 1 Problem Solving through Part 6 Viewpoints with the same question types and pacing as the official CELPIP General test.'],
      ['Authentic Canadian English audio', 'Train your ear on the Canadian accents, speeds, and everyday situations CELPIP uses, so test-day audio feels familiar.'],
      ['Answer explanations', 'See why each answer is correct and learn to spot the distractor traps that pull most test-takers toward the wrong option.'],
      ['Instant CLB scoring', 'Every set is scored against the CLB scale so you always know your current listening band and how close you are to your target.'],
      ['Practice that targets your weak parts', 'Track results by part to find whether News Item, Discussion, or Viewpoints is costing you points — then focus there first.'],
    ],
    intent: 'People searching "CELPIP listening practice" want realistic audio and instant feedback, not theory. This page sends them straight into scored, part-by-part drills.',
    faqs: [
      ['How many parts are in CELPIP Listening?', 'CELPIP Listening has 6 parts: Problem Solving, Daily Life Conversation, Information, News Item, Discussion, and Viewpoints. CELPIPACE covers all six with timed, scored practice.'],
      ['Is the listening audio in Canadian English?', 'Yes. The practice audio uses Canadian English accents and everyday Canadian contexts to match the real CELPIP General test.'],
      ['Can I practice CELPIP Listening for free?', 'Yes. You can start with free listening sets and upgrade for the full library, all 6 parts, and saved CLB score tracking.'],
      ['What CELPIP Listening score is CLB 9?', 'A CELPIP Listening score of 9 maps to CLB 9. Each scored set shows your current band so you can see your gap to CLB 9 or higher.'],
    ],
    siblings: sectionSiblings('listening'),
    relatedBlogSlugs: ['celpip-listening-strategies-clb-9', 'celpip-8-week-study-plan', 'celpip-test-day-checklist'],
  },
  reading: {
    canonical: '/celpip-reading-practice',
    eyebrow: 'CELPIP Reading practice',
    title: 'CELPIP Reading Practice — Correspondence, Diagrams, Information & Viewpoints',
    seoTitle: 'CELPIP Reading Practice Online — All 4 Parts With Explanations',
    description: `Practice all 4 CELPIP Reading parts — Correspondence, Apply a Diagram, Information, and Viewpoints — with ${PRODUCT_STATS.readingSets} timed sets, answer explanations, and inference strategies to lift your CLB.`,
    primaryCta: 'Start Reading Practice',
    primaryPath: '/celpip-reading-practice',
    secondaryCta: 'Try a Full Mock Exam',
    secondaryPath: '/exam',
    icon: 'Search',
    proof: [`${PRODUCT_STATS.readingSets} reading sets`, 'R1 to R4 coverage', 'Answer explanations', 'Instant CLB scoring'],
    sections: [
      ['All 4 Reading parts', 'Work through Reading Correspondence, Apply a Diagram, Reading for Information, and Reading for Viewpoints in the official CELPIP format.'],
      ['Beat the timing trap', 'CELPIP Reading is as much about speed as accuracy. Timed sets build the pace you need to finish every passage on test day.'],
      ['Inference and viewpoint strategy', 'Learn to handle the inference and opinion questions in Parts 3 and 4 that separate CLB 7 from CLB 9+ readers.'],
      ['Answer explanations', 'Each question includes a clear explanation so you understand the reasoning, not just the right letter.'],
      ['Scored to the CLB scale', 'Get an instant reading band after every set and watch your score climb as you practice.'],
    ],
    intent: 'Reading searchers want timed passages with explanations they can learn from. This page routes that intent into scored R1–R4 drills.',
    faqs: [
      ['How many parts are in CELPIP Reading?', 'CELPIP Reading has 4 parts: Reading Correspondence, Reading to Apply a Diagram, Reading for Information, and Reading for Viewpoints. All four are covered here.'],
      ['Why do I run out of time on CELPIP Reading?', 'Most test-takers lose points to pacing, not comprehension. Timed practice sets train you to move through correspondence and viewpoint passages faster.'],
      ['Can I practice CELPIP Reading for free?', 'Yes. Start with free reading sets and upgrade for the full set library, all 4 parts, and saved CLB tracking.'],
      ['Do the reading sets include explanations?', 'Yes. Every question comes with an explanation of the correct answer and the common traps to avoid.'],
    ],
    siblings: sectionSiblings('reading'),
    relatedBlogSlugs: ['celpip-reading-inference-questions', 'celpip-8-week-study-plan', 'celpip-test-day-checklist'],
  },
  writing: {
    canonical: '/celpip-writing-practice',
    eyebrow: 'CELPIP Writing practice',
    title: 'CELPIP Writing Practice With AI Scoring — Task 1 Email & Task 2 Survey',
    seoTitle: 'CELPIP Writing Practice With AI CLB Scoring — Task 1 & Task 2',
    description: `Practice CELPIP Writing Task 1 (email) and Task 2 (survey response) with ${PRODUCT_STATS.writingSets} prompts, real-time AI CLB scoring, word-count tools, and structure templates that map to a higher band.`,
    primaryCta: 'Start Writing Practice',
    primaryPath: '/celpip-writing-practice',
    secondaryCta: 'See How AI Scoring Works',
    secondaryPath: '/exam',
    icon: 'PenLine',
    proof: [`${PRODUCT_STATS.writingSets} writing prompts`, 'Task 1 email practice', 'Task 2 survey practice', 'Real-time AI CLB feedback'],
    sections: [
      ['Both writing tasks', 'Practice Task 1 (writing an email) and Task 2 (responding to survey questions) under realistic CELPIP timing and word counts.'],
      ['Real-time AI CLB scoring', 'Submit a response and get an instant band estimate with feedback on task fulfillment, coherence, vocabulary, and readability.'],
      ['Fix what costs you points', 'Targeted feedback shows the grammar, tone, and structure issues holding your score down, so each attempt is better than the last.'],
      ['High-band templates', 'Study structures modelled on CLB 9–11 responses and reuse the framing that examiners reward.'],
      ['Word-count and timing tools', 'Built-in counters and timers train you to hit the right length within the time limit every time.'],
    ],
    intent: 'Writing searchers want their response graded, not just a blank box. This page leads with the AI CLB score that proves the value immediately.',
    faqs: [
      ['How is CELPIP Writing scored?', 'CELPIP Writing is rated on content, vocabulary, readability, and task fulfillment. CELPIPACE gives a real-time AI band estimate across these dimensions for every response.'],
      ['What are the two CELPIP Writing tasks?', 'Task 1 is writing an email and Task 2 is responding to survey questions. Both are covered with timed prompts and instant scoring.'],
      ['Can AI feedback really help my writing score?', 'Yes. Instant feedback after every attempt lets you fix recurring grammar, structure, and vocabulary issues far faster than waiting days for human marking.'],
      ['How do I reach CLB 9 in CELPIP Writing?', 'Hit the task requirements, organise clearly, use varied accurate vocabulary, and control grammar. Scored practice with feedback shows exactly which of these to improve.'],
    ],
    siblings: sectionSiblings('writing'),
    relatedBlogSlugs: ['celpip-writing-task-1-email-tips', 'celpip-writing-task-2-tips-templates', 'how-to-score-clb-10-writing'],
  },
  speaking: {
    canonical: '/celpip-speaking-practice',
    eyebrow: 'CELPIP Speaking practice',
    title: 'CELPIP Speaking Practice for All 8 Tasks With AI Feedback',
    seoTitle: 'CELPIP Speaking Practice Online — All 8 Tasks With AI Feedback',
    description: `Practice all 8 CELPIP Speaking tasks with ${PRODUCT_STATS.speakingPrompts} timed prompts, on-screen prep, recording, and AI feedback on fluency, vocabulary, and task fulfillment.`,
    primaryCta: 'Start Speaking Practice',
    primaryPath: '/celpip-speaking-practice',
    secondaryCta: 'Try a Full Mock Exam',
    secondaryPath: '/exam',
    icon: 'Mic',
    proof: [`${PRODUCT_STATS.speakingPrompts} speaking prompts`, 'All 8 Speaking tasks', 'Timed prep & recording', 'AI fluency feedback'],
    sections: [
      ['All 8 Speaking tasks', 'Practice from Giving Advice to the Unusual Situation task with the exact prep and response timers CELPIP uses.'],
      ['Real prep-then-record flow', 'Each task mirrors the test: a short prep window, then a timed recording — so the format never surprises you on test day.'],
      ['AI feedback on every recording', 'Get instant feedback on fluency, vocabulary, and how well you covered the task, with a band estimate to track progress.'],
      ['Beat speaking nerves', 'Repeated timed recordings build the confidence and pacing that keep you from freezing when the microphone is live.'],
      ['Target your weakest tasks', 'See which of the 8 tasks drag your score and drill those until your band rises.'],
    ],
    intent: 'Speaking searchers want to actually record and be assessed. This page leads with the timed record-and-score loop that competitors rarely offer.',
    faqs: [
      ['How many tasks are in CELPIP Speaking?', 'CELPIP Speaking has 8 tasks, from giving advice to describing an unusual situation. CELPIPACE covers all 8 with timed prep, recording, and AI feedback.'],
      ['Does it give feedback on my recordings?', 'Yes. After each recording you get AI feedback on fluency, vocabulary, and task fulfillment, plus a CLB band estimate.'],
      ['Can I practice CELPIP Speaking for free?', 'Yes. Start with free speaking tasks and upgrade for all 8 tasks, the full prompt library, and saved progress.'],
      ['How do I improve CELPIP Speaking fluency?', 'Practice the prep-then-record flow repeatedly so you organise ideas fast and speak for the full time. Feedback after each take shows what to fix.'],
    ],
    siblings: sectionSiblings('speaking'),
    relatedBlogSlugs: ['celpip-speaking-sample-answers', 'celpip-speaking-tasks-1-to-8-guide', 'celpip-speaking-fluency-tips'],
  },
}

export function faqJsonLd(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text },
    })),
  }
}

export function softwareJsonLd(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: BRAND_NAME,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: `${PUBLIC_SITE_URL}${page.canonical}`,
    description: page.description,
    offers: { '@type': 'Offer', priceCurrency: 'CAD', price: '0' },
  }
}