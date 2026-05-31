import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { PENDING_EXAM_DATE_KEY } from '../context/AuthContext'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function maxISO() {
  const d = new Date()
  d.setMonth(d.getMonth() + 18)
  return d.toISOString().slice(0, 10)
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const target = new Date(`${dateStr}T00:00:00`)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.round((target - now) / 86400000)
  return Number.isFinite(diff) ? diff : null
}

export default function ExamCountdownSignup({ onSignIn }) {
  const { user } = useAuth()
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [error, setError] = useState('')

  const remaining = useMemo(() => daysUntil(date), [date])

  async function persistForLoggedInUser() {
    const { supabase } = await import('../lib/supabase')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Not signed in')
    const res = await fetch('/api/on-signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ examDate: date }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Could not save your exam date.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!date) return
    setError('')

    if (user) {
      setStatus('saving')
      try {
        await persistForLoggedInUser()
        setStatus('saved')
      } catch (err) {
        setStatus('error')
        setError(err?.message || 'Something went wrong.')
      }
      return
    }

    // Logged out: stash the date and open the auth modal. AuthContext applies
    // the stored date to the profile right after the account is created.
    try { window.localStorage.setItem(PENDING_EXAM_DATE_KEY, date) } catch { void 0 }
    onSignIn?.()
  }

  return (
    <section className="hp-countdown" id="exam-countdown">
      <div className="hp-countdown-inner">
        <motion.div
          className="hp-countdown-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="hp-countdown-copy">
            <span className="hp-countdown-kicker">Test booked?</span>
            <h2>Get a countdown plan for your exam day</h2>
            <p>
              Tell us your CELPIP test date and we&apos;ll email you a focused study
              plan with timed reminders at 14, 7, 3 and 1 day out — so you peak
              exactly when it counts.
            </p>
            {remaining != null && remaining >= 0 && (
              <div className="hp-countdown-pill" aria-live="polite">
                <strong>{remaining}</strong> {remaining === 1 ? 'day' : 'days'} until your test
              </div>
            )}
          </div>

          {status === 'saved' ? (
            <div className="hp-countdown-success" role="status">
              <span className="hp-countdown-check" aria-hidden="true">✓</span>
              <p>Your exam date is saved. Watch your inbox for countdown reminders.</p>
            </div>
          ) : (
            <form className="hp-countdown-form" onSubmit={handleSubmit}>
              <label htmlFor="exam-date">Your CELPIP test date</label>
              <input
                id="exam-date"
                type="date"
                value={date}
                min={todayISO()}
                max={maxISO()}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-lg" disabled={!date || status === 'saving'}>
                {status === 'saving' ? 'Saving…' : user ? 'Save my exam date' : 'Get my countdown plan'}
              </button>
              {error && <span className="hp-countdown-error">{error}</span>}
              {!user && (
                <span className="hp-countdown-note">Free account — no credit card required.</span>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
