import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SHOWCASES = [
  {
    id: 'mock',
    badge: 'Mock Exams',
    title: 'Practice That Feels Just Like the Real CELPIP',
    desc: 'Our mock exams match the official CELPIP format, timing, and difficulty. Practice all four skills in one sitting — with the same question types you will see on test day.',
    cta: 'Try Mock Exams →',
    ctaPage: 'exam',
  },
  {
    id: 'ai',
    badge: 'AI Scoring',
    title: 'AI Feedback That Helps You Improve',
    desc: 'Get instant, detailed scoring on your Writing and Speaking responses. Our AI analyzes coherence, vocabulary, grammar, and task fulfillment — then shows you exactly what to fix.',
    cta: 'Try AI Scoring →',
    ctaPage: 'writing',
  },
  {
    id: 'explain',
    badge: 'Smart Learning',
    title: 'Detailed Explanations for Every Question',
    desc: "Don't just memorize answers — understand why. Every question includes clear explanations, sample answers at different CLB levels, and actionable tips.",
    cta: 'Try Practice Questions →',
    ctaPage: 'reading',
  },
]

const TRUST_STATS = [
  { value: '200+', label: 'Practice Questions', icon: '📝' },
  { value: '4.9', label: 'Google Rating', icon: '⭐' },
  { value: '20+', label: 'Mock Exams', icon: '🏆' },
  { value: 'AI', label: 'Instant Scoring', icon: '🤖' },
]

const SKILL_PILLS = [
  { label: 'Mock Exams', page: 'exam', icon: '🏆' },
  { label: 'Listening', page: 'listening', icon: '🎧' },
  { label: 'Reading', page: 'reading', icon: '📖' },
  { label: 'Writing', page: 'writing', icon: '✍️' },
  { label: 'Speaking', page: 'speaking', icon: '🎙️' },
]

export default function Hero({ setPage }) {
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(i => (i + 1) % SHOWCASES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const active = SHOWCASES[activeIdx]

  return (
    <section className="hero-v2" id="hero">
      <div className="hero-v2-bg">
        <div className="hero-v2-grid" />
        <div className="hero-v2-glow hero-v2-glow-1" />
        <div className="hero-v2-glow hero-v2-glow-2" />
      </div>

      <div className="hero-v2-inner">
        <div className="hero-v2-content">
          <motion.div className="hero-v2-trust-badge" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="hero-v2-trust-dot" />
            ★ Trusted CELPIP Practice Platform
          </motion.div>

          <motion.h1 className="hero-v2-title" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            Your Fastest Path<br />to a{' '}
            <span className="hero-v2-score-highlight">10+</span>{' '}
            CELPIP Score
          </motion.h1>

          <motion.p className="hero-v2-sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            AI-powered practice questions, instant scoring, and detailed feedback
            across all 4 CELPIP skills. Boost your CRS by up to <strong>50 points</strong>.
          </motion.p>

          <motion.div className="hero-v2-ctas" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <button className="btn btn-primary btn-lg hero-v2-main-cta" onClick={() => setPage('exam')}>
              Start My Free Practice →
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => setPage('calculator')}>
              Calculate My CRS Score
            </button>
          </motion.div>

          <motion.div className="hero-v2-social-proof" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <div className="hero-v2-avatars">
              {['AK', 'MR', 'SL', 'JP', 'NW'].map((a, i) => (
                <div key={a} className="hero-v2-avatar" style={{ zIndex: 5 - i }}>{a}</div>
              ))}
            </div>
            <span className="hero-v2-social-text">Trusted by test-takers across Canada</span>
          </motion.div>

          <motion.div className="hero-v2-pills" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            {SKILL_PILLS.map(p => (
              <button key={p.label} className="hero-v2-pill" onClick={() => setPage(p.page)}>
                {p.icon} {p.label}
              </button>
            ))}
          </motion.div>
        </div>

        <motion.div className="hero-v2-visual" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <div className="hero-v2-showcase-card">
            <div className="hero-v2-showcase-dots">
              {SHOWCASES.map((s, i) => (
                <button key={s.id} className={`hero-v2-showcase-dot${i === activeIdx ? ' active' : ''}`} onClick={() => setActiveIdx(i)} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={active.id} className="hero-v2-showcase-body" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35 }}>
                <span className="hero-v2-showcase-badge">{active.badge}</span>
                <h3 className="hero-v2-showcase-title">{active.title}</h3>
                <p className="hero-v2-showcase-desc">{active.desc}</p>
                <button className="btn btn-primary hero-v2-showcase-cta" onClick={() => setPage(active.ctaPage)}>
                  {active.cta}
                </button>
              </motion.div>
            </AnimatePresence>

            {active.id === 'mock' && (
              <motion.div className="hero-v2-mock-preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                <div className="hero-v2-mock-bar"><span>Mock Exam 1</span><span className="hero-v2-mock-timer">⏱ 49:23</span></div>
                <div className="hero-v2-mock-q">
                  <div className="hero-v2-mock-qtext">1. What is the main purpose?</div>
                  <div className="hero-v2-mock-opts">
                    <div className="hero-v2-mock-opt">A. To request a meeting</div>
                    <div className="hero-v2-mock-opt hero-v2-mock-opt--selected">B. To propose a community project</div>
                    <div className="hero-v2-mock-opt">C. To file a complaint</div>
                    <div className="hero-v2-mock-opt">D. To offer congratulations</div>
                  </div>
                </div>
                <div className="hero-v2-mock-sections">
                  {['🎧 Listening', '📖 Reading', '✍️ Writing', '🎙️ Speaking'].map(s => (
                    <span key={s} className="hero-v2-mock-sec">{s}</span>
                  ))}
                </div>
              </motion.div>
            )}

            {active.id === 'ai' && (
              <motion.div className="hero-v2-ai-preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                <div className="hero-v2-ai-score-circle">
                  <span className="hero-v2-ai-big-score">9</span>
                  <span className="hero-v2-ai-of">/12</span>
                </div>
                <div className="hero-v2-ai-bars">
                  {[
                    { label: 'Coherence', score: 9, pct: 75 },
                    { label: 'Vocabulary', score: 8, pct: 67 },
                    { label: 'Grammar', score: 9, pct: 75 },
                    { label: 'Fulfillment', score: 10, pct: 83 },
                  ].map(b => (
                    <div key={b.label} className="hero-v2-ai-bar-row">
                      <span className="hero-v2-ai-bar-label">{b.label}</span>
                      <div className="hero-v2-ai-bar-track">
                        <motion.div className="hero-v2-ai-bar-fill" initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
                      </div>
                      <span className="hero-v2-ai-bar-score">{b.score}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {active.id === 'explain' && (
              <motion.div className="hero-v2-explain-preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
                <div className="hero-v2-explain-correct">
                  <span className="hero-v2-explain-check">✓</span>
                  <span>Correct!</span>
                </div>
                <p className="hero-v2-explain-text">
                  The answer is <strong>B</strong> because the email specifically mentions proposing a partnership for the community garden project...
                </p>
                <div className="hero-v2-explain-samples">
                  <div className="hero-v2-explain-sample-title">Sample Responses:</div>
                  <div className="hero-v2-explain-sample-pills">
                    <span className="hero-v2-explain-pill hero-v2-explain-pill--basic">Basic (CLB 5-6)</span>
                    <span className="hero-v2-explain-pill hero-v2-explain-pill--good">Good (CLB 7-8)</span>
                    <span className="hero-v2-explain-pill hero-v2-explain-pill--excellent">Excellent (CLB 9-10)</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div className="hero-v2-stats-strip" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
        {TRUST_STATS.map((s, i) => (
          <div key={s.label} className="hero-v2-stat">
            <span className="hero-v2-stat-icon">{s.icon}</span>
            <div>
              <div className="hero-v2-stat-value">{s.value}</div>
              <div className="hero-v2-stat-label">{s.label}</div>
            </div>
            {i < TRUST_STATS.length - 1 && <div className="hero-v2-stat-divider" />}
          </div>
        ))}
      </motion.div>
    </section>
  )
}
