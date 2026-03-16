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

/** Prüft ob ein Event als VK2-Event gilt (id oder title+date in vk2List). */
function isEventInVk2List(event: { id?: string; title?: string; date?: string }, vk2List: any[]): boolean {
  if (!event || !Array.isArray(vk2List)) return false
  const id = event.id
  const title = event.title
  const date = event.date
  return vk2List.some(
    (v) => (id && v.id === id) || (title && date && v.title === title && v.date === date)
  )
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
        list = list.filter((e: any) => !isEventInVk2List(e, vk2List))
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

export function saveEvents(tenantId: EventsTenantId, events: any[]): void {
  try {
    const key = getEventsKey(tenantId)
    const list = Array.isArray(events) ? events : []
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
