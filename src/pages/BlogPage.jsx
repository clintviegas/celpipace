import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BLOG_ARTICLES, BLOG_CATEGORIES } from '../data/blogData'
import SEO from '../components/SEO'

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
              <span> Use CELPIPace's AI-scored practice questions to put these strategies into action.</span>
            </div>
            <a href="/exam" className="blog-art-cta-btn">Start Practising →</a>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="blog-art-sidebar">
          <div className="blog-sidebar-card">
            <h3 className="blog-sidebar-title">Related Articles</h3>
            <div className="blog-sidebar-list">
              {relatedArticles.map(rel => (
                <button
                  key={rel.slug}
                  className="blog-sidebar-item"
                  onClick={() => onBack(rel)}
                >
                  <span
                    className="blog-sidebar-tag"
                    style={{ background: rel.tagColorLight, color: rel.tagColor }}
                  >
                    {rel.tag}
                  </span>
                  <span className="blog-sidebar-item-title">{rel.title}</span>
                  <span className="blog-sidebar-item-read">{rel.readTime}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="blog-sidebar-cta">
            <div className="blog-sidebar-cta-icon">🎯</div>
            <h4 className="blog-sidebar-cta-title">Ready to Practice?</h4>
            <p className="blog-sidebar-cta-sub">Apply these strategies with real CELPIP-style questions and AI scoring.</p>
            <a href="/exam" className="blog-sidebar-cta-btn">Try a Mock Exam</a>
          </div>
        </aside>
      </div>
    </motion.div>
  )
}

/* ── Article card ── */
function ArticleCard({ article, onClick, index }) {
  return (
    <motion.article
      className="blog-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
      onClick={() => onClick(article)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(article)}
    >
      {/* Color band at top */}
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
          <span className="blog-card-cta">Read article →</span>
        </div>
      </div>
    </motion.article>
  )
}

/* ── Main BlogPage ── */
export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeArticle, setActiveArticle]   = useState(null)
  const [search, setSearch]                 = useState('')

  const filtered = BLOG_ARTICLES.filter(a => {
    const matchCat = activeCategory === 'all' || a.category === activeCategory
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) ||
                        a.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const relatedArticles = activeArticle
    ? BLOG_ARTICLES
        .filter(a => a.slug !== activeArticle.slug && (a.category === activeArticle.category || a.category === 'strategy'))
        .slice(0, 4)
    : []

  const handleBack = (articleOrNull) => {
    if (articleOrNull && articleOrNull.slug) {
      setActiveArticle(articleOrNull)
    } else {
      setActiveArticle(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="blog-page">
      <SEO
        title="Blog & Articles – CELPIP Tips, Strategies & Immigration Guides"
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
            {/* ── Blog Hero ── */}
            <div className="blog-hero">
              <div className="blog-hero-inner">
                <span className="blog-hero-badge">CELPIPace Blog</span>
                <h1 className="blog-hero-title">
                  Expert Tips, Strategies &<br />
                  <span className="blog-hero-accent">Immigration Guides</span>
                </h1>
                <p className="blog-hero-sub">
                  In-depth articles to help you score higher on CELPIP and strengthen your Express Entry application.
                </p>
                <div className="blog-hero-search-wrap">
                  <span className="blog-hero-search-icon">🔍</span>
                  <input
                    className="blog-hero-search"
                    placeholder="Search articles..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ── Category tabs ── */}
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
                        {BLOG_ARTICLES.filter(a => a.category === cat.id).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Article grid ── */}
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
                        onClick={setActiveArticle}
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
