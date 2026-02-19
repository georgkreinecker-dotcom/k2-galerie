/**
 * Wird nur per dynamischem Import geladen – und NUR wenn die App NICHT im iframe (Cursor Preview) läuft.
 * So lädt im iframe nie React/App → Host bleibt stabil.
 */
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

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

export function run(): void {
  applyDesignFromStorageSync()
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element nicht gefunden')
  }
  try {
    const root = createRoot(rootElement)
    root.render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )
    console.log('✅ App erfolgreich gerendert')
    // Spurensuche: Bei Crash „Cursor wieder öffnen“ in Console sichtbar, ob HMR kurz davor kam (Preserve log!)
    if (typeof import.meta !== 'undefined' && import.meta.hot) {
      import.meta.hot.on('vite:beforeUpdate', () => console.log('[HMR] beforeUpdate'))
    }
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
}
