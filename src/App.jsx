import { Suspense, lazy, useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { BookOpen, ClipboardCheck, Gauge, Headphones, Mic, PenLine, Sparkles, Trophy } from 'lucide-react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import DashboardNavbar from './components/DashboardNavbar'
import AuthModal from './components/AuthModal'
import Hero from './components/Hero'
import FeatureShowcase from './components/FeatureShowcase'
import AIFeatures from './components/AIFeatures'
import CRSBooster from './components/CRSBooster'
import HowItWorks from './components/HowItWorks'
import Pricing from './components/Pricing'
import CTA from './components/CTA'
import Footer from './components/Footer'
import SEO from './components/SEO'
import ChatWidget from './components/ChatWidget'
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
  return (
    <main className="home-page">
      <SEO
        title="CELPIP Practice Tests With AI Scoring & Mock Exams"
        description={`Prepare for CELPIP with ${PRODUCT_STATS.questionItems} question items, ${PRODUCT_STATS.mockExams} full mock exams, AI writing and speaking feedback, and saved CLB score reports.`}
        canonical="/"
      />
      <div className="home-mobile-only">
        <MobileHomeApp onSignIn={onSignIn} />
      </div>
      <div className="home-desktop-flow">
        <Hero />
        <FeatureShowcase />
        <AIFeatures />
        <HowItWorks />
        <CRSBooster />
        <Pricing onSignIn={onSignIn} showFaq={false} />
        <CTA />
      </div>
    </main>
  )
}

function PricingPage({ onSignIn }) {
  return (
    <main style={{ paddingTop: '80px' }}>
      <SEO
        title="Pricing"
        description="Choose a CELPIPACE premium subscription for mock exams, AI scoring, study tools, and progress tracking. Manage or cancel any time through Stripe."
        canonical="/pricing"
      />
      <Pricing onSignIn={onSignIn} />
    </main>
  )
}

export function AppInner() {
  const [authOpen, setAuthOpen] = useState(false)
  const location = useLocation()

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/')

  // Show the dashboard navbar on all inner app pages (when user is likely logged in)
  const innerPaths = ['/dashboard','/exam','/mock-test','/celpip-listening-practice','/celpip-reading-practice','/celpip-writing-practice','/celpip-speaking-practice','/listening','/reading','/writing','/speaking','/practice','/practice-set','/tips','/scores','/calculator','/pricing','/blog','/writing-practice','/subscription']
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
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

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
          <Route path="/mock-test/:examId" element={<MockTestPage />} />

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
      {!isPaymentRoute && <ChatWidget />}
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
