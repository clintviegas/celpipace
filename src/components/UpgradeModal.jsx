import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Sparkles, Check, X, Flame, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  BRAND_NAME,
  FREE_AI_SPEAKING_EVALS,
  FREE_AI_WRITING_EVALS,
  FREE_COACH_MESSAGES_WEEKLY,
  FREE_TIER_SUMMARY,
  PRODUCT_STATS,
} from '../data/constants'
import { PREMIUM_FEATURES, formatPlanPrice, getBillingPlan } from '../data/paymentPlans'
import { useAuth } from '../context/AuthContext'
import { daysUntil } from '../lib/studyPlan'
import { buildUpgradePaymentUrl } from '../lib/paymentDeepLink'

/* ─────────────────────────────────────────────────────────────
   UpgradeModal — paywall prompt for set locks and usage limits
───────────────────────────────────────────────────────────── */
export default function UpgradeModal({
  open,
  onClose,
  setNumber,
  sectionLabel = 'Practice',
  reason = 'set_lock',
  aiSection,
}) {
  const navigate = useNavigate()
  const { profile } = useAuth()

  const examDate = profile?.exam_date || null
  const daysLeft = examDate ? daysUntil(examDate) : null
  const showUrgency = daysLeft != null && daysLeft >= 0 && daysLeft <= 60
  const urgencyText = daysLeft === 0
    ? 'Your test is today — make this session count.'
    : daysLeft === 1
      ? 'Your test is tomorrow — make every set count.'
      : `Your test is in ${daysLeft} days — make every practice set count.`

  const monthlyPlan = getBillingPlan('monthly')
  const isAiLimit = reason === 'ai_limit'
  const isCoachLimit = reason === 'coach_limit'
  const sectionName = aiSection === 'speaking' ? 'Speaking' : aiSection === 'writing' ? 'Writing' : sectionLabel

  const title = isCoachLimit
    ? 'Weekly coach limit reached'
    : isAiLimit
      ? `Free ${sectionName} AI scores used up`
      : setNumber
        ? `Set ${setNumber} is locked`
        : 'This content is locked'

  const subtitle = isCoachLimit
    ? `You've used your ${FREE_COACH_MESSAGES_WEEKLY} free coach messages this week. Upgrade for unlimited coaching and every practice set.`
    : isAiLimit
      ? `You've used your ${aiSection === 'speaking' ? FREE_AI_SPEAKING_EVALS : FREE_AI_WRITING_EVALS} free ${sectionName.toLowerCase()} AI evaluations. Upgrade for unlimited real-time scoring.`
      : `You're on the free plan. Unlock every ${sectionLabel.toLowerCase()} set, all ${PRODUCT_STATS.mockExams} mock exams, and unlimited scoring with ${BRAND_NAME} Premium.`

  const checkoutUrl = buildUpgradePaymentUrl(profile, { reason })

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="upg-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="upg-modal"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="upg-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>

            <div className="upg-icon-wrap">
              <div className="upg-icon-halo" />
              <div className="upg-icon-circle">
                {isAiLimit || isCoachLimit ? <Zap size={26} strokeWidth={2.5} /> : <Lock size={26} strokeWidth={2.5} />}
              </div>
            </div>

            <div className="upg-eyebrow">
              <Sparkles size={14} />
              {isAiLimit || isCoachLimit ? 'Upgrade to keep going' : 'Premium Content'}
            </div>

            {showUrgency && (
              <div
                className="upg-urgency"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  justifyContent: 'center', margin: '4px auto 14px',
                  padding: '8px 14px', borderRadius: 999,
                  background: 'rgba(200,16,46,0.08)', color: '#C8102E',
                  fontSize: 13, fontWeight: 600, maxWidth: 'fit-content',
                }}
              >
                <Flame size={15} strokeWidth={2.5} />
                {urgencyText}
              </div>
            )}

            <h2 className="upg-title">{title}</h2>
            <p className="upg-sub">{subtitle}</p>

            {(isAiLimit || isCoachLimit) && (
              <p className="upg-sub" style={{ fontSize: 13, marginTop: -8, opacity: 0.85 }}>
                Free includes: {FREE_TIER_SUMMARY}
              </p>
            )}

            <ul className="upg-perks">
              {PREMIUM_FEATURES.slice(0, 4).map(f => (
                <li key={f}><Check size={16} /> {f}</li>
              ))}
              <li><Check size={16} /> From {formatPlanPrice(monthlyPlan.price)}/mo — cancel any time</li>
            </ul>

            <div className="upg-actions">
              <button
                className="upg-btn-primary"
                onClick={() => { onClose?.(); navigate(checkoutUrl) }}
              >
                Unlock Premium →
              </button>
              <button className="upg-btn-ghost" onClick={onClose}>
                Maybe later
              </button>
            </div>

            <div className="upg-footer">
              {(isAiLimit || isCoachLimit)
                ? 'CELPIP25 applies at checkout for first-time subscribers.'
                : 'Have a coupon? Enter it on the checkout page.'}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
