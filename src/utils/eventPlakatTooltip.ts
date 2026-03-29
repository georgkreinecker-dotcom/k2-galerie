import { formatEventTerminKomplett, type EventTerminLike } from './eventTerminFormat'

/** Tooltip für Event-Plakat-Buttons: Termin/Zeiten nur bei Hover, nicht im sichtbaren Label. */
export function eventPlakatMoreInfoTitle(ev: EventTerminLike | null | undefined): string {
  const raw = ev?.date ? formatEventTerminKomplett(ev, { mode: 'compact', emptyFallback: '' }) : ''
  const t = String(raw || '').trim()
  return t ? `Hier mehr Infos: ${t} · Plakat anzeigen` : 'Hier mehr Infos – Plakat anzeigen'
}
