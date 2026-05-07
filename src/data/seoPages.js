import { BRAND_NAME, PRODUCT_STATS, PUBLIC_SITE_URL } from './constants.js'

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