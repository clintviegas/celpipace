import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CelpipAceLogo from './CelpipAceLogo'

const NAV_LINKS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'exam',      label: 'Mock Exams' },
  { id: 'listening', label: 'Listening'  },
  { id: 'reading',   label: 'Reading'    },
  { id: 'writing',   label: 'Writing'    },
  { id: 'speaking',  label: 'Speaking'   },
  { id: 'calculator', label: 'CRS Score' },
  { id: 'blog',      label: 'Blog'       },
]

export default function DashboardNavbar({ onSignIn }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isPremium, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname.replace('/', '') || 'dashboard'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <nav className={`dbn${scrolled ? ' dbn--scrolled' : ''}`}>
      <div className="dbn-inner">

        {/* Logo */}
        <button className="dbn-logo" onClick={() => navigate('/')}>
          <CelpipAceLogo height={32} />
        </button>

        {/* Nav links */}
        <ul className={`dbn-links${menuOpen ? ' dbn-links--open' : ''}`}>
          {NAV_LINKS.map(link => (
            <li key={link.id}>
              <button
                className={`dbn-link${currentPath === link.id ? ' dbn-link--active' : ''}`}
                onClick={() => { navigate('/' + link.id); setMenuOpen(false) }}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="dbn-right">
          {user ? (
            <>
              {isPremium ? (
                <span
                  className="dbn-pro-badge"
                  title="Manage subscription"
                  onClick={() => navigate('/subscription')}
                  style={{ cursor: 'pointer' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7z"/></svg>
                  PRO
                </span>
              ) : (
                <button className="dbn-upgrade-btn" onClick={() => navigate('/pricing')}>
                  Upgrade
                </button>
              )}
              <div className="dbn-user">
                {user.user_metadata?.avatar_url
                  ? <img className="dbn-avatar" src={user.user_metadata.avatar_url} alt={initials} />
                  : <div className="dbn-initials">{initials}</div>
                }
                <span className="dbn-username">
                  {user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0]}
                </span>
              </div>
              <button className="dbn-signout" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <>
              <button className="btn btn-outline btn-sm" onClick={onSignIn}>Log in</button>
              <button className="btn btn-primary btn-sm" onClick={onSignIn}>Sign up free</button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`dbn-hamburger${menuOpen ? ' dbn-hamburger--open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

      </div>
    </nav>
  )
}
