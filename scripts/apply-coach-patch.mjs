#!/usr/bin/env node
/**
 * Apply supabase/patch_coach_weakness.sql to production Postgres.
 *
 * Requires SUPABASE_DB_URL (direct Postgres connection string from
 * Supabase → Project Settings → Database → Connection string → URI).
 *
 * Usage:
 *   SUPABASE_DB_URL=postgresql://... node scripts/apply-coach-patch.mjs
 *
 * If SUPABASE_DB_URL is not set, verifies whether the RPC already exists
 * via the service-role client and prints manual SQL Editor instructions.
 */

import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { loadEnv, ROOT } from './load-env.mjs'

const env = loadEnv()
const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL

const PATCH_FILE = path.join(ROOT, 'supabase/patch_coach_weakness.sql')

async function verifyRpc() {
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — cannot verify RPC.')
    return null
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const probeId = '00000000-0000-0000-0000-000000000001'
  const { error } = await supabase.rpc('get_user_weakness_profile', {
    p_user_id: probeId,
    p_section: 'writing',
    p_window: 1,
  })
  if (!error) return true
  if (error.message?.includes('does not exist')) return false
  // Other errors (e.g. permission) still mean the function exists.
  return true
}

function applyViaPsql() {
  const sql = readFileSync(PATCH_FILE, 'utf8')
  execSync(`psql "${dbUrl}" -v ON_ERROR_STOP=1`, {
    input: sql,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
}

async function main() {
  console.log('CELPIPACE — apply coach weakness RPC patch\n')

  const before = await verifyRpc()
  if (before === true) {
    console.log('✓ get_user_weakness_profile already exists — nothing to do.')
    return
  }

  if (dbUrl) {
    console.log('Applying patch via psql…')
    applyViaPsql()
    const after = await verifyRpc()
    if (after) {
      console.log('✓ Patch applied successfully.')
      return
    }
    console.error('Patch ran but RPC verification still failed — check Supabase logs.')
    process.exit(1)
  }

  console.log('SUPABASE_DB_URL not set — cannot apply SQL automatically.\n')
  console.log('Run this file once in Supabase SQL Editor:')
  console.log(`  ${PATCH_FILE}\n`)
  console.log('Or set SUPABASE_DB_URL and re-run this script.')
  process.exit(before === false ? 1 : 0)
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
