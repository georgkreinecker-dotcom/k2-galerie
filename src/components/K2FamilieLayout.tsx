/**
 * K2 Familie – Layout mit Tenant-Provider (Phase 4.1).
 * Alle K2-Familie-Seiten erhalten Zugriff auf aktuellen Tenant.
 */

import { Outlet } from 'react-router-dom'
import { FamilieTenantProvider } from '../context/FamilieTenantContext'

export default function K2FamilieLayout() {
  return (
    <FamilieTenantProvider>
      <Outlet />
    </FamilieTenantProvider>
  )
}
