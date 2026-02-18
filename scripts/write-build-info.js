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
// Nur schreiben wenn sich Inhalt geändert hat – verhindert HMR-Stoß / Crash direkt nach "Fertig"-Meldung
let tsChanged = true
try {
  const existing = fs.readFileSync(outPath, 'utf8')
  if (existing === content) tsChanged = false
} catch (_) {}
if (tsChanged) fs.writeFileSync(outPath, content, 'utf8')

// build-info.json für Abruf im Browser (Cache-Check, immer no-cache)
const publicPath = path.join(__dirname, '..', 'public', 'build-info.json')
const jsonContent = JSON.stringify({ label, timestamp: now.getTime() })
let jsonChanged = true
try {
  if (fs.readFileSync(publicPath, 'utf8') === jsonContent) jsonChanged = false
} catch (_) {}
if (jsonChanged) fs.writeFileSync(publicPath, jsonContent, 'utf8')

// Beim Build (--inject-html): Build-Check in index.html injizieren – JEDEN Build aktueller Timestamp (Seite öffnen = Update)
if (process.argv.includes('--inject-html')) {
  const ts = now.getTime()
  // Im iframe (Cursor Preview) KEIN location.replace – verhindert Reload-Schleifen und Totalabsturz
const injectScript = '<script>(function(){if(window.self!==window.top)return;var b=' + ts + ';var o=location.origin;var p=location.pathname;var q=location.search||"";var sep=q?"&":"?";if(Date.now()-b>120000){try{var k2="k2_stale";if(!sessionStorage.getItem(k2)){sessionStorage.setItem(k2,"1");location.replace(o+p+q+sep+"_="+Date.now());}}catch(e){}return;}var bust="v="+Date.now();var url=o+"/build-info.json?t="+Date.now()+"&r="+Math.random();fetch(url,{cache:"no-store"}).then(function(r){return r.ok?r.json():null}).then(function(d){if(d&&d.timestamp>b)location.replace(o+p+sep+bust)}).catch(function(){try{var k="k2_noreload";if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,"1");location.replace(o+p+q+sep+"_="+Date.now())}}catch(e){}});})();</script>'
  const indexPath = path.join(__dirname, '..', 'index.html')
  let indexHtml = fs.readFileSync(indexPath, 'utf8')
  if (indexHtml.includes('<!-- BUILD_TS_INJECT -->')) {
    indexHtml = indexHtml.replace('<!-- BUILD_TS_INJECT -->', injectScript)
  } else {
    // Fallback: bereits injiziertes Script komplett durch neues ersetzen (var b=alterTimestamp → aktueller Build)
    const oldScriptRe = /<script>\(function\(\)\{\s*(?:if\(window\.self!==window\.top\)return;)?\s*var b=\d+;[^<]*\}\);<\/script>/
    if (oldScriptRe.test(indexHtml)) indexHtml = indexHtml.replace(oldScriptRe, injectScript)
  }
  fs.writeFileSync(indexPath, indexHtml, 'utf8')
}

if (tsChanged || jsonChanged) {
  console.log('✅ Build-Info geschrieben:', label)
} else {
  console.log('✅ Build-Info unverändert (kein Schreiben → kein HMR-Stoß):', label)
}
