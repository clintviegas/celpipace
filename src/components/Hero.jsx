import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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

export default function Hero({ setPage }) {
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

        {/* Right: AI Scoring Card */}
        <motion.div 
          className="hero-visual-new"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="ai-scoring-card">
            <div className="card-header">
              <span className="card-badge">AI SCORING</span>
            </div>

            <div className="card-title-section">
              <h3 className="card-main-title">AI Feedback That Helps You Improve</h3>
            </div>

            <div className="card-content">
              <p className="card-description">
                Get instant, detailed scoring on your Writing and Speaking responses. Our AI analyzes coherence, vocabulary, grammar, and task fulfillment — then shows you exactly what to fix.
              </p>

              <button 
                className="btn btn-primary"
                onClick={() => setPage('writing')}
              >
                Try AI Scoring →
              </button>

              <div className="score-display">
                <div className="score-circle">
                  <span className="score-main">{scoreData.clb}</span>
                  <span className="score-max">/{scoreData.maxClb}</span>
                </div>

                <div className="score-bars">
                  {scoreData.skills.map((skill, i) => (
                    <div key={skill.name} className="score-bar-item">
                      <div className="bar-label">{skill.name}</div>
                      <div className="bar-track">
                        <motion.div 
                          className="bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${(skill.score / skill.max) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                        />
                      </div>
                      <div className="bar-score">{skill.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

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
