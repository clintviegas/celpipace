/* ══════════════════════════════════════════════════════════════
   flashcardData — CELPIP vocabulary, collocations, idioms & grammar
   Each card: { id, front, back, example, hint }
   id is stable (deck + index) so spaced-repetition progress survives
   content edits as long as existing ids are not reordered/removed.
══════════════════════════════════════════════════════════════ */

export const FLASHCARD_DECKS = [
  {
    id: 'vocab-academic',
    label: 'Academic & Workplace Vocabulary',
    icon: '📚',
    color: '#4A90D9',
    desc: 'High-band words that lift your Writing and Speaking vocabulary score.',
    cards: [
      { front: 'Mitigate', back: 'To make something less severe or harmful.', example: 'The new policy aims to mitigate the impact of rising costs.' },
      { front: 'Substantial', back: 'Large in amount, size or importance.', example: 'There was a substantial increase in applications this year.' },
      { front: 'Feasible', back: 'Possible to do easily or conveniently.', example: 'Working from home is a feasible option for most staff.' },
      { front: 'Advocate (for)', back: 'To publicly support or recommend something.', example: 'She advocates for better public transport in the city.' },
      { front: 'Comprehensive', back: 'Complete and including everything that is necessary.', example: 'The report gives a comprehensive overview of the issue.' },
      { front: 'Diminish', back: 'To make or become smaller or less.', example: 'Regular practice diminishes test-day anxiety.' },
      { front: 'Prevalent', back: 'Widespread; common in a particular area or time.', example: 'Remote work has become prevalent since 2020.' },
      { front: 'Allocate', back: 'To give or assign a resource for a particular purpose.', example: 'The committee allocated more funding to training.' },
      { front: 'Implement', back: 'To put a plan or decision into effect.', example: 'The school implemented a new attendance system.' },
      { front: 'Subsequently', back: 'Afterwards; following something in time.', example: 'He missed the deadline and was subsequently disqualified.' },
      { front: 'Compelling', back: 'Convincing; arousing strong interest or attention.', example: 'She made a compelling argument for the change.' },
      { front: 'Discrepancy', back: 'A difference between two things that should match.', example: 'There was a discrepancy between the two reports.' },
      { front: 'Endeavour', back: 'To try hard to achieve something (or such an effort).', example: 'We endeavour to respond within 24 hours.' },
      { front: 'Inevitable', back: 'Certain to happen; unavoidable.', example: 'Some delays are inevitable during the holidays.' },
      { front: 'Proficient', back: 'Skilled and competent at something.', example: 'You must be proficient in English to apply.' },
    ],
  },
  {
    id: 'collocations',
    label: 'Common Collocations',
    icon: '🔗',
    color: '#2D8A56',
    desc: 'Natural word pairings examiners reward in Speaking and Writing.',
    cards: [
      { front: 'make a decision', back: 'NOT "do a decision". To decide on something.', example: 'We need to make a decision by Friday.' },
      { front: 'take responsibility', back: 'To accept that you are accountable for something.', example: 'She took responsibility for the mistake.' },
      { front: 'pay attention', back: 'To watch, listen, or concentrate carefully.', example: 'Please pay attention to the instructions.' },
      { front: 'reach a conclusion', back: 'To arrive at a decision after thinking.', example: 'The team reached a conclusion after the meeting.' },
      { front: 'meet a deadline', back: 'To finish something by the required time.', example: 'He worked late to meet the deadline.' },
      { front: 'raise awareness', back: 'To make more people know about an issue.', example: 'The campaign raised awareness of recycling.' },
      { front: 'gain experience', back: 'To accumulate practical knowledge or skill.', example: 'Volunteering helped me gain experience.' },
      { front: 'draw a comparison', back: 'To point out similarities between things.', example: 'The article draws a comparison between the two cities.' },
      { front: 'strongly agree / disagree', back: 'A natural intensifier for opinions (NOT "very agree").', example: 'I strongly disagree with that statement.' },
      { front: 'a significant impact', back: 'A large or important effect.', example: 'Technology has had a significant impact on education.' },
      { front: 'set a goal', back: 'To decide on something you want to achieve.', example: 'She set a goal to read one book a week.' },
      { front: 'keep in touch', back: 'To stay in contact with someone.', example: 'Let’s keep in touch after the course.' },
    ],
  },
  {
    id: 'idioms',
    label: 'Idioms & Everyday Expressions',
    icon: '💬',
    color: '#C8972A',
    desc: 'Natural expressions that boost fluency in Speaking tasks.',
    cards: [
      { front: 'on the same page', back: 'In agreement; sharing the same understanding.', example: 'Let’s make sure we’re all on the same page.' },
      { front: 'a piece of cake', back: 'Something very easy to do.', example: 'The exam was a piece of cake after all that practice.' },
      { front: 'bite the bullet', back: 'To force yourself to do something difficult or unpleasant.', example: 'I finally bit the bullet and booked my test.' },
      { front: 'cut corners', back: 'To do something cheaply or quickly, lowering quality.', example: 'Don’t cut corners when preparing your answers.' },
      { front: 'in the long run', back: 'Over a long period; eventually.', example: 'Daily practice pays off in the long run.' },
      { front: 'get the hang of it', back: 'To learn how to do something with practice.', example: 'Once you get the hang of it, writing emails is easy.' },
      { front: 'go the extra mile', back: 'To make more effort than is expected.', example: 'She always goes the extra mile for her students.' },
      { front: 'hit the books', back: 'To study hard.', example: 'I need to hit the books before the test.' },
      { front: 'break the ice', back: 'To make people feel more comfortable at the start.', example: 'He told a joke to break the ice.' },
      { front: 'up in the air', back: 'Uncertain; not yet decided.', example: 'Our travel plans are still up in the air.' },
    ],
  },
  {
    id: 'grammar',
    label: 'Grammar Essentials',
    icon: '✏️',
    color: '#C8102E',
    desc: 'Rules that commonly cost points in Writing and Speaking.',
    cards: [
      { front: 'its vs. it’s', back: '"its" = possessive (the dog wagged its tail). "it’s" = it is / it has.', example: 'It’s raining, and the cat licked its paw.' },
      { front: 'fewer vs. less', back: '"fewer" for countable nouns; "less" for uncountable.', example: 'Fewer cars means less traffic.' },
      { front: 'Present perfect vs. past simple', back: 'Present perfect links past to now ("I have lived here for 5 years"); past simple is a finished time ("I lived there in 2019").', example: 'I have worked here since 2020. I worked in Toronto before that.' },
      { front: 'Subject–verb agreement', back: 'A singular subject takes a singular verb.', example: 'The list of items is on the desk (NOT "are").' },
      { front: 'affect vs. effect', back: '"affect" is usually a verb (to influence); "effect" is usually a noun (a result).', example: 'Stress can affect sleep; the effect is fatigue.' },
      { front: 'Articles a / an / the', back: 'Use "a/an" for non-specific singular nouns, "the" for specific ones.', example: 'I saw a dog. The dog was friendly.' },
      { front: 'Conditional (if + would)', back: 'Avoid "if I would"; use "if + past, … would".', example: 'If I had more time, I would travel more.' },
      { front: 'Comparatives', back: 'Use "-er/than" for short adjectives, "more … than" for longer ones.', example: 'This task is harder than the last, but more interesting than I expected.' },
      { front: 'Run-on sentences', back: 'Join independent clauses with a comma + conjunction or a period.', example: 'I studied hard, so I passed (NOT "I studied hard I passed").' },
      { front: 'Prepositions of time', back: '"at" times, "on" days/dates, "in" months/years.', example: 'The test is at 9 a.m. on Monday in June.' },
      { front: 'Gerund vs. infinitive', back: 'Some verbs take -ing (enjoy doing), others take "to" (want to do).', example: 'I enjoy reading and I want to improve.' },
      { front: 'Parallel structure', back: 'Items in a list should share the same grammatical form.', example: 'She likes reading, writing, and speaking (NOT "to speak").' },
    ],
  },
  {
    id: 'connectors',
    label: 'Linking Words & Connectors',
    icon: '🪢',
    color: '#6B4FAF',
    desc: 'Cohesion devices that raise your "coherence" sub-score.',
    cards: [
      { front: 'However', back: 'Contrast — introduces an opposing idea.', example: 'The plan is costly; however, it saves time.' },
      { front: 'Furthermore / Moreover', back: 'Addition — adds a stronger supporting point.', example: 'It is affordable. Furthermore, it is reliable.' },
      { front: 'Therefore / Consequently', back: 'Result — shows a cause-and-effect conclusion.', example: 'Sales dropped; therefore, we changed strategy.' },
      { front: 'For instance / For example', back: 'Illustration — introduces a specific example.', example: 'Many skills improve with practice — for instance, writing.' },
      { front: 'On the other hand', back: 'Contrast — presents an alternative view.', example: 'Cars are convenient; on the other hand, they pollute.' },
      { front: 'In addition', back: 'Addition — adds another related point.', example: 'In addition, the course includes free practice tests.' },
      { front: 'As a result', back: 'Result — links a cause to its outcome.', example: 'He practised daily and, as a result, scored CLB 10.' },
      { front: 'Nevertheless', back: 'Concession — "despite that", still true.', example: 'It was raining; nevertheless, we went out.' },
      { front: 'In conclusion', back: 'Summary — signals your closing statement.', example: 'In conclusion, regular practice is essential.' },
      { front: 'Although / Even though', back: 'Concession — introduces a contrasting clause.', example: 'Although it was hard, I finished the test.' },
    ],
  },
]

/* Flatten all cards with a stable global id "deckId:index". */
export function allFlashcards() {
  const out = []
  for (const deck of FLASHCARD_DECKS) {
    deck.cards.forEach((c, i) => {
      out.push({ ...c, id: `${deck.id}:${i}`, deckId: deck.id, deckLabel: deck.label, color: deck.color, icon: deck.icon })
    })
  }
  return out
}

export function deckById(id) {
  return FLASHCARD_DECKS.find(d => d.id === id) || null
}

export function cardsForDeck(deckId) {
  const deck = deckById(deckId)
  if (!deck) return []
  return deck.cards.map((c, i) => ({ ...c, id: `${deck.id}:${i}`, deckId: deck.id, deckLabel: deck.label, color: deck.color, icon: deck.icon }))
}

export const TOTAL_FLASHCARDS = FLASHCARD_DECKS.reduce((a, d) => a + d.cards.length, 0)
