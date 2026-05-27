/**
 * ═══════════════════════════════════════════════════════════════════════════
 * K2 Familie – Musterfamilie Huber: EINE Quelle
 * (Mandanten-ID + Hero-/Karten-Bilder + kanonische Pfade mit ?t=)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * End-to-End (kein „Ratespiel“ – dieselbe Kette überall):
 *
 * 1) Einstieg per Link, z. B.:
 *    – `/projects/k2-familie/meine-familie?t=huber`  →  `getMusterfamilieHuberMeineFamiliePathWithQuery()`
 *    – `/projects/k2-familie/einstieg?t=huber`     →  `getMusterfamilieHuberEinstiegPathWithQuery()`
 * 2) `FamilieTenantContext` + Sync-Komponenten: Query `t` setzt `currentTenantId === FAMILIE_HUBER_TENANT_ID`.
 * 3) `ensureMusterfamilieHuberDemoBereit()` (= Demo-Sitzung + `seedFamilieHuber()`): Stammdaten + **FAMILIE_HUBER_DEFAULT_PAGE_CONTENT** per
 *    `setFamilyPageContent` → `k2-familie-huber-page-content` (localStorage).
 * 4) Ohne Speicher: `getFamilyPageContent('huber')` = FAMILIE_HUBER_DEFAULT_PAGE_CONTENT; **andere** Mandanten = kein
 *    Default-Willkommensbild (Huber-PNGs enthalten Muster-Marketing im Bild).
 *    **Hinweis:** `pm-deckblatt-…` ist der **Voll-Startseiten-Screenshot** inkl. Kacheln (nur Präsentationsmappe) –
 *    **nicht** als Live-Willkommensbild: sonst doppelte Schichten mit der echten UI darunter.
 *
 * Nur diese Datei pflegen: keine zweiten String-Kopien für `huber` / dieselben Asset-Pfade.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { PROJECT_ROUTES } from '../config/navigation'
import { seedFamilieHuber } from './familieHuberMuster'
import { isFamilieNurMusterSession, setFamilieNurMusterSession } from '../utils/familieMusterSession'

const R = PROJECT_ROUTES['k2-familie']

export const FAMILIE_HUBER_TENANT_ID = 'huber' as const

/**
 * Muster-Einstieg B (Route einstieg) – Screenshot mit Marketing-Text „Musterfamilie“.
 * **Nur** Mandant `huber` als Standard-Willkommensbild; echte Familien bekommen kein Default-Foto (nur Verlauf),
 * sonst wirkt das Huber-Marketing im Hintergrund unter fremdem Namen.
 */
export const FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO = '/img/k2-familie/pm-familie-einstieg.png' as const

/**
 * Voll-Startseiten-Screenshot (Nav + Hero + Kacheln) – **nur** Präsentationsmappe / A4, nicht `meine-familie`-Hero
 * (sonst zwei Schichten: PNG + echte Kacheln).
 */
export const K2_FAMILIE_DECKBLATT_HOME_PNG = '/img/k2-familie/pm-deckblatt-musterfamilie-home.png' as const

/** Repo-Assets – identisch in Seed & Lese-Fallback; funktionieren ohne externes Netz. */
export const FAMILIE_HUBER_DEFAULT_PAGE_CONTENT: Readonly<{
  welcomeImage: string
  cardImage: string
}> = {
  welcomeImage: FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO,
  cardImage: '/img/k2-familie/pm-familiengrafik-huber.png',
}

/** Muster-Demo: „Meine Familie“ mit Mandanten-Query (Umschauen). */
export function getMusterfamilieHuberMeineFamiliePathWithQuery(): string {
  return `${R.meineFamilie}?t=${FAMILIE_HUBER_TENANT_ID}`
}

/** Muster-Demo: Einstiegs-Seite mit Mandanten-Query (Flyer/QR/Mappe). */
export function getMusterfamilieHuberEinstiegPathWithQuery(): string {
  return `${R.einstieg}?t=${FAMILIE_HUBER_TENANT_ID}`
}

/**
 * Marketing/Flyer/Ads mit `?t=huber`: Demo-Sitzung + Seed (Stammdaten, „Du“, Hero).
 * Eine Quelle – Aufrufer: FamilieEinladungQuerySync, FamilieApfMeineFamilieSync.
 */
export function ensureMusterfamilieHuberDemoBereit(): boolean {
  setFamilieNurMusterSession(true)
  return seedFamilieHuber()
}

/** Ads/Flyer `?t=huber` oder aktive Huber-Demo-Sitzung – kein persönlicher Code-Zugang. */
export function isHuberMusterDemoAktiv(locationSearch: string, tenantId: string): boolean {
  const t = new URLSearchParams(locationSearch || '').get('t')?.trim().toLowerCase()
  return (
    t === FAMILIE_HUBER_TENANT_ID ||
    (tenantId === FAMILIE_HUBER_TENANT_ID && isFamilieNurMusterSession())
  )
}
