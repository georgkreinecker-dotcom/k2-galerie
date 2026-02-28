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

export function saveDocuments(tenantId: DocumentsTenantId, documents: any[]): void {
  try {
    const key = getDocumentsKey(tenantId)
    const list = Array.isArray(documents) ? documents : []
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
