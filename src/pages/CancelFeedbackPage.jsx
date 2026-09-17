import { useEffect, useState } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'
import SEO from '../components/SEO'
import CelpipAceLogo from '../components/CelpipAceLogo'
import { SUPPORT_EMAIL } from '../data/constants'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// Public, email-linked churn survey. Posts to /api/contact — the existing
// support pipeline — so this needs no new serverless function (we are at the
// Vercel Hobby 12-function cap). Support inbox gets:
//   Subject: "CELPIPACE Cancellation reason: <reason>"
const NAVY = '#0F1F3D'
const RED  = '#D91B1B'

const REASONS = [
  { id: 'passed',      label: 'I already took my exam',        hint: "I got what I needed — I'm done" },
  { id: 'price',       label: 'Too expensive',                 hint: 'The price is more than I can justify' },
  { id: 'billing',     label: 'I was charged unexpectedly',    hint: 'A renewal or amount I did not expect' },
  { id: 'content',     label: 'Not enough practice material',  hint: 'I ran out of useful content' },
  { id: 'realism',     label: "Didn't feel like the real exam", hint: 'Format or difficulty felt off' },
  { id: 'technical',   label: 'Technical problems',            hint: 'Things did not work properly' },
  { id: 'alternative', label: 'I found something better',      hint: 'I switched to another tool' },
  { id: 'other',       label: 'Something else',                hint: 'Tell me below' },
]

export default function CancelFeedbackPage() {
  const { user } = useAuth()
  const [reason, setReason]   = useState('')
  const [details, setDetails] = useState('')
  const [email, setEmail]     = useState(user?.email || '')
  const [sending, setSending] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  useEffect(() => {
    if (user?.email) setEmail((current) => current || user.email)
  }, [user?.email])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!reason || sending) return

    setSending(true)
    setError('')

    const picked = REASONS.find(r => r.id === reason)
    const message = [
      `Reason: ${picked?.label || reason}`,
      '',
      'Details:',
      details.trim() || '(none given)',
    ].join('\n')

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: 'Cancellation reason',
          section: picked?.label || 'Other',
          urgency: 'Normal',
          email: email.trim(),
          message,
        }),
      })

      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data.message || data.error || 'Could not send your answer.')
      setDone(true)
    } catch (err) {
      setError(err.message || 'Could not send your answer. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={S.page}>
      <SEO
        title="Why did you cancel?"
        description="Tell us why you cancelled your CELPIPACE subscription. Takes about 30 seconds."
        noindex
      />
      {/* Scoped so this standalone page carries its own animation + focus styles. */}
      <style>{`
        @keyframes cfSpin { to { transform: rotate(360deg); } }
        .cf-opt:hover { border-color: #B9C6DA; }
        .cf-opt:focus-within { border-color: ${NAVY}; box-shadow: 0 0 0 3px rgba(15,31,61,0.12); }
        .cf-in:focus { outline: none; border-color: ${NAVY}; box-shadow: 0 0 0 3px rgba(15,31,61,0.12); }
        .cf-submit:not(:disabled):hover { background: #16305C; }
      `}</style>

      <main style={S.card}>
        <div style={S.logoRow}>
          <CelpipAceLogo height={34} />
        </div>

        {done ? (
          <div style={S.doneWrap} role="status" aria-live="polite">
            <CheckCircle2 size={44} color="#0E9F6E" aria-hidden="true" />
            <h1 style={S.doneTitle}>Thank you — that really helps.</h1>
            <p style={S.doneBody}>
              I read every one of these personally. If you asked for something that needs a reply,
              I&apos;ll get back to you at{' '}
              <strong style={{ color: NAVY }}>{email.trim() || 'your email'}</strong>.
            </p>
            <a href="/" style={S.doneLink}>Back to CELPIPACE</a>
          </div>
        ) : (
          <>
            <h1 style={S.title}>Why did you cancel?</h1>
            <p style={S.subtitle}>
              One question, about 30 seconds. It genuinely decides what I build next —
              and there&apos;s nothing to sign in for.
            </p>

            <form onSubmit={handleSubmit}>
              <fieldset style={S.fieldset}>
                <legend style={S.legend}>Pick the closest reason</legend>

                <div style={S.options}>
                  {REASONS.map((r) => {
                    const selected = reason === r.id
                    return (
                      <label
                        key={r.id}
                        className="cf-opt"
                        style={{ ...S.option, ...(selected ? S.optionSelected : null) }}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.id}
                          checked={selected}
                          onChange={() => setReason(r.id)}
                          style={S.radio}
                        />
                        <span>
                          <span style={{ ...S.optionLabel, color: selected ? NAVY : '#1B2A45' }}>
                            {r.label}
                          </span>
                          <span style={S.optionHint}>{r.hint}</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              <label style={S.field}>
                <span style={S.fieldLabel}>
                  Anything you&apos;d want changed? <span style={S.optional}>Optional</span>
                </span>
                <textarea
                  className="cf-in"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="The one thing that would have made you stay…"
                  style={S.textarea}
                />
              </label>

              <label style={S.field}>
                <span style={S.fieldLabel}>
                  Your email <span style={S.optional}>Optional — only if you want a reply</span>
                </span>
                <input
                  className="cf-in"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={S.input}
                />
              </label>

              {error && <p style={S.error} role="alert">{error}</p>}

              <button
                type="submit"
                className="cf-submit"
                disabled={!reason || sending}
                style={{ ...S.submit, ...(!reason || sending ? S.submitDisabled : null) }}
              >
                {sending
                  ? <><Loader2 size={18} style={S.spin} aria-hidden="true" /> Sending…</>
                  : <><Send size={18} aria-hidden="true" /> Send my answer</>}
              </button>

              <p style={S.footnote}>
                Prefer email? Write to{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} style={S.footLink}>{SUPPORT_EMAIL}</a>.
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  )
}

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F6F8FC 0%, #EEF2F8 100%)',
    padding: '32px 16px 56px',
    fontFamily: 'Inter, system-ui, sans-serif',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    background: '#fff',
    borderRadius: 18,
    padding: 'clamp(22px, 5vw, 36px)',
    boxShadow: '0 12px 40px rgba(15,31,61,0.10)',
    border: '1px solid #E3E9F2',
  },
  logoRow:  { marginBottom: 22 },
  title:    { margin: '0 0 8px', fontSize: 'clamp(23px, 5.2vw, 29px)', fontWeight: 800, color: NAVY, letterSpacing: '-0.02em', lineHeight: 1.2 },
  subtitle: { margin: '0 0 26px', fontSize: 15, lineHeight: 1.6, color: '#5A6784' },

  fieldset: { border: 0, padding: 0, margin: '0 0 22px' },
  legend:   { padding: 0, marginBottom: 10, fontSize: 13, fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.06em' },
  options:  { display: 'grid', gap: 9 },

  option: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '13px 15px',
    border: '1.5px solid #DDE4EF',
    borderRadius: 11,
    cursor: 'pointer',
    background: '#fff',
    transition: 'border-color .15s, background .15s',
  },
  optionSelected: { borderColor: NAVY, background: '#F4F7FC' },
  radio:       { marginTop: 3, width: 17, height: 17, accentColor: NAVY, flexShrink: 0, cursor: 'pointer' },
  optionLabel: { display: 'block', fontSize: 15, fontWeight: 600, lineHeight: 1.35 },
  optionHint:  { display: 'block', fontSize: 13, color: '#7A879F', marginTop: 2, lineHeight: 1.4 },

  field:      { display: 'block', marginBottom: 18 },
  fieldLabel: { display: 'block', fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 7 },
  optional:   { fontWeight: 400, fontSize: 12.5, color: '#8A96AD' },
  textarea: {
    width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit',
    color: '#1B2A45', border: '1.5px solid #DDE4EF', borderRadius: 11,
    resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5,
  },
  input: {
    width: '100%', padding: '12px 14px', fontSize: 15, fontFamily: 'inherit',
    color: '#1B2A45', border: '1.5px solid #DDE4EF', borderRadius: 11, boxSizing: 'border-box',
  },

  submit: {
    width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    padding: '15px 20px', fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
    color: '#fff', background: NAVY, border: 0, borderRadius: 11, cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(15,31,61,0.22)',
  },
  submitDisabled: { opacity: 0.45, cursor: 'not-allowed', boxShadow: 'none' },
  spin: { animation: 'cfSpin 1s linear infinite' },

  error:    { margin: '0 0 14px', padding: '11px 14px', background: '#FDECEC', border: `1px solid ${RED}33`, borderRadius: 9, color: RED, fontSize: 14 },
  footnote: { margin: '16px 0 0', fontSize: 13.5, color: '#7A879F', textAlign: 'center' },
  footLink: { color: NAVY, fontWeight: 600 },

  doneWrap:  { textAlign: 'center', padding: '18px 0 6px' },
  doneTitle: { margin: '16px 0 10px', fontSize: 23, fontWeight: 800, color: NAVY, letterSpacing: '-0.01em' },
  doneBody:  { margin: '0 0 24px', fontSize: 15, lineHeight: 1.65, color: '#5A6784' },
  doneLink:  { display: 'inline-block', padding: '12px 26px', background: NAVY, color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' },
}
