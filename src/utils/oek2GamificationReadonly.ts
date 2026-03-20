/**
 * ök2 Gamification Schicht B – nur Lesen / Anzeige (keine Speicherpfade, kein Filter+setItem).
 * Sportwagenmodus: eine Quelle für Milestones & Werk-Hinweise.
 */
import type { PageContentGalerie } from '../config/pageContentGalerie'
import type { PageTextsConfig } from '../config/pageTexts'

export interface Oek2GalerieGestaltenPunkt {
  id: string
  label: string
  done: boolean
  hint: string
}

function nonEmptyMedia(s?: string | null): boolean {
  const t = String(s ?? '').trim()
  if (!t) return false
  if (t.startsWith('blob:')) return true
  return true
}

/**
 * Checkliste Willkommen / Galerie (nur Anzeige) aus vorhandenem pageContent + galerie-Texten.
 */
export function getOek2GalerieGestaltenChecklist(
  pageContent: PageContentGalerie,
  pageTexts: PageTextsConfig
): Oek2GalerieGestaltenPunkt[] {
  const g = pageTexts?.galerie
  const introPc = String(pageContent.welcomeIntroText ?? '').trim()
  const introPt = String(g?.welcomeIntroText ?? '').trim()
  const hero = String(g?.heroTitle ?? '').trim()
  const texteOk = introPc.length >= 8 || introPt.length >= 8 || hero.length >= 3

  return [
    {
      id: 'welcomeImage',
      label: 'Willkommensbild',
      done: nonEmptyMedia(pageContent.welcomeImage),
      hint: 'In der Vorschau: Willkommen – Bild wählen oder hochladen.',
    },
    {
      id: 'galerieCardImage',
      label: 'Galerie-Karte („In die Galerie“)',
      done: nonEmptyMedia(pageContent.galerieCardImage),
      hint: 'Zweite Seite in der Vorschau – Motiv für den Galerie-Einstieg.',
    },
    {
      id: 'virtualTour',
      label: 'Virtueller Rundgang',
      done: nonEmptyMedia(pageContent.virtualTourImage) || nonEmptyMedia(pageContent.virtualTourVideo),
      hint: 'Optional: Bild oder kurzes Video für den Rundgang.',
    },
    {
      id: 'texte',
      label: 'Texte auf der Galerie-Seite',
      done: texteOk,
      hint: 'Titel oder Willkommenstext in der Vorschau anpassen.',
    },
  ]
}

export interface Oek2WerkCompleteness {
  /** Eigenes Foto / Ref / Vorschau gespeichert (nicht nur Platzhalter-Kachel). */
  hatEigenesBild: boolean
  /** Preis für Anzeige / Shop sinnvoll gesetzt. */
  hatPreis: boolean
}

/**
 * Nur ök2 Demo: Hinweise für Piloten – keine Daten ändern.
 */
export function getOek2WerkCompleteness(artwork: {
  imageUrl?: string
  previewUrl?: string
  imageRef?: unknown
  price?: number
}): Oek2WerkCompleteness {
  const img =
    String(artwork.imageUrl ?? '').trim() ||
    String(artwork.previewUrl ?? '').trim() ||
    (typeof artwork.imageRef === 'string' && artwork.imageRef.trim()) ||
    ''
  const hatEigenesBild = img.length > 0
  const hatPreis = typeof artwork.price === 'number' && !Number.isNaN(artwork.price) && artwork.price > 0
  return { hatEigenesBild, hatPreis }
}
