/**
 * K2 Familie – Layout mit Tenant-Provider (Phase 4.1).
 * Alle K2-Familie-Seiten erhalten Zugriff auf aktuellen Tenant.
 * Feste Nav-Leiste: immer ein Klick zur Startseite (Homepage).
 */

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useK2WorldMobileCompact } from '../hooks/useK2WorldMobileCompact'
import { useK2WorldMobileNavSheet } from '../hooks/useK2WorldMobileNavSheet'
import { K2WorldMobileNavSheet } from './K2WorldMobileNavSheet'
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
import { isFamilieNurMusterSession, K2_FAMILIE_OPEN_MUSTER_LEITFADEN_EVENT } from '../utils/familieMusterSession'
import { isK2FamilieApfLocalhost, resolveApfMeineFamilieTenantId } from '../config/k2FamilieApfDefaults'
import {
  FamilieMusterHuberLeitfadenModal,
  readMusterLeitfadenAbgeschlossen,
} from './FamilieMusterHuberLeitfaden'
import { isK2FamilieNurMitgliedEinstiegModus } from '../utils/familieIdentitaet'
import { isFamilieEinladungNurZugangAnsicht } from '../utils/familieEinladungPending'
import { loadEinstellungen, loadPersonen } from '../utils/familieStorage'
import { loadIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import { isK2FamilieMeineFamilieHomePath, K2_FAMILIE_APP_SHORT_PATH } from '../utils/k2FamiliePwaBranding'
import { K2_FAMILIE_NAV_LABEL_GESCHICHTE } from '../config/k2FamilieNavLabels'
import { resolveFamiliePwaResumeTarget, writeFamiliePwaLastPath } from '../utils/familiePwaLastPath'
import { useK2FamiliePresentationMode } from '../hooks/useK2FamiliePresentationMode'
import { FamilieMusterDemoHintProvider } from '../context/FamilieMusterDemoHintContext'
import {
  MUSTER_HINT_TOOLBAR_EIGENE_FAMILIE,
  MUSTER_HINT_TOOLBAR_FAMILIE,
  MUSTER_HINT_TOOLBAR_LEITFADEN_BUTTON,
  musterHintForFamilieNavLink,
} from '../config/familieMusterDemoHints'
import { PublicTeilenFixed } from './PublicTeilenFixed'
import { AppVerlassenFooterLink } from './AppVerlassenFooterLink'
import { getPublicK2FamilieMusterEntryUrl } from '../utils/publicLinks'
import { reportK2FamilieMusterHuberVisit } from '../utils/k2FamilieMusterVisit'
import { reportK2FamilieKreineckerStammbaumVisit } from '../utils/k2FamilieKreineckerStammbaumVisit'

/** Gleicher String wie `K2_FAMILIE_SESSION_UPDATED` in `familieStorage.ts` — hier als Literal, damit kein Laufzeit-ReferenceError (z. B. HMR). */
const FAMILIE_SESSION_UPDATED_EVENT = 'k2-familie-einstellungen-updated'

const t = adminTheme
const FAMILIE_NAV_BORDER = 'rgba(181, 74, 30, 0.14)'

/** iOS-Notch: Inline-padding überschreibt sonst App.css (safe-area) – Nutzer:innen sehen Uhr über den Pillen. */
const FAMILIE_NAV_SHELL: CSSProperties = {
  paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
  paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
  paddingTop: 'max(0.65rem, env(safe-area-inset-top, 0px))',
  paddingBottom: '0.65rem',
}
const FAMILIE_NAV_SHELL_COMPACT: CSSProperties = {
  ...FAMILIE_NAV_SHELL,
  paddingTop: 'max(0.55rem, env(safe-area-inset-top, 0px))',
  paddingBottom: '0.55rem',
}

/** Oben: Familienwahl + Rolle – Nutzer kann einklappen; Standard: zu bei bestätigter Identität (siehe Leselogik). */
const LS_FAMILIE_LEISTE_EINGEKLAPPT = 'k2-familie-layout-familie-rolle-leiste-eingeklappt'

function readFamilieLeisteEingeklappt(tenantId: string): boolean {
  try {
    const v = localStorage.getItem(LS_FAMILIE_LEISTE_EINGEKLAPPT)
    if (v === '1') return true
    if (v === '0') return false
  } catch {
    /* ignore */
  }
  /** Handy: ohne explizite Nutzerwahl kompakt starten – mehr Platz für Inhalt. */
  try {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      return true
    }
  } catch {
    /* ignore */
  }
  return loadIdentitaetBestaetigt(tenantId) != null
}

function saveFamilieLeisteEingeklappt(eingeklappt: boolean): void {
  try {
    localStorage.setItem(LS_FAMILIE_LEISTE_EINGEKLAPPT, eingeklappt ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function FamilieTenantToolbar({ collapsed }: { collapsed?: boolean }) {
  const location = useLocation()
  /** Präsentationsmappe / PNGs: kein auto-Rundgang, kein Modal (`?pm=1` + sessionStorage bei Navigation). */
  const { presentationMode: hideMusterLeitfadenForPm, deckblattMinimal } = useK2FamiliePresentationMode()

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
  const [musterLeitfadenOpen, setMusterLeitfadenOpen] = useState(false)
  useEffect(() => {
    if (hideMusterLeitfadenForPm) setMusterLeitfadenOpen(false)
  }, [hideMusterLeitfadenForPm])
  useEffect(() => {
    if (!nurMuster) return
    if (hideMusterLeitfadenForPm) return
    if (!readMusterLeitfadenAbgeschlossen()) setMusterLeitfadenOpen(true)
  }, [nurMuster, hideMusterLeitfadenForPm])
  useEffect(() => {
    if (!nurMuster) return
    const onOpen = () => {
      if (!hideMusterLeitfadenForPm) setMusterLeitfadenOpen(true)
    }
    window.addEventListener(K2_FAMILIE_OPEN_MUSTER_LEITFADEN_EVENT, onOpen)
    return () => window.removeEventListener(K2_FAMILIE_OPEN_MUSTER_LEITFADEN_EVENT, onOpen)
  }, [nurMuster, hideMusterLeitfadenForPm])
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
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          {!deckblattMinimal ? (
          <span
            style={{ fontSize: '0.88rem', fontWeight: 600, color: t.text }}
            title="Echte Familie: Einladung oder QR der Inhaber:in"
          >
            Nur Musterfamilie
          </span>
          ) : null}
          {kannInstanz ? (
            <Link
              to={familieRoutesNav.einstellungen}
              style={{ fontSize: '0.86rem', fontWeight: 600, color: '#b54a1e', textDecoration: 'none' }}
            >
              Neue Familie
            </Link>
          ) : null}
        </div>
      </div>
    )
  }

  /** Volle Liste: bei nur einer Familie Toolbar ausblenden. Eingeschränkte Auswahl (Muster / APf-Stamm) zeigt immer eine Zeile. */
  if (!eingeschraenkteAuswahl && tenantList.length <= 1) return null

  if (collapsed) return null

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
    if (nurMuster) {
      if (deckblattMinimal) {
        return (
          <>
            <FamilieMusterHuberLeitfadenModal
              open={false}
              onOpenChange={() => {}}
              onAbgeschlossen={() => {}}
            />
            <div
              key={familieStorageRevision}
              className="k2-familie-tenant-toolbar k2-familie-no-print"
              aria-hidden
              style={{
                minHeight: 4,
                padding: '0.3rem 1rem',
                background: t.bgCard,
                borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
                fontFamily: t.fontBody,
              }}
            />
          </>
        )
      }
      const btnBase = {
        padding: '0.5rem 1rem',
        fontSize: '0.88rem',
        fontWeight: 700 as const,
        fontFamily: 'inherit' as const,
        borderRadius: t.radius,
        cursor: 'pointer' as const,
      }
      return (
        <>
          <FamilieMusterHuberLeitfadenModal
            open={hideMusterLeitfadenForPm ? false : musterLeitfadenOpen}
            onOpenChange={setMusterLeitfadenOpen}
            onAbgeschlossen={() => {}}
          />
          <div
            key={familieStorageRevision}
            className="k2-familie-tenant-toolbar k2-familie-no-print"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.55rem 1rem',
              background: t.bgCard,
              borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
              fontFamily: t.fontBody,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  if (!hideMusterLeitfadenForPm) setMusterLeitfadenOpen(true)
                }}
                data-leitfaden-focus="leitfaden"
                data-muster-hint={MUSTER_HINT_TOOLBAR_LEITFADEN_BUTTON}
                style={{
                  ...btnBase,
                  border: '1px solid rgba(181, 74, 30, 0.45)',
                  background: '#fffefb',
                  color: '#b54a1e',
                }}
              >
                Rundgang
              </button>
              <Link
                to={familieRoutesNav.lizenzErwerben}
                data-muster-hint={MUSTER_HINT_TOOLBAR_EIGENE_FAMILIE}
                style={{
                  ...btnBase,
                  border: '1px solid rgba(181, 74, 30, 0.45)',
                  background: '#fffefb',
                  color: '#b54a1e',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Eigene Familie anlegen
              </Link>
              {location.pathname !== familieRoutesNav.meineFamilie ? (
                <PublicTeilenFixed
                  layout="inline"
                  variant="familie"
                  displayName="K2 Familie Musterfamilie"
                  canonicalPublicUrl={getPublicK2FamilieMusterEntryUrl()}
                  buttonLabel="📤 Teilen"
                  getShareText={() => 'K2 Familie Musterfamilie – Schau dir die Beispiel-Familie an'}
                />
              ) : null}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <select
                aria-label="Musterfamilie Huber wählen"
                data-muster-hint={MUSTER_HINT_TOOLBAR_FAMILIE}
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
        </>
      )
    }

    return (
      <div
        className="k2-familie-tenant-toolbar k2-familie-no-print"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.55rem 1rem',
          background: t.bgCard,
          borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
          fontFamily: t.fontBody,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.88rem', color: t.muted }}>Familie</span>
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
      <span style={{ fontSize: '0.88rem', color: t.muted }} title="Zwischen Familien auf diesem Gerät wechseln">
        Familie
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

function FamilieRolleLeisteHinweise() {
  const { rolle, setRolle, capabilities } = useFamilieRolle()
  const eff = capabilities.rolle
  const gewaehlt = capabilities.rolleGewaehlt ?? rolle
  const ia = capabilities.inhaberArbeitsansicht
  const showFremdeInhaberHinweis =
    rolle !== eff && !(rolle === 'inhaber' && ia != null && ia !== 'voll')
  const rolleEinstellungenHash = `${PROJECT_ROUTES['k2-familie'].einstellungen}#k2-familie-rolle-wahl`
  return (
    <div className="k2-familie-no-print">
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
          className="k2-familie-rolle-hinweis"
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

function FamilieRolleLeisteHaupt({ onEinklappen }: { onEinklappen?: () => void }) {
  const { deckblattMinimal } = useK2FamiliePresentationMode()
  const { currentTenantId, familieStorageRevision } = useFamilieTenant()
  const famNameHaupt = getFamilieTenantDisplayName(currentTenantId, 'Standard')
  const duNameHaupt = useMemo(() => {
    const ichId = loadEinstellungen(currentTenantId).ichBinPersonId?.trim()
    if (!ichId) return ''
    return loadPersonen(currentTenantId).find((p) => p.id === ichId)?.name?.trim() || ''
  }, [currentTenantId, familieStorageRevision])
  const { rolle, capabilities, inhaberArbeitsansicht, setInhaberArbeitsansicht } = useFamilieRolle()
  const eff = capabilities.rolle
  const gewaehlt = capabilities.rolleGewaehlt ?? rolle
  const ia = capabilities.inhaberArbeitsansicht
  const isInhaberMitReduzierterAnsicht =
    gewaehlt === 'inhaber' && ia != null && ia !== 'voll'
  const showInhaberAnsichtSteuerung = rolle === 'inhaber' && ia != null
  const inhaberAnsichtHash = `${PROJECT_ROUTES['k2-familie'].einstellungen}#k2-familie-inhaber-ansicht`

  if (isFamilieNurMusterSession()) {
    if (deckblattMinimal) return null
    return (
      <div
        className="k2-familie-no-print k2-familie-rolle-leiste"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem 1rem',
          paddingTop: '0.45rem',
          paddingBottom: '0.45rem',
          paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
          background: t.bgElevated,
          borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
        }}
      >
        <p
          style={{
            margin: 0,
            flex: '1 1 220px',
            fontSize: '0.84rem',
            color: t.text,
            lineHeight: 1.45,
          }}
        >
          <strong style={{ fontWeight: 700 }}>Musterfamilie Huber:</strong>{' '}
          Inhaber ist <strong style={{ fontWeight: 700 }}>Stefan Huber</strong>. Als Besucher:in übernimmst du seine
          Perspektive – die Ansichten entsprechen seinem Konto.
        </p>
        {onEinklappen ? (
          <button
            type="button"
            onClick={onEinklappen}
            aria-expanded={true}
            style={{
              marginLeft: 'auto',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              fontFamily: 'inherit',
              fontWeight: 600,
              borderRadius: t.radius,
              border: `1px solid rgba(181, 74, 30, 0.35)`,
              background: '#fffefb',
              color: t.accent,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Einklappen
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className="k2-familie-no-print k2-familie-rolle-leiste"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.5rem 1rem',
        paddingTop: '0.45rem',
        paddingBottom: '0.45rem',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
        background: t.bgElevated,
        borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
      }}
    >
      {/*
        Immer sichtbar: welche Familie (Mandant) aktiv ist – auch bei nur einer Familie,
        wenn die Tenant-Toolbar kein Dropdown zeigt (return null).
      */}
      <span className="meta" style={{ color: t.muted, fontSize: '0.82rem' }}>
        Aktive Familie:
      </span>
      <strong
        style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          color: t.text,
          fontFamily: t.fontHeading,
        }}
        title="Stammdaten und Karten gelten für diese Familie. Bei mehreren Familien wählst du in der Leiste oben die Familie."
      >
        {famNameHaupt}
      </strong>
      {duNameHaupt ? (
        <>
          <span style={{ color: t.muted }} aria-hidden>
            ·
          </span>
          <span className="meta" style={{ color: t.muted, fontSize: '0.82rem' }}>
            Du:
          </span>
          <strong
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: t.text,
              fontFamily: t.fontHeading,
            }}
          >
            {duNameHaupt}
          </strong>
        </>
      ) : null}
      <span style={{ color: t.muted }} aria-hidden>
        ·
      </span>
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
          flex: '1 1 180px',
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
      {onEinklappen ? (
        <button
          type="button"
          onClick={onEinklappen}
          aria-expanded={true}
          style={{
            marginLeft: 'auto',
            padding: '0.35rem 0.75rem',
            fontSize: '0.8rem',
            fontFamily: 'inherit',
            fontWeight: 600,
            borderRadius: t.radius,
            border: `1px solid rgba(181, 74, 30, 0.35)`,
            background: '#fffefb',
            color: t.accent,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Einklappen
        </button>
      ) : null}
    </div>
  )
}

function FamilieRolleLeisteKompakt({ onOeffnen }: { onOeffnen: () => void }) {
  const { deckblattMinimal } = useK2FamiliePresentationMode()
  const { rolle, capabilities } = useFamilieRolle()
  const { currentTenantId, familieStorageRevision } = useFamilieTenant()
  const eff = capabilities.rolle
  const gewaehlt = capabilities.rolleGewaehlt ?? rolle
  const ia = capabilities.inhaberArbeitsansicht
  const isInhaberMitReduzierterAnsicht =
    gewaehlt === 'inhaber' && ia != null && ia !== 'voll'
  const kurz =
    isInhaberMitReduzierterAnsicht
      ? `${K2_FAMILIE_ROLLEN_LABELS.inhaber} · ${K2_FAMILIE_ROLLEN_LABELS[eff]}`
      : K2_FAMILIE_ROLLEN_LABELS[eff]
  const famName = getFamilieTenantDisplayName(currentTenantId, 'Standard')
  /** Name der Person „Du“ – damit in der kompakten Leiste klar ist, wer gerade arbeitet. */
  const duNameAnzeige = useMemo(() => {
    const ichId = loadEinstellungen(currentTenantId).ichBinPersonId?.trim()
    if (!ichId) return ''
    const name = loadPersonen(currentTenantId).find((p) => p.id === ichId)?.name?.trim()
    return name || ''
  }, [currentTenantId, familieStorageRevision])
  if (isFamilieNurMusterSession() && deckblattMinimal) {
    return (
      <div
        key={familieStorageRevision}
        className="k2-familie-no-print k2-familie-rolle-leiste"
        aria-hidden
        style={{
          padding: '0.35rem 1rem',
          background: t.bgCard,
          borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
          minHeight: 6,
        }}
      />
    )
  }
  return (
    <div
      key={familieStorageRevision}
      className="k2-familie-no-print k2-familie-rolle-leiste"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem 0.75rem',
        padding: '0.45rem 1rem',
        background: t.bgCard,
        borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
        fontFamily: t.fontBody,
      }}
    >
      <p style={{ margin: 0, fontSize: '0.84rem', color: t.text, lineHeight: 1.35, flex: '1 1 200px' }}>
        {isFamilieNurMusterSession() ? (
          <>
            <strong style={{ fontWeight: 700 }}>{famName}</strong>
            <span style={{ color: t.muted }}> · </span>
            <span style={{ color: t.muted }}>
              Inhaber Stefan Huber – du siehst die Ansichten wie er.
            </span>
          </>
        ) : (
          <>
            <strong style={{ fontWeight: 700 }}>{famName}</strong>
            {duNameAnzeige ? (
              <>
                <span style={{ color: t.muted }}> · </span>
                <span style={{ color: t.muted }}>Du: </span>
                <strong style={{ fontWeight: 700 }}>{duNameAnzeige}</strong>
              </>
            ) : null}
            <span style={{ color: t.muted }}> · </span>
            <span style={{ color: t.muted }}>Rolle: </span>
            {kurz}
          </>
        )}
      </p>
      <button
        type="button"
        onClick={onOeffnen}
        aria-expanded={false}
        style={{
          padding: '0.4rem 0.85rem',
          fontSize: '0.84rem',
          fontFamily: 'inherit',
          fontWeight: 700,
          borderRadius: t.radius,
          border: '1px solid rgba(181, 74, 30, 0.4)',
          background: '#b54a1e',
          color: '#fff',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Familie & Rolle öffnen
      </button>
    </div>
  )
}

function FamilieTenantRolleCollapsibleSection() {
  const { currentTenantId, tenantList } = useFamilieTenant()
  const nurMuster = isFamilieNurMusterSession()
  const apfStammId = !nurMuster && isK2FamilieApfLocalhost() ? resolveApfMeineFamilieTenantId() : null
  const apfNurStamm = apfStammId != null
  const eingeschraenkteAuswahl = nurMuster || apfNurStamm
  /** Wie FamilieTenantToolbar: Hinweis „echte Familie fehlt“ – darf nicht hinter kompakter Leiste verschwinden. */
  const zeigeNurHuberPlaceholder =
    !eingeschraenkteAuswahl && tenantList.length === 1 && tenantList[0] === FAMILIE_HUBER_TENANT_ID

  const [eingeklappt, setEingeklappt] = useState(() => readFamilieLeisteEingeklappt(currentTenantId))

  useEffect(() => {
    setEingeklappt(readFamilieLeisteEingeklappt(currentTenantId))
  }, [currentTenantId])

  const oeffnen = () => {
    setEingeklappt(false)
    saveFamilieLeisteEingeklappt(false)
  }
  const einklappen = () => {
    setEingeklappt(true)
    saveFamilieLeisteEingeklappt(true)
  }

  if (zeigeNurHuberPlaceholder) {
    return (
      <>
        <FamilieTenantToolbar />
        <FamilieRolleLeisteHaupt />
        <FamilieRolleLeisteHinweise />
      </>
    )
  }

  return (
    <>
      {eingeklappt ? (
        <FamilieRolleLeisteKompakt onOeffnen={oeffnen} />
      ) : (
        <>
          <FamilieTenantToolbar />
          <FamilieRolleLeisteHaupt onEinklappen={einklappen} />
        </>
      )}
      <FamilieRolleLeisteHinweise />
    </>
  )
}

function FamilieRolleLeiste() {
  return (
    <>
      <FamilieRolleLeisteHaupt />
      <FamilieRolleLeisteHinweise />
    </>
  )
}

const familieRoutes = PROJECT_ROUTES['k2-familie']

/** Muster-Demo: Start in der Leiste = Huber mit ?t=huber (nicht nur /familie → „meine“ echte Familie). */
const FAMILIE_MUSTER_HOME_NAV_TO = `${familieRoutes.meineFamilie}?t=${FAMILIE_HUBER_TENANT_ID}`

type FamilieNavItem = {
  to: string
  label: string
  /** Aktiv wenn der Pfad mit einem dieser Präfixe beginnt (z. B. Events und Kalender gemeinsam). */
  activePrefixes?: readonly string[]
}

/** Volle Leiste auf allen Unterseiten. Auf „Meine Familie“-Start: oben Meine Familie, Handbuch, Einstellungen – Stammbaum/Events usw. bleiben als Kacheln. */
const FAMILIE_NAV: FamilieNavItem[] = [
  { to: K2_FAMILIE_APP_SHORT_PATH, label: 'Meine Familie' },
  { to: familieRoutes.stammbaum, label: 'Stammbaum' },
  { to: familieRoutes.events, label: 'Events' },
  { to: familieRoutes.kalender, label: 'Kalender' },
  { to: familieRoutes.geschichte, label: K2_FAMILIE_NAV_LABEL_GESCHICHTE },
  { to: familieRoutes.gedenkort, label: 'Gedenkort' },
  /** Zugang, Sicherung, Lizenz, Kurzlinks Handbuch & Präsentation */
  { to: familieRoutes.einstellungen, label: 'Einstellungen' },
]

/** Interaktiver Muster-Leitfaden: Fokus-Highlight (`data-leitfaden-focus` auf html). */
function familieNavLeitfadenFocusForTo(to: string): string | undefined {
  if (to === K2_FAMILIE_APP_SHORT_PATH) return 'home'
  if (to === familieRoutes.stammbaum) return 'stammbaum'
  if (to === familieRoutes.events) return 'events'
  if (to === familieRoutes.kalender) return 'kalender'
  if (to === familieRoutes.geschichte) return 'geschichte'
  if (to === familieRoutes.gedenkort) return 'gedenkort'
  if (to === familieRoutes.einstellungen) return 'einstellungen'
  if (to === familieRoutes.benutzerHandbuch) return 'handbuch'
  return undefined
}

function isFamilieNavItemActive(item: FamilieNavItem, path: string): boolean {
  const { to, activePrefixes } = item
  const isFamilieHomeNavLink =
    to === K2_FAMILIE_APP_SHORT_PATH || to === FAMILIE_MUSTER_HOME_NAV_TO
  const isExactMatchNav =
    to === familieRoutes.benutzerHandbuch || to === familieRoutes.einstellungen
  const toPathOnly = to.split('?')[0] ?? to
  if (activePrefixes?.length) {
    return activePrefixes.some((p) => path.startsWith(p))
  }
  if (isFamilieHomeNavLink || isExactMatchNav) {
    return isFamilieHomeNavLink
      ? isK2FamilieMeineFamilieHomePath(path)
      : path === toPathOnly || path === toPathOnly + '/'
  }
  return path.startsWith(toPathOnly)
}

function FamilieNav() {
  const loc = useLocation()
  const path = loc.pathname
  const { deckblattMinimal } = useK2FamiliePresentationMode()
  const { capabilities } = useFamilieRolle()
  const isMeineFamilieHome = isK2FamilieMeineFamilieHomePath(path)
  const nurMusterBesuch = isFamilieNurMusterSession()
  const isLeser = capabilities.rolle === 'leser'
  const navItems = useMemo((): FamilieNavItem[] => {
    if (isMeineFamilieHome) {
      /** Musterfamilie-Start: volle Orientierungsleiste wie auf Unterseiten (sonst kein Nav oben). Handbuch wie bisher vor Einstellungen. */
      if (nurMusterBesuch) {
        const ohneErsteUndEinst = FAMILIE_NAV.slice(1).filter((i) => i.to !== familieRoutes.einstellungen)
        const einst = FAMILIE_NAV.find((i) => i.to === familieRoutes.einstellungen)!
        return [
          {
            to: FAMILIE_MUSTER_HOME_NAV_TO,
            label: deckblattMinimal ? '\u200B' : getFamilieTenantDisplayName(FAMILIE_HUBER_TENANT_ID),
          },
          ...ohneErsteUndEinst,
          { to: familieRoutes.benutzerHandbuch, label: 'Handbuch' },
          einst,
        ]
      }
      return [
        { to: K2_FAMILIE_APP_SHORT_PATH, label: 'Meine Familie' },
        { to: familieRoutes.benutzerHandbuch, label: 'Handbuch' },
        {
          to: familieRoutes.einstellungen,
          label: isLeser ? 'Einstellungen' : 'Einstellungen & Verwaltung',
        },
      ]
    }
    return FAMILIE_NAV
  }, [isMeineFamilieHome, isLeser, nurMusterBesuch, deckblattMinimal])

  const compactMedia = useK2WorldMobileCompact()
  /** Schmale Viewports: immer „Menü“+Sheet – weniger Pillen nebeneinander unter der Statusleiste. */
  const useCompactNavPattern = compactMedia
  const { menuOpen, setMenuOpen, closeMenu } = useK2WorldMobileNavSheet(path, loc.search)

  const activeNavItem = useMemo(() => {
    const matches = navItems.filter((i) => isFamilieNavItemActive(i, path))
    if (matches.length) return matches[matches.length - 1]
    return navItems[0]
  }, [navItems, path])

  /** Unterseiten Musterfamilie: minimal Zurück + Link zur Musterfamilie. */
  if (nurMusterBesuch && !isMeineFamilieHome) {
    return (
      <nav
        className="k2-familie-nav k2-familie-no-print"
        aria-label="K2 Familie"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          ...FAMILIE_NAV_SHELL,
          background: t.bgDark,
          borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
          marginBottom: 0,
        }}
      >
        <FamilieBackButton style={{ color: t.text, marginRight: '0.25rem' }} />
        <Link
          to={FAMILIE_MUSTER_HOME_NAV_TO}
          className="k2-familie-nav-link"
          aria-label={deckblattMinimal ? 'Zur Musterfamilie' : undefined}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: 999,
            fontSize: '0.88rem',
            fontWeight: 600,
            textDecoration: 'none',
            color: '#fff',
            background: t.accent,
            fontFamily: 'inherit',
            border: 'none',
            minWidth: deckblattMinimal ? '2rem' : undefined,
          }}
        >
          {deckblattMinimal ? '\u200B' : 'Zur Musterfamilie'}
        </Link>
      </nav>
    )
  }

  const renderNavLink = (item: FamilieNavItem, variant: 'bar' | 'sheet') => {
    const { to, label } = item
    const isActive = isFamilieNavItemActive(item, path)
    const navMuster = isFamilieNurMusterSession()
    const musterHint = navMuster ? musterHintForFamilieNavLink(to) : undefined
    const leitfadenFocus = familieNavLeitfadenFocusForTo(to)
    const base = {
      ...(musterHint ? { 'data-muster-hint': musterHint } : {}),
      ...(leitfadenFocus ? { 'data-leitfaden-focus': leitfadenFocus } : {}),
    }
    if (variant === 'sheet') {
      return (
        <Link
          key={to}
          to={to}
          {...base}
          onClick={() => closeMenu()}
          className={isActive ? 'k2-familie-nav-link k2-familie-nav-link--active' : 'k2-familie-nav-link'}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.65rem 1rem',
            borderRadius: t.radius,
            fontSize: '0.95rem',
            fontWeight: isActive ? 700 : 500,
            textDecoration: 'none',
            color: isActive ? '#fff' : t.text,
            background: isActive ? t.accent : 'rgba(255, 254, 251, 0.96)',
            fontFamily: 'inherit',
            border: isActive ? 'none' : `1px solid ${FAMILIE_NAV_BORDER}`,
          }}
        >
          {label}
        </Link>
      )
    }
    return (
      <Link
        key={to}
        to={to}
        {...base}
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
  }

  if (useCompactNavPattern) {
    return (
      <>
        <nav
          className="k2-familie-nav k2-familie-nav--compact k2-familie-no-print"
          aria-label="K2 Familie"
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: '0.5rem',
            alignItems: 'center',
            ...FAMILIE_NAV_SHELL_COMPACT,
            background: t.bgDark,
            borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
            marginBottom: 0,
          }}
        >
          {!isMeineFamilieHome ? (
            <FamilieBackButton style={{ color: t.text, marginRight: '0.15rem', flexShrink: 0 }} />
          ) : null}
          <span
            className="k2-familie-nav-current-label"
            title={activeNavItem?.label}
            style={{
              flex: '1 1 auto',
              minWidth: 0,
              fontSize: '0.92rem',
              fontWeight: 700,
              color: t.text,
              fontFamily: t.fontHeading,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activeNavItem?.label ?? 'K2 Familie'}
          </span>
          <button
            type="button"
            className="k2-familie-nav-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="k2-familie-nav-mobile-sheet"
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              flexShrink: 0,
              padding: '0.5rem 0.85rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              borderRadius: 999,
              border: `1px solid rgba(181, 74, 30, 0.45)`,
              background: menuOpen ? t.accent : '#fffefb',
              color: menuOpen ? '#fff' : t.accent,
              cursor: 'pointer',
            }}
          >
            Menü
          </button>
        </nav>
        <K2WorldMobileNavSheet
          open={menuOpen}
          onClose={closeMenu}
          title="Bereiche"
          panelId="k2-familie-nav-mobile-sheet"
          className="k2-familie-no-print"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {navItems.map((item) => renderNavLink(item, 'sheet'))}
          </div>
        </K2WorldMobileNavSheet>
      </>
    )
  }

  return (
    <nav
      className="k2-familie-nav k2-familie-no-print"
      aria-label="K2 Familie"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center',
        ...FAMILIE_NAV_SHELL,
        background: t.bgDark,
        borderBottom: `1px solid ${FAMILIE_NAV_BORDER}`,
        marginBottom: 0,
      }}
    >
      {!isMeineFamilieHome ? (
        <FamilieBackButton style={{ color: t.text, marginRight: '0.25rem' }} />
      ) : null}
      {navItems.map((item) => renderNavLink(item, 'bar'))}
    </nav>
  )
}

function FamilieLayoutInner() {
  const location = useLocation()
  const navigate = useNavigate()
  const { presentationMode: hideAppFooterImpressum } = useK2FamiliePresentationMode()
  useEffect(() => {
    if (hideAppFooterImpressum) {
      document.documentElement.dataset.k2FamiliePm = '1'
    } else {
      delete document.documentElement.dataset.k2FamiliePm
    }
    return () => {
      delete document.documentElement.dataset.k2FamiliePm
    }
  }, [hideAppFooterImpressum])
  const nurMuster = isFamilieNurMusterSession()
  const [musterHintRoot, setMusterHintRoot] = useState<HTMLDivElement | null>(null)
  const { currentTenantId, familieStorageRevision } = useFamilieTenant()
  const { rolle } = useFamilieRolle()
  const einst = useMemo(() => loadEinstellungen(currentTenantId), [currentTenantId, familieStorageRevision])
  const personen = useMemo(() => loadPersonen(currentTenantId), [currentTenantId, familieStorageRevision])
  const einladungNurZugangAnsicht = useMemo(
    () => isFamilieEinladungNurZugangAnsicht(currentTenantId),
    [currentTenantId, location.search, familieStorageRevision],
  )
  const nurMitgliedEinstieg = useMemo(
    () =>
      isK2FamilieNurMitgliedEinstiegModus(rolle, currentTenantId, einst, personen, einladungNurZugangAnsicht),
    [rolle, currentTenantId, einst, personen, einladungNurZugangAnsicht],
  )

  /** PWA: einmal pro Mount – letzte Unterroute wiederherstellen, aber nicht weg von Meine Familie solange Zugang noch nicht voll (Code-Formular steht nur dort). */
  const pwaResumeDoneRef = useRef(false)
  useLayoutEffect(() => {
    if (location.pathname !== K2_FAMILIE_APP_SHORT_PATH) return
    if (pwaResumeDoneRef.current) return
    const target = resolveFamiliePwaResumeTarget(location.search)
    if (!target) {
      pwaResumeDoneRef.current = true
      return
    }
    const einstGate = loadEinstellungen(currentTenantId)
    const personenGate = loadPersonen(currentTenantId)
    const einladungGate = isFamilieEinladungNurZugangAnsicht(currentTenantId)
    if (isK2FamilieNurMitgliedEinstiegModus(rolle, currentTenantId, einstGate, personenGate, einladungGate)) {
      pwaResumeDoneRef.current = true
      return
    }
    pwaResumeDoneRef.current = true
    navigate(target, { replace: true })
  }, [
    location.pathname,
    location.search,
    navigate,
    currentTenantId,
    familieStorageRevision,
    rolle,
  ])

  useEffect(() => {
    writeFamiliePwaLastPath(location.pathname, location.search)
  }, [location.pathname, location.search])

  /** Interne Statistik: einmal pro Session, nur Musterfamilie Huber (nicht für echte Familien-Mandanten). */
  useEffect(() => {
    if (currentTenantId !== FAMILIE_HUBER_TENANT_ID) return
    if (!isFamilieNurMusterSession()) return
    reportK2FamilieMusterHuberVisit()
  }, [currentTenantId, location.pathname, location.search])

  /** Interne Statistik: Kreinecker-Stammbaum (Stammkette), getrennt von Huber-Muster. */
  useEffect(() => {
    reportK2FamilieKreineckerStammbaumVisit(currentTenantId, location.pathname, location.search)
  }, [currentTenantId, location.pathname, location.search])

  const columnInner = (
    <>
      {nurMitgliedEinstieg ? (
        <div
          className="k2-familie-no-print"
          style={{
            ...FAMILIE_NAV_SHELL,
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
          {!nurMuster ? (
            <FamilieTenantRolleCollapsibleSection />
          ) : (
            <>
              <FamilieTenantToolbar />
              {!isK2FamilieMeineFamilieHomePath(location.pathname) ? <FamilieRolleLeiste /> : null}
            </>
          )}
        </>
      )}
      <main id="k2-familie-main" className="k2-familie-main">
        <Outlet />
        {!hideAppFooterImpressum ? (
          <footer className="k2-familie-app-footer k2-familie-no-print" role="contentinfo">
            <p className="k2-familie-app-footer__line">{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
            <p className="k2-familie-app-footer__line k2-familie-app-footer__line--muted">{PRODUCT_URHEBER_ANWENDUNG}</p>
            <AppVerlassenFooterLink accentColor={t.accent} mutedColor={t.muted} />
          </footer>
        ) : null}
      </main>
    </>
  )

  return (
    <>
      <FamilieEinladungQuerySync />
      <FamilieApfMeineFamilieSync />
      <FamilieMusterSessionEnforcer />
      <FamilieCloudAutoSync />
      <div className={`k2-familie-layout-shell${nurMuster ? ' k2-familie-layout-shell--nur-muster' : ''}`}>
        {!nurMitgliedEinstieg && !nurMuster ? <FamilieLeitstrukturPanel /> : null}
        <FamilieMusterDemoHintProvider active={nurMuster} root={musterHintRoot}>
          <div ref={setMusterHintRoot} className="k2-familie-layout-column">
            {columnInner}
          </div>
        </FamilieMusterDemoHintProvider>
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
