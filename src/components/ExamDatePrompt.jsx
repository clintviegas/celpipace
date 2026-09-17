import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

/* ─────────────────────────────────────────────────────────────
   First-run prompt on the dashboard: "When is your test?"

   The homepage already has an exam-date capture, but it's below the fold,
   desktop-only, and optional — 1 of 122 profiles had a date set. Everything
   date-driven (countdown emails, study plan, "days left") is dead without it.

   This asks once, on the page every signed-in user lands on, and then sends
   them straight into a Speaking task — the section 54% of practice happens in —
   instead of leaving them on a menu.
───────────────────────────────────────────────────────────── */

const SKIP_KEY = 'celpipace_exam_date_skipped'
const FIRST_TASK = '/celpip-speaking-practice/S1'

function todayISO() { return new Date().toISOString().slice(0, 10) }
function maxISO() { const d = new Date(); d.setMonth(d.getMonth() + 18); return d.toISOString().slice(0, 10) }

function readSkipped() {
  try { return window.localStorage.getItem(SKIP_KEY) === '1' } catch { return false }
}

export default function ExamDatePrompt() {
  const navigate = useNavigate()
  const { profile, refreshProfile } = useAuth()
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [skipped, setSkipped] = useState(readSkipped)

  // Profile not loaded yet, already has a date, or chose "not booked" on this device.
  if (!profile || profile.exam_date || skipped) return null

  const save = async (e) => {
    e.preventDefault()
    if (!date) return
    setBusy(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/on-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ examDate: date }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error === 'exam_date_out_of_range' ? 'Pick a date between today and 18 months from now.' : 'Could not save your exam date.')
      }
      await refreshProfile?.()
      navigate(FIRST_TASK)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const skip = () => {
    try { window.localStorage.setItem(SKIP_KEY, '1') } catch { void 0 }
    setSkipped(true)
    navigate(FIRST_TASK)
  }

  return (
    <motion.form
      className="db-next-action db-exam-prompt"
      onSubmit={save}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ flexWrap: 'wrap', borderColor: 'var(--red, #C8102E)', borderWidth: 2 }}
    >
      <div className="db-next-action-left" style={{ flex: '1 1 260px' }}>
        <span className="db-next-action-icon" aria-hidden="true">📅</span>
        <div>
          <span className="db-next-action-label">One question first</span>
          <span className="db-next-action-text">When is your CELPIP test? We&apos;ll plan backwards from it.</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor="db-exam-date" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Test date</label>
        <input
          id="db-exam-date"
          type="date"
          value={date}
          min={todayISO()}
          max={maxISO()}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 99, fontSize: '0.9rem', fontFamily: 'inherit' }}
        />
        <button type="submit" className="db-next-action-btn" disabled={!date || busy}>
          {busy ? 'Saving…' : 'Save & start speaking →'}
        </button>
        <button
          type="button"
          onClick={skip}
          disabled={busy}
          style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', padding: '8px 4px' }}
        >
          Not booked yet
        </button>
      </div>
      {error && <span role="alert" style={{ flexBasis: '100%', color: '#b91c1c', fontSize: '0.85rem' }}>{error}</span>}
    </motion.form>
  )
}
