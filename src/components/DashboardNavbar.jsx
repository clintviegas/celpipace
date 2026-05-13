import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BookOpen, ChevronDown, ClipboardList, CreditCard, Headphones, HelpCircle, Home, LayoutDashboard, LogOut, Mic, PencilLine, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import CelpipAceLogo from './CelpipAceLogo'

const NAV_LINKS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', flat: true },
  { id: 'exam',      label: 'Mock Exams', path: '/exam', flat: true },
  {
    id: 'listening', label: 'Listening', path: '/celpip-listening-practice', color: '#4A90D9', colorLight: '#EEF4FF',
    parts: [
      { partId: 'L1', label: 'L1 · Problem Solving', desc: 'Conversation between two people solving a problem' },
      { partId: 'L2', label: 'L2 · Daily Life Conversation', desc: 'Phone calls, workplace chats, everyday exchanges' },
      { partId: 'L3', label: 'L3 · Information', desc: 'Longer informational passage on a general topic' },
      { partId: 'L4', label: 'L4 · News Item', desc: 'Canadian radio or TV-style news broadcast' },
      { partId: 'L5', label: 'L5 · Discussion', desc: 'Multiple speakers with different perspectives' },
      { partId: 'L6', label: 'L6 · Viewpoints', desc: 'Two contrasting viewpoints on a single topic' },
    ],
  },
  {
    id: 'reading', label: 'Reading', path: '/celpip-reading-practice', color: '#2D8A56', colorLight: '#F0FDF4',
    parts: [
      { partId: 'R1', label: 'R1 · Correspondence', desc: 'Everyday emails and letters — tone, purpose, details' },
      { partId: 'R2', label: 'R2 · Apply a Diagram', desc: 'Extract and apply data from charts, forms, schedules' },
      { partId: 'R3', label: 'R3 · Information', desc: 'Longer passage — detail comprehension and inference' },
      { partId: 'R4', label: 'R4 · Viewpoints', desc: 'Multiple opinions — identify and distinguish positions' },
    ],
  },
  {
    id: 'writing', label: 'Writing', path: '/celpip-writing-practice', color: '#C8972A', colorLight: '#FFFBEB',
    parts: [
      { partId: 'W1', label: 'W1 · Writing an Email', desc: '27 min — formal or informal email response' },
      { partId: 'W2', label: 'W2 · Survey Response', desc: '26 min — defend a position with supporting arguments' },
    ],
  },
  {
    id: 'speaking', label: 'Speaking', path: '/celpip-speaking-practice', color: '#C8102E', colorLight: '#FEF2F2',
    parts: [
      { partId: 'S1', label: 'S1 · Giving Advice', desc: 'Give structured advice for a personal scenario' },
      { partId: 'S2', label: 'S2 · Personal Experience', desc: 'Describe a personal experience with clear examples' },
      { partId: 'S3', label: 'S3 · Describing a Scene', desc: 'Describe an image — people, setting, activities' },
      { partId: 'S4', label: 'S4 · Making Predictions', desc: 'Predict outcomes for a future situation' },
      { partId: 'S5', label: 'S5 · Comparing & Persuading', desc: 'Compare two options and argue for one' },
      { partId: 'S6', label: 'S6 · Difficult Situation', desc: 'Explain how you would handle a hard scenario' },
      { partId: 'S7', label: 'S7 · Expressing Opinions', desc: 'Express and defend a position on a topic' },
      { partId: 'S8', label: 'S8 · Unusual Situation', desc: 'Describe and react to an unexpected situation' },
    ],
  },
  {
    id: 'learn', label: 'Learn', path: '/blog', color: '#6B4FAF', colorLight: '#F3EFFF',
    parts: [
      { label: 'CLB Scoring Guide', desc: 'Understand CLB levels and how scores map to CRS', path: '/scores' },
      { label: 'CRS Calculator', desc: 'Calculate your Express Entry CRS score instantly', path: '/crs-score-calculator' },
      { label: 'CELPIP Resources', desc: 'Section-by-section tips and training to boost your CLB band', path: '/celpip-resources' },
      { label: 'Score Tracker', desc: 'Track your CLB progress across all 4 sections', path: '/scores' },
      { label: 'Blog & Articles', desc: 'Expert tips, strategies and immigration guides', path: '/blog' },
    ],
  },
]

const LEARN_PATHS = new Set(['celpip-resources', 'scores', 'crs-score-calculator', 'blog'])
const SECTION_ROUTE_IDS = {
  'celpip-listening-practice': 'listening',
  'celpip-reading-practice': 'reading',
  'celpip-writing-practice': 'writing',
  'celpip-speaking-practice': 'speaking',
}

const MOBILE_TABS = [
  { id: 'dashboard', label: 'Home', Icon: Home },
  { id: 'exam', label: 'Exams', Icon: ClipboardList },
  { id: 'listening', label: 'Listen', Icon: Headphones },
  { id: 'reading', label: 'Read', Icon: BookOpen },
  { id: 'writing', label: 'Write', Icon: PencilLine },
  { id: 'speaking', label: 'Speak', Icon: Mic },
]

export default function DashboardNavbar({ onSignIn }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [openId, setOpenId] = useState(null)
  const accountRef = useRef(null)
  const linksRef = useRef(null)
  const { user, isPremium, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const routeId = location.pathname.split('/').filter(Boolean)[0] || 'dashboard'
  const currentPath = LEARN_PATHS.has(routeId) ? 'learn' : (SECTION_ROUTE_IDS[routeId] || routeId)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.add('has-mobile-app-tabs')
    return () => document.body.classList.remove('has-mobile-app-tabs')
  }, [])

  useEffect(() => {
    if (!accountOpen) return
    const handler = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [accountOpen])

  useEffect(() => {
    if (!openId) return
    const handler = (event) => {
      if (linksRef.current && !linksRef.current.contains(event.target)) setOpenId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openId])

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0]

  const handleSignOut = async () => {
    await signOut()
    setMenuOpen(false)
    setAccountOpen(false)
    navigate('/')
  }

  const goToPath = (path) => {
    navigate(path)
    setMenuOpen(false)
    setAccountOpen(false)
    setOpenId(null)
  }

  const goTo = (id) => {
    const link = NAV_LINKS.find(item => item.id === id)
    goToPath(link?.path || '/' + id)
  }

  const goToDropItem = (link, item) => {
    goToPath(item.path || `${link.path}/${item.partId}`)
  }

  return (
    <>
    <nav className={`dbn${scrolled ? ' dbn--scrolled' : ''}`}>
      <div className="dbn-inner">

        {/* Logo */}
        <button className="dbn-logo" onClick={() => navigate('/')}>
          <CelpipAceLogo height={34} />
        </button>

        {/* Nav links */}
        <ul ref={linksRef} className={`dbn-links${menuOpen ? ' dbn-links--open' : ''}`}>
          {NAV_LINKS.map(link => {
            const hasDrop = !!link.parts?.length
            const open = openId === link.id
            return (
              <li
                key={link.id}
                className={hasDrop ? 'dbn-has-drop' : undefined}
                onMouseEnter={() => { if (!menuOpen && hasDrop) setOpenId(link.id) }}
                onMouseLeave={() => { if (!menuOpen && hasDrop) setOpenId(null) }}
              >
                <button
                  className={`dbn-link${currentPath === link.id ? ' dbn-link--active' : ''}${hasDrop ? ' dbn-link-drop' : ''}${open ? ' dbn-link-drop--open' : ''}`}
                  aria-expanded={hasDrop ? open : undefined}
                  onClick={() => {
                    if (hasDrop && menuOpen) {
                      setOpenId(open ? null : link.id)
                      setAccountOpen(false)
                    } else {
                      goTo(link.id)
                    }
                  }}
                >
                  {link.label}
                  {hasDrop && <ChevronDown className="dbn-link-chevron" size={14} style={{ transform: open ? 'rotate(180deg)' : 'none' }} />}
                </button>
                {hasDrop && open && (
                  <div className="dbn-dropdown" style={{ '--dbn-drop-color': link.color, '--dbn-drop-light': link.colorLight }}>
                    <div className="dbn-drop-header" style={{ background: link.colorLight, color: link.color }}>
                      {link.label} — {link.parts.length} {link.id === 'learn' ? 'resources' : 'parts'}
                    </div>
                    <div className="dbn-drop-list">
                      {link.parts.map(item => (
                        <button key={item.label} className="dbn-drop-item" onClick={() => goToDropItem(link, item)}>
                          <span className="dbn-drop-label" style={{ color: link.color }}>{item.label}</span>
                          <span className="dbn-drop-desc">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                    {link.id !== 'learn' && (
                      <div className="dbn-drop-footer">
                        <button className="dbn-drop-cta" style={{ background: link.color }} onClick={() => goToPath(link.path)}>
                          Practice {link.label} →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
          {menuOpen && user && (
            <li className="dbn-mobile-account">
              <div className="dbn-mobile-account-card">
                {user.user_metadata?.avatar_url
                  ? <img className="dbn-avatar" src={user.user_metadata.avatar_url} alt={initials} />
                  : <div className="dbn-initials">{initials}</div>
                }
                <div className="dbn-mobile-account-text">
                  <strong>{displayName}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
              <button className="dbn-mobile-action" onClick={() => goTo('subscription')}>
                <CreditCard size={16} strokeWidth={2.3} />
                Manage subscription
              </button>
              <button className="dbn-mobile-action" onClick={() => goTo('contact')}>
                <HelpCircle size={16} strokeWidth={2.3} />
                Contact support
              </button>
              <button className="dbn-mobile-signout" onClick={handleSignOut}>
                <LogOut size={16} strokeWidth={2.3} />
                Sign out
              </button>
            </li>
          )}
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
              <div ref={accountRef} className="dbn-account-wrap">
                <button className="dbn-user dbn-user-button" onClick={() => { setOpenId(null); setAccountOpen(v => !v) }} aria-expanded={accountOpen}>
                  {user.user_metadata?.avatar_url
                    ? <img className="dbn-avatar" src={user.user_metadata.avatar_url} alt={initials} />
                    : <div className="dbn-initials">{initials}</div>
                  }
                  <span className="dbn-username">
                    {displayName}
                  </span>
                  <ChevronDown className="dbn-account-chevron" size={15} style={{ transform: accountOpen ? 'rotate(180deg)' : 'none' }} />
                </button>

                {accountOpen && (
                  <div className="dbn-account-menu">
                    <div className="dbn-account-head">
                      <strong>{displayName}</strong>
                      <span>{user.email}</span>
                    </div>
                    <button className="dbn-account-item" onClick={() => goTo('dashboard')}>
                      <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button className="dbn-account-item" onClick={() => goTo('subscription')}>
                      <CreditCard size={16} /> Manage subscription
                    </button>
                    <button className="dbn-account-item" onClick={() => goTo('celpip-resources')}>
                      <Sparkles size={16} /> CELPIP Resources
                    </button>
                    <button className="dbn-account-item" onClick={() => goTo('contact')}>
                      <HelpCircle size={16} /> Contact support
                    </button>
                    <div className="dbn-account-divider" />
                    <button className="dbn-account-item dbn-account-item--danger" onClick={handleSignOut}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onSignIn}>Log in</button>
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
    <nav className="mobile-app-tabs" aria-label="App navigation">
      {MOBILE_TABS.map(tab => {
        const active = currentPath === tab.id || location.pathname.startsWith('/' + tab.id + '/')
        const Icon = tab.Icon
        return (
          <button
            key={tab.id}
            className={`mobile-app-tab${active ? ' mobile-app-tab--active' : ''}`}
            onClick={() => goTo(tab.id)}
          >
            <Icon className="mobile-app-tab-icon" size={20} strokeWidth={2.25} />
            <span className="mobile-app-tab-label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
    </>
  )
}
