/**
 * K2 Familie – Layout mit Tenant-Provider (Phase 4.1).
 * Alle K2-Familie-Seiten erhalten Zugriff auf aktuellen Tenant.
 * Feste Nav-Leiste: immer ein Klick zur Startseite (Homepage).
 */

import { Outlet, Link, useLocation } from 'react-router-dom'
import { FamilieTenantProvider } from '../context/FamilieTenantContext'
import { PROJECT_ROUTES } from '../config/navigation'

const FAMILIE_NAV = [
  { to: PROJECT_ROUTES['k2-familie'].home, label: 'Start (Homepage)' },
  { to: PROJECT_ROUTES['k2-familie'].uebersicht, label: 'Leitbild & Vision' },
  { to: PROJECT_ROUTES['k2-familie'].stammbaum, label: 'Stammbaum' },
  { to: PROJECT_ROUTES['k2-familie'].events, label: 'Events' },
  { to: PROJECT_ROUTES['k2-familie'].kalender, label: 'Kalender' },
] as const

function FamilieNav() {
  const loc = useLocation()
  const path = loc.pathname

  return (
    <nav className="k2-familie-nav" style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      alignItems: 'center',
      padding: '0.7rem 1rem',
      background: 'rgba(13,148,136,0.1)',
      borderBottom: '1px solid rgba(13,148,136,0.25)',
      marginBottom: 0,
    }}>
      {FAMILIE_NAV.map(({ to, label }) => {
        const isStart = to === PROJECT_ROUTES['k2-familie'].home
        const isUebersicht = to === PROJECT_ROUTES['k2-familie'].uebersicht
        const isActive = isStart || isUebersicht
          ? (path === to || path === to + '/')
          : path.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: 999,
              fontSize: '0.9rem',
              fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
              color: isActive ? '#14b8a6' : 'rgba(255,255,255,0.78)',
              background: isActive ? 'rgba(13,148,136,0.28)' : 'transparent',
              fontFamily: 'inherit',
              transition: 'background 0.2s, color 0.2s, transform 0.2s',
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function K2FamilieLayout() {
  return (
    <FamilieTenantProvider>
      <FamilieNav />
      <Outlet />
    </FamilieTenantProvider>
  )
}
