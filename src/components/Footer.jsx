import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()
  const navigate = useNavigate()

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
        { label: 'CELPIP vs IELTS',           page: 'blog' },
        { label: 'CELPIP for Immigration',    page: 'calculator' },
        { label: 'CRS Calculator',            page: 'calculator' },
        { label: 'Blog & Articles',           page: 'blog' },
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
            <button onClick={() => navigate('/')} className="nav-logo footer-logo" style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
              <span className="logo-maple">🍁</span>
              <span className="logo-text">CELPIPiQ</span>
            </button>
            <p className="footer-tagline">
              Your fastest path to a 10+ CELPIP score. Practice with AI-powered scoring across all 4 skills.
            </p>
            <div className="footer-socials">
              <a href="https://www.youtube.com/@CELPIPiQ" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3.01 3.01 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3.01 3.01 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3.01 3.01 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.5a3.01 3.01 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5l6.5 3.5-6.5 3.5z"/></svg>
              </a>
              <a href="https://www.instagram.com/celpiPIQ" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          {cols.map(col => (
            <div className="footer-col" key={col.heading}>
              <div className="footer-col-heading">{col.heading}</div>
              <ul>
                {col.links.map(l => (
                  <li key={l.label}>
                    <button
                      onClick={() => navigate('/' + (l.page === 'home' ? '' : l.page))}
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
          <p>© {year} CELPIPiQ. All rights reserved.</p>
          <p className="footer-disclaimer">
            CELPIPiQ is an independent practice tool and is not affiliated with, endorsed by, sponsored by, or approved by CELPIP or Paragon Testing Enterprises.
          </p>
        </div>
      </div>
    </footer>
  )
}
