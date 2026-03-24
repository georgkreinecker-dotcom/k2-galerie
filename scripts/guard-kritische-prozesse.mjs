#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const PRODUCTION_BASE = 'https://k2-galerie.vercel.app'
const NO_CACHE_EXPECTED = 'no-cache'

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

async function checkIndexAndCacheHeaders() {
  const urls = ['/index.html', '/build-info.json', '/gallery-data.json', '/api/gallery-data']
  for (const path of urls) {
    const res = await fetch(`${PRODUCTION_BASE}${path}`, { cache: 'no-store' })
    if (!res.ok) {
      fail(`Header-Check ${path}`, `HTTP ${res.status}`)
      continue
    }
    const cacheControl = (res.headers.get('cache-control') || '').toLowerCase()
    if (!cacheControl.includes(NO_CACHE_EXPECTED) && !path.includes('gallery-data.json')) {
      fail(`Header-Check ${path}`, `cache-control ohne no-cache (${cacheControl || 'leer'})`)
      continue
    }
    if (path.includes('/gallery-data.json') && !cacheControl.includes('no-cache')) {
      fail(`Header-Check ${path}`, `cache-control ohne no-cache (${cacheControl || 'leer'})`)
      continue
    }
    ok(`Header-Check ${path}`, cacheControl || 'ok')
  }
}

async function checkGalleryDataApi() {
  const res = await fetch(`${PRODUCTION_BASE}/api/gallery-data`, { cache: 'no-store' })
  if (!res.ok) return fail('api/gallery-data erreichbar', `HTTP ${res.status}`)
  const data = await res.json()
  if (!data || typeof data !== 'object') {
    return fail('api/gallery-data Inhalt', 'ungültiges JSON')
  }
  const payloadString = JSON.stringify(data)
  if (payloadString.includes('blob:') || payloadString.includes('data:image/')) {
    return fail('api/gallery-data Bilddaten', 'enthaelt blob:/data:image (verboten im Server-Payload)')
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
  await checkIndexAndCacheHeaders()
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

