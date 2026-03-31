import { useState, useRef } from 'react'
import { SECTIONS, MOCK_QUESTIONS } from '../data/constants'

function LockBadge() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C8972A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function SpeakingTimer({ prepTime, speakTime }) {
  const [phase, setPhase] = useState('idle') // idle | prep | speaking | done
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef(null)

  const start = () => {
    setPhase('prep')
    setSeconds(prepTime)
    let remaining = prepTime
    const id = setInterval(() => {
      remaining -= 1
      setSeconds(remaining)
      if (remaining <= 0) {
        clearInterval(id)
        setPhase('speaking')
        let speak = speakTime
        setSeconds(speak)
        const id2 = setInterval(() => {
          speak -= 1
          setSeconds(speak)
          if (speak <= 0) {
            clearInterval(id2)
            setPhase('done')
            setSeconds(0)
          }
        }, 1000)
        timerRef.current = id2
      }
    }, 1000)
    timerRef.current = id
  }

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase('idle')
    setSeconds(0)
  }

  const color = phase === 'prep' ? '#C8972A' : phase === 'speaking' ? '#C8102E' : '#2D8A56'
  const label = phase === 'idle' ? null : phase === 'prep' ? 'PREP TIME' : phase === 'speaking' ? 'SPEAKING' : 'TIME UP'

  return (
    <div className="speaking-timer">
      <div className="timer-badges">
        <span className="timer-badge timer-badge-prep">Prep: {prepTime}s</span>
        <span className="timer-badge timer-badge-speak">Speak: {speakTime}s</span>
      </div>

      {phase !== 'idle' && (
        <div className="timer-display" style={{ borderColor: color }}>
          <div className="timer-phase" style={{ color }}>{label}</div>
          <div className="timer-count" style={{ color }}>{seconds}s</div>
        </div>
      )}

      {phase === 'done' && (
        <div className="timer-done">✓ Time up! Review your response.</div>
      )}

      <div className="timer-controls">
        {(phase === 'idle' || phase === 'done') && (
          <button className="btn btn-primary" onClick={start}>
            {phase === 'done' ? 'Retry' : '▶ Start Timer'}
          </button>
        )}
        {phase !== 'idle' && phase !== 'done' && (
          <button className="btn btn-outline" onClick={reset}>✕ Reset</button>
        )}
      </div>

      <div className="speaking-tip">
        💡 <strong>Tip:</strong> Record yourself on your phone and play it back. Listen for fluency, whether you addressed all points, and pronunciation.
      </div>
    </div>
  )
}

export default function PracticePage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0]?.id ?? 'listening')
  const [activeQ, setActiveQ] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [writingText, setWritingText] = useState('')

  const section = SECTIONS.find(s => s.id === activeSection)
  const questions = MOCK_QUESTIONS[activeSection] || []

  const handleQuestionClick = (q) => {
    if (!q.free) { setShowUpgrade(true); setActiveQ(null); return }
    setActiveQ(q)
    setSelectedAnswer(null)
    setShowResult(false)
    setWritingText('')
    setShowUpgrade(false)
  }

  const handleAnswer = (idx) => {
    if (showResult) return
    setSelectedAnswer(idx)
    setShowResult(true)
  }

  return (
    <div className="page-wrap">
      {/* Section tabs */}
      <div className="section-tabs">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`section-tab${activeSection === s.id ? ' active' : ''}`}
            style={activeSection === s.id ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
            onClick={() => { setActiveSection(s.id); setActiveQ(null); setShowUpgrade(false) }}
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      <div className="practice-layout">
        {/* ── Question list ── */}
        <div className="qlist">
          <div className="qlist-header">
            <div className="qlist-title">{section?.icon} {section?.label}</div>
            <div className="qlist-meta">{section?.duration} · {section?.celpipParts} parts in full test</div>
          </div>
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`qitem${activeQ?.id === q.id ? ' qitem-active' : ''}${!q.free ? ' qitem-locked' : ''}`}
              style={activeQ?.id === q.id ? { borderColor: section?.color, background: section?.color + '12' } : {}}
              onClick={() => handleQuestionClick(q)}
            >
              <div>
                <div className="qitem-label">Q{i + 1}: {q.type}</div>
                <div className="qitem-sub">{q.scenario}</div>
              </div>
              {q.free
                ? <span className="free-badge" style={{ color: section?.color }}>FREE</span>
                : <LockBadge />
              }
            </div>
          ))}
        </div>

        {/* ── Question content ── */}
        <div className="qcontent">

          {/* Upgrade prompt */}
          {showUpgrade && (
            <div className="upgrade-card">
              <div className="upgrade-lock"><LockBadge /></div>
              <h3 className="upgrade-title">Unlock All {section?.questions} Questions</h3>
              <p className="upgrade-body">
                Upgrade to Pro to access all parts, with detailed explanations and expert feedback.
              </p>
              <button className="btn btn-primary btn-lg">Upgrade to Pro — $19/mo</button>
            </div>
          )}

          {/* Empty state */}
          {!activeQ && !showUpgrade && (
            <div className="qempty">
              <div className="qempty-icon">{section?.icon}</div>
              <p>Select a question from the list to begin</p>
            </div>
          )}

          {/* Active question */}
          {activeQ && !showUpgrade && (
            <div className="qcard">
              <div className="qcard-type" style={{ background: section?.color + '18', color: section?.color }}>
                {activeQ.type}
              </div>

              {activeQ.prompt && (
                <p className="qcard-prompt">{activeQ.prompt}</p>
              )}

              {activeQ.passage && (
                <div className="qcard-passage">{activeQ.passage}</div>
              )}

              {/* Multiple choice */}
              {activeQ.options && (
                <>
                  <h3 className="qcard-question">{activeQ.question}</h3>
                  <div className="options-list">
                    {activeQ.options.map((opt, idx) => {
                      const isCorrect = idx === activeQ.correct
                      const isSelected = selectedAnswer === idx
                      let cls = 'option'
                      if (showResult && isCorrect) cls += ' option-correct'
                      else if (showResult && isSelected && !isCorrect) cls += ' option-wrong'
                      return (
                        <button key={idx} className={cls} onClick={() => handleAnswer(idx)} disabled={showResult}>
                          <span className="option-letter" style={isSelected ? { background: section?.color, color: '#fff' } : {}}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {showResult && activeQ.explanation && (
                    <div className="explanation">
                      <div className="explanation-label">✓ Explanation</div>
                      <p>{activeQ.explanation}</p>
                    </div>
                  )}
                </>
              )}

              {/* Writing prompt */}
              {activeQ.wordLimit && (
                <div className="writing-wrap">
                  <div className="writing-meta">
                    <span className="writing-meta-chip">⏱ {activeQ.timeLimit}</span>
                    <span className="writing-meta-chip">📝 {activeQ.wordLimit}</span>
                  </div>
                  <textarea
                    className="writing-area"
                    value={writingText}
                    onChange={e => setWritingText(e.target.value)}
                    placeholder="Start writing your response here…"
                  />
                  <div className="word-count">
                    Word count: <strong>{writingText.trim() ? writingText.trim().split(/\s+/).length : 0}</strong>
                  </div>
                </div>
              )}

              {/* Speaking prompt */}
              {activeQ.prepTime && (
                <SpeakingTimer prepTime={activeQ.prepTime} speakTime={activeQ.speakTime} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
