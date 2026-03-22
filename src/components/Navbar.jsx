import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ currentPage, setPage, onSignIn }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

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

  // Get initials for avatar fallback
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

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
          {user ? (
            /* ── Logged-in: show user chip + sign out ── */
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="nav-user-chip">
                {user.user_metadata?.avatar_url
                  ? <img className="nav-user-avatar" src={user.user_metadata.avatar_url} alt={initials} />
                  : <div className="nav-user-initials">{initials}</div>
                }
                {user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0]}
              </div>
              <button className="nav-signout-btn" onClick={signOut}>Sign out</button>
            </div>
          ) : (
            /* ── Logged-out: sign in + start free ── */
            <>
              <button className="btn btn-outline" onClick={onSignIn}>Log in</button>
              <button className="btn btn-primary" onClick={onSignIn}>Sign up free</button>
            </>
          )}
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
