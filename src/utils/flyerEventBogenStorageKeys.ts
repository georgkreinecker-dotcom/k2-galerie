/** Ein Schlüssel pro Flyer-Master-Persistenz – muss mit FlyerEventBogenNeuPage übereinstimmen. */
export const FLYER_EVENT_BOGEN_STORAGE_KEY_K2 = 'k2-flyer-event-bogen-neu-v1'
export const FLYER_EVENT_BOGEN_STORAGE_KEY_OEFF = 'k2-oeffentlich-flyer-event-bogen-neu-v1'
/** VK2: eigener Key – nicht mit K2-Master teilen (sonst überschreibt ein Kontext den anderen). */
export const FLYER_EVENT_BOGEN_STORAGE_KEY_VK2 = 'k2-vk2-flyer-event-bogen-neu-v1'

export function getFlyerEventBogenStorageKey(isOeffentlich: boolean, isVk2: boolean): string {
  if (isOeffentlich) return FLYER_EVENT_BOGEN_STORAGE_KEY_OEFF
  if (isVk2) return FLYER_EVENT_BOGEN_STORAGE_KEY_VK2
  return FLYER_EVENT_BOGEN_STORAGE_KEY_K2
}
