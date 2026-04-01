import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

const PREMIUM_FEATURES = [
  'All Mock Exams (20+)',
  'All Sample Questions (200+)',
  'Unlimited AI Scoring',
  'CELPIP Courses & Study Guides',
  'CELPIP Vocabulary Bundles',
  'Score Tracker & Progress Dashboard',
  'Detailed Explanations for Every Question',
  'CLB-Level Sample Responses',
  'Priority Email Support',
]

const BILLING = [
  { id: 'monthly',   label: 'Monthly',  price: 'CA$19.99', original: 'CA$29.99', save: '33% OFF', period: '/month' },
  { id: 'quarterly', label: 'Quarterly', price: 'CA$39.99', original: 'CA$59.99', save: '33% OFF', period: '/quarter', popular: true },
  { id: 'annual',    label: 'Annual',   price: 'CA$99.99', original: 'CA$239.88', save: '58% OFF', period: '/year' },
]

const FREE_FEATURES = [
  '14 Practice Questions',
  '1 Free Mock Exam Section',
  'Basic Score Feedback',
  'CLB to CRS Calculator',
]

const FAQS = [
  {
    q: 'What is CELPIPiQ Premium?',
    a: 'CELPIPiQ Premium gives you full access to all mock exams, AI-powered scoring on Writing and Speaking, 200+ practice questions with explanations, study guides, vocabulary bundles, and your personal progress dashboard.',
  },
  {
    q: 'Can I try CELPIPiQ for free before upgrading?',
    a: 'Yes! Our free plan includes 14 practice questions, 1 mock exam section, and basic score feedback. No credit card required to start.',
  },
  {
    q: 'Are there any limits on Premium usage?',
    a: 'No limits. Premium members get unlimited AI scoring on Writing and Speaking, unlimited access to all mock exams and question banks, and full course materials.',
  },
  {
    q: 'Does CELPIPiQ Premium auto-renew?',
    a: 'Plans auto-renew but can be cancelled anytime from your account settings. You will receive an email reminder before each renewal.',
  },
  {
    q: 'Will I get a receipt for my subscription?',
    a: 'Yes, a receipt is emailed to you immediately after payment and before each renewal date.',
  },
]

export default function Pricing({ onSignIn }) {
  const [billing, setBilling] = useState('quarterly')
  const [openFaq, setOpenFaq] = useState(null)
  const plan = BILLING.find(b => b.id === billing)

  return (
    <section className="pricing-section" id="pricing">
      <div className="section-inner">
        <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Simple Pricing
        </motion.div>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          Choose your plan
        </motion.h2>
        <motion.p className="section-sub" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
          Start free, upgrade when you're ready. 7-day money-back guarantee on all plans.
        </motion.p>

        {/* Billing toggle */}
        <motion.div
          className="pricing-toggle"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {BILLING.map(b => (
            <button
              key={b.id}
              className={`pricing-toggle-btn${billing === b.id ? ' active' : ''}`}
              onClick={() => setBilling(b.id)}
            >
              {b.label}
              {b.save && <span className="pricing-toggle-save">{b.save}</span>}
            </button>
          ))}
        </motion.div>

        {/* Pricing cards */}
        <div className="pricing-grid pricing-grid-2">
          {/* Free card */}
          <motion.div
            className="pricing-card"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="pricing-name">Free</div>
            <div className="pricing-price">CA$0<span className="pricing-period"> forever</span></div>
            <p className="pricing-desc">Start practicing today — no credit card required.</p>
            <button className="btn btn-outline pricing-cta" onClick={onSignIn}>Get Started Free</button>
            <ul className="pricing-features">
              {FREE_FEATURES.map(f => (
                <li key={f}>
                  <Check size={15} className="check-icon" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Premium card */}
          <motion.div
            className="pricing-card pricing-card-featured"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="pricing-badge">⭐ CELPIPiQ Premium</div>
            <AnimatePresence mode="wait">
              <motion.div
                key={billing}
                className="pricing-price-block"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="pricing-price">
                  {plan.price}<span className="pricing-period">{plan.period}</span>
                </div>
                <div className="pricing-original">{plan.original}</div>
              </motion.div>
            </AnimatePresence>
            <p className="pricing-desc">Full access to everything you need to reach CLB 10 and maximize your CRS score.</p>
            <button className="btn btn-primary pricing-cta" onClick={onSignIn}>Upgrade to Premium</button>
            <p className="pricing-guarantee">🔒 7 days money-back guarantee</p>
            <ul className="pricing-features">
              {PREMIUM_FEATURES.map(f => (
                <li key={f}>
                  <Check size={15} className="check-icon" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Social proof below plans */}
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
            Trusted by <strong>90,000+</strong> test takers · <strong>⭐ 4.9</strong> on Google Reviews
          </span>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          className="pricing-faq"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="pricing-faq-title">CELPIPiQ Premium FAQ</h3>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`faq-item${openFaq === i ? ' open' : ''}`}
            >
              <button
                className="faq-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
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
