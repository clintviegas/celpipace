// Shared env loader for Node scripts — reads .env then .env.local (local wins).
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function stripEnvValue(value) {
  const v = String(value || '').trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1)
  }
  return v
}

export function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  return Object.fromEntries(
    readFileSync(filePath, 'utf8')
      .split('\n')
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => {
        const i = l.indexOf('=')
        return [l.slice(0, i).trim(), stripEnvValue(l.slice(i + 1))]
      }),
  )
}

/** Merged env from .env + .env.local + process.env (process wins). */
export function loadEnv() {
  return {
    ...loadEnvFile(path.join(ROOT, '.env')),
    ...loadEnvFile(path.join(ROOT, '.env.local')),
    ...process.env,
  }
}

export { ROOT }
