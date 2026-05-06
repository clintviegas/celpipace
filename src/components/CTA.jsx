import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BRAND_NAME } from '../data/constants'

export default function CTA() {
  const navigate = useNavigate()
  return (
    <section className="hp-cta">
      <div className="hp-cta-inner">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="hp-cta-title">
            Start preparing for your CELPIP exam today.
          </h2>
          <p className="hp-cta-desc">
            Free access to practice sets across all four sections. No credit card required.
          </p>
          <div className="hp-cta-actions">
            <button className="btn btn-white btn-lg" onClick={() => navigate('/exam')}>
              Start Practicing Free
            </button>
            <button className="btn btn-ghost-white btn-lg" onClick={() => navigate('/calculator')}>
              Calculate My CRS Score →
            </button>
          </div>
          <p className="hp-cta-disclaimer">
            {BRAND_NAME} is an independent preparation platform and is not affiliated with
            Paragon Testing Enterprises or the official CELPIP® test.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
