/**
 * Erzwingt Mandant „huber“, solange die Sitzung als „nur Musterfamilie“ markiert ist
 * (Einstieg über Willkommen / Musterfamilie-Einstieg).
 */

import { useLayoutEffect } from 'react'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'
import { isFamilieNurMusterSession } from '../utils/familieMusterSession'

export function FamilieMusterSessionEnforcer() {
  const { currentTenantId, ensureTenantInListAndSelect } = useFamilieTenant()
  useLayoutEffect(() => {
    if (!isFamilieNurMusterSession()) return
    if (currentTenantId === FAMILIE_HUBER_TENANT_ID) return
    ensureTenantInListAndSelect(FAMILIE_HUBER_TENANT_ID)
  }, [currentTenantId, ensureTenantInListAndSelect])
  return null
}
