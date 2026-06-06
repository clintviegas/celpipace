import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../hooks/useProgress'
import { supabase } from '../lib/supabase'
import {
  buildLearningPath,
  decorateProgress,
  tierForXp,
} from '../lib/learningPath'
import {
  loadJourneyLocal,
  saveJourneyLocal,
  saveJourneyCloud,
  fetchJourneyCloud,
  loadPathProgressLocal,
  savePathProgressLocal,
  savePathProgressCloud,
} from '../lib/studyPlan'

export default function LearningPathPage({ onSignIn }) {
  const navigate = useNavigate()
  const { user, isPremium } = useAuth()
  const { streak } = useProgress()

  const [journey, setJourney] = useState(undefined) // undefined = loading
  const [completed, setCompleted] = useState([])
  const [celebrate, setCelebrate] = useState(false)

  /* ── load journey + saved progress (cloud → local) ── */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const guestJourney = loadJourneyLocal(null)
      let j = loadJourneyLocal(user?.id || null) || guestJourney
      let prog = loadPathProgressLocal(user?.id || null)
      if (user?.id) {
        const cloud = await fetchJourneyCloud()
        if (cloud?.journey) {
          j = cloud.journey
        } else if (j) {
          // First sign-in after a guest preview → migrate journey to cloud.
          saveJourneyLocal(user.id, j)
          saveJourneyCloud(j)
        }
        if (cloud?.pathProgress) prog = cloud.pathProgress
      }
      if (cancelled) return
      setJourney(j || null)
      setCompleted(prog?.completed || [])
    })()
    return () => { cancelled = true }
  }, [user?.id])

  const path = useMemo(
    () => (journey ? buildLearningPath({ journey, isPremium }) : null),
    [journey, isPremium]
  )

  /* ── auto-detect completion from real practice attempts ── */
  useEffect(() => {
    if (!user?.id || !path) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('practice_attempts')
        .select('section, part_id')
        .eq('user_id', user.id)
      if (cancelled || !data) return
      const keys = new Set(data.map(a => `${a.section}:${a.part_id}`))
      const mockDone = data.some(a => a.section === 'mock')
      const auto = []
      path.steps.forEach(s => {
        if (s.kind === 'practice' && keys.has(`${s.sectionKey}:${s.partId}`)) auto.push(s.id)
        if (s.kind === 'mock' && mockDone) auto.push(s.id)
      })
      if (auto.length) {
        setCompleted(prev => {
          const merged = Array.from(new Set([...prev, ...auto]))
          if (merged.length !== prev.length) persist(merged)
          return merged
        })
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, path])

  const view = useMemo(
    () => (path ? decorateProgress(path.steps, { completed }) : null),
    [path, completed]
  )

  const persist = useCallback((nextCompleted) => {
    const xp = (path?.steps || [])
      .filter(s => nextCompleted.includes(s.id))
      .reduce((a, s) => a + s.xp, 0)
    const progress = { xp, completed: nextCompleted, updatedAt: new Date().toISOString() }
    savePathProgressLocal(user?.id || null, progress)
    if (user?.id) savePathProgressCloud(progress)
  }, [path, user?.id])

  const completeStep = useCallback((id) => {
    setCompleted(prev => {
      if (prev.includes(id)) return prev
      const next = [...prev, id]
      persist(next)
      if (path && next.length >= path.steps.length) setCelebrate(true)
      return next
    })
  }, [path, persist])

  function handleNode(step) {
    if (step.premium && !isPremium) { navigate('/pricing'); return }
    if (step.route && (step.kind === 'practice' || step.kind === 'mock')) {
      navigate(step.route)
      return
    }
    // review / rest → complete in place
    completeStep(step.id)
  }

  /* ── loading / empty states ── */
  if (journey === undefined) {
    return <main className="lp"><div className="lp-loading">Loading your path…</div></main>
  }
  if (!journey || !path) {
    return (
      <main className="lp">
        <SEO title="Your Learning Path" description="Your personalised, gamified CELPIP study path." canonical="/learning-path" />
        <div className="lp-empty">
          <div className="lp-empty-icon">🗺️</div>
          <h1>No plan yet</h1>
          <p>Build your personalised CELPIP plan in 30 seconds — then walk the path step by step.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>Build my plan →</button>
        </div>
      </main>
    )
  }

  const tier = tierForXp(view.earnedXp)
  const pct = Math.round((view.doneCount / path.steps.length) * 100)
  const xpPct = path.totalXp ? Math.round((view.earnedXp / path.totalXp) * 100) : 0

  return (
    <main className="lp">
      <SEO title="Your Learning Path" description="Your personalised, gamified CELPIP study path — step by step to your target score." canonical="/learning-path" />

      {/* HUD header */}
      <header className="lp-hud">
        <div className="lp-hud-inner">
          <div className="lp-tier">
            <span className="lp-tier-icon" aria-hidden="true">{tier.icon}</span>
            <div>
              <span className="lp-tier-name">{tier.name}</span>
              <span className="lp-tier-lvl">Level {tier.level}</span>
            </div>
          </div>

          <div className="lp-xp">
            <div className="lp-xp-top">
              <span><strong>{view.earnedXp}</strong> / {path.totalXp} XP</span>
              {tier.next && <span className="lp-xp-next">{tier.next.min - view.earnedXp} XP to {tier.next.name}</span>}
            </div>
            <div className="lp-xp-bar"><div className="lp-xp-fill" style={{ width: `${xpPct}%` }} /></div>
          </div>

          <div className="lp-stats">
            <div className="lp-stat"><span className="lp-stat-num">🔥 {streak?.current || 0}</span><span className="lp-stat-lbl">streak</span></div>
            <div className="lp-stat"><span className="lp-stat-num">{pct}%</span><span className="lp-stat-lbl">done</span></div>
            {path.daysLeft != null && (
              <div className={`lp-stat ${path.daysLeft <= 4 ? 'is-urgent' : ''}`}>
                <span className="lp-stat-num">{path.daysLeft}</span><span className="lp-stat-lbl">days left</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {!user && (
        <div className="lp-signup-banner">
          <span>You’re previewing as a guest — <strong>sign up to save your XP, streak & progress</strong> and get reminders.</span>
          <button className="btn btn-gold" onClick={() => onSignIn?.()}>Save my progress — free</button>
        </div>
      )}

      {path.weakest && (
        <p className="lp-intro">
          Your path attacks <strong style={{ color: path.weakest.color }}>{path.weakest.icon} {path.weakest.label}</strong> first —
          your biggest gap to CLB {path.target}. Tap each node to start.
        </p>
      )}

      {/* the path */}
      <div className="lp-track">
        {path.stages.map(stage => (
          <section key={stage.index} className="lp-stage">
            <div className="lp-stage-head">
              <span className="lp-stage-label">{stage.label}</span>
              <span className="lp-stage-goal">Goal · CLB {stage.milestoneCLB}</span>
            </div>
            <div className="lp-nodes">
              {stage.steps.map((rawStep) => {
                const step = view.steps.find(s => s.id === rawStep.id)
                const isCurrent = view.currentId === step.id
                const locked = step.premium && !isPremium
                const state = step.completed ? 'done' : isCurrent ? 'current' : locked ? 'locked' : 'todo'
                return (
                  <motion.div
                    key={step.id}
                    className={`lp-node lp-node--${state} ${step.boss ? 'lp-node--boss' : ''}`}
                    style={{ '--accent': step.color }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                  >
                    <button className="lp-node-btn" onClick={() => handleNode(step)}>
                      <span className="lp-node-orb">
                        <span className="lp-node-ico" aria-hidden="true">
                          {step.completed ? '✓' : locked ? '🔒' : step.icon}
                        </span>
                      </span>
                      <span className="lp-node-meta">
                        <span className="lp-node-title">{step.title}</span>
                        <span className="lp-node-sub">{step.sub}</span>
                        <span className="lp-node-tags">
                          <span className="lp-node-xp">+{step.xp} XP</span>
                          {locked && <span className="lp-node-premium">Premium</span>}
                          {step.boss && <span className="lp-node-boss">BOSS</span>}
                        </span>
                      </span>
                    </button>
                    {isCurrent && !step.completed && (step.kind === 'practice' || step.kind === 'mock') && (
                      <button className="lp-node-skip" onClick={() => completeStep(step.id)}>Mark done</button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="lp-footer">
        <button className="jh-link" onClick={() => navigate('/')}>← Rebuild my plan</button>
      </div>

      {celebrate && (
        <div className="lp-celebrate" role="dialog" onClick={() => setCelebrate(false)}>
          <motion.div className="lp-celebrate-card" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="lp-celebrate-emoji">🎉</div>
            <h2>Path complete!</h2>
            <p>You earned <strong>{view.earnedXp} XP</strong> and reached <strong>{tier.name}</strong>. You’re exam-ready — go ace it.</p>
            <button className="btn btn-primary btn-lg" onClick={() => setCelebrate(false)}>Keep going</button>
          </motion.div>
        </div>
      )}
    </main>
  )
}
