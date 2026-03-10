/**
 * Sportwagenmodus: Ein Standard für „Veröffentlichen“.
 * Alle Aufrufer (DevView, GalerieVorschauPage) nutzen diese eine Funktion.
 * Ablauf: Bild-URLs auflösen → Export-Format → Payload bauen → POST write-gallery-data.
 * Doku: docs/PROZESS-VEROEFFENTLICHEN-LADEN.md
 *
 * WICHTIG: Immer Vercel-URL für POST nutzen, damit Mobil und Mac dieselbe Quelle haben.
 * Relative URL (/api/...) würde bei localhost an den Dev-Server gehen → Mac lädt von Vercel → nichts kommt an.
 */

import { GALLERY_DATA_BASE_URL } from '../config/externalUrls'
import { resolveArtworkImageUrlsForExport } from './supabaseClient'
import { artworksForExport } from './artworkExport'
import { loadEvents } from './eventsStorage'
import { loadDocuments } from './documentsStorage'
import { getPageContentGalerie } from '../config/pageContentGalerie'

const MAX_PAYLOAD_BYTES = 5_000_000

function getItemSafe(key: string, defaultValue: unknown): unknown {
  try {
    const item = localStorage.getItem(key)
    if (!item || item.length > 1_000_000) return defaultValue
    return JSON.parse(item)
  } catch {
    return defaultValue
  }
}

export interface PublishGalleryDataResult {
  success: boolean
  result?: { path?: string; size?: number; [k: string]: unknown }
  error?: string
  artworksCount?: number
  imagesResolved?: number
  /** Nach erfolgreichem POST: Kontrolle was auf Vercel angekommen ist (GET direkt danach). */
  serverArtworksCount?: number
  serverImagesCount?: number
  payloadSizeBytes?: number
}

/**
 * Einziger Standard-Ablauf für Veröffentlichen:
 * 1. Bild-URLs auflösen (imageRef/Base64 → https), damit Server echte URLs bekommt
 * 2. Base64 aus Export entfernen (artworksForExport)
 * 3. Payload aus localStorage bauen (Stammdaten, Events, Documents, Design)
 * 4. POST /api/write-gallery-data
 */
export async function publishGalleryDataToServer(artworks: any[]): Promise<PublishGalleryDataResult> {
  if (!Array.isArray(artworks) || artworks.length === 0) {
    return { success: false, error: 'Keine Werke zum Veröffentlichen' }
  }

  const withUrls = await resolveArtworkImageUrlsForExport(artworks)
  const imagesResolved = withUrls.filter(
    (a: any) =>
      a?.imageUrl &&
      typeof a.imageUrl === 'string' &&
      (a.imageUrl.startsWith('http://') || a.imageUrl.startsWith('https://'))
  ).length
  const forExport = artworksForExport(withUrls)

  const galleryStamm = getItemSafe('k2-stammdaten-galerie', {}) as Record<string, unknown>
  const pageContent = getPageContentGalerie()
  const data = {
    martina: getItemSafe('k2-stammdaten-martina', {}),
    georg: getItemSafe('k2-stammdaten-georg', {}),
    gallery: {
      ...galleryStamm,
      welcomeImage: (pageContent?.welcomeImage as string) || (galleryStamm?.welcomeImage as string) || '',
      galerieCardImage: (pageContent?.galerieCardImage as string) || (galleryStamm?.galerieCardImage as string) || '',
      virtualTourImage: (pageContent?.virtualTourImage as string) || (galleryStamm?.virtualTourImage as string) || ''
    },
    artworks: forExport,
    events: (loadEvents('k2') as any[]).slice(0, 100),
    documents: (loadDocuments('k2') as any[]).slice(0, 100),
    designSettings: getItemSafe('k2-design-settings', {}),
    pageTexts: getItemSafe('k2-page-texts', null),
    version: Date.now(),
    buildId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    exportedAt: new Date().toISOString()
  }

  const json = JSON.stringify(data)
  if (json.length > MAX_PAYLOAD_BYTES) {
    return {
      success: false,
      error: `Daten zu groß (${Math.round(json.length / 1024)} KB). Bitte weniger Werke oder kleinere Bilder.`
    }
  }

  try {
    const writeUrl = `${GALLERY_DATA_BASE_URL}/api/write-gallery-data`
    const response = await fetch(writeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json
    })
    const result = await response.json().catch(() => ({}))
    if (response.ok && result?.success === true) {
      const out: PublishGalleryDataResult = {
        success: true,
        result,
        artworksCount: forExport.length,
        imagesResolved,
        payloadSizeBytes: json.length
      }
      // Kontrolle: Was ist auf Vercel angekommen? (GET direkt nach POST)
      try {
        const getUrl = `${GALLERY_DATA_BASE_URL}/api/gallery-data?tenantId=k2&_=${Date.now()}`
        const getRes = await fetch(getUrl, { cache: 'no-store' })
        if (getRes.ok) {
          const serverData = await getRes.json().catch(() => null)
          const serverList = Array.isArray(serverData?.artworks) ? serverData.artworks : []
          const serverImages = serverList.filter(
            (a: any) =>
              a?.imageUrl &&
              typeof a.imageUrl === 'string' &&
              (a.imageUrl.startsWith('http://') || a.imageUrl.startsWith('https://'))
          ).length
          out.serverArtworksCount = serverList.length
          out.serverImagesCount = serverImages
        }
      } catch (_) {}
      return out
    }
    return {
      success: false,
      error: result?.error || `Server ${response.status}`,
      artworksCount: forExport.length
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, error: msg, artworksCount: forExport.length }
  }
}
