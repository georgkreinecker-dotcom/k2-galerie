import { K2_STAMMDATEN_DEFAULTS } from './tenantConfig'

/** Sommerpause K2 echte Galerie – Hinweis auf Willkommensseite (bis einschließlich dieses Tages). */
export const K2_SOMMERPAUSE_END_LABEL = '1. Oktober 2026'

/** Lokales Datum YYYY-MM-DD (Besucher-Gerät). */
export function localDateIso(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Aktiv bis einschließlich 2026-10-01 – danach automatisch aus. */
export function isK2SommerpauseActive(now = new Date()): boolean {
  return localDateIso(now) <= '2026-10-01'
}

export const K2_SOMMERPAUSE_BANNER_TITLE = 'Sommerpause'

export function getK2SommerpauseBannerBody(endLabel = K2_SOMMERPAUSE_END_LABEL): string {
  return `Galerie vor Ort bis einschließlich ${endLabel} nicht regulär geöffnet. Gerne auf telefonische Anfrage – Werke online weiter unten ansehen.`
}

export function getK2SommerpausePhone(fallback = K2_STAMMDATEN_DEFAULTS.gallery.phone): string {
  return (fallback || K2_STAMMDATEN_DEFAULTS.gallery.phone || '').trim()
}

/** Kurztext im Öffnungszeiten-Kasten (Willkommen / Impressum). */
export function getK2SommerpauseOpeningHoursLine(endLabel = K2_SOMMERPAUSE_END_LABEL): string {
  return `Bis einschließlich ${endLabel} nicht regulär geöffnet – gerne auf telefonische Anfrage.`
}

export const K2_SOMMERPAUSE_REGULAR_HOURS_LABEL = 'Reguläre Öffnungszeiten'
