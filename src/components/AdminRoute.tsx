/**
 * Admin-Route: Nur eine Tür.
 * Anmeldung = Galerie-Passwort (auf der Galerie, Button „Admin“). Danach kommt man hierher.
 * Es gibt KEINE zweite Tür (kein Supabase-Login). useAuthSession/supabaseAuth werden hier nicht verwendet.
 *
 * Cursor Preview (iframe): Admin wird hier nicht geladen – verhindert Code-5-Crashes durch die schwere Komponente.
 */
import ScreenshotExportAdmin from '../../components/ScreenshotExportAdmin'

const inIframe = typeof window !== 'undefined' && window.self !== window.top

export default function AdminRoute() {
  if (inIframe) {
    return (
      <div style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#1c1a18',
        color: '#e0e0e0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '1.1rem', margin: 0 }}>Admin in der Preview nicht geladen (Crash-Vermeidung).</p>
        <p style={{ fontSize: '0.95rem', margin: 0, opacity: 0.9 }}>App im Browser öffnen: <strong>http://localhost:5177/admin</strong></p>
      </div>
    )
  }
  return <ScreenshotExportAdmin />
}
