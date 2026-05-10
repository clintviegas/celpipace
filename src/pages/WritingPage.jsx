import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { FREE_PARTS } from '../data/constants'

const COLOR = '#C8972A'
const COLOR_LIGHT = '#FFFBEB'

const PARTS = [
  {
    id: 'W1',
    num: 'W1',
    label: 'Writing an Email',
    icon: '📧',
    questions: 1,
    duration: '27 min',
    difficulty: 'Intermediate',
    description:
      'You are given a scenario and asked to write an email of 150 to 200 words. The prompt specifies who you are writing to, why you are writing, and what you need to address. The email can be formal (a complaint to a company, a request to a manager) or informal (a note to a friend, a message to a neighbour), depending on the situation.',
    tip: 'Match your tone to the scenario before you write a single word. A formal complaint and a message to a friend require completely different language. Address every bullet point in the prompt — skipping even one will cost you marks on task fulfillment.',
    skills: ['Formal & informal tone', 'Task fulfillment', 'Vocabulary range', 'Coherence'],
  },
  {
    id: 'W2',
    num: 'W2',
    label: 'Survey Questions',
    icon: '📝',
    questions: 1,
    duration: '26 min',
    difficulty: 'Upper Intermediate',
    description:
      'You are presented with a survey-style topic and asked to choose one option or state an opinion. Your response should be one clear 150 to 200 word answer that explains your position and supports it with specific reasons.',
    tip: 'Pick one clear position and commit to it. The most common mistake is hedging — writing "both sides have merit" instead of defending one view. Examiners score how well you support your position, not which position you choose. Give two or three specific, concrete reasons.',
    skills: ['Opinion writing', 'Argument development', 'Specific support', 'Task fulfillment'],
  },
]

const FAQ = [
  {
    q: 'What is the CELPIP Writing test format?',
    a: 'The CELPIP Writing test has 2 tasks and takes 53 minutes total. Task 1 (Writing an Email) is 27 minutes and Task 2 (Responding to Survey Questions) is 26 minutes. Both tasks expect 150 to 200 words, typed on a computer.',
  },
  {
    q: 'How is CELPIP Writing scored?',
    a: 'Writing is scored on 4 criteria: Content & Coherence (are all points addressed clearly?), Vocabulary Range (variety and precision of word choice), Readability (grammar, spelling, sentence structure), and Task Fulfillment (does the response fully meet the prompt requirements?). Each criterion is scored on the CLB scale.',
  },
  {
    q: 'How many words should I write for each task?',
    a: '150 to 200 words is the target range for both tasks. Writing significantly under 150 words will hurt your task fulfillment score. Going over 200 words slightly is fine, but very long responses can introduce more errors. Quality of content matters more than word count.',
  },
  {
    q: 'What CELPIP Writing score do I need for immigration?',
    a: 'Express Entry Federal Skilled Worker requires CLB 7 in Writing. Canadian citizenship requires CLB 4. Achieving CLB 9 or higher across all four skills earns the maximum CRS language bonus points.',
  },
  {
    q: 'What is the difference between W1 and W2 tone?',
    a: 'W1 tone depends entirely on the prompt — it can be formal (complaint, request) or informal (message to a friend). W2 is typically written in a semi-formal style — clear and direct, but not as stiff as a business letter. Read the prompt carefully to identify who you are addressing.',
  },
  {
    q: 'Can I use templates for CELPIP Writing?',
    a: 'Structured frameworks help with organization, but avoid filling in memorized sentences verbatim — examiners are trained to identify generic responses. Use templates as a mental outline for structure, then write your content naturally for the specific prompt given.',
  },
]

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
          <motion.div className="lp-faq-a" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PartCard({ part, onStart, locked }) {
  return (
    <motion.div className="lp-part-card" whileHover={{ y: -4 }} transition={{ duration: 0.18 }} style={{ borderColor: '#e8dfc0' }}>
      <div className="lp-part-card-header">
        <span className="lp-part-num" style={{ background: '#FFF3D0', color: COLOR }}>{part.num}</span>
        <span className="lp-part-icon">{part.icon}</span>
        {locked
          ? <span style={{ fontSize: 11, fontWeight: 700, background: '#0f172a', color: '#fff', padding: '2px 8px', borderRadius: 6, letterSpacing: '.06em' }}>PRO</span>
          : <span className={`lp-part-diff lp-diff-${part.difficulty.toLowerCase().replace(' ', '-')}`}>{part.difficulty}</span>}
      </div>
      <h3 className="lp-part-name">{part.label}</h3>
      <p className="lp-part-desc">{part.description}</p>
      <div className="lp-part-skills">
        {part.skills.map(s => (
          <span key={s} className="lp-part-skill-tag" style={{ background: '#FFF3D0', color: COLOR }}>{s}</span>
        ))}
      </div>
      <div className="lp-part-meta">
        <span className="lp-part-meta-item">✍️ {part.questions} task</span>
        <span className="lp-part-meta-item">⏱ {part.duration}</span>
      </div>
      <div className="lp-part-tip" style={{ borderLeftColor: COLOR, background: '#fffdf0' }}>
        <span className="lp-part-tip-icon">💡</span>
        <span>{part.tip}</span>
      </div>
      <button
        className="lp-part-cta"
        style={{ background: locked ? '#64748b' : COLOR }}
        onClick={() => onStart(part)}
      >
        {locked ? '🔒 Premium Only' : `Practice ${part.num} →`}
      </button>
    </motion.div>
  )
}

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function WritingPage() {
  const navigate = useNavigate()
  const { isPremium } = useAuth()
  const handleStart = (part) => { navigate(`/celpip-writing-practice/${part.id}`) }

  return (
    <div className="lp-root">
      <SEO
        title="CELPIP Writing Practice With Real-Time Scoring — Task 1 & Task 2"
        description="CELPIP Writing practice for Task 1 (email) and Task 2 (survey response) with real-time CLB scoring, word-count tools, structure tips, and saved attempts."
        canonical="/celpip-writing-practice"
        jsonLd={FAQ_JSONLD}
      />
      <section className="lp-hero" style={{ background: 'linear-gradient(135deg, #0F1F3D 0%, #2d2010 60%, #3d2c10 100%)' }}>
        <div className="lp-hero-inner">
          <div className="lp-hero-badge" style={{ background: 'rgba(200,151,42,.2)', border: '1px solid rgba(200,151,42,.4)', color: '#e8c060' }}>
            ✍️ CELPIP Writing
          </div>
          <h1 className="lp-hero-title">Write emails that actually sound like you.</h1>
          <p className="lp-hero-subtitle">Real scenarios, grown-up prompts and real-time feedback that tells you exactly what to fix.<br/>2 tasks · 53 minutes · 150–200 words each · CLB 4–12</p>
          <div className="lp-hero-stats">
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>2</strong><span>Tasks</span></div>
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>53 min</strong><span>Total Time</span></div>
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>150–200</strong><span>Words Each</span></div>
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>CLB 4–12</strong><span>Score Range</span></div>
          </div>
        </div>
      </section>

      <div className="lp-body">
        <section className="lp-section">
          <div className="lp-section-label" style={{ color: COLOR }}>Practice by Task</div>
          <h2 className="lp-section-title">Choose a Task to Practice</h2>
          <p className="lp-section-sub">Each task tests a different writing skill. Master both to maximize your CLB band.</p>
          <div className="lp-parts-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {PARTS.map(p => <PartCard key={p.id} part={p} onStart={handleStart} locked={!isPremium && !FREE_PARTS.has(p.id)} />)}
          </div>
        </section>

        <section className="lp-section lp-info-band" style={{ background: 'linear-gradient(135deg, #fffdf0 0%, #f7f9fc 100%)', borderColor: '#e8dfc0' }}>
          <div className="lp-info-grid">
            <div className="lp-info-block">
              <div className="lp-info-icon">📋</div>
              <h3>What the Test Includes</h3>
              <p>The Writing test has two tasks totalling 53 minutes. W1 gives you a scenario and asks for a 150–200 word email response in 27 minutes. W2 presents a survey-style topic and gives 26 minutes to write one 150–200 word opinion response.</p>
              <p style={{ marginTop: 10 }}>Both tasks are completed on a computer. There is a word count tool visible while you type. Basic cut, copy, and paste functions are available — no spell checker or grammar tool.</p>
            </div>
            <div className="lp-info-block">
              <div className="lp-info-icon">📊</div>
              <h3>How Scoring Works</h3>
              <p>Each task is scored on four criteria: <strong>Content & Coherence</strong> (are all required points addressed logically?), <strong>Vocabulary Range</strong> (variety and accuracy of word choice), <strong>Readability</strong> (grammar, spelling, sentence variety), and <strong>Task Fulfillment</strong> (does the response do exactly what the prompt asks?).</p>
              <p style={{ marginTop: 10 }}>Each criterion is scored independently on the CLB scale. Your final Writing score is an average of all criteria across both tasks.</p>
            </div>
            <div className="lp-info-block">
              <div className="lp-info-icon">🎯</div>
              <h3>How to Prepare</h3>
              <p>For W1: spend the first 2 minutes reading and planning. Identify the tone (formal vs informal), list the points to cover, then write. For W2: choose a clear position and build two or three specific supporting reasons — avoid vague statements like "it is beneficial in many ways".</p>
              <p style={{ marginTop: 10 }}>Review model responses for both tasks. Notice how high-scoring responses use varied vocabulary, clear transitions, and precise phrasing rather than just correct grammar.</p>
            </div>
          </div>
        </section>

        <section className="lp-section">
          <div className="lp-section-label" style={{ color: COLOR }}>FAQ</div>
          <h2 className="lp-section-title">Common Questions</h2>
          <div className="lp-faq-list">
            {FAQ.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
