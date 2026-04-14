/**
 * K2 Familie – Arbeitsansicht nur für die Rolle Inhaber:in (lokal pro Familie).
 * Ermöglicht „wie Bearbeiter:in“ oder „wie Leser:in“ ohne die gewählte Rolle zu wechseln.
 */

import type { K2FamilieInhaberArbeitsansicht } from '../types/k2FamilieRollen'

const PREFIX = 'k2-familie-inhaber-ansicht-'

function isValid(s: string | null): s is K2FamilieInhaberArbeitsansicht {
  return s === 'voll' || s === 'bearbeiter' || s === 'leser'
}

export function loadInhaberArbeitsansichtForTenant(tenantId: string): K2FamilieInhaberArbeitsansicht {
  try {
    const raw = localStorage.getItem(PREFIX + tenantId)
    if (raw && isValid(raw)) return raw
  } catch {
    /* ignore */
  }
  return 'voll'
}

export function saveInhaberArbeitsansichtForTenant(tenantId: string, ansicht: K2FamilieInhaberArbeitsansicht): void {
  try {
    localStorage.setItem(PREFIX + tenantId, ansicht)
  } catch (e) {
    console.error('familieInhaberAnsichtStorage: speichern fehlgeschlagen', e)
  }
}
