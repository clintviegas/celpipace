import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { readFileSync as readSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

// Load .env into process.env if it exists (Vercel CI already populates these,
// but a local `npm run build` needs them for the Supabase fetch below).
{
  const __filename = fileURLToPath(import.meta.url)
  const envPath = path.resolve(path.dirname(__filename), '..', '.env')
  if (existsSync(envPath)) {
    for (const line of readSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}
import { BLOG_ARTICLES as FALLBACK_ARTICLES } from '../src/data/blogData.js'
import { CORE_PRODUCT_LINKS, FEATURED_BLOG_LINKS, TOOL_RESOURCE_LINKS } from '../src/data/crawlLinks.js'
import { BRAND_NAME, PRODUCT_STATS, PUBLIC_SITE_URL } from '../src/data/constants.js'
import { LANDING_PAGES, faqJsonLd, softwareJsonLd, landingsForBlogCategory } from '../src/data/seoPages.js'

// Fetch published blog posts from Supabase at build time so the CMS drives SEO.
// Falls back to the static blogData.js array if env vars are missing or fetch fails.
async function loadBlogArticles() {
  const url  = process.env.VITE_SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) {
    console.warn('[prerender] Supabase env vars missing — using static fallback.')
    return FALLBACK_ARTICLES
  }
  try {
    const supabase = createClient(url, anon)
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug, title, category, tag, tag_color, tag_color_light, read_time, date_label, excerpt, sections')
      .eq('published', true)
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false })
    if (error || !data?.length) {
      console.warn('[prerender] DB fetch failed — using static fallback:', error?.message)
      return FALLBACK_ARTICLES
    }
    return data.map(r => ({
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
    }))
  } catch (e) {
    console.warn('[prerender] DB load exception — using static fallback:', e?.message)
    return FALLBACK_ARTICLES
  }
}

const BLOG_ARTICLES = await loadBlogArticles()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const templatePath = path.join(distDir, 'index.html')
const DEFAULT_OG_IMAGE = `${PUBLIC_SITE_URL}/og-image.png`

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripHtml(value = '') {
  return String(value).replace(/\s+/g, ' ').trim()
}

function fullTitle(title) {
  const cleanTitle = title?.replace(/\s*\|\s*celpipace\s*$/i, '').trim()
  if (!cleanTitle) return `${BRAND_NAME} | CELPIP Practice Tests, Mock Exams & Instant Scoring`
  return /celpipace/i.test(cleanTitle) ? cleanTitle : `${cleanTitle} | ${BRAND_NAME}`
}

function canonicalUrl(canonical) {
  return `${PUBLIC_SITE_URL}${canonical === '/' ? '' : canonical}`
}

function metaTags({ title, description, canonical, jsonLd = [], ogImage = DEFAULT_OG_IMAGE }) {
  const resolvedTitle = fullTitle(title)
  const resolvedCanonical = canonicalUrl(canonical)
  const structuredData = Array.isArray(jsonLd) ? jsonLd : [jsonLd]

  return [
    `<title>${escapeHtml(resolvedTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(resolvedCanonical)}" />`,
    `<meta property="og:site_name" content="${BRAND_NAME}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${escapeHtml(resolvedCanonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(resolvedTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(resolvedTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
    ...structuredData.filter(Boolean).map(data => `<script type="application/ld+json">${JSON.stringify(data)}</script>`),
  ].join('\n    ')
}

function replaceHead(template, pageMeta) {
  const withoutManagedTags = template
    .replace(/\s*<title>[\s\S]*?<\/title>/gi, '')
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, '')
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, '')
    .replace(/\s*<meta\s+property="og:[^"]+"[^>]*>/gi, '')
    .replace(/\s*<meta\s+name="twitter:[^"]+"[^>]*>/gi, '')
    .replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')

  return withoutManagedTags.replace('</head>', `    ${metaTags(pageMeta)}\n  </head>`)
}

function renderLayout(template, pageMeta, body) {
  return replaceHead(template, pageMeta).replace(
    '<div id="root"></div>',
    `<div id="root">\n${body}\n    </div>`
  )
}

function renderList(items, className = '') {
  return `<ul${className ? ` class="${className}"` : ''}>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
}

function renderLandingPage(page) {
  const siblings = Array.isArray(page.siblings) ? page.siblings : []
  const blogBySlug = Object.fromEntries(BLOG_ARTICLES.map(a => [a.slug, a]))
  const related = (page.relatedBlogSlugs || []).map(slug => blogBySlug[slug]).filter(Boolean)

  const siblingsBlock = siblings.length
    ? `      <section class="seo-section seo-siblings-section">
        <p class="seo-section-label">Keep exploring</p>
        <h2>Related CELPIP resources</h2>
        <div class="seo-card-grid">
          ${siblings.map(sib => `<a class="seo-card seo-card-link" href="${escapeHtml(sib.to)}"><h3>${escapeHtml(sib.label)}</h3><p>${escapeHtml(sib.blurb)}</p><span class="seo-card-cta">Open ${escapeHtml(sib.label)} →</span></a>`).join('\n          ')}
        </div>
      </section>`
    : ''

  const relatedBlock = related.length
    ? `      <section class="seo-section seo-related-guides-section">
        <p class="seo-section-label">Related guides</p>
        <h2>Read before you practice</h2>
        <div class="seo-card-grid">
          ${related.map(article => `<a class="seo-card seo-card-link" href="/blog/${escapeHtml(article.slug)}"><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(article.excerpt)}</p><span class="seo-card-cta">Read article →</span></a>`).join('\n          ')}
        </div>
      </section>`
    : ''

  return `    <main class="seo-page prerender-page">
      <section class="seo-hero">
        <div class="seo-hero-copy">
          <p class="seo-eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.title)}</h1>
          <p class="seo-subhead">${escapeHtml(page.description)}</p>
          <div class="seo-actions">
            <a class="seo-primary" href="${escapeHtml(page.primaryPath)}">${escapeHtml(page.primaryCta)}</a>
            <a class="seo-secondary" href="${escapeHtml(page.secondaryPath)}">${escapeHtml(page.secondaryCta)}</a>
          </div>
        </div>
        <div class="seo-proof-panel" aria-label="CELPIPACE proof points">
          ${page.proof.map(item => `<div class="seo-proof-row"><span>${escapeHtml(item)}</span></div>`).join('\n          ')}
        </div>
      </section>
      <section class="seo-section seo-grid-section">
        <div>
          <p class="seo-section-label">Why this matters for growth</p>
          <h2>Capture search intent, then move users into practice.</h2>
          <p>${escapeHtml(page.intent)}</p>
        </div>
        <div class="seo-card-grid">
          ${page.sections.map(([title, copy]) => `<article class="seo-card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(copy)}</p></article>`).join('\n          ')}
        </div>
      </section>
      <section class="seo-section seo-faq-section">
        <p class="seo-section-label">Common questions</p>
        <h2>Answers before the user hits a paywall.</h2>
        <div class="seo-faq-list">
          ${page.faqs.map(([question, answer]) => `<article class="seo-faq-item"><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join('\n          ')}
        </div>
      </section>
${siblingsBlock}
${relatedBlock}
    </main>`
}

function renderLinkColumn(heading, links) {
  return `        <div class="seo-link-col">
          <h2>${escapeHtml(heading)}</h2>
          <ul class="seo-link-list">
            ${links.map(link => `<li><a href="${escapeHtml(link.to)}">${escapeHtml(link.label)}</a></li>`).join('\n            ')}
          </ul>
        </div>`
}

function renderHomeInternalLinks() {
  return `      <nav class="seo-section seo-internal-links" aria-label="CELPIP practice tests, tools, and study guides">
        <p class="seo-section-label">Explore CELPIPACE</p>
        <div class="seo-link-columns">
          ${renderLinkColumn('Practice tests', CORE_PRODUCT_LINKS)}
          ${renderLinkColumn('Tools & resources', TOOL_RESOURCE_LINKS)}
          ${renderLinkColumn('Popular study guides', FEATURED_BLOG_LINKS)}
        </div>
      </nav>`
}

function renderHomePage() {
  return `    <main class="seo-page prerender-page">
      <section class="seo-hero">
        <div class="seo-hero-copy">
          <p class="seo-eyebrow">CELPIP practice with AI scoring</p>
          <h1>CELPIP Mock Test & Practice Tests Online – Free AI Scoring</h1>
          <p class="seo-subhead">Free CELPIP mock tests and section practice with instant AI scoring. Full-length exams for Listening, Reading, Writing & Speaking.</p>
          <div class="seo-actions">
            <a class="seo-primary" href="/celpip-practice-test">CELPIP Practice Test</a>
            <a class="seo-secondary" href="/celpip-mock-test">CELPIP Mock Test</a>
            <a class="seo-secondary" href="/blog">Study Guides</a>
            <a class="seo-secondary" href="/pricing">Pricing</a>
          </div>
        </div>
        <div class="seo-proof-panel" aria-label="CELPIPACE proof points">
          ${renderList([`${PRODUCT_STATS.questionItems} question items`, `${PRODUCT_STATS.mockExams} full mock exams`, 'AI writing and speaking feedback', 'Saved CLB score reports'], 'seo-prerender-list')}
        </div>
      </section>
      <section class="seo-section seo-grid-section">
        <div>
          <p class="seo-section-label">Study system</p>
          <h2>One place for CELPIP Listening, Reading, Writing, and Speaking.</h2>
          <p>Use practice sets to find weak skills, mock exams to simulate test day, and score reports to decide what to improve next.</p>
        </div>
        <div class="seo-card-grid">
          <a class="seo-card seo-card-link" href="/celpip-listening-practice"><h3>Listening</h3><p>${PRODUCT_STATS.listeningSets} listening sets with Canadian English practice.</p></a>
          <a class="seo-card seo-card-link" href="/celpip-reading-practice"><h3>Reading</h3><p>${PRODUCT_STATS.readingSets} reading sets across correspondence, diagrams, information, and viewpoints.</p></a>
          <a class="seo-card seo-card-link" href="/celpip-writing-practice"><h3>Writing</h3><p>${PRODUCT_STATS.writingSets} prompts for email and survey response practice.</p></a>
          <a class="seo-card seo-card-link" href="/celpip-speaking-practice"><h3>Speaking</h3><p>${PRODUCT_STATS.speakingPrompts} prompts covering all 8 CELPIP Speaking tasks.</p></a>
        </div>
      </section>
${renderHomeInternalLinks()}
    </main>`
}

function articleJsonLd(article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: stripHtml(article.excerpt),
    datePublished: article.date,
    author: { '@type': 'Organization', name: BRAND_NAME },
    publisher: { '@type': 'Organization', name: BRAND_NAME },
    mainEntityOfPage: `${PUBLIC_SITE_URL}/blog/${article.slug}`,
  }
}

function articleFaqJsonLd(article) {
  const items = (article.sections || [])
    .filter(s => s.heading && s.body)
    .map(s => ({
      '@type': 'Question',
      name: s.heading,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml([s.body, (s.list || []).join('. '), s.body2].filter(Boolean).join(' ')).slice(0, 600),
      },
    }))
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items,
  }
}

function renderBlogIndex() {
  return `    <main class="seo-page prerender-page">
      <section class="seo-hero">
        <div class="seo-hero-copy">
          <p class="seo-eyebrow">CELPIP study guides</p>
          <h1>CELPIP Tips, Score Strategy, and Practice Guides</h1>
          <p class="seo-subhead">Read practical CELPIP preparation guides for writing, speaking, listening, reading, CRS planning, and test-day strategy.</p>
        </div>
      </section>
      <section class="seo-section seo-faq-section">
        <div class="seo-faq-list">
          ${BLOG_ARTICLES.map(article => `<article class="seo-faq-item"><h2><a href="/blog/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.excerpt)}</p><p>${escapeHtml(article.readTime)} · ${escapeHtml(article.date)}</p></article>`).join('\n          ')}
        </div>
      </section>
    </main>`
}

// Pick up to 4 topically-related posts for crawlable blog-to-blog links.
// Same category first, then fall back to strategy posts, then anything.
function relatedBlogPosts(article) {
  const others = BLOG_ARTICLES.filter(a => a.slug !== article.slug)
  const sameCat = others.filter(a => a.category === article.category)
  const strategy = others.filter(a => a.category === 'strategy' && a.category !== article.category)
  const seen = new Set()
  const picked = []
  for (const a of [...sameCat, ...strategy, ...others]) {
    if (seen.has(a.slug)) continue
    seen.add(a.slug)
    picked.push(a)
    if (picked.length === 4) break
  }
  return picked
}

function renderRelatedArticles(article) {
  const related = relatedBlogPosts(article)
  if (!related.length) return ''
  return `      <section class="seo-section seo-related-articles-section">
        <p class="seo-section-label">Keep reading</p>
        <h2>Related CELPIP articles</h2>
        <div class="seo-card-grid">
          ${related.map(a => `<a class="seo-card seo-card-link" href="/blog/${escapeHtml(a.slug)}"><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.excerpt)}</p><span class="seo-card-cta">Read article →</span></a>`).join('\n          ')}
        </div>
      </section>`
}

function renderBlogArticle(article) {
  const recs = landingsForBlogCategory(article.category)
  const recsBlock = recs.length
    ? `      <section class="seo-section seo-related-guides-section">
        <p class="seo-section-label">Recommended next</p>
        <h2>Put this into practice</h2>
        <div class="seo-card-grid">
          ${recs.map(rec => `<a class="seo-card seo-card-link" href="${escapeHtml(rec.to)}"><h3>${escapeHtml(rec.label)}</h3><p>${escapeHtml(rec.blurb)}</p><span class="seo-card-cta">Open →</span></a>`).join('\n          ')}
        </div>
      </section>`
    : ''

  return `    <main class="seo-page prerender-page">
      <article class="seo-section seo-faq-section">
        <p class="seo-section-label">${escapeHtml(article.tag)} · ${escapeHtml(article.readTime)}</p>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="seo-subhead">${escapeHtml(article.excerpt)}</p>
        <div class="seo-faq-list">
          ${article.sections.map(section => `<section class="seo-faq-item"><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p>${section.list ? renderList(section.list) : ''}${section.body2 ? `<p>${escapeHtml(section.body2)}</p>` : ''}</section>`).join('\n          ')}
        </div>
      </article>
${recsBlock}
${renderRelatedArticles(article)}
    </main>`
}

function renderSimplePage(page) {
  return `    <main class="seo-page prerender-page">
      <section class="seo-hero">
        <div class="seo-hero-copy">
          <p class="seo-eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.heading)}</h1>
          <p class="seo-subhead">${escapeHtml(page.description)}</p>
          <div class="seo-actions">
            <a class="seo-primary" href="${escapeHtml(page.primaryPath || page.canonical)}">${escapeHtml(page.primaryCta || 'Open page')}</a>
          </div>
        </div>
        <div class="seo-proof-panel" aria-label="${escapeHtml(page.heading)} proof points">
          ${renderList(page.proof, 'seo-prerender-list')}
        </div>
      </section>
    </main>`
}

async function writeRoute(template, route) {
  const html = renderLayout(template, route.meta, route.body)
  const outputPath = route.path === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, route.path.replace(/^\//, ''), 'index.html')

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html, 'utf8')
  return route.path
}

async function main() {
  const template = await readFile(templatePath, 'utf8')
  const simplePublicRoutes = [
    {
      canonical: '/practice',
      title: 'CELPIP Practice Hub',
      heading: 'CELPIP Practice for Every Skill',
      eyebrow: 'Practice hub',
      description: 'Choose Listening, Reading, Writing, Speaking, or full mock exam practice from one CELPIP study dashboard.',
      proof: ['Section drills', 'Saved progress', 'Free practice entry point'],
      primaryCta: 'Start Practice',
    },
    {
      canonical: '/exam',
      title: 'CELPIP Mock Exams',
      heading: 'Full CELPIP Mock Exams and Score Reports',
      eyebrow: 'Mock exam hub',
      description: `Take ${PRODUCT_STATS.mockExams} timed CELPIP mock exams with score reports and section-by-section review.`,
      proof: [`${PRODUCT_STATS.mockExams} full mock exams`, 'Timed exam flow', 'Saved CLB reports'],
      primaryCta: 'Open Mock Exams',
    },
    {
      canonical: '/calculator',
      title: 'CRS Calculator for CELPIP Scores',
      heading: 'CRS and CLB Planning Calculator',
      eyebrow: 'Score planning',
      description: 'Estimate CRS language points, map CELPIP scores to CLB levels, and identify which skill can raise your Express Entry profile.',
      proof: ['CLB conversion', 'CRS language points', 'Weak-skill planning'],
      primaryCta: 'Open Calculator',
    },
    {
      canonical: '/tips',
      title: 'CELPIP Tips and Strategies',
      heading: 'CELPIP Tips for Higher CLB Scores',
      eyebrow: 'Study strategy',
      description: 'Use focused CELPIP strategies for listening, reading, writing, speaking, timing, vocabulary, and test-day confidence.',
      proof: ['Skill-specific tips', 'Timing strategy', 'CLB-focused advice'],
      primaryCta: 'Read Tips',
    },
    {
      canonical: '/pricing',
      title: 'CELPIPACE Pricing',
      heading: 'Premium CELPIP Practice Plans',
      eyebrow: 'Pricing',
      description: 'Upgrade for full mock exams, AI scoring, score tracking, explanations, courses, study guides, and premium CELPIP practice tools.',
      proof: ['Full mock exams', 'Unlimited AI scoring', 'Self-serve Stripe billing'],
      primaryCta: 'View Plans',
    },
    {
      canonical: '/contact',
      title: 'Contact CELPIPACE Support',
      heading: 'Contact CELPIPACE Support',
      eyebrow: 'Support',
      description: 'Contact CELPIPACE support for account help, billing questions, technical issues, feedback, corrections, and CELPIP practice questions.',
      proof: ['Account support', 'Billing help', 'Technical assistance'],
      primaryCta: 'Contact Support',
    },
  ]
  const routes = [
    {
      path: '/',
      meta: {
        title: 'CELPIP Mock Test & Practice Tests Online – Free AI Scoring',
        description: 'Free CELPIP mock tests and section practice with instant AI scoring. Full-length exams for Listening, Reading, Writing & Speaking. Start free today.',
        canonical: '/',
        jsonLd: [
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: BRAND_NAME,
            url: PUBLIC_SITE_URL,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'What is a CELPIP mock test?', acceptedAnswer: { '@type': 'Answer', text: 'A CELPIP mock test is a full-length timed simulation of the official CELPIP General exam, covering Listening, Reading, Writing, and Speaking. CELPIPAce mock exams include instant CLB score reports and real-time AI feedback on writing and speaking.' } },
              { '@type': 'Question', name: 'Is CELPIPAce free to use?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. CELPIPAce offers free section practice across all four CELPIP skills. Full-length mock exams and detailed score reports are available with a premium subscription.' } },
              { '@type': 'Question', name: 'How do I prepare for the CELPIP exam?', acceptedAnswer: { '@type': 'Answer', text: 'Start with section drills to identify your weakest skill, then take timed mock exams to build stamina. Review your CLB score reports after each mock to focus your remaining study time on the sections that will gain you the most CRS points.' } },
              { '@type': 'Question', name: 'Does CELPIPAce cover all four CELPIP sections?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. CELPIPAce includes practice and mock exam content for all four CELPIP General sections: Listening, Reading, Writing, and Speaking.' } },
              { '@type': 'Question', name: 'Is CELPIP accepted for Canadian permanent residence?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. CELPIP General is an accepted English language test for many Canadian immigration programs, including Express Entry. Your CELPIP scores are converted to CLB levels, which determine your CRS language points.' } },
            ],
          },
        ],
      },
      body: renderHomePage(),
    },
    ...Object.values(LANDING_PAGES).map(page => ({
      path: page.canonical,
      meta: {
        title: page.seoTitle,
        description: page.description,
        canonical: page.canonical,
        jsonLd: [softwareJsonLd(page), faqJsonLd(page)],
      },
      body: renderLandingPage(page),
    })),
    ...simplePublicRoutes.map(page => ({
      path: page.canonical,
      meta: {
        title: page.title,
        description: page.description,
        canonical: page.canonical,
      },
      body: renderSimplePage(page),
    })),
    {
      path: '/blog',
      meta: {
        title: 'CELPIP Blog',
        description: 'CELPIP tips, score strategy, writing guides, speaking practice advice, reading methods, listening strategies, and Canadian immigration language planning.',
        canonical: '/blog',
      },
      body: renderBlogIndex(),
    },
    ...BLOG_ARTICLES.map(article => ({
      path: `/blog/${article.slug}`,
      meta: {
        title: article.title,
        description: article.excerpt,
        canonical: `/blog/${article.slug}`,
        jsonLd: [articleJsonLd(article), articleFaqJsonLd(article)].filter(Boolean),
      },
      body: renderBlogArticle(article),
    })),
  ]

  const written = []
  for (const route of routes) {
    written.push(await writeRoute(template, route))
  }

  console.log(`Prerendered ${written.length} SEO routes:`)
  written.forEach(route => console.log(`  - ${route}`))

  await writeSitemap()
  await pingIndexNow()
}

// IndexNow: notify Google & Bing the moment new content deploys so it gets
// crawled in hours instead of waiting for the next organic crawl. Only fires
// on real deploys (Vercel sets VERCEL=1); skipped on local builds.
const INDEXNOW_KEY = '45681f953f7fdcb8ba99e6dbbfb1cebd'
async function pingIndexNow() {
  if (!process.env.VERCEL && !process.env.CI) {
    console.log('IndexNow: skipped (not a CI/production build).')
    return
  }
  const host = PUBLIC_SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const urlList = [
    ...STATIC_SITEMAP_ROUTES.map(r => `${PUBLIC_SITE_URL}${r.path}`),
    ...BLOG_ARTICLES.map(a => `${PUBLIC_SITE_URL}/blog/${a.slug}`),
  ]
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${PUBLIC_SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    })
    console.log(`IndexNow: submitted ${urlList.length} URLs — HTTP ${res.status}`)
  } catch (e) {
    console.warn('IndexNow: ping failed (non-fatal):', e?.message)
  }
}

// Static (non-blog) URLs included in sitemap.xml. Blog URLs come from the DB.
const STATIC_SITEMAP_ROUTES = [
  { path: '/',                          priority: '1.0',  changefreq: 'weekly' },
  { path: '/celpip-practice-test',      priority: '0.95', changefreq: 'monthly' },
  { path: '/celpip-mock-test',          priority: '0.95', changefreq: 'monthly' },
  { path: '/celpip-listening-practice', priority: '0.9',  changefreq: 'weekly' },
  { path: '/celpip-reading-practice',   priority: '0.9',  changefreq: 'weekly' },
  { path: '/celpip-writing-practice',   priority: '0.95', changefreq: 'weekly' },
  { path: '/celpip-speaking-practice',  priority: '0.95', changefreq: 'weekly' },
  { path: '/celpip-score-calculator',   priority: '0.9',  changefreq: 'monthly' },
  { path: '/celpip-vs-ielts',           priority: '0.85', changefreq: 'monthly' },
  { path: '/practice',                  priority: '0.85', changefreq: 'weekly' },
  { path: '/exam',                      priority: '0.9',  changefreq: 'weekly' },
  { path: '/scores',                    priority: '0.8',  changefreq: 'monthly' },
  { path: '/crs-score-calculator',      priority: '0.8',  changefreq: 'monthly' },
  { path: '/celpip-resources',          priority: '0.8',  changefreq: 'monthly' },
  { path: '/pricing',                   priority: '0.75', changefreq: 'monthly' },
  { path: '/blog',                      priority: '0.8',  changefreq: 'weekly' },
  { path: '/contact',                   priority: '0.5',  changefreq: 'monthly' },
  { path: '/privacy',                   priority: '0.3',  changefreq: 'yearly' },
  { path: '/terms',                     priority: '0.3',  changefreq: 'yearly' },
  { path: '/refund',                    priority: '0.3',  changefreq: 'yearly' },
]

async function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10)
  const urls = [
    ...STATIC_SITEMAP_ROUTES.map(r =>
      `  <url><loc>${PUBLIC_SITE_URL}${r.path}</loc><lastmod>${today}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`
    ),
    ...BLOG_ARTICLES.map(a =>
      `  <url><loc>${PUBLIC_SITE_URL}/blog/${a.slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.75</priority></url>`
    ),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  const sitemapPath = path.join(distDir, 'sitemap.xml')
  await writeFile(sitemapPath, xml, 'utf8')
  console.log(`Wrote sitemap.xml with ${STATIC_SITEMAP_ROUTES.length} static + ${BLOG_ARTICLES.length} blog URLs`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})