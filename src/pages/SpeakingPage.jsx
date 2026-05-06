import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'

const COLOR = '#C8102E'
const COLOR_LIGHT = '#FEF2F2'

const PARTS = [
  {
    id: 'S1',
    num: 'S1',
    label: 'Giving Advice',
    icon: '🤝',
    duration: '30s prep · 60s speak',
    difficulty: 'Intermediate',
    description:
      'You are given a personal scenario and asked to give advice to someone in that situation. The prompt describes a person\'s problem or dilemma. Your response should be direct, organized, and cover each point the prompt asks you to address.',
    tip: 'Open with a clear recommendation, then support it with two or three specific reasons. Avoid being vague — "you should consider your options" scores lower than "I would recommend doing X because Y".',
    skills: ['Structured advice', 'Clarity', 'Vocabulary range', 'Task fulfillment'],
  },
  {
    id: 'S2',
    num: 'S2',
    label: 'Personal Experience',
    icon: '🗓️',
    duration: '30s prep · 90s speak',
    difficulty: 'Intermediate',
    description:
      'You describe a personal experience related to the prompt. This could be a memorable event, a challenge you faced, something you learned, or a decision you made. The prompt usually provides a few guiding questions to structure your response.',
    tip: 'Use the guiding questions as your outline. Describe the situation briefly, then focus on what happened and what it meant to you. Specific details — names, places, a particular moment — make your response sound natural and score better on vocabulary.',
    skills: ['Narrative structure', 'Personal vocabulary', 'Fluency', 'Elaboration'],
  },
  {
    id: 'S3',
    num: 'S3',
    label: 'Describing a Scene',
    icon: '🖼️',
    duration: '30s prep · 60s speak',
    difficulty: 'Intermediate',
    description:
      'You are shown an image and asked to describe what you see in detail — the people, the setting, the activities happening, and the overall atmosphere. This part tests your descriptive vocabulary and your ability to speak clearly about visual information.',
    tip: 'Don\'t just list objects. Describe actions ("a woman is handing something to a child"), relationships between people, and what the scene suggests about the situation. End with a sentence about the overall mood or what might happen next.',
    skills: ['Descriptive vocabulary', 'Present continuous', 'Spatial language', 'Inference from image'],
  },
  {
    id: 'S4',
    num: 'S4',
    label: 'Making Predictions',
    icon: '🔭',
    duration: '30s prep · 60s speak',
    difficulty: 'Upper Intermediate',
    description:
      'You look at an image or read a short scenario and make predictions about what will happen next. The prompt asks you to speculate about a future situation — what might occur, what people might do, what the consequences could be.',
    tip: 'Use prediction language naturally — "I think", "it\'s likely that", "they might", "this could lead to". Speculate on multiple possibilities rather than stating one outcome as certain. Address the question of why you believe your prediction is reasonable.',
    skills: ['Speculative language', 'Future forms', 'Reasoning & justification', 'Fluency'],
  },
  {
    id: 'S5',
    num: 'S5',
    label: 'Comparing & Persuading',
    icon: '🔄',
    duration: '60s prep · 60s speak',
    difficulty: 'Upper Intermediate',
    description:
      'You are presented with two options and asked to compare them, then persuade someone to choose one. This could be comparing two products, two plans, two places, or two approaches to a problem. You need to argue for one option convincingly.',
    tip: 'Acknowledge the other option briefly, then build your argument for your chosen option. Use comparative language: "Option A is more practical because...", "While B has the advantage of X, A is better overall because Y". Don\'t just list features — make the case.',
    skills: ['Comparative structures', 'Persuasive language', 'Argument development', 'Vocabulary'],
  },
  {
    id: 'S6',
    num: 'S6',
    label: 'Difficult Situation',
    icon: '⚠️',
    duration: '60s prep · 90s speak',
    difficulty: 'Upper Intermediate',
    description:
      'You are described a challenging or uncomfortable real-life scenario and asked how you would respond. This tests your ability to think on your feet, communicate clearly under pressure, and demonstrate practical problem-solving through speech.',
    tip: 'Stay calm and methodical in your response. Describe what you would do step by step. Use phrases like "My first step would be...", "After that, I would...", "The reason I\'d handle it this way is..." — this structure keeps you organized and shows coherence.',
    skills: ['Problem-solving language', 'Coherence', 'Step-by-step structure', 'Confidence'],
  },
  {
    id: 'S7',
    num: 'S7',
    label: 'Expressing Opinions',
    icon: '💬',
    duration: '30s prep · 90s speak',
    difficulty: 'Advanced',
    description:
      'You are asked to express and defend your opinion on a topic — often a social, community, or work-related issue. The prompt may ask you to choose a position or respond to a statement. This is where vocabulary range, argument quality, and fluency all come together.',
    tip: 'Give your position clearly in the first sentence, then develop it with two strong, specific reasons. Acknowledge the counterargument briefly before dismissing it. This structure signals advanced reasoning to the examiner.',
    skills: ['Opinion language', 'Argument & counter-argument', 'Advanced vocabulary', 'Task fulfillment'],
  },
  {
    id: 'S8',
    num: 'S8',
    label: 'Unusual Situation',
    icon: '🌀',
    duration: '30s prep · 60s speak',
    difficulty: 'Advanced',
    description:
      'You are placed in an unexpected or unusual scenario — something hypothetical, funny, or out of the ordinary — and asked to describe what you would do. This part often surprises test-takers with its creativity and requires fast, flexible thinking.',
    tip: 'Don\'t let the unusual scenario throw you off — treat it like any opinion response. State what you would do, explain why, and describe the outcome. Examiners are not judging the reasonableness of your plan, only how clearly and fluently you communicate it.',
    skills: ['Hypothetical language', 'Imaginative thinking', 'Fluency under pressure', 'Coherence'],
  },
]

const FAQ = [
  {
    q: 'What is the CELPIP Speaking test format?',
    a: 'The CELPIP Speaking test has 8 tasks and takes approximately 15 to 20 minutes. Each task gives you 30 to 60 seconds of preparation time followed by 60 to 90 seconds to record your spoken response. All responses are recorded on a computer — there is no live examiner.',
  },
  {
    q: 'How is CELPIP Speaking scored?',
    a: 'Speaking is scored on 4 criteria: Coherence (is the response logically organized?), Vocabulary Range (variety and accuracy of word choice), Listenability (pronunciation, pace, clarity), and Task Fulfillment (did you address everything the prompt asked?). Each criterion is scored on the CLB scale.',
  },
  {
    q: 'Is there a live examiner during the CELPIP Speaking test?',
    a: 'No — unlike IELTS Speaking, the CELPIP Speaking test is fully computer-based. You record your responses which are then scored by trained raters. This means your score is not affected by the examiner\'s mood or accent preferences, but it also means you must be self-motivated to structure your responses well.',
  },
  {
    q: 'What CELPIP Speaking score do I need for immigration?',
    a: 'Express Entry Federal Skilled Worker requires CLB 7 in Speaking. Canadian citizenship requires CLB 4. Scoring CLB 9 or higher across all four skills earns the maximum CRS language bonus points for immigration applications.',
  },
  {
    q: 'What is the most common reason for low CELPIP Speaking scores?',
    a: 'Not fully addressing every part of the prompt is the single most common cause of low task fulfillment scores. Examiners check whether you answered all the questions asked — covering 80% of the prompt well scores lower than covering 100% adequately. Use prep time to plan, not just to think.',
  },
  {
    q: 'Does pronunciation affect my CELPIP Speaking score?',
    a: 'Pronunciation affects the Listenability score, but you do not need a Canadian or British accent to score CLB 9+. What matters is whether your speech is clear and easy to understand — consistent accent is fine as long as it does not make the listener work hard to follow you.',
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
    <motion.div className="lp-part-card" whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
      <div className="lp-part-card-header">
        <span className="lp-part-num" style={{ background: '#FEECEC', color: COLOR }}>{part.num}</span>
        <span className="lp-part-icon">{part.icon}</span>
        <span className={`lp-part-diff lp-diff-${part.difficulty.toLowerCase().replace(' ', '-')}`}>{part.difficulty}</span>
      </div>
      <h3 className="lp-part-name">{part.label}</h3>
      <p className="lp-part-desc">{part.description}</p>
      <div className="lp-part-skills">
        {part.skills.map(s => (
          <span key={s} className="lp-part-skill-tag" style={{ background: '#FEECEC', color: COLOR }}>{s}</span>
        ))}
      </div>
      <div className="lp-part-meta">
        <span className="lp-part-meta-item">🎙️ 1 task</span>
        <span className="lp-part-meta-item">⏱ {part.duration}</span>
      </div>
      <div className="lp-part-tip" style={{ borderLeftColor: COLOR, background: '#fff5f5' }}>
        <span className="lp-part-tip-icon">💡</span>
        <span>{part.tip}</span>
      </div>
      <button
        className="lp-part-cta"
        style={{ background: COLOR }}
        onClick={() => onStart(part)}
      >
        Practice {part.num} →
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

export default function SpeakingPage() {
  const navigate = useNavigate()
  const handleStart = (part) => { navigate(`/celpip-speaking-practice/${part.id}`) }

  return (
    <div className="lp-root">
      <SEO
        title="CELPIP Speaking Practice for All 8 Tasks With AI Feedback"
        description="Practice all 8 CELPIP Speaking tasks with timed prompts, recordings, transcripts, and AI feedback for fluency, vocabulary, and task fulfillment."
        canonical="/celpip-speaking-practice"
        jsonLd={FAQ_JSONLD}
      />
      <section className="lp-hero" style={{ background: 'linear-gradient(135deg, #0F1F3D 0%, #3d1020 60%, #4a1828 100%)' }}>
        <div className="lp-hero-inner">
          <div className="lp-hero-badge" style={{ background: 'rgba(200,16,46,.2)', border: '1px solid rgba(200,16,46,.4)', color: '#f07090' }}>
            🎙️ CELPIP Speaking
          </div>
          <h1 className="lp-hero-title">Speak with confidence, not a script.</h1>
          <p className="lp-hero-subtitle">Eight tasks, real-time prep countdowns and AI feedback on fluency, range and clarity.<br/>8 tasks · 15–20 minutes · 30–90s per task · CLB 4–12</p>
          <div className="lp-hero-stats">
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>8</strong><span>Tasks</span></div>
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>15–20 min</strong><span>Duration</span></div>
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>4</strong><span>Scoring Criteria</span></div>
            <div className="lp-hero-stat"><strong style={{ color: COLOR }}>CLB 4–12</strong><span>Score Range</span></div>
          </div>
        </div>
      </section>

      <div className="lp-body">
        <section className="lp-section">
          <div className="lp-section-label" style={{ color: COLOR }}>Practice by Task</div>
          <h2 className="lp-section-title">Choose a Task to Practice</h2>
          <p className="lp-section-sub">Each task tests a different speaking skill. Drill the tasks where you lose the most marks.</p>
          <div className="lp-parts-grid">
            {PARTS.map(p => <PartCard key={p.id} part={p} onStart={handleStart} />)}
          </div>
        </section>

        <section className="lp-section lp-info-band" style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #f7f9fc 100%)', borderColor: '#f4c0c8' }}>
          <div className="lp-info-grid">
            <div className="lp-info-block">
              <div className="lp-info-icon">📋</div>
              <h3>What the Test Includes</h3>
              <p>The Speaking test has 8 tasks covering: giving advice, sharing personal experience, describing a scene, making predictions, comparing options and persuading, handling a difficult situation, expressing opinions, and responding to an unusual scenario.</p>
              <p style={{ marginTop: 10 }}>All tasks are completed on a computer with a built-in microphone. Each task shows the prompt on screen along with a preparation countdown and a speaking countdown.</p>
            </div>
            <div className="lp-info-block">
              <div className="lp-info-icon">📊</div>
              <h3>How Scoring Works</h3>
              <p>Speaking is scored on four criteria: <strong>Coherence</strong> (logical flow and organization), <strong>Vocabulary Range</strong> (variety, precision, and appropriateness), <strong>Listenability</strong> (pronunciation, pace, and clarity), and <strong>Task Fulfillment</strong> (were all parts of the prompt addressed?).</p>
              <p style={{ marginTop: 10 }}>Each criterion is scored independently on the CLB scale. Task Fulfillment is the most commonly neglected — always address every part of the prompt.</p>
            </div>
            <div className="lp-info-block">
              <div className="lp-info-icon">🎯</div>
              <h3>How to Prepare</h3>
              <p>Use every second of your preparation time. Read the prompt completely, plan a clear opening sentence, and identify two or three supporting points before you start speaking. Running out of things to say mid-response hurts both coherence and fluency scores.</p>
              <p style={{ marginTop: 10 }}>Record yourself and listen back. This is the fastest way to identify filler words, repetitive vocabulary, and unclear pronunciation that you don't notice while speaking.</p>
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
