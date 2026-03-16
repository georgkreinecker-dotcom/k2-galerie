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

/** Prüft ob list exakt dem Inhalt eines anderen Tenant-Keys entspricht (Vermischung verhindern). */
function isSameAsOtherKey(list: any[], otherTenantId: DocumentsTenantId): boolean {
  if (!Array.isArray(list) || list.length === 0) return false
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(DOCUMENTS_KEYS[otherTenantId]) : null
    const other = (raw && raw.trim() ? JSON.parse(raw) : []) || []
    if (!Array.isArray(other) || other.length !== list.length) return false
    return JSON.stringify(list) === JSON.stringify(other)
  } catch {
    return false
  }
}

export function saveDocuments(tenantId: DocumentsTenantId, documents: any[]): void {
  try {
    const key = getDocumentsKey(tenantId)
    const list = Array.isArray(documents) ? documents : []
    if (typeof window !== 'undefined') {
      // EISERN (alle Kontexte): Nicht mit leerer Liste überschreiben, wenn 2+ Dokumente vorhanden (Schutz vor Löschung von außen). Ausnahme: Nutzer löscht letztes Dokument.
      if (list.length === 0) {
        const current = loadDocuments(tenantId)
        if (current.length > 1) {
          console.warn(`⚠️ documentsStorage: Schreibvorgang abgebrochen – ${tenantId}-Dokumente nicht mit leerer Liste überschreiben (Schutz)`)
          return
        }
      }
      // EISERN: K2 darf nicht mit VK2-Daten überschrieben werden
      if (tenantId === 'k2' && list.length > 0 && isSameAsOtherKey(list, 'vk2')) {
        console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – VK2-Dokumente würden K2 überschreiben')
        return
      }
      // EISERN: ök2 darf nicht mit K2- oder VK2-Daten überschrieben werden (vice versa)
      if (tenantId === 'oeffentlich' && list.length > 0) {
        if (isSameAsOtherKey(list, 'k2')) {
          console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – K2-Dokumente würden ök2 überschreiben')
          return
        }
        if (isSameAsOtherKey(list, 'vk2')) {
          console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – VK2-Dokumente würden ök2 überschreiben')
          return
        }
      }
      // EISERN: VK2 darf nicht mit K2- oder ök2-Daten überschrieben werden (vice versa)
      if (tenantId === 'vk2' && list.length > 0) {
        if (isSameAsOtherKey(list, 'k2')) {
          console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – K2-Dokumente würden VK2 überschreiben')
          return
        }
        if (isSameAsOtherKey(list, 'oeffentlich')) {
          console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – ök2-Dokumente würden VK2 überschreiben')
          return
        }
      }
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
