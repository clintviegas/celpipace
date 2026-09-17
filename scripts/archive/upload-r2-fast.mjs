#!/usr/bin/env node
/**
 * Fast parallel upload of audio/ and images/ to Cloudflare R2.
 * Uses wrangler with concurrent child processes for speed.
 *
 * Usage: node scripts/upload-r2-fast.mjs celpipace
 */

import { exec } from 'child_process'
import { readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const BUCKET = process.argv[2]
if (!BUCKET) { console.error('Usage: node scripts/upload-r2-fast.mjs <BUCKET_NAME>'); process.exit(1) }

const CONCURRENCY = 15 // parallel uploads
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

function uploadFile(file) {
  const key = relative(PUBLIC, file)
  return new Promise((resolve) => {
    exec(`wrangler r2 object put "${BUCKET}/${key}" --file="${file}" --remote`, { timeout: 30000 }, (err) => {
      resolve(err ? { key, ok: false } : { key, ok: true })
    })
  })
}

async function uploadAll(files) {
  let uploaded = 0, failed = 0
  const total = files.length

  for (let i = 0; i < total; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY)
    const results = await Promise.all(batch.map(uploadFile))
    for (const r of results) {
      if (r.ok) uploaded++
      else { failed++; console.error(`  ✗ ${r.key}`) }
    }
    const pct = Math.round(((i + batch.length) / total) * 100)
    process.stdout.write(`\r  ✓ ${uploaded}/${total} (${pct}%)`)
  }
  console.log('')
  return { uploaded, failed }
}

let totalUp = 0, totalFail = 0
for (const folder of DIRS) {
  const root = join(PUBLIC, folder)
  try { statSync(root) } catch { console.log(`⏭  ${folder}/ not found, skipping`); continue }
  const files = walk(root)
  console.log(`\n📁 ${folder}/ — ${files.length} files`)
  const { uploaded, failed } = await uploadAll(files)
  totalUp += uploaded; totalFail += failed
}

console.log(`\n✅ Done — ${totalUp} uploaded, ${totalFail} failed`)
if (totalFail === 0) {
  console.log(`\nNext steps:`)
  console.log(`  1. Enable public access on "${BUCKET}" in Cloudflare dashboard`)
  console.log(`  2. Set VITE_CDN_URL=https://<your-public-url> in Vercel env vars`)
  console.log(`  3. Remove public/audio/ and public/images/ to slim the deploy`)
}
