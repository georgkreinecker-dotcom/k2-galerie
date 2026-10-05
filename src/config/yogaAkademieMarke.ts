/**
 * Visuelle Marke der Yoga-Akademie Austria – für Wiedererkennbarkeit in unseren Ansichten.
 * Quelle: https://www.yogaakademieaustria.com/ (Stand 05.10.26)
 * Keine K2-/Galerie-Worte. Nur für Yoga-Vorführflächen.
 */

export const YOGA_AKADEMIE_SITE = 'https://www.yogaakademieaustria.com/'

/** Logo lokal (Spiegel der Website) – Ablage wo wir arbeiten. */
export const YOGA_AKADEMIE_LOGO = '/k2-yoga/yoga-akademie-austria-logo.png'

/** Überschriften-Gold der Homepage */
export const YOGA_GOLD = '#806000'
export const YOGA_GOLD_SOFT = '#C9BF81'
export const YOGA_GOLD_DARK = '#5c4500'

/** Button-/Link-Violett der Homepage */
export const YOGA_VIOLETT = '#351777'
export const YOGA_VIOLETT_SOFT = '#4a2a9a'

export const YOGA_BG = '#f5f3ef'
export const YOGA_BG_CARD = '#fffefb'
export const YOGA_TEXT = '#1c1a18'
export const YOGA_MUTED = '#5c5650'

export const YOGA_FONT =
  '"Montserrat", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'

/** Google-Font einbinden (einmal pro Seite via <link> oder style-Hinweis). */
export const YOGA_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap'

export const YOGA_MARKE = {
  gold: YOGA_GOLD,
  goldSoft: YOGA_GOLD_SOFT,
  goldDark: YOGA_GOLD_DARK,
  violett: YOGA_VIOLETT,
  violettSoft: YOGA_VIOLETT_SOFT,
  bg: YOGA_BG,
  bgCard: YOGA_BG_CARD,
  text: YOGA_TEXT,
  muted: YOGA_MUTED,
  font: YOGA_FONT,
  logo: YOGA_AKADEMIE_LOGO,
  site: YOGA_AKADEMIE_SITE,
  slogan: 'wo Yoga tiefer geht',
} as const
