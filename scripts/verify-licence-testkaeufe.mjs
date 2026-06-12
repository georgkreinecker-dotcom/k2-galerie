#!/usr/bin/env node
/**
 * Prüft nach Testkäufen: Supabase licences via GET /api/licence-data (Production).
 * Erwartung: mindestens eine Galerie-Lizenz (basic/pro/vk2) und eine K2-Familie-Lizenz.
 */
import { getStripeWebhookUrlProduction, STRIPE_API_PATHS } from '../api/stripeLicenceChainConstants.js'

const ORIGIN = process.env.LICENCE_DATA_ORIGIN || 'https://k2-galerie.vercel.app'
const GALERIE_TYPES = new Set(['basic', 'pro', 'vk2', 'proplus', 'propplus', 'excellent'])
const FAMILIE_TYPES = new Set(['familie_monat', 'familie_jahr'])

async function main() {
  const url = `${ORIGIN.replace(/\/$/, '')}${STRIPE_API_PATHS.licenceData}`
  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  const licences = Array.isArray(data?.licences) ? data.licences : []

  const galerie = licences.filter((l) => GALERIE_TYPES.has(String(l.licence_type || '').trim()))
  const familie = licences.filter((l) => FAMILIE_TYPES.has(String(l.licence_type || '').trim()))

  console.log('── Lizenz-Testkäufe (Supabase) ──')
  console.log('Quelle:', url)
  console.log('Webhook (Production):', getStripeWebhookUrlProduction())
  console.log('Supabase konfiguriert:', data?.stripe_chain?.supabase_configured ? 'ja' : 'nein')
  console.log('Gesamt Lizenzen:', licences.length)
  console.log('Galerie (ök2/K2):', galerie.length)
  console.log('K2 Familie:', familie.length)

  if (licences.length > 0) {
    console.log('\nLetzte Einträge:')
    for (const l of licences.slice(0, 5)) {
      console.log(
        `  · ${l.name || l.email} | ${l.licence_type} | tenant=${l.tenant_id || '–'} | ${String(l.created_at || '').slice(0, 10)}`,
      )
    }
  } else if (data?.stripe_chain?.empty_online_hint) {
    console.log('\nHinweis:', data.stripe_chain.empty_online_hint)
  }
  if (data?.error) console.log('\nAPI-Fehler:', data.error)

  const ok = galerie.length >= 1 && familie.length >= 1
  console.log(ok ? '\n✅ Beide Testkäufe sichtbar – Mission Control kann geprüft werden.' : '\n⏳ Noch nicht beide Käufe in Supabase.')
  process.exit(ok ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
