import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DASHBOARD_NAV_ITEMS = [
  { id: 'dashboard', label: 'Overview', icon: '📊' },
  { id: 'exam', label: 'Mock Exams', icon: '📋' },
  { id: 'listening', label: 'Listening', icon: '🎧' },
  { id: 'reading', label: 'Reading', icon: '📖' },
  { id: 'writing', label: 'Writing', icon: '✍️' },
  { id: 'speaking', label: 'Speaking', icon: '🎙️' },
]

export default function DashboardNavbar({ onSignIn }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname.replace('/', '') || 'dashboard'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const handleNavClick = (pageId) => {
    navigate('/' + pageId)
    setMenuOpen(false)
  }

  const handleLogoClick = () => {
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className={`dashboard-navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="dashboard-nav-inner">
        {/* Logo & Branding */}
        <div className="dashboard-nav-brand">
          <button
            className="dashboard-nav-logo"
            onClick={handleLogoClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span className="dashboard-logo-maple">🍁</span>
            <span className="dashboard-logo-text">CELPIPace</span>
          </button>
          <span className="dashboard-nav-badge">Dashboard</span>
        </div>

        {/* Navigation Links */}
        <ul className={`dashboard-nav-links${menuOpen ? ' open' : ''}`}>
          {DASHBOARD_NAV_ITEMS.map(item => (
            <li key={item.id}>
              <button
                className={`dashboard-nav-link${currentPath === item.id ? ' active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="dashboard-nav-icon">{item.icon}</span>
                <span className="dashboard-nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="dashboard-nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* User info */}
              <div className="dashboard-user-chip">
                {user.user_metadata?.avatar_url ? (
                  <img
                    className="dashboard-user-avatar"
                    src={user.user_metadata.avatar_url}
                    alt={initials}
                  />
                ) : (
                  <div className="dashboard-user-initials">{initials}</div>
                )}
                <span className="dashboard-user-name">
                  {user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0]}
                </span>
              </div>

              {/* Sign out button */}
              <button className="dashboard-nav-signout" onClick={signOut}>
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn btn-outline btn-sm" onClick={onSignIn}>
                Log in
              </button>
              <button className="btn btn-primary btn-sm" onClick={onSignIn}>
                Sign up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`dashboard-hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  )
}
