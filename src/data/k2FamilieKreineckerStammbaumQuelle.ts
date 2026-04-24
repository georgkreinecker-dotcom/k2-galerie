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
 * 4) **Nur APf (localhost)**, wenn **kein** `t` in der URL und **keine** der beiden VITE-Variablen:
 *    `resolveApfMeineFamilieTenantId` in `k2FamilieApfDefaults` sucht in **localStorage** nach
 *    `familyDisplayName` mit „kreinecker“ + „stamm“ oder „alkoven“ (Fallback auf echte Stammfamilie
 *    ohne harte ID im Build).
 *
 * **Nicht** verwechseln: Musterfamilie **Huber** = `?t=huber` (siehe `k2FamilieMusterHuberQuelle.ts`).
 * Kreinecker = eure Stammfamilie über `t=familie-…` (Einladung) oder VITE.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { tenantIdErlaubtFuerKreineckerStammKette } from '../utils/familieMandantTrennung'

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
    return firstValidTenantFromEnvValues([
      import.meta.env.VITE_K2_FAMILIE_KREINECKER_STAMMBAUM_TENANT_ID,
      import.meta.env.VITE_K2_FAMILIE_APF_MEINE_FAMILIE_TENANT_ID,
    ])
  } catch {
    return ''
  }
}

/** Präsentationsboard: ob mindestens eine der beiden VITE-Variablen einen gültigen Mandanten liefert. */
export function hasKreineckerStammbaumTenantInBuildEnv(): boolean {
  return resolveKreineckerPresentationTenantIdFromEnv() !== ''
}

/** Dokumentation: welche Env-Keys zur Quelle gehören (Doku, keine Laufzeit-Logik). */
export const KREINECKER_FAMILIE_TENANT_ENV_KEY_ORDER = ENV_KEYS
