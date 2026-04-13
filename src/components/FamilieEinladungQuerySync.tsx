/**
 * Verarbeitet ?t= (Tenant) und ?z= (Zugangsnummer) für alle K2-Familie-Routen im Layout.
 * Vorher nur auf „Meine Familie“ – ein Scan auf /einstieg oder nach Index-Redirect landete ohne Umschalten.
 */

import { useLayoutEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { loadEinstellungen, saveEinstellungen } from '../utils/familieStorage'

export function FamilieEinladungQuerySync() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { currentTenantId, tenantList, setCurrentTenantId, ensureTenantInListAndSelect } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannInstanz = capabilities.canManageFamilienInstanz

  useLayoutEffect(() => {
    const t = searchParams.get('t')?.trim()
    const z = searchParams.get('z')?.trim()
    if (!t && !z) return

    const strip = () => {
      const next = new URLSearchParams(searchParams)
      next.delete('t')
      next.delete('z')
      next.delete('v')
      next.delete('_')
      setSearchParams(next, { replace: true })
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
      strip()
      return
    }
    if (!t && z) {
      if (kannInstanz) {
        const einst = loadEinstellungen(currentTenantId)
        saveEinstellungen(currentTenantId, { ...einst, mitgliedsNummerAdmin: z })
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
    kannInstanz,
  ])

  return null
}
