/**
 * Phase 1.4 Sportwagen: Eine Schicht für Events (K2, ök2, VK2).
 * Alle Lese-/Schreibzugriffe für k2-events, k2-oeffentlich-events, k2-vk2-events laufen hier.
 */

export type EventsTenantId = 'k2' | 'oeffentlich' | 'vk2'

const EVENTS_KEYS: Record<EventsTenantId, string> = {
  k2: 'k2-events',
  oeffentlich: 'k2-oeffentlich-events',
  vk2: 'k2-vk2-events',
}

export function getEventsKey(tenantId: EventsTenantId): string {
  return EVENTS_KEYS[tenantId]
}

/** Prüft ob ein Event dieselbe id wie ein VK2-Event hat (nur id – title+date würde K2-Events fälschlich entfernen). */
function isEventIdInVk2List(event: { id?: string }, vk2List: any[]): boolean {
  if (!event || !Array.isArray(vk2List)) return false
  const id = event.id
  if (!id) return false
  return vk2List.some((v) => v && v.id === id)
}

export function loadEvents(tenantId: EventsTenantId): any[] {
  try {
    const key = getEventsKey(tenantId)
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (!raw || !raw.trim()) return []
    let list = JSON.parse(raw)
    if (!Array.isArray(list)) return []

    // K2-Reparatur: VK2-Events aus k2-events entfernen (Vermischung rückgängig)
    if (tenantId === 'k2' && typeof window !== 'undefined') {
      const vk2Raw = localStorage.getItem(EVENTS_KEYS.vk2)
      const vk2List = (vk2Raw && vk2Raw.trim() ? JSON.parse(vk2Raw) : []) || []
      if (Array.isArray(vk2List) && vk2List.length > 0) {
        const before = list.length
        list = list.filter((e: any) => !isEventIdInVk2List(e, vk2List))
        if (list.length < before) {
          try {
            localStorage.setItem(key, JSON.stringify(list))
          } catch (e) {
            console.warn('eventsStorage: K2-Reparatur (VK2 entfernt) – Schreiben fehlgeschlagen', e)
          }
        }
      }
    }

    return list
  } catch {
    return []
  }
}

/** EISERN: Beim Schreiben in k2-events niemals VK2-Events durchlassen (Vermischung verhindern). */
function filterVk2FromK2Events(events: any[]): any[] {
  if (!Array.isArray(events) || events.length === 0) return events
  try {
    const vk2Raw = typeof window !== 'undefined' ? localStorage.getItem(EVENTS_KEYS.vk2) : null
    const vk2List = (vk2Raw && vk2Raw.trim() ? JSON.parse(vk2Raw) : []) || []
    if (!Array.isArray(vk2List) || vk2List.length === 0) return events
    const vk2Ids = new Set((vk2List as any[]).map((e: any) => e?.id).filter(Boolean))
    const filtered = events.filter((e: any) => !e?.id || !vk2Ids.has(e.id))
    if (filtered.length < events.length) {
      console.warn('⚠️ eventsStorage: VK2-Events aus K2-Schreibvorgang entfernt (Datenvermischung verhindert)')
      return filtered
    }
    return events
  } catch {
    return events
  }
}

/** IDs aus einem Event-Key lesen (für Kreuz-Check). */
function getEventIdsFromKey(otherTenantId: EventsTenantId): Set<string> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(EVENTS_KEYS[otherTenantId]) : null
    const list = (raw && raw.trim() ? JSON.parse(raw) : []) || []
    if (!Array.isArray(list)) return new Set()
    return new Set((list as any[]).map((e: any) => e?.id).filter(Boolean))
  } catch {
    return new Set()
  }
}

/** EISERN: Beim Schreiben in ök2/VK2 keine Events aus dem anderen Kontext (K2/VK2 bzw. K2/ök2) durchlassen. */
function filterOtherContextFromEvents(events: any[], targetTenantId: EventsTenantId): { list: any[]; allFiltered: boolean } {
  if (!Array.isArray(events) || events.length === 0) return { list: events, allFiltered: false }
  try {
    const k2Ids = getEventIdsFromKey('k2')
    const oeffentlichIds = getEventIdsFromKey('oeffentlich')
    const vk2Ids = getEventIdsFromKey('vk2')
    const otherIds = targetTenantId === 'oeffentlich'
      ? new Set([...k2Ids, ...vk2Ids])
      : targetTenantId === 'vk2'
        ? new Set([...k2Ids, ...oeffentlichIds])
        : new Set<string>()
    if (otherIds.size === 0) return { list: events, allFiltered: false }
    const filtered = events.filter((e: any) => !e?.id || !otherIds.has(e.id))
    const allFiltered = events.length > 0 && filtered.length === 0
    if (filtered.length < events.length) {
      console.warn(`⚠️ eventsStorage: Fremde Events aus ${targetTenantId}-Schreibvorgang entfernt (Datenvermischung verhindert)`)
    }
    return { list: filtered, allFiltered }
  } catch {
    return { list: events, allFiltered: false }
  }
}

export function saveEvents(tenantId: EventsTenantId, events: any[]): void {
  try {
    const key = getEventsKey(tenantId)
    let list = Array.isArray(events) ? events : []
    if (typeof window !== 'undefined') {
      // EISERN (alle Kontexte): Nicht mit leerer Liste überschreiben, wenn 2+ Einträge vorhanden (Schutz vor Löschung von außen). Ausnahme: Nutzer löscht letztes Event.
      if (list.length === 0) {
        const current = loadEvents(tenantId)
        if (current.length > 1) {
          console.warn(`⚠️ eventsStorage: Schreibvorgang abgebrochen – ${tenantId}-Events nicht mit leerer Liste überschreiben (Schutz)`)
          return
        }
      }
      // EISERN: K2 – keine VK2-Daten
      if (tenantId === 'k2') {
        const filtered = filterVk2FromK2Events(list)
        if (list.length > 0 && filtered.length === 0) {
          console.warn('⚠️ eventsStorage: Schreibvorgang abgebrochen – nur VK2-Events übergeben, K2 würde geleert')
          return
        }
        list = filtered
      }
      // EISERN: ök2 – keine K2- und keine VK2-Daten (vice versa)
      if (tenantId === 'oeffentlich' && list.length > 0) {
        const { list: filtered, allFiltered } = filterOtherContextFromEvents(list, 'oeffentlich')
        if (allFiltered) {
          console.warn('⚠️ eventsStorage: Schreibvorgang abgebrochen – nur K2/VK2-Events übergeben, ök2 würde überschrieben')
          return
        }
        list = filtered
      }
      // EISERN: VK2 – keine K2- und keine ök2-Daten (vice versa)
      if (tenantId === 'vk2' && list.length > 0) {
        const { list: filtered, allFiltered } = filterOtherContextFromEvents(list, 'vk2')
        if (allFiltered) {
          console.warn('⚠️ eventsStorage: Schreibvorgang abgebrochen – nur K2/ök2-Events übergeben, VK2 würde überschrieben')
          return
        }
        list = filtered
      }
    }
    const json = JSON.stringify(list)
    if (json.length > 10_000_000) {
      console.error('❌ eventsStorage: Daten zu groß')
      return
    }
    if (typeof window !== 'undefined') localStorage.setItem(key, json)
  } catch (e) {
    console.error('❌ eventsStorage save:', e)
  }
}
