import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
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

export default function App() {
  const [page, setPage] = useState('home')
  const [activeSection, setActiveSection] = useState('listening')

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
      <Navbar currentPage={page} setPage={goPage} />

      {page === 'home' && <HomePage setPage={goPage} />}

      {page === 'practice' && (
        <PracticePage
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      )}

      {page === 'tips' && <TipsPage />}
      {page === 'scores' && <ScoresPage />}
      {page === 'calculator' && <CRSCalculatorPage />}

      {page === 'pricing' && (
        <main style={{ paddingTop: '80px' }}>
          <Pricing />
        </main>
      )}

      <Footer setPage={goPage} />
    </>
  )
}
