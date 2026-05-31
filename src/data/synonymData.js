/* ══════════════════════════════════════════════════════════════
   synonymData — CELPIP "Synonym Match" word game
   Each entry: { word, clue, synonyms: [...], category }
   - `word`     : the prompt word the player sees
   - `clue`     : a short, plain-English meaning shown as a hint
   - `synonyms` : acceptable correct answers (the first is the "best" one,
                  the rest count as correct too)
   - `category` : used for the playful category picker
   Entries are kept semantically distinct so that one word's synonym is
   never accidentally a correct answer for another word (safe distractors).
══════════════════════════════════════════════════════════════ */

export const SYNONYM_CATEGORIES = [
  { id: 'all', label: 'Mixed bag', icon: '🎲', color: '#0f172a', desc: 'A shuffle of every word — the full challenge.' },
  { id: 'academic', label: 'Academic & Work', icon: '📚', color: '#4A90D9', desc: 'High-band words for Writing and Speaking.' },
  { id: 'descriptive', label: 'Describe It', icon: '🎨', color: '#C8972A', desc: 'Adjectives that make your answers vivid.' },
  { id: 'action', label: 'Action Verbs', icon: '⚡', color: '#2D8A56', desc: 'Strong verbs that show, not tell.' },
  { id: 'feelings', label: 'Feelings & Tone', icon: '💬', color: '#6B4FAF', desc: 'Nuanced words for emotions and attitude.' },
]

export const SYNONYM_WORDS = [
  // ── Academic & Work ─────────────────────────────────────────
  { word: 'Mitigate', clue: 'to make something less severe', synonyms: ['Lessen', 'Reduce', 'Ease'], category: 'academic' },
  { word: 'Substantial', clue: 'large in amount or importance', synonyms: ['Considerable', 'Significant', 'Sizeable'], category: 'academic' },
  { word: 'Feasible', clue: 'able to be done', synonyms: ['Achievable', 'Workable', 'Viable'], category: 'academic' },
  { word: 'Comprehensive', clue: 'complete and thorough', synonyms: ['Thorough', 'Complete', 'Extensive'], category: 'academic' },
  { word: 'Prevalent', clue: 'common and widespread', synonyms: ['Widespread', 'Common', 'Rife'], category: 'academic' },
  { word: 'Allocate', clue: 'to assign for a purpose', synonyms: ['Assign', 'Distribute', 'Allot'], category: 'academic' },
  { word: 'Inevitable', clue: 'certain to happen', synonyms: ['Unavoidable', 'Certain', 'Inescapable'], category: 'academic' },
  { word: 'Proficient', clue: 'highly skilled', synonyms: ['Skilled', 'Competent', 'Adept'], category: 'academic' },
  { word: 'Compelling', clue: 'very convincing', synonyms: ['Convincing', 'Persuasive', 'Forceful'], category: 'academic' },
  { word: 'Ambiguous', clue: 'open to more than one meaning', synonyms: ['Unclear', 'Vague', 'Equivocal'], category: 'academic' },
  { word: 'Endorse', clue: 'to publicly support', synonyms: ['Support', 'Back', 'Approve'], category: 'academic' },
  { word: 'Subsequent', clue: 'coming after in time', synonyms: ['Following', 'Later', 'Ensuing'], category: 'academic' },

  // ── Describe It (adjectives) ────────────────────────────────
  { word: 'Tedious', clue: 'boring and tiresome', synonyms: ['Boring', 'Dull', 'Monotonous'], category: 'descriptive' },
  { word: 'Vivid', clue: 'bright and full of life', synonyms: ['Bright', 'Striking', 'Vibrant'], category: 'descriptive' },
  { word: 'Crucial', clue: 'extremely important', synonyms: ['Vital', 'Essential', 'Critical'], category: 'descriptive' },
  { word: 'Reluctant', clue: 'unwilling and hesitant', synonyms: ['Unwilling', 'Hesitant', 'Disinclined'], category: 'descriptive' },
  { word: 'Abundant', clue: 'available in large amounts', synonyms: ['Plentiful', 'Ample', 'Copious'], category: 'descriptive' },
  { word: 'Fragile', clue: 'easily broken', synonyms: ['Delicate', 'Brittle', 'Flimsy'], category: 'descriptive' },
  { word: 'Lucrative', clue: 'producing a lot of money', synonyms: ['Profitable', 'Rewarding', 'Moneymaking'], category: 'descriptive' },
  { word: 'Meticulous', clue: 'very careful about detail', synonyms: ['Careful', 'Precise', 'Thorough'], category: 'descriptive' },
  { word: 'Genuine', clue: 'real and authentic', synonyms: ['Authentic', 'Real', 'Sincere'], category: 'descriptive' },
  { word: 'Hectic', clue: 'very busy and chaotic', synonyms: ['Busy', 'Frantic', 'Chaotic'], category: 'descriptive' },

  // ── Action Verbs ────────────────────────────────────────────
  { word: 'Acquire', clue: 'to get or obtain', synonyms: ['Obtain', 'Gain', 'Get'], category: 'action' },
  { word: 'Demonstrate', clue: 'to show clearly', synonyms: ['Show', 'Illustrate', 'Display'], category: 'action' },
  { word: 'Enhance', clue: 'to improve the quality of', synonyms: ['Improve', 'Boost', 'Elevate'], category: 'action' },
  { word: 'Resolve', clue: 'to settle or fix a problem', synonyms: ['Settle', 'Fix', 'Sort out'], category: 'action' },
  { word: 'Postpone', clue: 'to delay to a later time', synonyms: ['Delay', 'Defer', 'Put off'], category: 'action' },
  { word: 'Persuade', clue: 'to convince someone', synonyms: ['Convince', 'Coax', 'Win over'], category: 'action' },
  { word: 'Tackle', clue: 'to deal with a difficulty', synonyms: ['Address', 'Confront', 'Handle'], category: 'action' },
  { word: 'Highlight', clue: 'to draw attention to', synonyms: ['Emphasise', 'Stress', 'Underline'], category: 'action' },
  { word: 'Anticipate', clue: 'to expect in advance', synonyms: ['Expect', 'Foresee', 'Predict'], category: 'action' },
  { word: 'Contribute', clue: 'to give a part toward', synonyms: ['Donate', 'Add', 'Chip in'], category: 'action' },

  // ── Feelings & Tone ─────────────────────────────────────────
  { word: 'Delighted', clue: 'very pleased and happy', synonyms: ['Thrilled', 'Pleased', 'Overjoyed'], category: 'feelings' },
  { word: 'Anxious', clue: 'worried and uneasy', synonyms: ['Worried', 'Nervous', 'Uneasy'], category: 'feelings' },
  { word: 'Content', clue: 'quietly satisfied', synonyms: ['Satisfied', 'Fulfilled', 'At ease'], category: 'feelings' },
  { word: 'Frustrated', clue: 'annoyed at being blocked', synonyms: ['Annoyed', 'Exasperated', 'Irritated'], category: 'feelings' },
  { word: 'Confident', clue: 'sure of yourself', synonyms: ['Assured', 'Self-assured', 'Poised'], category: 'feelings' },
  { word: 'Exhausted', clue: 'extremely tired', synonyms: ['Worn out', 'Drained', 'Weary'], category: 'feelings' },
  { word: 'Curious', clue: 'eager to learn or know', synonyms: ['Inquisitive', 'Intrigued', 'Interested'], category: 'feelings' },
  { word: 'Grateful', clue: 'thankful for something', synonyms: ['Thankful', 'Appreciative', 'Indebted'], category: 'feelings' },
  { word: 'Reluctant', clue: 'unwilling to do something', synonyms: ['Hesitant', 'Unwilling', 'Wary'], category: 'feelings' },
  { word: 'Astonished', clue: 'greatly surprised', synonyms: ['Amazed', 'Stunned', 'Astounded'], category: 'feelings' },
]

export const TOTAL_SYNONYM_WORDS = SYNONYM_WORDS.length

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function wordsForCategory(categoryId) {
  if (!categoryId || categoryId === 'all') return SYNONYM_WORDS.slice()
  return SYNONYM_WORDS.filter(w => w.category === categoryId)
}

/* Build a single multiple-choice round for the given entry.
   The correct option is one of its synonyms; the 3 distractors are synonyms
   pulled from other (semantically distinct) words so they are never right. */
export function buildRound(entry, pool = SYNONYM_WORDS, optionCount = 4) {
  const correct = entry.synonyms[Math.floor(Math.random() * entry.synonyms.length)]
  const correctLower = entry.synonyms.map(s => s.toLowerCase())

  const distractorBucket = []
  for (const other of pool) {
    if (other.word === entry.word) continue
    for (const syn of other.synonyms) {
      if (!correctLower.includes(syn.toLowerCase())) distractorBucket.push(syn)
    }
  }

  const distractors = []
  const seen = new Set([correct.toLowerCase()])
  for (const d of shuffle(distractorBucket)) {
    const key = d.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    distractors.push(d)
    if (distractors.length >= optionCount - 1) break
  }

  const options = shuffle([correct, ...distractors])
  return { word: entry.word, clue: entry.clue, correct, options }
}

/* Build a full game: an ordered list of rounds for the chosen category. */
export function buildGame(categoryId = 'all', rounds = 10) {
  const pool = wordsForCategory(categoryId)
  const ordered = shuffle(pool).slice(0, Math.min(rounds, pool.length))
  return ordered.map(entry => buildRound(entry, SYNONYM_WORDS))
}
