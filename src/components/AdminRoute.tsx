/**
 * Admin-Route: Nur wenn Supabase konfiguriert ist, Login prüfen; sonst direkt Admin.
 * Wird lazy geladen, damit @supabase/supabase-js erst bei /admin geladen wird (kein Crash beim Rest der App).
 */
import { useAuthSession } from '../hooks/useAuthSession'
import { signOut } from '../utils/supabaseAuth'
import AdminLoginPage from '../pages/AdminLoginPage'
import ScreenshotExportAdmin from '../../components/ScreenshotExportAdmin'

export default function AdminRoute() {
  const { session, loading, isConfigured } = useAuthSession()

  if (!isConfigured) {
    return <ScreenshotExportAdmin />
  }
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1a0f0a',
        color: '#fff5f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui'
      }}>
        Anmeldung wird geprüft …
      </div>
    )
  }
  if (!session) {
    return <AdminLoginPage />
  }
  return (
    <>
      <div style={{
        padding: '6px 12px',
        background: 'rgba(0,0,0,0.3)',
        color: '#aaa',
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '8px',
        alignItems: 'center'
      }}>
        <span>{session.user?.email ?? 'Eingeloggt'}</span>
        <button
          type="button"
          onClick={() => signOut()}
          style={{
            padding: '4px 10px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Abmelden
        </button>
      </div>
      <ScreenshotExportAdmin />
    </>
  )
}
