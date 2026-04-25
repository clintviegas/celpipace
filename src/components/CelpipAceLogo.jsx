/**
 * CelpipAceLogo — brand-accurate SVG logo mark
 * Props:
 *   height      — overall height in px (default 36)
 *   showTagline — show "PRACTICE SMART. SCORE HIGH. SUCCEED IN CANADA." line
 */
export default function CelpipAceLogo({ height = 36, showTagline = false }) {
  const fontSize = Math.round(height * 0.58)
  const tagSize  = Math.round(height * 0.185)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, lineHeight: 1 }}>
      {/* ── Icon mark ── */}
      <svg
        height={height}
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        {/* Outer C arc — navy */}
        <path
          d="M53 17 A26 26 0 1 0 53 55"
          stroke="#0F1F3D"
          strokeWidth="9.5"
          strokeLinecap="round"
        />
        {/* Maple leaf — red, centered at ~(20, 36) */}
        <g transform="translate(20,36) scale(0.73)">
          <path
            d="M0,-15 L2.5,-7 L9,-12 L6,-3 L14,-5 L10,2 L18,6 L8,6 L10,16 L0,13 L-10,16 L-8,6 L-18,6 L-10,2 L-14,-5 L-6,-3 L-9,-12 L-2.5,-7 Z"
            fill="#D91B1B"
          />
        </g>
        {/* Signal / wifi arcs — navy */}
        <path d="M36,28 Q43,36 36,44"  stroke="#0F1F3D" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M41,23 Q52,36 41,49"  stroke="#0F1F3D" strokeWidth="2.6" strokeLinecap="round"/>
        <path d="M46,19 Q58,36 46,53"  stroke="#0F1F3D" strokeWidth="2.6" strokeLinecap="round"/>
      </svg>

      {/* ── Wordmark ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: showTagline ? 3 : 0 }}>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          fontSize: fontSize,
          letterSpacing: '-0.015em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: '#0F1F3D' }}>CELPIP&nbsp;</span>
          <span style={{ color: '#D91B1B' }}>ACE</span>
        </div>

        {showTagline && (
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: tagSize,
            fontWeight: 700,
            letterSpacing: '0.055em',
            color: '#0F1F3D',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}>
            <span style={{ color: '#D91B1B' }}>—&nbsp;</span>
            PRACTICE SMART. SCORE HIGH. SUCCEED IN CANADA.
            <span style={{ color: '#D91B1B' }}>&nbsp;—</span>
          </div>
        )}
      </div>
    </div>
  )
}
