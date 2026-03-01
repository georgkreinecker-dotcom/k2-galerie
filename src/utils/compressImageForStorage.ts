/**
 * Eine zentrale Utility für Bildkomprimierung vor dem Speichern.
 * Regel: komprimierung-fotos-videos.mdc – maximale Komprimierung überall.
 * artwork = für Werke in localStorage (viele Bilder → klein halten).
 */

export type CompressContext = 'mobile' | 'desktop' | 'artwork'

export interface CompressImageOptions {
  /** Kontext: mobile = stärker, desktop = Standard, artwork = für Werke (localStorage) */
  context?: CompressContext
  /** Max. Breite in px (überschreibt context) */
  maxWidth?: number
  /** JPEG-Qualität 0–1 (überschreibt context) */
  quality?: number
}

const DEFAULTS: Record<CompressContext, { maxWidth: number; quality: number }> = {
  mobile: { maxWidth: 560, quality: 0.48 },
  desktop: { maxWidth: 760, quality: 0.6 },
  /** Für Werke im Admin: klein halten, damit viele Werke in localStorage und loadArtworks nicht zu groß werden */
  artwork: { maxWidth: 640, quality: 0.55 }
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
  const defs = DEFAULTS[context as keyof typeof DEFAULTS] ?? DEFAULTS.desktop
  const maxWidth = optW ?? defs.maxWidth
  const quality = optQ ?? defs.quality

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
