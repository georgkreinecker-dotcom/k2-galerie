import { BASE_APP_URL, PROJECT_ROUTES } from '../config/navigation'

/**
 * Testpilot / persönliche Demo: Query enthält vorname + entwurf=1.
 * Diese Links dürfen nicht zuerst nach /entdecken umgeleitet werden (eine Quelle mit GaleriePage + EntdeckenPage).
 */
export function isOek2PilotEntwurfQuery(search: string): boolean {
  try {
    const q = search.startsWith('?') ? search.slice(1) : search
    const sp = new URLSearchParams(q)
    if ((sp.get('entwurf') || '').trim() !== '1') return false
    return (sp.get('vorname') || '').trim().length > 0
  } catch {
    return false
  }
}

/** ök2-Testpilot: Demo-Galerie mit Vorname/Entwurf (GaleriePage: vorname + entwurf) – eine Quelle für Formular und Zettel */
export function buildOek2PilotGalerieUrl(appName: string): string {
  const path = PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
  const u = new URL(path, BASE_APP_URL)
  u.searchParams.set('context', 'oeffentlich')
  u.searchParams.set('vorname', appName.trim())
  u.searchParams.set('entwurf', '1')
  return u.toString()
}
