import { BASE_APP_URL, PROJECT_ROUTES } from '../config/navigation'
import { VK2_PILOT_URL_PARAM } from './vk2StorageKeys'

/** VK2-Testpilot: eigene Mandanten-Instanz pro Zettel-Nr. (localStorage-Scope), vgl. K2 Familie / ök2-Pilot-URL */
export function buildVk2PilotGalerieUrl(zettelNr: string): string {
  const n = String(zettelNr || '')
    .replace(/\D/g, '')
    .slice(0, 8)
  const id = n.length > 0 ? n : '1'
  const u = new URL(PROJECT_ROUTES.vk2.galerie, BASE_APP_URL)
  u.searchParams.set(VK2_PILOT_URL_PARAM, id)
  return u.toString()
}
