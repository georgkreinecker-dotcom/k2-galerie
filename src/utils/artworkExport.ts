/**
 * Vorbereitung von Werken für den Export (write-gallery-data / Blob).
 * Entfernt Base64-Bilder aus dem Payload, damit der Download schnell bleibt.
 * URLs (/img/k2/..., http...) bleiben erhalten.
 */

function isBase64Image(url: string | undefined): boolean {
  return typeof url === 'string' && url.startsWith('data:image')
}

/**
 * Gibt eine Kopie der Werke zurück, bei der imageUrl/previewUrl
 * nur dann gesetzt bleiben, wenn es eine URL ist (nicht Base64).
 * Base64 wird durch '' ersetzt → kleiner JSON, schneller Download.
 */
export function artworksForExport<T extends { imageUrl?: string; previewUrl?: string }>(artworks: T[]): T[] {
  return artworks.map((a) => {
    const imageUrl = isBase64Image(a.imageUrl) ? '' : (a.imageUrl ?? '')
    const previewUrl = isBase64Image(a.previewUrl) ? '' : (a.previewUrl ?? '')
    if (imageUrl === (a.imageUrl ?? '') && previewUrl === (a.previewUrl ?? '')) return a
    return { ...a, imageUrl, previewUrl }
  })
}
