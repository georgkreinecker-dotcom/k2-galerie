/**
 * K2 Familie – effektive Rechte: Rolle (Arbeitsmodell) + Identität (persönlicher Code / „Du“).
 * Wenn auf der eigenen Karte ein Code steht, gilt die Sitzung als bestätigt nur nach
 * erfolgreicher Code-Eingabe oder vertrauenswürdiger „Du“-Setzung durch Inhaber:in.
 */

import type { K2FamilieEinstellungen, K2FamiliePerson } from '../types/k2Familie'
import type { FamilieRollenCapabilities, K2FamilieRolle } from '../types/k2FamilieRollen'
import { getFamilieRollenCapabilities } from '../types/k2FamilieRollen'
import { trimMitgliedsNummerEingabe } from './familieMitgliedsNummer'
import { loadIdentitaetBestaetigt } from './familieIdentitaetStorage'

/**
 * Lokale Rollenwahl vs. festgelegte Inhaber:in in den Familien-Daten.
 * Ohne „Du“ wird nicht eingegriffen (Erst-Einrichtung).
 */
export function getEffectiveRolleForFamilieDaten(
  rolle: K2FamilieRolle,
  einst: K2FamilieEinstellungen,
  personen: K2FamiliePerson[],
  ichBinPersonId: string | undefined,
): K2FamilieRolle {
  const ich = ichBinPersonId?.trim()
  if (!ich) return rolle
  const designated = einst.inhaberPersonId?.trim()
  if (!designated) return rolle
  if (!personen.some((p) => p.id === designated)) return rolle
  if (rolle === 'inhaber' && ich !== designated) {
    return 'bearbeiter'
  }
  return rolle
}

/** Keine Schreib-Rechte (nur Ansehen), alle Flags aus. */
function capabilitiesNurLesen(rolle: K2FamilieRolle): FamilieRollenCapabilities {
  return {
    rolle,
    canView: true,
    canEditFamiliendaten: false,
    canEditEigenesProfil: false,
    canEditStrukturUndStammdaten: false,
    canEditOrganisches: false,
    canExportSicherung: false,
    canRestoreSicherung: false,
    canManageFamilienInstanz: false,
  }
}

/**
 * Effektive Berechtigungen für die aktuelle Sitzung.
 *
 * - Ohne „Du“: nur Inhaber:in darf Erst-Einrichtung (Struktur + Instanz); Leser/Bearbeiter nur lesen.
 * - Mit „Du“ und Code auf der Karte: Schreib-Rechte der Rolle nur, wenn die Sitzung die Identität bestätigt hat.
 * - Mit „Du“ ohne Code auf der Karte: Rolle gilt (Einrichtungsphase bis Codes vergeben sind).
 */
export function getFamilieEffectiveCapabilities(
  rolle: K2FamilieRolle,
  tenantId: string,
  einst: K2FamilieEinstellungen,
  personen: K2FamiliePerson[],
): FamilieRollenCapabilities {
  const ich = einst.ichBinPersonId?.trim()
  const effectiveRolle = getEffectiveRolleForFamilieDaten(rolle, einst, personen, ich)
  const base = getFamilieRollenCapabilities(effectiveRolle)

  if (!ich) {
    if (effectiveRolle === 'inhaber') {
      return base
    }
    return capabilitiesNurLesen(effectiveRolle)
  }

  const ichPerson = personen.find((p) => p.id === ich)
  const codeAufKarte = ichPerson ? trimMitgliedsNummerEingabe(ichPerson.mitgliedsNummer) : ''

  if (!codeAufKarte) {
    return base
  }

  const sessionPid = loadIdentitaetBestaetigt(tenantId)
  if (sessionPid !== ich) {
    return capabilitiesNurLesen(effectiveRolle)
  }

  return base
}
