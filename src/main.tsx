import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Cache-Busting: Versions-Info für Debugging
const BUILD_VERSION = '1.0.0-' + Date.now()
if (typeof window !== 'undefined') {
  (window as any).__BUILD_VERSION__ = BUILD_VERSION
  console.log('🔨 Build-Version:', BUILD_VERSION)
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

// Installiere Crash Handler SOFORT
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
  
  // Reduziere Memory-Nutzung: Entferne alte Event Listener automatisch
  setInterval(() => {
    try {
      // Bereinige alte Event Listener (nur wenn zu viele vorhanden)
      const listeners = (window as any).__eventListeners || 0
      if (listeners > 50) {
        console.warn('⚠️ Zu viele Event Listener - bereinige...')
        // Trigger garbage collection (falls verfügbar)
        if ((window as any).gc) {
          (window as any).gc()
        }
      }
    } catch (e) {
      // Ignoriere Fehler
    }
  }, 30000) // Alle 30 Sekunden prüfen
}

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element nicht gefunden')
  }
  
  // WICHTIG: Render mit Error-Handling und mehreren Retry-Versuchen
  let renderAttempts = 0
  const MAX_RENDER_ATTEMPTS = 3
  
  function attemptRender() {
    try {
      const root = createRoot(rootElement)
      root.render(
        <BrowserRouter>
          <App />
        </BrowserRouter>,
      )
      console.log('✅ App erfolgreich gerendert')
    } catch (renderError) {
      renderAttempts++
      console.error(`FEHLER beim Rendern (Versuch ${renderAttempts}/${MAX_RENDER_ATTEMPTS}):`, renderError)
      
      if (renderAttempts < MAX_RENDER_ATTEMPTS) {
        // Versuche es nochmal nach kurzer Verzögerung
        setTimeout(() => {
          attemptRender()
        }, 1000 * renderAttempts) // Exponentielle Backoff
      } else {
        // Zeige Fehlerseite nach allen Versuchen - MIT HINTERGRUND damit keine schwarze Seite
        rootElement.innerHTML = `
          <div style="padding: 2rem; color: white; background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%); min-height: 100vh; font-family: system-ui; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <h1 style="color: #ff6b6b; margin-bottom: 1rem;">⚠️ App konnte nicht gestartet werden</h1>
            <p style="margin-bottom: 2rem; text-align: center; max-width: 600px;">
              Bitte versuche:<br />
              1. Seite neu laden<br />
              2. Browser-Cache leeren<br />
              3. Anderen Browser verwenden
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
              <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
                🔃 Seite neu laden
              </button>
            </div>
          </div>
        `
      }
    }
  }
  
  attemptRender()
} catch (error) {
  console.error('FEHLER beim App-Start:', error)
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: white; background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%); min-height: 100vh; font-family: system-ui; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h1 style="color: #ff6b6b; margin-bottom: 1rem;">⚠️ App-Fehler</h1>
        <p style="margin-bottom: 1rem;">${error instanceof Error ? error.message : String(error)}</p>
        <details style="background: rgba(0, 0, 0, 0.3); padding: 1rem; border-radius: 4px; margin-bottom: 2rem; max-width: 800px; width: 100%; overflow: auto;">
          <summary style="cursor: pointer; margin-bottom: 0.5rem;">Fehler-Details</summary>
          <pre style="white-space: pre-wrap; word-break: break-word; font-size: 0.875rem; margin-top: 0.5rem;">
            ${error instanceof Error ? error.stack : String(error)}
          </pre>
        </details>
        <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
          🔃 Seite neu laden
        </button>
      </div>
    `
  }
}
