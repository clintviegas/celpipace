import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ══════════════════════════════════════════════════════════════
   ScoreTips — Collapsible "How to Score Higher" panel
   Used across Reading, Listening, Writing sections.
   Props:
     tips      : { structure: string[], scoringTips: string[], keyPhrases: string[] }
     color     : hex string
     collapsed : boolean (optional — force collapse)
══════════════════════════════════════════════════════════════ */
export default function ScoreTips({ tips, color, collapsed = false }) {
  const [open, setOpen] = useState(false)

  if (!tips || (!tips.structure?.length && !tips.scoringTips?.length)) return null

  const isOpen = !collapsed && open

  return (
    <div className="score-tips-wrap">
      <button
        className={`score-tips-toggle${isOpen ? ' score-tips-toggle--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        style={{ borderColor: `${color}30` }}
      >
        <span className="score-tips-toggle-icon">🎯</span>
        <span className="score-tips-toggle-text">How to Score Higher</span>
        <span className="score-tips-toggle-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="score-tips-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="score-tips-inner">
              <div className="score-tips-grid">
                {tips.structure?.length > 0 && (
                  <div className="score-tips-col">
                    <div className="score-tips-col-label">📝 Response Structure</div>
                    <ol className="score-tips-structure">
                      {tips.structure.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  </div>
                )}
                {tips.scoringTips?.length > 0 && (
                  <div className="score-tips-col">
                    <div className="score-tips-col-label">⭐ Scoring Tips</div>
                    <ul className="score-tips-scoring">
                      {tips.scoringTips.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              {tips.keyPhrases?.length > 0 && (
                <div className="score-tips-keywords">
                  <span className="score-tips-keywords-label">🔑 Key Vocabulary to Include:</span>
                  <div className="score-tips-keyword-tags">
                    {tips.keyPhrases.map(k => (
                      <span key={k} className="score-tips-keyword-tag" style={{ background: `${color}14`, color, borderColor: `${color}30` }}>{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   TIPS DATA GENERATORS — section & part-specific tips
══════════════════════════════════════════════════════════════ */

export function getReadingTips(type) {
  const base = {
    keyPhrases: ['main idea', 'supporting detail', 'inference', 'vocabulary in context', 'paraphrase', 'tone & register'],
  }

  if (type === 'correspondence') return {
    structure: [
      'Read the questions first — know what to look for',
      'Identify the purpose and tone (formal vs informal)',
      'Match key details: names, dates, conditions',
      'Check for implied meanings between the lines',
    ],
    scoringTips: [
      'Tone questions: look at word choice — "regret to inform" vs "just wanted to say"',
      'Detail questions: answers are almost always paraphrased, not copied word-for-word',
      'Inference: ask "what does the writer mean?" not just "what did they say?"',
      'Fill-in-blank: read the full sentence context, not just the blank',
    ],
    keyPhrases: ['writer purpose', 'audience awareness', 'register', 'paraphrase', 'implied meaning', 'key details'],
  }

  if (type === 'diagram') return {
    structure: [
      'Read the passage FIRST, then examine the visual',
      'Cross-reference: most answers need BOTH text + visual',
      'Watch for exceptions or conditions mentioned only in text',
      'Eliminate options that only partially match',
    ],
    scoringTips: [
      'Never answer from the visual alone — the passage almost always adds a condition',
      'Look for qualifier words: "except", "only if", "not available on"',
      'Time/date questions: check both the table AND the passage notes',
      'Math questions: calculate carefully — early bird discounts, pro-rated fees',
    ],
    keyPhrases: ['cross-reference', 'data extraction', 'conditions', 'exceptions', 'applied comprehension', 'calculation'],
  }

  if (type === 'information') return {
    structure: [
      'Skim paragraphs to understand the main topic of each',
      'For paragraph matching: find the ONE paragraph with that specific info',
      'Use process of elimination with [E] Not Given',
      'Re-read the specific paragraph, not the whole passage',
    ],
    scoringTips: [
      'Paragraph matching: the info will be stated differently — look for synonyms',
      '"Not Given" is correct when the topic is mentioned but the specific claim is not',
      'Do not confuse "not stated" with "contradicted" — both could be E',
      'Main idea ≠ first sentence. Some paragraphs build to the main point at the end',
    ],
    keyPhrases: ['paragraph matching', 'synonyms', 'not given', 'main idea', 'supporting evidence', 'implied vs stated'],
  }

  if (type === 'viewpoints') return {
    structure: [
      'Identify each writer/speaker\'s position in the first read',
      'Note areas of agreement AND disagreement',
      'Track reasoning: WHY each person holds their view',
      'For fill-in-blank: match the tone and argument of that specific writer',
    ],
    scoringTips: [
      'Subtle agreement questions are the hardest — find shared concerns despite different solutions',
      'Do not assume disagreement everywhere — some positions overlap',
      'Attribution matters: "Who would agree with X?" requires precise matching',
      'Counter-arguments in a passage do not mean the writer agrees with them',
    ],
    keyPhrases: ['perspective comparison', 'opinion attribution', 'concession', 'counter-argument', 'critical reading', 'nuance'],
  }

  return base
}

export function getListeningTips(partId) {
  if (partId === 'L1') return {
    structure: [
      'Listen for the problem first — it\'s usually stated early',
      'Track each proposed solution or suggestion',
      'Note the FINAL decision — not intermediate ideas',
      'Watch for attitude shifts ("actually", "how about")',
    ],
    scoringTips: [
      'The answer is often the LAST solution discussed, not the first',
      'Speaker intent: "I think we should" = decision, "maybe we could" = suggestion',
      'If both speakers agree, watch for the compromise version',
      'Distractor trap: early ideas that get rejected are common wrong answers',
    ],
    keyPhrases: ['problem identification', 'solution tracking', 'final decision', 'speaker intent', 'compromise', 'implied meaning'],
  }

  if (partId === 'L2') return {
    structure: [
      'Focus on WHO says WHAT — opinions are attributed to specific speakers',
      'Listen for emotional tone words: "love", "worried", "honestly"',
      'Track the topic shift — conversations often cover 2-3 sub-topics',
      'Note specific details: names, places, times, amounts',
    ],
    scoringTips: [
      'Attitude questions rely on tone, not just words — how something is said matters',
      'Detail questions: jot down numbers and names as you hear them',
      'Inference: "She sounds excited about it" ≠ "She said she was excited"',
      'Do not overthink — the correct answer is usually the most direct interpretation',
    ],
    keyPhrases: ['speaker attitude', 'tone recognition', 'detail recall', 'emotional language', 'everyday context', 'inference'],
  }

  if (partId === 'L3') return {
    structure: [
      'Take notes — this is a fact-heavy monologue',
      'Listen for sequence markers: "first", "next", "finally"',
      'Write down specific numbers, dates, prices, steps',
      'Pay extra attention to the opening and closing statements',
    ],
    scoringTips: [
      'The opening sentence usually contains the main purpose',
      'Numbered or sequenced info is almost always tested',
      'Beware of similar-sounding details that differ slightly',
      'If you miss something, move on — dwelling causes you to miss the next answer',
    ],
    keyPhrases: ['fact extraction', 'sequencing', 'note-taking', 'specific details', 'monologue comprehension', 'purpose'],
  }

  if (partId === 'L4') return {
    structure: [
      'Catch the opening line — it contains the key fact',
      'Note: who, what, where, when, why',
      'The closing line often states significance or next steps',
      'Formal language = precise meaning — every word counts',
    ],
    scoringTips: [
      '"What happened?" = based on the opening. "Why it matters?" = based on the closing',
      'News format: headline → details → impact → what\'s next',
      'Numbers in news are almost always tested — write them down immediately',
      'Do not add your own knowledge — answer only based on what was said',
    ],
    keyPhrases: ['news comprehension', 'formal register', 'key facts', 'significance', 'headline extraction', 'factual precision'],
  }

  if (partId === 'L5') return {
    structure: [
      'Identify speakers early — note voice differences',
      'Map each speaker to their position: Speaker A thinks…, Speaker B thinks…',
      'Listen for opinion markers: "I think", "I disagree", "my concern is"',
      'Track if anyone changes their mind during the discussion',
    ],
    scoringTips: [
      'Attribution is everything — "Who said X?" is the primary question type',
      'Concessions are testable: "I\'ll give you that" means partial agreement',
      'The moderator/host may summarize — their summary isn\'t always an opinion',
      'Multiple speakers increase distraction — stay focused on one voice at a time',
    ],
    keyPhrases: ['multi-speaker tracking', 'opinion attribution', 'perspective shift', 'concession language', 'discussion dynamics'],
  }

  if (partId === 'L6') return {
    structure: [
      'Map Speaker 1\'s position CLEARLY before Speaker 2 starts',
      'Note areas where both speakers partially agree',
      'Listen for the strongest argument each speaker makes',
      'Pay attention to rebuttals — they reveal core disagreements',
    ],
    scoringTips: [
      'Partial agreement = hardest question type. Look for "I agree that… but…"',
      'Counter-arguments: "While X may be true…" signals the speaker is about to disagree',
      'Do not confuse acknowledging the other view with agreeing with it',
      'The question "What would both speakers agree on?" usually has a subtle, nuanced answer',
    ],
    keyPhrases: ['argument analysis', 'contrast & comparison', 'nuanced agreement', 'rebuttal', 'critical listening', 'viewpoint synthesis'],
  }

  return {
    structure: ['Listen carefully to the full audio before answering', 'Note key facts and speaker positions'],
    scoringTips: ['Read all options before selecting', 'Eliminate obviously wrong choices first'],
    keyPhrases: ['active listening', 'comprehension', 'note-taking'],
  }
}

export function getWritingTips(section) {
  if (section === 'W1') return {
    structure: [
      'Open with a clear greeting appropriate to the tone',
      'Address EVERY bullet point in the prompt — missing one costs marks',
      'Use paragraph breaks: opening → body → closing',
      'End with a polite sign-off that matches the register',
    ],
    scoringTips: [
      'Tone mismatch = lowest-scoring mistake. Formal complaint ≠ message to a friend',
      'Use varied vocabulary — avoid repeating the same word more than twice',
      'Transitions matter: "Furthermore", "Additionally", "However" signal coherence',
      'Hit 150–200 words exactly. Under 150 hurts task fulfillment; over 250 introduces more errors',
    ],
    keyPhrases: ['formal register', 'task fulfillment', 'coherent structure', 'vocabulary range', 'tone matching', 'transitions'],
  }

  if (section === 'W2') return {
    structure: [
      'State your position clearly in the FIRST sentence',
      'Give 2–3 specific, concrete reasons',
      'Briefly acknowledge the counterargument, then dismiss it',
      'End with a strong concluding statement that reinforces your position',
    ],
    scoringTips: [
      'Do not hedge — "both sides have merit" scores lower than a clear position',
      'Specific examples beat general claims: "In Toronto, transit costs…" > "It is expensive"',
      'Counter-argument shows advanced reasoning: "While some argue X, this ignores Y"',
      'Avoid filler: "In today\'s modern world" adds no value and wastes word count',
    ],
    keyPhrases: ['opinion language', 'argument development', 'specific evidence', 'counter-argument', 'concise writing', 'task fulfillment'],
  }

  return {
    structure: ['Plan before writing', 'Address all prompt requirements'],
    scoringTips: ['Match your tone to the scenario', 'Proofread for grammar'],
    keyPhrases: ['coherence', 'vocabulary', 'grammar accuracy'],
  }
}
