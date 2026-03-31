export default function Footer({ setPage }) {
  const year = new Date().getFullYear()

  const cols = [
    {
      heading: 'Practice Tests',
      links: [
        { label: 'Mock Exams',          page: 'exam' },
        { label: 'Listening Practice',  page: 'listening' },
        { label: 'Reading Practice',    page: 'reading' },
        { label: 'Writing Practice',    page: 'writing' },
        { label: 'Speaking Practice',   page: 'speaking' },
      ],
    },
    {
      heading: 'Learn',
      links: [
        { label: 'Study Guides & Courses', page: 'tips' },
        { label: 'Tips & Strategies',      page: 'tips' },
        { label: 'Vocabulary Builder',     page: 'tips' },
        { label: 'Score Tracker',          page: 'scores' },
        { label: 'CLB to CRS Chart',       page: 'scores' },
      ],
    },
    {
      heading: 'Resources',
      links: [
        { label: 'Student Reviews',           page: 'home' },
        { label: 'CELPIP vs IELTS',           page: 'scores' },
        { label: 'CELPIP for Immigration',    page: 'calculator' },
        { label: 'CRS Calculator',            page: 'calculator' },
        { label: 'Pricing',                   page: 'pricing' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us',         page: 'home' },
        { label: 'Privacy Policy',   page: 'home' },
        { label: 'Terms of Service', page: 'home' },
        { label: 'Refund Policy',    page: 'home' },
        { label: 'Contact',          page: 'home' },
      ],
    },
  ]

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <button onClick={() => setPage?.('home')} className="nav-logo footer-logo" style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
              <span className="logo-maple">🍁</span>
              <span className="logo-text">CELPIPace</span>
            </button>
            <p className="footer-tagline">
              Your fastest path to a 10+ CELPIP score. Practice with AI-powered scoring across all 4 skills.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="TikTok">🎵</a>
              <a href="#" aria-label="Instagram">📸</a>
              <a href="#" aria-label="YouTube">▶️</a>
            </div>
          </div>

          {cols.map(col => (
            <div className="footer-col" key={col.heading}>
              <div className="footer-col-heading">{col.heading}</div>
              <ul>
                {col.links.map(l => (
                  <li key={l.label}>
                    <button
                      onClick={() => setPage?.(l.page)}
                      style={{background:'none',border:'none',cursor:'pointer',padding:0,font:'inherit',color:'inherit',textAlign:'left'}}
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p>© {year} CELPIPace. All rights reserved.</p>
          <p className="footer-disclaimer">
            CELPIPace is an independent practice tool and is not affiliated with, endorsed by, sponsored by, or approved by CELPIP or Paragon Testing Enterprises.
          </p>
        </div>
      </div>
    </footer>
  )
}
