#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const PRODUCTION_BASE = 'https://k2-galerie.vercel.app'

function ok(label, details = '') {
  console.log(`✅ ${label}${details ? `: ${details}` : ''}`)
}

function fail(label, details = '') {
  console.error(`❌ ${label}${details ? `: ${details}` : ''}`)
  process.exitCode = 1
}

async function checkBuildInfo() {
  const res = await fetch(`${PRODUCTION_BASE}/build-info.json`, { cache: 'no-store' })
  if (!res.ok) return fail('build-info.json erreichbar', `HTTP ${res.status}`)
  const data = await res.json()
  if (!data?.timestamp || !data?.label) {
    return fail('build-info.json Inhalt', 'timestamp/label fehlt')
  }
  ok('build-info.json', `${data.label}`)
}

async function checkGalleryDataApi() {
  const res = await fetch(`${PRODUCTION_BASE}/api/gallery-data`, { cache: 'no-store' })
  if (!res.ok) return fail('api/gallery-data erreichbar', `HTTP ${res.status}`)
  const data = await res.json()
  if (!data || typeof data !== 'object') {
    return fail('api/gallery-data Inhalt', 'ungültiges JSON')
  }
  ok('api/gallery-data', 'antwortet mit JSON')
}

async function checkBlobFunctionAlive() {
  const res = await fetch(`${PRODUCTION_BASE}/api/blob-handle-virtual-tour`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'invalid-event-for-healthcheck' }),
    cache: 'no-store'
  })

  // Erwartung: Endpoint ist aktiv und antwortet mit kontrolliertem Fehler, aber nicht 404/500.
  if (res.status === 404 || res.status >= 500) {
    return fail('blob-handle-virtual-tour aktiv', `HTTP ${res.status}`)
  }
  ok('blob-handle-virtual-tour aktiv', `HTTP ${res.status}`)
}

function checkVercelConfigShape() {
  const raw = readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')
  const json = JSON.parse(raw)
  const functions = json?.functions ?? {}
  for (const [name, config] of Object.entries(functions)) {
    if (config && typeof config === 'object' && 'includeFiles' in config) {
      if (typeof config.includeFiles !== 'string') {
        return fail(`vercel.json functions.${name}.includeFiles`, 'muss string sein')
      }
    }
  }
  ok('vercel.json Schema', 'includeFiles ist string')
}

async function run() {
  console.log('🔒 Kritische Prozess-Schranken (Live-Check)')
  checkVercelConfigShape()
  await checkBuildInfo()
  await checkGalleryDataApi()
  await checkBlobFunctionAlive()

  if (process.exitCode && process.exitCode !== 0) {
    console.error('\n❌ Mindestens eine Schranke ist rot.')
    process.exit(process.exitCode)
  }
  console.log('\n✅ Alle Schranken grün.')
}

run().catch((err) => {
  fail('Guard-Skript', err instanceof Error ? err.message : String(err))
})

