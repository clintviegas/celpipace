// One-time seed: copy BLOG_ARTICLES from src/data/blogData.js into the
// public.blog_posts table. Safe to re-run — uses upsert on slug.
//
// Usage: node scripts/seed-blog-posts.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { BLOG_ARTICLES } from '../src/data/blogData.js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const rows = BLOG_ARTICLES.map((a, i) => ({
  slug:             a.slug,
  title:            a.title,
  category:         a.category,
  tag:              a.tag || null,
  tag_color:        a.tagColor || null,
  tag_color_light:  a.tagColorLight || null,
  read_time:        a.readTime || null,
  date_label:       a.date || null,
  excerpt:          a.excerpt || null,
  sections:         a.sections || [],
  published:        true,
  sort_order:       BLOG_ARTICLES.length - i,
}))

const { data, error } = await supabase
  .from('blog_posts')
  .upsert(rows, { onConflict: 'slug' })
  .select('slug')

if (error) { console.error('Seed error:', error); process.exit(1) }
console.log(`Seeded ${data.length} blog posts.`)
