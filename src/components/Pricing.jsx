import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Tag, Sparkles, Zap, Crown, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { BRAND_NAME, PRODUCT_STATS } from '../data/constants'
import {
  BILLING_PLANS,
  PREMIUM_FEATURES,
  WELCOME_COUPON_CODE,
  WELCOME_DISCOUNT,
  formatPlanPrice,
} from '../data/paymentPlans'

/* ─────────────────────────────────────────────────────────────
  CELPIPACE — Pricing
  3 recurring subscription plans via Stripe.
───────────────────────────────────────────────────────────── */
const PLAN_ICONS = {
  weekly: Zap,
  monthly: Sparkles,
  annual: Crown,
}

const PLANS = BILLING_PLANS.map(plan => ({ ...plan, icon: PLAN_ICONS[plan.id] }))

const FREE_SECTIONS = [
  { icon: '🎧', section: 'Listening', desc: '1st question free' },
  { icon: '📖', section: 'Reading',   desc: '1st question free' },
  { icon: '✍️', section: 'Writing',   desc: '1st question free' },
  { icon: '🎤', section: 'Speaking',  desc: '1st question free' },
]

const FAQS = [
  {
    q: 'What do I get with the free plan?',
    a: `The free plan lets you try the first question from each section — Listening, Reading, Writing, and Speaking. It is a simple way to explore ${BRAND_NAME} before upgrading. No credit card required.`,
  },
  {
    q: 'Will I be auto-charged?',
    a: 'Yes. Premium plans are recurring subscriptions handled securely by Stripe. You can cancel any time from Manage Subscription, and access continues until the end of the paid billing period.',
  },
  {
    q: 'Do you offer coupon codes?',
    a: 'Yes! First-time subscribers can use CELPIP25 for 25% off their first subscription checkout. Other Stripe promotion codes can still be entered at checkout.',
  },
  {
    q: 'Are there any limits on Premium?',
    a: `No limits during your access window. Premium members get unlimited real-time scoring, full access to all ${PRODUCT_STATS.mockExams} mock exams, ${PRODUCT_STATS.questionItems} question items and prompts, courses, vocabulary bundles, and the progress dashboard.`,
  },
  {
    q: 'How do refunds work?',
    a: 'Refund requests are reviewed within 7 days of purchase for genuine billing or access issues. Substantial premium use, completed practice, or score dissatisfaction does not automatically qualify.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'All major credit and debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay and Link — processed securely by Stripe. We never see or store your card details.',
  },
]

export default function Pricing({ onSignIn, showFaq = true }) {
  const { user, isPremium, isAdmin, currentPlan, premiumExpiresAt, cancelAtPeriodEnd, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('annual')
  const [openFaq, setOpenFaq]   = useState(null)
  const [coupon, setCoupon]     = useState(WELCOME_COUPON_CODE)
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponMsg, setCouponMsg] = useState('')
  const [checkoutMsg, setCheckoutMsg]   = useState('')
  const plan = PLANS.find(p => p.id === selected)
  const discountPrice = couponApplied ? plan.price * (1 - WELCOME_DISCOUNT) : null

  /* Show success / cancel banner after returning from Stripe */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      setCheckoutMsg('✅ Payment received! Your premium access is being activated.')
      const t = setTimeout(() => refreshProfile?.(), 2000)
      return () => clearTimeout(t)
    }
    if (params.get('checkout') === 'cancelled') {
      setCheckoutMsg('Checkout cancelled. No charge was made.')
    }

    const incomingCoupon = params.get('coupon')?.trim().toUpperCase()
    if (incomingCoupon === WELCOME_COUPON_CODE) {
      setCoupon(WELCOME_COUPON_CODE)
      setCouponApplied(true)
      setCouponMsg('CELPIP25 is ready for Stripe checkout.')
    }
  }, [refreshProfile])

  const handleApplyCoupon = () => {
    const code = coupon.trim().toUpperCase()
    if (!code) return
    if (!user) { onSignIn?.(); return }
    setCouponMsg('')
    if (code !== WELCOME_COUPON_CODE) {
      setCouponApplied(false)
      setCouponMsg('Enter CELPIP25 here, or enter another Stripe promotion code during checkout.')
      return
    }
    setCouponApplied(true)
    setCouponMsg('CELPIP25 will be applied at Stripe checkout if this is your first subscription.')
  }

  const handleCheckout = async () => {
    if (!user) { onSignIn?.(); return }
    const params = new URLSearchParams({ plan: selected })
    if (couponApplied) params.set('coupon', WELCOME_COUPON_CODE)
    navigate(`/payment?${params.toString()}`)
  }

  // ── If the user is already premium, hide pricing tiles entirely and show
  // a Manage-Subscription card instead. (Spec: "Hide pricing section after
  // user subscribes, show Manage Subscription instead".)
  if (isPremium) {
    const expires = premiumExpiresAt
      ? new Date(premiumExpiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Never'
    return (
      <section className="pricing-section" id="pricing">
        <div className="section-inner" style={{ maxWidth: 720 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fff 60%)',
              borderRadius: 24, padding: 40, textAlign: 'center',
              boxShadow: '0 8px 32px rgba(245,158,11,0.12)',
            }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', marginBottom: 16,
            }}>
              <Crown size={32} color="#fff" />
            </div>
            <h2 style={{ fontSize: 32, marginBottom: 8 }}>You're on {BRAND_NAME} Premium</h2>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>
              {isAdmin
                ? 'Admin account — lifetime access.'
                : <>Plan: <strong style={{ textTransform: 'capitalize' }}>{currentPlan}</strong> · {cancelAtPeriodEnd ? 'Access ends' : 'Renews'} {expires}</>}
            </p>
            <button
              className="btn"
              onClick={() => navigate('/subscription')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Manage Subscription <ExternalLink size={16} />
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="pricing-section" id="pricing">
      <div className="section-inner">
        <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Simple, Transparent Pricing
        </motion.div>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          Subscribe. Study with confidence.
        </motion.h2>
        <motion.p className="section-sub" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
          Try the first question in every section for free — no credit card required.<br />
          <strong>Cancel any time</strong> through the secure Stripe billing portal.
        </motion.p>

        {checkoutMsg && (
          <div className={`pricing-toast${checkoutMsg.startsWith('✅') ? ' success' : ''}`}>
            {checkoutMsg}
          </div>
        )}

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

          {/* ── Premium card with new tile-style selector ── */}
          <motion.div
            className="pricing-card pricing-card-featured"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="pricing-badge"><span aria-hidden="true">⭐</span> {BRAND_NAME} Premium</div>

            <div className="plan-tiles" role="radiogroup" aria-label="Choose a plan">
              {PLANS.map(p => {
                const Icon = p.icon
                const active = selected === p.id
                return (
                  <button
                    key={p.id}
                    className={`plan-tile${active ? ' active' : ''}${p.popular ? ' popular' : ''}`}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelected(p.id)}
                    type="button"
                  >
                    {p.popular && <span className="plan-tile-ribbon">RECOMMENDED</span>}
                    <Icon size={18} className="plan-tile-icon" />
                    <div className="plan-tile-name">{p.label}</div>
                    <div className="plan-tile-price">{formatPlanPrice(p.price)}</div>
                    <div className="plan-tile-period">{p.period}</div>
                    {p.perMo && (
                      <div className="plan-tile-permo">≈ {formatPlanPrice(p.perMo)}/mo</div>
                    )}
                    <div className="plan-tile-save">{p.badge}</div>
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                className="plan-summary"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                <div className="plan-summary-price">
                  {couponApplied && <span className="plan-summary-strike">{formatPlanPrice(plan.price)}</span>}
                  <span className="plan-summary-amount">{formatPlanPrice(discountPrice || plan.price)}</span>
                  <span className="plan-summary-period">{plan.period}</span>
                </div>
                <div className="plan-summary-blurb">
                  {plan.blurb}{couponApplied ? ` · CELPIP25 saves 25% on this first checkout.` : ''}
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              className="btn pricing-cta pricing-cta-green"
              onClick={handleCheckout}
            >
              Continue with {plan.label} Premium
            </button>
            <p className="pricing-guarantee">
              <span aria-hidden="true">🔒</span> Secure checkout by Stripe · Recurring subscription · Cancel any time
              <br />Access continues until the end of your paid billing period after cancellation.
              <br />
              <button type="button" onClick={() => navigate('/terms')}>Terms &amp; Conditions</button>
              {' · '}
              <button type="button" onClick={() => navigate('/privacy')}>Privacy Policy</button>
              {' · '}
              <button type="button" onClick={() => navigate('/refund')}>Refund Policy</button>
            </p>

            <ul className="pricing-features">
              {PREMIUM_FEATURES.map(f => (
                <li key={f}><Check size={15} className="check-icon" />{f}</li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Coupon banner */}
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
              <strong>First-time offer: 25% off.</strong> Use <span className="pricing-coupon-code">CELPIP25</span> on your first subscription. The discount is verified and applied securely in Stripe.
            </div>
            <div className="pricing-coupon-form">
              <input
                type="text"
                className="pricing-coupon-input"
                placeholder="CELPIP25"
                value={coupon}
                onChange={e => { setCoupon(e.target.value); setCouponApplied(false) }}
              />
              <button className="pricing-coupon-btn" onClick={handleApplyCoupon} disabled={!coupon.trim()}>
                Apply
              </button>
            </div>
            {couponApplied && <span className="pricing-coupon-success">✓ CELPIP25 ready for checkout</span>}
            {!couponApplied && couponMsg && <span className="pricing-coupon-success" style={{ color: '#C8102E' }}>{couponMsg}</span>}
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
            Trusted by CELPIP test-takers worldwide · <strong>Secure Stripe checkout and self-serve billing</strong>
          </span>
        </motion.div>

        {showFaq && (
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
        )}
      </div>
    </section>
  )
}
