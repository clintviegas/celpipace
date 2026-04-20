/* ══════════════════════════════════════════════════════════════
   useProgress — live progress tracker
   Persists to localStorage, syncs across tabs via storage event.
   Tracks: completed sets, scores, streaks, activity feed.
══════════════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'celpipiq_progress'
const STREAK_KEY  = 'celpipiq_streak'

/* ── Section totals (sets × questions) ── */
const SECTION_TOTALS = {
  listening: { sets: 120, questions: 760, parts: { L1: 20, L2: 20, L3: 20, L4: 20, L5: 20, L6: 20 } },
  reading:   { sets: 46,  questions: 430, parts: { R1: 15, R2: 15, R3: 15, R4: 1 } },
  writing:   { sets: 40,  questions: 40,  parts: { W1: 20, W2: 20 } },
  speaking:  { sets: 120, questions: 120, parts: { S1: 15, S2: 15, S3: 15, S4: 15, S5: 15, S6: 15, S7: 15, S8: 15 } },
}

/* ── helpers ── */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefault()
    return { ...getDefault(), ...JSON.parse(raw) }
  } catch { return getDefault() }
}

function getDefault() {
  return {
    completed: {},   // { "listening:L1:3": { score, total, ts } }
    activity:  [],   // [{ section, partId, setNum, score, total, ts }]  (max 50)
    scores:    {},   // { "listening:L1": { best, last, attempts } }
  }
}

function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return { current: 0, best: 0, lastDate: null }
    return JSON.parse(raw)
  } catch { return { current: 0, best: 0, lastDate: null } }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function yesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

/* ══════════════════════════════════════════════════════════════
   Hook
══════════════════════════════════════════════════════════════ */
export function useProgress() {
  const [data, setData]     = useState(loadProgress)
  const [streak, setStreak] = useState(loadStreak)
  const syncedRef = useRef(false)

  /* Persist on change */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak))
  }, [streak])

  /* Cross-tab sync */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY) setData(loadProgress())
      if (e.key === STREAK_KEY)  setStreak(loadStreak())
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  /* ── Supabase: load cloud progress on login ── */
  useEffect(() => {
    if (syncedRef.current) return
    const loadCloud = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return
        const uid = session.user.id

        const { data: row } = await supabase
          .from('user_progress')
          .select('progress_data, streak_data')
          .eq('user_id', uid)
          .single()

        if (row?.progress_data) {
          // Merge cloud data with local — cloud wins for conflicting keys, local fills gaps
          setData(prev => {
            const cloud = row.progress_data
            const merged = {
              completed: { ...prev.completed, ...cloud.completed },
              activity: mergeActivity(prev.activity || [], cloud.activity || []),
              scores: mergeScores(prev.scores || {}, cloud.scores || {}),
            }
            return merged
          })
        }
        if (row?.streak_data) {
          setStreak(prev => {
            const cloud = row.streak_data
            return {
              current: Math.max(prev.current || 0, cloud.current || 0),
              best: Math.max(prev.best || 0, cloud.best || 0),
              lastDate: prev.lastDate && prev.lastDate > (cloud.lastDate || '') ? prev.lastDate : (cloud.lastDate || prev.lastDate),
            }
          })
        }
        syncedRef.current = true
      } catch (e) {
        // Silently continue with localStorage if cloud sync fails
      }
    }
    loadCloud()
  }, [])

  /* ── Record a set completion ── */
  const recordCompletion = useCallback((section, partId, setNum, score, total) => {
    const key = `${section}:${partId}:${setNum}`
    const ts  = Date.now()
    const pct = total > 0 ? Math.round((score / total) * 100) : 0

    setData(prev => {
      const completed = { ...prev.completed, [key]: { score, total, pct, ts } }

      // Activity feed (newest first, max 50)
      const entry = { section, partId, setNum, score, total, pct, ts }
      const activity = [entry, ...prev.activity].slice(0, 50)

      // Best / last score per part
      const scoreKey = `${section}:${partId}`
      const prev_score = prev.scores[scoreKey] || { best: 0, last: 0, attempts: 0 }
      const scores = {
        ...prev.scores,
        [scoreKey]: {
          best:     Math.max(prev_score.best, pct),
          last:     pct,
          attempts: prev_score.attempts + 1,
        },
      }

      return { completed, activity, scores }
    })

    // Update streak
    setStreak(prev => {
      const d = today()
      if (prev.lastDate === d) return prev   // already counted today
      const continued = prev.lastDate === yesterday()
      const current   = continued ? prev.current + 1 : 1
      return { current, best: Math.max(prev.best, current), lastDate: d }
    })

    // ── Supabase: save to cloud for logged-in users ──
    saveToCloud()
  }, [])

  /* ── Save progress to Supabase (debounced) ── */
  const saveToCloud = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const uid = session.user.id
      const currentData = loadProgress()
      const currentStreak = loadStreak()

      await supabase
        .from('user_progress')
        .upsert({
          user_id: uid,
          progress_data: currentData,
          streak_data: currentStreak,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
    } catch (e) {
      // Silently fail — localStorage is always the fallback
    }
  }, [])

  /* ── Computed stats ── */
  const stats = useMemo(() => {
    const sectionStats = {}
    let totalCompleted = 0
    let totalScore = 0
    let totalScored = 0

    for (const [section, meta] of Object.entries(SECTION_TOTALS)) {
      let done = 0
      let sectionScore = 0
      let sectionScored = 0

      for (const [partId, partSets] of Object.entries(meta.parts)) {
        for (let s = 1; s <= partSets; s++) {
          const key = `${section}:${partId}:${s}`
          if (data.completed[key]) {
            done++
            sectionScore += data.completed[key].pct
            sectionScored++
          }
        }
      }

      sectionStats[section] = {
        done,
        total: meta.sets,
        questions: meta.questions,
        pct: meta.sets > 0 ? Math.round((done / meta.sets) * 100) : 0,
        avgScore: sectionScored > 0 ? Math.round(sectionScore / sectionScored) : null,
      }
      totalCompleted += done
      totalScore += sectionScore
      totalScored += sectionScored
    }

    const totalSets = Object.values(SECTION_TOTALS).reduce((s, m) => s + m.sets, 0)

    return {
      sections: sectionStats,
      totalCompleted,
      totalSets,
      totalPct: totalSets > 0 ? Math.round((totalCompleted / totalSets) * 100) : 0,
      avgScore: totalScored > 0 ? Math.round(totalScore / totalScored) : null,
    }
  }, [data])

  /* ── Check if a specific set is completed ── */
  const isCompleted = useCallback((section, partId, setNum) => {
    return !!data.completed[`${section}:${partId}:${setNum}`]
  }, [data])

  /* ── Get score for a specific set ── */
  const getSetScore = useCallback((section, partId, setNum) => {
    return data.completed[`${section}:${partId}:${setNum}`] || null
  }, [data])

  /* ── Part-level stats ── */
  const getPartStats = useCallback((section, partId) => {
    const total = SECTION_TOTALS[section]?.parts[partId] || 0
    let done = 0, scoreSum = 0
    for (let s = 1; s <= total; s++) {
      const key = `${section}:${partId}:${s}`
      if (data.completed[key]) {
        done++
        scoreSum += data.completed[key].pct
      }
    }
    return {
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      avgScore: done > 0 ? Math.round(scoreSum / done) : null,
    }
  }, [data])

  return {
    recordCompletion,
    isCompleted,
    getSetScore,
    getPartStats,
    stats,
    streak,
    activity: data.activity,
    SECTION_TOTALS,
  }
}

export { SECTION_TOTALS }

/* ── Merge helpers for cloud sync ── */
function mergeActivity(local, cloud) {
  const seen = new Set()
  const merged = []
  for (const entry of [...local, ...cloud]) {
    const key = `${entry.section}:${entry.partId}:${entry.setNum}:${entry.ts}`
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(entry)
    }
  }
  return merged.sort((a, b) => b.ts - a.ts).slice(0, 50)
}

function mergeScores(local, cloud) {
  const merged = { ...local }
  for (const [key, cloudScore] of Object.entries(cloud)) {
    const localScore = merged[key]
    if (!localScore) {
      merged[key] = cloudScore
    } else {
      merged[key] = {
        best: Math.max(localScore.best || 0, cloudScore.best || 0),
        last: (localScore.attempts || 0) >= (cloudScore.attempts || 0) ? localScore.last : cloudScore.last,
        attempts: Math.max(localScore.attempts || 0, cloudScore.attempts || 0),
      }
    }
  }
  return merged
}
