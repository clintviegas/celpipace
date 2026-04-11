import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Tag } from 'lucide-react'

const PLANS = [
  { id: 'weekly',    label: 'Weekly',    price: '$12.99', original: '$19.99', save: '35% OFF', period: '/week' },
  { id: 'monthly',   label: 'Monthly',   price: '$19.99', original: '$29.99', save: '33% OFF', period: '/month' },
  { id: 'quarterly', label: 'Quarterly', price: '$39.99', original: '$59.99', save: '33% OFF', period: '/quarter', popular: true },
  { id: 'annual',    label: 'Annual',    price: '$99.99', original: '$239.88', save: '58% OFF', period: '/year' },
]

const PREMIUM_FEATURES = [
  'All Mock Exams (8 full tests)',
  'All Sample Questions (344+)',
  'Unlimited AI Scoring',
  'CELPIP Courses & Study Guides',
  'CELPIP Vocabulary Bundles',
  'Score Tracker & Progress Dashboard',
  'Detailed Explanations for Every Question',
  'CLB-Level Sample Responses',
  'Priority Support',
]

const FREE_SECTIONS = [
  { icon: '🎧', section: 'Listening', desc: '1st question free' },
  { icon: '📖', section: 'Reading',   desc: '1st question free' },
  { icon: '✍️', section: 'Writing',   desc: '1st question free' },
  { icon: '🎤', section: 'Speaking',  desc: '1st question free' },
]

const FAQS = [
  {
    q: 'What do I get with the free plan?',
    a: 'The free plan lets you try the first question from each section — Listening, Reading, Writing, and Speaking. It\'s a great way to explore CELPIPiQ before upgrading. No credit card required.',
  },
  {
    q: 'Do you offer coupon codes?',
    a: 'Yes! New users receive a welcome coupon for an extra discount. Look out for the coupon banner on this page or check your welcome email after signing up.',
  },
  {
    q: 'Are there any limits on Premium?',
    a: 'No limits. Premium members get unlimited AI scoring, full access to all 8 mock exams, 344+ practice questions, courses, vocabulary bundles, and the progress dashboard.',
  },
  {
    q: 'Does my plan auto-renew?',
    a: 'Plans auto-renew but can be cancelled anytime from your account settings. You\'ll receive an email reminder before each renewal.',
  },
  {
    q: 'Is there a money-back guarantee?',
    a: 'Yes — all plans come with a 7-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
  },
]

export default function Pricing({ onSignIn }) {
  const [selected, setSelected] = useState('quarterly')
  const [openFaq, setOpenFaq] = useState(null)
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const plan = PLANS.find(p => p.id === selected)

  const handleApplyCoupon = () => {
    if (coupon.trim().length > 0) setCouponApplied(true)
  }

  return (
    <section className="pricing-section" id="pricing">
      <div className="section-inner">
        {/* Header */}
        <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Simple, Transparent Pricing
        </motion.div>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          Start free. Upgrade anytime.
        </motion.h2>
        <motion.p className="section-sub" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
          Try the first question in every section for free — no credit card required.<br />
          Unlock everything with Premium when you're ready.
        </motion.p>

        {/* Two-column cards */}
        <div className="pricing-grid pricing-grid-2">
          {/* ── Free card ── */}
          <motion.div
            className="pricing-card"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="pricing-name">Free</div>
            <div className="pricing-price">$0<span className="pricing-period"> forever</span></div>
            <p className="pricing-desc">Explore each section with the first question free.</p>
            <button className="btn btn-outline pricing-cta" onClick={onSignIn}>Get Started Free</button>

            <div className="pricing-free-sections">
              {FREE_SECTIONS.map(s => (
                <div key={s.section} className="pricing-free-row">
                  <span className="pricing-free-icon">{s.icon}</span>
                  <span className="pricing-free-label">{s.section}</span>
                  <span className="pricing-free-limit">{s.desc}</span>
                </div>
              ))}
            </div>

            <ul className="pricing-features" style={{ marginTop: 20 }}>
              <li><Check size={15} className="check-icon" />Basic Score Feedback</li>
              <li><Check size={15} className="check-icon" />CLB to CRS Calculator</li>
            </ul>
          </motion.div>

          {/* ── Premium card ── */}
          <motion.div
            className="pricing-card pricing-card-featured"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="pricing-badge">⭐ CELPIPiQ Premium</div>

            {/* Plan selector (radio-button style) */}
            <div className="pricing-plan-selector">
              {PLANS.map(p => (
                <button
                  key={p.id}
                  className={`pricing-plan-option${selected === p.id ? ' active' : ''}`}
                  onClick={() => setSelected(p.id)}
                >
                  <span className={`pricing-plan-radio${selected === p.id ? ' checked' : ''}`} />
                  <span className="pricing-plan-label">{p.label}</span>
                  <span className="pricing-plan-price">{p.price}<span className="pricing-plan-per">{p.period}</span></span>
                  {p.save && <span className="pricing-plan-save">{p.save}</span>}
                  {p.popular && <span className="pricing-plan-popular">POPULAR</span>}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                className="pricing-price-block"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="pricing-price">
                  {plan.price}<span className="pricing-period">{plan.period}</span>
                </div>
                <div className="pricing-original">
                  <span style={{ textDecoration: 'line-through' }}>{plan.original}</span>
                  <span className="pricing-save-tag">{plan.save}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            <p className="pricing-desc">Full access to everything you need to reach CLB 10+.</p>
            <button className="btn pricing-cta pricing-cta-green" onClick={onSignIn}>Upgrade to Premium</button>
            <p className="pricing-guarantee">🔒 7-day money-back guarantee</p>

            <ul className="pricing-features">
              {PREMIUM_FEATURES.map(f => (
                <li key={f}><Check size={15} className="check-icon" />{f}</li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Coupon code banner */}
        <motion.div
          className="pricing-coupon"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="pricing-coupon-inner">
            <Tag size={20} className="pricing-coupon-icon" />
            <div className="pricing-coupon-text">
              <strong>New user?</strong> Use a coupon code for an extra discount on any plan!
            </div>
            <div className="pricing-coupon-form">
              <input
                type="text"
                className="pricing-coupon-input"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={e => { setCoupon(e.target.value); setCouponApplied(false) }}
              />
              <button className="pricing-coupon-btn" onClick={handleApplyCoupon} disabled={!coupon.trim()}>
                Apply
              </button>
            </div>
            {couponApplied && <span className="pricing-coupon-success">✓ Coupon applied at checkout</span>}
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="pricing-social-proof"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="pricing-avatars">
            {['MR', 'ST', 'MK', 'EA', 'RQ'].map((init, i) => (
              <div key={init} className="pricing-avatar" style={{ marginLeft: i > 0 ? '-10px' : 0 }}>
                {init}
              </div>
            ))}
          </div>
          <span className="pricing-social-text">
            Trusted by CELPIP test-takers worldwide · <strong>7-day money-back guarantee</strong>
          </span>
        </motion.div>

        {/* FAQ */}
        <motion.div
          className="pricing-faq"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="pricing-faq-title">Frequently Asked Questions</h3>
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item${openFaq === i ? ' open' : ''}`}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <span className="faq-chevron">{openFaq === i ? '▲' : '▼'}</span>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
