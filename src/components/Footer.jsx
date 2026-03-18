export default function Footer({ setPage }) {
  const year = new Date().getFullYear()

  const cols = [
    {
      heading: 'Practice',
      links: [
        { label: 'Listening Practice', page: 'practice' },
        { label: 'Reading Practice',   page: 'practice' },
        { label: 'Writing Practice',   page: 'practice' },
        { label: 'Speaking Practice',  page: 'practice' },
        { label: 'Full Mock Tests',    page: 'practice' },
      ],
    },
    {
      heading: 'Express Entry',
      links: [
        { label: 'What is CRS?',      page: 'calculator' },
        { label: 'CLB to CRS Chart',  page: 'scores' },
        { label: 'CELPIP vs IELTS',   page: 'scores' },
        { label: 'Immigration FAQ',   page: 'scores' },
        { label: 'Draw History',      page: 'scores' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About Us',      page: 'home' },
        { label: 'Pricing',       page: 'pricing' },
        { label: 'Blog',          page: 'home' },
        { label: 'Testimonials',  page: 'home' },
        { label: 'Contact',       page: 'home' },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy Policy',   page: 'home' },
        { label: 'Terms of Service', page: 'home' },
        { label: 'Refund Policy',    page: 'home' },
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
              Canada's leading CELPIP prep platform for Express Entry applicants.
              Boost your CRS score. Get your PR.
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
            CELPIPace is an independent preparation platform. Not affiliated with Paragon Testing Enterprises or the official CELPIP® test.
          </p>
        </div>
      </div>
    </footer>
  )
}
