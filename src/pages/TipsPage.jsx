import { useState } from 'react'
import { SECTIONS, TIPS } from '../data/constants'
import SEO from '../components/SEO'

function LockBadge() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C8972A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default function TipsPage() {
  const [active, setActive] = useState('listening')
  const tips = TIPS[active] || []
  const section = SECTIONS.find(s => s.id === active)

  return (
    <div className="page-wrap">
      <SEO
        title="CELPIP Tips & Strategies"
        description="Section-by-section CELPIP tips for Listening, Reading, Writing, and Speaking. Expert strategies to boost your CLB score."
        canonical="/tips"
      />
      <div className="page-header">
        <h2 className="page-title">Strategy & Tips</h2>
        <p className="page-sub">Expert guidance for every CELPIP section. Free tips are open — Pro tips unlock on upgrade.</p>
      </div>

      <div className="section-tabs" style={{ marginBottom: 32 }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`section-tab${active === s.id ? ' active' : ''}`}
            style={active === s.id ? { background: s.color, borderColor: s.color, color: '#fff' } : {}}
            onClick={() => setActive(s.id)}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="tips-grid">
        {tips.map((tip, i) => (
          <div key={i} className={`tip-card${tip.free ? '' : ' tip-card-locked'}`}>
            <div className="tip-card-header">
              <div className="tip-card-icon">
                {tip.free
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={section?.color} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                  : <LockBadge />
                }
              </div>
              <h3 className="tip-card-title">{tip.title}</h3>
              {!tip.free && <span className="pro-badge">PRO</span>}
            </div>

            {tip.free
              ? <p className="tip-card-body">{tip.content}</p>
              : (
                <div className="tip-blurred">
                  <p className="tip-card-body" style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
                    {tip.content}
                  </p>
                  <div className="tip-unlock-overlay">
                    <LockBadge />
                    <span>Unlock with Pro</span>
                  </div>
                </div>
              )
            }
          </div>
        ))}
      </div>
    </div>
  )
}
