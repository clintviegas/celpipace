/* ══════════════════════════════════════════════════════════════
   reviewQueue — "Review your mistakes" with SM-2 spaced repetition.

   Only Listening & Reading produce reviewable multiple-choice
   questions. When a practice set is completed, every missed MCQ is
   added to review_items. A modified SM-2 algorithm then schedules
   when each item is shown again until it's mastered.
══════════════════════════════════════════════════════════════ */
import { supabase } from './supabase'

const REVIEWABLE_SECTIONS = new Set(['listening', 'reading'])
const MIN_EASE = 1.3
const AGAIN_DELAY_MIN = 10 // re-show failed items in 10 minutes

/* Quality scale used by the four review buttons:
   0 = Again · 3 = Hard · 4 = Good · 5 = Easy  */
export const REVIEW_GRADES = [
  { quality: 0, label: 'Again', hint: 'Got it wrong', color: '#C8102E' },
  { quality: 3, label: 'Hard',  hint: 'Barely',       color: '#C8972A' },
  { quality: 4, label: 'Good',  hint: 'Got it',        color: '#2D8A56' },
  { quality: 5, label: 'Easy',  hint: 'Too easy',      color: '#4A90D9' },
]

async function currentUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

/* Pull only the reviewable, missed MCQs out of an attempt's details. */
function extractMissedQuestions(details) {
  const questions = Array.isArray(details?.questions) ? details.questions : []
  return questions
    .filter(q =>
      q &&
      q.isCorrect === false &&
      typeof q.correctAnswer === 'string' &&   // skip drag-drop (array answers)
      Array.isArray(q.options) && q.options.length > 0,
    )
    .map(q => ({
      question_id: String(q.questionId ?? q.number ?? ''),
      question_text: q.text || '',
      options: q.options,
      correct_answer: q.correctAnswer,
      skill: q.skill || null,
    }))
    .filter(q => q.question_id)
}

/* ── Add the missed questions from a completed set to the review queue ── */
export async function syncMissedFromAttempt(section, partId, setNumber, details) {
  try {
    if (!REVIEWABLE_SECTIONS.has(section)) return
    const missed = extractMissedQuestions(details)
    if (missed.length === 0) return

    const userId = await currentUserId()
    if (!userId) return

    const rows = missed.map(m => ({
      user_id: userId,
      section,
      part_id: String(partId || ''),
      set_number: String(setNumber || ''),
      question_id: m.question_id,
      question_text: m.question_text,
      options: m.options,
      correct_answer: m.correct_answer,
      skill: m.skill,
    }))

    // Add genuinely new mistakes without disturbing the schedule of any
    // question already in the queue.
    const { error: insertErr } = await supabase
      .from('review_items')
      .upsert(rows, {
        onConflict: 'user_id,section,part_id,set_number,question_id',
        ignoreDuplicates: true,
      })
    if (insertErr) console.warn('[reviewQueue] insert failed:', insertErr.message)

    // If a previously mastered question was missed again, resurface it.
    const missedIds = missed.map(m => m.question_id)
    const { error: resurfaceErr } = await supabase
      .from('review_items')
      .update({
        status: 'learning',
        repetitions: 0,
        interval_days: 0,
        due_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('section', section)
      .eq('part_id', String(partId || ''))
      .eq('set_number', String(setNumber || ''))
      .eq('status', 'mastered')
      .in('question_id', missedIds)
    if (resurfaceErr) console.warn('[reviewQueue] resurface failed:', resurfaceErr.message)
  } catch (err) {
    console.warn('[reviewQueue] syncMissedFromAttempt error:', err?.message || err)
  }
}

/* ── Fetch items that are due for review right now ── */
export async function getDueReviewItems(limit = 20) {
  const userId = await currentUserId()
  if (!userId) return []
  const { data, error } = await supabase
    .from('review_items')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'learning')
    .lte('due_at', new Date().toISOString())
    .order('due_at', { ascending: true })
    .limit(limit)
  if (error) {
    console.warn('[reviewQueue] getDueReviewItems error:', error.message)
    return []
  }
  return data || []
}

/* ── Counts for dashboard / nav badges ── */
export async function getReviewSummary() {
  const empty = { due: 0, learning: 0, mastered: 0, total: 0 }
  const userId = await currentUserId()
  if (!userId) return empty

  const nowIso = new Date().toISOString()
  const [dueRes, learningRes, masteredRes, totalRes] = await Promise.all([
    supabase.from('review_items').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'learning').lte('due_at', nowIso),
    supabase.from('review_items').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'learning'),
    supabase.from('review_items').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('status', 'mastered'),
    supabase.from('review_items').select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  return {
    due: dueRes.count ?? 0,
    learning: learningRes.count ?? 0,
    mastered: masteredRes.count ?? 0,
    total: totalRes.count ?? 0,
  }
}

/* ── SM-2 scheduling math ── */
function computeSchedule(item, quality) {
  let ease = Number(item.ease_factor) || 2.5
  let reps = Number(item.repetitions) || 0
  let interval = Number(item.interval_days) || 0

  if (quality < 3) {
    // Failed — reset reps, re-show again shortly.
    reps = 0
    interval = 0
    const due = new Date(Date.now() + AGAIN_DELAY_MIN * 60 * 1000)
    return { ease, reps, interval, dueAt: due, status: 'learning' }
  }

  // Passed — update ease factor per SM-2.
  ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (ease < MIN_EASE) ease = MIN_EASE

  if (reps === 0) interval = 1
  else if (reps === 1) interval = 3
  else interval = Math.round(interval * ease)
  reps += 1

  const due = new Date(Date.now() + interval * 24 * 60 * 60 * 1000)
  // Mastered once it survives a few passes and earns a long interval.
  const status = reps >= 3 && interval >= 21 ? 'mastered' : 'learning'
  return { ease, reps, interval, dueAt: due, status }
}

/* ── Grade a reviewed item and reschedule it ── */
export async function gradeReviewItem(item, quality, wasCorrect) {
  const userId = await currentUserId()
  if (!userId) return { ok: false }

  const { ease, reps, interval, dueAt, status } = computeSchedule(item, quality)
  const { error } = await supabase
    .from('review_items')
    .update({
      ease_factor: ease,
      repetitions: reps,
      interval_days: interval,
      due_at: dueAt.toISOString(),
      last_reviewed_at: new Date().toISOString(),
      times_seen: (Number(item.times_seen) || 0) + 1,
      times_correct: (Number(item.times_correct) || 0) + (wasCorrect ? 1 : 0),
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', item.id)
    .eq('user_id', userId)
  if (error) {
    console.warn('[reviewQueue] gradeReviewItem error:', error.message)
    return { ok: false }
  }
  return { ok: true, status }
}
