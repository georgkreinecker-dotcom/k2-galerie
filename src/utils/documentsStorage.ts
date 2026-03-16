/**
 * Phase 1.4 Sportwagen: Eine Schicht für Dokumente (K2, ök2, VK2).
 * Alle Lese-/Schreibzugriffe für k2-documents(s), k2-oeffentlich-documents(s), k2-vk2-document(s) laufen hier.
 * Hinweis: Key im Code teils 'k2-documents' (ohne s), einheitlich hier als documents.
 */

export type DocumentsTenantId = 'k2' | 'oeffentlich' | 'vk2'

const DOCUMENTS_KEYS: Record<DocumentsTenantId, string> = {
  k2: 'k2-documents',
  oeffentlich: 'k2-oeffentlich-documents',
  vk2: 'k2-vk2-documents',
}

export function getDocumentsKey(tenantId: DocumentsTenantId): string {
  return DOCUMENTS_KEYS[tenantId]
}

export function loadDocuments(tenantId: DocumentsTenantId): any[] {
  try {
    const key = getDocumentsKey(tenantId)
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (!raw || !raw.trim()) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** EISERN: K2 darf nicht mit exakt den VK2-Dokumenten überschrieben werden (Vermischung). */
function isSameAsVk2Documents(list: any[]): boolean {
  if (!Array.isArray(list) || list.length === 0) return false
  try {
    const vk2Raw = typeof window !== 'undefined' ? localStorage.getItem(DOCUMENTS_KEYS.vk2) : null
    const vk2 = (vk2Raw && vk2Raw.trim() ? JSON.parse(vk2Raw) : []) || []
    if (!Array.isArray(vk2) || vk2.length !== list.length) return false
    return JSON.stringify(list) === JSON.stringify(vk2)
  } catch {
    return false
  }
}

export function saveDocuments(tenantId: DocumentsTenantId, documents: any[]): void {
  try {
    const key = getDocumentsKey(tenantId)
    const list = Array.isArray(documents) ? documents : []
    // EISERN: k2-documents darf nicht mit VK2-Daten überschrieben werden
    if (tenantId === 'k2' && typeof window !== 'undefined' && list.length > 0 && isSameAsVk2Documents(list)) {
      console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – VK2-Dokumente würden K2 überschreiben')
      return
    }
    const json = JSON.stringify(list)
    if (json.length > 10_000_000) {
      console.error('❌ documentsStorage: Daten zu groß')
      return
    }
    if (typeof window !== 'undefined') localStorage.setItem(key, json)
  } catch (e) {
    console.error('❌ documentsStorage save:', e)
  }
}
