/**
 * ök2 „rote Linie“: ein durchgängiger Muster-Event-Strang für Werbemittel.
 * Wenn k2-oeffentlich-events leer ist → MUSTER_EVENTS (Dummy-Geschichte sichtbar, Prozess erkennbar).
 * Eine Funktion pro Problemstellung – viele Aufrufer (Sportwagenmodus).
 */

import { MUSTER_EVENTS } from '../config/tenantConfig'
import { loadEvents } from './eventsStorage'

/** Events aus Speicher; wenn ök2 und leer → Muster-Event(e) aus dem Code (immer dieselbe Demo-Linie). */
export function getOeffentlichEventsWithMusterFallback(): any[] {
  const list = loadEvents('oeffentlich')
  if (Array.isArray(list) && list.length > 0) return list
  return JSON.parse(JSON.stringify(MUSTER_EVENTS)) as any[]
}

function normalizeOpeningKey(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Welches Event für Flyer, Prospekt, Presse, K2-Flyer: Eröffnung/Vernissage bevorzugen, sonst erstes mit Datum.
 * Gleiche Logik wie Flyer Event-Bogen (Master).
 */
export function pickOpeningEventForWerbemittel(events: any[]): any | null {
  if (!Array.isArray(events) || events.length === 0) return null
  const exactKeys = new Set(['galerieeroeffnung', 'eroeffnung', 'opening', 'vernissage'])
  const byType = events.find((e) => exactKeys.has(normalizeOpeningKey(e?.type)))
  if (byType) return byType

  const byTitle = events.find((e) => {
    const t = normalizeOpeningKey(e?.title || e?.name || e?.label)
    return (
      t.includes('galerieeroeffnung') ||
      t.includes('eroeffnung') ||
      t.includes('opening') ||
      t.includes('vernissage')
    )
  })
  if (byTitle) return byTitle

  return events.find((e) => Boolean(e?.date)) || null
}
