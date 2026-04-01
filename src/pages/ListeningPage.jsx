import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

/* ── Listening Parts Data ─────────────────────────────────────── */
const PARTS = [
  {
    id: 'L1',
    num: 'L1',
    label: 'Problem Solving',
    icon: '🔧',
    questions: 8,
    duration: '8–10 min',
    difficulty: 'Intermediate',
    description:
      'You will hear a conversation between two people working through an everyday problem — a customer and a service worker, two colleagues, or similar pairings. Your job is to identify the problem, track the proposed solutions, and understand the final outcome.',
    tip: 'The question often asks what was decided or what action will be taken. Listen for words like "actually", "I think we should", or "how about" — these signal a shift in the conversation.',
    skills: ['Main idea', 'Implied meaning', 'Decision tracking', 'Speaker intent'],
  },
  {
    id: 'L2',
    num: 'L2',
    label: 'Daily Life Conversation',
    icon: '💬',
    questions: 5,
    duration: '5–7 min',
    difficulty: 'Intermediate',
    description:
      'A casual, real-life exchange between two people — a phone call, a chat with a neighbour, a discussion at work. The tone is informal and the language reflects everyday Canadian English. Questions test your grasp of the main topic and specific details mentioned in the conversation.',
    tip: 'Pay attention to how the speakers feel about the topic — opinion and attitude questions are common in this part. Key words like "love it", "a bit worried", or "honestly" signal emotional tone.',
    skills: ['Detail comprehension', 'Speaker attitude', 'Tone recognition', 'Inference'],
  },
  {
    id: 'L3',
    num: 'L3',
    label: 'Information',
    icon: '📢',
    questions: 8,
    duration: '8–10 min',
    difficulty: 'Upper Intermediate',
    description:
      'A longer single-speaker passage delivering information — think a tour guide, a company announcement, or a community update. The content is fact-dense and tests your ability to absorb and recall specific details from an extended monologue.',
    tip: 'Take notes. There will be several specific facts (times, names, prices, steps) and at least one question will rely on a detail you might forget if you do not write it down. Focus on sequence and any numbered information.',
    skills: ['Detail recall', 'Sequencing', 'Specific fact', 'Note-taking skills'],
  },
  {
    id: 'L4',
    num: 'L4',
    label: 'News Item',
    icon: '📰',
    questions: 5,
    duration: '5–7 min',
    difficulty: 'Upper Intermediate',
    description:
      'A short audio clip styled like a Canadian radio or TV news report. The language is formal, paced, and precise. Questions focus on the key facts, the topic of the report, and the significance of events described.',
    tip: 'News items often begin with the most important fact. If you catch the opening sentence clearly, you will have the main idea. Questions about "what happened" or "why this matters" are based on the opening and closing lines.',
    skills: ['Main topic', 'Fact extraction', 'Formal language', 'Context inference'],
  },
  {
    id: 'L5',
    num: 'L5',
    label: 'Discussion',
    icon: '🗣️',
    questions: 6,
    duration: '6–8 min',
    difficulty: 'Advanced',
    description:
      'Multiple speakers debate or discuss a topic from different angles — a panel discussion, a team meeting, or a group conversation. You need to track who said what, which position each speaker holds, and how the conversation evolves.',
    tip: 'Assign a shorthand to each speaker right away (A, B, C or initials). Questions will ask things like "Which speaker agrees with..." or "What does the second speaker suggest?" — and mixing up speakers is a common mistake here.',
    skills: ['Multi-speaker tracking', 'Opinion attribution', 'Perspective comparison', 'Critical listening'],
  },
  {
    id: 'L6',
    num: 'L6',
    label: 'Viewpoints',
    icon: '⚖️',
    questions: 6,
    duration: '6–8 min',
    difficulty: 'Advanced',
    description:
      'Two speakers present opposing viewpoints on the same topic — a debate format with structured arguments and counter-arguments. This is the most linguistically complex part of the Listening test, requiring you to separate, compare, and evaluate two distinct positions.',
    tip: 'Each speaker has one main argument and one or two supporting points. Sketch a simple two-column table as you listen. The final question often tests whether you can identify a point that both speakers agree on — which is usually buried inside the disagreement.',
    skills: ['Argument analysis', 'Contrast & comparison', 'Inference', 'Nuanced comprehension'],
  },
]

const FAQ = [
  {
    q: 'What is the CELPIP Listening test format?',
    a: 'The CELPIP Listening test has 6 parts and takes 47 to 55 minutes. It includes 38 multiple choice questions. All audio uses Canadian English and each clip plays only once on the real test.',
  },
  {
    q: 'How is CELPIP Listening scored?',
    a: 'Listening is scored on the CLB scale from 1 to 12. Your raw score (number of correct answers) is converted into a CLB level. Each CLB level has a band of raw scores, and scores are not adjusted based on other test-takers.',
  },
  {
    q: 'What CELPIP Listening score do I need for immigration?',
    a: 'Express Entry (Federal Skilled Worker) requires a minimum CLB 7 in Listening. Canadian citizenship requires CLB 4. Scoring CLB 9 or higher across all 4 skills earns the maximum CRS language bonus points.',
  },
  {
    q: 'Can I replay the audio during the CELPIP Listening test?',
    a: 'No — each audio clip plays only once on the real CELPIP test. This is one of the key differences from IELTS Listening. In CELPIPace practice, you can choose to replay audio in drill mode to study, or simulate real conditions by listening only once.',
  },
  {
    q: 'Is CELPIP Listening harder than IELTS Listening?',
    a: 'They test the same core skill differently. CELPIP Listening uses conversational Canadian English and everyday topics, which many test-takers find more natural. IELTS uses a wider range of accents. However, the no-replay rule and Canadian idioms make CELPIP uniquely challenging for those not exposed to Canadian speech.',
  },
  {
    q: 'How can I improve my CELPIP Listening score?',
    a: 'Practice reading questions before each audio clip plays so you know what to listen for. Focus on parts you struggle with using targeted drills. Review every wrong answer with explanations to understand the reasoning. Consistent exposure to Canadian English media also helps significantly.',
  },
]

/* ── FAQ Accordion item ───────────────────────────────────────── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`lp-faq-item${open ? ' open' : ''}`}>
      <button className="lp-faq-q" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <span className="lp-faq-chevron">{open ? '▲' : '▼'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="lp-faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Part Card ────────────────────────────────────────────────── */
function PartCard({ part, onStart }) {
  return (
    <motion.div
      className="lp-part-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
    >
      <div className="lp-part-card-header">
        <span className="lp-part-num">{part.num}</span>
        <span className="lp-part-icon">{part.icon}</span>
        <span className={`lp-part-diff lp-diff-${part.difficulty.toLowerCase().replace(' ', '-')}`}>
          {part.difficulty}
        </span>
      </div>
      <h3 className="lp-part-name">{part.label}</h3>
      <p className="lp-part-desc">{part.description}</p>

      <div className="lp-part-skills">
        {part.skills.map(s => (
          <span key={s} className="lp-part-skill-tag">{s}</span>
        ))}
      </div>

      <div className="lp-part-meta">
        <span className="lp-part-meta-item">❓ {part.questions} questions</span>
        <span className="lp-part-meta-item">⏱ {part.duration}</span>
      </div>

      <div className="lp-part-tip">
        <span className="lp-part-tip-icon">💡</span>
        <span>{part.tip}</span>
      </div>

      <button className="lp-part-cta" onClick={() => onStart(part)}>
        Practice {part.num} →
      </button>
    </motion.div>
  )
}

/* ── Main ListeningPage ───────────────────────────────────────── */
export default function ListeningPage() {
  const navigate = useNavigate()
  const handleStart = (part) => {
    navigate('/practice-set', { state: { part } })
  }

  return (
    <div className="lp-root">
      <SEO
        title="CELPIP Listening Practice – All 6 Parts Explained"
        description="Master CELPIP Listening with guided practice for all 6 parts: Problem Solving, Daily Life, News, Viewpoints, and more. Study strategies included."
        canonical="/listening"
      />
      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-badge">🎧 CELPIP Listening</div>
          <h1 className="lp-hero-title">
            CELPIP Listening<br />
            <span className="lp-hero-accent">Practice by Part</span>
          </h1>
          <p className="lp-hero-subtitle">
            6 parts · 38 questions · 47–55 minutes · CLB 4–12
          </p>
          <p className="lp-hero-desc">
            The CELPIP Listening test assesses your ability to understand spoken Canadian English
            across six real-life formats — from two-person conversations and informational passages
            to multi-speaker discussions and opposing viewpoints. Every question is multiple choice,
            and each audio clip plays only once on the real test.
          </p>
          <div className="lp-hero-stats">
            <div className="lp-hero-stat"><strong>6</strong><span>Parts</span></div>
            <div className="lp-hero-stat"><strong>38</strong><span>Questions</span></div>
            <div className="lp-hero-stat"><strong>47–55 min</strong><span>Duration</span></div>
            <div className="lp-hero-stat"><strong>CLB 4–12</strong><span>Score Range</span></div>
          </div>
        </div>
      </section>

      <div className="lp-body">

        {/* ── Parts Grid ── */}
        <section className="lp-section">
          <div className="lp-section-label">Practice by Part</div>
          <h2 className="lp-section-title">Choose a Part to Practice</h2>
          <p className="lp-section-sub">
            Each part tests a different listening skill. Drill the parts where you lose the most points.
          </p>
          <div className="lp-parts-grid">
            {PARTS.map(p => (
              <PartCard key={p.id} part={p} onStart={handleStart} />
            ))}
          </div>
        </section>

        {/* ── What's Included ── */}
        <section className="lp-section lp-info-band">
          <div className="lp-info-grid">
            <div className="lp-info-block">
              <div className="lp-info-icon">📋</div>
              <h3>What the Test Includes</h3>
              <p>
                The Listening test runs 47 to 55 minutes with 6 parts and 38 multiple choice questions.
                Part 1 is a problem-solving dialogue. Part 2 covers an everyday conversation. Part 3 is
                an informational monologue. Part 4 is a news-style broadcast. Part 5 is a multi-speaker
                discussion. Part 6 presents two contrasting viewpoints.
              </p>
              <p style={{ marginTop: 10 }}>
                All audio reflects real-life Canadian English — accents, idioms, and vocabulary you would
                genuinely encounter working, studying, or living in Canada.
              </p>
            </div>
            <div className="lp-info-block">
              <div className="lp-info-icon">📊</div>
              <h3>How Scoring Works</h3>
              <p>
                Listening is scored on the CLB scale from 1 to 12. Each correct answer contributes to a
                raw score that maps to a CLB level. There is no negative marking — always answer every question.
              </p>
              <p style={{ marginTop: 10 }}>
                <strong>CLB 4</strong> is the minimum for Canadian citizenship. <strong>CLB 7</strong> is
                required for Express Entry Federal Skilled Worker. Reaching <strong>CLB 9+</strong> across
                all four skills earns the maximum CRS language bonus — a significant advantage in immigration draws.
              </p>
            </div>
            <div className="lp-info-block">
              <div className="lp-info-icon">🎯</div>
              <h3>How to Prepare</h3>
              <p>
                Read each question before the audio plays so you know exactly what to listen for. Take short
                notes during longer passages — names, numbers, and key details disappear fast. After each
                session, review every explanation for questions you got wrong, not just the ones you guessed on.
              </p>
              <p style={{ marginTop: 10 }}>
                Target your weakest parts with focused drills rather than repeating the ones you already do well.
                Consistent gap-filling practice raises your CLB band faster than re-doing comfortable material.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="lp-section">
          <div className="lp-section-label">FAQ</div>
          <h2 className="lp-section-title">Common Questions</h2>
          <div className="lp-faq-list">
            {FAQ.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>

      </div>
    </div>
  )
}
