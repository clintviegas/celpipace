// One-time seed: copy BLOG_ARTICLES from src/data/blogData.js into the
// public.blog_posts table. Safe to re-run — uses upsert on slug.
//
// Usage: node scripts/seed-blog-posts.mjs
//
// Requires VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local or .env
// (run `vercel env pull .env.local` once if you don't have a local env file).

import { createClient } from '@supabase/supabase-js'
import { BLOG_ARTICLES } from '../src/data/blogData.js'
import { loadEnv } from './load-env.mjs'

const env = loadEnv()

const supabaseUrl = env.VITE_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
    'Run: vercel env pull .env.local',
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

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
