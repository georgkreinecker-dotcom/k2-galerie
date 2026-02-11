/**
 * Hochgeladene Fotos (z. B. iPad/iPhone): Echte Objektfreistellung + professioneller
 * Hintergrund. Läuft komplett im Browser, kostenlos, funktioniert auch bei ök2.
 * Nutzt @imgly/background-removal (ONNX im Browser). Fallback: nur Pro-Hintergrund ohne Freistellung.
 */

const MAX_SIDE = 1200
const PADDING_PERCENT = 0.08
const BACKGROUND_TOP = '#fafafa'
const BACKGROUND_BOTTOM = '#e8e8e8'

/**
 * Zeichnet ein Bild (oder freigestelltes PNG-Blob) zentriert auf professionellen Verlauf.
 * Gibt Data-URL (JPEG) zurück.
 */
function drawOnProfessionalBackground(
  imageSource: HTMLImageElement | Blob,
  isBlob: boolean
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
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasH)
        gradient.addColorStop(0, BACKGROUND_TOP)
        gradient.addColorStop(1, BACKGROUND_BOTTOM)
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
function onlyProfessionalBackground(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      drawOnProfessionalBackground(img, false).then(resolve).catch(reject)
    }
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'))
    img.src = imageDataUrl
  })
}

/**
 * Echte Objektfreistellung + professioneller Hintergrund.
 * Kostenlos, im Browser, funktioniert auch bei ök2. Bei Fehler: Fallback auf Pro-Hintergrund ohne Freistellung.
 */
export function compositeOnProfessionalBackground(imageDataUrl: string): Promise<string> {
  return (async () => {
    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const blob = await removeBackground(imageDataUrl)
      return drawOnProfessionalBackground(blob, true)
    } catch (e) {
      console.warn('Freistellung fehlgeschlagen, verwende professionellen Hintergrund ohne Freistellung:', e)
      return onlyProfessionalBackground(imageDataUrl)
    }
  })()
}
