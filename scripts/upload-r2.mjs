#!/usr/bin/env node
/**
 * Upload audio/ and images/ from public/ to Cloudflare R2.
 *
 * Prerequisites:
 *   npm i -g wrangler          (or npx wrangler)
 *   wrangler login              (authenticate once)
 *   Create an R2 bucket in Cloudflare dashboard
 *
 * Usage:
 *   node scripts/upload-r2.mjs <BUCKET_NAME>
 *
 * Example:
 *   node scripts/upload-r2.mjs celpip-assets
 *
 * This uploads everything under public/audio/ and public/images/ to the
 * bucket, preserving the directory structure so paths like
 *   /audio/L1/set-01/line-00.mp3
 * stay the same relative to the bucket's public URL.
 *
 * After uploading:
 *   1. Enable public access on the R2 bucket (Settings → Public access)
 *      or attach a custom domain (e.g. assets.celpipace.com)
 *   2. Set VITE_CDN_URL in your Vercel environment variables to the
 *      public bucket URL (e.g. https://assets.celpipace.com)
 *   3. Optionally delete public/audio/ and public/images/ to keep the
 *      Vercel deploy under the 100 MB limit
 */

import { execSync } from 'child_process'
import { readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const BUCKET = process.argv[2]
if (!BUCKET) {
  console.error('Usage: node scripts/upload-r2.mjs <BUCKET_NAME>')
  process.exit(1)
}

const PUBLIC = join(process.cwd(), 'public')
const DIRS = ['audio', 'images']

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) files.push(...walk(full))
    else files.push(full)
  }
  return files
}

let uploaded = 0
let failed = 0

for (const folder of DIRS) {
  const root = join(PUBLIC, folder)
  try { statSync(root) } catch { console.log(`⏭  ${folder}/ not found, skipping`); continue }

  const files = walk(root)
  console.log(`\n📁 ${folder}/ — ${files.length} files`)

  for (const file of files) {
    const key = relative(PUBLIC, file) // e.g. audio/L1/set-01/line-00.mp3
    try {
      execSync(`npx wrangler r2 object put "${BUCKET}/${key}" --file="${file}"`, { stdio: 'pipe' })
      uploaded++
      if (uploaded % 50 === 0) process.stdout.write(`  ✓ ${uploaded} uploaded\n`)
    } catch (err) {
      console.error(`  ✗ Failed: ${key}`)
      failed++
    }
  }
}

console.log(`\n✅ Done — ${uploaded} uploaded, ${failed} failed`)
if (failed === 0) {
  console.log(`\nNext steps:`)
  console.log(`  1. Enable public access on "${BUCKET}" in Cloudflare dashboard`)
  console.log(`  2. Set VITE_CDN_URL=https://<your-public-url> in Vercel env vars`)
  console.log(`  3. Remove public/audio/ and public/images/ to slim the deploy`)
}
