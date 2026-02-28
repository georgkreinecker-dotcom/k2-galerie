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

export function loadEvents(tenantId: EventsTenantId): any[] {
  try {
    const key = getEventsKey(tenantId)
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (!raw || !raw.trim()) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
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
