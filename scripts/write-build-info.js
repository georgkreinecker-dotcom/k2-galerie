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

// api/build-info.js: immer genau EINE return-Zeile (Duplikate komplett entfernen)
const apiBuildInfoPath = path.join(__dirname, '..', 'api', 'build-info.js')
let apiChanged = false
try {
  let apiContent = fs.readFileSync(apiBuildInfoPath, 'utf8')
  const singleReturnLine = "  return res.json({ label: '" + label + "', timestamp: " + now.getTime() + " })"
  const returnLineRe = /\s*return res\.json\(\s*\{\s*label:\s*'[^']*',\s*timestamp:\s*\d+\s*\}\s*\)\s*\n?/g
  const returnMatches = apiContent.match(returnLineRe) || []
  const alreadyCorrect = returnMatches.length === 1 && apiContent.includes("label: '" + label + "'")
  if (alreadyCorrect) {
    // Nichts tun
  } else {
    // Immer: alle return-Zeilen durch genau eine ersetzen (ob 0, 1 oder 2+). Erste Ersetzung mit \n davor (regex frisst \s* inkl. Newline).
    let first = true
    const normalized = apiContent.replace(returnLineRe, () => (first ? (first = false, '\n' + singleReturnLine + '\n') : ''))
    fs.writeFileSync(apiBuildInfoPath, normalized, 'utf8')
    apiChanged = true
  }
} catch (_) {}

// index.html: nur schreiben wenn sich die Build-MINUTE geändert hat (nicht jede Millisekunde) → Reopen nur 1× pro Minute
let indexChanged = false
{
  const ts = now.getTime()
  const injectScript = '<script>(function(){if(window.self!==window.top)return;var b=' + ts + ';var o=location.origin;var p=location.pathname;var bust=function(){var q=location.search?location.search.slice(1):"";var params=new URLSearchParams(q);params.set("v",Date.now());params.set("_",Date.now());location.replace(o+p+"?"+params.toString());};if(Date.now()-b>120000){if(!sessionStorage.getItem("k2_stale_reload")){sessionStorage.setItem("k2_stale_reload","1");bust();}return;}var url=o+"/api/build-info?t="+Date.now()+"&r="+Math.random();fetch(url,{cache:"no-store",headers:{"Pragma":"no-cache","Cache-Control":"no-cache"}}).then(function(r){return r.ok?r.json():null}).then(function(d){if(d&&d.timestamp>b){try{if(!sessionStorage.getItem("k2_updated")){sessionStorage.setItem("k2_updated","1");bust();}}catch(e){}}}).catch(function(){if(!sessionStorage.getItem("k2_error_reload")){sessionStorage.setItem("k2_error_reload","1");bust();}});})();</script>'
  const indexPath = path.join(__dirname, '..', 'index.html')
  let indexHtml = fs.readFileSync(indexPath, 'utf8')
  // Gleiche Minute = nicht schreiben (Cursor-Reopen vermeiden). Altes var b= auslesen, Minute vergleichen.
  const oldB = indexHtml.match(/var b=(\d+)/)
  let sameMinute = false
  if (oldB && oldB[1]) {
    const oldDate = new Date(parseInt(oldB[1], 10))
    const oldParts = Object.fromEntries(fmt.formatToParts(oldDate).filter(p => p.type !== 'literal').map(p => [p.type, p.value]))
    const oldLabel = `${oldParts.day}.${oldParts.month}.${String(oldParts.year).slice(-2)} ${oldParts.hour}:${oldParts.minute}`
    if (oldLabel === label) sameMinute = true
  }
  if (!sameMinute) {
    let newIndexHtml
    if (indexHtml.includes('<!-- BUILD_TS_INJECT -->')) {
      newIndexHtml = indexHtml.replace('<!-- BUILD_TS_INJECT -->', injectScript)
    } else {
      const oldScriptRe = /<script>\(function\(\)\{[^<]*var b=\d+;[^<]*\}\);?<\/script>/
      const broadRe = /<script>\(function[^<]*var b=\d+[^<]*<\/script>/
      if (oldScriptRe.test(indexHtml)) {
        newIndexHtml = indexHtml.replace(oldScriptRe, injectScript)
      } else if (broadRe.test(indexHtml)) {
        newIndexHtml = indexHtml.replace(broadRe, injectScript)
      } else {
        newIndexHtml = indexHtml
      }
    }
    if (indexHtml !== newIndexHtml) {
      fs.writeFileSync(indexPath, newIndexHtml, 'utf8')
      indexChanged = true
    }
  }
}

if (tsChanged || jsonChanged || apiChanged || indexChanged) {
  console.log('✅ Build-Info geschrieben:', label)
} else {
  console.log('✅ Build-Info unverändert (kein Schreiben → weniger Reopen):', label)
}
