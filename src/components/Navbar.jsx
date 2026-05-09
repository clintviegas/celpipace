import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CelpipAceLogo from './CelpipAceLogo'

/* ── Dropdown data matching CELTESTPIP nav ── */
const NAV_ITEMS = [
  {
    id: 'exam',
    label: 'Mock Exams',
    flat: true,   // no dropdown — direct link
  },
  {
    id: 'listening',
    label: 'Listening',
    color: '#4A90D9',
    colorLight: '#EEF4FF',
    parts: [
      { label: 'L1 · Problem Solving',        desc: 'Conversation between two people solving a problem' },
      { label: 'L2 · Daily Life Conversation', desc: 'Phone calls, workplace chats, everyday exchanges' },
      { label: 'L3 · Information',             desc: 'Longer informational passage on a general topic' },
      { label: 'L4 · News Item',               desc: 'Canadian radio or TV-style news broadcast' },
      { label: 'L5 · Discussion',              desc: 'Multiple speakers with different perspectives' },
      { label: 'L6 · Viewpoints',              desc: 'Two contrasting viewpoints on a single topic' },
    ],
  },
  {
    id: 'reading',
    label: 'Reading',
    color: '#2D8A56',
    colorLight: '#F0FDF4',
    parts: [
      { label: 'R1 · Correspondence', desc: 'Everyday emails and letters — tone, purpose, details' },
      { label: 'R2 · Apply a Diagram', desc: 'Extract and apply data from charts, forms, schedules' },
      { label: 'R3 · Information',     desc: 'Longer passage — detail comprehension and inference' },
      { label: 'R4 · Viewpoints',      desc: 'Multiple opinions — identify and distinguish positions' },
    ],
  },
  {
    id: 'writing',
    label: 'Writing',
    color: '#C8972A',
    colorLight: '#FFFBEB',
    parts: [
      { label: 'W1 · Writing an Email',   desc: '27 min — formal or informal email response (150–200 words)' },
      { label: 'W2 · Survey Questions',   desc: '26 min — defend a position with supporting arguments' },
    ],
  },
  {
    id: 'speaking',
    label: 'Speaking',
    color: '#C8102E',
    colorLight: '#FEF2F2',
    parts: [
      { label: 'S1 · Giving Advice',           desc: 'Give structured advice for a personal scenario' },
      { label: 'S2 · Personal Experience',      desc: 'Describe a personal experience with clear examples' },
      { label: 'S3 · Describing a Scene',       desc: 'Describe an image — people, setting, activities' },
      { label: 'S4 · Making Predictions',       desc: 'Predict outcomes for a future situation' },
      { label: 'S5 · Comparing & Persuading',   desc: 'Compare two options and argue for one' },
      { label: 'S6 · Difficult Situation',      desc: 'Explain how you would handle a hard scenario' },
      { label: 'S7 · Expressing Opinions',      desc: 'Express and defend a position on a topic' },
      { label: 'S8 · Unusual Situation',        desc: 'Describe and react to an unexpected situation' },
    ],
  },
  {
    id: 'learn',
    label: 'Learn',
    link: 'blog',
    color: '#6B4FAF',
    colorLight: '#F3EFFF',
    parts: [
      { label: 'CLB Scoring Guide',   desc: 'Understand CLB levels and how scores map to CRS', action: 'scores' },
      { label: 'CRS Calculator',      desc: 'Calculate your Express Entry CRS score instantly',  action: 'calculator' },
      { label: 'Tips & Strategies',   desc: 'Section-by-section tips to boost your CLB band', action: 'tips' },
      { label: 'Score Tracker',       desc: 'Track your CLB progress across all 4 sections', action: 'scores' },
      { label: 'Blog & Articles',     desc: 'Expert tips, strategies and immigration guides', action: 'blog' },
    ],
  },
]

/* ── Single dropdown item ── */
function DropItem({ item, color, closeAll, parentId }) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (item.action) {
      navigate('/' + item.action)
      closeAll()
      return
    }

    const sectionMap = { listening: 'listening', reading: 'reading', writing: 'writing', speaking: 'speaking' }
    const section = sectionMap[parentId]

    if (section) {
      const match = item.label.match(/^([A-Z]\d+)/)
      if (match) {
        const partId = match[1]
        navigate(`/${section}/${partId}`)
        closeAll()
        return
      }
      navigate('/' + section)
    } else {
      navigate('/exam')
    }
    closeAll()
  }
  return (
    <button
      className="nav-drop-item"
      onClick={handleClick}
    >
      <div className="nav-drop-label" style={{ color }}>{item.label}</div>
      <div className="nav-drop-desc">{item.desc}</div>
    </button>
  )
}

/* ── Nav item with optional dropdown ── */
function NavItem({ item, active, openId, setOpenId, closeMenu, mobileOpen }) {
  const ref = useRef(null)
  const navigate = useNavigate()
  const open = openId === item.id

  // Close on outside click
  useEffect(() => {
    if (!open) return   // only attach listener when this dropdown is open
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, setOpenId])

  if (item.flat) {
    return (
      <li ref={ref}>
        <button
          className={`nav-link-btn${active ? ' nav-link-active' : ''}`}
          onClick={() => { navigate('/' + item.id); setOpenId(null); closeMenu?.() }}
        >
          {item.label}
        </button>
      </li>
    )
  }

  return (
    <li ref={ref} className="nav-has-drop">
      <button
        className={`nav-link-btn nav-link-drop${active ? ' nav-link-active' : ''} ${open ? 'nav-link-drop--open' : ''}`}
        aria-expanded={open}
        onClick={() => {
          if (mobileOpen) {
            setOpenId(open ? null : item.id)
          } else {
            navigate('/' + (item.link || item.id))
            setOpenId(null)
          }
        }}
        onMouseEnter={() => { if (!mobileOpen) setOpenId(item.id) }}
      >
        {item.label}
        <span className="nav-chevron" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div
          className="nav-dropdown"
          onMouseLeave={() => { if (!mobileOpen) setOpenId(null) }}
          style={{ '--drop-color': item.color, '--drop-light': item.colorLight }}
        >
          <div className="nav-drop-header" style={{ background: item.colorLight, color: item.color }}>
            {item.label} — {item.parts.length} {item.id === 'learn' ? 'resources' : 'parts'}
          </div>
          <div className="nav-drop-list">
            {item.parts.map(p => (
              <DropItem
                key={p.label}
                item={p}
                color={item.color}
                closeAll={() => { setOpenId(null); closeMenu?.() }}
                parentId={item.id}
              />
            ))}
          </div>
          {item.id !== 'learn' && (
            <div className="nav-drop-footer">
              <button
                className="nav-drop-cta"
                style={{ background: item.color }}
                onClick={() => { navigate('/' + item.id); setOpenId(null); closeMenu?.() }}
              >
                Practice {item.label} →
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  )
}

/* ── User avatar dropdown ── */
function UserMenu({ user, signOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0]

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="nav-user-menu-wrap">
      <button className="nav-user-chip" onClick={() => setOpen(v => !v)}>
        {user.user_metadata?.avatar_url
          ? <img className="nav-user-avatar" src={user.user_metadata.avatar_url} alt={initials} />
          : <div className="nav-user-initials">{initials}</div>
        }
        <span>{firstName}</span>
        <span className="nav-user-chevron" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      {open && (
        <div className="nav-user-menu">
          <button className="nav-user-menu-item" onClick={() => { navigate('/dashboard'); setOpen(false) }}>
            <span className="nav-user-menu-icon">▣</span> Dashboard
          </button>
          <button className="nav-user-menu-item" onClick={() => { navigate('/subscription'); setOpen(false) }}>
            <span className="nav-user-menu-icon">$</span> Manage subscription
          </button>
          <div className="nav-user-menu-divider" />
          <button className="nav-user-menu-item nav-user-menu-item--danger" onClick={async () => { await signOut(); setOpen(false); navigate('/') }}>
            <span className="nav-user-menu-icon">↩</span> Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function Navbar({ onSignIn }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openId, setOpenId] = useState(null)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleMobileSignOut = useCallback(async () => {
    await signOut()
    setOpenId(null)
    setMenuOpen(false)
    navigate('/')
  }, [navigate, signOut])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile menu is open so the page behind doesn't move
  useEffect(() => {
    if (typeof document === 'undefined') return
    const prev = document.body.style.overflow
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = prev || ''
    }
    return () => { document.body.style.overflow = prev || '' }
  }, [menuOpen])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setOpenId(null) }, [location.pathname])

  const currentPath = location.pathname.split('/').filter(Boolean)[0] || 'home'
  const activeId = ['tips', 'scores', 'calculator', 'blog'].includes(currentPath) ? 'learn' : currentPath

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        {/* Logo */}
        <button className="nav-logo" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <CelpipAceLogo height={34} />
        </button>

        {/* Desktop nav */}
        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.id}
              item={item}
              active={activeId === item.id}
              openId={openId}
              setOpenId={setOpenId}
              closeMenu={() => setMenuOpen(false)}
              mobileOpen={menuOpen}
            />
          ))}
          {/* Mobile-only auth buttons at bottom of dropdown */}
          {menuOpen && !user && (
            <li className="nav-mobile-auth">
              <button className="btn btn-primary" onClick={() => { onSignIn(); setMenuOpen(false) }}>Continue with Google</button>
            </li>
          )}
          {menuOpen && user && (
            <li className="nav-mobile-account">
              <button className="nav-mobile-account-link" onClick={() => { navigate('/dashboard'); setMenuOpen(false) }}>
                Dashboard
              </button>
              <button className="nav-mobile-account-link" onClick={() => { navigate('/subscription'); setMenuOpen(false) }}>
                Manage subscription
              </button>
              <button className="nav-mobile-signout" onClick={handleMobileSignOut}>
                Sign out
              </button>
            </li>
          )}
        </ul>

        {/* Auth actions (desktop only) */}
        <div className="nav-actions">
          {user ? (
            <UserMenu user={user} signOut={signOut} />
          ) : (
            <button className="btn btn-primary" onClick={onSignIn}>Continue with Google</button>
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
