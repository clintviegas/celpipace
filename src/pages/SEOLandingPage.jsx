import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ClipboardCheck, Gauge, Headphones, Mic, PenLine, Search, Sparkles } from 'lucide-react'
import SEO from '../components/SEO'
import { LANDING_PAGES, faqJsonLd, softwareJsonLd } from '../data/seoPages'

const ICONS = { ClipboardCheck, Gauge, Headphones, Mic, PenLine, Search, Sparkles }

export default function SEOLandingPage({ type = 'practice' }) {
  const navigate = useNavigate()
  const page = LANDING_PAGES[type] || LANDING_PAGES.practice
  const Icon = ICONS[page.icon] || ClipboardCheck

  return (
    <main className="seo-page">
      <SEO
        title={page.seoTitle}
        description={page.description}
        canonical={page.canonical}
        jsonLd={[softwareJsonLd(page), faqJsonLd(page)]}
      />

      <section className="seo-hero">
        <div className="seo-hero-copy">
          <p className="seo-eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="seo-subhead">{page.description}</p>
          <div className="seo-actions">
            <button className="seo-primary" onClick={() => navigate(page.primaryPath)}>
              {page.primaryCta} <ArrowRight size={18} />
            </button>
            <button className="seo-secondary" onClick={() => navigate(page.secondaryPath)}>
              {page.secondaryCta}
            </button>
          </div>
        </div>
        <div className="seo-proof-panel" aria-label="CELPIPACE proof points">
          <Icon size={34} />
          {page.proof.map(item => (
            <div key={item} className="seo-proof-row">
              <CheckCircle2 size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="seo-section seo-grid-section">
        <div>
          <p className="seo-section-label">Why this matters for growth</p>
          <h2>Capture search intent, then move users into practice.</h2>
          <p>{page.intent}</p>
        </div>
        <div className="seo-card-grid">
          {page.sections.map(([title, copy]) => (
            <article key={title} className="seo-card">
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seo-section seo-faq-section">
        <p className="seo-section-label">Common questions</p>
        <h2>Answers before the user hits a paywall.</h2>
        <div className="seo-faq-list">
          {page.faqs.map(([question, answer]) => (
            <article key={question} className="seo-faq-item">
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
