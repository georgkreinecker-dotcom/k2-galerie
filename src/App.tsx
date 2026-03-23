import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { safeReload, safeReloadWithCacheBypass, getRefreshUrl } from './utils/env'
import { K2_ADMIN_UNLOCKED_KEY, clearAdminUnlockIfExpired } from './utils/adminUnlockStorage'
import { Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import './App.css'
import ProjectsPage from './pages/ProjectsPage'
import ProjectStartPage from './pages/ProjectStartPage'
import ControlStudioPage from './pages/ControlStudioPage'
import ProjectPlanPage from './pages/ProjectPlanPage'
import NotizenPage from './pages/NotizenPage'
import BriefAnAugustPage from './pages/BriefAnAugustPage'
import BriefAnAndreasPage from './pages/BriefAnAndreasPage'
import EinladungFreundeEroeffnungNotizPage from './pages/EinladungFreundeEroeffnungNotizPage'
import K2TeamHandbuchPage from './pages/K2TeamHandbuchPage'
import ZettelMartinaMunaPage from './pages/ZettelMartinaMunaPage'
import ZettelPilotPage from './pages/ZettelPilotPage'
import ZettelPilotFormPage from './pages/ZettelPilotFormPage'
import K2GalerieHandbuchPage from './pages/K2GalerieHandbuchPage'
import KampagneMarketingStrategiePage from './pages/KampagneMarketingStrategiePage'
import K2MarktPage from './pages/K2MarktPage'
import K2MarktOberflaechePage from './pages/K2MarktOberflaechePage'
import K2MarktSchichtPage from './pages/K2MarktSchichtPage'
import K2MarktTorPage from './pages/K2MarktTorPage'
import BenutzerHandbuchPage from './pages/BenutzerHandbuchPage'
import Vk2HandbuchPage from './pages/Vk2HandbuchPage'
import MobileConnectPage from './pages/MobileConnectPage'
import ProduktVorschauPage from './pages/ProduktVorschauPage'
import MarketingOek2Page from './pages/MarketingOek2Page'
import PraesentationsmappePage from './pages/PraesentationsmappePage'
import PraesentationsmappeVollversionPage from './pages/PraesentationsmappeVollversionPage'
import ProspektGalerieeroeffnungPage from './pages/ProspektGalerieeroeffnungPage'
import PilotStartPage from './pages/PilotStartPage'
import K2SoftwareentwicklungPage from './pages/K2SoftwareentwicklungPage'
import WerbeunterlagenPage from './pages/WerbeunterlagenPage'
import Mok2Layout from './components/Mok2Layout'
import GaleriePage from './pages/GaleriePage'
import GalerieTenantPage from './pages/GalerieTenantPage'
import GalerieVorschauPage from './pages/GalerieVorschauPage'
import Vk2GaleriePage from './pages/Vk2GaleriePage'
import Vk2KatalogPage from './pages/Vk2KatalogPage'
import Vk2GalerieVorschauPage from './pages/Vk2GalerieVorschauPage'
import Vk2MitgliedLoginPage from './pages/Vk2MitgliedLoginPage'
import K2FamilieStartPage from './pages/K2FamilieStartPage'
import K2FamilieHomePage from './pages/K2FamilieHomePage'
import K2FamilieStammbaumPage from './pages/K2FamilieStammbaumPage'
import K2FamilieGrundstrukturPage from './pages/K2FamilieGrundstrukturPage'
import K2FamiliePersonPage from './pages/K2FamiliePersonPage'
import K2FamilieEventsPage from './pages/K2FamilieEventsPage'
import K2FamilieKalenderPage from './pages/K2FamilieKalenderPage'
import K2FamilieGeschichtePage from './pages/K2FamilieGeschichtePage'
import K2FamilieGedenkortPage from './pages/K2FamilieGedenkortPage'
import K2FamilieHandbuchPage from './pages/K2FamilieHandbuchPage'
import K2FamilieSicherungPage from './pages/K2FamilieSicherungPage'
import K2FamilieLayout from './components/K2FamilieLayout'
import PlatzanordnungPage from './pages/PlatzanordnungPage'
import VitaPage from './pages/VitaPage'
import ShopPage from './pages/ShopPage'
import VirtuellerRundgangPage from './pages/VirtuellerRundgangPage'
import DialogStandalonePage from './pages/DialogStandalonePage'
import KeyPage from './pages/KeyPage'
import KostenPage from './pages/KostenPage'
import GitHubTokenPage from './pages/GitHubTokenPage'
import LicencesPage from './pages/LicencesPage'
import UebersichtBoardPage from './pages/UebersichtBoardPage'
import LizenzKaufenPage from './pages/LizenzKaufenPage'
import LizenzErfolgPage from './pages/LizenzErfolgPage'
import EmpfehlungstoolPage from './pages/EmpfehlungstoolPage'
import VerguetungPage from './pages/VerguetungPage'
import SecondMacPage from './pages/SecondMacPage'
import KassaEinstiegPage from './pages/KassaEinstiegPage'
import KassabuchPage from './pages/KassabuchPage'
import KassausgangPage from './pages/KassausgangPage'
import BuchhaltungPage from './pages/BuchhaltungPage'
const AdminRoute = lazy(() => import('./components/AdminRoute'))
import { Ok2ThemeWrapper } from './components/Ok2ThemeWrapper'
import { PlatformOnlyRoute } from './components/PlatformOnlyRoute'
import DevViewPage from './pages/DevViewPage'
import PlatformStartPage from './pages/PlatformStartPage'
import MissionControlPage from './pages/MissionControlPage'
import FlyerK2GaleriePage from './pages/FlyerK2GaleriePage'
import ProspektK2GaleriePage from './pages/ProspektK2GaleriePage'
import PresseEinladungK2GaleriePage from './pages/PresseEinladungK2GaleriePage'
import MeinBereichPage from './pages/MeinBereichPage'
import KundenPage from './pages/KundenPage'
import { PLATFORM_ROUTES, PROJECT_ROUTES, MOK2_ROUTE, WILLKOMMEN_ROUTE, AGB_ROUTE, ENTDECKEN_ROUTE, shouldRedirectRootUrlToEntdecken, PILOT_SCHREIBEN_ROUTE, MEIN_BEREICH_ROUTE, KREATIVWERKSTATT_ROUTE } from './config/navigation'
import { getPageMeta, applyPageMeta } from './config/seoPageMeta'
import { TenantProvider } from './context/TenantContext'
import WillkommenPage from './pages/WillkommenPage'
import EntdeckenPage from './pages/EntdeckenPage'
import AGBPage from './pages/AGBPage'
import SeitengestaltungPage from './pages/SeitengestaltungPage'
import { BUILD_LABEL, BUILD_TIMESTAMP } from './buildInfo.generated'
import { PRODUCT_BRAND_NAME } from './config/tenantConfig'
import { Component, type ErrorInfo, type ReactNode } from 'react'

// Error Boundary für gesamte App
class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('APP FEHLER:', error, errorInfo)
    console.error('Fehler-Stack:', error.stack)
    console.error('Component Stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unbekannter Fehler'
      const errorStack = this.state.error?.stack || ''
      const isModuleScriptError = /Importing a module script failed|Laden eines Modul-Skripts|module script/i.test(errorMessage)
      const isLocalhost = typeof window !== 'undefined' && /localhost|127\.0\.0\.1/i.test(window.location.origin || '')

      return (
        <div style={{
          minHeight: '100vh',
          background: '#1a0f0a',
          color: '#fff5f0',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>⚠️ App-Fehler</h1>
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            <p style={{ color: '#ff6b6b', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {errorMessage}
            </p>
            {errorStack && (
              <pre style={{ color: '#ffffff', whiteSpace: 'pre-wrap', fontSize: '0.8rem', margin: 0 }}>
                {errorStack.substring(0, 1000)}
              </pre>
            )}
          </div>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
            {isModuleScriptError
              ? (isLocalhost
                ? 'Auf localhost: Im Cursor-Terminal „npm run dev“ starten, dann den Link unten öffnen (http://localhost:5177). Alte localhost-Tabs schließen.'
                : 'Das passiert oft nach einem neuen Deploy – der Browser hat noch alte Skripte. „Reset & neu laden“ holt die neueste Version. Falls der Fehler bleibt: den Link unten in der gleichen Registerkarte öffnen.')
              : 'Wenn die K2-Seite nach Drucken/Teilen nicht mehr lädt: „Reset &amp; neu laden“ versuchen.'}
          </p>
          {isModuleScriptError && typeof window !== 'undefined' && (
            <p style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              {isLocalhost ? (
                <a href="http://localhost:5177" target="_top" rel="noopener noreferrer" style={{ color: '#ff8c42', wordBreak: 'break-all' }}>
                  http://localhost:5177
                </a>
              ) : (
                <a href={getRefreshUrl()} target="_top" rel="noopener noreferrer" style={{ color: '#ff8c42', wordBreak: 'break-all' }}>
                  {window.location.origin}/refresh.html
                </a>
              )}
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                try {
                  // 🔒 NIEMALS Kundendaten löschen – nur Session/UI-Keys entfernen
                  const SAFE_TO_DELETE = [
                    'k2-admin-unlocked', 'k2-admin-unlocked-expiry',
                    'k2-last-loaded-timestamp', 'k2-last-loaded-version',
                    'k2-last-build-id', 'k2-last-load-time', 'k2-artworks-hash',
                    'k2-guide-flow', 'k2-hub-from', 'k2-shop-from-oeffentlich',
                    'grafiker-notiz-entwurf', 'grafiker-notizen-offen',
                    'devview-panel-minimized',
                  ]
                  SAFE_TO_DELETE.forEach(k => { try { localStorage.removeItem(k) } catch (_) {} })
                  sessionStorage.clear()
                } catch (_) {}
                // Bei Modul-Import-Fehler: stärkerer Cache-Bypass (frisches HTML), sonst normaler Reload
                if (isModuleScriptError) {
                  if (isLocalhost) {
                    window.location.href = 'http://localhost:5177'
                  } else {
                    safeReloadWithCacheBypass()
                  }
                } else {
                  safeReload()
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Reset &amp; neu laden
            </button>
            <button
              onClick={() => safeReload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Nur neu laden
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Error Boundary für Admin-Komponente
class AdminErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin-Komponente Fehler:', error, errorInfo)
    console.error('Fehler-Stack:', error.stack)
    console.error('Component Stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unbekannter Fehler'
      const errorStack = this.state.error?.stack || ''
      
      return (
        <div style={{
          minHeight: '100vh',
          background: '#1a0f0a',
          color: '#fff5f0',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '1rem' }}>⚠️ Fehler beim Laden der Admin-Seite</h1>
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            <p style={{ color: '#ff6b6b', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {errorMessage}
            </p>
            {errorStack && (
              <pre style={{ color: '#ffffff', whiteSpace: 'pre-wrap', fontSize: '0.8rem', margin: 0 }}>
                {errorStack.substring(0, 500)}
              </pre>
            )}
          </div>
          <button
            onClick={() => safeReload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Seite neu laden
          </button>
        </div>
      )
    }

    return this.props.children
  }
}


/** Stand-Anzeige nur auf erster Galerieseite und im Impressum (Georg: sonst überall entfernt, auch bei QR). */
const STAND_BADGE_PATHNAMES = [
  '/projects/k2-galerie/galerie',
  '/projects/k2-galerie/galerie-oeffentlich',
  '/projects/vk2/galerie',
  AGB_ROUTE
]

function StandBadgeSync() {
  const location = useLocation()
  const pathname = location?.pathname ?? ''
  const showHere = STAND_BADGE_PATHNAMES.some((p) => pathname === p)
  const [serverNewer, setServerNewer] = useState(false)
  const [displayLabel, setDisplayLabel] = useState(BUILD_LABEL)
  const [showStandHelp, setShowStandHelp] = useState(false)
  const isLocal = typeof window !== 'undefined' && /^https?:\/\/localhost|127\.0\.0\.1/i.test(window.location?.origin || '')
  // Alle Hooks VOR jedem Return – sonst „Rendered fewer hooks“ beim Wechsel der Route (K2/ök2/Vorschau/Admin)
  const mountedRef = useRef(true)
  const reloadForStand = isLocal ? safeReload : safeReloadWithCacheBypass
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])
  useEffect(() => {
    if (isLocal) return
    // Immer gleiche no-cache Quelle: build-info.json (static) oder api/build-info (serverless)
    const url = window.location.origin + '/api/build-info?t=' + Date.now() + '&r=' + Math.random()
    fetch(url, { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { label?: string; timestamp?: number } | null) => {
        if (!mountedRef.current || !data) return
        if (data.label) setDisplayLabel(data.label)
        if (data.timestamp && data.timestamp > BUILD_TIMESTAMP) setServerNewer(true)
      })
      .catch(() => {})
  }, [isLocal])

  useEffect(() => {
    if (!showStandHelp) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowStandHelp(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showStandHelp])

  if (!showHere) return null

  // KEIN automatischer Reload bei serverNewer – verursacht in Cursor Preview Reload-Loop (Server neuer → Reload → wieder Server neuer → wieder Reload → Code-5-Crash). Nur Badge anzeigen, Nutzer tippt selbst.
  // KEIN Auto-Reload bei serverNewer (nur Badge, Nutzer tippt) – verhindert Reload-Loop in Cursor Preview.

  const isMobile = typeof window !== 'undefined' && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768)
  const label = serverNewer
    ? (isMobile ? 'Neuer Stand – tippen!' : 'Aktualisiere …')
    : (isLocal ? `Build: ${BUILD_LABEL}` : `Stand: ${displayLabel}`)
  const title = isLocal
    ? `Build-Zeit dieser Version. Neuer Code: Im Cursor-Terminal „npm run build“ ausführen, dann Seite neu laden (F5). Dann siehst du hier die neue Zeit.`
    : isMobile
      ? 'Tippen = Seite neu laden (immer neueste Version). Siehst du noch Blau oder alte Bilder? Einmal tippen.'
      : 'Tippen oder neue Seite öffnen (neuer Tab) = frischer Stand. Auch im fremden WLAN.'

  return (
    <>
      {/* Auf Mobile: Deutlicher Hinweis wenn neuer Stand, damit Reload nicht übersehen wird */}
      {serverNewer && isMobile && (
        <div
          role="button"
          tabIndex={0}
          onClick={reloadForStand}
          onKeyDown={(e) => e.key === 'Enter' && reloadForStand()}
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            right: 12,
            zIndex: 2147483646,
            fontSize: 14,
            fontWeight: 600,
            color: '#fff',
            background: 'rgba(200,100,0,0.95)',
            padding: '10px 14px',
            borderRadius: 10,
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            textAlign: 'center'
          }}
        >
          Neuer Stand verfügbar – hier tippen zum Aktualisieren
        </div>
      )}
      {/* Restrisiko Stand/Cache: fest eingebaute Kurzinfo für Nutzer (ohne Piloten-Feedback-Schleife) */}
      {showStandHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="stand-hilfe-titel"
          onClick={() => setShowStandHelp(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2147483647,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 420,
              width: '100%',
              background: '#fffefb',
              color: '#1c1a18',
              borderRadius: 12,
              padding: '1.1rem 1.15rem',
              boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
              lineHeight: 1.5,
              fontSize: isMobile ? 15 : 14,
            }}
          >
            <h2 id="stand-hilfe-titel" style={{ margin: '0 0 0.6rem', fontSize: '1.05rem', fontWeight: 700, color: '#1c1a18' }}>
              Stand auf dem Handy oder Tablet
            </h2>
            <p style={{ margin: '0 0 0.75rem' }}>
              Manchmal wirkt die Galerie <strong>noch alt</strong>, obwohl Sie bereits veröffentlicht haben. Häufig liegt das am <strong>Zwischenspeicher</strong> Ihres Browsers – das ist bei Webseiten normal und kein Fehler Ihrer Daten.
            </p>
            <p style={{ margin: '0 0 0.35rem', fontWeight: 600 }}>So holen Sie den aktuellen Stand:</p>
            <ul style={{ margin: '0 0 0.85rem', paddingLeft: '1.2rem' }}>
              <li style={{ marginBottom: 6 }}>Auf <strong>„Stand …“</strong> unten links tippen (lädt die Seite neu).</li>
              <li style={{ marginBottom: 6 }}>Oder den Tab schließen und die Galerie <strong>neu öffnen</strong>.</li>
              <li style={{ marginBottom: 6 }}>Oder den <strong>QR-Code erneut scannen</strong>.</li>
            </ul>
            <p style={{ margin: '0 0 1rem', fontSize: '0.92em', color: '#5c5650' }}>
              Wichtig: Handy und PC sollten <strong>dieselbe Internet-Adresse</strong> in der Adresszeile zeigen (keine nur am Rechner gültige Testadresse).
            </p>
            <button
              type="button"
              onClick={() => setShowStandHelp(false)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                background: '#b54a1e',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          position: 'fixed',
          bottom: 10,
          left: 10,
          zIndex: 2147483647,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <div
          id="app-stand-badge"
          role="status"
          onClick={reloadForStand}
          title={title}
          style={{
            fontSize: isMobile ? 14 : 12,
            color: '#fff',
            background: serverNewer ? 'rgba(200,120,0,0.95)' : 'rgba(0,0,0,0.85)',
            padding: isMobile ? '8px 12px' : '6px 10px',
            borderRadius: 8,
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            pointerEvents: 'auto',
          }}
        >
          {label}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowStandHelp(true) }}
          aria-label="Hinweis: Stand auf dem Handy aktualisieren"
          title="Was tun, wenn die Anzeige alt wirkt?"
          style={{
            flexShrink: 0,
            width: isMobile ? 40 : 34,
            height: isMobile ? 40 : 34,
            padding: 0,
            fontSize: isMobile ? 18 : 16,
            fontWeight: 700,
            lineHeight: 1,
            color: '#fff',
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 8,
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            pointerEvents: 'auto',
          }}
        >
          ?
        </button>
      </div>
    </>
  )
}

const isMobileView = () => typeof window !== 'undefined' && (
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
  (window.innerWidth <= 768 && ('ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0)) ||
  window.innerWidth <= 768 // schmaler Bildschirm = immer Galerie (kein Smart Panel), auch bei „Desktop“-Browser
)

/** Handbuch-Dokument-URL: wenn jemand mit ?page=handbuch&doc=... auf "/" landet, sofort zur APf-Route weiterleiten. */
const HANDBUCH_DOC_REDIRECT = '/projects/k2-galerie'

/** Catch-all: Bei Projekt-Unterseiten-URL (3+ Segmente), die nicht gematcht wurde, Hinweis statt stiller Redirect zur APf (Link-öffnet-APf-Bug, ANALYSE-LINK-OEFFNET-APF-STATT-UNTERSEITE.md). */
function NotFoundOrRedirect() {
  const location = useLocation()
  const pathname = location.pathname || ''
  const segments = pathname.split('/').filter(Boolean)
  const isProjectSubpath = segments[0] === 'projects' && segments[1] === 'k2-galerie' && segments.length > 2
  if (isProjectSubpath) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui', color: '#1c1a18', maxWidth: '480px', margin: '2rem auto' }}>
        <h2 style={{ marginTop: 0 }}>Seite nicht gefunden</h2>
        <p>Diese Adresse ist bekannt, aber die App kennt die Route noch nicht. Bitte Stand aktualisieren (Commit &amp; Push), dann den Link erneut öffnen.</p>
        <p style={{ fontSize: '0.9rem', color: '#5c5650' }}>Doku: docs/ANALYSE-LINK-OEFFNET-APF-STATT-UNTERSEITE.md</p>
      </div>
    )
  }
  return <Navigate to="/" replace />
}

/** Root "/": Vercel/kgm → Besucher-Haupteingang Entdecken; localhost → Mobile Galerie bzw. DevView/APf. */
function MobileRootRedirect() {
  const [searchParams] = useSearchParams()

  const page = searchParams.get('page')
  const doc = searchParams.get('doc')
  // Pilot-Zettel (ehem. Martina & Muna) → Pilot-Zettel
  if (doc === '19-MARTINA-MUNA-BESUCH-OEK2-VK2.md' || doc === '20-PILOT-ZETTEL-OEK2-VK2.md') {
    return <Navigate to="/zettel-pilot" replace />
  }
  // Andere Handbuch-Dokument-Parameter → APf mit Handbuch
  if ((page === 'handbuch' || doc) && typeof window !== 'undefined') {
    const target = `${HANDBUCH_DOC_REDIRECT}?page=handbuch&doc=${doc || ''}`
    return <Navigate to={target} replace />
  }

  // Plattform (Produktion): Basis-URL = Entdecken (Haupteingang für Fremde), nicht APf und nicht K2-/galerie
  if (typeof window !== 'undefined' && shouldRedirectRootUrlToEntdecken()) {
    return <Navigate to={ENTDECKEN_ROUTE} replace />
  }

  if (isMobileView()) {
    return <Navigate to={PROJECT_ROUTES['k2-galerie'].galerie} replace />
  }

  return <DevViewPage />
}

/** Auf Mobile: /dev-view → sofort Galerie (niemals 4 Seiten/Smart Panel). */
function DevViewMobileRedirect() {
  if (isMobileView()) {
    return <Navigate to={PROJECT_ROUTES['k2-galerie'].galerie} replace />
  }
  return <DevViewPage />
}

/** Admin-Login dauerhaft: Bei App-Start sessionStorage aus localStorage wiederherstellen (Mobil bleibt eingeloggt). */
const K2_ADMIN_CONTEXT_KEY = 'k2-admin-context'

function restoreAdminSessionIfNeeded() {
  try {
    if (typeof sessionStorage === 'undefined' || typeof localStorage === 'undefined') return
    const pathname = window.location.pathname
    // Root oder K2-Galerie (nicht öffentliche Demo) – damit Mobil nach Reload wieder eingeloggt ist
    const isK2Route = pathname === '/' || (pathname.startsWith('/projects/k2-galerie') && !pathname.includes('galerie-oeffentlich'))
    if (!isK2Route) return
    if (sessionStorage.getItem(K2_ADMIN_CONTEXT_KEY)) return // schon gesetzt
    if (clearAdminUnlockIfExpired()) return // war abgelaufen, jetzt weg
    const unlocked = localStorage.getItem(K2_ADMIN_UNLOCKED_KEY)
    if (unlocked !== 'k2') return
    sessionStorage.setItem(K2_ADMIN_CONTEXT_KEY, 'k2')
  } catch (_) {}
}

/** Druck-Fußzeile: Dokumentenersteller + Druckdatum (nur im Druck sichtbar, Seitenzahl kommt aus @page) */
function PrintFooter() {
  const ref = useRef<HTMLDivElement>(null)
  const update = () => {
    if (ref.current) {
      const date = new Date().toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' })
      ref.current.textContent = `${PRODUCT_BRAND_NAME} | Druck: ${date}`
    }
  }
  useEffect(() => {
    update()
    window.addEventListener('beforeprint', update)
    return () => window.removeEventListener('beforeprint', update)
  }, [])
  return <div id="print-footer" ref={ref} aria-hidden />
}

function App() {
  const location = useLocation()

  // SEO: Seitentitel und Meta-Beschreibung pro Route (Sichtbarkeit Punkt 1)
  useEffect(() => {
    const meta = getPageMeta(location.pathname)
    applyPageMeta(meta)
  }, [location.pathname])

  // Beim Start: Gespeicherten Admin-Login wiederherstellen (Mobil: Kasse/Admin bleibt gültig)
  useEffect(() => {
    restoreAdminSessionIfNeeded()
  }, [])

  // Admin-Chunk im Hintergrund vorladen, damit Direktlinks (z. B. Öffentlichkeitsarbeit) den Chunk oft schon haben
  useEffect(() => {
    const t = setTimeout(() => {
      import('./components/AdminRoute').catch(() => {})
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  // Schwarzer Vollbild-Guide: aus (GlobaleGuideBegleitung = Stub). Flow: src/utils/k2GuideFlowStorage.ts (grüner Admin-Balken ök2/VK2).

  return (
    <TenantProvider>
    <AppErrorBoundary>
    <div style={{ width: '100%', minWidth: 0 }}>
    <StandBadgeSync />
    {/* Brand-Button entfernt – bei der Arbeit nicht nötig; bei Bedarf in BrandLogo.tsx wieder einbinden. APf-Float-Button entfernt – nirgends mehr benötigt. */}
    <Routes>
      {/* Schreiben an Michael – nur diese eine Seite, keine APf, keine Galerie */}
      <Route path={PILOT_SCHREIBEN_ROUTE} element={<PilotStartPage />} />
      {/* Root-Route: Vercel/kgm → Entdecken; localhost Mobile → Galerie, Desktop → DevView/APf */}
      <Route path="/" element={
        <AppErrorBoundary>
          <MobileRootRedirect />
        </AppErrorBoundary>
      } />
      
      {/* Galerie als separate Route */}
      <Route path="/galerie-home" element={<GaleriePage />} />
      <Route path="/flyer-k2-galerie" element={<FlyerK2GaleriePage />} />
      <Route path="/prospekt-k2-galerie" element={<ProspektK2GaleriePage />} />
      <Route path="/presse-einladung-k2-galerie" element={<PresseEinladungK2GaleriePage />} />
      {/* Präsentationsmappe: Kurzvariante (Teal/Weiß) + Vollversion (große Mappe, viele Kapitel). */}
      <Route path="/projects/k2-galerie/praesentationsmappe-vollversion" element={<PraesentationsmappeVollversionPage />} />
      <Route path="/projects/k2-galerie/praesentationsmappe" element={<PraesentationsmappePage />} />
      {/* Plattform-Routen – auf Mobile sofort Galerie (kein Smart Panel) */}
      <Route path="/platform" element={
        <AppErrorBoundary>
          {isMobileView() ? <Navigate to={PROJECT_ROUTES['k2-galerie'].galerie} replace /> : <DevViewPage />}
        </AppErrorBoundary>
      } />
      <Route path={PLATFORM_ROUTES.key} element={<KeyPage />} />
      <Route path={PLATFORM_ROUTES.kosten} element={<KostenPage />} />
      <Route path={PLATFORM_ROUTES.licences} element={<Navigate to={PROJECT_ROUTES['k2-galerie'].licences} replace />} />
      <Route path="/platform/github-token" element={<GitHubTokenPage />} />
      <Route path={PLATFORM_ROUTES.dialog} element={<DialogStandalonePage />} />
      <Route path="/platform/second-mac" element={<SecondMacPage />} />
      
      {/* mök2 – eigener Bereich (Vertrieb & Promotion), nur indirekt mit App-Entwicklung verbunden */}
      <Route path={MOK2_ROUTE} element={<Navigate to={PROJECT_ROUTES['k2-galerie'].marketingOek2} replace />} />
      {/* Willkommensseite (Werbung/Flyer): Zugangsbereich, Anmelden, Erster Entwurf – mök2-Stil */}
      <Route path={WILLKOMMEN_ROUTE} element={<WillkommenPage />} />
      <Route path={ENTDECKEN_ROUTE} element={<EntdeckenPage />} />
      {/* Kreativwerkstatt = K2-Markt-Oberfläche (Leitvision, Ablauf, Studio, Tor) – kurze URL für Homepage/Link */}
      <Route path={KREATIVWERKSTATT_ROUTE} element={<K2MarktSchichtPage />} />
      {/* Allgemeine Geschäftsbedingungen – rechtliche Absicherung */}
      <Route path={AGB_ROUTE} element={<AGBPage />} />
      {/* Projekt-Routen – spezifische Pfade VOR /projects/:projectId, damit VK2/K2-Markt nicht abgefangen werden */}
      <Route path={PLATFORM_ROUTES.projects} element={<ProjectsPage />} />
      {/* K2 Markt – eigenständiges Projekt (Datenquelle ök2). Homepage = Arbeitsoberfläche = manuell arbeiten; netzfähig wie ök2 und K2 Familie */}
      <Route path={PROJECT_ROUTES['k2-markt'].home} element={<K2MarktSchichtPage />} />
      <Route path={PROJECT_ROUTES['k2-markt'].uebersicht} element={<K2MarktOberflaechePage />} />
      <Route path={PROJECT_ROUTES['k2-markt'].mappe} element={<K2MarktPage />} />
      <Route path={PROJECT_ROUTES['k2-markt'].schicht} element={<K2MarktSchichtPage />} />
      <Route path={PROJECT_ROUTES['k2-markt'].tor} element={<K2MarktTorPage />} />
      {/* Legacy: alte K2-Markt-Pfade unter k2-galerie → Redirect auf eigenständiges Projekt */}
      <Route path="/projects/k2-galerie/k2-markt-oberflaeche" element={<Navigate to={PROJECT_ROUTES['k2-markt'].home} replace />} />
      <Route path="/projects/k2-galerie/k2-markt-tor" element={<Navigate to={PROJECT_ROUTES['k2-markt'].tor} replace />} />
      <Route path="/projects/k2-galerie/k2-markt" element={<Navigate to={PROJECT_ROUTES['k2-markt'].mappe} replace />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerie} element={<GaleriePage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich} element={<PlatformOnlyRoute><Ok2ThemeWrapper><GaleriePage musterOnly /></Ok2ThemeWrapper></PlatformOnlyRoute>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau} element={<PlatformOnlyRoute><Ok2ThemeWrapper><GalerieVorschauPage musterOnly /></Ok2ThemeWrapper></PlatformOnlyRoute>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerieVorschau} element={<GalerieVorschauPage />} />
      {/* VK2 Vereinsplattform – nur auf Plattform-Instanz (Lizenznehmer haben keinen Zugriff) */}
      <Route path={PROJECT_ROUTES.vk2.home} element={<PlatformOnlyRoute><Navigate to={PROJECT_ROUTES.vk2.galerie} replace /></PlatformOnlyRoute>} />
      <Route path={PROJECT_ROUTES.vk2.galerie} element={<PlatformOnlyRoute><Vk2GaleriePage /></PlatformOnlyRoute>} />
      <Route path={PROJECT_ROUTES.vk2.katalog} element={<PlatformOnlyRoute><Vk2KatalogPage /></PlatformOnlyRoute>} />
      <Route path={PROJECT_ROUTES.vk2.galerieVorschau} element={<PlatformOnlyRoute><Vk2GalerieVorschauPage /></PlatformOnlyRoute>} />
      <Route path={PROJECT_ROUTES.vk2.mitgliedLogin} element={<PlatformOnlyRoute><Vk2MitgliedLoginPage /></PlatformOnlyRoute>} />
      <Route path={PROJECT_ROUTES.vk2.kunden} element={<PlatformOnlyRoute><KundenPage vk2 /></PlatformOnlyRoute>} />
      <Route path={PROJECT_ROUTES.vk2.vollversion} element={<PlatformOnlyRoute><Navigate to="/admin?context=vk2" replace /></PlatformOnlyRoute>} />
      {/* Dynamischer Mandant (Lizenz-URL nach Checkout): /g/:tenantId */}
      <Route path="/g/:tenantId" element={<GalerieTenantPage />} />
      <Route path={PROJECT_ROUTES['k2-familie'].home} element={<K2FamilieLayout />}>
        <Route index element={<K2FamilieHomePage />} />
        <Route path="uebersicht" element={<K2FamilieStartPage />} />
        <Route path="stammbaum" element={<K2FamilieStammbaumPage />} />
        <Route path="grundstruktur" element={<K2FamilieGrundstrukturPage />} />
        <Route path="events" element={<K2FamilieEventsPage />} />
        <Route path="kalender" element={<K2FamilieKalenderPage />} />
        <Route path="geschichte" element={<K2FamilieGeschichtePage />} />
        <Route path="gedenkort" element={<K2FamilieGedenkortPage />} />
        <Route path="handbuch" element={<K2FamilieHandbuchPage />} />
        <Route path="sicherung" element={<K2FamilieSicherungPage />} />
        <Route path="personen/:id" element={<K2FamiliePersonPage />} />
      </Route>
      <Route path="/projects/:projectId" element={<ProjectStartPage />} />
            <Route path={PROJECT_ROUTES['k2-galerie'].platzanordnung} element={<PlatzanordnungPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].shop} element={<ShopPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].kassa} element={<KassaEinstiegPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].kassabuch} element={<KassabuchPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].kassabuchAusgang} element={<KassausgangPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].buchhaltung} element={<BuchhaltungPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].virtuellerRundgang} element={<VirtuellerRundgangPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].seitengestaltung} element={<SeitengestaltungPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].controlStudio} element={<ControlStudioPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].kunden} element={<KundenPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].plan} element={<ProjectPlanPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].notizenBriefAugust} element={<BriefAnAugustPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].notizenBriefAndreas} element={<BriefAnAndreasPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].notizenEinladungEroeffnung24} element={<EinladungFreundeEroeffnungNotizPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].notizen} element={<NotizenPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].mobileConnect} element={<MobileConnectPage />} />
      <Route path="/projects/k2-galerie/vita/:artistId" element={<VitaPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].produktVorschau} element={<ProduktVorschauPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].marketingOek2} element={<Mok2Layout><MarketingOek2Page embeddedInMok2Layout /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].prospektGalerieeroeffnung} element={<ProspektGalerieeroeffnungPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].pilotStart} element={<Navigate to={PILOT_SCHREIBEN_ROUTE} replace />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].softwareentwicklung} element={<Mok2Layout><K2SoftwareentwicklungPage /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].werbeunterlagen} element={<Mok2Layout><WerbeunterlagenPage embeddedInMok2Layout /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].uebersicht} element={<Mok2Layout><UebersichtBoardPage /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].kampagneMarketingStrategie} element={<KampagneMarketingStrategiePage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].licences} element={<Mok2Layout><LicencesPage embeddedInMok2Layout /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].lizenzKaufen} element={<Mok2Layout><LizenzKaufenPage /></Mok2Layout>} />
      <Route path="/lizenz-erfolg" element={<LizenzErfolgPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].empfehlungstool} element={<Mok2Layout><EmpfehlungstoolPage /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].verguetung} element={<Mok2Layout><VerguetungPage /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].platzanordnung} element={<PlatzanordnungPage />} />
      <Route path="/k2team-handbuch" element={<K2TeamHandbuchPage />} />
      <Route path="/zettel-martina-muna" element={<Navigate to="/zettel-pilot" replace />} />
      <Route path="/zettel-pilot" element={<ZettelPilotPage />} />
      <Route path="/zettel-pilot-form" element={<ZettelPilotFormPage />} />
      <Route path="/k2-galerie-handbuch" element={<K2GalerieHandbuchPage />} />
      <Route path="/benutzer-handbuch" element={<BenutzerHandbuchPage />} />
      <Route path="/vk2-handbuch" element={<Vk2HandbuchPage />} />
      
      {/* Legacy-Routen (Redirect für bestehende Links) */}
      <Route path="/key" element={<Navigate to={PLATFORM_ROUTES.key} replace />} />
      <Route path="/kosten" element={<Navigate to={PLATFORM_ROUTES.kosten} replace />} />
      <Route path="/dialog" element={<Navigate to={PLATFORM_ROUTES.dialog} replace />} />
      <Route path="/galerie" element={<GaleriePage />} />
      {/* Künstler-Einstieg: eigener Zugang zum Admin (kein Admin-Button auf der Galerie) */}
      <Route path={MEIN_BEREICH_ROUTE} element={<MeinBereichPage />} />
      {/* /admin/login → sofort zur Galerie (keine AdminLoginPage-Route, um Crash-Risiko zu vermeiden) */}
      <Route path="/admin/login" element={<Navigate to={PROJECT_ROUTES['k2-galerie'].galerie} replace />} />
      <Route path="/admin" element={
        <AdminErrorBoundary>
          <AppErrorBoundary>
            <AdminRoute />
          </AppErrorBoundary>
        </AdminErrorBoundary>
      } />
      <Route path="/control-studio" element={<Navigate to={PROJECT_ROUTES['k2-galerie'].controlStudio} replace />} />
      <Route path={PLATFORM_ROUTES.missionControl} element={<MissionControlPage />} />
      <Route path="/mobile-connect" element={<Navigate to={PROJECT_ROUTES['k2-galerie'].mobileConnect} replace />} />
      
      {/* Dev-Tool für parallele Ansichten – auf Mobile → Galerie (keine 4 Seiten/Smart Panel) */}
      <Route path="/dev-view" element={
        <AppErrorBoundary>
          <DevViewMobileRedirect />
        </AppErrorBoundary>
      } />
      
      <Route path="*" element={<NotFoundOrRedirect />} />
    </Routes>

    {/* Druck-Fußzeile: Dokumentenersteller | Druckdatum (Seitenzahl via @page in index.css) */}
    <PrintFooter />
    </div>
    </AppErrorBoundary>
    </TenantProvider>
  )
}

export default App
