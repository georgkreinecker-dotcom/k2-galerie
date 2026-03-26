/**
 * Eine zentrale Utility für Bildkomprimierung vor dem Speichern.
 * Regel: komprimierung-fotos-videos.mdc – maximale Komprimierung überall.
 * artwork = für Werke in localStorage (viele Bilder → klein halten).
 */

export type CompressContext = 'mobile' | 'desktop' | 'artwork' | 'pageHero'

export interface CompressImageOptions {
  /** Kontext: mobile = stärker, desktop = Standard, artwork = für Werke (localStorage) */
  context?: CompressContext
  /** Max. Breite in px (überschreibt context) */
  maxWidth?: number
  /** JPEG-Qualität 0–1 (überschreibt context) */
  quality?: number
  /** Harte Obergrenze für Ausgabegröße in Bytes */
  maxBytes?: number
  /** Untergrenze für adaptive Qualitätsreduktion */
  minQuality?: number
}

/**
 * artwork / mobile: viele Bilder, klein halten (Regel komprimierung-fotos-videos.mdc).
 * desktop: allgemeine Admin-Vorschau, z. B. kleine Avatare.
 * pageHero: wenige große Flächen (Willkommen, Galerie-Karte, Virtual Tour, VK2-Eingangskarten) – schärfer auf Retina/Fullscreen.
 */
type CompressDefaults = { maxWidth: number; quality: number; maxBytes?: number; minQuality?: number }
const DEFAULTS: Record<CompressContext, CompressDefaults> = {
  mobile: { maxWidth: 560, quality: 0.48 },
  desktop: { maxWidth: 760, quality: 0.6 },
  /**
   * Für Werke: sichtbar schärfer bei Vergrößerung, aber mit Größenbremse.
   * So bleibt der Speicher stabil, obwohl die Qualität etwas angehoben ist.
   */
  artwork: { maxWidth: 960, quality: 0.72, maxBytes: 420_000, minQuality: 0.5 },
  pageHero: { maxWidth: 1920, quality: 0.82 },
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
  const { maxWidth: optW, quality: optQ, maxBytes: optMaxBytes, minQuality: optMinQuality } = options
  const defs = DEFAULTS[context as keyof typeof DEFAULTS] ?? DEFAULTS.desktop
  const maxWidth = optW ?? defs.maxWidth
  const quality = optQ ?? defs.quality
  const maxBytes = optMaxBytes ?? defs.maxBytes ?? 0
  const minQuality = optMinQuality ?? defs.minQuality ?? 0.45

  const estimateBytes = (dataUrl: string) => {
    const comma = dataUrl.indexOf(',')
    if (comma < 0) return dataUrl.length
    const b64 = dataUrl.slice(comma + 1)
    return Math.floor((b64.length * 3) / 4)
  }

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
        let output = canvas.toDataURL('image/jpeg', quality)
        if (maxBytes > 0 && estimateBytes(output) > maxBytes) {
          // Sanft reduzieren, bis die Dateigröße wieder in der sicheren Grenze liegt.
          let q = quality
          while (q > minQuality && estimateBytes(output) > maxBytes) {
            q = Math.max(minQuality, q - 0.06)
            output = canvas.toDataURL('image/jpeg', q)
          }
          // Falls Qualität allein nicht reicht: Fläche schrittweise verkleinern.
          if (estimateBytes(output) > maxBytes) {
            let shrinkW = w
            let shrinkH = h
            let safety = 0
            while (estimateBytes(output) > maxBytes && safety < 8 && shrinkW > 360 && shrinkH > 360) {
              safety += 1
              shrinkW = Math.max(360, Math.round(shrinkW * 0.88))
              shrinkH = Math.max(360, Math.round(shrinkH * 0.88))
              const shrinkCanvas = document.createElement('canvas')
              shrinkCanvas.width = shrinkW
              shrinkCanvas.height = shrinkH
              const shrinkCtx = shrinkCanvas.getContext('2d')
              if (!shrinkCtx) break
              shrinkCtx.drawImage(img, 0, 0, shrinkW, shrinkH)
              output = shrinkCanvas.toDataURL('image/jpeg', minQuality)
            }
          }
        }
        resolve(output)
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
