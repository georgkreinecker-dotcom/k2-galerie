import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// QR-Scan im mobilen LAN: Einmal Reload mit Cache-Buster. NUR echte Mobile-Geräte (UserAgent), nicht schmale Desktop-Fenster (Cursor/Dev ≤768px) – sonst Endlosschleife/Crash.
// Im iframe (Cursor Preview) NIEMALS replace – sonst Reload-Loop/Crash (Regel: stand-qr, crash-waehrend-programmieren).
const isMobileDevice = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const notInIframe = typeof window !== 'undefined' && window.self === window.top
const skipBootstrapForReload = notInIframe && isMobileDevice && !/[?&]_=\d+/.test(window.location.href)
if (skipBootstrapForReload) {
  const url = window.location.href
  const sep = url.includes('?') ? '&' : '?'
  window.location.replace(url + sep + '_=' + Date.now())
}

// Cache-Busting: Versions-Info für Debugging
const BUILD_VERSION = '1.0.0-' + Date.now()
if (typeof window !== 'undefined') {
  (window as any).__BUILD_VERSION__ = BUILD_VERSION
  console.log('🔨 Build-Version:', BUILD_VERSION)
}

// Safari Drag & Drop Fix: Verhindert dass Safari Dateien als neue Seite öffnet
// Muss global gesetzt sein, sonst öffnet Safari beim Drop die Datei im Browser-Fenster
if (typeof window !== 'undefined') {
  document.addEventListener('dragover', (e) => e.preventDefault(), false)
  document.addEventListener('drop', (e) => e.preventDefault(), false)
}

// StrictMode DEAKTIVIERT: Verursacht doppeltes Mounten und Crashes (Code 5)
// Im Development werden Komponenten doppelt gemountet → doppelte Event-Listener → Crashes

// GLOBALER CRASH-HANDLER: Fängt ALLE unerwarteten Fehler ab (auch von Cursor)
let crashHandlerInstalled = false

function installCrashHandlers() {
  if (crashHandlerInstalled) return
  crashHandlerInstalled = true
  
  // Importiere Safe Mode Utilities
  import('./utils/safeMode').then(({ registerCrash, activateSafeMode }) => {
    // Error Handler - VERHINDERT CRASHES
    window.addEventListener('error', (event) => {
      console.error('🚨 Globaler Fehler abgefangen:', event.error)
      registerCrash()
      // Verhindere dass der Fehler die App crasht
      event.preventDefault()
      event.stopPropagation()
      return false
    }, true) // Capture Phase für frühes Abfangen
    
    // Unhandled Rejection Handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unbehandelte Promise-Rejection:', event.reason)
      registerCrash()
      // Verhindere dass die Promise-Rejection die App crasht
      event.preventDefault()
    }, true)
    
    // Zusätzlicher Schutz: Fange alle möglichen Crash-Ursachen ab
    const originalOnError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('🚨 window.onerror:', { message, source, lineno, colno, error })
      registerCrash()
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error)
      }
      return true // Verhindere Standard-Fehlerbehandlung
    }
  }).catch(() => {
    // Falls Import fehlschlägt, installiere einfache Handler
    window.addEventListener('error', (event) => {
      console.error('🚨 Fehler:', event.error)
      event.preventDefault()
      return false
    }, true)
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Promise-Rejection:', event.reason)
      event.preventDefault()
    }, true)
  })
}

// Crash-Handler SOFORT synchron installieren (bevor async safeMode lädt), damit frühe Fehler nicht crashen
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => { e.preventDefault(); e.stopPropagation(); return false }, true)
  window.addEventListener('unhandledrejection', (e) => { e.preventDefault() }, true)
}
installCrashHandlers()

// Cursor-spezifischer Crash-Schutz - REDUZIERT MEMORY-NUTZUNG
if (typeof window !== 'undefined') {
  // Reduziere Console-Output für Cursor Preview (verhindert Memory-Probleme)
  const originalConsoleError = console.error
  const originalConsoleLog = console.log
  const originalConsoleWarn = console.warn
  
  let logCount = 0
  const MAX_LOGS = 100 // Max 100 Logs pro Session
  
  console.error = (...args: any[]) => {
    if (logCount++ < MAX_LOGS) {
      try {
        originalConsoleError.apply(console, args)
      } catch (e) {
        // Ignoriere Fehler beim Logging
      }
    }
  }
  
  console.log = (...args: any[]) => {
    if (logCount++ < MAX_LOGS) {
      try {
        originalConsoleLog.apply(console, args)
      } catch (e) {
        // Ignoriere Fehler beim Logging
      }
    }
  }
  
  console.warn = (...args: any[]) => {
    if (logCount++ < MAX_LOGS) {
      try {
        originalConsoleWarn.apply(console, args)
      } catch (e) {
        // Ignoriere Fehler beim Logging
      }
    }
  }
  
  // Kein setInterval mehr hier – verursachte unnötige Timer und konnte bei HMR/Reload zu Mehrfach-Intervallen führen
}

// Design-Farben aus Admin sofort anwenden (damit „So sehen Kunden die Galerie“ und alle Seiten die gespeicherten Farben zeigen)
function applyDesignFromStorageSync() {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('k2-design-settings') : null
    if (!stored || stored.length > 50000) return
    const design = JSON.parse(stored) as Record<string, string>
    const root = document.documentElement
    if (design.accentColor) root.style.setProperty('--k2-accent', design.accentColor)
    if (design.backgroundColor1) root.style.setProperty('--k2-bg-1', design.backgroundColor1)
    if (design.backgroundColor2) root.style.setProperty('--k2-bg-2', design.backgroundColor2)
    if (design.backgroundColor3) root.style.setProperty('--k2-bg-3', design.backgroundColor3)
    if (design.textColor) root.style.setProperty('--k2-text', design.textColor)
    if (design.mutedColor) root.style.setProperty('--k2-muted', design.mutedColor)
    if (design.cardBg1) root.style.setProperty('--k2-card-bg-1', design.cardBg1)
    if (design.cardBg2) root.style.setProperty('--k2-card-bg-2', design.cardBg2)
  } catch (_) {}
}

if (!skipBootstrapForReload) {
try {
  applyDesignFromStorageSync()

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element nicht gefunden')
  }
  
  // createRoot nur EINMAL pro Seite – kein Retry mit zweitem createRoot (verursacht Crashes)
  try {
    const root = createRoot(rootElement)
    root.render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )
    console.log('✅ App erfolgreich gerendert')
  } catch (renderError) {
    console.error('FEHLER beim Rendern:', renderError)
    rootElement.innerHTML = `
    <div style="padding: 2rem; color: white; background: #1a0f0a; min-height: 100vh; font-family: system-ui; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <h1 style="color: #ff6b6b; margin-bottom: 1rem;">⚠️ App konnte nicht gestartet werden</h1>
      <p style="margin-bottom: 2rem; text-align: center; max-width: 600px;">
        Bitte versuche:<br />
        1. Seite neu laden<br />
        2. Browser-Cache leeren<br />
        3. Anderen Browser verwenden
      </p>
      <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
        🔃 Seite neu laden
      </button>
    </div>
    `
  }
} catch (error) {
  console.error('FEHLER beim App-Start:', error)
  // Escapen für XSS-Schutz: Fehlermeldungen nie ungefiltert in innerHTML
  const escapeHtml = (s: string) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  const errMsg = error instanceof Error ? error.message : String(error)
  const errStack = error instanceof Error ? error.stack : String(error)
  const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: white; background: #1a0f0a; min-height: 100vh; font-family: system-ui; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h1 style="color: #ff6b6b; margin-bottom: 1rem;">⚠️ App-Fehler</h1>
        <p style="margin-bottom: 1rem;">${escapeHtml(errMsg)}</p>
        ${isProd ? '' : `<details style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 4px; margin-bottom: 2rem; max-width: 800px; width: 100%; overflow: auto;">
          <summary style="cursor: pointer; margin-bottom: 0.5rem;">Fehler-Details</summary>
          <pre style="white-space: pre-wrap; word-break: break-word; font-size: 0.875rem; margin-top: 0.5rem;">${escapeHtml(errStack ?? '')}</pre>
        </details>`}
        <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
          🔃 Seite neu laden
        </button>
      </div>
    `
  }
}
}
