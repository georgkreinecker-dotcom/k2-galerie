/**
 * Vorbereitung von Werken für den Export (write-gallery-data / Blob).
 * Entfernt Base64-Bilder aus dem Payload, damit der Download schnell bleibt.
 * URLs (/img/k2/..., http...) bleiben erhalten.
 * Regel: komprimierung-fotos-videos.mdc, FEHLERANALYSEPROTOKOLL "Datenmenge/Komprimierung/Speicher".
 */

export function isBase64Image(url: string | undefined): boolean {
  return typeof url === 'string' && url.startsWith('data:image')
}

/**
 * Gibt eine Kopie der Werke zurück, bei der imageUrl/previewUrl
 * nur dann gesetzt bleiben, wenn es eine URL ist (nicht Base64).
 * Base64 wird durch '' ersetzt → kleiner JSON, schneller Download.
 */
export function artworksForExport<T extends { imageUrl?: string; previewUrl?: string; purchasePrice?: unknown }>(artworks: T[]): T[] {
  return artworks.map((a) => {
    const imageUrl = isBase64Image(a.imageUrl) ? '' : (a.imageUrl ?? '')
    const previewUrl = isBase64Image(a.previewUrl) ? '' : (a.previewUrl ?? '')
    const copy = { ...a, imageUrl, previewUrl } as Record<string, unknown>
    delete copy.purchasePrice
    return copy as T
  })
}

/**
 * Entfernt Base64 aus imageUrl/previewUrl von Werken – für das Speichern von Server-Daten in localStorage.
 * Verhindert, dass versehentlich große Datenmengen (z. B. 70 Werke mit Base64) in den Speicher geschrieben werden.
 * Nur URLs bleiben erhalten; Bild-Anzeige läuft danach über imageRef/IndexedDB oder URL.
 */
export function stripBase64FromArtworks<T extends { imageUrl?: string; previewUrl?: string }>(artworks: T[]): T[] {
  return artworks.map((a) => {
    const imageUrl = isBase64Image(a.imageUrl) ? '' : (a.imageUrl ?? '')
    const previewUrl = isBase64Image(a.previewUrl) ? '' : (a.previewUrl ?? '')
    if (imageUrl === (a.imageUrl ?? '') && previewUrl === (a.previewUrl ?? '')) return a
    return { ...a, imageUrl, previewUrl }
  })
}
