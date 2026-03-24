#!/usr/bin/env node
import { execSync } from 'node:child_process'

const PRODUCTION_BASE = 'https://k2-galerie.vercel.app'

function safeExec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (_) {
    return ''
  }
}

function normalizeRemoteUrl(url) {
  if (!url) return ''
  if (url.startsWith('git@github.com:')) return `https://github.com/${url.slice('git@github.com:'.length)}`
  return url
}

function parseGitHubRepo(remoteUrl) {
  const normalized = normalizeRemoteUrl(remoteUrl).replace(/\.git$/, '')
  const m = normalized.match(/github\.com\/([^/]+)\/([^/]+)$/i)
  if (!m) return ''
  return `${m[1]}/${m[2]}`
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return { ok: false, status: res.status, data: null, headers: res.headers }
  const data = await res.json()
  return { ok: true, status: res.status, data, headers: res.headers }
}

function ampel(ok) {
  return ok ? '🟢' : '🔴'
}

async function run() {
  console.log('🔎 Diagnose: GitHub + Vercel + Cache + API')

  const remoteUrl = safeExec('git remote get-url origin')
  const repo = parseGitHubRepo(remoteUrl)
  const localHead = safeExec('git rev-parse HEAD')
  const remoteHead = safeExec('git ls-remote origin -h refs/heads/main').split('\t')[0] || ''

  const sameGitHead = Boolean(localHead && remoteHead && localHead === remoteHead)
  console.log(`${ampel(sameGitHead)} Git local/main gleich: ${sameGitHead ? 'ja' : 'nein'}`)
  if (!sameGitHead) {
    console.log(`   lokal:  ${localHead || 'unbekannt'}`)
    console.log(`   remote: ${remoteHead || 'unbekannt'}`)
  }

  const buildInfo = await fetchJson(`${PRODUCTION_BASE}/build-info.json`)
  const buildInfoApi = await fetchJson(`${PRODUCTION_BASE}/api/build-info`)
  const galleryApi = await fetchJson(`${PRODUCTION_BASE}/api/gallery-data`)
  const indexHtml = await fetch(`${PRODUCTION_BASE}/index.html`, { cache: 'no-store' })
  const galleryJson = await fetch(`${PRODUCTION_BASE}/gallery-data.json`, { cache: 'no-store' })

  const cacheIndex = (indexHtml.headers.get('cache-control') || '').toLowerCase()
  const cacheGallery = (galleryJson.headers.get('cache-control') || '').toLowerCase()
  const cacheOk = cacheIndex.includes('no-cache') && cacheGallery.includes('no-cache')
  console.log(`${ampel(cacheOk)} Cache-Header kritisch ok: ${cacheOk ? 'ja' : 'nein'}`)
  if (!cacheOk) {
    console.log(`   /index.html cache-control: ${cacheIndex || 'leer'}`)
    console.log(`   /gallery-data.json cache-control: ${cacheGallery || 'leer'}`)
  }

  const apiOk = buildInfo.ok && buildInfoApi.ok && galleryApi.ok
  console.log(`${ampel(apiOk)} Kritische APIs erreichbar: ${apiOk ? 'ja' : 'nein'}`)
  if (!apiOk) {
    console.log(`   build-info.json: ${buildInfo.status}`)
    console.log(`   api/build-info: ${buildInfoApi.status}`)
    console.log(`   api/gallery-data: ${galleryApi.status}`)
  }

  const buildLabel = buildInfo.ok ? buildInfo.data?.label || '' : ''
  const buildTs = buildInfo.ok ? String(buildInfo.data?.timestamp || '') : ''
  console.log(`${ampel(Boolean(buildLabel))} Vercel Build-Info: ${buildLabel || 'nicht lesbar'}`)

  const payloadStr = galleryApi.ok ? JSON.stringify(galleryApi.data) : ''
  const payloadClean = !(payloadStr.includes('blob:') || payloadStr.includes('data:image/'))
  console.log(`${ampel(payloadClean)} Server-Payload sauber (kein blob:/base64): ${payloadClean ? 'ja' : 'nein'}`)

  const overallOk = sameGitHead && cacheOk && apiOk && Boolean(buildTs) && payloadClean
  console.log(`\n${ampel(overallOk)} Gesamtstatus: ${overallOk ? 'AKTUELL' : 'NICHT AKTUELL'}`)

  if (!overallOk) {
    console.log('\nHinweis: Mindestens ein Bereich ist rot. Mit dieser Diagnose siehst du sofort, wo.')
    process.exitCode = 1
  }

  if (repo) {
    console.log(`\nRepo: https://github.com/${repo}`)
  }
}

run().catch((err) => {
  console.error(`🔴 Diagnose fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})

