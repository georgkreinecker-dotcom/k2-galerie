/** Ein Schlüssel pro Flyer-Master-Persistenz – muss mit FlyerEventBogenNeuPage übereinstimmen. */
export const FLYER_EVENT_BOGEN_STORAGE_KEY_K2 = 'k2-flyer-event-bogen-neu-v1'
export const FLYER_EVENT_BOGEN_STORAGE_KEY_OEFF = 'k2-oeffentlich-flyer-event-bogen-neu-v1'

export function getFlyerEventBogenStorageKey(isOeffentlich: boolean): string {
  return isOeffentlich ? FLYER_EVENT_BOGEN_STORAGE_KEY_OEFF : FLYER_EVENT_BOGEN_STORAGE_KEY_K2
}
