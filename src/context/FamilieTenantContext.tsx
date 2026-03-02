/**
 * K2 Familie – aktueller Tenant (Familie) und Liste (Phase 4.1).
 * Ermöglicht „Familie wechseln“ und „Neue Familie“.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { K2_FAMILIE_DEFAULT_TENANT } from '../utils/familieStorage'

const STORAGE_CURRENT = 'k2-familie-current-tenant'
const STORAGE_LIST = 'k2-familie-tenant-list'

function loadList(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_LIST)
    if (!raw) return [K2_FAMILIE_DEFAULT_TENANT]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [K2_FAMILIE_DEFAULT_TENANT]
  } catch {
    return [K2_FAMILIE_DEFAULT_TENANT]
  }
}

function loadCurrent(): string {
  try {
    const id = sessionStorage.getItem(STORAGE_CURRENT)
    const list = loadList()
    return id && list.includes(id) ? id : list[0] ?? K2_FAMILIE_DEFAULT_TENANT
  } catch {
    return K2_FAMILIE_DEFAULT_TENANT
  }
}

function persistList(list: string[]) {
  try {
    localStorage.setItem(STORAGE_LIST, JSON.stringify(list))
  } catch (e) {
    console.error('FamilieTenant: Liste speichern fehlgeschlagen', e)
  }
}

function persistCurrent(id: string) {
  try {
    sessionStorage.setItem(STORAGE_CURRENT, id)
  } catch (e) {
    console.error('FamilieTenant: aktuellen Tenant speichern fehlgeschlagen', e)
  }
}

type ContextValue = {
  currentTenantId: string
  tenantList: string[]
  setCurrentTenantId: (id: string) => void
  addTenant: () => string
}

const FamilieTenantContext = createContext<ContextValue | null>(null)

export function FamilieTenantProvider({ children }: { children: ReactNode }) {
  const [currentTenantId, setCurrentTenantIdState] = useState(loadCurrent)
  const [tenantList, setTenantList] = useState(loadList)

  const setCurrentTenantId = useCallback((id: string) => {
    if (!tenantList.includes(id)) return
    setCurrentTenantIdState(id)
    persistCurrent(id)
  }, [tenantList])

  const addTenant = useCallback((): string => {
    const newId = 'familie-' + Date.now()
    const next = [...tenantList]
    if (next.includes(newId)) return newId
    next.push(newId)
    setTenantList(next)
    persistList(next)
    setCurrentTenantIdState(newId)
    persistCurrent(newId)
    return newId
  }, [tenantList])

  useEffect(() => {
    const list = loadList()
    if (list.length !== tenantList.length || list.some((id, i) => id !== tenantList[i])) {
      setTenantList(list)
    }
  }, [])

  const value: ContextValue = {
    currentTenantId,
    tenantList,
    setCurrentTenantId,
    addTenant,
  }

  return (
    <FamilieTenantContext.Provider value={value}>
      {children}
    </FamilieTenantContext.Provider>
  )
}

export function useFamilieTenant(): ContextValue {
  const ctx = useContext(FamilieTenantContext)
  if (!ctx) {
    return {
      currentTenantId: K2_FAMILIE_DEFAULT_TENANT,
      tenantList: [K2_FAMILIE_DEFAULT_TENANT],
      setCurrentTenantId: () => {},
      addTenant: () => K2_FAMILIE_DEFAULT_TENANT,
    }
  }
  return ctx
}
