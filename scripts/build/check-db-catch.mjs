#!/usr/bin/env node
// scripts/check-db-catch.mjs
//
// Fails the build if `.catch()` is called on a Supabase PostgREST query builder.
//
// A builder is a thenable, not a Promise: it implements `then()` but NOT
// `catch()`. So `await supabase.from('t').update({...}).eq('id', 1).catch(fn)`
// throws `TypeError: ... .catch is not a function` at the call site — it does
// not swallow anything. Use tryDb() from api/_lib/db.js on the server, or await
// the builder and check `error` on the client.
//
// HISTORY — why this scanner is written the way it is:
//   v1 matched a regex against a 5-line sliding window. That caught 19 of 20
//   real cases and missed the one in AuthContext.jsx where the .update({...})
//   object literal spanned six lines, putting the chain root outside the
//   window. That miss reached production and Sentry caught it as an unhandled
//   rejection. A fixed line window is simply the wrong tool: a chain can span
//   any number of lines.
//
// This version instead finds each `.from(` / `.rpc(` and walks forward through
// the balanced member-call chain, so span length is irrelevant. Strings,
// template literals, and comments are skipped so their contents never affect
// paren balance.
//
// Run: node scripts/check-db-catch.mjs

import { readFileSync, globSync } from 'node:fs'

const ROOTS = ['api', 'src', 'scripts']
const SELF = 'scripts/build/check-db-catch.mjs'
const HELPER = 'api/_lib/db.js'

/** Advance past a string, template literal, or comment starting at i. Returns the index after it, or -1. */
function skipLiteral(src, i) {
  const c = src[i]
  if (c === '"' || c === "'" || c === '`') {
    for (let j = i + 1; j < src.length; j++) {
      if (src[j] === '\\') { j++; continue }
      if (src[j] === c) return j + 1
      // Template substitution can contain arbitrary code including parens;
      // skipping the whole literal is fine for our purposes.
    }
    return src.length
  }
  if (c === '/' && src[i + 1] === '/') {
    const nl = src.indexOf('\n', i)
    return nl === -1 ? src.length : nl
  }
  if (c === '/' && src[i + 1] === '*') {
    const end = src.indexOf('*/', i + 2)
    return end === -1 ? src.length : end + 2
  }
  return -1
}

/** Index just past the ')' matching the '(' at openIdx, or -1. */
function matchParen(src, openIdx) {
  let depth = 0
  for (let i = openIdx; i < src.length; i++) {
    const skipped = skipLiteral(src, i)
    if (skipped !== -1) { i = skipped - 1; continue }
    const c = src[i]
    if (c === '(') depth++
    else if (c === ')') { depth--; if (depth === 0) return i + 1 }
  }
  return -1
}

function skipTrivia(src, i) {
  while (i < src.length) {
    if (/\s/.test(src[i])) { i++; continue }
    const skipped = skipLiteral(src, i)
    // Only comments count as trivia here — a string means the chain ended.
    if (skipped !== -1 && src[i] === '/') { i = skipped; continue }
    break
  }
  return i
}

/**
 * From the '(' of a .from(/.rpc( call, walk the chained .foo(...) calls.
 * Returns the index of the `.catch` token if the chain reaches one, else -1.
 */
function findCatchInChain(src, openIdx) {
  let i = matchParen(src, openIdx)
  if (i === -1) return -1

  for (;;) {
    const dot = skipTrivia(src, i)
    if (src[dot] !== '.') return -1

    let j = skipTrivia(src, dot + 1)
    let name = ''
    while (j < src.length && /[\w$]/.test(src[j])) name += src[j++]
    if (!name) return -1

    j = skipTrivia(src, j)
    if (src[j] !== '(') return -1          // property access, not a call — chain ends

    const close = matchParen(src, j)
    if (close === -1) return -1
    if (name === 'catch') return dot
    i = close
  }
}

const files = ROOTS.flatMap(root => {
  try {
    return globSync(`${root}/**/*.{js,jsx,mjs}`)
  } catch { return [] }
})

const violations = []
const ROOT_CALL = /\.(from|rpc)\s*\(/g

for (const file of files) {
  if (file.endsWith(SELF) || file.endsWith(HELPER)) continue
  const src = readFileSync(file, 'utf8')
  if (!src.includes('.catch')) continue

  ROOT_CALL.lastIndex = 0
  let m
  while ((m = ROOT_CALL.exec(src)) !== null) {
    const openIdx = src.indexOf('(', m.index)
    const catchIdx = findCatchInChain(src, openIdx)
    if (catchIdx === -1) continue
    const line = src.slice(0, catchIdx).split('\n').length
    violations.push({
      file,
      line,
      root: `.${m[1]}(` ,
      text: src.split('\n')[line - 1].trim(),
    })
  }
}

if (violations.length) {
  console.error('\n\x1b[31m✖ .catch() called on a Supabase query builder\x1b[0m')
  console.error('  Builders implement then() but not catch() — this throws a TypeError')
  console.error('  at the call site instead of handling the error.')
  console.error('  Server: use tryDb(builder, label) from api/_lib/db.js.')
  console.error('  Client: await the builder and check `error`.\n')
  for (const v of violations) {
    console.error(`  \x1b[33m${v.file}:${v.line}\x1b[0m  (chain rooted at ${v.root})`)
    console.error(`    ${v.text}`)
  }
  console.error(`\n  ${violations.length} violation(s)\n`)
  process.exit(1)
}

console.log(`✓ no .catch() on query builders (${files.length} files scanned)`)
