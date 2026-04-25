import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Tag, Sparkles, Zap, Crown, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/* ─────────────────────────────────────────────────────────────
   celpipAce — Pricing
   3 tiers, no auto-renewing yearly. One-time payments via Stripe.
───────────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: 'weekly',
    label: 'Weekly',
    icon: Zap,
    price: 12.99,
    original: 19.99,
    perMo: null,
    period: '/week',
    days: 7,
    save: '35% OFF',
    blurb: 'Best for last-minute test prep',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    icon: Sparkles,
    price: 24.99,
    original: 44.99,
    perMo: null,
    period: '/month',
    days: 30,
    save: '44% OFF',
    blurb: 'Most flexible, full study cycle',
  },
  {
    id: 'quarterly',
    label: 'Quarterly',
    icon: Crown,
    price: 49.99,
    original: 99.99,
    perMo: 16.66,
    period: '/3 months',
    days: 90,
    save: '50% OFF',
    blurb: 'Best value — like 3 months for the price of 2',
    popular: true,
  },
]

const PREMIUM_FEATURES = [
  'All 8 full Mock Exams',
  'All 344+ Sample Questions',
  'Unlimited AI Scoring',
  'CELPIP Courses & Study Guides',
  'CELPIP Vocabulary Bundles',
  'Score Tracker & Progress Dashboard',
  'Detailed Explanations for Every Question',
  'CLB-Level Sample Responses',
  'Priority Email Support',
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
    a: 'The free plan lets you try the first question from each section — Listening, Reading, Writing, and Speaking. It\'s a great way to explore celpipAce before upgrading. No credit card required.',
  },
  {
    q: 'Will I be auto-charged?',
    a: 'No. Every plan is a one-time purchase that grants access for the chosen window (7, 30 or 90 days). You\'ll never get a surprise charge — buy again only when you need more time.',
  },
  {
    q: 'Do you offer coupon codes?',
    a: 'Yes! New users receive a welcome coupon, and you can also enter a Stripe promotion code right at checkout. Look for the coupon banner on this page or check your welcome email.',
  },
  {
    q: 'Are there any limits on Premium?',
    a: 'No limits. Premium members get unlimited AI scoring, full access to all 8 mock exams, 344+ practice questions, courses, vocabulary bundles, and the progress dashboard.',
  },
  {
    q: 'Is there a money-back guarantee?',
    a: 'Yes — every plan comes with a 7-day money-back guarantee. If you\'re not satisfied, email us for a full refund.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'All major credit and debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay and Link — processed securely by Stripe. We never see or store your card details.',
  },
]

const fmt = (n) => `$${n.toFixed(2).replace(/\.00$/, '')}`

export default function Pricing({ onSignIn }) {
  const { user, isPremium, isAdmin, currentPlan, premiumExpiresAt, cancelAtPeriodEnd, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('quarterly')
  const [openFaq, setOpenFaq]   = useState(null)
  const [coupon, setCoupon]     = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponMsg, setCouponMsg] = useState('')
  const [couponBusy, setCouponBusy] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)
  const [checkoutMsg, setCheckoutMsg]   = useState('')
  const plan = PLANS.find(p => p.id === selected)

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
  }, [refreshProfile])

  const handleApplyCoupon = async () => {
    const code = coupon.trim().toUpperCase()
    if (!code) return
    if (!user) { onSignIn?.(); return }
    setCouponBusy(true)
    setCouponMsg('')
    try {
      const { data, error } = await supabase.rpc('redeem_coupon', { p_code: code })
      if (error) throw error
      if (data?.ok) {
        setCouponApplied(true)
        setCouponMsg('✅ Coupon applied! Premium unlocked.')
        await refreshProfile?.()
      } else {
        const msgs = {
          invalid_code: 'Invalid coupon code.',
          inactive: 'This coupon is no longer active.',
          exhausted: 'This coupon has reached its redemption limit.',
          already_redeemed: 'You have already redeemed this coupon.',
          not_authenticated: 'Please sign in to redeem a coupon.',
        }
        setCouponMsg(msgs[data?.error] || 'Could not apply coupon.')
      }
    } catch (e) {
      setCouponMsg(e.message || 'Could not apply coupon.')
    } finally {
      setCouponBusy(false)
    }
  }

  const handleCheckout = async () => {
    if (!user) { onSignIn?.(); return }
    setCheckoutBusy(true)
    setCheckoutMsg('')
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selected,
          userId: user.id,
          email: user.email,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout')
      window.location.href = data.url
    } catch (e) {
      setCheckoutMsg(e.message || 'Could not start checkout. Please try again.')
      setCheckoutBusy(false)
    }
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
            <h2 style={{ fontSize: 32, marginBottom: 8 }}>You're on celpipAce Premium</h2>
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
          Pay once. Study with confidence.
        </motion.h2>
        <motion.p className="section-sub" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
          Try the first question in every section for free — no credit card required.<br />
          <strong>One-time payments only</strong> — no subscriptions, no surprise renewals.
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
            <div className="pricing-badge">⭐ celpipAce Premium</div>

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
                    {p.popular && <span className="plan-tile-ribbon">BEST VALUE</span>}
                    <Icon size={18} className="plan-tile-icon" />
                    <div className="plan-tile-name">{p.label}</div>
                    <div className="plan-tile-price">{fmt(p.price)}</div>
                    <div className="plan-tile-period">{p.period}</div>
                    {p.perMo && (
                      <div className="plan-tile-permo">≈ {fmt(p.perMo)}/mo</div>
                    )}
                    <div className="plan-tile-save">{p.save}</div>
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
                  <span className="plan-summary-amount">{fmt(plan.price)}</span>
                  <span className="plan-summary-period">{plan.period}</span>
                  <span className="plan-summary-strike">{fmt(plan.original)}</span>
                </div>
                <div className="plan-summary-blurb">{plan.blurb}</div>
              </motion.div>
            </AnimatePresence>

            <button
              className="btn pricing-cta pricing-cta-green"
              onClick={handleCheckout}
              disabled={checkoutBusy}
            >
              {checkoutBusy ? 'Redirecting to checkout…' : `Get ${plan.label} Premium →`}
            </button>
            <p className="pricing-guarantee">
              🔒 Secure checkout by Stripe · 7-day money-back guarantee · No auto-renewal
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
              <strong>Have a coupon?</strong> Redeem it here for instant Premium, or use a Stripe promotion code at checkout.
            </div>
            <div className="pricing-coupon-form">
              <input
                type="text"
                className="pricing-coupon-input"
                placeholder="Enter coupon code"
                value={coupon}
                onChange={e => { setCoupon(e.target.value); setCouponApplied(false) }}
              />
              <button className="pricing-coupon-btn" onClick={handleApplyCoupon} disabled={!coupon.trim() || couponBusy}>
                {couponBusy ? 'Applying…' : 'Apply'}
              </button>
            </div>
            {couponApplied && <span className="pricing-coupon-success">✓ Premium unlocked</span>}
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
