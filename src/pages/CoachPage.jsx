import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Send, Sparkles } from 'lucide-react'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../hooks/useProgress'
import { loadPlanConfig, fetchPlanConfigCloud, generatePlan } from '../lib/studyPlan'
import { fetchCoachDashboard, sendCoachMessage, formatSkillLabel } from '../lib/coachProfile'

const STARTER = {
  role: 'assistant',
  content: 'I\'m your CELPIP coach. I use your real practice scores and mistakes — ask what to focus on this week, why a section is weak, or how to reach your target CLB.',
}

const QUICK = [
  'What are my top 3 weaknesses right now?',
  'What should I practice this week?',
  'How far am I from my target CLB?',
  'Why do I keep missing listening questions?',
]

function PainPointCard({ point }) {
  const sectionColors = {
    listening: '#4A90D9',
    reading: '#2D8A56',
    writing: '#C8972A',
    speaking: '#C8102E',
  }
  const color = sectionColors[point.section] || '#555'
  return (
    <div className="coach-pain-card">
      <div className="coach-pain-top">
        <span className="coach-pain-badge" style={{ background: `${color}18`, color }}>{point.section || point.kind}</span>
        <span className="coach-pain-label">{formatSkillLabel(point.label)}</span>
      </div>
      <p className="coach-pain-detail">{point.detail}</p>
    </div>
  )
}

function FocusCard({ item }) {
  return (
    <div className="coach-focus-card">
      <div className="coach-focus-title">{item.title}</div>
      <p className="coach-focus-reason">{item.reason}</p>
      {item.href && (
        <Link to={item.href} className="coach-focus-link">Start practice →</Link>
      )}
    </div>
  )
}

export default function CoachPage() {
  const navigate = useNavigate()
  const { user, isPremium } = useAuth()
  const { stats } = useProgress()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [weeklyFocus, setWeeklyFocus] = useState([])
  const [usage, setUsage] = useState(null)
  const [warning, setWarning] = useState('')
  const [messages, setMessages] = useState([STARTER])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [chatError, setChatError] = useState('')
  const [planConfig, setPlanConfig] = useState(null)
  const messagesRef = useRef(null)

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const [dash, cfg] = await Promise.all([
          fetchCoachDashboard(),
          fetchPlanConfigCloud().then((c) => c || loadPlanConfig(user.id)),
        ])
        if (cancelled) return
        if (dash.error === 'sign_in_required') {
          setWarning('Sign in to use your personalized coach.')
          return
        }
        setProfile(dash.profile || { painPoints: [], sections: {}, dataRich: false })
        setWeeklyFocus(dash.weeklyFocus || [])
        setUsage(dash.usage)
        setPlanConfig(cfg)
        if (dash.profileWarning || dash.profile?.profileError) {
          setWarning(dash.profileWarning || 'Some profile data is still loading — chat works, and insights improve as you practice more.')
        }
      } catch (err) {
        if (!cancelled) {
          setProfile({ painPoints: [], sections: {}, dataRich: false })
          setWarning(err.message || 'Could not load your full coach profile. You can still chat below.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [user?.id])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, busy])

  const plan = planConfig ? generatePlan(planConfig, stats?.sections || {}) : null

  const send = async (text = draft) => {
    const content = text.trim()
    if (!content || busy || !user) return
    if (!isPremium && usage && usage.remaining === 0) {
      setChatError('Weekly free coach limit reached. Upgrade for unlimited coaching.')
      return
    }

    const next = [...messages, { role: 'user', content }]
    setMessages(next)
    setDraft('')
    setBusy(true)
    setChatError('')

    try {
      const data = await sendCoachMessage(next.slice(-10))
      if (data.limitReached) {
        setChatError(data.message)
        setUsage(data.usage)
        return
      }
      setMessages([...next, { role: 'assistant', content: data.reply }])
      if (data.usage) setUsage(data.usage)
      if (data.actions?.length) setWeeklyFocus(data.actions)
    } catch (err) {
      setChatError(err.message || 'Coach unavailable')
    } finally {
      setBusy(false)
    }
  }

  if (!user) {
    return (
      <div className="coach-page">
        <SEO title="AI Study Coach" description="Personalized CELPIP coaching based on your practice scores, mistakes, and CLB gaps." />
        <div className="coach-guest">
          <header className="coach-guest-head">
            <Sparkles size={36} strokeWidth={1.5} />
            <h1>Your CELPIP Study Coach</h1>
            <p>
              Not a generic chatbot. This coach reads <strong>your</strong> practice scores, dimension weaknesses,
              and missed questions — then builds a weekly focus and answers &ldquo;what should I study next?&rdquo;
            </p>
          </header>

          <div className="coach-guest-grid">
            <div className="coach-guest-card">
              <h2>What it does</h2>
              <ul>
                <li>Surfaces pain points (e.g. Listening L3 detail traps, Writing coherence)</li>
                <li>Suggests specific practice sets — not vague advice</li>
                <li>Tracks how far you are from your target CLB</li>
                <li>Chat: ask why a section is weak or what to drill this week</li>
              </ul>
            </div>
            <div className="coach-guest-demo">
              <p className="coach-guest-demo-label">Example coach reply</p>
              <div className="coach-guest-msg coach-guest-msg--user">What are my top 3 weaknesses?</div>
              <div className="coach-guest-msg coach-guest-msg--coach">
                1) Listening L3 detail questions — 38% last 5 sets. Do L3 Set 2 tomorrow.
                2) Writing coherence — CLB 7 vs your CLB 9 target. One structured W1 email.
                3) Speaking S5 comparisons — you rush the second option. Slow down 10 sec before speaking.
              </div>
            </div>
          </div>

          <div className="coach-guest-cta">
            <button type="button" className="coach-cta" onClick={() => navigate('/dashboard')}>
              Sign in free to unlock your coach
            </button>
            <p className="coach-guest-note">5 free coach messages per week · Premium unlimited</p>
            <Link to="/practice" className="coach-guest-link">Or start practicing first →</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="coach-page">
      <SEO title="Study Coach" description="Personalized CELPIP coaching based on your practice data." />

      <header className="coach-header">
        <div>
          <h1 className="coach-title"><Sparkles size={22} /> Study Coach</h1>
          <p className="coach-subtitle">Grounded in your practice history — not generic tips.</p>
        </div>
        {usage && !usage.premium && (
          <div className="coach-usage-badge">
            {usage.remaining}/{usage.limit} messages left this week
          </div>
        )}
        {isPremium && <div className="coach-usage-badge coach-usage-badge--pro">Premium · unlimited</div>}
      </header>

      {loading && <div className="coach-loading">Loading your coach profile…</div>}
      {warning && <div className="coach-warning">{warning}</div>}

      {!loading && profile && (
        <div className="coach-grid">
          <aside className="coach-sidebar">
            <section className="coach-section">
              <h2>Pain points</h2>
              {!profile?.dataRich && (
                <p className="coach-hint">Complete a few scored sets so your coach can pinpoint weaknesses.</p>
              )}
              {(profile?.painPoints || []).length === 0 ? (
                <p className="coach-muted">No pain points yet — practice more sections to unlock insights.</p>
              ) : (
                profile.painPoints.map((p, i) => <PainPointCard key={`${p.kind}-${p.label}-${i}`} point={p} />)
              )}
            </section>

            <section className="coach-section">
              <h2>This week&apos;s focus</h2>
              {plan?.focusOrder?.[0] && (
                <p className="coach-plan-line">
                  Plan focus: <strong>{plan.focusOrder[0].label}</strong>
                  {plan.focusOrder[1] ? ` + ${plan.focusOrder[1].label}` : ''}
                </p>
              )}
              {weeklyFocus.length === 0 ? (
                <p className="coach-muted">Ask the coach what to practice next.</p>
              ) : (
                weeklyFocus.map((item, i) => <FocusCard key={`${item.title}-${i}`} item={item} />)
              )}
            </section>

            {profile?.sections && (
              <section className="coach-section">
                <h2>Section bands</h2>
                <div className="coach-bands">
                  {Object.entries(profile.sections).map(([sec, data]) => (
                    <div key={sec} className="coach-band-row">
                      <span className="coach-band-sec">{sec}</span>
                      <span className="coach-band-clb">CLB {data.latestCLB ?? '—'}</span>
                      {data.gapToTarget > 0 && (
                        <span className="coach-band-gap">−{data.gapToTarget} to target</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>

          <section className="coach-chat-panel">
            <div className="coach-chat-messages" ref={messagesRef}>
              {messages.map((m, i) => (
                <div key={i} className={`coach-chat-msg coach-chat-msg--${m.role}`}>{m.content}</div>
              ))}
              {busy && <div className="coach-chat-msg coach-chat-msg--assistant">Analyzing your data…</div>}
            </div>

            <div className="coach-quick-row">
              {QUICK.map((q) => (
                <button key={q} type="button" onClick={() => send(q)} disabled={busy}>{q}</button>
              ))}
            </div>

            {chatError && <div className="coach-chat-error">{chatError}</div>}
            {!isPremium && usage?.remaining === 0 && (
              <div className="coach-upsell">
                Free limit reached. <Link to="/pricing">Upgrade to Premium</Link> for unlimited coaching.
              </div>
            )}

            <form className="coach-chat-form" onSubmit={(e) => { e.preventDefault(); send() }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about your weaknesses, study plan, or next practice set…"
                maxLength={900}
                disabled={busy}
              />
              <button type="submit" disabled={busy || !draft.trim()} aria-label="Send">
                <Send size={18} />
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
