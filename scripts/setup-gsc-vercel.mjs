// Push GSC OAuth credentials to Vercel env (Production + Preview).
// Usage: node scripts/setup-gsc-vercel.mjs
//
// Reads .gsc-oauth-client.json + .gsc-token.json from repo root.
// Requires: vercel CLI logged in (`vercel whoami`).

import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function readJson(rel) {
  const p = path.join(ROOT, rel)
  if (!existsSync(p)) throw new Error(`Missing ${rel}`)
  return JSON.parse(readFileSync(p, 'utf8'))
}

function addEnv(name, value, envs = ['production']) {
  for (const env of envs) {
    const r = spawnSync('vercel', ['env', 'add', name, env, '--force'], {
      input: value,
      encoding: 'utf8',
      cwd: ROOT,
    })
    if (r.status !== 0) {
      console.error(`Failed ${name} (${env}):`, r.stderr || r.stdout)
      process.exit(1)
    }
    console.log(`  ✓ ${name} → ${env}`)
  }
}

const client = readJson('.gsc-oauth-client.json')
const { client_id, client_secret } = client.installed || client.web
const token = readJson('.gsc-token.json')

if (!client_id || !client_secret || !token.refresh_token) {
  console.error('OAuth client or refresh token incomplete.')
  console.error('Run: GSC_SITE=sc-domain:celpipace.ca npm run gsc:pull')
  process.exit(1)
}

console.log('Adding GSC env vars to Vercel...\n')
addEnv('GSC_SITE', 'sc-domain:celpipace.ca')
addEnv('GSC_CLIENT_ID', client_id)
addEnv('GSC_CLIENT_SECRET', client_secret)
addEnv('GSC_REFRESH_TOKEN', token.refresh_token)
addEnv('GSC_DAYS', '90')

console.log('\nDone. Redeploy production for /api/cron?job=gsc-summary to go live.')
console.log('Relay URL: GET https://www.celpipace.ca/api/cron?job=gsc-summary')
console.log('Header:    Authorization: Bearer <CRON_SECRET> (already in Vercel)')
