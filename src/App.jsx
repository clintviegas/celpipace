import { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom'
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
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Footer from './components/Footer'
import PracticePage from './pages/PracticePage'
import TipsPage from './pages/TipsPage'
import ScoresPage from './pages/ScoresPage'
import CRSCalculatorPage from './pages/CRSCalculatorPage'
import ExamPage from './pages/ExamPage'
import ListeningPage from './pages/ListeningPage'
import ReadingPage from './pages/ReadingPage'
import WritingPage from './pages/WritingPage'
import SpeakingPage from './pages/SpeakingPage'
import PracticeSetPage from './pages/PracticeSetPage'
import DashboardPage from './pages/DashboardPage'
import BlogPage from './pages/BlogPage'
import WritingPracticePage from './pages/WritingPracticePage'
import SEO from './components/SEO'
import './App.css'

function HomePage({ onSignIn }) {
  return (
    <main>
      <SEO
        title="CELPIPiQ – CELPIP Practice Tests, Mock Exams & AI Scoring"
        description="Prepare for CELPIP with full-length mock tests, AI-powered scoring, and practice for all 4 sections — Listening, Reading, Writing, and Speaking."
        canonical="/"
      />
      <Hero />
      <FeatureShowcase />
      <AIFeatures />
      <HowItWorks />
      <CRSBooster />
      <Testimonials />
      <Pricing onSignIn={onSignIn} />
      <CTA />
    </main>
  )
}

export function AppInner() {
  const [authOpen, setAuthOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])

  const isDashboard = location.pathname === '/dashboard'

  // Show the dashboard navbar on all inner app pages (when user is likely logged in)
  const innerPaths = ['/dashboard','/exam','/listening','/reading','/writing','/speaking','/practice','/practice-set','/tips','/scores','/calculator','/pricing','/blog','/writing-practice']
  const isInnerPage = innerPaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'))

  return (
    <>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {isInnerPage ? (
        <DashboardNavbar onSignIn={() => setAuthOpen(true)} />
      ) : (
        <Navbar onSignIn={() => setAuthOpen(true)} />
      )}

      <Routes>
        <Route path="/" element={<HomePage onSignIn={() => setAuthOpen(true)} />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/tips" element={<TipsPage />} />
        <Route path="/scores" element={<ScoresPage />} />
        <Route path="/calculator" element={<CRSCalculatorPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/listening" element={<ListeningPage />} />
        <Route path="/listening/:partId" element={<PracticeSetPage section="listening" />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/reading/:partId" element={<PracticeSetPage section="reading" />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/writing/:partId" element={<PracticeSetPage section="writing" />} />
        <Route path="/speaking" element={<SpeakingPage />} />
        <Route path="/speaking/:partId" element={<PracticeSetPage section="speaking" />} />
        <Route path="/practice-set" element={<PracticeSetPage />} />
        <Route path="/pricing" element={<main style={{ paddingTop: '80px' }}><Pricing /></main>} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/writing-practice" element={<WritingPracticePage />} />
        {/* catch-all */}
        <Route path="*" element={<HomePage onSignIn={() => setAuthOpen(true)} />} />
      </Routes>

      {!isInnerPage && <Footer />}
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
