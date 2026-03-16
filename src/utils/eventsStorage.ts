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

export function saveEvents(tenantId: EventsTenantId, events: any[]): void {
  try {
    const key = getEventsKey(tenantId)
    let list = Array.isArray(events) ? events : []
    // EISERN: k2-events darf niemals VK2-Daten erhalten – auch nicht durch falschen Aufrufer
    if (tenantId === 'k2' && typeof window !== 'undefined') {
      const filtered = filterVk2FromK2Events(list)
      // Niemals K2 mit leerer Liste überschreiben wenn der Aufrufer VK2-Daten geschickt hat (würde K2 löschen)
      if (list.length > 0 && filtered.length === 0) {
        console.warn('⚠️ eventsStorage: Schreibvorgang abgebrochen – nur VK2-Events übergeben, K2 würde geleert')
        return
      }
      list = filtered
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
