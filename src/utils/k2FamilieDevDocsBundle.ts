/**
 * Alle K2-Familie-Entwicklungsdoku aus docs/ – gebündelt für die Hub-Seite (Vite raw import).
 */

export type K2FamilieDevDocMeta = { file: string; title: string; content: string }

function extractTitleFromMd(content: string, file: string): string {
  const lines = content.split(/\r?\n/)
  const h1 = lines.find((l) => l.trim().startsWith('# '))
  if (h1) return h1.replace(/^#\s+/, '').trim()
  return file.replace(/\.md$/i, '')
}

/** Eager glob – einmal beim Modul-Laden; Reihenfolge stabil nach Dateiname. */
export function loadK2FamilieDevDocs(): K2FamilieDevDocMeta[] {
  const modules = import.meta.glob('../../docs/K2-FAMILIE-*.md', { as: 'raw', eager: true }) as Record<string, string>
  return Object.entries(modules)
    .map(([path, content]) => {
      const file = path.split('/').pop() ?? path
      return { file, title: extractTitleFromMd(content, file), content }
    })
    .sort((a, b) => a.file.localeCompare(b.file))
}
