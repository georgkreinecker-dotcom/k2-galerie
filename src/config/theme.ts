/**
 * Design Tokens – eine Stelle für Hintergrund hell/dunkel, Text, Akzent.
 * Regel: ui-kontrast-lesbarkeit.mdc – Türkis/Weiß nur auf dunklem Hintergrund.
 */
import { WERBEUNTERLAGEN_STIL } from './marketingWerbelinie'

/** Admin & helle Bereiche (Werbeunterlagen, mök2, Admin-Tabs): dunkle Texte/Buttons auf hellem Grund */
export const adminTheme = {
  ...WERBEUNTERLAGEN_STIL,
  /** Primär-Button auf hellem Hintergrund – immer dunkler Hintergrund + weiße Schrift */
  buttonPrimary: { background: '#b54a1e', color: '#fff' },
  buttonPrimaryHover: { background: '#d4622a', color: '#fff' },
  /** Text auf hellem Hintergrund – nie Weiß/Türkis */
  textOnLight: '#1c1a18',
  textMutedOnLight: '#5c5650',
  /** Rahmen auf hellem Hintergrund */
  borderOnLight: '#b54a1e',
} as const

/** Galerie, Vorschau, dunkle Panels: helle Texte/Akzente auf dunklem Grund */
export const galerieTheme = {
  textOnDark: '#ffffff',
  accentOnDark: '#5ffbf1',
  /** Typischer dunkler Hintergrund (Galerie, Preview) */
  bgDark: '#1c1a18',
} as const

/**
 * Kontext wählen:
 * - Hintergrund hell (Admin, Werbeunterlagen, KundenPage, …) → adminTheme
 * - Hintergrund dunkel (Galerie, Vorschau, dunkle Modals) → galerieTheme
 */
