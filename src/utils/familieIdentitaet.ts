/**
 * K2 Familie – effektive Rechte: Rolle (Arbeitsmodell) + Identität (persönlicher Code / „Du“).
 * Wenn auf der eigenen Karte ein Code steht, gilt die Sitzung als bestätigt nur nach
 * erfolgreicher Code-Eingabe oder vertrauenswürdiger „Du“-Setzung durch Inhaber:in.
 */

import type { K2FamilieEinstellungen, K2FamiliePerson } from '../types/k2Familie'
import type {
  FamilieRollenCapabilities,
  K2FamilieInhaberArbeitsansicht,
  K2FamilieRolle,
} from '../types/k2FamilieRollen'
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

function metaInhaberAnsicht(
  rolle: K2FamilieRolle,
  effectiveRolle: K2FamilieRolle,
  inhaberArbeitsansicht: K2FamilieInhaberArbeitsansicht,
): Pick<FamilieRollenCapabilities, 'rolleGewaehlt' | 'inhaberArbeitsansicht'> {
  return {
    rolleGewaehlt: rolle,
    inhaberArbeitsansicht:
      effectiveRolle === 'inhaber' && rolle === 'inhaber' ? inhaberArbeitsansicht : null,
  }
}

function mergeCaps(
  c: FamilieRollenCapabilities,
  rolle: K2FamilieRolle,
  effectiveRolle: K2FamilieRolle,
  inhaberArbeitsansicht: K2FamilieInhaberArbeitsansicht,
): FamilieRollenCapabilities {
  return {
    ...c,
    ...metaInhaberAnsicht(rolle, effectiveRolle, inhaberArbeitsansicht),
  }
}

/**
 * Effektive Berechtigungen für die aktuelle Sitzung.
 *
 * - Ohne „Du“: nur Inhaber:in darf Erst-Einrichtung (Struktur + Instanz); Leser/Bearbeiter nur lesen.
 * - Mit „Du“ und Code auf der Karte: Schreib-Rechte der Rolle nur, wenn die Sitzung die Identität bestätigt hat.
 * - Mit „Du“ ohne Code auf der Karte: Rolle gilt (Einrichtungsphase bis Codes vergeben sind).
 * - **Inhaber:in + Arbeitsansicht** (mit „Du“): Rechte wie Bearbeiter:in oder Leser:in, Rolle im Speicher bleibt Inhaber:in.
 */
export function getFamilieEffectiveCapabilities(
  rolle: K2FamilieRolle,
  tenantId: string,
  einst: K2FamilieEinstellungen,
  personen: K2FamiliePerson[],
  inhaberArbeitsansicht: K2FamilieInhaberArbeitsansicht = 'voll',
): FamilieRollenCapabilities {
  const ich = einst.ichBinPersonId?.trim()
  const effectiveRolle = getEffectiveRolleForFamilieDaten(rolle, einst, personen, ich)

  /** Erst-Einrichtung ohne „Du“: volle Inhaber-Rechte; Arbeitsansicht erst mit „Du“ wirksam. */
  if (!ich) {
    if (effectiveRolle === 'inhaber') {
      return mergeCaps(getFamilieRollenCapabilities('inhaber'), rolle, effectiveRolle, inhaberArbeitsansicht)
    }
    return mergeCaps(capabilitiesNurLesen(effectiveRolle), rolle, effectiveRolle, inhaberArbeitsansicht)
  }

  const inhaberAnsichtWirksam =
    effectiveRolle === 'inhaber' && rolle === 'inhaber' && inhaberArbeitsansicht !== 'voll'

  const rolleForCaps: K2FamilieRolle = inhaberAnsichtWirksam ? inhaberArbeitsansicht : effectiveRolle

  const ichPerson = personen.find((p) => p.id === ich)
  const codeAufKarte = ichPerson ? trimMitgliedsNummerEingabe(ichPerson.mitgliedsNummer) : ''

  if (!codeAufKarte) {
    return mergeCaps(getFamilieRollenCapabilities(rolleForCaps), rolle, effectiveRolle, inhaberArbeitsansicht)
  }

  const sessionPid = loadIdentitaetBestaetigt(tenantId)
  if (sessionPid !== ich) {
    return mergeCaps(capabilitiesNurLesen(rolleForCaps), rolle, effectiveRolle, inhaberArbeitsansicht)
  }

  return mergeCaps(getFamilieRollenCapabilities(rolleForCaps), rolle, effectiveRolle, inhaberArbeitsansicht)
}

/**
 * Volle Oberfläche (Navigation, Familienwahl, Muster, Kacheln) ausblenden: Erst-Anmeldung als Mitglied
 * (Leser/Bearbeiter), bis „Du“ feststeht und die Sitzung den persönlichen Code bestätigt hat.
 * Inhaber:in bei Erst-Einrichtung behält die volle Oberfläche (Familie anlegen, Zugang, …).
 */
export function isK2FamilieNurMitgliedEinstiegModus(
  rolle: K2FamilieRolle,
  tenantId: string,
  einst: K2FamilieEinstellungen,
  personen: K2FamiliePerson[],
): boolean {
  if (rolle === 'inhaber') return false
  const ich = einst.ichBinPersonId?.trim()
  if (!ich) return true
  const code = trimMitgliedsNummerEingabe(personen.find((p) => p.id === ich)?.mitgliedsNummer ?? '')
  if (!code) return false
  return loadIdentitaetBestaetigt(tenantId) !== ich
}
