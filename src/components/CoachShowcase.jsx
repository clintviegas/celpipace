import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Target, MessageCircle, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DEMO_PAIN = [
  { section: 'listening', label: 'L3 · Information', detail: 'Missing detail questions — 42% accuracy last 5 sets' },
  { section: 'writing', label: 'Coherence', detail: 'Paragraph transitions scored CLB 7 vs CLB 9 target' },
]

const DEMO_CHAT = [
  { role: 'user', text: 'What should I focus on this week to hit CLB 9?' },
  {
    role: 'coach',
    text: 'Your biggest gap is Listening L3 detail traps (−2 CLB). Do L3 Set 2 tomorrow, then one timed mock. Writing coherence is close — one W1 email with our structure checklist should lift you a band.',
  },
]

const BENEFITS = [
  { Icon: BarChart3, title: 'Reads your scores', desc: 'CLB bands, dimension breakdowns, and missed questions — not generic tips.' },
  { Icon: Target, title: 'Weekly focus', desc: 'Prioritized practice sets based on what will move your CRS the most.' },
  { Icon: MessageCircle, title: 'Ask anything', desc: '"Why is my listening stuck?" — grounded answers with next steps.' },
]

export default function CoachShowcase({ compact = false }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const goCoach = () => navigate('/study-coach')

  return (
    <section className={`hp-coach${compact ? ' hp-coach--compact' : ''}`} id="ai-coach">
      <div className="section-inner">
        <motion.div
          className="hp-coach-badge"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Sparkles size={14} /> New · AI Study Coach
        </motion.div>

        <div className="hp-coach-layout">
          <motion.div
            className="hp-coach-copy"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <h2 className="section-title hp-coach-title">
              A coach that knows <span className="highlight">your</span> weak spots
            </h2>
            <p className="hp-coach-lead">
              Most prep sites give everyone the same advice. CELPIPAce Study Coach reads your practice history —
              scores, mistakes, and CLB gaps — then tells you exactly what to drill next.
            </p>

            <ul className="hp-coach-benefits">
              {BENEFITS.map(({ Icon, title, desc }) => (
                <li key={title}>
                  <span className="hp-coach-benefit-icon" aria-hidden="true"><Icon size={18} /></span>
                  <div>
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hp-coach-ctas">
              <button type="button" className="btn btn-primary btn-lg" onClick={goCoach}>
                {user ? 'Open your coach' : 'Try coach free — sign in'}
              </button>
              <span className="hp-coach-note">5 free messages/week · Premium unlimited</span>
            </div>
          </motion.div>

          <motion.div
            className="hp-coach-demo"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            aria-hidden="true"
          >
            <div className="hp-coach-demo-window">
              <div className="hp-coach-demo-bar">
                <span /><span /><span />
                <strong>Study Coach</strong>
              </div>
              <div className="hp-coach-demo-body">
                <div className="hp-coach-demo-sidebar">
                  <p className="hp-coach-demo-label">Pain points</p>
                  {DEMO_PAIN.map((p) => (
                    <div key={p.label} className="hp-coach-demo-pain">
                      <span className={`hp-coach-demo-tag hp-coach-demo-tag--${p.section}`}>{p.section}</span>
                      <strong>{p.label}</strong>
                      <small>{p.detail}</small>
                    </div>
                  ))}
                </div>
                <div className="hp-coach-demo-chat">
                  {DEMO_CHAT.map((m, i) => (
                    <div key={i} className={`hp-coach-demo-msg hp-coach-demo-msg--${m.role}`}>
                      {m.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
