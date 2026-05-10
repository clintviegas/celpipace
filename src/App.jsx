import { Suspense, lazy, useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { BookOpen, CheckCircle2, ClipboardCheck, Gauge, Headphones, LockKeyhole, Mic, PenLine, ShieldCheck, Sparkles, Trophy } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import DashboardNavbar from './components/DashboardNavbar'
import Hero from './components/Hero'
import Footer from './components/Footer'
import SEO from './components/SEO'
const AuthModal = lazy(() => import('./components/AuthModal'))
const ChatWidget = lazy(() => import('./components/ChatWidget'))
const HomeDesktopSections = lazy(() => import('./components/HomeDesktopSections'))
const Pricing = lazy(() => import('./components/Pricing'))
import { BRAND_NAME, PRODUCT_STATS, SECTION_LIBRARY } from './data/constants'
import './App.css'

const PracticePage = lazy(() => import('./pages/PracticePage'))
const TipsPage = lazy(() => import('./pages/TipsPage'))
const ScoresPage = lazy(() => import('./pages/ScoresPage'))
const CRSCalculatorPage = lazy(() => import('./pages/CRSCalculatorPage'))
const ExamPage = lazy(() => import('./pages/ExamPage'))
const ListeningPage = lazy(() => import('./pages/ListeningPage'))
const ReadingPage = lazy(() => import('./pages/ReadingPage'))
const ReadingPracticePage = lazy(() => import('./pages/ReadingPracticePage'))
const WritingPage = lazy(() => import('./pages/WritingPage'))
const SpeakingPage = lazy(() => import('./pages/SpeakingPage'))
const PracticeSetPage = lazy(() => import('./pages/PracticeSetPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const WritingPracticePage = lazy(() => import('./pages/WritingPracticePage'))
const MockTestPage = lazy(() => import('./pages/MockTestPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const ManageSubscriptionPage = lazy(() => import('./pages/ManageSubscriptionPage'))
const PaymentPage = lazy(() => import('./pages/PaymentPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const SEOLandingPage = lazy(() => import('./pages/SEOLandingPage'))

function RouteLoader() {
  return <main className="route-loader" aria-label="Loading page">Loading...</main>
}

function RedirectWithParam({ to }) {
  const location = useLocation()
  const partId = location.pathname.split('/').filter(Boolean)[1] || ''
  const dest = partId ? `${to}/${partId}${location.search}` : `${to}${location.search}`
  return <Navigate to={dest} replace />
}

function GoogleIcon() {
  return (
    <svg className="auth-btn-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function AuthRequiredPage({ reason = 'Sign in with Google to continue.' }) {
  const { signInWithGoogle } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const redirectPath = `${location.pathname}${location.search}`

  const handleGoogle = async () => {
    setError('')
    setSending(true)
    const result = await signInWithGoogle(redirectPath)
    if (result?.error) {
      setError(result.error)
      setSending(false)
    }
  }

  return (
    <main className="auth-required-page">
      <section className="auth-required-card" aria-labelledby="auth-required-title">
        <div className="auth-required-icon"><LockKeyhole size={24} strokeWidth={2.4} /></div>
        <span className="auth-required-kicker">Secure practice access</span>
        <h1 id="auth-required-title">Sign in before starting this question.</h1>
        <p>{reason}</p>
        <button className="auth-required-google" onClick={handleGoogle} disabled={sending}>
          <GoogleIcon />
          {sending ? 'Opening Google...' : 'Log in'}
        </button>
        {error && <div className="auth-required-error">{error}</div>}
        <div className="auth-required-trust">
          <span><ShieldCheck size={16} /> Google-only login</span>
          <span><CheckCircle2 size={16} /> Saved attempts</span>
          <span><Sparkles size={16} /> Return to this page after sign-in</span>
        </div>
        <button className="auth-required-back" onClick={() => navigate(-1)}>Back to practice options</button>
      </section>
    </main>
  )
}

function RequireAuth({ children, reason }) {
  const { user, loading } = useAuth()
  if (loading) return <RouteLoader />
  if (!user) return <AuthRequiredPage reason={reason} />
  return children
}

function PremiumRequiredPage() {
  const navigate = useNavigate()
  return (
    <main className="auth-required-page">
      <section className="auth-required-card" aria-labelledby="premium-required-title">
        <div className="auth-required-icon"><LockKeyhole size={24} strokeWidth={2.4} /></div>
        <span className="auth-required-kicker">Premium required</span>
        <h1 id="premium-required-title">This mock exam is part of Premium.</h1>
        <p>Full mock exams with AI scoring are available on any active subscription. You can review pricing and start a plan in under a minute.</p>
        <button className="auth-required-google" onClick={() => navigate('/pricing')}>
          See pricing
        </button>
        <button className="auth-required-back" onClick={() => navigate(-1)}>Back</button>
      </section>
    </main>
  )
}

function RequirePremium({ children, reason }) {
  const { user, isPremium, loading, profileLoaded } = useAuth()
  if (loading) return <RouteLoader />
  if (!user) return <AuthRequiredPage reason={reason} />
  if (!profileLoaded) return <RouteLoader />
  if (!isPremium) return <PremiumRequiredPage />
  return children
}

const MOBILE_HOME_SECTIONS = [
  { ...SECTION_LIBRARY.listening, Icon: Headphones, sub: `${PRODUCT_STATS.listeningSets} sets` },
  { ...SECTION_LIBRARY.reading, Icon: BookOpen, sub: `${PRODUCT_STATS.readingSets} sets` },
  { ...SECTION_LIBRARY.writing, Icon: PenLine, sub: `${PRODUCT_STATS.writingSets} prompts` },
  { ...SECTION_LIBRARY.speaking, Icon: Mic, sub: `8 tasks` },
]

const MOBILE_HOME_LINKS = [
  { label: 'CRS', path: '/calculator', Icon: Gauge },
  { label: 'Tips', path: '/tips', Icon: Sparkles },
  { label: 'Premium', path: '/pricing', Icon: Trophy },
]

function getInitialMobileViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(getInitialMobileViewport)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const query = window.matchMedia('(max-width: 767px)')
    const handleChange = () => setIsMobile(query.matches)
    handleChange()
    query.addEventListener?.('change', handleChange)
    return () => query.removeEventListener?.('change', handleChange)
  }, [])

  return isMobile
}

function MobileHomeApp({ onSignIn }) {
  const navigate = useNavigate()

  return (
    <section className="mh-app" aria-label="Mobile home">
      <div className="mh-hero-card">
        <div className="mh-kicker-row">
          <span className="mh-kicker">{BRAND_NAME}</span>
          <span className="mh-mini-stat">CLB 4-12</span>
        </div>
        <h1>A focused CELPIP study home.</h1>
        <p>{PRODUCT_STATS.questionItems} question items, mock exams, scoring, and section drills built for quick mobile study sessions.</p>
        <div className="mh-actions">
          <button className="mh-primary" onClick={() => navigate('/calculator')}>Calculate CRS</button>
          <button className="mh-secondary" onClick={() => navigate('/exam')}>Mock exams</button>
        </div>
      </div>

      <button className="mh-focus-card" onClick={() => navigate('/exam')}>
        <span className="mh-focus-icon" aria-hidden="true"><ClipboardCheck size={22} /></span>
        <span>
          <strong>Full mock exam</strong>
          <small>{PRODUCT_STATS.mockExams} timed exams · CLB report</small>
        </span>
      </button>

      <div className="mh-skill-grid">
        {MOBILE_HOME_SECTIONS.map(({ Icon, ...section }) => (
          <button key={section.label} className="mh-skill-card" onClick={() => navigate(section.path)}>
            <span className="mh-skill-icon" aria-hidden="true"><Icon size={21} /></span>
            <strong>{section.label}</strong>
            <small>{section.sub}</small>
          </button>
        ))}
      </div>

      <div className="mh-link-row">
        {MOBILE_HOME_LINKS.map(({ label, path, Icon }) => (
          <button key={label} onClick={() => navigate(path)}>
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <p className="mh-disclaimer">Independent CELPIP preparation. Not affiliated with Paragon Testing Enterprises.</p>
    </section>
  )
}

function HomePage({ onSignIn }) {
  const isMobile = useIsMobileViewport()
  const [showDesktopSections, setShowDesktopSections] = useState(false)

  useEffect(() => {
    if (isMobile) {
      setShowDesktopSections(false)
      return undefined
    }

    const idle = window.requestIdleCallback || ((callback) => setTimeout(callback, 1000))
    const cancelIdle = window.cancelIdleCallback || clearTimeout
    const handle = idle(() => setShowDesktopSections(true), { timeout: 1800 })
    return () => cancelIdle(handle)
  }, [isMobile])

  return (
    <main className="home-page">
      <SEO
        title="CELPIP Practice Tests With Real-Time Scoring & Mock Exams"
        description={`Prepare for CELPIP with ${PRODUCT_STATS.questionItems} question items, ${PRODUCT_STATS.mockExams} full mock exams, real-time writing and speaking feedback, and saved CLB score reports.`}
        canonical="/"
      />
      {isMobile ? (
        <div className="home-mobile-only">
          <MobileHomeApp onSignIn={onSignIn} />
        </div>
      ) : (
        <div className="home-desktop-flow">
          <Hero />
          {showDesktopSections && (
            <Suspense fallback={null}>
              <HomeDesktopSections onSignIn={onSignIn} />
            </Suspense>
          )}
        </div>
      )}
    </main>
  )
}

function PricingPage({ onSignIn }) {
  return (
    <main style={{ paddingTop: '80px' }}>
      <SEO
        title="Pricing"
        description="Choose a CELPIPACE premium subscription for mock exams, real-time scoring, study tools, and progress tracking. Manage or cancel any time through Stripe."
        canonical="/pricing"
      />
      <Pricing onSignIn={onSignIn} />
    </main>
  )
}

export function AppInner() {
  const [authOpen, setAuthOpen] = useState(false)
  const [chatReady, setChatReady] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  // Defer ChatWidget mount until the browser is idle to keep it off the critical path
  useEffect(() => {
    if (typeof window === 'undefined') return
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 2500))
    const cancelIdle = window.cancelIdleCallback || clearTimeout
    const handle = idle(() => setChatReady(true))
    return () => cancelIdle(handle)
  }, [])

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let cancelled = false
    const idle = window.requestIdleCallback || ((callback) => setTimeout(callback, 1200))
    const cancelIdle = window.cancelIdleCallback || clearTimeout
    const handle = idle(() => {
      import('./lib/analytics').then(({ trackPageView }) => {
        if (!cancelled) trackPageView(user?.id)
      }).catch(() => {})
    }, { timeout: 2200 })
    return () => { cancelled = true; cancelIdle(handle) }
  }, [location.pathname, location.search, user?.id])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let cleanup = null
    let cancelled = false
    const idle = window.requestIdleCallback || ((callback) => setTimeout(callback, 1600))
    const cancelIdle = window.cancelIdleCallback || clearTimeout
    const handle = idle(() => {
      import('./lib/analytics').then(({ initClickAnalytics }) => {
        if (cancelled) return
        cleanup = initClickAnalytics(() => user?.id)
      }).catch(() => {})
    }, { timeout: 2600 })
    return () => {
      cancelled = true
      cancelIdle(handle)
      cleanup?.()
    }
  }, [user?.id])

  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/')

  // Keep public learning pages on the original site navbar so dropdown behavior stays consistent after navigation.
  const innerPaths = ['/dashboard','/exam','/mock-test','/celpip-listening-practice','/celpip-reading-practice','/celpip-writing-practice','/celpip-speaking-practice','/listening','/reading','/writing','/speaking','/practice','/practice-set','/writing-practice','/subscription']
  const isInnerPage = innerPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'))
  const isPaymentRoute = location.pathname === '/payment'

  // Admin is self-contained — no site chrome
  if (isAdminRoute) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <>
      {authOpen && (
        <Suspense fallback={null}>
          <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        </Suspense>
      )}

      {isInnerPage ? (
        <DashboardNavbar onSignIn={() => setAuthOpen(true)} />
      ) : (
        <Navbar onSignIn={() => setAuthOpen(true)} />
      )}

      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<HomePage onSignIn={() => setAuthOpen(true)} />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/celpip-practice-test" element={<SEOLandingPage type="practice" />} />
          <Route path="/celpip-mock-test" element={<SEOLandingPage type="mock" />} />
          <Route path="/celpip-score-calculator" element={<SEOLandingPage type="score" />} />
          <Route path="/celpip-vs-ielts" element={<SEOLandingPage type="comparison" />} />
          <Route path="/tips" element={<TipsPage />} />
          <Route path="/scores" element={<ScoresPage />} />
          <Route path="/calculator" element={<CRSCalculatorPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/mock-test/:examId" element={<RequirePremium reason="Sign in with Google to start or review a mock exam."><MockTestPage /></RequirePremium>} />

          {/* Canonical SEO routes — these are the real pages */}
          <Route path="/celpip-listening-practice" element={<ListeningPage />} />
          <Route path="/celpip-listening-practice/:partId" element={<PracticeSetPage section="listening" />} />
          <Route path="/celpip-reading-practice" element={<ReadingPage />} />
          <Route path="/celpip-reading-practice/:partId" element={<ReadingPracticePage />} />
          <Route path="/celpip-writing-practice" element={<WritingPage />} />
          <Route path="/celpip-writing-practice/:partId" element={<PracticeSetPage section="writing" />} />
          <Route path="/celpip-speaking-practice" element={<SpeakingPage />} />
          <Route path="/celpip-speaking-practice/:partId" element={<PracticeSetPage section="speaking" />} />

          {/* Legacy short routes — SPA fallback redirects (server-level 301 in vercel.json is primary) */}
          <Route path="/listening" element={<Navigate to="/celpip-listening-practice" replace />} />
          <Route path="/listening/:partId" element={<RedirectWithParam to="/celpip-listening-practice" />} />
          <Route path="/reading" element={<Navigate to="/celpip-reading-practice" replace />} />
          <Route path="/reading/:partId" element={<RedirectWithParam to="/celpip-reading-practice" />} />
          <Route path="/writing" element={<Navigate to="/celpip-writing-practice" replace />} />
          <Route path="/writing/:partId" element={<RedirectWithParam to="/celpip-writing-practice" />} />
          <Route path="/speaking" element={<Navigate to="/celpip-speaking-practice" replace />} />
          <Route path="/speaking/:partId" element={<RedirectWithParam to="/celpip-speaking-practice" />} />
          <Route path="/practice-set" element={<PracticeSetPage />} />
          <Route path="/pricing" element={<PricingPage onSignIn={() => setAuthOpen(true)} />} />
          <Route path="/payment" element={<PaymentPage onSignIn={() => setAuthOpen(true)} />} />
          <Route path="/subscription" element={<ManageSubscriptionPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPage />} />
          <Route path="/writing-practice" element={<WritingPracticePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage />} />
          <Route path="/terms" element={<LegalPage />} />
          <Route path="/refund" element={<LegalPage />} />
          {/* catch-all */}
          <Route path="*" element={<HomePage onSignIn={() => setAuthOpen(true)} />} />
        </Routes>
      </Suspense>

      {!isInnerPage && <Footer />}
      {!isPaymentRoute && chatReady && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  )
}
