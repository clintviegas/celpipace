import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Sparkles, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BRAND_NAME, PRODUCT_STATS } from '../data/constants'

/* ─────────────────────────────────────────────────────────────
   UpgradeModal — elegant paywall prompt
   Shown inline when a user clicks a locked set
───────────────────────────────────────────────────────────── */
export default function UpgradeModal({ open, onClose, setNumber, sectionLabel = 'Practice' }) {
  const navigate = useNavigate()

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
                <Lock size={26} strokeWidth={2.5} />
              </div>
            </div>

            <div className="upg-eyebrow">
              <Sparkles size={14} />
              Premium Content
            </div>

            <h2 className="upg-title">
              {setNumber ? `Set ${setNumber} is locked` : 'This content is locked'}
            </h2>
            <p className="upg-sub">
              You&rsquo;re on the free plan. Unlock every {sectionLabel.toLowerCase()} set, all 8 mock exams,
              and unlimited real-time scoring with {BRAND_NAME} Premium.
            </p>

            <ul className="upg-perks">
              <li><Check size={16} /> Every set across Listening, Reading, Writing & Speaking</li>
              <li><Check size={16} /> All {PRODUCT_STATS.mockExams} full-length mock exams</li>
              <li><Check size={16} /> Unlimited real-time scoring &amp; detailed feedback</li>
              <li><Check size={16} /> Progress tracker &amp; model CLB responses</li>
            </ul>

            <div className="upg-actions">
              <button className="upg-btn-primary" onClick={() => { onClose?.(); navigate('/pricing') }}>
                Unlock Premium →
              </button>
              <button className="upg-btn-ghost" onClick={onClose}>
                Maybe later
              </button>
            </div>

            <div className="upg-footer">
              Have a coupon? Redeem it on the pricing page.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
