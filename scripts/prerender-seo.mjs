import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BLOG_ARTICLES } from '../src/data/blogData.js'
import { BRAND_NAME, PRODUCT_STATS, PUBLIC_SITE_URL } from '../src/data/constants.js'
import { LANDING_PAGES, faqJsonLd, softwareJsonLd } from '../src/data/seoPages.js'

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
    </main>`
}

function renderHomePage() {
  return `    <main class="seo-page prerender-page">
      <section class="seo-hero">
        <div class="seo-hero-copy">
          <p class="seo-eyebrow">CELPIP practice with AI scoring</p>
          <h1>CELPIP Practice Tests With AI Scoring</h1>
          <p class="seo-subhead">Prepare with ${PRODUCT_STATS.questionItems} CELPIP-style question items, ${PRODUCT_STATS.mockExams} full mock exams, writing and speaking AI feedback, and saved CLB reports.</p>
          <div class="seo-actions">
            <a class="seo-primary" href="/exam">Start Free Diagnostic</a>
            <a class="seo-secondary" href="/celpip-mock-test">See Mock Tests</a>
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
          <article class="seo-card"><h3>Listening</h3><p>${PRODUCT_STATS.listeningSets} listening sets with Canadian English practice.</p></article>
          <article class="seo-card"><h3>Reading</h3><p>${PRODUCT_STATS.readingSets} reading sets across correspondence, diagrams, information, and viewpoints.</p></article>
          <article class="seo-card"><h3>Writing</h3><p>${PRODUCT_STATS.writingSets} prompts for email and survey response practice.</p></article>
          <article class="seo-card"><h3>Speaking</h3><p>${PRODUCT_STATS.speakingPrompts} prompts covering all 8 CELPIP Speaking tasks.</p></article>
        </div>
      </section>
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

function renderBlogArticle(article) {
  return `    <main class="seo-page prerender-page">
      <article class="seo-section seo-faq-section">
        <p class="seo-section-label">${escapeHtml(article.tag)} · ${escapeHtml(article.readTime)}</p>
        <h1>${escapeHtml(article.title)}</h1>
        <p class="seo-subhead">${escapeHtml(article.excerpt)}</p>
        <div class="seo-faq-list">
          ${article.sections.map(section => `<section class="seo-faq-item"><h2>${escapeHtml(section.heading)}</h2><p>${escapeHtml(section.body)}</p>${section.list ? renderList(section.list) : ''}${section.body2 ? `<p>${escapeHtml(section.body2)}</p>` : ''}</section>`).join('\n          ')}
        </div>
      </article>
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
      canonical: '/celpip-listening-practice',
      title: 'CELPIP Listening Practice — All 6 Parts With Canadian English Audio',
      heading: 'CELPIP Listening Practice for All 6 Parts',
      eyebrow: 'CELPIP Listening practice',
      description: `CELPIP Listening practice for all 6 parts: Problem Solving, Daily Life, Information, News Item, Discussion, and Viewpoints. ${PRODUCT_STATS.listeningSets} sets with Canadian English audio.`,
      proof: [`${PRODUCT_STATS.listeningSets} listening sets`, 'Canadian English audio', 'All 6 CELPIP Listening parts', 'CLB 4-12 score tracking'],
      primaryCta: 'Practice CELPIP Listening',
    },
    {
      canonical: '/celpip-reading-practice',
      title: 'CELPIP Reading Practice — Correspondence, Diagrams, Information & Viewpoints',
      heading: 'CELPIP Reading Practice for All 4 Parts',
      eyebrow: 'CELPIP Reading practice',
      description: `CELPIP Reading practice across correspondence, apply-a-diagram, information, and viewpoints. ${PRODUCT_STATS.readingSets} sets with explanations and inference tips.`,
      proof: [`${PRODUCT_STATS.readingSets} reading sets`, 'R1 to R4 coverage', 'Explanations & inference tips', 'CLB 4-12 score tracking'],
      primaryCta: 'Practice CELPIP Reading',
    },
    {
      canonical: '/celpip-writing-practice',
      title: 'CELPIP Writing Practice With AI Scoring — Task 1 & Task 2',
      heading: 'CELPIP Writing Practice With AI CLB Scoring',
      eyebrow: 'CELPIP Writing practice',
      description: `CELPIP Writing practice for Task 1 (email) and Task 2 (survey response) with AI CLB scoring, word-count tools, and structure tips. ${PRODUCT_STATS.writingSets} prompts.`,
      proof: [`${PRODUCT_STATS.writingSets} writing prompts`, 'Task 1 email practice', 'Task 2 survey practice', 'AI CLB feedback'],
      primaryCta: 'Practice CELPIP Writing',
    },
    {
      canonical: '/celpip-speaking-practice',
      title: 'CELPIP Speaking Practice for All 8 Tasks With AI Feedback',
      heading: 'CELPIP Speaking Practice for All 8 Tasks',
      eyebrow: 'CELPIP Speaking practice',
      description: `CELPIP Speaking practice for all 8 tasks with timed prompts, recordings, and AI feedback for fluency, vocabulary, and task fulfillment. ${PRODUCT_STATS.speakingPrompts} prompts.`,
      proof: [`${PRODUCT_STATS.speakingPrompts} speaking prompts`, 'All 8 CELPIP Speaking tasks', 'Timed prep & recording', 'AI feedback'],
      primaryCta: 'Practice CELPIP Speaking',
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
        title: 'CELPIP Practice Tests With AI Scoring & Mock Exams',
        description: `Prepare for CELPIP with ${PRODUCT_STATS.questionItems} question items, ${PRODUCT_STATS.mockExams} full mock exams, AI writing and speaking feedback, and saved CLB score reports.`,
        canonical: '/',
        jsonLd: [{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: BRAND_NAME,
          url: PUBLIC_SITE_URL,
        }],
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
        jsonLd: articleJsonLd(article),
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
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})