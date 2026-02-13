import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import ProjectsPage from './pages/ProjectsPage'
import ProjectStartPage from './pages/ProjectStartPage'
import ControlStudioPage from './pages/ControlStudioPage'
import MissionControlPage from './pages/MissionControlPage'
import ProjectPlanPage from './pages/ProjectPlanPage'
import K2TeamHandbuchPage from './pages/K2TeamHandbuchPage'
import MobileConnectPage from './pages/MobileConnectPage'
import ProduktVorschauPage from './pages/ProduktVorschauPage'
import GaleriePage from './pages/GaleriePage'
import GalerieVorschauPage from './pages/GalerieVorschauPage'
import PlatzanordnungPage from './pages/PlatzanordnungPage'
import ShopPage from './pages/ShopPage'
import VirtuellerRundgangPage from './pages/VirtuellerRundgangPage'
import DialogStandalonePage from './pages/DialogStandalonePage'
import KeyPage from './pages/KeyPage'
import KostenPage from './pages/KostenPage'
import GitHubTokenPage from './pages/GitHubTokenPage'
import SecondMacPage from './pages/SecondMacPage'
import ScreenshotExportAdmin from '../components/ScreenshotExportAdmin'
import { Ok2ThemeWrapper } from './components/Ok2ThemeWrapper'
import DevViewPage from './pages/DevViewPage'
import PlatformStartPage from './pages/PlatformStartPage'
import { PLATFORM_ROUTES, PROJECT_ROUTES } from './config/navigation'
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
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)',
          color: '#ffffff',
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
              onClick={() => window.location.reload()}
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
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)',
          color: '#ffffff',
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
            onClick={() => window.location.reload()}
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
  const isLocal = typeof window !== 'undefined' && /^https?:\/\/localhost|127\.0\.0\.1/i.test(window.location?.origin || '')

  useEffect(() => {
    const el = document.getElementById('app-stand-badge')
    if (!el) return
    el.style.pointerEvents = 'auto'
    el.style.cursor = 'pointer'
    const onClick = () => doHardReload()
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [])

  // Auf Vercel/Produktion: prüfen ob Server eine neuere Version hat → automatisch neu laden (kein Tippen nötig)
  useEffect(() => {
    if (isLocal) return
    const url = '/build-info.json?t=' + Date.now() + '&r=' + Math.random()
    fetch(url, { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { timestamp?: number } | null) => {
        if (data?.timestamp && data.timestamp > BUILD_TIMESTAMP) setServerNewer(true)
      })
      .catch(() => {})
  }, [isLocal])

  // Sobald Server-Version neuer ist: automatisch neu laden (umgeht Cache), ohne dass der Nutzer etwas eingeben oder tippen muss
  useEffect(() => {
    if (!serverNewer) return
    const el = document.getElementById('app-stand-badge')
    if (el) {
      el.textContent = 'Aktualisiere …'
      el.style.background = 'rgba(200,120,0,0.95)'
    }
    const t = setTimeout(doHardReload, 1200)
    return () => clearTimeout(t)
  }, [serverNewer])

  useEffect(() => {
    const el = document.getElementById('app-stand-badge')
    if (!el) return
    if (serverNewer) return // wird von anderem useEffect überschrieben
    const text = isLocal
      ? `Stand: ${BUILD_LABEL} (lokal)`
      : `Stand: ${BUILD_LABEL}`
    el.textContent = text
    el.setAttribute('title', isLocal
      ? 'Lokal gebaut. Gleich überall: pushen, dann auf Handy neu scannen.'
      : 'Tippen oder neue Seite öffnen (neuer Tab) = frischer Stand. Auch im fremden WLAN.')
    el.style.background = 'rgba(0,0,0,0.85)'
  }, [serverNewer, isLocal])

  return null
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

function App() {
  return (
    <AppErrorBoundary>
    <StandBadgeSync />
    <Routes>
      {/* Root-Route: Auf Mobile → direkt Galerie, auf Desktop → DevView/APf */}
      <Route path="/" element={
        <AppErrorBoundary>
          <MobileRootRedirect />
        </AppErrorBoundary>
      } />
      
      {/* Galerie als separate Route */}
      <Route path="/galerie-home" element={<GaleriePage />} />
      
      {/* Plattform-Routen – auf Mobile sofort Galerie (kein Smart Panel) */}
      <Route path="/platform" element={
        <AppErrorBoundary>
          {isMobileView() ? <Navigate to={PROJECT_ROUTES['k2-galerie'].galerie} replace /> : <DevViewPage defaultPage="mission" />}
        </AppErrorBoundary>
      } />
      <Route path={PLATFORM_ROUTES.key} element={<KeyPage />} />
      <Route path={PLATFORM_ROUTES.kosten} element={<KostenPage />} />
      <Route path="/platform/github-token" element={<GitHubTokenPage />} />
      <Route path={PLATFORM_ROUTES.dialog} element={<DialogStandalonePage />} />
      <Route path="/platform/second-mac" element={<SecondMacPage />} />
      
      {/* Projekt-Routen – Galerie zuerst, damit QR-Code /projects/k2-galerie/galerie auf Mobile trifft */}
      <Route path={PLATFORM_ROUTES.projects} element={<ProjectsPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerie} element={<GaleriePage />} />
      <Route path="/projects/:projectId" element={<ProjectStartPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich} element={<Ok2ThemeWrapper><GaleriePage musterOnly /></Ok2ThemeWrapper>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau} element={<Ok2ThemeWrapper><GalerieVorschauPage musterOnly /></Ok2ThemeWrapper>} />
      <Route path={PROJECT_ROUTES['k2-galerie'].galerieVorschau} element={<GalerieVorschauPage />} />
            <Route path={PROJECT_ROUTES['k2-galerie'].platzanordnung} element={<PlatzanordnungPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].shop} element={<ShopPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].virtuellerRundgang} element={<VirtuellerRundgangPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].controlStudio} element={<ControlStudioPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].plan} element={<ProjectPlanPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].mobileConnect} element={<MobileConnectPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].produktVorschau} element={<ProduktVorschauPage />} />
      <Route path={PROJECT_ROUTES['k2-galerie'].platzanordnung} element={<PlatzanordnungPage />} />
      <Route path="/k2team-handbuch" element={<K2TeamHandbuchPage />} />
      
      {/* Legacy-Routen (Redirect für bestehende Links) */}
      <Route path="/key" element={<Navigate to={PLATFORM_ROUTES.key} replace />} />
      <Route path="/kosten" element={<Navigate to={PLATFORM_ROUTES.kosten} replace />} />
      <Route path="/dialog" element={<Navigate to={PLATFORM_ROUTES.dialog} replace />} />
      <Route path="/galerie" element={<GaleriePage />} />
      <Route path="/admin" element={
        <AdminErrorBoundary>
          <AppErrorBoundary>
            <ScreenshotExportAdmin />
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
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AppErrorBoundary>
  )
}

export default App
