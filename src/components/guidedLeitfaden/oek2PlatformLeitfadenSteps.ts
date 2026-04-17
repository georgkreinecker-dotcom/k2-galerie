/**
 * Ein durchgängiger ök2-Plattform-Rundgang: Demo-Galerie → Admin (keine zwei getrennten Touren).
 */

import { buildOek2AdminLeitfadenSchritte } from './oek2AdminLeitfadenSteps'
import { buildOek2GalerieLeitfadenSchritte } from './oek2GalerieLeitfadenSteps'

export type Oek2PlatformLeitfadenStep = {
  id: string
  titel: string
  stimmung?: string
  text: string
  focusKey?: string
  /** Galerie-Route vs. Admin – Host steuert Navigation */
  phase: 'galerie' | 'admin'
}

export function buildOek2PlatformLeitfadenSchritte(name: string): Oek2PlatformLeitfadenStep[] {
  const gal = buildOek2GalerieLeitfadenSchritte(name)
    .filter((s) => s.id !== 'fertig')
    .map((s) => ({ ...s, phase: 'galerie' as const }))

  const wechsel: Oek2PlatformLeitfadenStep = {
    id: 'wechsel-admin',
    phase: 'galerie',
    titel: 'Weiter in die Demo-Zentrale',
    stimmung: 'Derselbe Rundgang',
    text:
      '**Als Nächstes:** der **Admin** – dort pflegst du Werke, Gestaltung, Kassa und Events in der **Muster-Galerie**.\n\n' +
      '**Weiter** bringt dich zur Übersicht **„Was möchtest du heute tun?“** (gleicher Rundgang, neuer Bereich).',
  }

  const admin = buildOek2AdminLeitfadenSchritte(name)
    .filter((s) => s.id !== 'begruessung')
    .map((s) => ({ ...s, phase: 'admin' as const }))

  return [...gal, wechsel, ...admin]
}

/** Anzahl Schritte nur Galerie (ohne Wechsel), für Tests / Debug */
export function oek2PlatformGalerieSchrittCount(): number {
  return buildOek2GalerieLeitfadenSchritte('x').filter((s) => s.id !== 'fertig').length
}
