/**
 * Admin-Route: Nur eine Tür.
 * Anmeldung = Galerie-Passwort (auf der Galerie, Button „Admin“). Danach kommt man hierher.
 * Es gibt KEINE zweite Tür (kein Supabase-Login). useAuthSession/supabaseAuth werden hier nicht verwendet.
 */
import ScreenshotExportAdmin from '../../components/ScreenshotExportAdmin'

export default function AdminRoute() {
  return <ScreenshotExportAdmin />
}
