#!/usr/bin/env node
// scripts/backfill-brevo.mjs
// One-time backfill: push all consented Supabase users into Brevo CRM.
//
// Run once from the project root:
//   node scripts/backfill-brevo.mjs
//
// Reads from .env (or environment). Requires:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   BREVO_API_KEY, BREVO_LIST_ID
//
// Dry-run mode (no changes to Brevo, just logs what would be synced):
//   DRY_RUN=1 node scripts/backfill-brevo.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env manually (no dotenv dep required)
try {
  const env = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
} catch { /* .env optional */ }

const SUPABASE_URL     = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY
const BREVO_API_KEY    = process.env.BREVO_API_KEY
const BREVO_LIST_ID    = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : null
const DRY_RUN          = process.env.DRY_RUN === '1'
const BATCH_SIZE       = 50   // rows per Supabase page
const BREVO_DELAY_MS   = 150  // stay under Brevo rate limit (~7 req/s)

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  process.exit(1)
}
if (!BREVO_API_KEY) {
  console.error('❌  BREVO_API_KEY is required.')
  process.exit(1)
}
if (!BREVO_LIST_ID) {
  console.error('❌  BREVO_LIST_ID is required (numeric list ID from Brevo).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function brevoUpsert(contact) {
  if (DRY_RUN) {
    console.log('  [dry-run] would upsert:', contact.email)
    return
  }
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email: contact.email,
      updateEnabled: true,
      emailBlacklisted: false,
      attributes: {
        ...(contact.firstName ? { FIRSTNAME: contact.firstName } : {}),
        ...(contact.lastName  ? { LASTNAME:  contact.lastName  } : {}),
      },
      listIds: [BREVO_LIST_ID],
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log(`\n🔄  Brevo backfill ${DRY_RUN ? '(DRY RUN) ' : ''}— list ${BREVO_LIST_ID}`)
  console.log(`    Fetching consented profiles from Supabase...\n`)

  let offset = 0
  let total = 0
  let synced = 0
  let failed = 0

  while (true) {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, marketing_consent, marketing_unsubscribed_at, loops_synced_at')
      .eq('marketing_consent', true)
      .is('marketing_unsubscribed_at', null)
      .not('email', 'is', null)
      .range(offset, offset + BATCH_SIZE - 1)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase error:', error.message)
      process.exit(1)
    }
    if (!profiles?.length) break

    total += profiles.length
    console.log(`  Batch ${Math.floor(offset / BATCH_SIZE) + 1}: ${profiles.length} profiles`)

    for (const profile of profiles) {
      const [firstName, ...lastParts] = String(profile.full_name || '').trim().split(/\s+/)
      const lastName = lastParts.join(' ')
      try {
        await brevoUpsert({ email: profile.email, firstName, lastName })
        synced++
        process.stdout.write(`    ✓ ${profile.email}\n`)
      } catch (err) {
        failed++
        console.error(`    ✗ ${profile.email}: ${err.message}`)
      }
      await sleep(BREVO_DELAY_MS)
    }

    if (profiles.length < BATCH_SIZE) break
    offset += BATCH_SIZE
  }

  console.log(`\n✅  Done. ${total} profiles found, ${synced} synced, ${failed} failed.`)
  if (DRY_RUN) console.log('    (Dry run — no changes made to Brevo)')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
