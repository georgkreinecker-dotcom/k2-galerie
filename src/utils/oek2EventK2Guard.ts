/**
 * ök2: Keine echten K2-Galerie-Events (z. B. Eröffnung 24.–26.04.) in Demo-Daten.
 * ID-Filter allein reicht nicht – K2-Eröffnung wird oft mit neuer event-${Date.now()}-ID angelegt.
 */

function normalizeKey(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '')
}

function eventFingerprint(event: { title?: unknown; type?: unknown; date?: unknown }): string {
  const title = normalizeKey(event?.title)
  const type = normalizeKey(event?.type)
  const date = String(event?.date || '').slice(0, 10)
  return `${title}|${type}|${date}`
}

/** Bekannte Signatur des echten K2-Eröffnungsevents (Martina & Georg). */
export function isKnownK2GalerieEroeffnungEvent(event: unknown): boolean {
  if (!event || typeof event !== 'object') return false
  const e = event as { title?: string; type?: string; date?: string; endDate?: string }
  const titleNorm = normalizeKey(e.title)
  const typeNorm = normalizeKey(e.type)

  if (titleNorm.includes('eroeffnungderk2galerie') || titleNorm === 'eroeffnungderk2galerie') {
    return true
  }
  if (typeNorm.includes('galerieeroeffnung') && titleNorm.includes('k2')) {
    return true
  }
  if (
    e.date === '2026-04-24' &&
    (e.endDate === '2026-04-26' || !e.endDate) &&
    (typeNorm.includes('galerieeroeffnung') || typeNorm.includes('eroeffnung'))
  ) {
    return true
  }
  return false
}

/** Event-Inhalt entspricht einem Eintrag in k2-events (auch bei anderer ID). */
export function matchesK2EventsFingerprint(
  event: unknown,
  k2Events: unknown[] | null | undefined
): boolean {
  if (!Array.isArray(k2Events) || k2Events.length === 0) return false
  const fp = eventFingerprint(event as { title?: unknown; type?: unknown; date?: unknown })
  if (!fp || fp === '||') return false
  return k2Events.some((k) => eventFingerprint(k as { title?: unknown; type?: unknown; date?: unknown }) === fp)
}

/** Darf in ök2 (k2-oeffentlich-events / Admin-Demo) nicht erscheinen. */
export function isK2RealGalleryEventContamination(
  event: unknown,
  k2Events?: unknown[] | null
): boolean {
  if (!event) return false
  if (isKnownK2GalerieEroeffnungEvent(event)) return true
  if (k2Events && matchesK2EventsFingerprint(event, k2Events)) return true
  return false
}

export function filterK2ContaminationFromOek2Events(
  events: unknown[],
  k2Events?: unknown[] | null
): unknown[] {
  if (!Array.isArray(events) || events.length === 0) return []
  return events.filter((e) => !isK2RealGalleryEventContamination(e, k2Events))
}

/** k2-events direkt aus localStorage (ohne ök2-Filter-Rekursion). */
export function readRawK2EventsFromStorage(): unknown[] {
  try {
    if (typeof window === 'undefined') return []
    const raw = localStorage.getItem('k2-events')
    if (!raw?.trim()) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
