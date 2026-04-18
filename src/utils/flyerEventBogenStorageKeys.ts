/** Ein Schlüssel pro Flyer-Master-Persistenz – muss mit FlyerEventBogenNeuPage übereinstimmen. */
import { pilotScopeVk2Key } from './vk2StorageKeys'

export const FLYER_EVENT_BOGEN_STORAGE_KEY_K2 = 'k2-flyer-event-bogen-neu-v1'
export const FLYER_EVENT_BOGEN_STORAGE_KEY_OEFF = 'k2-oeffentlich-flyer-event-bogen-neu-v1'
/** VK2: Basis-Key; zur Laufzeit pilotScopeVk2Key (Testpilot-Mandant). */
export const FLYER_EVENT_BOGEN_STORAGE_KEY_VK2 = 'k2-vk2-flyer-event-bogen-neu-v1'

export function getFlyerEventBogenStorageKey(isOeffentlich: boolean, isVk2: boolean): string {
  if (isOeffentlich) return FLYER_EVENT_BOGEN_STORAGE_KEY_OEFF
  if (isVk2) return pilotScopeVk2Key(FLYER_EVENT_BOGEN_STORAGE_KEY_VK2)
  return FLYER_EVENT_BOGEN_STORAGE_KEY_K2
}
