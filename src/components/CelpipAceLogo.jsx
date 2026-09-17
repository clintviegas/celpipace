// Logo viewBox is 782×182 → aspect ratio ≈ 4.297
const LOGO_ASPECT = 782 / 182

export default function CelpipAceLogo({ height = 36, showTagline = false, light = false }) {
  const tagSize  = Math.round(height * 0.185)
  const width    = Math.round(height * LOGO_ASPECT)

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: showTagline ? 3 : 0 }}>
        <img
          src="/logo.svg"
          alt="CELPIPACE"
          height={height}
          width={width}
          style={{ display: 'block', filter: light ? 'brightness(0) invert(1)' : undefined }}
        />

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
            PRACTICE SMART. BUILD SKILL. SUCCEED IN CANADA.
            <span style={{ color: '#D91B1B' }}>&nbsp;—</span>
          </div>
        )}
    </div>
  )
}
