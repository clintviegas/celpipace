import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SCORE_LEVELS } from '../data/constants'
import SEO from '../components/SEO'

/* ── CRS points table per CLB per skill (FSW core points) ── */
const CLB_CRS = {
  12: 34, 11: 34, 10: 34,
  9:  31,
  8:  23,
  7:  17,
  6:   9,
  5:   6,
  4:   0,
}

const SKILLS = [
  { id: 'listening', label: 'Listening', icon: '🎧', color: '#4A90D9', colorLight: '#EEF4FF' },
  { id: 'reading',   label: 'Reading',   icon: '📖', color: '#2D8A56', colorLight: '#F0FDF4' },
  { id: 'writing',   label: 'Writing',   icon: '✍️',  color: '#C8972A', colorLight: '#FFFBEB' },
  { id: 'speaking',  label: 'Speaking',  icon: '🎙️', color: '#C8102E', colorLight: '#FEF2F2' },
]

const CLB_LABELS = [4, 5, 6, 7, 8, 9, 10, 11, 12]

const PR_PROGRAMS = [
  { name: 'Federal Skilled Worker (FSW)',    minClb: 7, note: 'CLB 7 in all four skills' },
  { name: 'Canadian Experience Class (CEC)', minClb: 7, note: 'CLB 7 (NOC 0/A) · CLB 5 (NOC B)' },
  { name: 'Provincial Nominee Programs',     minClb: 5, note: 'CLB 5–7 (varies by province)' },
  { name: 'Atlantic Immigration Program',    minClb: 4, note: 'CLB 4–5 minimum' },
]

const CLB_DESCS = {
  4: 'Basic', 5: 'Adequate', 6: 'Developing',
  7: 'Intermediate', 8: 'Strong', 9: 'Advanced',
  10: 'Exceptional', 11: 'Expert', 12: 'Mastery',
}

function CLBSelector({ value, onChange, color }) {
  return (
    <div className="clb-selector">
      <button
        className="clb-btn"
        onClick={() => onChange(Math.max(4, value - 1))}
        disabled={value <= 4}
        style={{ color }}
      >
        −
      </button>
      <div className="clb-value-wrap" style={{ borderColor: color + '40', background: color + '0D' }}>
        <span className="clb-value" style={{ color }}>{value}</span>
        <span className="clb-desc">{CLB_DESCS[value]}</span>
      </div>
      <button
        className="clb-btn"
        onClick={() => onChange(Math.min(12, value + 1))}
        disabled={value >= 12}
        style={{ color }}
      >
        +
      </button>
    </div>
  )
}

export default function ScoresPage() {
  const navigate = useNavigate()
  const [clbScores, setClbScores] = useState({ listening: 7, reading: 7, writing: 7, speaking: 7 })
  const [activeTab, setActiveTab] = useState('tracker')

  const setSkill = (id, val) => setClbScores(prev => ({ ...prev, [id]: val }))

  const totalCRS = useMemo(
    () => Object.values(clbScores).reduce((sum, v) => sum + (CLB_CRS[v] ?? 0), 0),
    [clbScores]
  )

  const minClb = Math.min(...Object.values(clbScores))
  const maxPossibleCRS = 136
  const crsBarPct = Math.round((totalCRS / maxPossibleCRS) * 100)

  const crsGains = SKILLS.map(s => {
    const current  = CLB_CRS[clbScores[s.id]] ?? 0
    const improved = CLB_CRS[Math.min(12, clbScores[s.id] + 1)] ?? 0
    return { ...s, gain: improved - current }
  })

  return (
    <div className="page-wrap">
      <SEO
        title="CLB Score Tracker & CRS Calculator"
        description="Track your CELPIP CLB scores across all 4 sections, see your live CRS points total, and check PR program eligibility for Express Entry."
        canonical="/scores"
      />

      {/* Tabs */}
      <div className="scores-tabs">
        <button
          className={`scores-tab${activeTab === 'tracker' ? ' scores-tab--active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          🎯 Progress Tracker
        </button>
        <button
          className={`scores-tab${activeTab === 'levels' ? ' scores-tab--active' : ''}`}
          onClick={() => setActiveTab('levels')}
        >
          📊 CLB Score Levels
        </button>
      </div>

      {/* ── TAB 1: Progress Tracker ── */}
      {activeTab === 'tracker' && (
        <div className="tracker-root">

          <div className="tracker-intro">
            <h2 className="tracker-intro-title">Your Language Score Tracker</h2>
            <p className="tracker-intro-sub">
              Set your current or target CLB score for each skill. CRS language points and PR eligibility update in real time.
            </p>
          </div>

          {/* Skill cards */}
          <div className="tracker-skills">
            {SKILLS.map((s, i) => {
              const clb    = clbScores[s.id]
              const pts    = CLB_CRS[clb] ?? 0
              const barPct = Math.round(((clb - 4) / 8) * 100)

              return (
                <motion.div
                  key={s.id}
                  className="tracker-skill-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  <div className="tracker-skill-top">
                    <div className="tracker-skill-icon" style={{ background: s.colorLight }}>
                      {s.icon}
                    </div>
                    <div className="tracker-skill-info">
                      <span className="tracker-skill-name">{s.label}</span>
                      <span className="tracker-skill-pts" style={{ color: s.color }}>
                        {pts} CRS pts
                      </span>
                    </div>
                  </div>

                  <CLBSelector value={clb} onChange={val => setSkill(s.id, val)} color={s.color} />

                  <div className="tracker-bar-wrap">
                    <div className="tracker-bar-track">
                      <motion.div
                        className="tracker-bar-fill"
                        animate={{ width: `${barPct}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{ background: s.color }}
                      />
                    </div>
                    <div className="tracker-bar-labels">
                      {CLB_LABELS.map(n => (
                        <span
                          key={n}
                          className={`tracker-bar-label${clb === n ? ' tracker-bar-label--active' : ''}`}
                          style={clb === n ? { color: s.color } : {}}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="tracker-celpip-note">
                    CELPIP score needed: <strong style={{ color: s.color }}>{clb}</strong>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* CRS Summary */}
          <motion.div
            className="tracker-crs-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="tracker-crs-left">
              <div className="tracker-crs-label">Language CRS Points</div>
              <div className="tracker-crs-value">{totalCRS}</div>
              <div className="tracker-crs-max">out of {maxPossibleCRS} possible</div>
              <div className="tracker-crs-bar-track">
                <motion.div
                  className="tracker-crs-bar-fill"
                  animate={{ width: `${crsBarPct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <div className="tracker-crs-hint">
                {totalCRS < 80
                  ? '⬆️ Improve your scores to significantly boost CRS points'
                  : totalCRS < 120
                  ? '🔥 Strong — push for CLB 9+ to maximize points'
                  : '🏆 Excellent — at or near maximum language CRS'}
              </div>
            </div>

            <div className="tracker-crs-right">
              <div className="tracker-crs-gains-title">CRS gain per skill (+1 CLB)</div>
              {crsGains.map(g => (
                <div key={g.id} className="tracker-crs-gain-row">
                  <span className="tracker-crs-gain-icon" style={{ background: g.colorLight }}>{g.icon}</span>
                  <span className="tracker-crs-gain-label">{g.label}</span>
                  <span
                    className="tracker-crs-gain-pts"
                    style={{ color: g.gain > 0 ? g.color : 'var(--gray-400)' }}
                  >
                    {g.gain > 0 ? `+${g.gain} pts` : 'maxed'}
                  </span>
                </div>
              ))}
              <button className="tracker-crs-calc-btn" onClick={() => navigate('/calculator')}>
                Open CRS Calculator →
              </button>
            </div>
          </motion.div>

          {/* PR Eligibility */}
          <motion.div
            className="tracker-pr-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h3 className="tracker-pr-title">PR Program Eligibility</h3>
            <p className="tracker-pr-sub">Based on your lowest CLB score across all four skills (CLB {minClb})</p>
            <div className="tracker-pr-grid">
              {PR_PROGRAMS.map(prog => {
                const eligible = minClb >= prog.minClb
                return (
                  <div key={prog.name} className={`tracker-pr-row${eligible ? ' tracker-pr-row--eligible' : ' tracker-pr-row--not'}`}>
                    <div className={`tracker-pr-dot${eligible ? ' tracker-pr-dot--on' : ''}`} />
                    <div className="tracker-pr-info">
                      <span className="tracker-pr-name">{prog.name}</span>
                      <span className="tracker-pr-note">{prog.note}</span>
                    </div>
                    <span className={`tracker-pr-status${eligible ? ' tracker-pr-status--yes' : ''}`}>
                      {eligible ? 'Eligible' : `Need CLB ${prog.minClb}`}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="tracker-pr-disclaimer">
              Language eligibility only — other FSW / CEC requirements (work experience, education) also apply.
            </div>
          </motion.div>

        </div>
      )}

      {/* ── TAB 2: CLB Levels table ── */}
      {activeTab === 'levels' && (
        <div>
          <div className="page-header" style={{ paddingTop: 0 }}>
            <h2 className="page-title">CELPIP Score Levels & CLB</h2>
            <p className="page-sub">
              How CELPIP scores map to Canadian Language Benchmarks used in your PR application.
            </p>
          </div>

          <div className="scores-table-wrap">
            <div className="scores-table-head scores-table-row">
              <span>CELPIP Level</span>
              <span>Description</span>
              <span>CLB Equivalent</span>
            </div>
            {SCORE_LEVELS.map((lvl, i) => (
              <div key={i} className={`scores-table-row${lvl.highlight ? ' row-highlight' : ''}`}>
                <span className="score-level-label">{lvl.label}</span>
                <span className="score-level-desc">
                  {lvl.desc}
                  {lvl.note && <span className="score-note">{lvl.note}</span>}
                </span>
                <span className="score-clb">CLB {lvl.clb}</span>
              </div>
            ))}
          </div>

          <div className="pr-reqs-card">
            <div className="pr-reqs-header">
              <span>🍁</span>
              <h3>Canadian PR Score Requirements</h3>
            </div>
            <div className="pr-reqs-grid">
              {[
                { program: 'Federal Skilled Worker (FSW)',    req: 'CLB 7 minimum in all four abilities' },
                { program: 'Canadian Experience Class (CEC)', req: 'CLB 7 (NOC 0/A) or CLB 5 (NOC B)' },
                { program: 'Provincial Nominee Programs',      req: 'Typically CLB 5–7 (varies by province)' },
                { program: 'Atlantic Immigration Program',     req: 'CLB 4–5 minimum' },
                { program: 'Rural & Northern Immigration',     req: 'CLB 4–7 depending on occupation' },
              ].map((r, i) => (
                <div className="pr-req-row" key={i}>
                  <div className="pr-req-program">{r.program}</div>
                  <div className="pr-req-score">{r.req}</div>
                </div>
              ))}
            </div>
            <div className="pr-reqs-note">
              💡 <strong>Maximum CRS language points:</strong> CLB 10+ in all four abilities = <strong>136 CRS points</strong>. Compared to CLB 7 (68 pts), that's a <strong>+68 point gain</strong> — often the difference between an ITA and sitting out a draw.
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
