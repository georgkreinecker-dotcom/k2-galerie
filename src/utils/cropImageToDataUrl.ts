/**
 * Schneidet einen Bereich aus einem Bild aus und liefert eine JPEG Data-URL.
 * crop: Anteile 0–1 relativ zur Bildbreite/-höhe.
 */

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

export interface CropImageOptions {
  /** Max. längere Seite in px (Skalierung nach Zuschnitt); default 1200 */
  maxSize?: number
  /** JPEG-Qualität 0–1; default 0.85 */
  quality?: number
}

/**
 * Bild (Data-URL) nach crop zuschneiden.
 * @param dataUrl Bild als data:image/…
 * @param crop Bereich in 0–1 (x, y, width, height)
 * @param options optionale Skalierung und Qualität
 */
export function cropImageToDataUrl(
  dataUrl: string,
  crop: CropRect,
  options: CropImageOptions = {}
): Promise<string> {
  const { maxSize = 1200, quality = 0.85 } = options
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const W = img.naturalWidth
      const H = img.naturalHeight
      const sx = Math.max(0, Math.floor(crop.x * W))
      const sy = Math.max(0, Math.floor(crop.y * H))
      const sw = Math.min(W - sx, Math.max(1, Math.floor(crop.width * W)))
      const sh = Math.min(H - sy, Math.max(1, Math.floor(crop.height * H)))
      if (sw <= 0 || sh <= 0) {
        reject(new Error('Ungültiger Zuschnitt'))
        return
      }
      let outW = sw
      let outH = sh
      if (maxSize > 0 && Math.max(outW, outH) > maxSize) {
        if (outW >= outH) {
          outH = Math.round((outH * maxSize) / outW)
          outW = maxSize
        } else {
          outW = Math.round((outW * maxSize) / outH)
          outH = maxSize
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas nicht verfügbar'))
        return
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'))
    img.src = dataUrl
  })
}
