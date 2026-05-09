/**
 * ═══════════════════════════════════════════════════════════════════════════
 * K2 Familie – Kreinecker-Stammbaum: EINE Quelle (Mandant + Kette)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * **End-to-End (kein Raten, dieselbe Kette):**
 *
 * 1) **Build / Vercel** – in `.env` (lokal) bzw. Vercel → Environment (Production):
 *    zuerst `VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID`, sonst
 *    `VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID` (dasselbe `t=…` wie in der Familien-Einladung).
 * 2) **Präsentationsboard** → `k2FamilieUrlWithPresentationTenant` (u. a. `getK2FamilieStammbaumKreineckerPublicUrl`,
 *    `getK2FamilieMeineFamilieMusterHuberPublicUrl` für Muster-Huber + `pm=0&d=0` Live-Reset)
 *    hängt `?t=<id>` an Stammbaum- bzw. Meine-Familie-Pfad.
 * 3) **App** – `?t=` setzt den Mandanten (`FamilieTenantContext`); **Stammbaum**-Seite zeigt die Daten
 *    dieses Mandanten.
 * 4) **Plattform ohne VITE:** `resolveKreineckerPresentationTenantIdFromEnv` liefert
 *    `K2_PLATTFORM_STAMM_FAMILIE_KREINECKER_TENANT_ID` (nur wenn `isPlatformInstance()`).
 * 5) **Sonst APf:** `resolveApfMeineFamilieTenantId` sucht in **localStorage** nach Anzeigename
 *    „kreinecker“ + „stamm“/„alkoven“ oder ersten Nicht-Demo-Mandanten.
 *
 * **Nicht** verwechseln: Musterfamilie **Huber** = `?t=huber` (siehe `k2FamilieMusterHuberQuelle.ts`).
 * Kreinecker = eure Stammfamilie über `t=familie-…` (Einladung) oder VITE.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { isPlatformInstance } from '../config/tenantConfig'
import { tenantIdErlaubtFuerKreineckerStammKette } from '../utils/familieMandantTrennung'

/**
 * **Nur kgm-Plattform** (localhost, k2-galerie.vercel.app, kgm.at, …): technische Mandanten-ID der Stammfamilie Kreinecker
 * – derselbe Wert wie unter Einstellungen („t=familie-…“). Lizenznehmer-Instanzen: `isPlatformInstance()` false → kein Fallback.
 * Übersteuerbar durch `VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID` / `VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID`.
 */
export const K2_PLATTFORM_STAMM_FAMILIE_KREINECKER_TENANT_ID = 'familie-1773759510983'

const ENV_KEYS = [
  'VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID',
  'VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID',
] as const

function firstValidTenantFromEnvValues(rawList: (string | undefined)[]): string {
  for (const raw of rawList) {
    const gate = tenantIdErlaubtFuerKreineckerStammKette(raw)
    if (gate.ok) return gate.id
    if (gate.grund === 'muster_nur_demo') {
      console.warn(
        '[K2-Familie] VITE-Env: „huber“ ist die Muster-ID – für Kreinecker/Stammbaum/Präsentation bitte t=familie-… setzen, nicht die Demo-ID.',
      )
    }
  }
  return ''
}

/**
 * Mandanten-ID aus dem **Build** (Vite-Env), für öffentliche Links + konsistente APf-Auswahl.
 * Reihenfolge fest: zuerst explizit „Stammbaum/Präsentation“, dann gemeinsamer APf-Fallback.
 */
export function resolveKreineckerPresentationTenantIdFromEnv(): string {
  try {
    const fromEnv = firstValidTenantFromEnvValues([
      import.meta.env.VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID,
      import.meta.env.VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID,
    ])
    if (fromEnv) return fromEnv
  } catch {
    /* ignore */
  }
  try {
    if (typeof window !== 'undefined' && isPlatformInstance()) {
      const gate = tenantIdErlaubtFuerKreineckerStammKette(K2_PLATTFORM_STAMM_FAMILIE_KREINECKER_TENANT_ID)
      if (gate.ok) return gate.id
    }
  } catch {
    /* ignore */
  }
  return ''
}

/** Präsentationsboard: ob mindestens eine der beiden VITE-Variablen einen gültigen Mandanten liefert. */
export function hasKreineckerStammbaumTenantInBuildEnv(): boolean {
  return resolveKreineckerPresentationTenantIdFromEnv() !== ''
}

/** Dokumentation: welche Env-Keys zur Quelle gehören (Doku, keine Laufzeit-Logik). */
export const KREINECKER_FAMILIE_TENANT_ENV_KEY_ORDER = ENV_KEYS
