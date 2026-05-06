/* ══════════════════════════════════════════════════════════════
   useProgress — live progress tracker
   Persists to localStorage, syncs across tabs via storage event.
   Tracks: completed sets, scores, streaks, activity feed.
══════════════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'celpipiq_progress'
const STREAK_KEY  = 'celpipiq_streak'
const GUEST_ID = 'guest'

/* ── Section totals (sets × questions) ── */
const SECTION_TOTALS = {
  listening: { sets: 120, questions: 760, parts: { L1: 20, L2: 20, L3: 20, L4: 20, L5: 20, L6: 20 } },
  reading:   { sets: 46,  questions: 430, parts: { R1: 15, R2: 15, R3: 15, R4: 1 } },
  writing:   { sets: 40,  questions: 40,  parts: { W1: 20, W2: 20 } },
  speaking:  { sets: 120, questions: 120, parts: { S1: 15, S2: 15, S3: 15, S4: 15, S5: 15, S6: 15, S7: 15, S8: 15 } },
}

/* ── helpers ── */
function storageId(userId) {
  return userId || GUEST_ID
}

function progressStorageKey(userId) {
  return `${STORAGE_KEY}:${storageId(userId)}`
}

function streakStorageKey(userId) {
  return `${STREAK_KEY}:${storageId(userId)}`
}

function loadProgress(userId = null) {
  try {
    let raw = localStorage.getItem(progressStorageKey(userId))
    // One-time compatibility with older app versions that used a global key.
    // Only migrate it into a signed-in user's namespace, never into guest state.
    if (!raw && userId) raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefault()
    return { ...getDefault(), ...JSON.parse(raw) }
  } catch { return getDefault() }
}

function saveProgressLocal(userId, value) {
  localStorage.setItem(progressStorageKey(userId), JSON.stringify(value || getDefault()))
}

function getDefault() {
  return {
    completed: {},   // { "listening:L1:3": { score, total, ts } }
    activity:  [],   // [{ section, partId, setNum, score, total, ts }]  (max 50)
    scores:    {},   // { "listening:L1": { best, last, attempts } }
  }
}

function defaultStreak() {
  return { current: 0, best: 0, lastDate: null }
}

async function saveAttemptToCloud({ section, partId, setNum, score, total, pct, details }) {
  const payload = {
    section,
    part_id: String(partId || ''),
    set_number: String(setNum || ''),
    score: Number.isFinite(score) ? score : null,
    total: Number.isFinite(total) ? total : null,
    pct: Number.isFinite(pct) ? pct : null,
    payload: details && typeof details === 'object' ? details : {},
  }

  const attemptInsert = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { skipped: true }
    const { error } = await supabase
      .from('practice_attempts')
      .insert({ user_id: session.user.id, ...payload })
    if (error) throw error
    return { ok: true }
  }

  // 2 retries with exponential backoff (250ms, 750ms)
  for (let i = 0; i < 3; i++) {
    try {
      const r = await attemptInsert()
      if (r.skipped) return { skipped: true }
      return { ok: true }
    } catch (err) {
      if (i === 2) {
        console.warn('[practice_attempts] insert failed after retries:', err?.message || err)
        try { queueFailedAttempt(payload) } catch { void 0 }
        return { ok: false, error: err }
      }
      await new Promise(r => setTimeout(r, 250 * Math.pow(3, i)))
    }
  }
}

const FAILED_QUEUE_KEY = 'celpipiq_failed_attempts'

function readPendingCount() {
  try {
    const raw = localStorage.getItem(FAILED_QUEUE_KEY)
    if (!raw) return 0
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list.length : 0
  } catch { return 0 }
}

function queueFailedAttempt(payload) {
  try {
    const raw = localStorage.getItem(FAILED_QUEUE_KEY)
    const list = raw ? JSON.parse(raw) : []
    list.push({ ...payload, queued_at: Date.now() })
    // keep last 50
    localStorage.setItem(FAILED_QUEUE_KEY, JSON.stringify(list.slice(-50)))
  } catch { void 0 }
}

async function flushFailedAttempts() {
  let list
  try {
    const raw = localStorage.getItem(FAILED_QUEUE_KEY)
    list = raw ? JSON.parse(raw) : []
  } catch { return }
  if (!Array.isArray(list) || list.length === 0) return

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return

  const remaining = []
  for (const item of list) {
    try {
      const { error } = await supabase
        .from('practice_attempts')
        .insert({
          user_id: session.user.id,
          section: item.section,
          part_id: item.part_id,
          set_number: item.set_number,
          score: item.score,
          total: item.total,
          pct: item.pct,
          payload: item.payload || {},
        })
      if (error) remaining.push(item)
    } catch {
      remaining.push(item)
    }
  }
  try {
    if (remaining.length === 0) localStorage.removeItem(FAILED_QUEUE_KEY)
    else localStorage.setItem(FAILED_QUEUE_KEY, JSON.stringify(remaining))
  } catch { void 0 }
}

function loadStreak(userId = null) {
  try {
    let raw = localStorage.getItem(streakStorageKey(userId))
    if (!raw && userId) raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return defaultStreak()
    return JSON.parse(raw)
  } catch { return defaultStreak() }
}

function saveStreakLocal(userId, value) {
  localStorage.setItem(streakStorageKey(userId), JSON.stringify(value || defaultStreak()))
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function yesterday() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

/* Map a raw percentage (0-100) to CLB band (3-12) — used for MCQ-based sections */
function getCLBFromPct(pct) {
  if (pct == null) return null
  if (pct >= 95) return 12
  if (pct >= 90) return 11
  if (pct >= 85) return 10
  if (pct >= 78) return 9
  if (pct >= 70) return 8
  if (pct >= 60) return 7
  if (pct >= 50) return 6
  if (pct >= 40) return 5
  if (pct >= 30) return 4
  return 3
}

/* ══════════════════════════════════════════════════════════════
   Hook
══════════════════════════════════════════════════════════════ */
export function useProgress() {
  const [data, setData]     = useState(() => loadProgress(null))
  const [streak, setStreak] = useState(() => loadStreak(null))
  // Count of practice attempts that failed to persist to Supabase and are
  // waiting in the localStorage retry queue. Pages can render a banner if > 0.
  const [pendingSync, setPendingSync] = useState(() => readPendingCount())
  const activeUserIdRef = useRef(null)
  const dataRef = useRef(data)
  const streakRef = useRef(streak)
  const syncedRef = useRef(false)

  // Sync the pending count into React state whenever the queue changes
  // (after each save attempt or after a flush).
  const refreshPendingSync = useCallback(() => {
    setPendingSync(readPendingCount())
  }, [])

  /* Persist active namespace on change */
  useEffect(() => {
    dataRef.current = data
    saveProgressLocal(activeUserIdRef.current, data)
  }, [data])

  useEffect(() => {
    streakRef.current = streak
    saveStreakLocal(activeUserIdRef.current, streak)
  }, [streak])

  /* Cross-tab sync */
  useEffect(() => {
    const handler = (e) => {
      const uid = activeUserIdRef.current
      if (e.key === progressStorageKey(uid)) setData(loadProgress(uid))
      if (e.key === streakStorageKey(uid))  setStreak(loadStreak(uid))
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  /* ── Supabase: load cloud progress on login + on auth state change ── */
  useEffect(() => {
    const loadForSession = async (sessionArg = null) => {
      try {
        const session = sessionArg || (await supabase.auth.getSession()).data?.session || null
        const uid = session?.user?.id || null

        activeUserIdRef.current = uid
        const localProgress = loadProgress(uid)
        const localStreak = loadStreak(uid)

        if (!uid) {
          dataRef.current = localProgress
          streakRef.current = localStreak
          setData(localProgress)
          setStreak(localStreak)
          syncedRef.current = false
          return
        }

        const { data: row, error } = await supabase
          .from('user_progress')
          .select('progress_data, streak_data')
          .eq('user_id', uid)
          .maybeSingle()

        if (error) throw error

        const nextProgress = row?.progress_data
          ? mergeProgress(localProgress, row.progress_data)
          : localProgress
        const nextStreak = row?.streak_data
          ? mergeStreak(localStreak, row.streak_data)
          : localStreak

        dataRef.current = nextProgress
        streakRef.current = nextStreak
        setData(nextProgress)
        setStreak(nextStreak)
        saveProgressLocal(uid, nextProgress)
        saveStreakLocal(uid, nextStreak)

        // If local had progress that cloud did not, push the merge back up.
        await supabase
          .from('user_progress')
          .upsert({
            user_id: uid,
            progress_data: nextProgress,
            streak_data: nextStreak,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
        syncedRef.current = true
      } catch {
        syncedRef.current = false
      }
    }

    // Initial load
    loadForSession()

    // Re-sync whenever auth state changes (login, token refresh, cross-tab login)
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        syncedRef.current = false
        loadForSession(session)
        // Flush any practice_attempts that failed previously
        flushFailedAttempts()
          .then(() => refreshPendingSync())
          .catch(() => void 0)
      }
      if (event === 'SIGNED_OUT') {
        const previousUserId = activeUserIdRef.current
        if (previousUserId) {
          try {
            saveProgressLocal(previousUserId, dataRef.current)
            saveStreakLocal(previousUserId, streakRef.current)
          } catch { void 0 }
        }
        activeUserIdRef.current = null
        syncedRef.current = false
        const guestProgress = loadProgress(null)
        const guestStreak = loadStreak(null)
        dataRef.current = guestProgress
        streakRef.current = guestStreak
        setData(guestProgress)
        setStreak(guestStreak)
      }
    })
    return () => { sub?.subscription?.unsubscribe?.() }
  }, [])

  /* ── Record a set completion (best-score-wins; re-attempts never lower progress) ── */
  const recordCompletion = useCallback((section, partId, setNum, score, total, details = null) => {
    const key = `${section}:${partId}:${setNum}`
    const ts  = Date.now()
    const safeScore = Number.isFinite(score) ? score : 0
    const pct = total > 0 ? Math.round((safeScore / total) * 100) : 0

    const prev = dataRef.current || getDefault()
    const prevEntry = prev.completed[key]
    const keepEntry = prevEntry && (prevEntry.pct ?? 0) >= pct
      ? { ...prevEntry, attempts: (prevEntry.attempts || 1) + 1, lastTs: ts }
      : { score: safeScore, total, pct, ts, attempts: (prevEntry?.attempts || 0) + 1, lastTs: ts }
    const completed = { ...prev.completed, [key]: keepEntry }

    const entry = { section, partId, setNum, score: safeScore, total, pct, ts }
    const activity = [entry, ...(prev.activity || [])].slice(0, 50)

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
    const nextData = { completed, activity, scores }

    const prevStreak = streakRef.current || defaultStreak()
    const d = today()
    const nextStreak = prevStreak.lastDate === d
      ? prevStreak
      : {
          current: prevStreak.lastDate === yesterday() ? (prevStreak.current || 0) + 1 : 1,
          best: Math.max(prevStreak.best || 0, prevStreak.lastDate === yesterday() ? (prevStreak.current || 0) + 1 : 1),
          lastDate: d,
        }

    dataRef.current = nextData
    streakRef.current = nextStreak
    setData(nextData)
    setStreak(nextStreak)

    // ── Write localStorage synchronously so navigation doesn't lose data ──
    try {
      saveProgressLocal(activeUserIdRef.current, nextData)
      saveStreakLocal(activeUserIdRef.current, nextStreak)
    } catch { void 0 }

    // ── Supabase: save to cloud for logged-in users with the fresh data ──
    saveToCloud(nextData, nextStreak)
    // Now retries internally and queues failures to localStorage for re-sync on next login
    saveAttemptToCloud({ section, partId, setNum, score: safeScore, total, pct, details })
      .catch(err => console.warn('[practice_attempts] unexpected:', err?.message || err))
      .finally(() => refreshPendingSync())
  }, [refreshPendingSync])

  /* ── Save progress to Supabase ── */
  const saveToCloud = useCallback(async (progressData, streakData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const uid = session.user.id
      const currentData = progressData || loadProgress(uid)
      const currentStreak = streakData || loadStreak(uid)

      saveProgressLocal(uid, currentData)
      saveStreakLocal(uid, currentStreak)

      await supabase
        .from('user_progress')
        .upsert({
          user_id: uid,
          progress_data: currentData,
          streak_data: currentStreak,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
    } catch {
      return
    }
  }, [])

  /* ── Computed stats ── */
  const stats = useMemo(() => {
    const sectionStats = {}
    let totalCompleted = 0
    let totalScore = 0
    let totalScored = 0
    let totalCorrect = 0
    let totalQuestions = 0

    // Writing & Speaking store the AI overall band (0-12 CLB scale) as "score" with total=12.
    // For these sections the average CLB is simply the mean of stored scores — NOT a pct mapping.
    const CLB_SECTIONS = new Set(['writing', 'speaking'])

    for (const [section, meta] of Object.entries(SECTION_TOTALS)) {
      let done = 0
      let sectionScore = 0      // sum of pct values (0-100)
      let sectionScored = 0
      let sectionCorrect = 0
      let sectionQuestions = 0
      let clbSum = 0            // sum of raw 0-12 band scores (writing/speaking only)
      let clbCount = 0

      for (const [partId, partSets] of Object.entries(meta.parts)) {
        for (let s = 1; s <= partSets; s++) {
          const key = `${section}:${partId}:${s}`
          if (data.completed[key]) {
            done++
            const entry = data.completed[key]
            sectionScore += entry.pct || 0
            sectionScored++
            if (typeof entry.score === 'number' && typeof entry.total === 'number' && entry.total > 0) {
              sectionCorrect += entry.score
              sectionQuestions += entry.total
              if (CLB_SECTIONS.has(section)) {
                clbSum += entry.score
                clbCount++
              }
            }
          }
        }
      }

      const isClb = CLB_SECTIONS.has(section)
      sectionStats[section] = {
        done,
        total: meta.sets,
        questions: meta.questions,
        pct: meta.sets > 0 ? Math.round((done / meta.sets) * 100) : 0,
        avgScore: sectionScored > 0 ? Math.round(sectionScore / sectionScored) : null,
        // avgCLB: direct band for writing/speaking, derived from pct for listening/reading
        avgCLB: isClb
          ? (clbCount > 0 ? Math.round(clbSum / clbCount) : null)
          : (sectionScored > 0 ? getCLBFromPct(Math.round(sectionScore / sectionScored)) : null),
        correct: sectionCorrect,
        answered: sectionQuestions,
        isClbSection: isClb,
      }
      totalCompleted += done
      totalScore += sectionScore
      totalScored += sectionScored
      totalCorrect += sectionCorrect
      totalQuestions += sectionQuestions
    }

    const totalSets = Object.values(SECTION_TOTALS).reduce((s, m) => s + m.sets, 0)

    return {
      sections: sectionStats,
      totalCompleted,
      totalSets,
      totalPct: totalSets > 0 ? Math.round((totalCompleted / totalSets) * 100) : 0,
      avgScore: totalScored > 0 ? Math.round(totalScore / totalScored) : null,
      correct: totalCorrect,
      answered: totalQuestions,
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

  /* ── Part-level stats (section-aware CLB) ── */
  const getPartStats = useCallback((section, partId) => {
    const total = SECTION_TOTALS[section]?.parts[partId] || 0
    const isClb = section === 'writing' || section === 'speaking'
    let done = 0, scoreSum = 0, clbSum = 0, clbCount = 0
    for (let s = 1; s <= total; s++) {
      const key = `${section}:${partId}:${s}`
      const entry = data.completed[key]
      if (entry) {
        done++
        scoreSum += entry.pct || 0
        if (isClb && typeof entry.score === 'number' && entry.total > 0) {
          clbSum += entry.score
          clbCount++
        }
      }
    }
    const avgPct = done > 0 ? Math.round(scoreSum / done) : null
    return {
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      avgScore: avgPct,
      avgCLB: isClb
        ? (clbCount > 0 ? Math.round(clbSum / clbCount) : null)
        : (avgPct != null ? getCLBFromPct(avgPct) : null),
      isClbSection: isClb,
    }
  }, [data])

  // Manual flush — pages can offer a "Retry sync" button alongside the
  // pending-sync banner.
  const retryPendingSync = useCallback(async () => {
    await flushFailedAttempts()
    refreshPendingSync()
  }, [refreshPendingSync])

  return {
    recordCompletion,
    isCompleted,
    getSetScore,
    getPartStats,
    stats,
    streak,
    activity: data.activity,
    SECTION_TOTALS,
    pendingSync,
    retryPendingSync,
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

function mergeProgress(local, cloud) {
  const mergedCompleted = { ...(local.completed || {}) }
  for (const [key, cloudEntry] of Object.entries(cloud.completed || {})) {
    const localEntry = mergedCompleted[key]
    if (!localEntry || (cloudEntry.pct ?? 0) >= (localEntry.pct ?? 0)) {
      mergedCompleted[key] = cloudEntry
    }
  }
  return {
    completed: mergedCompleted,
    activity: mergeActivity(local.activity || [], cloud.activity || []),
    scores: mergeScores(local.scores || {}, cloud.scores || {}),
  }
}

function mergeStreak(local, cloud) {
  return {
    current: Math.max(local.current || 0, cloud.current || 0),
    best: Math.max(local.best || 0, cloud.best || 0),
    lastDate: local.lastDate && local.lastDate > (cloud.lastDate || '')
      ? local.lastDate
      : (cloud.lastDate || local.lastDate || null),
  }
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
