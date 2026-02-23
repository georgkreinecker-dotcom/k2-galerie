import { useEffect, useState, useRef, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import ProjectsPage from './pages/ProjectsPage'
import ProjectStartPage from './pages/ProjectStartPage'
import ControlStudioPage from './pages/ControlStudioPage'
import ProjectPlanPage from './pages/ProjectPlanPage'
import K2TeamHandbuchPage from './pages/K2TeamHandbuchPage'
import MobileConnectPage from './pages/MobileConnectPage'
import ProduktVorschauPage from './pages/ProduktVorschauPage'
import MarketingOek2Page from './pages/MarketingOek2Page'
import WerbeunterlagenPage from './pages/WerbeunterlagenPage'
import Mok2Layout from './components/Mok2Layout'
import GaleriePage from './pages/GaleriePage'
import GalerieVorschauPage from './pages/GalerieVorschauPage'
import PlatzanordnungPage from './pages/PlatzanordnungPage'
import VitaPage from './pages/VitaPage'
import ShopPage from './pages/ShopPage'
import VirtuellerRundgangPage from './pages/VirtuellerRundgangPage'
import DialogStandalonePage from './pages/DialogStandalonePage'
import KeyPage from './pages/KeyPage'
import KostenPage from './pages/KostenPage'
import GitHubTokenPage from './pages/GitHubTokenPage'
import LicencesPage from './pages/LicencesPage'
import EmpfehlungstoolPage from './pages/EmpfehlungstoolPage'
import VerguetungPage from './pages/VerguetungPage'
import SecondMacPage from './pages/SecondMacPage'
// Admin-Route lazy, damit Supabase Auth erst bei /admin geladen wird (Crash-Vermeidung)
const AdminRoute = lazy(() => import('./components/AdminRoute').then(m => ({ default: m.default })))
import { Ok2ThemeWrapper } from './components/Ok2ThemeWrapper'
import DevViewPage from './pages/DevViewPage'
import PlatformStartPage from './pages/PlatformStartPage'
import FlyerK2GaleriePage from './pages/FlyerK2GaleriePage'
import PresseEinladungK2GaleriePage from './pages/PresseEinladungK2GaleriePage'
import KundenPage from './pages/KundenPage'
import { PLATFORM_ROUTES, PROJECT_ROUTES, MOK2_ROUTE, WILLKOMMEN_ROUTE, AGB_ROUTE, ENTDECKEN_ROUTE } from './config/navigation'
import WillkommenPage from './pages/WillkommenPage'
import EntdeckenPage from './pages/EntdeckenPage'
import AGBPage from './pages/AGBPage'
import { GlobaleGuideBegleitung } from './components/GlobaleGuideBegleitung'
import SeitengestaltungPage from './pages/SeitengestaltungPage'
import { BUILD_LABEL, BUILD_TIMESTAMP } from './buildInfo.generated'
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
            Wenn die K2-Seite nach Drucken/Teilen nicht mehr lädt: „Reset &amp; neu laden“ versuchen.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => {
                try {
                  const keys: string[] = []
                  for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i)
                    if (k && k.startsWith('k2-')) keys.push(k)
                  }
                  keys.forEach(k => localStorage.removeItem(k))
                  sessionStorage.clear()
                } catch (_) {}
                // Im iframe (Cursor Preview) kein Reload – verhindert Loop/Crash
                if (typeof window !== 'undefined' && window.self !== window.top) {
                  this.setState({ hasError: false })
                  return
                }
                window.location.reload()
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
              onClick={() => {
                if (typeof window !== 'undefined' && window.self !== window.top) {
                  this.setState({ hasError: false })
                  return
                }
                window.location.reload()
              }}
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
            onClick={() => {
              if (typeof window !== 'undefined' && window.self !== window.top) {
                this.setState({ hasError: false })
                return
              }
              window.location.reload()
            }}
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

/** Cache-Bypass: komplette Seite mit neuem URL-Parameter laden (umgeht Browser-Cache). */
function doHardReload() {
  const u = typeof window !== 'undefined' ? window.location : null
  if (!u) return
  const sep = u.pathname.includes('?') ? '&' : '?'
  u.href = u.origin + u.pathname + sep + 'v=' + Date.now()
}

function StandBadgeSync() {
  const [serverNewer, setServerNewer] = useState(false)
  const [displayLabel, setDisplayLabel] = useState(BUILD_LABEL)
  const isLocal = typeof window !== 'undefined' && /^https?:\/\/localhost|127\.0\.0\.1/i.test(window.location?.origin || '')

  // Auf Vercel/Produktion: Stand vom Server holen → Badge zeigt immer aktuellen Stand (auch auf Mac bei gecachtem Bundle)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])
  useEffect(() => {
    if (isLocal) return
    const url = '/build-info.json?t=' + Date.now() + '&r=' + Math.random()
    fetch(url, { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { label?: string; timestamp?: number } | null) => {
        if (!mountedRef.current || !data) return
        if (data.label) setDisplayLabel(data.label)
        if (data.timestamp && data.timestamp > BUILD_TIMESTAMP) setServerNewer(true)
      })
      .catch(() => {})
  }, [isLocal])

  // KEIN automatischer Reload bei serverNewer – verursacht in Cursor Preview Reload-Loop (Server neuer → Reload → wieder Server neuer → wieder Reload → Code-5-Crash). Nur Badge anzeigen, Nutzer tippt selbst.
  // useEffect(() => { if (!serverNewer) return; const t = setTimeout(doHardReload, 1200); return () => clearTimeout(t) }, [serverNewer])  ← entfernt

  const isMobile = typeof window !== 'undefined' && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768)
  const label = serverNewer
    ? (isMobile ? 'Neuer Stand – tippen!' : 'Aktualisiere …')
    : (isLocal ? `Stand: ${BUILD_LABEL} (lokal)` : `Stand: ${displayLabel}`)
  const title = isLocal
    ? 'Lokal gebaut. Gleich überall: pushen, dann auf Handy neu scannen.'
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
          onClick={doHardReload}
          onKeyDown={(e) => e.key === 'Enter' && doHardReload()}
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
      <div
        id="app-stand-badge"
        role="status"
        onClick={doHardReload}
        title={title}
        style={{
          position: 'fixed',
          bottom: 10,
          left: 10,
          zIndex: 2147483647,
          fontSize: isMobile ? 14 : 12,
          color: '#fff',
          background: serverNewer ? 'rgba(200,120,0,0.95)' : 'rgba(0,0,0,0.85)',
          padding: isMobile ? '8px 12px' : '6px 10px',
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          pointerEvents: 'auto'
        }}
      >
        {label}
      </div>
    </>
  )
}

const isMobileView = () => typeof window !== 'undefined' && (
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
  (window.innerWidth <= 768 && ('ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0)) ||
  window.innerWidth <= 768 // schmaler Bildschirm = immer Galerie (kein Smart Panel), auch bei „Desktop“-Browser
)

/** Auf Mobile / schmalem Bildschirm: Root "/" → sofort Galerie (niemals DevView/Smart Panel). */
function MobileRootRedirect() {
  if (isMobileView()) {
    return <Navigate to={PROJECT_ROUTES['k2-galerie'].galerie} replace />
  }
  return <DevViewPage defaultPage="galerie" />
}

/** Auf Mobile: /dev-view → sofort Galerie (niemals 4 Seiten/Smart Panel). */
function DevViewMobileRedirect() {
  if (isMobileView()) {
    return <Navigate to={PROJECT_ROUTES['k2-galerie'].galerie} replace />
  }
  return <DevViewPage />
}

/** Admin-Login dauerhaft: Bei App-Start sessionStorage aus localStorage wiederherstellen (Mobil bleibt eingeloggt). */
const K2_ADMIN_UNLOCKED_KEY = 'k2-admin-unlocked'
const K2_ADMIN_UNLOCKED_EXPIRY_KEY = 'k2-admin-unlocked-expiry'
const K2_ADMIN_CONTEXT_KEY = 'k2-admin-context'

function restoreAdminSessionIfNeeded() {
  try {
    if (typeof sessionStorage === 'undefined' || typeof localStorage === 'undefined') return
    const pathname = window.location.pathname
    // Root oder K2-Galerie (nicht öffentliche Demo) – damit Mobil nach Reload wieder eingeloggt ist
    const isK2Route = pathname === '/' || (pathname.startsWith('/projects/k2-galerie') && !pathname.includes('galerie-oeffentlich'))
    if (!isK2Route) return
    if (sessionStorage.getItem(K2_ADMIN_CONTEXT_KEY)) return // schon gesetzt
    const unlocked = localStorage.getItem(K2_ADMIN_UNLOCKED_KEY)
    if (unlocked !== 'k2') return
    const expiry = localStorage.getItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY)
    if (expiry && Date.now() > parseInt(expiry, 10)) {
      localStorage.removeItem(K2_ADMIN_UNLOCKED_KEY)
      localStorage.removeItem(K2_ADMIN_UNLOCKED_EXPIRY_KEY)
      return
    }
    sessionStorage.setItem(K2_ADMIN_CONTEXT_KEY, 'k2')
  } catch (_) {}
}

/** Aktuelle Route → APf-Tab (DevView page id), damit die gleiche Seite in der APf geöffnet wird */
function getApfPageFromPath(pathname: string, search: string): string {
  if (pathname === '/') {
    const page = new URLSearchParams(search).get('page')
    return page || 'platform'
  }
  if (pathname === '/admin') return 'admin'
  if (pathname === PLATFORM_ROUTES.projects) return 'projects'
  if (pathname === PROJECT_ROUTES['k2-galerie'].galerie) return 'galerie'
  if (pathname === PROJECT_ROUTES['k2-galerie'].galerieOeffentlich) return 'galerie-oeffentlich'
  if (pathname === PROJECT_ROUTES['k2-galerie'].galerieVorschau) return 'galerie-vorschau'
  if (pathname === PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau) return 'galerie-oeffentlich-vorschau'
  if (pathname === PROJECT_ROUTES['k2-galerie'].platzanordnung) return 'platzanordnung'
  if (pathname === PROJECT_ROUTES['k2-galerie'].shop) return 'shop'
  if (pathname === PROJECT_ROUTES['k2-galerie'].controlStudio) return 'control'
  if (pathname === PROJECT_ROUTES['k2-galerie'].plan) return 'mission'
  if (pathname === PROJECT_ROUTES['k2-galerie'].produktVorschau) return 'produkt-vorschau'
  if (pathname === PROJECT_ROUTES['k2-galerie'].marketingOek2) return 'marketing-oek2'
  if (pathname.startsWith('/projects/k2-galerie')) return 'galerie' // z. B. Projekt-Start → Galerie
  return 'platform'
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentApfPage = getApfPageFromPath(location.pathname, location.search || '')
  const isOnApf = location.pathname === '/'

  // Beim Start: Gespeicherten Admin-Login wiederherstellen (Mobil: Kasse/Admin bleibt gültig)
  useEffect(() => {
    restoreAdminSessionIfNeeded()
  }, [])

  return (
    <AppErrorBoundary>
    <StandBadgeSync />
    {/* Brand-Button entfernt – bei der Arbeit nicht nötig; bei Bedarf in BrandLogo.tsx wieder einbinden */}
    {/* Von jeder Seite in die APf – gleiche Seite bleibt in der APf geöffnet; Vollbild wird beendet */}
    {typeof window !== 'undefined' && !isMobileView() && !isOnApf && (
      <button
        type="button"
        onClick={() => {
          try {
            if (document.fullscreenElement) (document as any).exitFullscreen?.()
          } catch (_) {}
          navigate(`/?page=${currentApfPage}`)
        }}
        title={`Zurück zur APf (diese Seite: ${currentApfPage})`}
        className="apf-float-btn"
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 99998,
          padding: '8px 14px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#fff',
          background: 'linear-gradient(135deg, var(--k2-accent, #ff8c42) 0%, #e67a2a 100%)',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        }}
      >
        APf
      </button>
    )}
    <Routes>
      {/* Root-Route: Auf Mobile → direkt Galerie, auf Desktop → DevView/APf */}
      <Route path="/" element={
        <AppErrorBoundary>
          <MobileRootRedirect />
        </AppErrorBoundary>
      } />
      
      {/* Galerie als separate Route */}
      <Route path="/galerie-home" element={<GaleriePage />} />
      <Route path="/flyer-k2-galerie" element={<FlyerK2GaleriePage />} />
      <Route path="/presse-einladung-k2-galerie" element={<PresseEinladungK2GaleriePage />} />
      
      {/* Plattform-Routen – auf Mobile sofort Galerie (kein Smart Panel) */}
      <Route path="/platform" element={
        <AppErrorBoundary>
          {isMobileView() ? <Navigate to={PROJECT_ROUTES['k2-galerie'].galerie} replace /> : <DevViewPage defaultPage="mission" />}
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
      {/* Allgemeine Geschäftsbedingungen – rechtliche Absicherung */}
      <Route path={AGB_ROUTE} element={<AGBPage />} />
      {/* Projekt-Routen – spezifische Pfade VOR /projects/:projectId, damit VK2 nicht abgefangen wird */}
      <Route path={PLATFORM_ROUTES.projects} element={<ProjectsPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerie} element={<GaleriePage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich} element={<Ok2ThemeWrapper><GaleriePage musterOnly /></Ok2ThemeWrapper>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau} element={<Ok2ThemeWrapper><GalerieVorschauPage musterOnly /></Ok2ThemeWrapper>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerieVorschau} element={<GalerieVorschauPage />} />
      {/* VK2 Vereinsplattform – muss vor /projects/:projectId stehen */}
      <Route path={PROJECT_ROUTES.vk2.home} element={<Navigate to={PROJECT_ROUTES.vk2.galerie} replace />} />
      <Route path={PROJECT_ROUTES.vk2.galerie} element={<GaleriePage vk2 />} />
      <Route path={PROJECT_ROUTES.vk2.galerieVorschau} element={<GalerieVorschauPage vk2 />} />
      <Route path={PROJECT_ROUTES.vk2.kunden} element={<KundenPage vk2 />} />
      <Route path={PROJECT_ROUTES.vk2.vollversion} element={<Navigate to="/admin?context=vk2" replace />} />
      <Route path="/projects/:projectId" element={<ProjectStartPage />} />
            <Route path={PROJECT_ROUTES['k2-galerie'].platzanordnung} element={<PlatzanordnungPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].shop} element={<ShopPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].virtuellerRundgang} element={<VirtuellerRundgangPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].seitengestaltung} element={<SeitengestaltungPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].controlStudio} element={<ControlStudioPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].kunden} element={<KundenPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].plan} element={<ProjectPlanPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].mobileConnect} element={<MobileConnectPage />} />
      <Route path="/projects/k2-galerie/vita/:artistId" element={<VitaPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].produktVorschau} element={<ProduktVorschauPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].marketingOek2} element={<Mok2Layout><MarketingOek2Page embeddedInMok2Layout /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].werbeunterlagen} element={<Mok2Layout><WerbeunterlagenPage embeddedInMok2Layout /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].licences} element={<Mok2Layout><LicencesPage embeddedInMok2Layout /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].empfehlungstool} element={<Mok2Layout><EmpfehlungstoolPage /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].verguetung} element={<Mok2Layout><VerguetungPage /></Mok2Layout>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].platzanordnung} element={<PlatzanordnungPage />} />
      <Route path="/k2team-handbuch" element={<K2TeamHandbuchPage />} />
      
      {/* Legacy-Routen (Redirect für bestehende Links) */}
      <Route path="/key" element={<Navigate to={PLATFORM_ROUTES.key} replace />} />
      <Route path="/kosten" element={<Navigate to={PLATFORM_ROUTES.kosten} replace />} />
      <Route path="/dialog" element={<Navigate to={PLATFORM_ROUTES.dialog} replace />} />
      <Route path="/galerie" element={<GaleriePage />} />
      {/* /admin/login → sofort zur Galerie (keine AdminLoginPage-Route, um Crash-Risiko zu vermeiden) */}
      <Route path="/admin/login" element={<Navigate to={PROJECT_ROUTES['k2-galerie'].galerie} replace />} />
      <Route path="/admin" element={
        <AdminErrorBoundary>
          <AppErrorBoundary>
            <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1a0f0a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Lade …</div>}>
              <AdminRoute />
            </Suspense>
          </AppErrorBoundary>
        </AdminErrorBoundary>
      } />
      <Route path="/control-studio" element={<Navigate to={PROJECT_ROUTES['k2-galerie'].controlStudio} replace />} />
      <Route path={PLATFORM_ROUTES.missionControl} element={<Navigate to={PLATFORM_ROUTES.projects} replace />} />
      <Route path="/mobile-connect" element={<Navigate to={PROJECT_ROUTES['k2-galerie'].mobileConnect} replace />} />
      
      {/* Dev-Tool für parallele Ansichten – auf Mobile → Galerie (keine 4 Seiten/Smart Panel) */}
      <Route path="/dev-view" element={
        <AppErrorBoundary>
          <DevViewMobileRedirect />
        </AppErrorBoundary>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    {/* Globaler Guide-Begleiter – läuft auf jeder Seite nahtlos weiter */}
    <GlobaleGuideBegleitung />

    </AppErrorBoundary>
  )
}

export default App
