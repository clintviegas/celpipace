import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

const COLOR = '#2D8A56'
const COLOR_LIGHT = '#F0FDF4'

const PARTS = [
  {
    id: 'R1',
    num: 'R1',
    label: 'Correspondence',
    icon: '✉️',
    questions: 11,
    duration: '11 min',
    difficulty: 'Intermediate',
    description:
      'A practical written exchange — an email, a letter, or a short message between two people. The passage reflects a real situation: a complaint, a request, a notice, or an informal update. You need to understand the purpose of the message, the tone the writer is using, and the specific details they include or leave out.',
    tip: 'Match tone first. Many questions ask whether the email is formal or informal, or what the writer\'s attitude is. Look at word choice — "I regret to inform you" vs "Just wanted to let you know" signal completely different registers.',
    skills: ['Tone & register', 'Writer purpose', 'Detail comprehension', 'Inference'],
  },
  {
    id: 'R2',
    num: 'R2',
    label: 'Apply a Diagram',
    icon: '📊',
    questions: 8,
    duration: '13 min',
    difficulty: 'Intermediate',
    description:
      'A passage paired with a visual — a schedule, a form, a chart, a floor plan, or a table. You must read both the text and the visual and use them together to answer questions. This tests practical reading skills: finding information quickly, matching data across formats, and applying what you read to a specific task.',
    tip: 'Read the passage first, then check the visual as you answer each question. Most questions require you to combine information from both. Do not answer from the visual alone — the text almost always adds a condition or exception that changes the answer.',
    skills: ['Data extraction', 'Cross-reference', 'Practical reading', 'Applied comprehension'],
  },
  {
    id: 'R3',
    num: 'R3',
    label: 'Information',
    icon: '📄',
    questions: 9,
    duration: '14 min',
    difficulty: 'Intermediate',
    description:
      'A longer informational passage on a general topic — a magazine article, a consumer guide, a factsheet, or a report. The text is denser and requires you to understand both direct statements and implied meaning. Questions test main idea, supporting detail, vocabulary in context, and inference.',
    tip: 'Do not re-read the whole passage for every question. Identify which paragraph each question points to and focus there. For vocabulary-in-context questions, substitute each option into the sentence — the right answer fits the meaning of the full paragraph, not just the sentence.',
    skills: ['Main idea', 'Supporting detail', 'Vocabulary in context', 'Inference'],
  },
  {
    id: 'R4',
    num: 'R4',
    label: 'Viewpoints',
    icon: '⚖️',
    questions: 10,
    duration: '17 min',
    difficulty: 'Advanced',
    description:
      'Two or more texts presenting different perspectives on the same topic — an opinion column paired with a counter-argument, or a community letter responded to by an official. This is the most complex reading part. You must understand each position independently, then compare them to identify agreement, disagreement, and the reasoning behind each stance.',
    tip: 'Draw a quick two-column table before you start: Speaker A says / Speaker B says. The hardest questions are about subtle agreement — a point where both writers share a concern despite disagreeing on the solution. These are usually buried in the second half of each passage.',
    skills: ['Opinion identification', 'Contrast & comparison', 'Critical reading', 'Nuanced inference'],
  },
]

const FAQ = [
  {
    q: 'What is the CELPIP Reading test format?',
    a: 'The CELPIP Reading test has 4 parts and takes 55 to 60 minutes with 38 multiple choice questions. Each part uses a different text type — correspondence, a diagram-based task, an informational passage, and a viewpoints comparison.',
  },
  {
    q: 'How is CELPIP Reading scored?',
    a: 'Reading is scored on the CLB scale from 1 to 12. Your raw score (correct answers out of 38) is converted to a CLB level. There is no penalty for wrong answers, so always answer every question.',
  },
  {
    q: 'What CELPIP Reading score do I need for immigration?',
    a: 'Express Entry Federal Skilled Worker requires CLB 7 in Reading. Canadian citizenship requires CLB 4. Scoring CLB 9 or higher across all four skills earns the maximum CRS language bonus points.',
  },
  {
    q: 'Which Reading part is the hardest?',
    a: 'Most test-takers find R4 (Viewpoints) the most challenging because it requires comparing two different writer positions rather than just comprehending one text. R3 (Information) is the longest and most detail-heavy.',
  },
  {
    q: 'Can I go back and change my answers in the CELPIP Reading test?',
    a: 'Yes — you can navigate between questions within a section and change your answers before the time runs out. Use this to flag uncertain answers and return to them after completing the rest of the part.',
  },
  {
    q: 'How should I manage time in the CELPIP Reading test?',
    a: 'Roughly: R1 → 11 min, R2 → 13 min, R3 → 14 min, R4 → 17 min. You manage your own time across all parts. If you get stuck on a question, move on and return — spending too long on one question is the most common time management mistake.',
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

function PartCard({ part, onStart }) {
  return (
    <motion.div className="lp-part-card lp-part-card--reading" whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
      <div className="lp-part-card-header">
        <span className="lp-part-num" style={{ background: '#E6F4EE', color: COLOR }}>{part.num}</span>
        <span className="lp-part-icon">{part.icon}</span>
        <span className={`lp-part-diff lp-diff-${part.difficulty.toLowerCase().replace(' ', '-')}`}>{part.difficulty}</span>
      </div>
      <h3 className="lp-part-name">{part.label}</h3>
      <p className="lp-part-desc">{part.description}</p>
      <div className="lp-part-skills">
        {part.skills.map(s => (
          <span key={s} className="lp-part-skill-tag" style={{ background: '#E6F4EE', color: COLOR }}>{s}</span>
        ))}
      </div>
      <div className="lp-part-meta">
        <span className="lp-part-meta-item">❓ {part.questions} questions</span>
        <span className="lp-part-meta-item">⏱ {part.duration}</span>
      </div>
      <div className="lp-part-tip" style={{ borderLeftColor: COLOR, background: '#f2fbf6' }}>
        <span className="lp-part-tip-icon">💡</span>
        <span>{part.tip}</span>
      </div>
      <button className="lp-part-cta" style={{ background: COLOR }} onClick={() => onStart(part)}>
        Practice {part.num} →
      </button>
    </motion.div>
  )
}

export default function ReadingPage() {
  const navigate = useNavigate()
  const handleStart = (part) => { navigate(`/reading/${part.id}`) }

  return (
    <div className="lp-root">
      <SEO
        title="CELPIP Reading Practice – Correspondence, Diagrams & Viewpoints"
        description="Practice all 4 CELPIP Reading parts with expert breakdowns, tips for inference questions, and strategies for apply-diagram and viewpoints tasks."
        canonical="/reading"
      />
      <section className="lp-hero" style={{ background: 'linear-gradient(135deg, #0F1F3D 0%, #0f3324 60%, #1a4a35 100%)' }}>
        <div className="lp-hero-inner">
          <div className="lp-hero-badge" style={{ background: 'rgba(45,138,86,.2)', border: '1px solid rgba(45,138,86,.4)', color: '#7dcfa0' }}>
            📖 CELPIP Reading
          </div>
          <h1 className="lp-hero-title">Read between the Canadian lines.</h1>
          <p className="lp-hero-subtitle">Emails, diagrams, features and viewpoints — the way real Canadian text actually shows up.<br/>4 parts · 38 questions · 55–60 minutes · CLB 4–12</p>
          <div className="lp-hero-stats">
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>4</strong><span>Parts</span></div>
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>38</strong><span>Questions</span></div>
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>55–60 min</strong><span>Duration</span></div>
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>CLB 4–12</strong><span>Score Range</span></div>
          </div>
        </div>
      </section>

      <div className="lp-body">
        <section className="lp-section">
          <div className="lp-section-label" style={{ color: COLOR }}>Practice by Part</div>
          <h2 className="lp-section-title">Choose a Part to Practice</h2>
          <p className="lp-section-sub">Each part uses a different text type. Focus on the parts where you lose the most marks.</p>
          <div className="lp-parts-grid">
            {PARTS.map(p => <PartCard key={p.id} part={p} onStart={handleStart} />)}
          </div>
        </section>

        <section className="lp-section lp-info-band" style={{ background: 'linear-gradient(135deg, #edfaf3 0%, #f7f9fc 100%)', borderColor: '#b6e4cb' }}>
          <div className="lp-info-grid">
            <div className="lp-info-block">
              <div className="lp-info-icon">📋</div>
              <h3>What the Test Includes</h3>
              <p>The Reading test covers four distinct text types in 55 to 60 minutes. R1 is a written correspondence — an email or letter. R2 pairs a passage with a diagram, form, or table. R3 is a longer informational passage on a general topic. R4 presents two contrasting viewpoints on the same subject.</p>
              <p style={{ marginTop: 10 }}>All passages use Canadian English and cover topics relevant to everyday life, work, and community settings. No specialist knowledge is required — only reading comprehension.</p>
            </div>
            <div className="lp-info-block">
              <div className="lp-info-icon">📊</div>
              <h3>How Scoring Works</h3>
              <p>Reading is scored on the CLB scale from 1 to 12. Each of the 38 questions carries equal weight. There is no penalty for a wrong answer, so guessing is always better than leaving blank.</p>
              <p style={{ marginTop: 10 }}><strong>CLB 4</strong> is needed for Canadian citizenship. <strong>CLB 7</strong> is the Express Entry minimum for Federal Skilled Worker. <strong>CLB 9+</strong> in all four skills earns the maximum CRS language bonus for immigration.</p>
            </div>
            <div className="lp-info-block">
              <div className="lp-info-icon">🎯</div>
              <h3>How to Prepare</h3>
              <p>Read the questions before the passage so you know what information to look for. For R2, always cross-reference the passage and the visual — one alone is rarely enough. For R4, identify each writer's position before trying to answer comparison questions.</p>
              <p style={{ marginTop: 10 }}>Inference questions are the main source of lost marks — practise asking "what does the writer imply?" rather than only looking for directly stated facts.</p>
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
