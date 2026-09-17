/* ══════════════════════════════════════════════════════════════
   LineChart — dependency-free SVG line chart for CLB-over-time.
   Props:
     series:  [{ key, label, color, points: [{ date, clb }] }]
     yMin/yMax: band range (default 0–12)
     height:  px (default 220)
   Renders smooth-ish polylines with dots, a y-axis grid and x labels.
══════════════════════════════════════════════════════════════ */
import { useMemo, useState } from 'react'

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export default function LineChart({ series = [], yMin = 0, yMax = 12, height = 220 }) {
  const [hover, setHover] = useState(null) // { sx, sy, label, value, date }

  const W = 640
  const H = height
  const padL = 30, padR = 14, padT = 14, padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  // Collect a sorted union of all dates across series for the x-axis.
  const dates = useMemo(() => {
    const set = new Set()
    series.forEach(s => s.points.forEach(p => set.add(p.date)))
    return [...set].sort()
  }, [series])

  const hasData = dates.length > 0 && series.some(s => s.points.length > 0)

  const xFor = (date) => {
    if (dates.length <= 1) return padL + innerW / 2
    const i = dates.indexOf(date)
    return padL + (i / (dates.length - 1)) * innerW
  }
  const yFor = (clb) => {
    const t = (clb - yMin) / (yMax - yMin)
    return padT + (1 - t) * innerH
  }

  // y grid lines at sensible CLB bands
  const yTicks = []
  for (let v = yMin; v <= yMax; v += 3) yTicks.push(v)

  // x labels: show up to ~6 evenly spaced dates
  const xLabels = useMemo(() => {
    if (dates.length === 0) return []
    const maxLabels = 6
    if (dates.length <= maxLabels) return dates
    const step = Math.ceil(dates.length / maxLabels)
    return dates.filter((_, i) => i % step === 0 || i === dates.length - 1)
  }, [dates])

  if (!hasData) {
    return (
      <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
        Not enough data yet — complete a few practice sets to see your trend.
      </div>
    )
  }

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Progress over time chart">
        {/* y grid */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={padL} y1={yFor(v)} x2={W - padR} y2={yFor(v)} stroke="#EEF2F7" strokeWidth="1" />
            <text x={padL - 6} y={yFor(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{v}</text>
          </g>
        ))}

        {/* x labels */}
        {xLabels.map(d => (
          <text key={d} x={xFor(d)} y={H - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">{fmtDate(d)}</text>
        ))}

        {/* series */}
        {series.map(s => {
          if (s.points.length === 0) return null
          const pts = [...s.points].sort((a, b) => (a.date < b.date ? -1 : 1))
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.date).toFixed(1)} ${yFor(p.clb).toFixed(1)}`).join(' ')
          return (
            <g key={s.key}>
              {pts.length > 1 && (
                <path d={path} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              )}
              {pts.map((p, i) => (
                <circle
                  key={i}
                  cx={xFor(p.date)}
                  cy={yFor(p.clb)}
                  r={hover && hover.key === s.key && hover.date === p.date ? 5 : 3.2}
                  fill="#fff"
                  stroke={s.color}
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHover({ key: s.key, label: s.label, color: s.color, value: p.clb, date: p.date, sx: xFor(p.date), sy: yFor(p.clb) })}
                  onMouseLeave={() => setHover(null)}
                />
              ))}
            </g>
          )
        })}

        {/* tooltip */}
        {hover && (
          <g pointerEvents="none">
            <line x1={hover.sx} y1={padT} x2={hover.sx} y2={H - padB} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
          </g>
        )}
      </svg>

      {hover && (
        <div style={{
          position: 'absolute',
          left: `${(hover.sx / W) * 100}%`,
          top: `${(hover.sy / H) * 100}%`,
          transform: 'translate(-50%, -130%)',
          background: '#0f172a', color: '#fff', fontSize: 12, lineHeight: 1.4,
          padding: '6px 9px', borderRadius: 8, whiteSpace: 'nowrap', pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        }}>
          <strong style={{ color: hover.color }}>{hover.label}</strong> · CLB {hover.value}
          <div style={{ color: '#94a3b8', fontSize: 11 }}>{fmtDate(hover.date)}</div>
        </div>
      )}
    </div>
  )
}
