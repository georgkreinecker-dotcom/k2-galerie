/**
 * K2 Familie – Layout mit Tenant-Provider (Phase 4.1).
 * Alle K2-Familie-Seiten erhalten Zugriff auf aktuellen Tenant.
 * Feste Nav-Leiste: immer ein Klick zur Startseite (Homepage).
 */

import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FamilieTenantProvider, useFamilieTenant } from '../context/FamilieTenantContext'
import { FamilieRolleProvider, useFamilieRolle } from '../context/FamilieRolleContext'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import {
  K2_FAMILIE_ROLLEN_AMPEL,
  K2_FAMILIE_ROLLEN_EINZEILER,
  K2_FAMILIE_ROLLEN_LABELS,
} from '../types/k2FamilieRollen'
import { adminTheme } from '../config/theme'
import { getFamilieTenantDisplayName } from '../data/familieHuberMuster'
import FamilieBackButton from './FamilieBackButton'
import FamilieLeitstrukturPanel from './FamilieLeitstrukturPanel'
import { FamilieEinladungQuerySync } from './FamilieEinladungQuerySync'
import { FamilieCloudAutoSync } from './K2Familie/FamilieCloudAutoSync'

/** Gleicher String wie `K2_FAMILIE_SESSION_UPDATED` in `familieStorage.ts` — hier als Literal, damit kein Laufzeit-ReferenceError (z. B. HMR). */
const FAMILIE_SESSION_UPDATED_EVENT = 'k2-familie-einstellungen-updated'

const t = adminTheme
const FAMILIE_NAV_BORDER = 'rgba(181, 74, 30, 0.14)'

function FamilieTenantToolbar() {
  const { currentTenantId, tenantList, setCurrentTenantId, addTenant } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannInstanz = capabilities.canManageFamilienInstanz
  /** Dropdown-Labels lesen Anzeigenamen aus dem Speicher — ohne Re-Render bleibt alter Text nach Speichern. */
  const [, setEinstellungenTick] = useState(0)
  useEffect(() => {
    const onUpd = () => setEinstellungenTick((n) => n + 1)
    window.addEventListener(FAMILIE_SESSION_UPDATED_EVENT, onUpd)
    return () => window.removeEventListener(FAMILIE_SESSION_UPDATED_EVENT, onUpd)
  }, [])

  return (
    <div
      className="k2-familie-tenant-toolbar k2-familie-no-print"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.55rem 1rem',
        background: t.bgCard,
        borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
        fontFamily: t.fontBody,
      }}
    >
      <span style={{ fontSize: '0.88rem', color: t.muted }}>Familie:</span>
      <select
        aria-label="Familie wählen"
        value={currentTenantId}
        onChange={(e) => setCurrentTenantId(e.target.value)}
        style={{
          background: '#fffefb',
          border: '1px solid rgba(181, 74, 30, 0.28)',
          borderRadius: t.radius,
          color: t.text,
          padding: '0.4rem 0.65rem',
          fontSize: '0.88rem',
          fontFamily: 'inherit',
          minWidth: 160,
        }}
      >
        {tenantList.map((id) => (
          <option key={id} value={id}>
            {getFamilieTenantDisplayName(id, 'Standard')}
          </option>
        ))}
      </select>
      {kannInstanz && (
        <button
          type="button"
          onClick={() => addTenant()}
          title="Neue, leere Familie anlegen und dorthin wechseln."
          style={{
            padding: '0.4rem 0.9rem',
            fontSize: '0.88rem',
            fontFamily: 'inherit',
            borderRadius: t.radius,
            border: '1px solid rgba(181, 74, 30, 0.35)',
            background: t.bgDark,
            color: t.accent,
            cursor: 'pointer',
          }}
        >
          Neue Familie
        </button>
      )}
    </div>
  )
}

function FamilieRolleLeiste() {
  const { rolle, capabilities } = useFamilieRolle()
  const rolleEinstellungenHash = `${PROJECT_ROUTES['k2-familie'].einstellungen}#k2-familie-rolle-wahl`
  return (
    <div className="k2-familie-no-print">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem 1rem',
          padding: '0.45rem 1rem',
          background: t.bgElevated,
          borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
        }}
      >
        <span className="meta" style={{ color: t.muted, fontSize: '0.82rem' }}>
          Deine Rolle:
        </span>
        <strong
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: t.text,
            fontFamily: t.fontHeading,
            minWidth: '7.5rem',
          }}
        >
          {K2_FAMILIE_ROLLEN_LABELS[rolle]}
        </strong>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: t.text,
            fontSize: '0.84rem',
            flex: '1 1 220px',
            lineHeight: 1.35,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: K2_FAMILIE_ROLLEN_AMPEL[rolle],
              flexShrink: 0,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
            }}
          />
          {K2_FAMILIE_ROLLEN_EINZEILER[rolle]}
        </span>
      </div>
      {capabilities.rolle === 'leser' && (
        <div
          role="status"
          style={{
            padding: '0.45rem 1rem',
            background: 'rgba(100, 116, 139, 0.12)',
            borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
            fontSize: '0.82rem',
            color: t.text,
          }}
        >
          Lesemodus – zum Mitgestalten die Rolle unter{' '}
          <Link to={rolleEinstellungenHash} style={{ color: t.accent, fontWeight: 600 }}>
            Einstellungen → Rolle in dieser Familie
          </Link>{' '}
          anpassen (nur für diese Browser-Sitzung; später familienintern durch die Inhaber:in).
        </div>
      )}
    </div>
  )
}

const familieRoutes = PROJECT_ROUTES['k2-familie']

type FamilieNavItem = {
  to: string
  label: string
  /** Aktiv wenn der Pfad mit einem dieser Präfixe beginnt (z. B. Events und Kalender gemeinsam). */
  activePrefixes?: readonly string[]
}

/** Volle Leiste auf allen Unterseiten. Auf „Meine Familie“-Start: keine Doppelung zu den großen Kacheln darunter – Kernthemen nur unten, oben kompakt. */
const FAMILIE_NAV: FamilieNavItem[] = [
  { to: familieRoutes.meineFamilie, label: 'Meine Familie' },
  { to: familieRoutes.stammbaum, label: 'Stammbaum' },
  {
    to: familieRoutes.events,
    label: 'Events & Kalender',
    activePrefixes: [familieRoutes.events, familieRoutes.kalender],
  },
  { to: familieRoutes.geschichte, label: 'Geschichte' },
  { to: familieRoutes.gedenkort, label: 'Gedenkort' },
  /** Zugang, Sicherung, Lizenz, Kurzlinks Handbuch & Präsentation */
  { to: familieRoutes.einstellungen, label: 'Einstellungen' },
]

/** Nur auf /meine-familie: Stammbaum–Gedenkort sitzen als Kacheln auf der Seite – oben nicht noch einmal. */
const FAMILIE_NAV_MEINE_FAMILIE_HOME: FamilieNavItem[] = [
  { to: familieRoutes.meineFamilie, label: 'Meine Familie' },
  { to: familieRoutes.benutzerHandbuch, label: 'Handbuch' },
  { to: familieRoutes.familiePraesentationsmappe, label: 'Präsentationsmappe' },
  { to: familieRoutes.sicherung, label: 'Sicherung' },
]

function FamilieNav() {
  const loc = useLocation()
  const path = loc.pathname
  const isMeineFamilieHome =
    path === familieRoutes.meineFamilie || path === `${familieRoutes.meineFamilie}/`
  const navItems = isMeineFamilieHome ? FAMILIE_NAV_MEINE_FAMILIE_HOME : FAMILIE_NAV

  return (
    <nav
      className="k2-familie-nav k2-familie-no-print"
      aria-label="K2 Familie"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
        padding: '0.65rem 1rem',
        background: t.bgDark,
        borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
        marginBottom: 0,
      }}
    >
      <FamilieBackButton style={{ color: t.text, marginRight: '0.25rem' }} />
      {isMeineFamilieHome && (
        <span
          className="meta"
          style={{
            fontSize: '0.78rem',
            color: t.muted,
            marginRight: '0.15rem',
            maxWidth: 280,
            lineHeight: 1.35,
          }}
          title="Stammbaum, Events & Kalender, Geschichte und Gedenkort: große Schaltflächen auf dieser Seite unter „Was möchtest du tun?“"
        >
          Weitere Bereiche ↓ Startseite
        </span>
      )}
      {navItems.map(({ to, label, activePrefixes }) => {
        const isStart = to === familieRoutes.meineFamilie
        const isExactMatchNav =
          to === familieRoutes.benutzerHandbuch || to === familieRoutes.einstellungen
        const isActive = activePrefixes?.length
          ? activePrefixes.some((p) => path.startsWith(p))
          : isStart || isExactMatchNav
            ? path === to || path === to + '/'
            : path.startsWith(to)
        return (
          <Link
            key={to}
            to={to}
            className={isActive ? 'k2-familie-nav-link k2-familie-nav-link--active' : 'k2-familie-nav-link'}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 999,
              fontSize: '0.88rem',
              fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
              color: isActive ? '#fff' : t.text,
              background: isActive ? t.accent : 'transparent',
              fontFamily: 'inherit',
              transition: 'background 0.2s, color 0.2s, transform 0.2s',
              border: isActive ? 'none' : '1px solid transparent',
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
        <FamilieEinladungQuerySync />
        <FamilieCloudAutoSync />
        <div className="k2-familie-layout-shell">
          <FamilieLeitstrukturPanel />
          <div className="k2-familie-layout-column">
            <FamilieNav />
            <FamilieTenantToolbar />
            <FamilieRolleLeiste />
            <main id="k2-familie-main" className="k2-familie-main">
              <Outlet />
            </main>
            <footer className="k2-familie-app-footer k2-familie-no-print" role="contentinfo">
              <p className="k2-familie-app-footer__line">{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
              <p className="k2-familie-app-footer__line k2-familie-app-footer__line--muted">{PRODUCT_URHEBER_ANWENDUNG}</p>
            </footer>
          </div>
        </div>
      </FamilieRolleProvider>
    </FamilieTenantProvider>
  )
}
