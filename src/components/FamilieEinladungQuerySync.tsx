/**
 * Verarbeitet ?t= (Tenant), ?z= (Familien-Zugangsnummer), ?m= (persönliche Mitgliedsnummer)
 * und optional ?fn= (Familien-Anzeigename für Empfänger:innen ohne eure localStorage-Daten).
 * Vorher nur auf „Meine Familie“ – ein Scan auf /einstieg oder nach Index-Redirect landete ohne Umschalten.
 */

import { useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { K2_FAMILIE_SESSION_UPDATED, loadEinstellungen, loadPersonen, saveEinstellungen } from '../utils/familieStorage'
import { setIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import { findPersonIdByMitgliedsNummer } from '../utils/familieMitgliedsNummer'

/** @deprecated Namensgleich mit Event-String; nutze K2_FAMILIE_SESSION_UPDATED aus familieStorage. */
export const K2_FAMILIE_EINSTELLUNGEN_UPDATED = K2_FAMILIE_SESSION_UPDATED

export function FamilieEinladungQuerySync() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentTenantId, tenantList, setCurrentTenantId, ensureTenantInListAndSelect } = useFamilieTenant()
  useLayoutEffect(() => {
    const tRaw = searchParams.get('t')?.trim()
    /** Gleiche Schreibweise wie in Keys (u. a. UUID aus Einladung in Kleinbuchstaben). */
    const t = tRaw ? tRaw.toLowerCase() : undefined
    const z = searchParams.get('z')?.trim()
    const m = searchParams.get('m')?.trim()
    /** Kurz: Anzeigename mitschicken, damit Gäste nicht „Neue Familie …“ sehen (kein gemeinsamer Speicher). */
    const fnRaw = searchParams.get('fn')?.trim()
    const fn = fnRaw ? fnRaw.slice(0, 240) : ''
    if (!t && !z && !m && !fn) return

    const strip = () => {
      const next = new URLSearchParams(searchParams)
      next.delete('t')
      next.delete('z')
      next.delete('m')
      next.delete('fn')
      next.delete('v')
      next.delete('_')
      setSearchParams(next, { replace: true })
    }

    const applyPersoenlicheMitgliedsNummer = (tenantId: string, mParam: string | undefined) => {
      if (!mParam) return
      const personen = loadPersonen(tenantId)
      const pid = findPersonIdByMitgliedsNummer(personen, mParam)
      if (!pid) return
      const einst = loadEinstellungen(tenantId)
      if (saveEinstellungen(tenantId, { ...einst, ichBinPersonId: pid })) {
        setIdentitaetBestaetigt(tenantId, pid)
      }
    }

    if (t) {
      let switched: boolean
      if (tenantList.includes(t)) {
        setCurrentTenantId(t)
        switched = true
      } else {
        switched = ensureTenantInListAndSelect(t)
      }
      if (!switched) {
        strip()
        return
      }
      /** Einladung: `z` gilt für alle (Gäste brauchen die Nummer im Speicher, nicht nur Inhaber:innen). */
      if (z) {
        const einst = loadEinstellungen(t)
        saveEinstellungen(t, { ...einst, mitgliedsNummerAdmin: z })
      }
      if (fn) {
        const einst = loadEinstellungen(t)
        if (!einst.familyDisplayName?.trim()) {
          saveEinstellungen(t, { ...einst, familyDisplayName: fn })
        }
      }
      applyPersoenlicheMitgliedsNummer(t, m)
      strip()
      return
    }
    if (!t && z) {
      const einst = loadEinstellungen(currentTenantId)
      saveEinstellungen(currentTenantId, { ...einst, mitgliedsNummerAdmin: z })
      if (fn) {
        const e2 = loadEinstellungen(currentTenantId)
        if (!e2.familyDisplayName?.trim()) {
          saveEinstellungen(currentTenantId, { ...e2, familyDisplayName: fn })
        }
      }
      applyPersoenlicheMitgliedsNummer(currentTenantId, m)
      strip()
      return
    }
    if (!t && !z && m) {
      applyPersoenlicheMitgliedsNummer(currentTenantId, m)
      strip()
      return
    }
    if (!t && !z && !m && fn) {
      const einst = loadEinstellungen(currentTenantId)
      if (!einst.familyDisplayName?.trim()) {
        saveEinstellungen(currentTenantId, { ...einst, familyDisplayName: fn })
      }
      strip()
    }
  }, [
    searchParams,
    tenantList,
    setCurrentTenantId,
    ensureTenantInListAndSelect,
    setSearchParams,
    currentTenantId,
  ])

  return null
}
