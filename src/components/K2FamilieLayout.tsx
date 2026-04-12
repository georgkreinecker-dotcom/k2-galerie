/**
 * K2 Familie – Layout mit Tenant-Provider (Phase 4.1).
 * Alle K2-Familie-Seiten erhalten Zugriff auf aktuellen Tenant.
 * Feste Nav-Leiste: immer ein Klick zur Startseite (Homepage).
 */

import { Outlet, Link, useLocation } from 'react-router-dom'
import { FamilieTenantProvider } from '../context/FamilieTenantContext'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import FamilieBackButton from './FamilieBackButton'

const FAMILIE_NAV = [
  { to: PROJECT_ROUTES['k2-familie'].home, label: 'Meine Familie' },
  { to: PROJECT_ROUTES['k2-familie'].uebersicht, label: 'Leitbild & Vision' },
  { to: PROJECT_ROUTES['k2-familie'].stammbaum, label: 'Stammbaum' },
  { to: PROJECT_ROUTES['k2-familie'].events, label: 'Events' },
  { to: PROJECT_ROUTES['k2-familie'].kalender, label: 'Kalender' },
  { to: PROJECT_ROUTES['k2-familie'].geschichte, label: 'Geschichte' },
  { to: PROJECT_ROUTES['k2-familie'].gedenkort, label: 'Gedenkort' },
  { to: PROJECT_ROUTES['k2-familie'].handbuch, label: 'Handbuch' },
  { to: PROJECT_ROUTES['k2-familie'].sicherung, label: 'Sicherung' },
] as const

function FamilieNav() {
  const loc = useLocation()
  const path = loc.pathname

  return (
    <nav className="k2-familie-nav" aria-label="K2 Familie" style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      alignItems: 'center',
      padding: '0.7rem 1rem',
      background: 'rgba(13,148,136,0.1)',
      borderBottom: '1px solid rgba(13,148,136,0.25)',
      marginBottom: 0,
    }}>
      <FamilieBackButton style={{ color: 'rgba(255,255,255,0.85)', marginRight: '0.25rem' }} />
      {FAMILIE_NAV.map(({ to, label }) => {
        const isStart = to === PROJECT_ROUTES['k2-familie'].home
        const isUebersicht = to === PROJECT_ROUTES['k2-familie'].uebersicht
        const isActive = (isStart || isUebersicht || to === PROJECT_ROUTES['k2-familie'].handbuch)
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
      <div className="k2-familie-layout-shell">
        <FamilieNav />
        <main id="k2-familie-main" className="k2-familie-main">
          <Outlet />
        </main>
        <footer className="k2-familie-app-footer" role="contentinfo">
          <p className="k2-familie-app-footer__line">{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
          <p className="k2-familie-app-footer__line k2-familie-app-footer__line--muted">{PRODUCT_URHEBER_ANWENDUNG}</p>
        </footer>
      </div>
    </FamilieTenantProvider>
  )
}
