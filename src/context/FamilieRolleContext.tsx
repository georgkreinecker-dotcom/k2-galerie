import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { FamilieRollenCapabilities, K2FamilieRolle } from '../types/k2FamilieRollen'
import { getFamilieRollenCapabilities } from '../types/k2FamilieRollen'
import { loadFamilieRolleForTenant, saveFamilieRolleForTenant } from '../utils/familieRollenStorage'
import { useFamilieTenant } from './FamilieTenantContext'

type FamilieRolleContextValue = {
  rolle: K2FamilieRolle
  setRolle: (r: K2FamilieRolle) => void
  capabilities: FamilieRollenCapabilities
}

const FamilieRolleContext = createContext<FamilieRolleContextValue | null>(null)

export function FamilieRolleProvider({ children }: { children: React.ReactNode }) {
  const { currentTenantId } = useFamilieTenant()
  const [rolle, setRolleState] = useState<K2FamilieRolle>(() =>
    loadFamilieRolleForTenant(currentTenantId)
  )

  React.useEffect(() => {
    setRolleState(loadFamilieRolleForTenant(currentTenantId))
  }, [currentTenantId])

  const setRolle = useCallback(
    (r: K2FamilieRolle) => {
      setRolleState(r)
      saveFamilieRolleForTenant(currentTenantId, r)
    },
    [currentTenantId]
  )

  const capabilities = useMemo(() => getFamilieRollenCapabilities(rolle), [rolle])

  const value = useMemo(
    () => ({ rolle, setRolle, capabilities }),
    [rolle, setRolle, capabilities]
  )

  return <FamilieRolleContext.Provider value={value}>{children}</FamilieRolleContext.Provider>
}

export function useFamilieRolle(): FamilieRolleContextValue {
  const ctx = useContext(FamilieRolleContext)
  if (!ctx) {
    throw new Error('useFamilieRolle muss innerhalb von FamilieRolleProvider verwendet werden')
  }
  return ctx
}
