#!/usr/bin/env node
/**
 * Prüft lokale .env / .env.local auf Variablen für Stripe + Supabase (Server-APIs).
 * Keine Werte ausgeben – nur ja/nein. Optional: --strict → Exit 1 bei fehlenden Pflichtvariablen.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const strict = process.argv.includes('--strict')

function mergeEnvFiles() {
  const merged = { ...process.env }
  for (const name of ['.env.local', '.env']) {
    const p = path.join(root, name)
    if (!fs.existsSync(p)) continue
    const text = fs.readFileSync(p, 'utf8')
    for (const line of text.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq <= 0) continue
      const key = t.slice(0, eq).trim()
      let val = t.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (key) merged[key] = val
    }
  }
  return merged
}

const env = mergeEnvFiles()

const checks = [
  ['SUPABASE_URL', 'Supabase URL (Server, gleiche wie Projekt)'],
  ['SUPABASE_SERVICE_ROLE_KEY', 'Service Role Key (nur Server, nie im Frontend)'],
  ['STRIPE_SECRET_KEY', 'Stripe Secret (sk_test_… oder sk_live_…)'],
  ['STRIPE_WEBHOOK_SECRET', 'Webhook Signing Secret (whsec_…)'],
]

console.log('Stripe / Supabase – lokale Umgebung (ohne Werte)\n')
let missing = 0
for (const [key, label] of checks) {
  const v = (env[key] || '').trim()
  const ok = v.length > 0 && !v.startsWith('dein-') && v !== 'eyJ...'
  if (!ok) missing += 1
  console.log(`${ok ? '✅' : '❌'} ${key} – ${label}`)
}

const optional = [
  ['STRIPE_PROXY_GET_LICENCE_ORIGIN', 'Optional: Dev → Production-API für get-licence-by-session'],
  ['TENANT_DELETE_SECRET', 'Optional: Kündigung / Mandanten-Daten löschen (Webhook subscription.deleted)'],
]

console.log('\nOptional:\n')
for (const [key, label] of optional) {
  const v = (env[key] || '').trim()
  const ok = v.length > 0
  console.log(`${ok ? '✅' : '○ '} ${key} – ${label}`)
}

console.log('\n── Nächste Schritte (Production) ──')
console.log('1) Supabase SQL: siehe docs/STRIPE-ANBINDUNG-SCHRITT-FUER-SCHRITT.md')
console.log('2) Vercel → Environment Variables: dieselben Keys wie oben (Pflicht)')
console.log('3) Stripe → Webhooks: URL …/api/webhook-stripe, Events siehe Doku\n')

if (strict && missing > 0) {
  console.error(`Fehlend: ${missing} Pflichtvariable(n).`)
  process.exit(1)
}
