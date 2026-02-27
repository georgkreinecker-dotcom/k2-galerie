/**
 * Hochgeladene Fotos (z. B. iPad/iPhone): Echte Objektfreistellung + professioneller
 * Studio-Hintergrund. Wirkt wie in einem professionellen Studio aufgenommen.
 * Läuft komplett im Browser, kostenlos. Nutzt @imgly/background-removal (ONNX).
 * Fallback: nur Pro-Hintergrund ohne Freistellung.
 */

const MAX_SIDE = 1200
/** Mehr Rand wie im Studio – Objekt hat „Luft“, wirkt professionell */
const PADDING_PERCENT = 0.1

/**
 * Studio-Hintergründe: weiche Verläufe wie bei Studiobühnen/Galerie-Fotos.
 * Oben = heller (Licht von oben), unten = weicher Schattenverlauf.
 */
export const BACKGROUND_PRESETS = {
  hell: { top: '#f5f5f5', bottom: '#e2e2e2' },       // Neutralgrau, klassisches Studio
  weiss: { top: '#fefefe', bottom: '#f0f0f0' },     // Weiß/Seamless-Papier
  warm: { top: '#f8f6f3', bottom: '#ebe8e4' },      // Leicht warm, Galerie
  kuehl: { top: '#f4f5f6', bottom: '#e6e8ea' },     // Kühles Grau, modern
  dunkel: { top: '#4a4a4a', bottom: '#2d2d2d' }     // Dunkelgrau, Studio-Drama
} as const

export type BackgroundPresetKey = keyof typeof BACKGROUND_PRESETS

/**
 * Zeichnet ein Bild (oder freigestelltes PNG-Blob) zentriert auf professionellen Verlauf.
 * Gibt Data-URL (JPEG) zurück.
 */
function drawOnProfessionalBackground(
  imageSource: HTMLImageElement | Blob,
  isBlob: boolean,
  background: { top: string; bottom: string } = BACKGROUND_PRESETS.hell
): Promise<string> {
  return new Promise((resolve, reject) => {
    const finish = (img: HTMLImageElement) => {
      try {
        let w = img.width
        let h = img.height
        if (w > MAX_SIDE || h > MAX_SIDE) {
          if (w >= h) {
            h = Math.round((h * MAX_SIDE) / w)
            w = MAX_SIDE
          } else {
            w = Math.round((w * MAX_SIDE) / h)
            h = MAX_SIDE
          }
        }
        const pad = Math.round(Math.min(w, h) * PADDING_PERCENT)
        const canvasW = w + pad * 2
        const canvasH = h + pad * 2
        const canvas = document.createElement('canvas')
        canvas.width = canvasW
        canvas.height = canvasH
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas nicht verfügbar'))
          return
        }
        // Weicher Verlauf wie im Studio: oben hell (Licht), unten weich abfallend
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasH)
        gradient.addColorStop(0, background.top)
        gradient.addColorStop(0.5, background.bottom) // Mittiger Übergang = weicher
        gradient.addColorStop(1, background.bottom)
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvasW, canvasH)
        ctx.drawImage(img, pad, pad, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      } catch (e) {
        reject(e)
      }
    }

    if (isBlob) {
      const url = URL.createObjectURL(imageSource as Blob)
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        URL.revokeObjectURL(url)
        finish(img)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Freigestelltes Bild konnte nicht geladen werden'))
      }
      img.src = url
    } else {
      finish(imageSource as HTMLImageElement)
    }
  })
}

/**
 * Nur professioneller Hintergrund (ohne Freistellung). Wird bei Fehler oder Fallback genutzt.
 */
function onlyProfessionalBackground(
  imageDataUrl: string,
  background: { top: string; bottom: string } = BACKGROUND_PRESETS.hell
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      drawOnProfessionalBackground(img, false, background).then(resolve).catch(reject)
    }
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'))
    img.src = imageDataUrl
  })
}

/**
 * Echte Objektfreistellung + professioneller Hintergrund.
 * Kostenlos, im Browser, funktioniert auch bei ök2. Bei Fehler: Fallback auf Pro-Hintergrund ohne Freistellung.
 * @param backgroundPreset Optional: 'hell' | 'weiss' | 'warm' | 'kuehl' | 'dunkel' (Standard: 'hell')
 */
export function compositeOnProfessionalBackground(
  imageDataUrl: string,
  backgroundPreset: BackgroundPresetKey = 'hell'
): Promise<string> {
  const background = BACKGROUND_PRESETS[backgroundPreset] ?? BACKGROUND_PRESETS.hell
  return (async () => {
    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(imageDataUrl)
      return drawOnProfessionalBackground(blob, true, background)
    } catch (e) {
      console.warn('Freistellung fehlgeschlagen, verwende professionellen Hintergrund ohne Freistellung:', e)
      try {
        sessionStorage.setItem('k2-freistellen-fallback-used', Date.now().toString())
      } catch (_) {}
      return onlyProfessionalBackground(imageDataUrl, background)
    }
  })()
}
