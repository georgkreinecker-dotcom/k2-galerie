#!/usr/bin/env node
/**
 * Schreibt vor dem Build die aktuelle Build-Zeit in src/buildInfo.generated.ts.
 * Zeit in österreichischer Ortszeit (Europe/Vienna), damit Stand = lokale Uhrzeit.
 */
const fs = require('fs')
const path = require('path')
const now = new Date()
const fmt = new Intl.DateTimeFormat('de-AT', {
  timeZone: 'Europe/Vienna',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})
const parts = Object.fromEntries(fmt.formatToParts(now).filter(p => p.type !== 'literal').map(p => [p.type, p.value]))
const yy = String(parts.year).slice(-2)
const label = `${parts.day}.${parts.month}.${yy} ${parts.hour}:${parts.minute}`
const outPath = path.join(__dirname, '..', 'src', 'buildInfo.generated.ts')
const content = `// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '${label}'
export const BUILD_TIMESTAMP = ${now.getTime()}

/** QR-URL mit Stand (Cache-Busting) – Scan liefert immer aktuellen Build */
export function urlWithBuildVersion(url: string): string {
  const sep = url.includes('?') ? '&' : '?'
  return \`\${url}\${sep}v=\${BUILD_TIMESTAMP}\`
}
`
// Nur schreiben wenn sich die Build-MINUTE (label) geändert hat – verhindert Reopen bei jedem dev-Start
let tsChanged = true
try {
  const existing = fs.readFileSync(outPath, 'utf8')
  if (existing === content) tsChanged = false
  else if (existing.includes("BUILD_LABEL = '" + label + "'")) tsChanged = false
} catch (_) {}
if (tsChanged) fs.writeFileSync(outPath, content, 'utf8')

// build-info.json: nur schreiben wenn Label (Minute) geändert – gleiche Minute = kein Schreiben
const publicPath = path.join(__dirname, '..', 'public', 'build-info.json')
const jsonContent = JSON.stringify({ label, timestamp: now.getTime() })
let jsonChanged = true
try {
  const existingJson = fs.readFileSync(publicPath, 'utf8')
  if (existingJson === jsonContent) jsonChanged = false
  else {
    const parsed = JSON.parse(existingJson)
    if (parsed && parsed.label === label) jsonChanged = false
  }
} catch (_) {}
if (jsonChanged) fs.writeFileSync(publicPath, jsonContent, 'utf8')

// api/build-info-payload.json: von visit-and-build.js gelesen (Vercel Hobby max. 12 Functions)
const apiPayloadPath = path.join(__dirname, '..', 'api', 'build-info-payload.json')
const apiPayloadContent = JSON.stringify({ label, timestamp: now.getTime() })
let apiChanged = false
try {
  const existingPayload = fs.readFileSync(apiPayloadPath, 'utf8')
  const existingParsed = JSON.parse(existingPayload)
  if (existingParsed && existingParsed.label === label) apiChanged = false
  else { fs.writeFileSync(apiPayloadPath, apiPayloadContent, 'utf8'); apiChanged = true }
} catch (_) {
  fs.writeFileSync(apiPayloadPath, apiPayloadContent, 'utf8')
  apiChanged = true
}

// public/boot/boot-build-info.js: gleiche Logik wie früher Inline-Script in index.html (Stand / QR / Cache-Bust).
// Nur schreiben wenn sich die Build-MINUTE geändert hat → weniger Reopen / weniger Git-Churn.
let bootBuildInfoChanged = false
{
  const ts = now.getTime()
  const bootBody =
    '(function(){if(window.self!==window.top)return;var o=location.origin;if(o.indexOf("localhost")!==-1)return;var b=' +
    ts +
    ';var p=location.pathname;var bust=function(){var q=location.search?location.search.slice(1):"";var params=new URLSearchParams(q);params.set("v",Date.now());params.set("_",Date.now());location.replace(o+p+"?"+params.toString());};var mark=function(k){try{sessionStorage.setItem(k,String(b));}catch(e){}};var can=function(k){try{return sessionStorage.getItem(k)!==String(b);}catch(e){return true;}};if(Date.now()-b>120000){if(can("k2_stale_reload_ts")){mark("k2_stale_reload_ts");bust();}return;}var url=o+"/api/build-info?t="+Date.now()+"&r="+Math.random();fetch(url,{cache:"no-store",headers:{"Pragma":"no-cache","Cache-Control":"no-cache"}}).then(function(r){return r.ok?r.json():null}).then(function(d){if(d&&d.timestamp>b){if(can("k2_updated_ts")){mark("k2_updated_ts");bust();}}}).catch(function(){if(can("k2_updated_ts")){mark("k2_updated_ts");bust();}});})();\n'
  const bootDir = path.join(__dirname, '..', 'public', 'boot')
  const bootPath = path.join(bootDir, 'boot-build-info.js')
  let sameMinute = false
  try {
    const prev = fs.readFileSync(bootPath, 'utf8')
    const oldB = prev.match(/var b=(\d+)/)
    if (oldB && oldB[1]) {
      const oldDate = new Date(parseInt(oldB[1], 10))
      const oldParts = Object.fromEntries(fmt.formatToParts(oldDate).filter(p => p.type !== 'literal').map(p => [p.type, p.value]))
      const oldLabel = `${oldParts.day}.${oldParts.month}.${String(oldParts.year).slice(-2)} ${oldParts.hour}:${oldParts.minute}`
      if (oldLabel === label) sameMinute = true
    }
  } catch (_) {}
  if (!sameMinute) {
    fs.mkdirSync(bootDir, { recursive: true })
    fs.writeFileSync(bootPath, bootBody, 'utf8')
    bootBuildInfoChanged = true
  }
}

/**
 * Wie in src/config/k2FamiliePresentation.ts: mandant t= aus Stammbaum-Env oder APf-Meine-Familie-Env
 * (plus loadEnv aus Vite, damit lokales .env wie beim Vite-Build greift).
 */
function getK2FamiliePresentationTenantIdForHtmlPatch() {
  const keys = [
    'VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID',
    'VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID',
  ]
  const tryValue = (v) => {
    const raw = String(v || '').trim()
    if (!raw || raw.length > 64) return ''
    const lower = raw.toLowerCase()
    if (lower === '00000000-0000-0000-0000-000000000000') return ''
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(lower)) return ''
    return raw
  }
  for (const k of keys) {
    const fromShell = tryValue(process.env[k])
    if (fromShell && fromShell.toLowerCase() !== 'huber') return fromShell
  }
  let fromFiles = {}
  try {
    const { loadEnv } = require('vite')
    const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
    fromFiles = loadEnv(mode, path.join(__dirname, '..'), '')
  } catch {
    fromFiles = {}
  }
  for (const k of keys) {
    const fromFile = tryValue(fromFiles[k])
    if (fromFile && fromFile.toLowerCase() !== 'huber') return fromFile
  }
  return ''
}

/**
 * public/launch-praesentation-board.html: K2-Familie-Kacheln
 * – Mit VITE_Mandant: direkter Link …/stammbaum?t=… (wie k2FamiliePresentation.ts)
 * – Ohne Mandant im Build: ?go=… beibehalten → SPA ersetzt zu gleicher Ziel-URL; nicht nackt /stammbaum
 *   (sonst Fallback = oft Muster Huber)
 */
;(function patchLaunchPraesentationBoardHtml() {
  const launchPath = path.join(__dirname, '..', 'public', 'launch-praesentation-board.html')
  let html
  try {
    html = fs.readFileSync(launchPath, 'utf8')
  } catch {
    return
  }
  const t = getK2FamiliePresentationTenantIdForHtmlPatch()
  const base = 'https://k2-galerie.vercel.app'
  const meineBare = `${base}/projects/k2-familie/meine-familie`
  const stammBare = `${base}/projects/k2-familie/stammbaum`
  const goMeine = `${base}/launch-praesentation-board?go=meine-familie`
  const goStamm = `${base}/launch-praesentation-board?go=stammbaum-kreinecker`
  const meineFinal = t
    ? `${meineBare}?${new URLSearchParams({ t }).toString()}`
    : goMeine
  const stammFinal = t
    ? `${stammBare}?${new URLSearchParams({ t }).toString()}`
    : goStamm
  const reMeine =
    /href="https:\/\/k2-galerie\.vercel\.app\/(?:launch-praesentation-board\?go=meine-familie|projects\/k2-familie\/meine-familie[^"]*)"/
  const reStamm =
    /href="https:\/\/k2-galerie\.vercel\.app\/(?:launch-praesentation-board\?go=stammbaum-kreinecker|projects\/k2-familie\/stammbaum[^"]*)"/
  const next = html
    .replace(reMeine, `href="${meineFinal}"`)
    .replace(reStamm, `href="${stammFinal}"`)
  if (next !== html) {
    fs.writeFileSync(launchPath, next, 'utf8')
  }
})()

if (tsChanged || jsonChanged || apiChanged || bootBuildInfoChanged) {
  console.log('✅ Build-Info geschrieben:', label)
} else {
  console.log('✅ Build-Info unverändert (kein Schreiben → weniger Reopen):', label)
}
