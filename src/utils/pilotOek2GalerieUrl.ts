import { BASE_APP_URL, PROJECT_ROUTES } from '../config/navigation'

/** ök2-Testpilot: Demo-Galerie mit Vorname/Entwurf (GaleriePage: vorname + entwurf) – eine Quelle für Formular und Zettel */
export function buildOek2PilotGalerieUrl(appName: string): string {
  const path = PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
  const u = new URL(path, BASE_APP_URL)
  u.searchParams.set('context', 'oeffentlich')
  u.searchParams.set('vorname', appName.trim())
  u.searchParams.set('entwurf', '1')
  return u.toString()
}
