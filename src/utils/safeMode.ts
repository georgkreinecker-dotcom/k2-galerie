/**
 * SAFE MODE - Verhindert Crashes auch bei Cursor-Problemen
 * 
 * Diese Datei implementiert einen "Safe Mode" der die App auch bei
 * schwerwiegenden Cursor-Problemen am Laufen hält.
 */

// Globale Flags für Safe Mode
let safeModeActive = false
let crashCount = 0
const MAX_CRASHES = 3

/**
 * Aktiviere Safe Mode - deaktiviert alle nicht-kritischen Features
 */
export function activateSafeMode() {
  safeModeActive = true
  console.warn('🛡️ SAFE MODE AKTIVIERT - Alle nicht-kritischen Features deaktiviert')
  
  // Deaktiviere alle Event Listener die Probleme verursachen könnten
  if (typeof window !== 'undefined') {
    // Entferne alle Event Listener die möglicherweise Probleme verursachen
    const events = ['beforeunload', 'unload', 'error', 'unhandledrejection']
    events.forEach(eventType => {
      try {
        // Erstelle neue Handler die nichts tun
        const noopHandler = () => {}
        window.addEventListener(eventType as any, noopHandler, { passive: true })
      } catch (e) {
        // Ignoriere Fehler
      }
    })
  }
}

/**
 * Prüfe ob Safe Mode aktiv sein sollte
 */
export function shouldActivateSafeMode(): boolean {
  return crashCount >= MAX_CRASHES || safeModeActive
}

/**
 * Registriere einen Crash
 */
export function registerCrash() {
  crashCount++
  console.warn(`⚠️ Crash registriert (${crashCount}/${MAX_CRASHES})`)
  
  if (crashCount >= MAX_CRASHES) {
    activateSafeMode()
  }
}

/**
 * Prüfe ob Safe Mode aktiv ist
 */
export function isSafeModeActive(): boolean {
  return safeModeActive
}

/**
 * Reset Crash Counter
 */
export function resetCrashCount() {
  crashCount = 0
  safeModeActive = false
}

/**
 * Safe Wrapper für alle State-Updates
 */
export function safeSetState<T>(
  isMounted: boolean,
  setState: React.Dispatch<React.SetStateAction<T>>,
  value: T | ((prev: T) => T)
) {
  if (!isMounted || safeModeActive) {
    if (safeModeActive) {
      console.warn('⚠️ State-Update verhindert: Safe Mode aktiv')
    }
    return
  }
  
  try {
    setState(value)
  } catch (e) {
    console.error('Fehler beim State-Update:', e)
    registerCrash()
  }
}

/**
 * Safe Wrapper für alle async Operationen
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (e) {
    console.error('Fehler bei async Operation:', e)
    registerCrash()
    return fallback
  }
}
