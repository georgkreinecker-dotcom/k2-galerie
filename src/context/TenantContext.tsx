/**
 * Phase 1.1 Sportwagen: Eine Quelle für den aktuellen Mandanten (K2 | ök2 | VK2).
 * Alle Key- und Kontext-Abfragen laufen darüber – keine Duplikation von
 * isOeffentlichAdminContext() / getArtworksKey() an vielen Stellen.
 */

import React, { createContext, useContext, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ADMIN_CONTEXT_KEY = 'k2-admin-context'

export type AdminTenantId = 'k2' | 'oeffentlich' | 'vk2'

function getTenantFromStorage(): AdminTenantId {
  try {
    if (typeof sessionStorage === 'undefined') return 'k2'
    const s = sessionStorage.getItem(ADMIN_CONTEXT_KEY)
    if (s === 'oeffentlich' || s === 'vk2' || s === 'k2') return s
  } catch (_) {}
  return 'k2'
}

/** Liest tenant aus URL (?context=) und sessionStorage. URL hat Vorrang bei /admin. */
function deriveTenantId(pathname: string, search: string): AdminTenantId {
  const params = new URLSearchParams(search || '')
  const urlContext = params.get('context')
  if (pathname === '/admin' && urlContext === 'oeffentlich') return 'oeffentlich'
  if (pathname === '/admin' && urlContext === 'vk2') return 'vk2'
  if (pathname === '/admin' && urlContext === 'k2') return 'k2'
  return getTenantFromStorage()
}

/** Sync: Wenn wir auf /admin sind und URL hat ?context=, in sessionStorage schreiben. */
function syncStorageFromUrl(pathname: string, search: string): void {
  try {
    if (pathname !== '/admin' || typeof sessionStorage === 'undefined') return
    const params = new URLSearchParams(search || '')
    const ctx = params.get('context')
    if (ctx === 'oeffentlich') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'oeffentlich')
    else if (ctx === 'vk2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'vk2')
    else if (ctx === 'k2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'k2')
    else sessionStorage.removeItem(ADMIN_CONTEXT_KEY)
  } catch (_) {}
}

export interface TenantContextValue {
  tenantId: AdminTenantId
  isOeffentlich: boolean
  isVk2: boolean
  getArtworksKey: () => string
  getEventsKey: () => string
  getDocumentsKey: () => string
}

function keysForTenant(tenantId: AdminTenantId) {
  return {
    getArtworksKey: () => (tenantId === 'oeffentlich' ? 'k2-oeffentlich-artworks' : 'k2-artworks'),
    getEventsKey: () =>
      tenantId === 'vk2' ? 'k2-vk2-events' : tenantId === 'oeffentlich' ? 'k2-oeffentlich-events' : 'k2-events',
    getDocumentsKey: () =>
      tenantId === 'vk2' ? 'k2-vk2-documents' : tenantId === 'oeffentlich' ? 'k2-oeffentlich-documents' : 'k2-documents',
  }
}

const TenantContext = createContext<TenantContextValue | null>(null)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const pathname = location.pathname
  const search = location.search || ''

  const tenantId = useMemo(() => deriveTenantId(pathname, search), [pathname, search])

  useEffect(() => {
    syncStorageFromUrl(pathname, search)
  }, [pathname, search])

  const value = useMemo((): TenantContextValue => {
    const keys = keysForTenant(tenantId)
    return {
      tenantId,
      isOeffentlich: tenantId === 'oeffentlich',
      isVk2: tenantId === 'vk2',
      ...keys,
    }
  }, [tenantId])

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext)
  if (!ctx) {
    // Fallback wenn Provider fehlt (z. B. Tests): aus sessionStorage/URL lesen
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      const search = window.location.search || ''
      syncStorageFromUrl(pathname, search)
      const tid = deriveTenantId(pathname, search)
      const keys = keysForTenant(tid)
      return {
        tenantId: tid,
        isOeffentlich: tid === 'oeffentlich',
        isVk2: tid === 'vk2',
        ...keys,
      }
    }
    const def: AdminTenantId = 'k2'
    const keys = keysForTenant(def)
    return { tenantId: def, isOeffentlich: false, isVk2: false, ...keys }
  }
  return ctx
}
