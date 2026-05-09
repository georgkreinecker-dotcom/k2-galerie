/**
 * Eiserne Regel: ök2, VK2 und K2 Familie existieren nur auf der Plattform-Instanz (kgm).
 * Lizenznehmer-Clone dürfen diese Routen nicht erreichen – Redirect auf Start.
 * K2 Familie: besonders sensible private Nutzerdaten → gleicher Host-Schutz wie Demo/VK2.
 * Doku: docs/SICHERHEIT-LIZENZNEHMER-KEIN-OEK2-VK2.md
 */

import React from 'react'
import { Navigate } from 'react-router-dom'
import { isPlatformInstance } from '../config/tenantConfig'

interface PlatformOnlyRouteProps {
  children: React.ReactNode
  /** Wohin umleiten, wenn keine Plattform-Instanz (z.B. Lizenznehmer). */
  fallbackTo?: string
}

/** Rendert Kinder nur auf der Plattform-Instanz; sonst Redirect (Lizenznehmer: kein ök2/VK2/K2-Familien-UI). */
export function PlatformOnlyRoute({ children, fallbackTo = '/' }: PlatformOnlyRouteProps) {
  if (!isPlatformInstance()) {
    return <Navigate to={fallbackTo} replace />
  }
  return <>{children}</>
}
