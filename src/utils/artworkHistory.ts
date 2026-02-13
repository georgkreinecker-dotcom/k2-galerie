/**
 * History für gelöschte Werke – für Wiederherstellung.
 * Werke die lokal waren aber nicht auf Server = woanders gelöscht und veröffentlicht.
 */
const HISTORY_KEY = 'k2-artworks-history'

export function appendToHistory(artworks: any[]): void {
  if (artworks.length === 0) return
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    const now = new Date().toISOString()
    const entries = artworks.map((a: any) => ({
      artwork: a,
      deletedAt: now,
      number: a.number || a.id,
      title: a.title || ''
    }))
    const updated = [...existing, ...entries]
    if (updated.length > 500) updated.splice(0, updated.length - 500)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    console.log('📜 History:', artworks.length, 'gelöschte Werke archiviert')
  } catch (e) {
    console.warn('⚠️ History konnte nicht geschrieben werden:', e)
  }
}

export function loadHistory(): Array<{ artwork: any; deletedAt: string; number: string; title: string }> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
