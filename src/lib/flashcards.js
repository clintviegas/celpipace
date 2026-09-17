/* ══════════════════════════════════════════════════════════════
   flashcards — spaced-repetition study for vocab/grammar decks.
   Card content is static (src/data/flashcardData.js); this module
   tracks each user's SM-2 schedule per card.

   Signed-in users persist to the `flashcard_progress` Supabase table.
   Guests fall back to localStorage so they can still try a deck.
══════════════════════════════════════════════════════════════ */
import { supabase } from './supabase'
import { allFlashcards, cardsForDeck, FLASHCARD_DECKS } from '../data/flashcardData'

const LOCAL_KEY = 'celpipiq_flashcards'
const MIN_EASE = 1.3
const AGAIN_DELAY_MIN = 5

/* Self-grade scale (Anki-style): 0 Again · 3 Hard · 4 Good · 5 Easy */
export const FLASHCARD_GRADES = [
  { quality: 0, label: 'Again', hint: 'Forgot', color: '#C8102E' },
  { quality: 3, label: 'Hard',  hint: 'Tough',  color: '#C8972A' },
  { quality: 4, label: 'Good',  hint: 'Knew it', color: '#2D8A56' },
  { quality: 5, label: 'Easy',  hint: 'Instant', color: '#4A90D9' },
]

async function currentUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

/* ── localStorage map: { [cardId]: { ease, interval, reps, dueAt, status, seen } } ── */
function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') || {} } catch { return {} }
}
function saveLocal(map) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(map)) } catch { void 0 }
}

/* ── Fetch all progress rows for the user (or local) as a map by card_id ── */
async function fetchProgressMap() {
  const userId = await currentUserId()
  if (!userId) {
    const local = loadLocal()
    const map = {}
    for (const [cardId, v] of Object.entries(local)) {
      map[cardId] = {
        card_id: cardId,
        ease_factor: v.ease ?? 2.5,
        interval_days: v.interval ?? 0,
        repetitions: v.reps ?? 0,
        due_at: v.dueAt,
        status: v.status || 'learning',
        times_seen: v.seen ?? 0,
      }
    }
    return { userId: null, map }
  }
  const { data, error } = await supabase
    .from('flashcard_progress')
    .select('*')
    .eq('user_id', userId)
  if (error) { console.warn('[flashcards] fetch error:', error.message); return { userId, map: {} } }
  const map = {}
  for (const row of data || []) map[row.card_id] = row
  return { userId, map }
}

/* ══════════════════════════════════════════════════════════════
   Build a study queue for a deck (or all decks).
   Priority: due learning cards first, then brand-new (unseen) cards.
══════════════════════════════════════════════════════════════ */
export async function getStudyQueue(deckId = null, limit = 30) {
  const pool = deckId ? cardsForDeck(deckId) : allFlashcards()
  const { map } = await fetchProgressMap()
  const now = Date.now()

  const due = []
  const fresh = []
  for (const card of pool) {
    const p = map[card.id]
    if (!p) { fresh.push(card); continue }
    if (p.status === 'mastered') continue
    const dueAt = p.due_at ? new Date(p.due_at).getTime() : now
    if (dueAt <= now) due.push({ card, progress: p, dueAt })
  }
  due.sort((a, b) => a.dueAt - b.dueAt)

  const queue = [
    ...due.map(d => ({ ...d.card, _progress: d.progress })),
    ...fresh.map(c => ({ ...c, _progress: null })),
  ]
  return queue.slice(0, limit)
}

/* ── Summary counts for dashboard/nav ── */
export async function getFlashcardSummary() {
  const total = allFlashcards().length
  const { map } = await fetchProgressMap()
  const now = Date.now()
  let due = 0, learning = 0, mastered = 0, seen = 0
  for (const p of Object.values(map)) {
    seen += 1
    if (p.status === 'mastered') { mastered += 1; continue }
    learning += 1
    const dueAt = p.due_at ? new Date(p.due_at).getTime() : now
    if (dueAt <= now) due += 1
  }
  const fresh = total - seen
  // "due" for the badge includes brand-new cards the user hasn't started.
  return { total, due: due + fresh, learning, mastered, fresh, seen }
}

/* ── Per-deck progress (for the deck picker) ── */
export async function getDeckStats() {
  const { map } = await fetchProgressMap()
  const now = Date.now()
  return FLASHCARD_DECKS.map(deck => {
    const cards = cardsForDeck(deck.id)
    let mastered = 0, due = 0
    for (const card of cards) {
      const p = map[card.id]
      if (!p) { due += 1; continue }
      if (p.status === 'mastered') { mastered += 1; continue }
      const dueAt = p.due_at ? new Date(p.due_at).getTime() : now
      if (dueAt <= now) due += 1
    }
    return { ...deck, total: cards.length, mastered, due }
  })
}

/* ── SM-2 scheduling (shared shape with reviewQueue) ── */
function computeSchedule(progress, quality) {
  let ease = Number(progress?.ease_factor) || 2.5
  let reps = Number(progress?.repetitions) || 0
  let interval = Number(progress?.interval_days) || 0

  if (quality < 3) {
    return { ease, reps: 0, interval: 0, dueAt: new Date(Date.now() + AGAIN_DELAY_MIN * 60 * 1000), status: 'learning' }
  }
  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (ease < MIN_EASE) ease = MIN_EASE
  if (reps === 0) interval = 1
  else if (reps === 1) interval = 3
  else interval = Math.round(interval * ease)
  reps += 1
  const dueAt = new Date(Date.now() + interval * 24 * 60 * 60 * 1000)
  const status = reps >= 3 && interval >= 21 ? 'mastered' : 'learning'
  return { ease, reps, interval, dueAt, status }
}

/* ── Grade a card and persist its new schedule ── */
export async function gradeFlashcard(card, quality) {
  const userId = await currentUserId()
  const progress = card._progress || null
  const { ease, reps, interval, dueAt, status } = computeSchedule(progress, quality)

  if (!userId) {
    const map = loadLocal()
    const prev = map[card.id] || {}
    map[card.id] = {
      ease, interval, reps,
      dueAt: dueAt.toISOString(),
      status,
      seen: (prev.seen || 0) + 1,
    }
    saveLocal(map)
    return { ok: true, status }
  }

  const row = {
    user_id: userId,
    card_id: card.id,
    deck_id: card.deckId,
    ease_factor: ease,
    interval_days: interval,
    repetitions: reps,
    due_at: dueAt.toISOString(),
    last_reviewed_at: new Date().toISOString(),
    times_seen: (Number(progress?.times_seen) || 0) + 1,
    status,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase
    .from('flashcard_progress')
    .upsert(row, { onConflict: 'user_id,card_id' })
  if (error) { console.warn('[flashcards] grade error:', error.message); return { ok: false } }
  return { ok: true, status }
}

/* ── Reset all progress for a deck (or everything) ── */
export async function resetFlashcards(deckId = null) {
  const userId = await currentUserId()
  if (!userId) {
    if (!deckId) { saveLocal({}); return }
    const map = loadLocal()
    for (const id of Object.keys(map)) if (id.startsWith(`${deckId}:`)) delete map[id]
    saveLocal(map)
    return
  }
  let q = supabase.from('flashcard_progress').delete().eq('user_id', userId)
  if (deckId) q = q.eq('deck_id', deckId)
  await q
}
