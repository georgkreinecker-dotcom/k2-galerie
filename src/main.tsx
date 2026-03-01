import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { safeReload } from './utils/env'

// Sofort global, damit Fehler-Buttons (index.html, Bootstrap) safeReload nutzen können
if (typeof window !== 'undefined') {
  (window as any).safeReload = safeReload
}

// Cache-Busting wird vom index.html Inject-Script erledigt (build-info.json Vergleich).
// Kein zweiter Reload hier – sonst zwei Mechanismen gleichzeitig → Seite wechselt unerwartet.
const notInIframe = typeof window !== 'undefined' && window.self === window.top
const inIframe = typeof window !== 'undefined' && window.self !== window.top

// Refresh-URL /r/<timestamp>: Einstieg mit einzigartigem Pfad (Safari cached / nicht ?v=). Nach Laden sofort auf / wechseln.
if (typeof window !== 'undefined' && window.location.pathname.startsWith('/r/')) {
  window.history.replaceState(null, '', window.location.origin + '/' + (window.location.search || ''))
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
  const MAX_LOGS = inIframe ? 15 : 100 // In Cursor Preview stark reduzieren (Crash-Vermeidung)
  
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

// Finale Lösung Crash: Im iframe (Cursor Preview) die App NICHT laden – nur Hinweis. Kein React, kein HMR, keine Last → keine Crashes.
const rootElement = typeof document !== 'undefined' ? document.getElementById('root') : null
if (rootElement && inIframe) {
  const port = typeof window !== 'undefined' && window.location.port ? window.location.port : '5177'
  const url = typeof window !== 'undefined' ? (window.location.origin.includes('localhost') ? `http://localhost:${port}` : window.location.origin) : 'http://localhost:5177'
  rootElement.innerHTML = `
    <div style="padding: 2rem; color: rgba(255,245,240,0.95); background: #1a0f0a; min-height: 100vh; font-family: system-ui; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
      <h1 style="color: #ff8c42; margin-bottom: 1rem; font-size: 1.25rem;">K2 Galerie</h1>
      <p style="margin-bottom: 1rem; max-width: 420px; line-height: 1.5;">Die App wird in der Vorschau nicht geladen – so bleibt Cursor stabil.</p>
      <p style="margin-bottom: 1.5rem; font-size: 0.95rem; color: rgba(212,165,116,0.9);">Bitte im Browser öffnen:</p>
      <a href="${url}" target="_blank" rel="noopener" style="display: inline-block; padding: 0.75rem 1.5rem; background: #ff8c42; color: #1a0f0a; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; text-decoration: none; cursor: pointer;">Im Browser öffnen</a>
      <p style="margin-top: 1.5rem; font-size: 0.8rem; color: rgba(255,255,255,0.5);">${url}</p>
    </div>
  `
} else if (rootElement) {
  // Nicht im iframe: volle App per dynamischem Import (React/App-Bundle erst hier geladen)
  import('./appBootstrap').then((m) => m.run()).catch((error) => {
    console.error('FEHLER beim App-Start:', error)
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
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: white; background: #1a0f0a; min-height: 100vh; font-family: system-ui; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h1 style="color: #ff6b6b; margin-bottom: 1rem;">⚠️ App-Fehler</h1>
        <p style="margin-bottom: 1rem;">${escapeHtml(errMsg)}</p>
        ${isProd ? '' : `<details style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 4px; margin-bottom: 2rem; max-width: 800px; width: 100%; overflow: auto;">
          <summary style="cursor: pointer; margin-bottom: 0.5rem;">Fehler-Details</summary>
          <pre style="white-space: pre-wrap; word-break: break-word; font-size: 0.875rem; margin-top: 0.5rem;">${escapeHtml(errStack ?? '')}</pre>
        </details>`}
        <button onclick="window.safeReload&&window.safeReload();" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
          🔃 Seite neu laden
        </button>
      </div>
    `
  })
} else {
  throw new Error('Root element nicht gefunden')
}
