// Update only the SEO-critical blog posts (title + excerpt + sections) in Supabase.
// Usage: node scripts/sync-seo-blog-titles.mjs

import { readFileSync } from 'node:fs'
import { BLOG_ARTICLES } from '../src/data/blogData.js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const SLUGS = [
  'celpip-score-required-express-entry-pr',
  'is-celpip-harder-than-ielts',
  'celpip-test-format-complete-guide',
  'how-to-practice-for-celpip',
  'is-celpip-7-a-good-score',
]

const url = env.VITE_SUPABASE_URL
const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const articles = BLOG_ARTICLES.filter(a => SLUGS.includes(a.slug))
console.log(`Updating ${articles.length} blog posts in Supabase...`)

for (const a of articles) {
  const res = await fetch(`${url}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(a.slug)}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      title: a.title,
      excerpt: a.excerpt,
      sections: a.sections,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    console.error(`  FAIL ${a.slug}: ${res.status} ${text}`)
    process.exit(1)
  }
  console.log(`  OK ${a.slug}`)
}

console.log('Done.')
