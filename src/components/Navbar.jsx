import { useState, useEffect } from 'react'

export default function Navbar({ currentPage, setPage }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { id: 'home',       label: 'Home' },
    { id: 'exam',       label: '📝 Mock Tests' },
    { id: 'practice',   label: 'Practice' },
    { id: 'tips',       label: 'Tips' },
    { id: 'scores',     label: 'Scores' },
    { id: 'calculator', label: '🧮 CRS Calc' },
    { id: 'pricing',    label: 'Pricing' },
  ]

  const isApp = ['practice','tips','scores','calculator','exam'].includes(currentPage)

  return (
    <nav className={`navbar${scrolled || isApp ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        <button className="nav-logo" onClick={() => setPage('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span className="logo-maple">🍁</span>
          <span className="logo-text">CELPIPace</span>
        </button>

        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          {links.map(l => (
            <li key={l.id}>
              <button
                className={`nav-link-btn${currentPage === l.id ? ' nav-link-active' : ''}`}
                onClick={() => { setPage(l.id); setMenuOpen(false) }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button className="btn btn-outline" onClick={() => setPage('pricing')}>Sign In</button>
          <button className="btn btn-primary" onClick={() => setPage('practice')}>Start Free</button>
        </div>

        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
