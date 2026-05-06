export default function CelpipAceLogo({ height = 36, showTagline = false, light = false }) {
  const tagSize  = Math.round(height * 0.185)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, lineHeight: 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: showTagline ? 3 : 0 }}>
        <img
          src="/celpipace-logo-exact.svg"
          alt="CELPIPACE"
          height={height}
          style={{ display: 'block', width: 'auto', maxWidth: Math.round(height * 6.8), objectFit: 'contain', filter: light ? 'brightness(0) invert(1)' : undefined }}
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
    </div>
  )
}
