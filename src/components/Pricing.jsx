import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { PRICING_PLANS } from '../data/constants'

export default function Pricing() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="section-inner">
        <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Simple Pricing
        </motion.div>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          Invest in your score.<br />
          <span className="highlight">Your PR is worth it.</span>
        </motion.h2>
        <motion.p className="section-sub" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
          Every plan includes a money-back guarantee. No contracts, cancel anytime.
        </motion.p>

        <div className="pricing-grid">
          {PRICING_PLANS.map((p, i) => {
            const desc = p.name === 'Free'
              ? 'Start practicing today — no credit card required.'
              : p.name === 'Pro'
              ? 'Everything you need to reach CLB 9–10 and maximize your CRS score.'
              : 'Intensive prep designed to hit CLB 10 across all four skills.'
            const ctaCls = p.ctaStyle === 'primary' ? 'btn btn-primary pricing-cta'
                         : p.ctaStyle === 'gold'    ? 'btn btn-gold pricing-cta'
                         : 'btn btn-outline pricing-cta'
            const featured = p.badge === '🔥 Most Popular'
            return (
              <motion.div
                key={p.name}
                className={`pricing-card${featured ? ' pricing-card-featured' : ''}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {p.badge && <div className="pricing-badge">{p.badge}</div>}
                <div className="pricing-name">{p.name}</div>
                <div className="pricing-price">
                  {p.price}<span className="pricing-period">{p.period}</span>
                </div>
                <p className="pricing-desc">{desc}</p>
                <a href="#" className={ctaCls}>{p.cta}</a>
                <ul className="pricing-features">
                  {p.features.map(f => (
                    <li key={f}>
                      <Check size={15} className="check-icon" />
                      {f}
                    </li>
                  ))}
                  {(p.locked || []).map(f => (
                    <li key={f} style={{ opacity: 0.38 }}>
                      <X size={15} style={{ color: '#9CA3AF', flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
