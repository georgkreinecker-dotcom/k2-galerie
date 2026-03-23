/**
 * Ein Tool für alle gleichen Anwendungen (Sportwagen): Bildverarbeitung überall gleich.
 * K2/ök2/VK2 – überall wo Bilder hochgeladen/bearbeitet werden: Original | Freistellen (Pro-Hintergrund).
 * Nutzt compressImageForStorage + optional compositeOnProfessionalBackground.
 */

import { compressImageForStorage } from './compressImageForStorage'
import { compositeOnProfessionalBackground, type BackgroundPresetKey } from './professionalImageBackground'

export type ImageProcessingMode = 'original' | 'freigestellt'

export interface ProcessImageOptions {
  /** Original = nur komprimieren, freigestellt = Freistellung + Pro-Hintergrund */
  mode: ImageProcessingMode
  /** Nur bei mode 'freigestellt' */
  backgroundPreset?: BackgroundPresetKey
  /** Kontext: desktop (klein), artwork (Werke), mobile (stark), pageHero (Willkommen/Galerie groß) */
  context?: 'desktop' | 'artwork' | 'mobile' | 'pageHero'
}

/**
 * Verarbeitet ein Bild einheitlich: Komprimierung + optional Freistellen mit Pro-Hintergrund.
 * Gibt Data-URL (JPEG) zurück. Ein Tool für alle Stellen (Willkommensbild, Galerie-Karte, Werke, VK2-Karten).
 */
export async function processImageForSave(
  input: File | string,
  options: ProcessImageOptions
): Promise<string> {
  const { mode, backgroundPreset = 'hell', context = 'desktop' } = options
  let dataUrl: string
  if (typeof input === 'string') {
    if (input.startsWith('data:')) {
      dataUrl = await compressImageForStorage(input, { context })
    } else {
      const res = await fetch(input.startsWith('http') ? input : (window.location.origin + (input.startsWith('/') ? '' : '/') + input))
      const blob = await res.blob()
      const file = new File([blob], 'image.jpg', { type: blob.type })
      dataUrl = await compressImageForStorage(file, { context })
    }
  } else {
    dataUrl = await compressImageForStorage(input, { context })
  }
  if (mode === 'freigestellt') {
    try {
      dataUrl = await compositeOnProfessionalBackground(dataUrl, backgroundPreset)
    } catch (err) {
      console.warn('Freistellung fehlgeschlagen, verwende Original:', err)
    }
  }
  return dataUrl
}
