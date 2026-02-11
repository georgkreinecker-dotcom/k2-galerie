#!/usr/bin/env node
/**
 * Schreibt vor dem Build die aktuelle Build-Zeit in src/buildInfo.generated.ts.
 * So siehst du auf dem Handy sofort: Ist der Stand derselbe wie am Mac?
 */
const fs = require('fs')
const path = require('path')
const now = new Date()
const label = now.toISOString().slice(0, 16).replace('T', ' ')
const outPath = path.join(__dirname, '..', 'src', 'buildInfo.generated.ts')
const content = `// Automatisch beim Build erzeugt – nicht von Hand ändern
export const BUILD_LABEL = '${label}'
export const BUILD_TIMESTAMP = ${now.getTime()}
`
fs.writeFileSync(outPath, content, 'utf8')
console.log('✅ Build-Info geschrieben:', label)
