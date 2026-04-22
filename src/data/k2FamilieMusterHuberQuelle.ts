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
 *    aus FAMILIE_HUBER_DEFAULT_PAGE_CONTENT.
 *
 * Nur diese Datei pflegen: keine zweiten String-Kopien für `huber` / dieselben Picsum-URLs.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { PROJECT_ROUTES } from '../config/navigation'

const R = PROJECT_ROUTES['k2-familie']

export const FAMILIE_HUBER_TENANT_ID = 'huber' as const

/** Picsum mit festen Seeds – identisch in Seed & Lese-Fallback. */
export const FAMILIE_HUBER_DEFAULT_PAGE_CONTENT: Readonly<{
  welcomeImage: string
  cardImage: string
}> = {
  welcomeImage: 'https://picsum.photos/seed/huber-family/1200/500',
  cardImage: 'https://picsum.photos/seed/huber-card/800/400',
}

/** Muster-Demo: „Meine Familie“ mit Mandanten-Query (Umschauen). */
export function getMusterfamilieHuberMeineFamiliePathWithQuery(): string {
  return `${R.meineFamilie}?t=${FAMILIE_HUBER_TENANT_ID}`
}

/** Muster-Demo: Einstiegs-Seite mit Mandanten-Query (Flyer/QR/Mappe). */
export function getMusterfamilieHuberEinstiegPathWithQuery(): string {
  return `${R.einstieg}?t=${FAMILIE_HUBER_TENANT_ID}`
}
