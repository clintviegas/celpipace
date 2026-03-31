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
import './App.css'

function HomePage({ onSignIn }) {
  return (
    <main>
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

  return (
    <>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {isDashboard ? (
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
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/speaking" element={<SpeakingPage />} />
        <Route path="/practice-set" element={<PracticeSetPage />} />
        <Route path="/pricing" element={<main style={{ paddingTop: '80px' }}><Pricing /></main>} />
        {/* catch-all */}
        <Route path="*" element={<HomePage onSignIn={() => setAuthOpen(true)} />} />
      </Routes>

      {!isDashboard && <Footer />}
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
