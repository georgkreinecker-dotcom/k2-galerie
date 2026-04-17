/**
 * Phase 1.1 Sportwagen: Eine Quelle für den aktuellen Mandanten (K2 | ök2 | VK2).
 * Alle Key- und Kontext-Abfragen laufen darüber – keine Duplikation von
 * isOeffentlichAdminContext() / getArtworksKey() an vielen Stellen.
 *
 * Eiserne Regel: ök2 und VK2 nur auf der Plattform-Instanz (kgm). Lizenznehmer-Clone
 * erhalten niemals Zugriff – auch nicht per URL-Manipulation (?context=oeffentlich/vk2).
 */

import React, { createContext, useContext, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isPlatformInstance } from '../config/tenantConfig'

const ADMIN_CONTEXT_KEY = 'k2-admin-context'
/** APf-Projekt „K2 Galerie“: gleiche ?context=-Logik wie /admin (nur Plattform-Instanz). */
const K2_GALERIE_PROJECT_PREFIX = '/projects/k2-galerie'
/** Vereinsplattform (Vereinsmuster): eigene Projekt-Routen – immer VK2 auf der Plattform (wie ?context=vk2 auf /admin). */
const VK2_PROJECT_PREFIX = '/projects/vk2'
/** APf Dev-View: gleiche Mandanten-Logik wie bei /projects/k2-galerie – ?page= vk2-* / öffentliche Galerie ohne extra ?context=. */
const DEV_VIEW_PREFIX = '/dev-view'

export type AdminTenantId = 'k2' | 'oeffentlich' | 'vk2'

function getTenantFromStorage(): AdminTenantId {
  try {
    if (typeof sessionStorage === 'undefined') return 'k2'
    if (!isPlatformInstance()) return 'k2'
    const s = sessionStorage.getItem(ADMIN_CONTEXT_KEY)
    if (s === 'oeffentlich' || s === 'vk2' || s === 'k2') return s
  } catch (_) {}
  return 'k2'
}

/** Sichere dynamische Mandanten-ID aus URL (?tenantId=galerie-xxx). a-z0-9-, 1–64 Zeichen, nicht k2/oeffentlich/vk2. */
function getDynamicTenantIdFromUrl(search: string): string | null {
  try {
    const params = new URLSearchParams(search || '')
    const raw = params.get('tenantId')?.toLowerCase().trim() ?? ''
    if (!raw || raw.length > 64) return null
    if (!/^[a-z0-9-]{1,64}$/.test(raw)) return null
    if (raw === 'k2' || raw === 'oeffentlich' || raw === 'vk2') return null
    return raw
  } catch {
    return null
  }
}

/** APf /dev-view: Mandant aus ?page= (eingebettete Tabs), wenn kein ?context= gesetzt. */
function tenantIdFromDevViewPageParam(search: string, onPlatform: boolean): AdminTenantId | null {
  try {
    const params = new URLSearchParams(search || '')
    const page = (params.get('page') ?? '').toLowerCase().trim()
    if (!page) return null
    if (page === 'galerie-oeffentlich' || page === 'galerie-oeffentlich-vorschau') {
      return onPlatform ? 'oeffentlich' : 'k2'
    }
    if (page === 'vk2' || page.startsWith('vk2-')) {
      return onPlatform ? 'vk2' : 'k2'
    }
    return null
  } catch {
    return null
  }
}

/** Liest tenant aus URL (?context=) und sessionStorage. URL hat Vorrang bei /admin, /mein-bereich und bei /projects/k2-galerie/* (z. B. Flyer A3 aus neuem Tab – sonst bleibt tenantId auf K2 bis zum nächsten Render). Nur auf Plattform: oeffentlich/vk2; sonst K2. */
export function deriveTenantId(pathname: string, search: string): AdminTenantId {
  const onPlatform = isPlatformInstance()
  const params = new URLSearchParams(search || '')
  const raw = params.get('context')
  const urlContext = raw != null ? raw.toLowerCase().trim() : null

  const fromUrlContext = (): AdminTenantId | null => {
    if (urlContext == null) return null
    if (!onPlatform) {
      if (urlContext === 'oeffentlich' || urlContext === 'vk2') return 'k2'
      if (urlContext === 'k2') return 'k2'
      return null
    }
    if (urlContext === 'oeffentlich') return 'oeffentlich'
    if (urlContext === 'vk2') return 'vk2'
    if (urlContext === 'k2') return 'k2'
    return null
  }

  if (pathname === '/admin' || pathname === '/mein-bereich') {
    const u = fromUrlContext()
    if (u !== null) return u
    return 'k2'
  }
  if (pathname.startsWith(K2_GALERIE_PROJECT_PREFIX)) {
    const u = fromUrlContext()
    if (u !== null) return u
    return getTenantFromStorage()
  }
  if (pathname.startsWith(VK2_PROJECT_PREFIX)) {
    if (!onPlatform) return 'k2'
    return 'vk2'
  }
  if (pathname === DEV_VIEW_PREFIX || pathname.startsWith(`${DEV_VIEW_PREFIX}/`)) {
    const u = fromUrlContext()
    if (u !== null) return u
    const fromPage = tenantIdFromDevViewPageParam(search, onPlatform)
    if (fromPage !== null) return fromPage
    return getTenantFromStorage()
  }
  return getTenantFromStorage()
}

/** Sync: /admin und /projects/k2-galerie/* mit ?context= → sessionStorage. Auf Lizenznehmer-Instanz niemals oeffentlich/vk2 schreiben. Ohne ?context= unter Projekt-Pfaden sessionStorage nicht überschreiben (kein Kontext-Vergiften). */
function syncStorageFromUrl(pathname: string, search: string): void {
  try {
    if (typeof sessionStorage === 'undefined') return
    if (!isPlatformInstance()) {
      const s = sessionStorage.getItem(ADMIN_CONTEXT_KEY)
      if (s === 'oeffentlich' || s === 'vk2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'k2')
      return
    }
    const params = new URLSearchParams(search || '')
    const raw = params.get('context')
    const ctx = raw != null ? raw.toLowerCase().trim() : null
    if (pathname === '/admin' || pathname === '/mein-bereich') {
      if (ctx === 'oeffentlich') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'oeffentlich')
      else if (ctx === 'vk2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'vk2')
      else if (ctx === 'k2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'k2')
      else sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'k2')
      return
    }
    if (pathname.startsWith(K2_GALERIE_PROJECT_PREFIX)) {
      if (ctx === 'oeffentlich') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'oeffentlich')
      else if (ctx === 'vk2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'vk2')
      else if (ctx === 'k2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'k2')
      return
    }
    if (pathname.startsWith(VK2_PROJECT_PREFIX)) {
      sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'vk2')
      return
    }
    if (pathname === DEV_VIEW_PREFIX || pathname.startsWith(`${DEV_VIEW_PREFIX}/`)) {
      if (ctx === 'oeffentlich') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'oeffentlich')
      else if (ctx === 'vk2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'vk2')
      else if (ctx === 'k2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'k2')
      else {
        const pageTid = tenantIdFromDevViewPageParam(search, true)
        if (pageTid === 'oeffentlich') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'oeffentlich')
        else if (pageTid === 'vk2') sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'vk2')
        else sessionStorage.setItem(ADMIN_CONTEXT_KEY, 'k2')
      }
    }
  } catch (_) {}
}

export interface TenantContextValue {
  tenantId: AdminTenantId
  /** Wenn gesetzt: Admin lädt/speichert nur über API (gallery-data, write-gallery-data), kein localStorage. */
  dynamicTenantId: string | null
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
  const dynamicTenantId = useMemo(() => (pathname === '/admin' ? getDynamicTenantIdFromUrl(search) : null), [pathname, search])

  useEffect(() => {
    syncStorageFromUrl(pathname, search)
  }, [pathname, search])

  const value = useMemo((): TenantContextValue => {
    const keys = keysForTenant(tenantId)
    return {
      tenantId,
      dynamicTenantId,
      isOeffentlich: tenantId === 'oeffentlich',
      isVk2: tenantId === 'vk2',
      ...keys,
    }
  }, [tenantId, dynamicTenantId])

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
      const dynId = pathname === '/admin' ? getDynamicTenantIdFromUrl(search) : null
      const keys = keysForTenant(tid)
      return {
        tenantId: tid,
        dynamicTenantId: dynId,
        isOeffentlich: tid === 'oeffentlich',
        isVk2: tid === 'vk2',
        ...keys,
      }
    }
    const def: AdminTenantId = 'k2'
    const keys = keysForTenant(def)
    return { tenantId: def, dynamicTenantId: null, isOeffentlich: false, isVk2: false, ...keys }
  }
  return ctx
}
