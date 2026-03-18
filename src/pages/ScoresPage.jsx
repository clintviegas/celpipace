import { SCORE_LEVELS } from '../data/constants'

const prReqs = [
  { program: 'Federal Skilled Worker (FSW)',    req: 'CLB 7 minimum in all four abilities' },
  { program: 'Canadian Experience Class (CEC)', req: 'CLB 7 (NOC 0/A) or CLB 5 (NOC B)' },
  { program: 'Provincial Nominee Programs',      req: 'Typically CLB 5–7 (varies by province)' },
  { program: 'Atlantic Immigration Program',     req: 'CLB 4–5 minimum' },
  { program: 'Rural & Northern Immigration',     req: 'CLB 4–7 depending on occupation' },
]

export default function ScoresPage() {
  return (
    <div className="page-wrap">
      <div className="page-header">
        <h2 className="page-title">CELPIP Score Levels & CLB</h2>
        <p className="page-sub">
          Understand how CELPIP scores map to Canadian Language Benchmarks (CLB) used in your PR application.
        </p>
      </div>

      {/* Score table */}
      <div className="scores-table-wrap">
        <div className="scores-table-head scores-table-row">
          <span>CELPIP Level</span>
          <span>Description</span>
          <span>CLB Equivalent</span>
        </div>
        {SCORE_LEVELS.map((lvl, i) => (
          <div
            key={i}
            className={`scores-table-row${lvl.highlight ? ' row-highlight' : ''}`}
          >
            <span className="score-level-label">{lvl.label}</span>
            <span className="score-level-desc">
              {lvl.desc}
              {lvl.note && <span className="score-note">{lvl.note}</span>}
            </span>
            <span className="score-clb">CLB {lvl.clb}</span>
          </div>
        ))}
      </div>

      {/* PR Requirements */}
      <div className="pr-reqs-card">
        <div className="pr-reqs-header">
          <span>🍁</span>
          <h3>Canadian PR Score Requirements</h3>
        </div>
        <div className="pr-reqs-grid">
          {prReqs.map((r, i) => (
            <div className="pr-req-row" key={i}>
              <div className="pr-req-program">{r.program}</div>
              <div className="pr-req-score">{r.req}</div>
            </div>
          ))}
        </div>
        <div className="pr-reqs-note">
          💡 <strong>Maximum CRS language points:</strong> CLB 10+ in all four abilities = <strong>130 CRS points</strong> (single applicant, first language). Compared to CLB 7 (64 pts), that's a <strong>+66 point gain</strong> — often the difference between an ITA and sitting out a draw.
        </div>
      </div>
    </div>
  )
}
