#!/usr/bin/env node
// Script zum Schreiben von gallery-data.json in public Ordner
// Wird automatisch aufgerufen wenn Daten exportiert werden

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Lese Daten von stdin oder aus Argument
const data = process.argv[2] || process.stdin.read()

if (!data) {
  console.error('❌ Keine Daten erhalten')
  process.exit(1)
}

try {
  const publicPath = path.join(__dirname, '..', 'public', 'gallery-data.json')
  fs.writeFileSync(publicPath, data, 'utf8')
  console.log('✅ gallery-data.json wurde in public/ geschrieben')
} catch (error) {
  console.error('❌ Fehler beim Schreiben:', error.message)
  process.exit(1)
}
