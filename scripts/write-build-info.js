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

// index.html IMMER aktualisieren (nicht nur beim --inject-html Flag) – sonst bleibt alter Timestamp drin und Mac lädt nie neu
{
  const ts = now.getTime()
  // Im iframe (Cursor Preview) KEIN location.replace – verhindert Reload-Schleifen und Totalabsturz
// Beim Reload bestehende Search-Params erhalten (z. B. empfehler=K2-E-XXX), nur v=Bust setzen – sonst bleibt Empfehlungs-Link hängen / verliert ID
  // Stale-Check: HTML älter als 2 Min → einmal Reload (iPad/Handy bekommen sonst nie neuen Stand). Bei Fetch-Fehler: einmal Reload. Regel: stand-qr-niemals-zurueck.mdc
  const injectScript = '<script>(function(){if(window.self!==window.top)return;var b=' + ts + ';var o=location.origin;var p=location.pathname;var bust=function(){var q=location.search?location.search.slice(1):"";var params=new URLSearchParams(q);params.set("v",Date.now());params.set("_",Date.now());location.replace(o+p+"?"+params.toString());};if(Date.now()-b>120000){if(!sessionStorage.getItem("k2_stale_reload")){sessionStorage.setItem("k2_stale_reload","1");bust();}return;}var url=o+"/build-info.json?t="+Date.now()+"&r="+Math.random();fetch(url,{cache:"no-store",headers:{"Pragma":"no-cache","Cache-Control":"no-cache"}}).then(function(r){return r.ok?r.json():null}).then(function(d){if(d&&d.timestamp>b){try{if(!sessionStorage.getItem("k2_updated")){sessionStorage.setItem("k2_updated","1");bust();}}catch(e){}}}).catch(function(){if(!sessionStorage.getItem("k2_error_reload")){sessionStorage.setItem("k2_error_reload","1");bust();}});})();</script>'
  const indexPath = path.join(__dirname, '..', 'index.html')
  let indexHtml = fs.readFileSync(indexPath, 'utf8')
  if (indexHtml.includes('<!-- BUILD_TS_INJECT -->')) {
    indexHtml = indexHtml.replace('<!-- BUILD_TS_INJECT -->', injectScript)
  } else {
    // Fallback: bereits injiziertes Script komplett durch neues ersetzen (var b=alterTimestamp → aktueller Build)
    // Breiter Regex: erkennt jedes Script das mit (function(){ beginnt und var b=<zahl> enthält
    const oldScriptRe = /<script>\(function\(\)\{[^<]*var b=\d+;[^<]*\}\);?<\/script>/
    if (oldScriptRe.test(indexHtml)) {
      indexHtml = indexHtml.replace(oldScriptRe, injectScript)
    } else {
      // Noch breiter: alles zwischen <script>(function und </script> das var b= enthält
      const broadRe = /<script>\(function[^<]*var b=\d+[^<]*<\/script>/
      if (broadRe.test(indexHtml)) indexHtml = indexHtml.replace(broadRe, injectScript)
    }
  }
  fs.writeFileSync(indexPath, indexHtml, 'utf8')
}

if (tsChanged || jsonChanged) {
  console.log('✅ Build-Info geschrieben:', label)
} else {
  console.log('✅ Build-Info unverändert (kein Schreiben → kein HMR-Stoß):', label)
}
