import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ClipboardCheck, Gauge, Headphones, Mic, PenLine, Search, Sparkles } from 'lucide-react'
import SEO from '../components/SEO'
import { LANDING_PAGES, faqJsonLd, softwareJsonLd } from '../data/seoPages'
import { BLOG_ARTICLES } from '../data/blogData'

const ICONS = { ClipboardCheck, Gauge, Headphones, Mic, PenLine, Search, Sparkles }

const BLOG_BY_SLUG = Object.fromEntries(BLOG_ARTICLES.map(a => [a.slug, a]))

export default function SEOLandingPage({ type = 'practice' }) {
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
            <Link to={page.primaryPath} className="seo-primary">
              {page.primaryCta} <ArrowRight size={18} />
            </Link>
            <Link to={page.secondaryPath} className="seo-secondary">
              {page.secondaryCta}
            </Link>
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

      {page.siblings?.length > 0 && (
        <section className="seo-section seo-siblings-section">
          <p className="seo-section-label">Keep exploring</p>
          <h2>Related CELPIP resources</h2>
          <div className="seo-card-grid">
            {page.siblings.map(sib => (
              <Link key={sib.to} to={sib.to} className="seo-card seo-card-link">
                <h3>{sib.label}</h3>
                <p>{sib.blurb}</p>
                <span className="seo-card-cta">Open {sib.label} <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {page.relatedBlogSlugs?.length > 0 && (
        <section className="seo-section seo-related-guides-section">
          <p className="seo-section-label">Related guides</p>
          <h2>Read before you practice</h2>
          <div className="seo-card-grid">
            {page.relatedBlogSlugs
              .map(slug => BLOG_BY_SLUG[slug])
              .filter(Boolean)
              .map(article => (
                <Link key={article.slug} to={`/blog/${article.slug}`} className="seo-card seo-card-link">
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <span className="seo-card-cta">Read article <ArrowRight size={14} /></span>
                </Link>
              ))}
          </div>
        </section>
      )}
    </main>
  )
}
