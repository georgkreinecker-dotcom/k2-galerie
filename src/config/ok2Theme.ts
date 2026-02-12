/**
 * ök2-Farbschema – wissenschaftlich fundiert für Wohlbefinden und Verweildauer
 *
 * Orientierung an Studien zu:
 * - Beruhigende Wirkung von Blau/Grün (parasympathisches Nervensystem)
 * - Gedämpfte Töne statt Neon (reduzieren Stress)
 * - Warme Off-Whites/Creme für Einladung und Komfort
 * - Sanfte Kontraste für entspanntes Betrachten
 *
 * Optisch klar getrennt von der K2 Galerie (dunkles, kühles Cyan-Theme).
 */

export interface Ok2ThemeColors {
  /** Haupt-Hintergrund (warmes Creme/Off-White) */
  backgroundColor1: string
  backgroundColor2: string
  backgroundColor3: string
  /** Fließtext */
  textColor: string
  /** Dezente Texte / Labels */
  mutedColor: string
  /** Akzent (ruhiges Sage/Teal) */
  accentColor: string
  /** Karten-Hintergrund */
  cardBg1: string
  cardBg2: string
}

export const OK2_THEME: Ok2ThemeColors = {
  backgroundColor1: '#f6f4f0',
  backgroundColor2: '#ebe7e0',
  backgroundColor3: '#e0dbd2',
  textColor: '#2d2d2a',
  mutedColor: '#5c5c57',
  accentColor: '#5a7a6e',
  cardBg1: 'rgba(255, 255, 255, 0.85)',
  cardBg2: 'rgba(246, 244, 240, 0.9)',
}

/** CSS-Variablen für ök2 (für Setzung auf einem Wrapper-Element) */
export function getOk2ThemeCssVars(): Record<string, string> {
  return {
    '--k2-bg-1': OK2_THEME.backgroundColor1,
    '--k2-bg-2': OK2_THEME.backgroundColor2,
    '--k2-bg-3': OK2_THEME.backgroundColor3,
    '--k2-text': OK2_THEME.textColor,
    '--k2-muted': OK2_THEME.mutedColor,
    '--k2-accent': OK2_THEME.accentColor,
    '--k2-card-bg-1': OK2_THEME.cardBg1,
    '--k2-card-bg-2': OK2_THEME.cardBg2,
  }
}
