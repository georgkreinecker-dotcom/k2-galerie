/**
 * K2 Familie – Layout mit Tenant-Provider (Phase 4.1).
 * Alle K2-Familie-Seiten erhalten Zugriff auf aktuellen Tenant.
 * Feste Nav-Leiste: immer ein Klick zur Startseite (Homepage).
 */

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { FamilieTenantProvider, useFamilieTenant } from '../context/FamilieTenantContext'
import { FamilieRolleProvider, useFamilieRolle } from '../context/FamilieRolleContext'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import type { K2FamilieInhaberArbeitsansicht } from '../types/k2FamilieRollen'
import {
  K2_FAMILIE_INHABER_ANSICHT,
  K2_FAMILIE_INHABER_ANSICHT_LABELS,
  K2_FAMILIE_ROLLEN_AMPEL,
  K2_FAMILIE_ROLLEN_EINZEILER,
  K2_FAMILIE_ROLLEN_LABELS,
} from '../types/k2FamilieRollen'
import { adminTheme } from '../config/theme'
import { getFamilieTenantDisplayName, FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'
import FamilieBackButton from './FamilieBackButton'
import FamilieLeitstrukturPanel from './FamilieLeitstrukturPanel'
import { FamilieEinladungQuerySync } from './FamilieEinladungQuerySync'
import { FamilieApfMeineFamilieSync } from './FamilieApfMeineFamilieSync'
import { FamilieMusterSessionEnforcer } from './FamilieMusterSessionEnforcer'
import { FamilieCloudAutoSync } from './K2Familie/FamilieCloudAutoSync'
import { isFamilieNurMusterSession } from '../utils/familieMusterSession'
import { isK2FamilieApfLocalhost, resolveApfMeineFamilieTenantId } from '../config/k2FamilieApfDefaults'
import { isK2FamilieNurMitgliedEinstiegModus } from '../utils/familieIdentitaet'
import { loadEinstellungen, loadPersonen } from '../utils/familieStorage'

/** Gleicher String wie `K2_FAMILIE_SESSION_UPDATED` in `familieStorage.ts` — hier als Literal, damit kein Laufzeit-ReferenceError (z. B. HMR). */
const FAMILIE_SESSION_UPDATED_EVENT = 'k2-familie-einstellungen-updated'

const t = adminTheme
const FAMILIE_NAV_BORDER = 'rgba(181, 74, 30, 0.14)'

function FamilieTenantToolbar() {
  const navigate = useNavigate()
  const familieRoutesNav = PROJECT_ROUTES['k2-familie']
  const {
    currentTenantId,
    tenantList,
    setCurrentTenantId,
    addTenant,
    familieStorageRevision,
  } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannInstanz = capabilities.canManageFamilienInstanz
  const nurMuster = isFamilieNurMusterSession()
  /** APf localhost: nur erkannte Stammfamilie (Kreinecker) – kein Huber, keine Platzhalter im Dropdown. */
  const apfStammId = !nurMuster && isK2FamilieApfLocalhost() ? resolveApfMeineFamilieTenantId() : null
  const apfNurStamm = apfStammId != null
  const eingeschraenkteAuswahl = nurMuster || apfNurStamm
  const displayIds = nurMuster
    ? [FAMILIE_HUBER_TENANT_ID]
    : apfNurStamm
      ? [apfStammId!]
      : tenantList
  /** Dropdown-Labels lesen Anzeigenamen aus dem Speicher — ohne Re-Render bleibt alter Text nach Speichern. */
  const [, setEinstellungenTick] = useState(0)
  useEffect(() => {
    const onUpd = () => setEinstellungenTick((n) => n + 1)
    window.addEventListener(FAMILIE_SESSION_UPDATED_EVENT, onUpd)
    return () => window.removeEventListener(FAMILIE_SESSION_UPDATED_EVENT, onUpd)
  }, [])

  /** Demo beendet, aber auf dem Gerät nur Huber eingetragen – ohne Banner wäre die Toolbar leer (length ≤ 1). */
  if (!eingeschraenkteAuswahl && tenantList.length === 1 && tenantList[0] === FAMILIE_HUBER_TENANT_ID) {
    return (
      <div
        key={familieStorageRevision}
        className="k2-familie-tenant-toolbar k2-familie-no-print"
        style={{
          padding: '0.65rem 1rem',
          background: 'rgba(217, 119, 6, 0.1)',
          borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
          fontFamily: t.fontBody,
        }}
        role="status"
      >
        <p style={{ margin: 0, fontSize: '0.86rem', color: t.text, lineHeight: 1.5, fontWeight: 600 }}>
          Echte Familie fehlt auf diesem Gerät
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: t.muted, lineHeight: 1.45 }}>
          Es ist nur die Musterfamilie Huber in der Liste. Öffne den{' '}
          <strong style={{ color: t.text }}>Einladungslink oder QR von der Inhaber:in</strong> mit <strong style={{ color: t.text }}>eurer</strong> Familie (Link enthält{' '}
          <code style={{ fontSize: '0.78rem' }}>?t=…</code> und Zugangscode). Danach erscheint die Familie hier.
          {kannInstanz && (
            <>
              {' '}
              Oder unter <Link to={familieRoutesNav.einstellungen}>Einstellungen</Link> eine neue Familie anlegen.
            </>
          )}
        </p>
      </div>
    )
  }

  /** Volle Liste: bei nur einer Familie Toolbar ausblenden. Eingeschränkte Auswahl (Muster / APf-Stamm) zeigt immer eine Zeile. */
  if (!eingeschraenkteAuswahl && tenantList.length <= 1) return null

  const selectValue = eingeschraenkteAuswahl
    ? displayIds.includes(currentTenantId)
      ? currentTenantId
      : displayIds[0]!
    : currentTenantId

  const selectStyle = {
    background: '#fffefb',
    border: '1px solid rgba(181, 74, 30, 0.28)',
    borderRadius: t.radius,
    color: t.text,
    padding: '0.4rem 0.65rem',
    fontSize: '0.88rem',
    fontFamily: 'inherit',
    minWidth: 160,
  } as const

  if (eingeschraenkteAuswahl) {
    const hinweisApfStamm =
      'Auf der APf: Hier nur deine Stammfamilie – kein Wechsel zu Muster Huber und keine Platzhalter-Einträge im Dropdown.'

    if (nurMuster) {
      return (
        <div
          key={familieStorageRevision}
          className="k2-familie-tenant-toolbar k2-familie-no-print"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            padding: '0.75rem 1rem',
            background: t.bgCard,
            borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
            fontFamily: t.fontBody,
          }}
        >
          <div
            style={{
              border: '2px solid rgba(181, 74, 30, 0.45)',
              borderRadius: t.radius,
              padding: '0.75rem 0.9rem',
              background: '#fffefb',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: t.text, lineHeight: 1.35 }}>
              Demo-Umschau – nur Musterfamilie Huber wählbar
            </p>
            <p style={{ margin: '0.45rem 0 0', fontSize: '0.82rem', color: t.muted, lineHeight: 1.45 }}>
              So kommst du zu <strong style={{ color: t.text }}>deiner aktiven Familie</strong> (nicht nur Demo):
            </p>
            <ol
              style={{
                margin: '0.35rem 0 0',
                paddingLeft: '1.25rem',
                fontSize: '0.82rem',
                color: t.text,
                lineHeight: 1.5,
              }}
            >
              <li>
                <strong style={{ color: t.text }}>Demo beenden:</strong> Schaltfläche unten – die Seite „Meine Familie“ öffnet sich <strong>ohne</strong> Demo-Zusatz in der Adresse. Danach sind alle Familien auf diesem Gerät wählbar (oder du nutzt den Einladungslink).
              </li>
              <li>
                <strong style={{ color: t.text }}>Einladung der Inhaber:in:</strong> Link oder QR mit <strong>eurer</strong> Familie öffnen (Adresse enthält <code style={{ fontSize: '0.78rem' }}>?t=…</code> und den Zugangscode). Den langen Code <strong>nicht</strong> ins Feld „Dein Code“ tippen – immer den kompletten Link nutzen.
              </li>
              {isK2FamilieApfLocalhost() ? (
                <li>
                  <strong style={{ color: t.text }}>Nur am Mac (APf):</strong> Nach dem Beenden wird die Stammfamilie ggf. automatisch gewählt, wenn sie in der Liste steht.
                </li>
              ) : (
                <li>
                  <strong style={{ color: t.text }}>Danach:</strong> Alle Familien, die auf diesem Gerät eingetragen sind, sind wieder wählbar.
                </li>
              )}
            </ol>
            <button
              type="button"
              onClick={() =>
                navigate({ pathname: familieRoutesNav.meineFamilie, search: '' }, { replace: true })
              }
              style={{
                marginTop: '0.65rem',
                padding: '0.5rem 1rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                fontFamily: 'inherit',
                borderRadius: t.radius,
                border: '1px solid rgba(181, 74, 30, 0.35)',
                background: '#b54a1e',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Demo beenden – Familienwahl freischalten
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.88rem', color: t.muted }} title="Demo-Mandant">
              Aktive Familie (Demo):
            </span>
            <select
              aria-label="Aktive Familie wählen"
              title="In der Muster-Sitzung nur Huber."
              value={selectValue}
              onChange={(e) => setCurrentTenantId(e.target.value)}
              style={selectStyle}
            >
              {displayIds.map((id) => (
                <option key={id} value={id}>
                  {getFamilieTenantDisplayName(id, 'Standard')}
                </option>
              ))}
            </select>
          </div>
        </div>
      )
    }

    return (
      <div
        className="k2-familie-tenant-toolbar k2-familie-no-print"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '0.55rem 1rem',
          background: t.bgCard,
          borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
          fontFamily: t.fontBody,
        }}
      >
        <p style={{ margin: 0, fontSize: '0.8rem', color: t.muted, lineHeight: 1.45 }}>{hinweisApfStamm}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.88rem', color: t.muted }} title="Stammfamilie auf diesem Gerät">
            Aktive Familie wählen:
          </span>
          <select
            aria-label="Aktive Familie wählen"
            title="Auf der APf nur deine Stammfamilie."
            value={selectValue}
            onChange={(e) => setCurrentTenantId(e.target.value)}
            style={selectStyle}
          >
            {displayIds.map((id) => (
              <option key={id} value={id}>
                {getFamilieTenantDisplayName(id, 'Standard')}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }

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
      <span style={{ fontSize: '0.88rem', color: t.muted }} title="Hier wechselst du zwischen Familien auf diesem Gerät – kein Umbenennen.">
        Aktive Familie wählen:
      </span>
      <select
        aria-label="Aktive Familie wählen"
        title="Zu welcher Familie soll die App gerade gehören? Umbenennen: Stammbaum oder Einstellungen → Anzeigename."
        value={currentTenantId}
        onChange={(e) => setCurrentTenantId(e.target.value)}
        style={selectStyle}
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
  const { rolle, setRolle, capabilities, inhaberArbeitsansicht, setInhaberArbeitsansicht } = useFamilieRolle()
  const eff = capabilities.rolle
  const gewaehlt = capabilities.rolleGewaehlt ?? rolle
  const ia = capabilities.inhaberArbeitsansicht
  const isInhaberMitReduzierterAnsicht =
    gewaehlt === 'inhaber' && ia != null && ia !== 'voll'
  const showInhaberAnsichtSteuerung = rolle === 'inhaber' && ia != null
  const showFremdeInhaberHinweis =
    rolle !== eff && !(rolle === 'inhaber' && ia != null && ia !== 'voll')
  const rolleEinstellungenHash = `${PROJECT_ROUTES['k2-familie'].einstellungen}#k2-familie-rolle-wahl`
  const inhaberAnsichtHash = `${PROJECT_ROUTES['k2-familie'].einstellungen}#k2-familie-inhaber-ansicht`
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: '7.5rem' }}>
          <strong
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: t.text,
              fontFamily: t.fontHeading,
            }}
          >
            {isInhaberMitReduzierterAnsicht ? (
              <>
                {K2_FAMILIE_ROLLEN_LABELS.inhaber}
                <span style={{ fontWeight: 500, color: t.muted }}> · Ansicht: {K2_FAMILIE_ROLLEN_LABELS[eff]}</span>
              </>
            ) : (
              K2_FAMILIE_ROLLEN_LABELS[eff]
            )}
          </strong>
        </div>
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
              background: K2_FAMILIE_ROLLEN_AMPEL[eff],
              flexShrink: 0,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
            }}
          />
          {K2_FAMILIE_ROLLEN_EINZEILER[eff]}
        </span>
        {showInhaberAnsichtSteuerung && (
          <label
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.35rem 0.5rem',
              fontSize: '0.8rem',
              color: t.muted,
            }}
          >
            <span>Arbeitsansicht (für dich gespeichert):</span>
            <select
              aria-label="Arbeitsansicht als Inhaber:in"
              value={inhaberArbeitsansicht}
              onChange={(e) => setInhaberArbeitsansicht(e.target.value as K2FamilieInhaberArbeitsansicht)}
              style={{
                background: '#fffefb',
                border: '1px solid rgba(181, 74, 30, 0.28)',
                borderRadius: t.radius,
                color: t.text,
                padding: '0.3rem 0.5rem',
                fontSize: '0.82rem',
                fontFamily: 'inherit',
                maxWidth: 280,
              }}
            >
              {K2_FAMILIE_INHABER_ANSICHT.map((a) => (
                <option key={a} value={a}>
                  {K2_FAMILIE_INHABER_ANSICHT_LABELS[a]}
                </option>
              ))}
            </select>
            <Link to={inhaberAnsichtHash} style={{ color: t.accent, fontWeight: 600 }}>
              Erklärung
            </Link>
          </label>
        )}
      </div>
      {showFremdeInhaberHinweis && (
        <div
          role="status"
          style={{
            padding: '0.4rem 1rem',
            background: 'rgba(217, 119, 6, 0.12)',
            borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
            fontSize: '0.8rem',
            color: t.muted,
            lineHeight: 1.35,
          }}
        >
          <strong style={{ color: t.text }}>Hinweis:</strong> In den Familien-Daten ist eine andere Person als Inhaber:in festgelegt – für Rechte siehst du{' '}
          <strong style={{ color: t.text }}>{K2_FAMILIE_ROLLEN_LABELS[eff]}</strong> (nicht die Auswahl in den Einstellungen).
        </div>
      )}
      {capabilities.rolle === 'leser' && (
        <div
          role="status"
          style={{
            padding: '0.35rem 1rem',
            background: 'rgba(100, 116, 139, 0.1)',
            borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
            fontSize: '0.8rem',
            color: t.muted,
            lineHeight: 1.35,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.5rem 0.75rem',
          }}
        >
          <span>
            Lesemodus · Rolle zum Mitgestalten:{' '}
            <Link to={rolleEinstellungenHash} style={{ color: t.accent, fontWeight: 600 }}>
              Einstellungen
            </Link>{' '}
            (nur diese Sitzung)
          </span>
          <button
            type="button"
            onClick={() => setRolle('inhaber')}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.78rem',
              fontFamily: 'inherit',
              fontWeight: 600,
              borderRadius: t.radius,
              border: `1px solid ${t.accent}`,
              background: '#fffefb',
              color: t.accent,
              cursor: 'pointer',
            }}
          >
            Ich richte die Familie ein → Inhaber:in
          </button>
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
  const { capabilities } = useFamilieRolle()
  const isMeineFamilieHome =
    path === familieRoutes.meineFamilie || path === `${familieRoutes.meineFamilie}/`
  /** Auf der Startseite: „Sicherung“ nur, wenn Export erlaubt (Leser / eingeschränkte Sitzung: weniger Klicks). */
  const navItems = isMeineFamilieHome
    ? capabilities.canExportSicherung
      ? FAMILIE_NAV_MEINE_FAMILIE_HOME
      : FAMILIE_NAV_MEINE_FAMILIE_HOME.filter((i) => i.to !== familieRoutes.sicherung)
    : FAMILIE_NAV

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

function FamilieLayoutInner() {
  const { currentTenantId, familieStorageRevision } = useFamilieTenant()
  const { rolle } = useFamilieRolle()
  const einst = useMemo(() => loadEinstellungen(currentTenantId), [currentTenantId, familieStorageRevision])
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId, familieStorageRevision])
  const nurMitgliedEinstieg = useMemo(
    () => isK2FamilieNurMitgliedEinstiegModus(rolle, currentTenantId, einst, personen),
    [rolle, currentTenantId, einst, personen],
  )

  return (
    <>
      <FamilieEinladungQuerySync />
      <FamilieApfMeineFamilieSync />
      <FamilieMusterSessionEnforcer />
      <FamilieCloudAutoSync />
      <div className="k2-familie-layout-shell">
        {!nurMitgliedEinstieg ? <FamilieLeitstrukturPanel /> : null}
        <div className="k2-familie-layout-column">
          {nurMitgliedEinstieg ? (
            <div
              className="k2-familie-no-print"
              style={{
                padding: '0.65rem 1rem',
                background: t.bgDark,
                borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
                fontFamily: t.fontHeading,
                color: t.text,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>K2 Familie · Persönlicher Zugang</div>
              <p
                style={{
                  margin: '0.35rem 0 0',
                  fontSize: '0.82rem',
                  lineHeight: 1.45,
                  color: t.muted,
                  fontFamily: t.fontBody,
                  fontWeight: 500,
                }}
              >
                Privater Familienraum – Betreten nur mit deiner persönlichen ID, dem Code auf deiner Karte.
              </p>
            </div>
          ) : (
            <>
              <FamilieNav />
              <FamilieTenantToolbar />
              <FamilieRolleLeiste />
            </>
          )}
          <main id="k2-familie-main" className="k2-familie-main">
            <Outlet />
          </main>
          <footer className="k2-familie-app-footer k2-familie-no-print" role="contentinfo">
            <p className="k2-familie-app-footer__line">{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
            <p className="k2-familie-app-footer__line k2-familie-app-footer__line--muted">{PRODUCT_URHEBER_ANWENDUNG}</p>
          </footer>
        </div>
      </div>
    </>
  )
}

export default function K2FamilieLayout() {
  return (
    <FamilieTenantProvider>
      <FamilieRolleProvider>
        <FamilieLayoutInner />
      </FamilieRolleProvider>
    </FamilieTenantProvider>
  )
}
