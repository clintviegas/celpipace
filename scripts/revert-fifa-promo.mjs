#!/usr/bin/env node
/**
 * Revert FIFA World Cup S3/S4 Set 1 promo → original park scene.
 *
 * Run when the promo ends. See docs/SPEAKING_FIFA_REVERT.md and docs/R2_ASSET_RUNBOOK.md.
 *
 * Steps:
 *   1. Restore park PNGs from backup branch to public/images/S3/1.png and S4/1.png
 *   2. Upload both to R2 bucket celpipace
 *   3. Restore speakingQuestions.json from backup/s3-set1-park
 *
 * Usage:
 *   node scripts/revert-fifa-promo.mjs [--skip-r2] [--skip-git]
 *
 * --skip-r2   Skip wrangler upload (if you already uploaded park PNGs)
 * --skip-git  Skip git checkout of JSON (dry-run local file restore only)
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, copyFileSync } from 'node:fs'
import path from 'node:path'
import { ROOT } from './load-env.mjs'

const BUCKET = 'celpipace'
const args = new Set(process.argv.slice(2))
const skipR2 = args.has('--skip-r2')
const skipGit = args.has('--skip-git')

const JSON_PATH = path.join(ROOT, 'src/data/speakingQuestions.json')
const S3_IMG = path.join(ROOT, 'public/images/S3/1.png')
const S4_IMG = path.join(ROOT, 'public/images/S4/1.png')

function run(cmd, opts = {}) {
  console.log(`→ ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts })
}

function ensureParkImagesFromGit() {
  // Stash current images if any, checkout park versions from backup branch
  run(`git show backup/s3-set1-park:public/images/S3/1.png > "${S3_IMG}"`, { shell: true })
  mkdirSync(path.dirname(S4_IMG), { recursive: true })
  run(`git show backup/s3-set1-park:public/images/S4/1.png > "${S4_IMG}"`, { shell: true })
}

function main() {
  console.log('CELPIPACE — revert FIFA S3/S4 Set 1 promo\n')

  if (!skipGit) {
    console.log('Restoring speakingQuestions.json from backup/s3-set1-park…')
    run('git fetch origin backup/s3-set1-park 2>/dev/null || true')
    run(`git checkout backup/s3-set1-park -- src/data/speakingQuestions.json`)
  }

  console.log('Restoring park PNGs from backup branch…')
  mkdirSync(path.dirname(S3_IMG), { recursive: true })
  try {
    ensureParkImagesFromGit()
  } catch (err) {
    console.error('\nCould not restore PNGs from backup/s3-set1-park.')
    console.error('Ensure park PNGs exist locally at public/images/S3/1.png and S4/1.png, then re-run with --skip-git')
    process.exit(1)
  }

  if (!skipR2) {
    if (!existsSync(S3_IMG) || !existsSync(S4_IMG)) {
      console.error('Missing local park PNGs — cannot upload to R2.')
      process.exit(1)
    }
    console.log('Uploading park images to R2…')
    run(`npx wrangler r2 object put "${BUCKET}/images/S3/1.png" --file="${S3_IMG}" --remote`)
    run(`npx wrangler r2 object put "${BUCKET}/images/S4/1.png" --file="${S4_IMG}" --remote`)
  }

  console.log('\n✓ Revert steps complete.')
  console.log('Next: commit JSON change, deploy to Vercel, request GSC indexing for /celpip-speaking-practice/S3')
  console.log('See docs/GSC_INDEXING_CHECKLIST.md')
}

main()
