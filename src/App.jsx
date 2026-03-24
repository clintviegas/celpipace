import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import DashboardNavbar from './components/DashboardNavbar'
import AuthModal from './components/AuthModal'
import Hero from './components/Hero'
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

function HomePage({ setPage }) {
  return (
    <main>
      <Hero setPage={setPage} />
      <AIFeatures setPage={setPage} />
      <HowItWorks />
      <CRSBooster setPage={setPage} />
      <Pricing />
      <Testimonials />
      <CTA setPage={setPage} />
    </main>
  )
}

export function AppInner() {
  const [page, setPage] = useState('home')
  const [activeSection, setActiveSection] = useState('listening')
  const [activePart, setActivePart] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  // Scroll to top on page change
  useEffect(() => { window.scrollTo(0, 0) }, [page])

  const goPage = (p) => setPage(p)

  return (
    <>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      
      {page === 'dashboard' ? (
        <DashboardNavbar currentPage={page} setPage={goPage} onSignIn={() => setAuthOpen(true)} />
      ) : (
        <Navbar currentPage={page} setPage={goPage} setActivePart={setActivePart} onSignIn={() => setAuthOpen(true)} />
      )}

      {page === 'home' && <HomePage setPage={goPage} />}
      {page === 'dashboard' && <DashboardPage setPage={goPage} />}

      {page === 'practice' && (
        <PracticePage
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      )}

      {page === 'tips' && <TipsPage />}
      {page === 'scores' && <ScoresPage />}
      {page === 'calculator' && <CRSCalculatorPage setPage={goPage} />}
      {page === 'exam' && <ExamPage setPage={goPage} />}
      {page === 'listening' && (
        <ListeningPage setPage={goPage} setActivePart={setActivePart} />
      )}
      {page === 'reading' && (
        <ReadingPage setPage={goPage} setActivePart={setActivePart} />
      )}
      {page === 'writing' && (
        <WritingPage setPage={goPage} setActivePart={setActivePart} />
      )}
      {page === 'speaking' && (
        <SpeakingPage setPage={goPage} setActivePart={setActivePart} />
      )}
      {page === 'practice-set' && (
        <PracticeSetPage part={activePart} setPage={goPage} />
      )}

      {/* Pricing still accessible from footer/CTA but not in main nav */}
      {page === 'pricing' && (
        <main style={{ paddingTop: '80px' }}>
          <Pricing />
        </main>
      )}

      {page !== 'dashboard' && <Footer setPage={goPage} />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
