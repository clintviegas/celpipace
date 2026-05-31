/* ══════════════════════════════════════════════════════════════
   synonymGame — lightweight progress + best-score store for the
   "Synonym Match" word game. Guest-friendly: persists to localStorage
   so anyone can play and keep their streak without an account.
══════════════════════════════════════════════════════════════ */

import { TOTAL_SYNONYM_WORDS } from '../data/synonymData'

const KEY = 'celpipiq_synonym_game'

const EMPTY = {
  gamesPlayed: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  bestScore: 0,      // best correct-in-a-single-game
  bestStreak: 0,     // best consecutive-correct streak ever
  lastPlayedAt: null,
}

function read() {
  if (typeof window === 'undefined') return { ...EMPTY }
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    return { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    return { ...EMPTY }
  }
}

function write(stats) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stats))
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function getSynonymStats() {
  return read()
}

/* Record a finished game. `result` = { correct, total, bestStreak } */
export function recordGame({ correct = 0, total = 0, bestStreak = 0 } = {}) {
  const s = read()
  const next = {
    gamesPlayed: s.gamesPlayed + 1,
    totalCorrect: s.totalCorrect + correct,
    totalAnswered: s.totalAnswered + total,
    bestScore: Math.max(s.bestScore, correct),
    bestStreak: Math.max(s.bestStreak, bestStreak),
    lastPlayedAt: new Date().toISOString(),
  }
  write(next)
  return next
}

export function resetSynonymStats() {
  write({ ...EMPTY })
  return { ...EMPTY }
}

/* Compact summary for the dashboard card. */
export function getSynonymSummary() {
  const s = read()
  const accuracy = s.totalAnswered > 0 ? Math.round((s.totalCorrect / s.totalAnswered) * 100) : 0
  return {
    wordBank: TOTAL_SYNONYM_WORDS,
    gamesPlayed: s.gamesPlayed,
    bestStreak: s.bestStreak,
    accuracy,
  }
}
