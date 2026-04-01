import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function CTA() {
  const navigate = useNavigate()
  return (
    <section className="cta-section">
      <div className="cta-inner">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="cta-flag">🇨🇦</div>
          <h2 className="cta-title">
            Your Canadian PR journey<br />starts with your CELPIP score.
          </h2>
          <p className="cta-sub">
            Join thousands of Express Entry applicants who boosted their CRS with CELPIPiQ.
            Start free — no credit card required.
          </p>
          <div className="cta-actions">
            <button className="btn btn-white btn-lg" onClick={() => navigate('/practice')}>Start Practicing Free</button>
            <button className="btn btn-ghost-white btn-lg" onClick={() => navigate('/calculator')}>Calculate My CRS Boost →</button>
          </div>
          <p className="cta-disclaimer">
            CELPIPiQ is an independent preparation platform and is not affiliated with
            Paragon Testing Enterprises or the official CELPIP® test.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
