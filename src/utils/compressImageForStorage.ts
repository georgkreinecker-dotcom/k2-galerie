/**
 * Eine zentrale Utility für Bildkomprimierung vor dem Speichern.
 * Regel: komprimierung-fotos-videos.mdc – maximale Komprimierung überall.
 * Kontext mobil: stärker (600px, 0.5); desktop: 800px, 0.65.
 */

export type CompressContext = 'mobile' | 'desktop'

export interface CompressImageOptions {
  /** Kontext: mobile = 600/0.5, desktop = 800/0.65 */
  context?: CompressContext
  /** Max. Breite in px (überschreibt context) */
  maxWidth?: number
  /** JPEG-Qualität 0–1 (überschreibt context) */
  quality?: number
}

const DEFAULTS: Record<CompressContext, { maxWidth: number; quality: number }> = {
  mobile: { maxWidth: 600, quality: 0.5 },
  desktop: { maxWidth: 800, quality: 0.65 }
}

/**
 * Komprimiert ein Bild (File oder Data-URL) für die Speicherung.
 * Gibt eine JPEG Data-URL zurück.
 */
export function compressImageForStorage(
  source: File | string,
  options: CompressImageOptions = {}
): Promise<string> {
  const context = options.context ?? 'desktop'
  const { maxWidth: optW, quality: optQ } = options
  const { maxWidth: defW, quality: defQ } = DEFAULTS[context]
  const maxWidth = optW ?? defW
  const quality = optQ ?? defQ

  return new Promise((resolve, reject) => {
    const run = (dataUrl: string) => {
      const img = new Image()
      img.onload = () => {
        let w = img.width
        let h = img.height
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w)
          w = maxWidth
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context nicht verfügbar'))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = dataUrl
    }

    if (typeof source === 'string') {
      if (!source.startsWith('data:')) {
        reject(new Error('Erwarte Data-URL oder File'))
        return
      }
      run(source)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) run(result)
      else reject(new Error('File konnte nicht gelesen werden'))
    }
    reader.onerror = reject
    reader.readAsDataURL(source)
  })
}
