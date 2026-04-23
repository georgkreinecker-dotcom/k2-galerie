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
 * 3) `seedFamilieHuber()`: schreibt Stammdaten + **FAMILIE_HUBER_DEFAULT_PAGE_CONTENT** per
 *    `setFamilyPageContent` → `k2-familie-huber-page-content` (localStorage).
 * 4) Ohne Speicher (Vercel, neues Gerät): `getFamilyPageContent` liefert **dieselben** Bild-URLs
 *    aus FAMILIE_HUBER_DEFAULT_PAGE_CONTENT (stabile Pfade unter /img/k2-familie/, kein Picsum).
 *
 * Nur diese Datei pflegen: keine zweiten String-Kopien für `huber` / dieselben Asset-Pfade.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { PROJECT_ROUTES } from '../config/navigation'

const R = PROJECT_ROUTES['k2-familie']

export const FAMILIE_HUBER_TENANT_ID = 'huber' as const

/** Wenn für einen Mandanten noch keine Homepage-Gestaltung im Speicher steht: ein sichtbares Hero (Kreinecker, Pilot, …). */
export const K2_FAMILIE_DEFAULT_WELCOME_IMAGE = '/img/k2-familie/pm-deckblatt-musterfamilie-home.png' as const

/** Muster-Einstieg B (Route einstieg): Hero, wenn kein k2-familie-huber-einstieg-content. */
export const FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO = '/img/k2-familie/pm-familie-einstieg.png' as const

/** Repo-Assets – identisch in Seed & Lese-Fallback; funktionieren ohne externes Netz. */
export const FAMILIE_HUBER_DEFAULT_PAGE_CONTENT: Readonly<{
  welcomeImage: string
  cardImage: string
}> = {
  welcomeImage: K2_FAMILIE_DEFAULT_WELCOME_IMAGE,
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
