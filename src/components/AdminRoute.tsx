/**
 * Admin-Route: Eine Tür.
 * Anmeldung = Galerie-Passwort (auf der Galerie, Button „Admin“). Danach kommt man hierher.
 * APf = Georgs Arbeitsort: Admin von dort ohne Hürden erreichbar (kein E-Mail/Passwort-Login).
 * Regel: .cursor/rules/georg-apf-admin-ohne-huerden.mdc
 */
import ScreenshotExportAdmin from '../../components/ScreenshotExportAdmin'

export default function AdminRoute() {
  return <ScreenshotExportAdmin />
}
