/* ══════════════════════════════════════════════════════════════
   useProgress — live progress tracker
   Persists to localStorage, syncs across tabs via storage event.
   Tracks: completed sets, scores, streaks, activity feed.
══════════════════════════════════════════════════════════════ */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { syncMissedFromAttempt } from '../lib/reviewQueue'

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

const CLB_SECTIONS = new Set(['writing', 'speaking'])

function completionKey(section, partId, setNum) {
  return `${String(section)}:${String(partId)}:${Number(setNum)}`
}

function resolveSetEntry(progress, section, partId, setNum) {
  const key = completionKey(section, partId, setNum)
  const repaired = repairClbProgress(progress)
  let entry = repaired.completed[key] || null
  if (!CLB_SECTIONS.has(section)) return entry
  if (entry && isPlaceholderClbEntry(entry)) entry = null
  if (entry) return entry
  for (const act of progress.activity || []) {
    if (completionKey(act.section, act.partId, act.setNum) !== key) continue
    const candidate = clbCandidateFromRow({
      section: act.section,
      partId: act.partId,
      setNum: act.setNum,
      score: act.score,
      total: act.total,
      pct: act.pct,
      ts: act.ts,
      aiResult: act.aiResult,
    })
    if (candidate && (!entry || clbEntryRank(candidate) > clbEntryRank(entry))) {
      entry = candidate
    }
  }
  return entry
}

function isPlaceholderClbEntry(entry) {
  if (!entry) return false
  const score = Number(entry.score)
  const total = Number(entry.total)
  if (!Number.isFinite(score) || !Number.isFinite(total)) return false
  // Legacy timer-end marker (1/1) saved before AI scoring — not a real CLB band.
  return total <= 1
}

function clbBandFromAiResult(ai) {
  if (!ai || typeof ai !== 'object') return null
  const band = Math.round(Number(ai.clbBand ?? ai.overall))
  return Number.isFinite(band) && band >= 1 && band <= 12 ? band : null
}

function clbCandidateFromRow({ section, partId, setNum, score, total, pct, ts, aiResult }) {
  if (!CLB_SECTIONS.has(section)) return null
  const aiBand = clbBandFromAiResult(aiResult)
  if (aiBand) {
    return {
      score: aiBand,
      total: 12,
      pct: Math.round((aiBand / 12) * 100),
      ts: ts || Date.now(),
    }
  }
  const safeScore = Number(score)
  const safeTotal = Number(total)
  if (isPlaceholderClbEntry({ score: safeScore, total: safeTotal })) return null
  if (safeTotal >= 12 && Number.isFinite(safeScore) && safeScore >= 1 && safeScore <= 12) {
    return {
      score: safeScore,
      total: 12,
      pct: pct ?? Math.round((safeScore / 12) * 100),
      ts: ts || Date.now(),
    }
  }
  return null
}

function clbEntryRank(entry) {
  if (!entry || isPlaceholderClbEntry(entry)) return -1
  return Number(entry.score) || 0
}

function shouldKeepPrevCompletion(prevEntry, safeScore, total, pct, section) {
  if (!prevEntry) return false
  if (CLB_SECTIONS.has(section)) {
    const prevRank = clbEntryRank(prevEntry)
    const newRank = isPlaceholderClbEntry({ score: safeScore, total }) ? -1 : safeScore
    return prevRank >= newRank
  }
  return (prevEntry.pct ?? 0) >= pct
}

function repairClbProgress(data) {
  if (!data) return getDefault()

  // Re-key legacy completed entries to a normalized section:part:set format.
  const completed = {}
  for (const [rawKey, entry] of Object.entries(data.completed || {})) {
    const parts = rawKey.split(':')
    const key = parts.length === 3 ? completionKey(parts[0], parts[1], parts[2]) : rawKey
    const existing = completed[key]
    if (!existing || isPlaceholderClbEntry(existing) || clbEntryRank(entry) > clbEntryRank(existing)) {
      if (!isPlaceholderClbEntry(entry) || !existing) completed[key] = entry
    }
  }

  for (const entry of data.activity || []) {
    if (!CLB_SECTIONS.has(entry.section)) continue
    const key = completionKey(entry.section, entry.partId, entry.setNum)
    const candidate = clbCandidateFromRow({
      section: entry.section,
      partId: entry.partId,
      setNum: entry.setNum,
      score: entry.score,
      total: entry.total,
      pct: entry.pct,
      ts: entry.ts,
    })
    if (!candidate) continue
    const current = completed[key]
    if (!current || isPlaceholderClbEntry(current) || clbEntryRank(candidate) > clbEntryRank(current)) {
      completed[key] = {
        ...candidate,
        attempts: current?.attempts || 1,
        lastTs: candidate.ts,
      }
    }
  }

  for (const [key, entry] of Object.entries(completed)) {
    const section = key.split(':')[0]
    if (CLB_SECTIONS.has(section) && isPlaceholderClbEntry(entry)) {
      delete completed[key]
    }
  }

  return { ...data, completed }
}

async function repairFromPracticeAttempts(supabase, userId, data) {
  if (!supabase || !userId) return repairClbProgress(data)
  try {
    const { data: rows, error } = await supabase
      .from('practice_attempts')
      .select('section, part_id, set_number, score, total, pct, payload, created_at')
      .eq('user_id', userId)
      .in('section', ['writing', 'speaking'])
      .order('created_at', { ascending: false })
      .limit(300)
    if (error || !rows?.length) return repairClbProgress(data)

    const completed = { ...(data.completed || {}) }
    for (const row of rows) {
      const key = completionKey(row.section, row.part_id, row.set_number)
      const candidate = clbCandidateFromRow({
        section: row.section,
        partId: row.part_id,
        setNum: row.set_number,
        score: row.score,
        total: row.total,
        pct: row.pct,
        ts: new Date(row.created_at).getTime(),
        aiResult: row.payload?.aiResult,
      })
      if (!candidate) continue
      const current = completed[key]
      if (!current || isPlaceholderClbEntry(current) || clbEntryRank(candidate) > clbEntryRank(current)) {
        completed[key] = {
          ...candidate,
          attempts: current?.attempts || 1,
          lastTs: candidate.ts,
        }
      }
    }
    return repairClbProgress({ ...data, completed })
  } catch {
    return repairClbProgress(data)
  }
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
    return repairClbProgress({ ...getDefault(), ...JSON.parse(raw) })
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
   Shared store — every useProgress() instance reads/writes the
   same in-memory snapshot so parent recordCompletion() updates
   child sidebars immediately (SpeakingLayout, WritingLayout, etc.).
══════════════════════════════════════════════════════════════ */
const progressStore = {
  userId: null,
  data: loadProgress(null),
  streak: loadStreak(null),
  synced: false,
}

const storeListeners = new Set()
let authSyncStarted = false

function notifyProgressStore() {
  storeListeners.forEach(fn => fn())
}

function commitProgress(nextData, nextStreak = progressStore.streak, userId = progressStore.userId) {
  progressStore.data = repairClbProgress(nextData)
  progressStore.streak = nextStreak
  progressStore.userId = userId
  try {
    saveProgressLocal(userId, progressStore.data)
    saveStreakLocal(userId, progressStore.streak)
  } catch { void 0 }
  notifyProgressStore()
}

async function saveProgressToCloud(progressData, streakData) {
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
}

function ensureAuthSync(refreshPendingSync) {
  if (authSyncStarted) return
  authSyncStarted = true

  const loadForSession = async (sessionArg = null) => {
    try {
      const session = sessionArg || (await supabase.auth.getSession()).data?.session || null
      const uid = session?.user?.id || null

      if (!uid) {
        const guestProgress = loadProgress(null)
        const guestStreak = loadStreak(null)
        commitProgress(guestProgress, guestStreak, null)
        progressStore.synced = false
        return
      }

      const localFromDisk = loadProgress(uid)
      const localStreak = loadStreak(uid)
      const withMemory = mergeProgress(localFromDisk, progressStore.data)

      const { data: row, error } = await supabase
        .from('user_progress')
        .select('progress_data, streak_data')
        .eq('user_id', uid)
        .maybeSingle()

      if (error) throw error

      const merged = row?.progress_data
        ? mergeProgress(withMemory, row.progress_data)
        : withMemory
      const nextProgress = await repairFromPracticeAttempts(supabase, uid, merged)
      const nextStreak = row?.streak_data
        ? mergeStreak(localStreak, row.streak_data)
        : localStreak

      // In-memory state (e.g. a score saved milliseconds ago) must win over stale cloud.
      const finalProgress = mergeProgress(nextProgress, progressStore.data)

      commitProgress(finalProgress, nextStreak, uid)

      await supabase
        .from('user_progress')
        .upsert({
          user_id: uid,
          progress_data: finalProgress,
          streak_data: nextStreak,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      progressStore.synced = true
    } catch {
      progressStore.synced = false
    }
  }

  loadForSession()

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      progressStore.synced = false
      loadForSession(session)
      flushFailedAttempts()
        .then(() => refreshPendingSync?.())
        .catch(() => void 0)
    }
    if (event === 'TOKEN_REFRESHED') {
      flushFailedAttempts()
        .then(() => refreshPendingSync?.())
        .catch(() => void 0)
    }
    if (event === 'SIGNED_OUT') {
      const previousUserId = progressStore.userId
      if (previousUserId) {
        try {
          saveProgressLocal(previousUserId, progressStore.data)
          saveStreakLocal(previousUserId, progressStore.streak)
        } catch { void 0 }
      }
      progressStore.synced = false
      commitProgress(loadProgress(null), loadStreak(null), null)
    }
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      const uid = progressStore.userId
      if (e.key === progressStorageKey(uid)) {
        commitProgress(loadProgress(uid), progressStore.streak, uid)
      }
      if (e.key === streakStorageKey(uid)) {
        progressStore.streak = loadStreak(uid)
        notifyProgressStore()
      }
    })
  }
}

function recordCompletionShared(section, partId, setNum, score, total, details = null, refreshPendingSync) {
  const key = completionKey(section, partId, setNum)
  const ts  = Date.now()
  let safeScore = Number(score)
  let safeTotal = Number(total)
  if (CLB_SECTIONS.has(section)) {
    const aiBand = clbBandFromAiResult(details?.aiResult)
    if (aiBand) {
      safeScore = aiBand
      safeTotal = 12
    }
    if (!Number.isFinite(safeScore)) safeScore = 0
    if (!Number.isFinite(safeTotal)) safeTotal = 12
    if (isPlaceholderClbEntry({ score: safeScore, total: safeTotal })) return
  } else {
    safeScore = Number.isFinite(safeScore) ? safeScore : 0
    safeTotal = Number.isFinite(safeTotal) ? safeTotal : 0
  }
  const pct = safeTotal > 0 ? Math.round((safeScore / safeTotal) * 100) : 0

  const prev = progressStore.data || getDefault()
  const prevEntry = prev.completed[key]
  const keepEntry = shouldKeepPrevCompletion(prevEntry, safeScore, safeTotal, pct, section)
    ? { ...prevEntry, attempts: (prevEntry.attempts || 1) + 1, lastTs: ts }
    : { score: safeScore, total: safeTotal, pct, ts, attempts: (prevEntry?.attempts || 0) + 1, lastTs: ts }
  const completed = { ...prev.completed, [key]: keepEntry }

  const entry = { section, partId, setNum, score: safeScore, total: safeTotal, pct, ts }
  const activity = [entry, ...(prev.activity || [])].slice(0, 50)

  const scoreKey = `${section}:${partId}`
  const prev_score = prev.scores[scoreKey] || { best: 0, last: 0, attempts: 0 }
  const scoreMetric = CLB_SECTIONS.has(section) && !isPlaceholderClbEntry({ score: safeScore, total: safeTotal })
    ? safeScore
    : pct
  const scores = {
    ...prev.scores,
    [scoreKey]: {
      best:     Math.max(prev_score.best, scoreMetric),
      last:     scoreMetric,
      attempts: prev_score.attempts + 1,
    },
  }
  const nextData = repairClbProgress({ completed, activity, scores })

  const prevStreak = progressStore.streak || defaultStreak()
  const d = today()
  const nextStreak = prevStreak.lastDate === d
    ? prevStreak
    : {
        current: prevStreak.lastDate === yesterday() ? (prevStreak.current || 0) + 1 : 1,
        best: Math.max(prevStreak.best || 0, prevStreak.lastDate === yesterday() ? (prevStreak.current || 0) + 1 : 1),
        lastDate: d,
      }

  commitProgress(nextData, nextStreak, progressStore.userId)
  saveProgressToCloud(nextData, nextStreak)
  saveAttemptToCloud({ section, partId, setNum, score: safeScore, total: safeTotal, pct, details })
    .catch(err => console.warn('[practice_attempts] unexpected:', err?.message || err))
    .finally(() => refreshPendingSync?.())

  syncMissedFromAttempt(section, partId, setNum, details)
    .catch(err => console.warn('[reviewQueue] sync failed:', err?.message || err))
}

/* ══════════════════════════════════════════════════════════════
   Hook
══════════════════════════════════════════════════════════════ */
export function useProgress() {
  const [, setTick] = useState(0)
  const [pendingSync, setPendingSync] = useState(() => readPendingCount())

  const refreshPendingSync = useCallback(() => {
    setPendingSync(readPendingCount())
  }, [])

  useEffect(() => {
    const sub = () => setTick(n => n + 1)
    storeListeners.add(sub)
    ensureAuthSync(refreshPendingSync)
    return () => storeListeners.delete(sub)
  }, [refreshPendingSync])

  const data = progressStore.data
  const streak = progressStore.streak

  const recordCompletion = useCallback((section, partId, setNum, score, total, details = null) => {
    recordCompletionShared(section, partId, setNum, score, total, details, refreshPendingSync)
  }, [refreshPendingSync])

  /* ── Computed stats ── */
  const stats = useMemo(() => {
    const progress = repairClbProgress(data)
    const sectionStats = {}
    let totalCompleted = 0
    let totalScore = 0
    let totalScored = 0
    let totalCorrect = 0
    let totalQuestions = 0

    // Writing & Speaking store the real-time overall band (0-12 CLB scale) as "score" with total=12.
    // For these sections the average CLB is simply the mean of stored scores — NOT a pct mapping.

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
          const entry = resolveSetEntry(progress, section, partId, s)
          if (!entry) continue
          if (CLB_SECTIONS.has(section) && isPlaceholderClbEntry(entry)) continue
          done++
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
    return !!resolveSetEntry(data, section, partId, setNum)
  }, [data])

  /* ── Get score for a specific set ── */
  const getSetScore = useCallback((section, partId, setNum) => {
    return resolveSetEntry(data, section, partId, setNum)
  }, [data])

  /* ── Part-level stats (section-aware CLB) ── */
  const getPartStats = useCallback((section, partId) => {
    const total = SECTION_TOTALS[section]?.parts[partId] || 0
    const isClb = section === 'writing' || section === 'speaking'
    let done = 0, scoreSum = 0, clbSum = 0, clbCount = 0
    for (let s = 1; s <= total; s++) {
      const entry = resolveSetEntry(data, section, partId, s)
      if (!entry) continue
      if (isClb && isPlaceholderClbEntry(entry)) continue
      done++
      scoreSum += entry.pct || 0
      if (isClb && typeof entry.score === 'number' && entry.total > 0) {
        clbSum += entry.score
        clbCount++
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
    const section = key.split(':')[0]
    const keepCloud = !localEntry || !shouldKeepPrevCompletion(
      localEntry,
      cloudEntry.score,
      cloudEntry.total,
      cloudEntry.pct ?? 0,
      section,
    )
    if (keepCloud) {
      mergedCompleted[key] = cloudEntry
    }
  }
  return repairClbProgress({
    completed: mergedCompleted,
    activity: mergeActivity(local.activity || [], cloud.activity || []),
    scores: mergeScores(local.scores || {}, cloud.scores || {}),
  })
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
