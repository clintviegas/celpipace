import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const HERO_BADGE = '⭐ Trusted CELPIP Practice Platform'
const HERO_TITLE = 'Your Fastest Path to a 10+ CELPIP Score'
const HERO_SUB = 'AI-powered practice questions, instant scoring, and detailed feedback across all 4 CELPIP skills. Boost your CRS by up to 50 points.'

const SKILL_SECTIONS = [
  { icon: '🏆', label: 'Mock Exams', page: 'exam' },
  { icon: '🎧', label: 'Listening', page: 'listening' },
  { icon: '📖', label: 'Reading', page: 'reading' },
  { icon: '✍️', label: 'Writing', page: 'writing' },
  { icon: '🎙️', label: 'Speaking', page: 'speaking' },
]

const TRUST_BADGES = [
  { emoji: '📝', value: '200+', label: 'Practice Questions' },
  { emoji: '⭐', value: '4.9', label: 'Google Rating' },
  { emoji: '🏆', value: '20+', label: 'Mock Exams' },
  { emoji: '🤖', value: 'AI', label: 'Instant Scoring' },
]

const SHOWCASE_SLIDES = [
  {
    id: 'mock',
    badge: 'MOCK EXAMS',
    title: 'Practice That Feels Just Like the Real CELPIP',
    desc: 'Our mock exams match the official CELPIP format, timing, and difficulty. Practice all four skills in one sitting — with the same question types you will see on test day.',
    cta: 'Try Mock Exams →',
    ctaPage: 'exam',
    type: 'mock',
  },
  {
    id: 'ai',
    badge: 'AI SCORING',
    title: 'AI Feedback That Helps You Improve',
    desc: 'Get instant, detailed scoring on your Writing and Speaking responses. Our AI analyzes coherence, vocabulary, grammar, and task fulfillment — then shows you exactly what to fix.',
    cta: 'Try AI Scoring →',
    ctaPage: 'writing',
    type: 'ai',
  },
  {
    id: 'explain',
    badge: 'SMART LEARNING',
    title: 'Detailed Explanations for Every Question',
    desc: 'Don\'t just memorize answers — understand why. Every question includes clear explanations, sample answers at different CLB levels, and actionable tips.',
    cta: 'Try Practice Questions →',
    ctaPage: 'reading',
    type: 'explain',
  },
]

export default function Hero({ setPage }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [scoreData] = useState({
    clb: '9',
    maxClb: '12',
    skills: [
      { name: 'Coherence', score: 9, max: 12 },
      { name: 'Vocabulary', score: 8, max: 12 },
      { name: 'Grammar', score: 9, max: 12 },
      { name: 'Fulfillment', score: 10, max: 12 },
    ]
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(i => (i + 1) % SHOWCASE_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const currentSlide = SHOWCASE_SLIDES[activeSlide]

  return (
    <section className="hero-section-new" id="hero">
      {/* Background elements */}
      <div className="hero-bg-grid-new" />
      <div className="hero-glow-1" />
      <div className="hero-glow-2" />

      <div className="hero-inner-new">
        {/* Left: Hero Content */}
        <motion.div 
          className="hero-content-new"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="hero-badge-new"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="badge-pulse" />
            {HERO_BADGE}
          </motion.div>

          <motion.h1 
            className="hero-title-new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Your Fastest Path<br />to a <span className="score-highlight">10+</span> CELPIP Score
          </motion.h1>

          <motion.p 
            className="hero-subtitle-new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {HERO_SUB}
          </motion.p>

          <motion.div 
            className="hero-ctas-new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setPage('exam')}
            >
              Start My Free Practice →
            </button>
            <button 
              className="btn btn-outline btn-lg"
              onClick={() => setPage('calculator')}
            >
              Calculate My CRS Score
            </button>
          </motion.div>

          <motion.div 
            className="hero-social-proof-new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="avatar-stack">
              {['AK', 'MR', 'SL', 'JP', 'NW'].map((initials, i) => (
                <div 
                  key={initials} 
                  className="avatar"
                  style={{ zIndex: 5 - i, marginLeft: i > 0 ? '-12px' : 0 }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <span className="social-proof-text">Trusted by test-takers across Canada</span>
          </motion.div>

          {/* Quick Access Pills */}
          <motion.div 
            className="hero-quick-access-new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {SKILL_SECTIONS.map(section => (
              <button
                key={section.label}
                className="quick-access-pill"
                onClick={() => setPage(section.page)}
              >
                <span className="pill-icon">{section.icon}</span>
                <span className="pill-label">{section.label}</span>
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Interactive Showcase Carousel */}
        <motion.div 
          className="hero-visual-new"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="showcase-card-wrapper">
            {/* Carousel Dots */}
            <div className="carousel-dots">
              {SHOWCASE_SLIDES.map((slide, i) => (
                <button
                  key={slide.id}
                  className={`carousel-dot${i === activeSlide ? ' active' : ''}`}
                  onClick={() => setActiveSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Carousel Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                className="showcase-slide"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
              >
                <div className="slide-badge">{currentSlide.badge}</div>
                <h3 className="slide-title">{currentSlide.title}</h3>
                <p className="slide-description">{currentSlide.desc}</p>
                
                <button 
                  className="btn btn-primary"
                  onClick={() => setPage(currentSlide.ctaPage)}
                >
                  {currentSlide.cta}
                </button>

                {/* Preview Content */}
                {currentSlide.type === 'mock' && (
                  <motion.div 
                    className="preview-mock"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <div className="mock-header">
                      <span>Mock Exam 1</span>
                      <span className="mock-timer">⏱ 49:23</span>
                    </div>
                    <div className="mock-question">
                      <div className="mock-q-text">1. What is the main purpose?</div>
                      <div className="mock-options">
                        <div className="mock-opt">A. To request a meeting</div>
                        <div className="mock-opt selected">B. To propose a community project</div>
                        <div className="mock-opt">C. To file a complaint</div>
                        <div className="mock-opt">D. To offer congratulations</div>
                      </div>
                    </div>
                    <div className="mock-sections">
                      {['🎧 Listening', '📖 Reading', '✍️ Writing', '🎙️ Speaking'].map(s => (
                        <span key={s} className="mock-section-pill">{s}</span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentSlide.type === 'ai' && (
                  <motion.div 
                    className="preview-ai"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <div className="ai-score-circle">
                      <span className="ai-score-main">{scoreData.clb}</span>
                      <span className="ai-score-max">/{scoreData.maxClb}</span>
                    </div>
                    <div className="ai-score-bars">
                      {scoreData.skills.map((skill, i) => (
                        <div key={skill.name} className="ai-bar-row">
                          <span className="ai-bar-label">{skill.name}</span>
                          <div className="ai-bar-track">
                            <motion.div 
                              className="ai-bar-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${(skill.score / skill.max) * 100}%` }}
                              transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                            />
                          </div>
                          <div className="ai-bar-score">{skill.score}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentSlide.type === 'explain' && (
                  <motion.div 
                    className="preview-explain"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <div className="explain-correct">
                      <span className="explain-check">✓</span>
                      <span>Correct!</span>
                    </div>
                    <p className="explain-text">
                      The answer is <strong>B</strong> because the email specifically mentions proposing a partnership for the community garden project...
                    </p>
                    <div className="explain-samples">
                      <div className="explain-sample-label">Sample Responses:</div>
                      <div className="explain-sample-pills">
                        <span className="explain-pill basic">Basic (CLB 5-6)</span>
                        <span className="explain-pill good">Good (CLB 7-8)</span>
                        <span className="explain-pill excellent">Excellent (CLB 9-10)</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Quick Access Pills - Bottom Center */}
      <motion.div 
        className="hero-quick-access-bottom"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {SKILL_SECTIONS.map(section => (
          <button
            key={section.label}
            className="quick-access-pill"
            onClick={() => setPage(section.page)}
          >
            <span className="pill-icon">{section.icon}</span>
            <span className="pill-label">{section.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Trust Stats Bar */}
      <motion.div 
        className="hero-stats-bar-new"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {TRUST_BADGES.map((badge, i) => (
          <div key={badge.label} className="stat-item-new">
            <span className="stat-emoji">{badge.emoji}</span>
            <div className="stat-content">
              <div className="stat-value">{badge.value}</div>
              <div className="stat-label">{badge.label}</div>
            </div>
            {i < TRUST_BADGES.length - 1 && <div className="stat-divider" />}
          </div>
        ))}
      </motion.div>
    </section>
  )
}
