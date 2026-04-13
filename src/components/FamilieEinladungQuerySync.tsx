/**
 * Verarbeitet ?t= (Tenant), ?z= (Familien-Zugangsnummer) und ?m= (persönliche Mitgliedsnummer) für alle K2-Familie-Routen im Layout.
 * Vorher nur auf „Meine Familie“ – ein Scan auf /einstieg oder nach Index-Redirect landete ohne Umschalten.
 */

import { useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { K2_FAMILIE_SESSION_UPDATED, loadEinstellungen, loadPersonen, saveEinstellungen } from '../utils/familieStorage'
import { setIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import { findPersonIdByMitgliedsNummer } from '../utils/familieMitgliedsNummer'

/** @deprecated Namensgleich mit Event-String; nutze K2_FAMILIE_SESSION_UPDATED aus familieStorage. */
export const K2_FAMILIE_EINSTELLUNGEN_UPDATED = K2_FAMILIE_SESSION_UPDATED

export function FamilieEinladungQuerySync() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentTenantId, tenantList, setCurrentTenantId, ensureTenantInListAndSelect } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannInstanz = capabilities.canManageFamilienInstanz

  useLayoutEffect(() => {
    const t = searchParams.get('t')?.trim()
    const z = searchParams.get('z')?.trim()
    const m = searchParams.get('m')?.trim()
    if (!t && !z && !m) return

    const strip = () => {
      const next = new URLSearchParams(searchParams)
      next.delete('t')
      next.delete('z')
      next.delete('m')
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
      if (z && kannInstanz) {
        const einst = loadEinstellungen(t)
        saveEinstellungen(t, { ...einst, mitgliedsNummerAdmin: z })
      }
      applyPersoenlicheMitgliedsNummer(t, m)
      strip()
      return
    }
    if (!t && z) {
      if (kannInstanz) {
        const einst = loadEinstellungen(currentTenantId)
        saveEinstellungen(currentTenantId, { ...einst, mitgliedsNummerAdmin: z })
      }
      applyPersoenlicheMitgliedsNummer(currentTenantId, m)
      strip()
      return
    }
    if (!t && !z && m) {
      applyPersoenlicheMitgliedsNummer(currentTenantId, m)
      strip()
    }
  }, [
    searchParams,
    tenantList,
    setCurrentTenantId,
    ensureTenantInListAndSelect,
    setSearchParams,
    currentTenantId,
    kannInstanz,
  ])

  return null
}
