/**
 * Farblinie Absolvent:in – klar getrennt von der Akademie (Gold/Violett).
 * Teal/Petrol: persönlicher Auftritt, ruhig, eigenständig.
 * Schrift wie Akademie (Montserrat) – nur Farbe unterscheidet die Rolle.
 */

import { YOGA_FONT, YOGA_FONT_HREF } from './yogaAkademieMarke'

/** Hauptfarbe – Petrol/Teal */
export const YOGA_ABSOLVENT_TEAL = '#0D6E6E'
export const YOGA_ABSOLVENT_TEAL_SOFT = '#B5D9D4'
export const YOGA_ABSOLVENT_TEAL_DARK = '#0A4A4A'

/** Akzent für Überschriften / aktive Chips */
export const YOGA_ABSOLVENT_INK = '#14353A'

export const YOGA_ABSOLVENT_BG = '#F1F6F5'
export const YOGA_ABSOLVENT_BG_CARD = '#FAFDFC'
export const YOGA_ABSOLVENT_TEXT = '#1a2221'
export const YOGA_ABSOLVENT_MUTED = '#4F6360'

export const YOGA_ABSOLVENT_MARKE = {
  /** Alias: primary = teal (entspricht gold bei Akademie) */
  teal: YOGA_ABSOLVENT_TEAL,
  tealSoft: YOGA_ABSOLVENT_TEAL_SOFT,
  tealDark: YOGA_ABSOLVENT_TEAL_DARK,
  ink: YOGA_ABSOLVENT_INK,
  /** Kompatibel zu Stellen die .gold / .violett erwarten – Absolvent-Mapping */
  gold: YOGA_ABSOLVENT_TEAL,
  goldSoft: YOGA_ABSOLVENT_TEAL_SOFT,
  goldDark: YOGA_ABSOLVENT_TEAL_DARK,
  violett: YOGA_ABSOLVENT_INK,
  violettSoft: '#1F4A50',
  bg: YOGA_ABSOLVENT_BG,
  bgCard: YOGA_ABSOLVENT_BG_CARD,
  text: YOGA_ABSOLVENT_TEXT,
  muted: YOGA_ABSOLVENT_MUTED,
  font: YOGA_FONT,
  slogan: 'Mein Auftritt im Netz',
  linieName: 'Absolvent:in',
} as const

export { YOGA_FONT_HREF as YOGA_ABSOLVENT_FONT_HREF }
