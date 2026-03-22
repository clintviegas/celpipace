import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Sample question data keyed by part id ───────────────────── */
const SAMPLE_QUESTIONS = {
  L1: {
    title: 'Customer & Staff at the Library',
    instruction:
      'You will hear a conversation between a man and a woman at a public library. The woman is a library staff member, and the man is a customer who needs help locating a book.',
    scenario: 'Library — Customer Service',
    questions: [
      {
        id: 1,
        text: 'What is the main problem the customer is trying to solve?',
        options: [
          'A) His library card has expired.',
          'B) He cannot find the book he is looking for on the shelf.',
          'C) He wants to borrow more books than the limit allows.',
          'D) He has been charged a late fee he disagrees with.',
        ],
        answer: 1,
        explanation:
          'The man explains he checked the shelf where the system shows the book should be, but it is not there. The staff member then offers to help locate it. The other options are not mentioned.',
      },
      {
        id: 2,
        text: 'What does the staff member suggest as the first step?',
        options: [
          'A) Check whether another branch has the book.',
          'B) Place a hold on the book for a future date.',
          'C) Look in the returns cart near the front desk.',
          'D) Search the library catalog again on her computer.',
        ],
        answer: 2,
        explanation:
          'The staff member says the returns cart often has books that have been returned but not yet re-shelved. This is her first suggestion before any other action.',
      },
      {
        id: 3,
        text: 'What does the man decide to do by the end of the conversation?',
        options: [
          'A) Come back tomorrow when the book will definitely be available.',
          'B) Place a hold on the book so he is notified when it is ready.',
          'C) Borrow a different book on the same topic.',
          'D) Ask a manager to help locate the book.',
        ],
        answer: 1,
        explanation:
          'After the returns cart does not have the book, the staff member offers to place a hold. The man agrees this is the best option. He does not decide to come back tomorrow or borrow a different book.',
      },
    ],
  },
  L2: {
    title: 'Friends Planning a Weekend Trip',
    instruction:
      'You will hear a phone conversation between two friends, Sarah and Mark, who are planning a weekend trip. Listen carefully to what each person wants and what they finally decide.',
    scenario: 'Phone call — Weekend Plans',
    questions: [
      {
        id: 1,
        text: 'What does Sarah want to do for the weekend?',
        options: [
          'A) Stay in the city and visit a museum.',
          'B) Drive to the mountains for a hike.',
          'C) Book a hotel near the beach.',
          'D) Visit her family in another city.',
        ],
        answer: 1,
        explanation:
          "Sarah mentions she has been wanting to hike and suggests the mountains specifically. She doesn't mention the other options.",
      },
      {
        id: 2,
        text: "What is Mark's concern about the trip?",
        options: [
          'A) He does not like hiking.',
          'B) The weather forecast looks uncertain.',
          'C) He already made other plans for Saturday.',
          'D) His car is being repaired that weekend.',
        ],
        answer: 1,
        explanation:
          "Mark says he checked the weather and it might rain on Saturday. This is his main hesitation, not a personal dislike of hiking or conflicting plans.",
      },
      {
        id: 3,
        text: 'What do they agree to do?',
        options: [
          'A) Go hiking on Sunday instead of Saturday.',
          'B) Book a cabin for both nights to be safe.',
          'C) Wait and check the weather again before deciding.',
          'D) Cancel the trip and plan something closer to home.',
        ],
        answer: 0,
        explanation:
          "They agree to shift the hike to Sunday when the weather looks clearer. Sarah suggests this and Mark agrees it's a good compromise.",
      },
    ],
  },
  L3: {
    title: 'Community Centre Announcement',
    instruction:
      'You will hear an announcement from a community centre director about upcoming changes to the facility and new programs being offered this season.',
    scenario: 'Community Centre — Public Announcement',
    questions: [
      {
        id: 1,
        text: 'Why is the swimming pool temporarily closed?',
        options: [
          'A) The pool is being expanded to add more lanes.',
          'B) Scheduled safety inspections and filter upgrades are underway.',
          'C) Staff are on a two-week training program.',
          'D) The pool water failed a health inspection.',
        ],
        answer: 1,
        explanation:
          'The director states the pool is closed for scheduled maintenance including safety checks and filter upgrades. No mention of expansion, staff training, or a failed inspection.',
      },
      {
        id: 2,
        text: 'Which new program is being introduced for seniors?',
        options: [
          'A) A Wednesday morning yoga class.',
          'B) An outdoor walking club on Mondays.',
          'C) A low-impact aquatic fitness session.',
          'D) A community gardening workshop on Fridays.',
        ],
        answer: 2,
        explanation:
          'The director specifically introduces a new aquatic fitness program designed for seniors, noting it is low-impact and suitable for all mobility levels.',
      },
      {
        id: 3,
        text: 'How can residents register for the new programs?',
        options: [
          'A) By calling the front desk during business hours.',
          'B) By filling out a paper form at the reception.',
          'C) Through the community centre website or the mobile app.',
          'D) By emailing the program coordinator directly.',
        ],
        answer: 2,
        explanation:
          'The director says registration is available through the website and the updated mobile app, which now supports online sign-ups. No mention of phone or paper registration.',
      },
    ],
  },
  L4: {
    title: 'News Report — City Transit Expansion',
    instruction:
      'You will hear a short news report from a Canadian radio station about a major announcement from the city transit authority.',
    scenario: 'Radio News — City Transit',
    questions: [
      {
        id: 1,
        text: 'What is the main topic of this news report?',
        options: [
          'A) A strike by city transit workers.',
          'B) Plans to extend the subway line to two new neighbourhoods.',
          'C) An increase in transit fares starting next month.',
          'D) A new electric bus fleet purchased by the city.',
        ],
        answer: 1,
        explanation:
          'The report opens by announcing that city council has approved a subway extension project covering two new neighbourhoods. The other topics are not the focus of this report.',
      },
      {
        id: 2,
        text: 'According to the report, when is the project expected to be completed?',
        options: [
          'A) By the end of next year.',
          'B) Within 18 months.',
          'C) In approximately three years.',
          'D) Within five years, pending further funding.',
        ],
        answer: 2,
        explanation:
          'The transit authority spokesperson states the project timeline is approximately three years from the start of construction, subject to standard weather and supply conditions.',
      },
    ],
  },
  L5: {
    title: 'Panel Discussion — Remote Work Policy',
    instruction:
      'You will hear three speakers — a company manager, an employee, and a business consultant — discussing a new company remote work policy. Listen carefully to each person\'s position.',
    scenario: 'Panel — Workplace Policy',
    questions: [
      {
        id: 1,
        text: 'What is the manager\'s main argument in favour of the new policy?',
        options: [
          "A) Remote work saves the company money on office space.",
          "B) Employees are more focused at home with fewer interruptions.",
          "C) The policy increases employee satisfaction and reduces turnover.",
          "D) Remote teams perform better on complex creative tasks.",
        ],
        answer: 2,
        explanation:
          "The manager says the policy was introduced primarily because exit surveys showed flexibility was a major factor in employees leaving. Reducing turnover is the main justification given.",
      },
      {
        id: 2,
        text: "What concern does the employee raise?",
        options: [
          "A) The internet connection at home is unreliable.",
          "B) Remote work makes it harder to separate personal and work time.",
          "C) Team collaboration suffers when people are not in the same office.",
          "D) Promotions are harder to get for remote workers.",
        ],
        answer: 1,
        explanation:
          "The employee mentions that working from home has blurred the boundaries between work and personal life, making it hard to switch off. This is the specific concern raised.",
      },
      {
        id: 3,
        text: "Which point do the manager and the consultant BOTH agree on?",
        options: [
          "A) All employees should have the option to work from home full time.",
          "B) In-person meetings should be held at least once a month.",
          "C) Clear communication guidelines are essential for remote teams.",
          "D) The policy should be reviewed after six months based on productivity data.",
        ],
        answer: 2,
        explanation:
          "Both the manager and consultant independently mention that teams need clear communication protocols and expectations to make remote work effective. This is the shared point.",
      },
    ],
  },
  L6: {
    title: 'Debate — Should Cities Ban Single-Use Plastics?',
    instruction:
      'You will hear two speakers presenting contrasting viewpoints on whether cities should ban single-use plastics. Speaker A supports the ban; Speaker B opposes it.',
    scenario: 'Debate Format — Environmental Policy',
    questions: [
      {
        id: 1,
        text: 'What is Speaker A\'s main argument for the ban?',
        options: [
          "A) Single-use plastics are more expensive than reusable alternatives.",
          "B) Most plastics are not actually recyclable despite what labels say.",
          "C) A ban will drive innovation in sustainable packaging industries.",
          "D) Other countries have already banned plastics successfully.",
        ],
        answer: 1,
        explanation:
          "Speaker A argues that the recycling system fails in practice — the majority of single-use plastics end up in landfill despite being labelled recyclable. This is the central point of the argument for the ban.",
      },
      {
        id: 2,
        text: 'What is Speaker B\'s main concern about the ban?',
        options: [
          "A) Reusable bags are inconvenient for shoppers.",
          "B) The ban would disproportionately hurt low-income consumers.",
          "C) Plastic alternatives are less hygienic in food service.",
          "D) The government has no authority to regulate packaging.",
        ],
        answer: 1,
        explanation:
          "Speaker B argues that low-income households rely on cheap single-use products and that banning them without affordable alternatives places an unfair financial burden on poorer communities.",
      },
      {
        id: 3,
        text: 'What do both speakers agree on?',
        options: [
          "A) An outright ban is the only effective solution.",
          "B) Consumer education alone is insufficient to solve the plastic problem.",
          "C) Businesses should voluntarily phase out plastics without regulation.",
          "D) The issue requires more scientific research before action is taken.",
        ],
        answer: 1,
        explanation:
          "Despite disagreeing on the solution, both speakers acknowledge that relying on consumers to make better choices without any structural or regulatory change is not enough. This is the one point of shared ground.",
      },
    ],
  },
}

/* ── Difficulty colour helper ─────────────────────────────────── */
const DIFF_COLOURS = {
  'intermediate':       { bg: '#EEF7FF', text: '#4A90D9' },
  'upper-intermediate': { bg: '#FFF8EC', text: '#C8972A' },
  'advanced':           { bg: '#FEF2F2', text: '#D91B1B' },
}

/* ── Single question card ─────────────────────────────────────── */
function QuestionCard({ q, index, revealed }) {
  const [selected, setSelected] = useState(null)
  const answered = selected !== null
  const correct = selected === q.answer

  return (
    <div className={`ps-q-card${answered ? (correct ? ' ps-q-correct' : ' ps-q-wrong') : ''}`}>
      <div className="ps-q-num">Question {index + 1}</div>
      <p className="ps-q-text">{q.text}</p>

      <div className="ps-q-options">
        {q.options.map((opt, i) => {
          let cls = 'ps-q-option'
          if (answered) {
            if (i === q.answer) cls += ' ps-opt-correct'
            else if (i === selected && i !== q.answer) cls += ' ps-opt-wrong'
            else cls += ' ps-opt-dim'
          }
          if (selected === i) cls += ' ps-opt-selected'
          return (
            <button
              key={i}
              className={cls}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
            >
              {opt}
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {(answered || revealed) && (
          <motion.div
            className={`ps-q-explanation${correct && answered ? ' ps-exp-correct' : ''}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
          >
            <span className="ps-exp-icon">{correct && answered ? '✅' : '📘'}</span>
            <span>{q.explanation}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Audio Player Placeholder ─────────────────────────────────── */
function AudioPlayer({ started, onStart }) {
  const [playing, setPlaying] = useState(false)

  if (!started) {
    return (
      <div className="ps-audio-start">
        <div className="ps-audio-icon">🎧</div>
        <p>Press <strong>Start</strong> to reveal the audio and begin the practice set.</p>
        <button className="ps-start-btn" onClick={onStart}>
          ▶ Start Practice
        </button>
      </div>
    )
  }

  return (
    <div className="ps-audio-player">
      <div className="ps-audio-bar">
        <button
          className={`ps-audio-play-btn${playing ? ' ps-audio-playing' : ''}`}
          onClick={() => setPlaying(v => !v)}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <div className="ps-audio-track">
          <div className="ps-audio-progress" style={{ width: playing ? '35%' : '0%' }} />
        </div>
        <span className="ps-audio-time">0:00 / 1:45</span>
      </div>
      <div className="ps-audio-note">
        🔊 Audio plays once on the real test. Replay is available here for study purposes.
      </div>
    </div>
  )
}

/* ── Score Summary ────────────────────────────────────────────── */
function ScoreSummary({ questions }) {
  // Can't know answered count here — just show the key reveal message
  return (
    <div className="ps-score-summary">
      <span className="ps-score-icon">📋</span>
      <span>All answers and explanations are now visible below each question.</span>
    </div>
  )
}

/* ── Main PracticeSetPage ─────────────────────────────────────── */
export default function PracticeSetPage({ part, setPage }) {
  const [started, setStarted] = useState(false)
  const [revealed, setRevealed] = useState(false)

  const data = SAMPLE_QUESTIONS[part?.id] || SAMPLE_QUESTIONS.L1
  const partId = part?.id || 'L1'

  const diffKey = (part?.difficulty || 'Intermediate').toLowerCase().replace(' ', '-')
  const diffStyle = DIFF_COLOURS[diffKey] || DIFF_COLOURS['intermediate']

  return (
    <div className="ps-root">

      {/* ── Breadcrumb ── */}
      <div className="ps-breadcrumb">
        <button className="ps-bc-link" onClick={() => setPage('home')}>Home</button>
        <span className="ps-bc-sep">›</span>
        <button className="ps-bc-link" onClick={() => setPage('listening')}>Listening</button>
        <span className="ps-bc-sep">›</span>
        <button className="ps-bc-link" onClick={() => setPage('listening')}>
          {partId} · {part?.label || 'Problem Solving'}
        </button>
        <span className="ps-bc-sep">›</span>
        <span className="ps-bc-current">{data.title}</span>
      </div>

      {/* ── Practice Header ── */}
      <div className="ps-header">
        <div className="ps-header-inner">
          <div className="ps-header-top">
            <div className="ps-header-meta">
              <span className="ps-header-section">🎧 Listening</span>
              <span className="ps-bc-sep">›</span>
              <span className="ps-header-part" style={{ color: '#4A90D9' }}>
                {partId} · {part?.label || 'Problem Solving'}
              </span>
            </div>
            <span
              className="ps-diff-badge"
              style={{ background: diffStyle.bg, color: diffStyle.text }}
            >
              {part?.difficulty || 'Intermediate'}
            </span>
          </div>
          <h1 className="ps-title">{data.title}</h1>
          <p className="ps-scenario">📍 {data.scenario}</p>
        </div>

        {/* ── Nav arrows (prev / next) ── */}
        <div className="ps-nav-arrows">
          <button className="ps-arrow-btn" onClick={() => setPage('listening')}>← Back to {partId}</button>
          <button className="ps-arrow-btn ps-arrow-next">Next Practice →</button>
        </div>
      </div>

      <div className="ps-body">

        {/* ── Instruction Card ── */}
        <div className="ps-instruction-card">
          <div className="ps-instr-label">Instruction</div>
          <p className="ps-instr-text">{data.instruction}</p>

          <AudioPlayer started={started} onStart={() => setStarted(true)} />
        </div>

        {/* ── Questions ── */}
        <AnimatePresence>
          {started && (
            <motion.div
              className="ps-questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="ps-questions-header">
                <span className="ps-questions-title">
                  {data.questions.length} Questions
                </span>
                <button
                  className="ps-reveal-btn"
                  onClick={() => setRevealed(v => !v)}
                >
                  {revealed ? '🙈 Hide Answer Key' : '📋 Show Answer Key'}
                </button>
              </div>

              {revealed && <ScoreSummary questions={data.questions} />}

              {data.questions.map((q, i) => (
                <QuestionCard key={q.id} q={q} index={i} revealed={revealed} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Back to part link ── */}
        {started && (
          <div className="ps-back-bar">
            <button className="ps-back-link" onClick={() => setPage('listening')}>
              ← Back to {part?.label || 'Problem Solving'} Questions
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
