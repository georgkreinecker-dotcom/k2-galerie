#!/usr/bin/env node

/**
 * Script zum Prüfen auf doppelte Exports
 * Verhindert dass doppelte Exports in Dateien entstehen
 */

const fs = require('fs')
const path = require('path')

function checkDuplicateExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  
  const exports = new Map()
  const duplicateExports = []
  
  lines.forEach((line, index) => {
    // Prüfe auf named exports: export { Something }
    const namedExportMatch = line.match(/export\s+\{\s*([^}]+)\s*\}/)
    if (namedExportMatch) {
      const exportNames = namedExportMatch[1].split(',').map(s => s.trim())
      exportNames.forEach(name => {
        if (exports.has(name)) {
          duplicateExports.push({
            name,
            line: index + 1,
            previousLine: exports.get(name)
          })
        } else {
          exports.set(name, index + 1)
        }
      })
    }
    
    // Prüfe auf default export: export default Something
    if (line.match(/export\s+default/)) {
      if (exports.has('default')) {
        duplicateExports.push({
          name: 'default',
          line: index + 1,
          previousLine: exports.get('default')
        })
      } else {
        exports.set('default', index + 1)
      }
    }
  })
  
  return duplicateExports
}

// Prüfe alle TypeScript/JavaScript Dateien
function checkAllFiles(dir) {
  const files = fs.readdirSync(dir, { recursive: true })
  const issues = []
  
  files.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const filePath = path.join(dir, file)
      try {
        const duplicates = checkDuplicateExports(filePath)
        if (duplicates.length > 0) {
          issues.push({
            file: filePath,
            duplicates
          })
        }
      } catch (e) {
        // Ignoriere Fehler beim Lesen
      }
    }
  })
  
  return issues
}

// Hauptfunktion
const projectRoot = process.cwd()
const issues = checkAllFiles(projectRoot)

if (issues.length > 0) {
  console.error('❌ Doppelte Exports gefunden:')
  issues.forEach(({ file, duplicates }) => {
    console.error(`\n📁 ${file}:`)
    duplicates.forEach(({ name, line, previousLine }) => {
      console.error(`   - "${name}" exportiert in Zeile ${line} und ${previousLine}`)
    })
  })
  process.exit(1)
} else {
  console.log('✅ Keine doppelten Exports gefunden')
  process.exit(0)
}
