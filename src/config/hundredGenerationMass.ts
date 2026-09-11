/**
 * Maßangaben für 100 Generationen – Keramikobjekte.
 * Maximale Höhe der Serie: 50 cm (Werkstatt-Grenze).
 * Maße = geplante Endgröße (Schätzung aus Entwurfsproporitionen).
 */

import type { HundredGenerationModellId } from './hundredGenerationEntwuerfe'

/** Harte Grenze für alle Objekte der Serie */
export const HUNDRED_GENERATION_MAX_HOEHE_CM = 50

export type HundredGenerationMass = {
  /** Geplante Höhe in cm – nie über MAX */
  hoeheCm: number
  /** Breite (Vorne) in cm */
  breiteCm: number
  /** Tiefe (Seite) in cm */
  tiefeCm: number
  /** Silhouette für Maßskizze */
  silhouette: 'masse' | 'axt' | 'stele' | 'facette' | 'gruppe' | 'tuerme' | 'segel' | 'kelch' | 'ast' | 'zickzack' | 'spirale' | 'kopf'
}

/** Alle Maße ≤ 50 cm Höhe */
export const HUNDRED_GENERATION_MASS: Record<HundredGenerationModellId, HundredGenerationMass> = {
  chaosgott: { hoeheCm: 42, breiteCm: 38, tiefeCm: 36, silhouette: 'masse' },
  'axt-anker': { hoeheCm: 48, breiteCm: 28, tiefeCm: 22, silhouette: 'axt' },
  metamorphose: { hoeheCm: 50, breiteCm: 18, tiefeCm: 18, silhouette: 'stele' },
  'code-muster': { hoeheCm: 40, breiteCm: 32, tiefeCm: 28, silhouette: 'facette' },
  'drei-elemente': { hoeheCm: 36, breiteCm: 44, tiefeCm: 30, silhouette: 'gruppe' },
  'chaosgott-mythos': { hoeheCm: 44, breiteCm: 36, tiefeCm: 32, silhouette: 'axt' },
  'axt-ritual-mythos': { hoeheCm: 48, breiteCm: 26, tiefeCm: 20, silhouette: 'axt' },
  'metamorphose-mythos': { hoeheCm: 50, breiteCm: 17, tiefeCm: 17, silhouette: 'stele' },
  'code-ahnen-mythos': { hoeheCm: 42, breiteCm: 30, tiefeCm: 26, silhouette: 'facette' },
  'drei-rituale-mythos': { hoeheCm: 38, breiteCm: 42, tiefeCm: 28, silhouette: 'gruppe' },
  'skizze-zwei-tuerme': { hoeheCm: 46, breiteCm: 34, tiefeCm: 28, silhouette: 'tuerme' },
  'skizze-segel': { hoeheCm: 44, breiteCm: 30, tiefeCm: 24, silhouette: 'segel' },
  'skizze-kelch': { hoeheCm: 40, breiteCm: 28, tiefeCm: 26, silhouette: 'kelch' },
  'skizze-astwerk': { hoeheCm: 48, breiteCm: 36, tiefeCm: 30, silhouette: 'ast' },
  'skizze-zickzack': { hoeheCm: 42, breiteCm: 32, tiefeCm: 28, silhouette: 'zickzack' },
  'skizze-spirale': { hoeheCm: 45, breiteCm: 30, tiefeCm: 26, silhouette: 'spirale' },
  'skizze-spirale-kopf': { hoeheCm: 40, breiteCm: 34, tiefeCm: 32, silhouette: 'kopf' },
}

export function getMassForModell(id: HundredGenerationModellId): HundredGenerationMass {
  return HUNDRED_GENERATION_MASS[id]
}

export function formatMassLabel(m: HundredGenerationMass): string {
  return `H ${m.hoeheCm} · B ${m.breiteCm} · T ${m.tiefeCm} cm`
}
