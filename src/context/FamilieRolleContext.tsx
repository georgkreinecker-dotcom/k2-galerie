import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type {
  FamilieRollenCapabilities,
  K2FamilieInhaberArbeitsansicht,
  K2FamilieRolle,
} from '../types/k2FamilieRollen'
import { loadFamilieRolleForTenant, saveFamilieRolleForTenant } from '../utils/familieRollenStorage'
import {
  loadInhaberArbeitsansichtForTenant,
  saveInhaberArbeitsansichtForTenant,
} from '../utils/familieInhaberAnsichtStorage'
import { K2_FAMILIE_SESSION_UPDATED, loadEinstellungen, loadPersonen } from '../utils/familieStorage'
import { getFamilieEffectiveCapabilities } from '../utils/familieIdentitaet'
import { useFamilieTenant } from './FamilieTenantContext'

type FamilieRolleContextValue = {
  rolle: K2FamilieRolle
  setRolle: (r: K2FamilieRolle) => void
  inhaberArbeitsansicht: K2FamilieInhaberArbeitsansicht
  setInhaberArbeitsansicht: (a: K2FamilieInhaberArbeitsansicht) => void
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

  const [inhaberArbeitsansicht, setInhaberArbeitsansichtState] = useState<K2FamilieInhaberArbeitsansicht>(() =>
    loadInhaberArbeitsansichtForTenant(currentTenantId),
  )

  useEffect(() => {
    setInhaberArbeitsansichtState(loadInhaberArbeitsansichtForTenant(currentTenantId))
  }, [currentTenantId])

  const setInhaberArbeitsansicht = useCallback(
    (a: K2FamilieInhaberArbeitsansicht) => {
      setInhaberArbeitsansichtState(a)
      saveInhaberArbeitsansichtForTenant(currentTenantId, a)
    },
    [currentTenantId],
  )

  const [familieDatenTick, setFamilieDatenTick] = useState(0)
  useEffect(() => {
    const on = () => setFamilieDatenTick((t) => t + 1)
    window.addEventListener(K2_FAMILIE_SESSION_UPDATED, on)
    return () => window.removeEventListener(K2_FAMILIE_SESSION_UPDATED, on)
  }, [])

  const capabilities = useMemo(
    () =>
      getFamilieEffectiveCapabilities(
        rolle,
        currentTenantId,
        loadEinstellungen(currentTenantId),
        loadPersonen(currentTenantId),
        inhaberArbeitsansicht,
      ),
    [rolle, currentTenantId, familieDatenTick, inhaberArbeitsansicht],
  )

  const value = useMemo(
    () => ({ rolle, setRolle, inhaberArbeitsansicht, setInhaberArbeitsansicht, capabilities }),
    [rolle, setRolle, inhaberArbeitsansicht, setInhaberArbeitsansicht, capabilities]
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
