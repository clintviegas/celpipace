import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BLOG_CATEGORIES, BLOG_ARTICLES as FALLBACK_ARTICLES } from '../data/blogData'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'
import { BRAND_NAME } from '../data/constants'
import { landingsForBlogCategory } from '../data/seoPages'

const INTRO_CTAS = {
  'is-celpip-harder-than-ielts': {
    text: 'Compare formats here, then try a free CELPIP practice test to see your CLB baseline before booking either exam.',
    to: '/celpip-practice-test',
    label: 'Free CELPIP Practice Test →',
  },
  'how-to-practice-for-celpip': {
    text: 'Use this study method with real timed questions — start on the free CELPIP practice test hub.',
    to: '/celpip-practice-test',
    label: 'Start CELPIP Practice Test →',
  },
  'celpip-test-format-complete-guide': {
    text: 'Know the format — then practice each section with timed drills and instant scoring.',
    to: '/celpip-practice-test',
    label: 'CELPIP Practice Test →',
  },
}

// Map snake_case DB row -> camelCase shape used throughout the page.
function rowToArticle(r) {
  return {
    slug:           r.slug,
    title:          r.title,
    category:       r.category,
    tag:            r.tag,
    tagColor:       r.tag_color,
    tagColorLight:  r.tag_color_light,
    readTime:       r.read_time,
    date:           r.date_label,
    excerpt:        r.excerpt,
    sections:       Array.isArray(r.sections) ? r.sections : [],
  }
}

/* ── Reading progress bar ── */
function ReadingProgress({ articleRef }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const el = articleRef.current
    if (!el) return
    const handler = () => {
      const { top, height } = el.getBoundingClientRect()
      const windowH = window.innerHeight
      const scrolled = Math.max(0, -top)
      const total    = height - windowH
      setPct(total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 100)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [articleRef])
  return (
    <div className="blog-reading-bar">
      <div className="blog-reading-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

/* ── Individual article view ── */
function ArticleView({ article, onBack, relatedArticles }) {
  const bodyRef = useRef(null)
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [article.slug])

  return (
    <motion.div
      className="blog-article-view"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
      ref={bodyRef}
    >
      <SEO
        title={article.title}
        description={article.excerpt}
        canonical={`/blog/${article.slug}`}
      />
      <ReadingProgress articleRef={bodyRef} />

      {/* Back button */}
      <button className="blog-back-btn" onClick={onBack}>
        ← Back to Blog
      </button>

      {/* Article header */}
      <header className="blog-art-header">
        <div className="blog-art-meta">
          <span
            className="blog-tag"
            style={{ background: article.tagColorLight, color: article.tagColor }}
          >
            {article.tag}
          </span>
          <span className="blog-art-date">{article.date}</span>
          <span className="blog-art-read">{article.readTime}</span>
        </div>
        <h1 className="blog-art-title">{article.title}</h1>
        <p className="blog-art-excerpt">{article.excerpt}</p>
        {INTRO_CTAS[article.slug] && (
          <div className="blog-art-intro-cta">
            <p>{INTRO_CTAS[article.slug].text}</p>
            <Link to={INTRO_CTAS[article.slug].to} className="blog-art-intro-cta-link">
              {INTRO_CTAS[article.slug].label}
            </Link>
          </div>
        )}
      </header>

      {/* Layout: body + sidebar */}
      <div className="blog-art-layout">
        {/* Main body */}
        <article className="blog-art-body">
          {article.sections.map((sec, i) => (
            <section key={i} className="blog-art-section">
              <h2 className="blog-art-h2">{sec.heading}</h2>
              {sec.body && sec.body.split('\n\n').map((para, j) => (
                <p key={j} className="blog-art-p">{para}</p>
              ))}
              {sec.list && (
                <ul className="blog-art-list">
                  {sec.list.map((item, k) => (
                    <li key={k} className="blog-art-li">{item}</li>
                  ))}
                </ul>
              )}
              {sec.body2 && sec.body2.split('\n\n').map((para, j) => (
                <p key={'b2-' + j} className="blog-art-p">{para}</p>
              ))}
            </section>
          ))}

          {/* CTA at end */}
          <div className="blog-art-cta">
            <div className="blog-art-cta-text">
              <strong>Practice makes the difference.</strong>
              <span> Use {BRAND_NAME}'s instant-scored practice questions to put these strategies into action.</span>
            </div>
            <Link to="/celpip-practice-test" className="blog-art-cta-btn">Start Practising →</Link>
          </div>

          {/* Contextual landing-page links based on article category */}
          {(() => {
            const recs = landingsForBlogCategory(article.category)
            if (!recs.length) return null
            return (
              <div className="blog-art-recs">
                <h3 className="blog-art-recs-title">Recommended next</h3>
                <div className="blog-art-recs-grid">
                  {recs.map(rec => (
                    <Link key={rec.to} to={rec.to} className="blog-art-rec-card">
                      <span className="blog-art-rec-label">{rec.label}</span>
                      <span className="blog-art-rec-blurb">{rec.blurb}</span>
                      <span className="blog-art-rec-cta">Open →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })()}
        </article>

        {/* Sidebar */}
        <aside className="blog-art-sidebar">
          <div className="blog-sidebar-card">
            <h3 className="blog-sidebar-title">Related Articles</h3>
            <div className="blog-sidebar-list">
              {relatedArticles.map(rel => (
                <Link
                  key={rel.slug}
                  to={`/blog/${rel.slug}`}
                  className="blog-sidebar-item"
                >
                  <span
                    className="blog-sidebar-tag"
                    style={{ background: rel.tagColorLight, color: rel.tagColor }}
                  >
                    {rel.tag}
                  </span>
                  <span className="blog-sidebar-item-title">{rel.title}</span>
                  <span className="blog-sidebar-item-read">{rel.readTime}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="blog-sidebar-cta">
            <div className="blog-sidebar-cta-icon">🎯</div>
            <h4 className="blog-sidebar-cta-title">Ready to Practice?</h4>
            <p className="blog-sidebar-cta-sub">Apply these strategies with real CELPIP-style questions and instant scoring.</p>
            <Link to="/celpip-mock-test" className="blog-sidebar-cta-btn">Try a Mock Exam</Link>
          </div>
        </aside>
      </div>
    </motion.div>
  )
}

/* ── Article card ── */
const MotionLink = motion(Link)

function ArticleCard({ article, index }) {
  return (
    <MotionLink
      to={`/blog/${article.slug}`}
      className="blog-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
    >
      <div
        className="blog-card-band"
        style={{ background: `linear-gradient(135deg, ${article.tagColor}, ${article.tagColor}99)` }}
      />

      <div className="blog-card-body">
        <div className="blog-card-meta">
          <span
            className="blog-tag"
            style={{ background: article.tagColorLight, color: article.tagColor }}
          >
            {article.tag}
          </span>
          <span className="blog-card-read">{article.readTime}</span>
        </div>

        <h2 className="blog-card-title">{article.title}</h2>
        <p className="blog-card-excerpt">{article.excerpt}</p>

        <div className="blog-card-footer">
          <span className="blog-card-date">{article.date}</span>
          <span className="blog-card-cta">Read article {'->'}</span>
        </div>
      </div>
    </MotionLink>
  )
}

/* ── Main BlogPage ── */
export default function BlogPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [articles, setArticles]             = useState(FALLBACK_ARTICLES)
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeArticle, setActiveArticle]   = useState(null)
  const [search, setSearch]                 = useState('')

  // Fetch published posts from Supabase. Falls back to the static array
  // (FALLBACK_ARTICLES) if the request fails so the page never shows blank.
  useEffect(() => {
    let cancel = false
    ;(async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('slug, title, category, tag, tag_color, tag_color_light, read_time, date_label, excerpt, sections, sort_order, created_at')
        .eq('published', true)
        .order('sort_order', { ascending: false })
        .order('created_at', { ascending: false })
      if (cancel) return
      if (error || !data?.length) {
        console.warn('[blog] DB fetch failed, using static fallback:', error?.message)
        return
      }
      setArticles(data.map(rowToArticle))
    })()
    return () => { cancel = true }
  }, [])

  useEffect(() => {
    if (!slug) {
      setActiveArticle(null)
      return
    }
    setActiveArticle(articles.find(a => a.slug === slug) || null)
  }, [slug, articles])

  const filtered = articles.filter(a => {
    const matchCat = activeCategory === 'all' || a.category === activeCategory
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
                        a.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const relatedArticles = activeArticle
    ? articles
        .filter(a => a.slug !== activeArticle.slug && (a.category === activeArticle.category || a.category === 'strategy'))
        .slice(0, 4)
    : []

  const handleBack = (articleOrNull) => {
    if (articleOrNull && articleOrNull.slug) {
      navigate(`/blog/${articleOrNull.slug}`)
    } else {
      navigate('/blog')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="blog-page">
      <SEO
        title="Blog & Articles - CELPIP Tips, Strategies & Immigration Guides"
        description="Read expert CELPIP tips, section-by-section strategies, CLB scoring guides, and Express Entry immigration articles written by certified coaches."
        canonical="/blog"
      />

      <AnimatePresence mode="wait">
        {activeArticle ? (
          <ArticleView
            key={activeArticle.slug}
            article={activeArticle}
            onBack={handleBack}
            relatedArticles={relatedArticles}
          />
        ) : (
          <motion.div
            key="listing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="blog-hero">
              <div className="blog-hero-inner">
                <span className="blog-hero-badge">{BRAND_NAME} Blog</span>
                <h1 className="blog-hero-title">
                  Expert Tips, Strategies &<br />
                  <span className="blog-hero-accent">Immigration Guides</span>
                </h1>
                <p className="blog-hero-sub">
                  In-depth articles to help you prepare for CELPIP and strengthen your Express Entry application.
                </p>
                <div className="blog-hero-search-wrap">
                  <span className="blog-hero-search-icon" aria-hidden="true">🔍</span>
                  <input
                    className="blog-hero-search"
                    placeholder="Search articles..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="blog-cats-wrap">
              <div className="blog-cats">
                {BLOG_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`blog-cat-btn${activeCategory === cat.id ? ' blog-cat-btn--active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.label}
                    {cat.id !== 'all' && (
                      <span className="blog-cat-count">
                        {articles.filter(a => a.category === cat.id).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="blog-content">
              {filtered.length === 0 ? (
                <div className="blog-empty">
                  <span>🔍</span>
                  <p>No articles found for "{search}"</p>
                  <button onClick={() => setSearch('')}>Clear search</button>
                </div>
              ) : (
                <>
                  <p className="blog-result-count">
                    {filtered.length} article{filtered.length !== 1 ? 's' : ''}
                    {activeCategory !== 'all' ? ` in ${BLOG_CATEGORIES.find(c => c.id === activeCategory)?.label}` : ''}
                  </p>
                  <div className="blog-grid">
                    {filtered.map((article, i) => (
                      <ArticleCard
                        key={article.slug}
                        article={article}
                        index={i}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
