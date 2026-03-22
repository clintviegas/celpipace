import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import Hero from './components/Hero'
import WhyCELPIP from './components/WhyCELPIP'
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
import './App.css'

function HomePage({ setPage }) {
  return (
    <main>
      <Hero setPage={setPage} />
      <WhyCELPIP />
      <CRSBooster setPage={setPage} />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA setPage={setPage} />
    </main>
  )
}

export function AppInner() {
  const [page, setPage] = useState('home')
  const [activeSection, setActiveSection] = useState('listening')
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
      <Navbar currentPage={page} setPage={goPage} onSignIn={() => setAuthOpen(true)} />

      {page === 'home' && <HomePage setPage={goPage} />}

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

      {page === 'pricing' && (
        <main style={{ paddingTop: '80px' }}>
          <Pricing />
        </main>
      )}

      <Footer setPage={goPage} />
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
