/**
 * Ein durchgängiger VK2-Plattform-Rundgang: Vereinsgalerie → Admin (keine zwei getrennten Touren).
 */

import { buildVk2AdminLeitfadenSchritte } from './vk2AdminLeitfadenSteps'
import { buildVk2GalerieLeitfadenSchritte } from './vk2GalerieLeitfadenSteps'

export type Vk2PlatformLeitfadenStep = {
  id: string
  titel: string
  stimmung?: string
  text: string
  focusKey?: string
  /** Galerie-Route vs. Admin – Host steuert Navigation */
  phase: 'galerie' | 'admin'
}

export function buildVk2PlatformLeitfadenSchritte(name: string): Vk2PlatformLeitfadenStep[] {
  const gal = buildVk2GalerieLeitfadenSchritte(name)
    .filter((s) => s.id !== 'fertig')
    .map((s) => ({ ...s, phase: 'galerie' as const }))

  const wechsel: Vk2PlatformLeitfadenStep = {
    id: 'wechsel-admin',
    phase: 'galerie',
    titel: 'Weiter zum Verwaltungsbereich',
    stimmung: 'Derselbe Rundgang',
    text:
      '**Als Nächstes:** der **Admin** – dort pflegt der Verein Mitglieder, Gestaltung, Werkkatalog und Events.\n\n' +
      '**Weiter** bringt dich zur Übersicht **„Was möchtest du heute tun?“** (gleicher Rundgang, neuer Bereich).',
  }

  const admin = buildVk2AdminLeitfadenSchritte(name)
    .filter((s) => s.id !== 'begruessung')
    .map((s) => ({ ...s, phase: 'admin' as const }))

  return [...gal, wechsel, ...admin]
}

/** Anzahl Schritte nur Galerie (ohne Wechsel), für Tests / Debug */
export function vk2PlatformGalerieSchrittCount(): number {
  return buildVk2GalerieLeitfadenSchritte('x').filter((s) => s.id !== 'fertig').length
}
