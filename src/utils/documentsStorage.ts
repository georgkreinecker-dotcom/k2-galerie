/**
 * Phase 1.4 Sportwagen: Eine Schicht für Dokumente (K2, ök2, VK2).
 * Alle Lese-/Schreibzugriffe für k2-documents(s), k2-oeffentlich-documents(s), k2-vk2-document(s) laufen hier.
 * Hinweis: Key im Code teils 'k2-documents' (ohne s), einheitlich hier als documents.
 */
import { loadStammdaten, loadVk2Stammdaten } from './stammdatenStorage'
import { pilotScopeVk2Key } from './vk2StorageKeys'

export type DocumentsTenantId = 'k2' | 'oeffentlich' | 'vk2'

const DOCUMENTS_KEYS: Record<DocumentsTenantId, string> = {
  k2: 'k2-documents',
  oeffentlich: 'k2-oeffentlich-documents',
  vk2: 'k2-vk2-documents',
}

export function getDocumentsKey(tenantId: DocumentsTenantId): string {
  if (tenantId === 'vk2') return pilotScopeVk2Key(DOCUMENTS_KEYS.vk2)
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
    const raw = typeof window !== 'undefined' ? localStorage.getItem(getDocumentsKey(otherTenantId)) : null
    const other = (raw && raw.trim() ? JSON.parse(raw) : []) || []
    if (!Array.isArray(other) || other.length !== list.length) return false
    return JSON.stringify(list) === JSON.stringify(other)
  } catch {
    return false
  }
}

export type SaveDocumentsOptions = {
  /** Nur für kontrollierte Abläufe (z. B. Medienpaket ersetzt Event-Zeile): kurz mit [] schreiben, obwohl noch viele Docs im Speicher stehen – direkt danach folgt der volle neue Stand. */
  allowEmptyWrite?: boolean
}

export type StammdatenSnapshot = {
  version: 1
  capturedAt: string
  tenantId: DocumentsTenantId
  /** K2/ök2: gallery/martina/georg; VK2: vk2 */
  data: Record<string, unknown>
}

function buildStammdatenSnapshot(tenantId: DocumentsTenantId): StammdatenSnapshot {
  const capturedAt = new Date().toISOString()
  if (tenantId === 'vk2') {
    const vk2 = loadVk2Stammdaten()
    return { version: 1, capturedAt, tenantId, data: { vk2: (vk2 ?? {}) as Record<string, unknown> } }
  }
  const t = tenantId === 'oeffentlich' ? 'oeffentlich' : 'k2'
  const gallery = loadStammdaten(t, 'gallery') ?? {}
  const martina = loadStammdaten(t, 'martina') ?? {}
  const georg = loadStammdaten(t, 'georg') ?? {}
  return { version: 1, capturedAt, tenantId, data: { gallery, martina, georg } as Record<string, unknown> }
}

/** Gibt true zurück wenn geschrieben wurde, false wenn Schutz gegriffen hat oder Fehler. */
export function saveDocuments(
  tenantId: DocumentsTenantId,
  documents: any[],
  options?: SaveDocumentsOptions
): boolean {
  try {
    const key = getDocumentsKey(tenantId)
    const list = Array.isArray(documents) ? documents : []
    if (typeof window !== 'undefined') {
      // EISERN (alle Kontexte): Nicht mit leerer Liste überschreiben, wenn 2+ Dokumente vorhanden (Schutz vor Löschung von außen). Ausnahme: Nutzer löscht letztes Dokument.
      if (list.length === 0 && !options?.allowEmptyWrite) {
        const current = loadDocuments(tenantId)
        if (current.length > 1) {
          console.warn(`⚠️ documentsStorage: Schreibvorgang abgebrochen – ${tenantId}-Dokumente nicht mit leerer Liste überschreiben (Schutz)`)
          return false
        }
      }
      // EISERN: K2 darf nicht mit VK2-Daten überschrieben werden
      if (tenantId === 'k2' && list.length > 0 && isSameAsOtherKey(list, 'vk2')) {
        console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – VK2-Dokumente würden K2 überschreiben')
        return false
      }
      // EISERN: ök2 darf nicht mit K2- oder VK2-Daten überschrieben werden (vice versa)
      if (tenantId === 'oeffentlich' && list.length > 0) {
        if (isSameAsOtherKey(list, 'k2')) {
          console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – K2-Dokumente würden ök2 überschreiben')
          return false
        }
        if (isSameAsOtherKey(list, 'vk2')) {
          console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – VK2-Dokumente würden ök2 überschreiben')
          return false
        }
      }
      // EISERN: VK2 darf nicht mit K2- oder ök2-Daten überschrieben werden (vice versa)
      if (tenantId === 'vk2' && list.length > 0) {
        if (isSameAsOtherKey(list, 'k2')) {
          console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – K2-Dokumente würden VK2 überschreiben')
          return false
        }
        if (isSameAsOtherKey(list, 'oeffentlich')) {
          console.warn('⚠️ documentsStorage: Schreibvorgang abgebrochen – ök2-Dokumente würden VK2 überschreiben')
          return false
        }
      }
    }
    // Level 5 (Stammdaten): Snapshot an jedes Dokument hängen (nur wenn noch keiner vorhanden).
    // Wichtig: Schutzchecks oben müssen auf der Original-Liste laufen (sonst könnten Gleichheitschecks aushebeln).
    const snapshot = buildStammdatenSnapshot(tenantId)
    const toWrite = list.map((d: any) => {
      if (!d || typeof d !== 'object') return d
      if ((d as any).stammdatenSnapshot) return d
      return { ...d, stammdatenSnapshot: snapshot }
    })

    const json = JSON.stringify(toWrite)
    // Werbemittel: mehrere HTML-Dokumente als data-URL überschreiten schnell 10 MB (Medienpaket übernehmen).
    if (json.length > 32_000_000) {
      console.error('❌ documentsStorage: Daten zu groß')
      return false
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, json)
      // Zusätzliche Sicherheit K2: Lokale Sicherungskopie (wird nie vom Server überschrieben)
      if (tenantId === 'k2' && toWrite.length > 0) {
        try {
          localStorage.setItem('k2-documents-backup', json)
        } catch (_) {}
      }
    }
    return true
  } catch (e) {
    console.error('❌ documentsStorage save:', e)
    return false
  }
}

/** Liest die K2-Sicherungskopie (Öffentlichkeitsarbeit, Newsletter, etc.). Nur für Wiederherstellung. */
export function loadK2DocumentsBackup(): any[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('k2-documents-backup') : null
    if (!raw || !raw.trim()) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
