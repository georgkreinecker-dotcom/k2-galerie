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
fs.writeFileSync(outPath, content, 'utf8')

// build-info.json für Abruf im Browser (Cache-Check, immer no-cache)
const publicPath = path.join(__dirname, '..', 'public', 'build-info.json')
fs.writeFileSync(publicPath, JSON.stringify({ label, timestamp: now.getTime() }), 'utf8')

console.log('✅ Build-Info geschrieben:', label)
