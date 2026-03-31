import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    id: 'mock',
    badge: 'MOCK EXAMS',
    title: 'Practice That Feels Just Like the Real CELPIP',
    desc: 'Our mock exams match the official CELPIP format, timing, and difficulty. Practice all four skills in one sitting — Listening, Reading, Writing, and Speaking — with the same question types you will see on test day.',
    cta: 'Try Mock Exams →',
    ctaPage: 'exam',
    color: '#C8102E',
    colorLight: '#FEF2F2',
    icon: '📋',
    visual: (
      <div className="fshow-visual-mock">
        <div className="fshow-mock-header">
          <span className="fshow-mock-title">Mock Exam 1</span>
          <span className="fshow-mock-timer">⏱ 49:23</span>
        </div>
        <div className="fshow-mock-q">
          <p className="fshow-mock-qtext">1. What is the main purpose of the email?</p>
          <div className="fshow-mock-opts">
            <div className="fshow-mock-opt">A. To request a meeting</div>
            <div className="fshow-mock-opt fshow-selected">B. To propose a community project</div>
            <div className="fshow-mock-opt">C. To file a complaint</div>
            <div className="fshow-mock-opt">D. To offer congratulations</div>
          </div>
        </div>
        <div className="fshow-skill-tabs">
          {['🎧 Listening', '📖 Reading', '✍️ Writing', '🎙️ Speaking'].map(s => (
            <span key={s} className="fshow-skill-tab">{s}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'ai',
    badge: 'AI SCORING',
    title: 'AI Feedback That Helps You Improve',
    desc: 'Get instant, detailed scoring on your Writing and Speaking responses. Our AI analyzes coherence, vocabulary, grammar, and task fulfillment — then shows you exactly what to fix with error highlights and a polished version.',
    cta: 'Try AI Scoring →',
    ctaPage: 'writing',
    color: '#7C3AED',
    colorLight: '#F3EFFF',
    icon: '🤖',
    visual: (
      <div className="fshow-visual-ai">
        <div className="fshow-ai-top">
          <div className="fshow-ai-circle">
            <span className="fshow-ai-num">9</span>
            <span className="fshow-ai-denom">/12</span>
          </div>
          <div className="fshow-ai-bars">
            {[
              { name: 'Coherence',   val: 9  },
              { name: 'Vocabulary',  val: 8  },
              { name: 'Grammar',     val: 9  },
              { name: 'Fulfillment', val: 10 },
            ].map(s => (
              <div key={s.name} className="fshow-ai-bar-row">
                <span className="fshow-ai-bar-label">{s.name}</span>
                <div className="fshow-ai-bar-track">
                  <div className="fshow-ai-bar-fill" style={{ width: `${(s.val / 12) * 100}%` }} />
                </div>
                <span className="fshow-ai-bar-val">{s.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="fshow-ai-feedback">
          Your response demonstrates strong task understanding with clear organization...
          <span className="fshow-ai-highlight"> sent</span><span className="fshow-ai-correction"> → sent — past tense required</span>
        </div>
      </div>
    ),
  },
  {
    id: 'explain',
    badge: 'SMART LEARNING',
    title: 'Detailed Explanations for Every Question',
    desc: "Don't just memorize answers — understand why. Every question includes clear explanations, sample answers at different CLB levels, and actionable tips to help you build real skills that transfer to test day.",
    cta: 'Try Practice Questions →',
    ctaPage: 'reading',
    color: '#059669',
    colorLight: '#ECFDF5',
    icon: '💡',
    visual: (
      <div className="fshow-visual-explain">
        <div className="fshow-explain-correct">
          <span className="fshow-explain-check">✓</span>
          <strong>Correct!</strong>
        </div>
        <p className="fshow-explain-body">
          The answer is <strong>B</strong> because the email specifically mentions proposing a partnership for the community garden project...
        </p>
        <div className="fshow-explain-samples">
          <div className="fshow-explain-samples-label">Sample Responses:</div>
          <div className="fshow-explain-pills">
            <span className="fshow-pill fshow-pill-basic">Basic (CLB 5–6)</span>
            <span className="fshow-pill fshow-pill-good">Good (CLB 7–8)</span>
            <span className="fshow-pill fshow-pill-excellent">Excellent (CLB 9–10)</span>
          </div>
        </div>
      </div>
    ),
  },
]

export default function FeatureShowcase() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const f = FEATURES[active]

  return (
    <section className="fshow-section" id="features">
      <div className="section-inner">
        <motion.div
          className="section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Platform Features
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Everything you need to<br />
          <span className="highlight">ace your CELPIP exam</span>
        </motion.h2>

        {/* Tab Selectors */}
        <div className="fshow-tabs">
          {FEATURES.map((feat, i) => (
            <button
              key={feat.id}
              className={`fshow-tab${active === i ? ' fshow-tab-active' : ''}`}
              style={active === i ? { '--tab-color': feat.color, '--tab-light': feat.colorLight } : {}}
              onClick={() => setActive(i)}
            >
              <span className="fshow-tab-icon">{feat.icon}</span>
              <span className="fshow-tab-badge">{feat.badge}</span>
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={f.id}
            className="fshow-panel"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            {/* Left: text */}
            <div className="fshow-panel-text">
              <span
                className="fshow-badge"
                style={{ background: f.colorLight, color: f.color }}
              >
                {f.badge}
              </span>
              <h3 className="fshow-panel-title">{f.title}</h3>
              <p className="fshow-panel-desc">{f.desc}</p>
              <button
                className="btn btn-primary"
                style={{ background: f.color }}
                onClick={() => navigate('/' + f.ctaPage)}
              >
                {f.cta}
              </button>
            </div>

            {/* Right: visual */}
            <div className="fshow-panel-visual">{f.visual}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
