/**
 * K2 Familie – Layout mit Tenant-Provider (Phase 4.1).
 * Alle K2-Familie-Seiten erhalten Zugriff auf aktuellen Tenant.
 * Feste Nav-Leiste: immer ein Klick zur Startseite (Homepage).
 */

import { Outlet, Link, useLocation } from 'react-router-dom'
import { FamilieTenantProvider } from '../context/FamilieTenantContext'
import { FamilieRolleProvider, useFamilieRolle } from '../context/FamilieRolleContext'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { K2_FAMILIE_ROLLEN, K2_FAMILIE_ROLLEN_LABELS } from '../types/k2FamilieRollen'
import FamilieBackButton from './FamilieBackButton'

function FamilieRolleLeiste() {
  const { rolle, setRolle, capabilities } = useFamilieRolle()
  const MUTED = 'rgba(255,255,255,0.72)'
  const ACCENT = '#14b8a6'
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem 1rem',
          padding: '0.45rem 1rem',
          background: 'rgba(0,0,0,0.18)',
          borderBottom: '1px solid rgba(13,148,136,0.2)',
        }}
      >
        <span className="meta" style={{ color: MUTED, fontSize: '0.82rem' }}>Rolle (Sitzung):</span>
        <select
          id="k2-familie-rolle-select"
          aria-label="Rolle für diese Familie wählen"
          value={rolle}
          onChange={(e) => setRolle(e.target.value as typeof rolle)}
          style={{
            background: 'rgba(0,0,0,0.28)',
            border: `1px solid ${ACCENT}55`,
            borderRadius: 8,
            color: '#f0f6ff',
            padding: '0.35rem 0.55rem',
            fontSize: '0.88rem',
            fontFamily: 'inherit',
            maxWidth: 'min(100%, 220px)',
          }}
        >
          {K2_FAMILIE_ROLLEN.map((r) => (
            <option key={r} value={r}>
              {K2_FAMILIE_ROLLEN_LABELS[r]}
            </option>
          ))}
        </select>
        <span className="meta" style={{ color: MUTED, fontSize: '0.78rem', flex: '1 1 200px' }}>
          {capabilities.rolle === 'leser' && 'Nur Lesen – nichts wird gespeichert.'}
          {capabilities.rolle === 'bearbeiter' &&
            'Stammbaum-Struktur & Stammdaten nur lesen; Events, Geschichte, Gedenkort & Druck-Optionen organisch bearbeitbar. Keine Wiederherstellung/Merge, keine neue Familie.'}
          {capabilities.rolle === 'inhaber' && 'Voller Zugriff inkl. Sicherung & Familie anlegen.'}
        </span>
      </div>
      {capabilities.rolle === 'leser' && (
        <div
          role="status"
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(234, 88, 12, 0.18)',
            borderBottom: '1px solid rgba(251, 146, 60, 0.35)',
            fontSize: '0.88rem',
            color: '#ffedd5',
            fontWeight: 600,
          }}
        >
          Lesemodus: Speichern und Bearbeiten sind ausgeschaltet. Zum Ausprobieren Rolle oben auf Inhaber:in oder Bearbeiter:in stellen.
        </div>
      )}
    </>
  )
}

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
      <FamilieRolleProvider>
        <div className="k2-familie-layout-shell">
          <FamilieNav />
          <FamilieRolleLeiste />
          <main id="k2-familie-main" className="k2-familie-main">
            <Outlet />
          </main>
        <footer className="k2-familie-app-footer" role="contentinfo">
          <p className="k2-familie-app-footer__line">{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
          <p className="k2-familie-app-footer__line k2-familie-app-footer__line--muted">{PRODUCT_URHEBER_ANWENDUNG}</p>
        </footer>
        </div>
      </FamilieRolleProvider>
    </FamilieTenantProvider>
  )
}
