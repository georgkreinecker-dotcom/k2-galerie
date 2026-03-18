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

// Verzeichnisse die ignoriert werden sollen (niemals betreten – vermeidet ENOENT in dist/ etc.)
const IGNORE_DIRS = new Set(['node_modules', 'dist', '.git', 'build', '.next', 'coverage'])

// Prüfe alle TypeScript/JavaScript Dateien (manueller Walk – dist/ wird nie betreten)
function checkAllFiles(dir) {
  const issues = []
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (e) {
    return issues
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue
      issues.push(...checkAllFiles(full))
    } else if (ent.isFile() && /\.(ts|tsx|js|jsx)$/.test(ent.name)) {
      try {
        const duplicates = checkDuplicateExports(full)
        if (duplicates.length > 0) {
          issues.push({ file: full, duplicates })
        }
      } catch (_) {}
    }
  }
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
