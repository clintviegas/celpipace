// /api/_lib/score-anchors.js
// Calibration anchors injected into the scoring system prompt as few-shot
// examples. The model uses these to ground its CLB band judgments — the single
// largest accuracy lever short of fine-tuning.
//
// Each anchor pairs a real-looking response with the band-by-band scores a
// trained CELPIP examiner would assign. Tune these over time as you collect
// real scored data; the prompt path picks them up automatically.

const W1_ANCHORS = [
  {
    clb: 6,
    prompt: 'Write an email to your landlord asking for a repair.',
    response:
      "Dear Mr. Smith,\nMy name is John. I live in apartment 3. I have a problem. My kitchen tap is broken and water is coming out. It is making the floor wet. Please you can fix it soon. I am at home in evening time after 6 PM. Thank you.\nJohn",
    scores: { taskFulfillment: 6, coherence: 6, vocabulary: 6, readability: 6 },
    note: 'Addresses prompt minimally. Simple sentences, basic vocab, frequent small grammar slips ("Please you can fix").',
  },
  {
    clb: 8,
    prompt: 'Write an email to your landlord asking for a repair.',
    response:
      "Dear Mr. Smith,\n\nI am writing to let you know that the tap in my kitchen has been leaking since Sunday evening. Water is dripping continuously onto the floor and I am worried it could damage the cabinet below.\n\nCould you please arrange for a plumber to come and fix it this week? I am usually home after 6 PM on weekdays, and any time on Saturday. Please let me know what time works best so I can be available to let them in.\n\nThank you for looking into this quickly.\n\nKind regards,\nJohn Reyes",
    scores: { taskFulfillment: 8, coherence: 8, vocabulary: 8, readability: 8 },
    note: 'Clear purpose, polite tone, full structure. Vocabulary adequate ("leaking", "continuously", "arrange"). Minor stiffness but no errors.',
  },
  {
    clb: 9,
    prompt: 'Write an email to your landlord asking for a repair.',
    response:
      "Dear Mr. Smith,\n\nI hope this message finds you well. I am writing to report a plumbing issue in my apartment that needs urgent attention. The kitchen tap has been leaking steadily since Sunday evening, and despite my attempts to tighten it, water continues to drip onto the floor and pool around the base of the cabinet.\n\nI am concerned that prolonged exposure could warp the wood or seep into the unit below. Would it be possible to have a plumber visit this week to take a look? I am generally available after 6 PM on weekdays and all day Saturday, but I am happy to adjust to fit the plumber's schedule.\n\nPlease let me know what time works on your end, and I will make sure to be home to grant access.\n\nThank you for your prompt attention to this matter.\n\nWarm regards,\nJohn Reyes",
    scores: { taskFulfillment: 9, coherence: 9, vocabulary: 9, readability: 9 },
    note: 'Well-developed. Strong cohesion ("despite my attempts", "prolonged exposure"). Confident register, no errors.',
  },
  {
    clb: 11,
    prompt: 'Write an email to your landlord asking for a repair.',
    response:
      "Dear Mr. Smith,\n\nI hope you are well. I'm writing to flag a recurring plumbing problem in unit 3 that I believe warrants prompt intervention. The kitchen tap, which I first reported informally last month, has now developed a persistent leak — water has been pooling beneath the cabinet since Sunday, and I'm increasingly concerned about long-term moisture damage to the cabinetry and potential seepage into the apartment below.\n\nGiven that this is the second incident with the same fixture, I'd suggest replacing the tap entirely rather than simply tightening the seals. I'd be happy to be home for the plumber any weekday after six or at your convenience on Saturday — whatever fits the contractor's availability.\n\nDo let me know how you'd like to proceed, and please feel free to forward the plumber my number directly if that simplifies coordination.\n\nMany thanks for your attention,\nJohn Reyes",
    scores: { taskFulfillment: 11, coherence: 11, vocabulary: 11, readability: 11 },
    note: 'Native-like control: nuanced register ("warrants prompt intervention"), reasoned proposal (replace vs tighten), proactive offer (forward number). No errors.',
  },
]

const W2_ANCHORS = [
  {
    clb: 6,
    prompt: 'Some people prefer to live in a big city. Others prefer a small town. Which do you prefer and why?',
    response:
      "I want to live in big city. Big city is good because there are many jobs and many things to do. You can go to mall, restaurant, and cinema. Also transportation is good, there are buses and trains. Small town is quiet but boring. There is no much things. So I prefer big city for my life and my future.",
    scores: { taskFulfillment: 6, coherence: 6, vocabulary: 6, readability: 6 },
    note: 'Position stated, two reasons given. Article and plural errors ("big city" without "a", "no much things"). Limited elaboration.',
  },
  {
    clb: 8,
    prompt: 'Some people prefer to live in a big city. Others prefer a small town. Which do you prefer and why?',
    response:
      "I would prefer to live in a big city rather than a small town. The main reason is opportunity. Cities offer a much wider range of jobs, especially in technology and finance, which are the fields I want to work in. It would be difficult to find similar positions in a small town.\n\nSecondly, cities have better access to services like hospitals, universities, and entertainment. I enjoy going to concerts and trying different restaurants, and these are not easily available in small towns.\n\nOf course, small towns are quieter and the cost of living is lower, but for me the career and lifestyle benefits of a big city are more important. That is why I would choose a big city.",
    scores: { taskFulfillment: 8, coherence: 8, vocabulary: 8, readability: 8 },
    note: 'Clear position, two developed reasons, brief acknowledgment of the other side. Functional cohesion, accurate grammar.',
  },
  {
    clb: 9,
    prompt: 'Some people prefer to live in a big city. Others prefer a small town. Which do you prefer and why?',
    response:
      "Although both big cities and small towns have their merits, I personally prefer life in a big city for two compelling reasons: professional opportunity and cultural variety.\n\nFirst, large cities are economic engines. They concentrate industries, employers, and networking events, which makes career growth significantly faster. As someone pursuing a career in software, I find that the density of tech companies in a city like Toronto offers access to mentors, meet-ups, and roles that would simply not exist in a small town.\n\nSecond, cities are culturally rich. The ability to attend a film festival on Friday and a Filipino food market on Saturday genuinely improves my quality of life. Small towns, while peaceful, tend to offer a narrower range of experiences.\n\nI acknowledge that the trade-offs — higher rent and a faster pace — are real, but for me they are worth paying. Overall, the energy and possibilities of a big city outweigh the comfort of a small town.",
    scores: { taskFulfillment: 9, coherence: 9, vocabulary: 9, readability: 9 },
    note: 'Strong thesis, two well-developed body paragraphs with concrete examples, balanced acknowledgment, confident conclusion. Sophisticated phrasing.',
  },
  {
    clb: 11,
    prompt: 'Some people prefer to live in a big city. Others prefer a small town. Which do you prefer and why?',
    response:
      "The choice between urban and small-town living is rarely about which is objectively better — it is about which set of trade-offs aligns with your priorities at a particular life stage. For me, in my late twenties and building a career, a big city is by far the better fit, for reasons that go beyond the obvious.\n\nThe most underrated benefit of a city is optionality. Career pivots are dramatically easier when a hundred adjacent employers sit within a fifteen-minute commute; social reinvention is easier when you can step into a new community by hopping on a subway. Small towns, however charming, tend to anchor you to a smaller set of trajectories.\n\nThe second benefit is collisions — the unplanned encounters that big cities make possible. The connections that have shaped my career came not from job boards but from chance conversations at a coworking space and a friend-of-a-friend dinner. Those encounters require density.\n\nNone of this is to dismiss the genuine appeal of small towns: tighter community, lower cost of living, real silence. I will likely move to one eventually. But for now, the optionality and serendipity of a city outweigh the trade-offs, and I would choose it again without hesitation.",
    scores: { taskFulfillment: 11, coherence: 11, vocabulary: 11, readability: 11 },
    note: 'Native-level control. Original framing ("optionality", "collisions"), nuanced concession, polished register, varied syntax. No errors.',
  },
]

const SPEAKING_ANCHORS = [
  {
    clb: 6,
    prompt: 'Describe a place where you like to spend your free time.',
    transcript:
      "Okay um I like to go to the park near my house. It is a big park. There is grass and trees and a small lake. I go there on weekend with my family. We bring food and we eat outside. Sometimes I walk with my dog. The park is quiet and I feel relax. Also there is a playground for children. Many people come there. I like the park because it is close and free.",
    scores: { taskFulfillment: 6, coherence: 6, vocabulary: 6, listenability: 6 },
    note: 'Addresses task, simple list of details. Frequent "and" linkage, minor grammar ("on weekend", "feel relax"). Natural pacing, no major fluency breaks.',
  },
  {
    clb: 8,
    prompt: 'Describe a place where you like to spend your free time.',
    transcript:
      "One place I really enjoy spending time at is the local library downtown. It's a quiet, well-lit building with comfortable seating and a great selection of books. I usually go there on Saturday mornings to read or to catch up on personal projects. What I like most is the atmosphere — it's calm but not empty, so I can focus without feeling isolated. They also have a small cafe on the first floor, which is perfect when I need a break. Honestly, it has become my favorite weekend spot.",
    scores: { taskFulfillment: 8, coherence: 8, vocabulary: 8, listenability: 8 },
    note: 'Clear topic + reasons + supporting details. Natural transitions ("What I like most", "Honestly"). No grammar issues, conversational flow.',
  },
  {
    clb: 9,
    prompt: 'Describe a place where you like to spend your free time.',
    transcript:
      "If I had to pick one place, it would definitely be a small café called Pilot Coffee on Queen Street. It's the kind of place where I lose track of time. The interior has these big windows that flood the space with natural light, exposed brick walls, and quiet jazz playing in the background — it just feels designed for thinking. I usually go there on Sunday mornings with a book or my laptop, order a flat white, and settle in for two or three hours. What makes it special isn't really the coffee, though it's great — it's that I always leave feeling more focused than when I arrived. It's become my unofficial weekend office.",
    scores: { taskFulfillment: 9, coherence: 9, vocabulary: 9, listenability: 9 },
    note: 'Vivid concrete details, smooth pacing, idiomatic language ("lose track of time", "unofficial weekend office"). Strong listenability.',
  },
  {
    clb: 11,
    prompt: 'Describe a place where you like to spend your free time.',
    transcript:
      "There's a bench at the eastern edge of High Park, just where the path opens up onto the lake, and that's probably the spot I return to most. It's nothing remarkable to look at — just a wooden bench facing west — but the timing is what makes it work. I tend to walk over there on Sunday evenings, right before sunset, when the light flattens out across the water and the joggers start thinning out. I'll bring a notebook, sometimes nothing at all, and just sit for thirty or forty minutes. It's the closest thing I have to a weekly reset. I think there's something underrated about having a small, fixed ritual built around a single place — it gives the week a kind of rhythm that I'd otherwise lose.",
    scores: { taskFulfillment: 11, coherence: 11, vocabulary: 11, listenability: 11 },
    note: 'Original observation, evocative imagery, sophisticated phrasing ("light flattens out", "weekly reset"), reflective conclusion. Native-like cadence.',
  },
]

function formatWritingAnchor(a) {
  return `--- CLB ${a.clb} ANCHOR ---
PROMPT: ${a.prompt}
RESPONSE:
${a.response}
SCORES: TaskFulfillment=${a.scores.taskFulfillment}, Coherence=${a.scores.coherence}, Vocabulary=${a.scores.vocabulary}, Readability=${a.scores.readability}
EXAMINER NOTE: ${a.note}`
}

function formatSpeakingAnchor(a) {
  return `--- CLB ${a.clb} ANCHOR ---
PROMPT: ${a.prompt}
TRANSCRIPT:
${a.transcript}
SCORES: TaskFulfillment=${a.scores.taskFulfillment}, Coherence=${a.scores.coherence}, Vocabulary=${a.scores.vocabulary}, Listenability=${a.scores.listenability}
EXAMINER NOTE: ${a.note}`
}

/**
 * Build the calibration block for the writing system prompt.
 * @param {'W1'|'W2'} taskType
 */
export function buildWritingAnchorBlock(taskType) {
  const anchors = taskType === 'W1' ? W1_ANCHORS : W2_ANCHORS
  const formatted = anchors.map(formatWritingAnchor).join('\n\n')
  return `CALIBRATION ANCHORS — use these as your scoring reference. A response should score the band whose anchor it most resembles in linguistic control, organization, and task coverage.

${formatted}

END OF ANCHORS.`
}

/**
 * Build the calibration block for the speaking system prompt.
 * Currently task-agnostic — the same set covers S1–S8 well enough as a
 * calibration baseline. Replace with per-task anchors when you have data.
 */
export function buildSpeakingAnchorBlock() {
  const formatted = SPEAKING_ANCHORS.map(formatSpeakingAnchor).join('\n\n')
  return `CALIBRATION ANCHORS — use these as your scoring reference. A transcript should score the band whose anchor it most resembles in fluency, organization, vocabulary, and task coverage.

${formatted}

END OF ANCHORS.`
}
