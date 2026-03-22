import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

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
    color: '#6B4FAF',
    colorLight: '#F3EFFF',
    parts: [
      { label: '📊 CLB Scoring Guide',   desc: 'Understand CLB levels and how scores map to CRS' },
      { label: '🧮 CRS Calculator',      desc: 'Calculate your Express Entry CRS score instantly',  action: 'calculator' },
      { label: '💡 Tips & Strategies',   desc: 'Section-by-section tips to boost your CLB band', action: 'tips' },
      { label: '📈 Score Tracker',       desc: 'Track your CLB progress across all 4 sections', action: 'scores' },
    ],
  },
]

/* ── Single dropdown item ── */
function DropItem({ item, color, setPage, closeAll }) {
  return (
    <button
      className="nav-drop-item"
      onClick={() => { setPage(item.action || 'exam'); closeAll() }}
    >
      <div className="nav-drop-label" style={{ color }}>{item.label}</div>
      <div className="nav-drop-desc">{item.desc}</div>
    </button>
  )
}

/* ── Nav item with optional dropdown ── */
function NavItem({ item, active, setPage, openId, setOpenId }) {
  const ref = useRef(null)
  const open = openId === item.id

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenId(id => id === item.id ? null : id)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [item.id, setOpenId])

  if (item.flat) {
    return (
      <li ref={ref}>
        <button
          className={`nav-link-btn${active ? ' nav-link-active' : ''}`}
          onClick={() => { setPage(item.id); setOpenId(null) }}
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
        onClick={() => setOpenId(open ? null : item.id)}
        onMouseEnter={() => setOpenId(item.id)}
      >
        {item.label}
        <span className="nav-chevron" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div
          className="nav-dropdown"
          onMouseLeave={() => setOpenId(null)}
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
                setPage={setPage}
                closeAll={() => setOpenId(null)}
              />
            ))}
          </div>
          {item.id !== 'learn' && (
            <div className="nav-drop-footer">
              <button
                className="nav-drop-cta"
                style={{ background: item.color }}
                onClick={() => { setPage('exam'); setOpenId(null) }}
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

export default function Navbar({ currentPage, setPage, onSignIn }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openId, setOpenId] = useState(null)   // only one dropdown open at a time
  const { user, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isApp = ['practice','tips','scores','calculator','exam','listening','reading','writing','speaking','learn'].includes(currentPage)

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  /* Section pages that map to the exam tab */
  const sectionPages = ['listening','reading','writing','speaking']
  const activeId = sectionPages.includes(currentPage) ? currentPage : currentPage

  return (
    <nav className={`navbar${scrolled || isApp ? ' scrolled' : ''}`}>
      <div className="nav-inner">
        {/* Logo */}
        <button className="nav-logo" onClick={() => setPage('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span className="logo-maple">🍁</span>
          <span className="logo-text">CELPIPace</span>
        </button>

        {/* Desktop nav */}
        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.id}
              item={item}
              active={activeId === item.id}
              setPage={(p) => { setPage(p); setMenuOpen(false); setOpenId(null) }}
              openId={openId}
              setOpenId={setOpenId}
            />
          ))}

        </ul>

        {/* Auth actions */}
        <div className="nav-actions">
          {user ? (
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
