import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// Official CRS points for language ability (single applicant, first official language)
// Source: IRCC Express Entry CRS tool
const crsTable = [
  { clb: 'CLB 4',  listen: 6,  read: 6,  write: 6,  speak: 6,  total: 24  },
  { clb: 'CLB 5',  listen: 6,  read: 6,  write: 6,  speak: 6,  total: 24  },
  { clb: 'CLB 6',  listen: 8,  read: 8,  write: 8,  speak: 8,  total: 32  },
  { clb: 'CLB 7',  listen: 16, read: 16, write: 16, speak: 16, total: 64  },
  { clb: 'CLB 8',  listen: 22, read: 24, write: 22, speak: 22, total: 90  },
  { clb: 'CLB 9',  listen: 29, read: 31, write: 29, speak: 29, total: 118 },
  { clb: 'CLB 10', listen: 32, read: 34, write: 32, speak: 32, total: 130 },
]

const celpipMap = [
  { clb: 'CLB 4',  score: '3.5 – 4' },
  { clb: 'CLB 5',  score: '4' },
  { clb: 'CLB 6',  score: '5' },
  { clb: 'CLB 7',  score: '6' },
  { clb: 'CLB 8',  score: '7' },
  { clb: 'CLB 9',  score: '8' },
  { clb: 'CLB 10', score: '10 – 12' },
]

export default function CRSBooster() {
  const navigate = useNavigate()
  return (
    <section className="crs-section" id="crs">
      <div className="section-inner">
        <motion.div
          className="section-label section-label-red"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          CRS Score Booster
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How CELPIP scores translate<br />
          into <span className="highlight">CRS points</span>
        </motion.h2>
        <motion.p
          className="section-sub"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Language ability is worth up to <strong>160 CRS points</strong> (136 for first language + 24 for second).
          Moving from CLB 7 to CLB 10 alone can add <strong>66 points</strong> to your profile.
        </motion.p>

        <div className="crs-layout">
          {/* LEFT: CRS Table */}
          <motion.div
            className="crs-table-wrap"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="crs-table-title">CRS Language Points (Single Applicant)</div>
            <table className="crs-table">
              <thead>
                <tr>
                  <th>CLB Level</th>
                  <th>Listening</th>
                  <th>Reading</th>
                  <th>Writing</th>
                  <th>Speaking</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {crsTable.map((row, i) => (
                  <tr
                    key={row.clb}
                    className={row.clb === 'CLB 10' ? 'row-highlight' : i % 2 === 0 ? 'row-even' : ''}
                  >
                    <td className="td-clb">{row.clb}</td>
                    <td>{row.listen}</td>
                    <td>{row.read}</td>
                    <td>{row.write}</td>
                    <td>{row.speak}</td>
                    <td className="td-total">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="table-note">
              * Points shown for first official language. Source: IRCC.
            </p>
          </motion.div>

          {/* RIGHT: CELPIP → CLB Map + Callout */}
          <div className="crs-right">
            <motion.div
              className="clb-map-card"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="clb-map-title">CELPIP Score → CLB Level</div>
              <div className="clb-rows">
                {celpipMap.map(m => (
                  <div
                    className={`clb-row${m.clb === 'CLB 10' ? ' clb-row-top' : ''}`}
                    key={m.clb}
                  >
                    <span className="clb-badge">{m.clb}</span>
                    <div className="clb-bar-track">
                      <div
                        className="clb-bar-fill"
                        style={{
                          width: `${(parseInt(m.clb.replace('CLB ', '')) - 3) * 14.3}%`,
                        }}
                      />
                    </div>
                    <span className="clb-score-tag">{m.score}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="crs-callout"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="callout-icon">💡</div>
              <div>
                <div className="callout-title">The CLB 10 Difference</div>
                <p className="callout-body">
                  Scoring <strong>10–12</strong> on every CELPIP section puts you at
                  CLB 10 — the highest band. Compared to CLB 7, this adds
                  <strong> +66 CRS points</strong>, which can be the difference between
                  sitting out a draw and receiving your ITA.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/pricing')} style={{ marginTop: '1rem' }}>
                  Practice for CLB 10 →
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/calculator')} style={{ marginTop: '0.5rem', marginLeft: '8px' }}>
                  Open CRS Calculator
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
