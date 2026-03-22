import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

/* ─────────────────────────────────────────────────────────────
   AuthModal — premium split-panel login modal
   Props:
     isOpen  : boolean
     onClose : () => void
     reason  : string  (optional context message)
───────────────────────────────────────────────────────────── */
export default function AuthModal({ isOpen, onClose, reason }) {
  const { signInWithGoogle, signInWithMagicLink } = useAuth()

  const [view, setView]             = useState('main')   // 'main' | 'magic' | 'sent'
  const [email, setEmail]           = useState('')
  const [displayName, setDisplayName] = useState('')
  const [emailError, setEmailError] = useState('')
  const [sending, setSending]       = useState(false)

  const handleClose = () => {
    setView('main'); setEmail(''); setDisplayName(''); setEmailError(''); onClose()
  }

  const handleGoogle = () => { signInWithGoogle(); handleClose() }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    setEmailError('')
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError('Please enter a valid email address.'); return
    }
    setSending(true)
    const result = await signInWithMagicLink(email, displayName)
    setSending(false)
    if (result?.error) setEmailError(result.error)
    else setView('sent')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        /* Single backdrop div — flex centres the modal inside it */
        <motion.div
          className="auth-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          {/* Modal — split panel. stopPropagation so clicking inside doesn't close */}
          <motion.div
            className="auth-modal"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={e => e.stopPropagation()}
          >
            {/* ── Left panel — branding ── */}
            <div className="auth-panel-left">
              <div className="auth-panel-logo">🍁 CELPIPace</div>
              <div className="auth-panel-tagline">
                Your fastest path to<br />
                <span className="auth-panel-highlight">CLB 9+</span>
              </div>
              <div className="auth-panel-perks">
                {[
                  { icon: '📊', text: 'Track every score & CLB band' },
                  { icon: '🏆', text: '12 full-length mock tests' },
                  { icon: '⚡', text: 'Section drills, anytime' },
                  { icon: '🎯', text: 'CRS boost calculator' },
                ].map(p => (
                  <div key={p.text} className="auth-perk">
                    <span className="auth-perk-icon">{p.icon}</span>
                    <span>{p.text}</span>
                  </div>
                ))}
              </div>
              <div className="auth-panel-badge">Free to start · No credit card</div>
            </div>

            {/* ── Right panel — form ── */}
            <div className="auth-panel-right">
              <button className="auth-modal-close" onClick={handleClose} aria-label="Close">✕</button>

              <AnimatePresence mode="wait">

                {/* ── Main view ── */}
                {view === 'main' && (
                  <motion.div key="main" className="auth-form-wrap"
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22 }}>

                    {reason && <div className="auth-modal-reason">🔒 {reason}</div>}
                    <h2 className="auth-modal-title">Log in or Sign up</h2>
                    <p className="auth-modal-sub">Join free — no password ever required.</p>

                    {/* Google */}
                    <button className="auth-btn auth-btn--google" onClick={handleGoogle}>
                      <svg className="auth-btn-icon" viewBox="0 0 24 24" width="20" height="20">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>

                    <div className="auth-divider"><span>or use email</span></div>

                    {/* Email magic link */}
                    <button className="auth-btn auth-btn--email" onClick={() => setView('magic')}>
                      ✉️ &nbsp;Continue with Email
                    </button>

                    <p className="auth-modal-legal">
                      By continuing you agree to our <span className="auth-link">Terms</span> &amp; <span className="auth-link">Privacy Policy</span>.
                    </p>
                  </motion.div>
                )}

                {/* ── Magic link form ── */}
                {view === 'magic' && (
                  <motion.div key="magic" className="auth-form-wrap"
                    initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22 }}>

                    <button className="auth-back" onClick={() => { setView('main'); setEmailError('') }}>← Back</button>
                    <h2 className="auth-modal-title">Enter your details</h2>
                    <p className="auth-modal-sub">We'll send a magic link — no password needed.</p>

                    <form onSubmit={handleMagicLink} className="auth-magic-form">
                      <label className="auth-field-label">Your name</label>
                      <input
                        className="auth-email-input"
                        type="text"
                        placeholder="First name (optional)"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                      />
                      <label className="auth-field-label">Email address</label>
                      <input
                        className={`auth-email-input${emailError ? ' auth-email-input--error' : ''}`}
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailError('') }}
                        autoFocus
                      />
                      {emailError && <div className="auth-email-error">{emailError}</div>}
                      <button type="submit" className="auth-btn auth-btn--primary" disabled={sending}>
                        {sending ? 'Sending…' : '✉️ Send Magic Link'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* ── Sent ── */}
                {view === 'sent' && (
                  <motion.div key="sent" className="auth-form-wrap auth-sent"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}>
                    <div className="auth-sent-icon">📬</div>
                    <h2 className="auth-modal-title">Check your inbox!</h2>
                    <p className="auth-modal-sub">
                      Magic link sent to <strong>{email}</strong>.<br />
                      Click it to sign in instantly — no password.
                    </p>
                    <p className="auth-sent-note">
                      No email? Check spam or{' '}
                      <button className="auth-link-btn" onClick={() => setView('magic')}>try again</button>.
                    </p>
                    <button className="auth-btn auth-btn--outline" onClick={handleClose}>Close</button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}