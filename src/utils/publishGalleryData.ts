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

/** Ab dieser Größe wird in kleinen Chunks gesendet (jeweils unter 1 MB). */
const CHUNKED_THRESHOLD_BYTES = 4 * 1024 * 1024
/** Max Größe pro Chunk (Request-Body-Limit sicher einhalten). */
const MAX_CHUNK_BYTES = 900 * 1024

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
  /** Nummern/IDs der Werke, für die keine Bild-URL erstellt werden konnte (Anzeige in der App). */
  artworkNumbersWithoutImageUrl?: string[]
  /** Nach erfolgreichem POST: Kontrolle was auf Vercel angekommen ist (GET direkt danach). */
  serverArtworksCount?: number
  serverImagesCount?: number
  /** exportedAt aus der Antwort direkt nach dem Schreiben – zeigt ob der neue Stand wirklich auf Vercel steht. */
  serverExportedAt?: string
  payloadSizeBytes?: number
}

/**
 * K2: Meta (Stammdaten/Events/Dokumente/Design/PageTexts/PageContent) gezielt am Server korrigieren,
 * ohne die Server-Werke anzutasten. („Ein Stand = ein Stand“)
 *
 * Quelle Werke: Server (unverändert)
 * Quelle Meta: aktueller lokaler Admin-Stand (dieses Gerät)
 */
export async function publishK2MetaToServerPreserveArtworks(): Promise<PublishGalleryDataResult> {
  // 1) Server lesen (Werke sind Wahrheit)
  let serverData: any = null
  try {
    const res = await fetch(`${GALLERY_DATA_BASE_URL}/api/gallery-data?tenantId=k2&_=${Date.now()}`, { cache: 'no-store' })
    if (res.ok) serverData = await res.json().catch(() => null)
  } catch {
    /* ignore */
  }
  const serverArtworks = Array.isArray(serverData?.artworks) ? serverData.artworks : []
  if (serverArtworks.length === 0) {
    return { success: false, error: 'Server hat keine Werke. Meta-Korrektur abgebrochen (würde sonst leer überschreiben).' }
  }

  // 2) Lokale Meta (Admin-Stand) einsammeln – nie Base64/Blob mitsenden
  const galleryStamm = getItemSafe('k2-stammdaten-galerie', {}) as Record<string, unknown>
  const pageContent = getPageContentGalerie()
  const toUrlOrEmpty = (v: string | undefined): string => {
    if (!v || typeof v !== 'string') return ''
    if (v.startsWith('data:') || v.startsWith('blob:')) return ''
    return v
  }
  const welcome = (pageContent?.welcomeImage as string) || (galleryStamm?.welcomeImage as string) || ''
  const galerieCard = (pageContent?.galerieCardImage as string) || (galleryStamm?.galerieCardImage as string) || ''
  const virtualTour = (pageContent?.virtualTourImage as string) || (galleryStamm?.virtualTourImage as string) || ''
  const virtualTourVideo = (pageContent?.virtualTourVideo as string) || ''
  const pageContentForServer = {
    ...pageContent,
    welcomeImage: toUrlOrEmpty(pageContent?.welcomeImage as string),
    galerieCardImage: toUrlOrEmpty(pageContent?.galerieCardImage as string),
    virtualTourImage: toUrlOrEmpty(pageContent?.virtualTourImage as string),
    virtualTourVideo: toUrlOrEmpty(virtualTourVideo),
  }

  const payload = {
    martina: getItemSafe('k2-stammdaten-martina', {}),
    georg: getItemSafe('k2-stammdaten-georg', {}),
    gallery: {
      ...galleryStamm,
      welcomeImage: toUrlOrEmpty(welcome),
      galerieCardImage: toUrlOrEmpty(galerieCard),
      virtualTourImage: toUrlOrEmpty(virtualTour),
    },
    // Werke bleiben exakt wie am Server
    artworks: serverArtworks,
    events: (loadEvents('k2') as any[]).slice(0, 100),
    documents: (loadDocuments('k2') as any[]).slice(0, 100),
    designSettings: getItemSafe('k2-design-settings', {}),
    pageTexts: getItemSafe('k2-page-texts', null),
    pageContentGalerie: JSON.stringify(pageContentForServer),
    version: Date.now(),
    buildId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    exportedAt: new Date().toISOString(),
    tenantId: 'k2',
  }

  const json = JSON.stringify(payload)
  const writeUrl = `${GALLERY_DATA_BASE_URL}/api/write-gallery-data`
  const timeoutMs = 60000
  const apiKey = typeof import.meta.env.VITE_WRITE_GALLERY_API_KEY === 'string' ? String(import.meta.env.VITE_WRITE_GALLERY_API_KEY).trim() : ''
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-API-Key'] = apiKey

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(writeUrl, { method: 'POST', headers, body: json, signal: controller.signal })
    clearTimeout(timeoutId)
    const result = await res.json().catch(() => ({}))
    if (!res.ok || result?.success !== true) {
      const err = result?.error || `Server ${res.status}`
      const hint = result?.hint && String(result.hint).trim()
      return { success: false, error: hint ? `${err}\n\n${hint}` : err, payloadSizeBytes: json.length }
    }
    const out: PublishGalleryDataResult = {
      success: true,
      result,
      artworksCount: serverArtworks.length,
      payloadSizeBytes: json.length,
    }
    try {
      const getRes = await fetch(`${GALLERY_DATA_BASE_URL}/api/gallery-data?tenantId=k2&_=${Date.now()}`, { cache: 'no-store' })
      if (getRes.ok) {
        const after = await getRes.json().catch(() => null)
        if (after?.exportedAt) out.serverExportedAt = String(after.exportedAt)
      }
    } catch {
      /* ignore */
    }
    return out
  } catch (e) {
    clearTimeout(timeoutId)
    const msg = e instanceof Error ? e.message : String(e)
    const isNetwork =
      /failed to fetch|load failed|networkerror|aborted|timeout|network request failed/i.test(msg) ||
      (e instanceof Error && e.name === 'AbortError')
    return {
      success: false,
      error: isNetwork
        ? 'Netzwerkfehler (Verbindung oder Zeitüberschreitung). Bitte erneut versuchen.'
        : msg,
      payloadSizeBytes: json.length
    }
  }
}

/**
 * Einziger Standard-Ablauf für Veröffentlichen:
 * 1. Bild-URLs auflösen (imageRef/Base64 → https), damit Server echte URLs bekommt
 * 2. Base64 aus Export entfernen (artworksForExport)
 * 3. Payload aus localStorage bauen (Stammdaten, Events, Documents, Design)
 * 4. POST /api/write-gallery-data
 */
/** phase 'chunks' = Teil X von Y senden; sonst Bilder vorbereiten / Daten senden */
export async function publishGalleryDataToServer(
  artworks: any[],
  options?: {
    onProgress?: (done: number, total: number, phase?: 'images' | 'chunks') => void
    /** Nach bewusstem Löschen aller Werke: leeres Array an Vercel schreiben (sonst kommen alte Werke beim nächsten Laden zurück). */
    allowEmptyArtworks?: boolean
    /**
     * Sicherheitsmodus: Stammdaten/Events/Dokumente/Design/PageTexts werden vom Server übernommen
     * und nur die Werke werden ersetzt. Verhindert, dass ein Gerät mit altem lokalen Stand
     * (z. B. Handy) beim automatischen Hintergrund-Senden Stammdaten oder Eventinhalte „zurückdreht“.
     */
    preserveServerMeta?: boolean
  }
): Promise<PublishGalleryDataResult> {
  const allowEmpty = options?.allowEmptyArtworks === true
  if (!Array.isArray(artworks) || (!allowEmpty && artworks.length === 0)) {
    return { success: false, error: 'Keine Werke zum Veröffentlichen' }
  }

  const total = artworks.length
  options?.onProgress?.(0, total)
  const withUrls = await resolveArtworkImageUrlsForExport(artworks, { onProgress: options?.onProgress })
  const hasHttpsUrl = (a: any) =>
    a?.imageUrl &&
    typeof a.imageUrl === 'string' &&
    (a.imageUrl.startsWith('http://') || a.imageUrl.startsWith('https://'))
  const imagesResolved = withUrls.filter(hasHttpsUrl).length
  const artworkNumbersWithoutImageUrl = withUrls
    .filter((a: any) => !hasHttpsUrl(a))
    .map((a: any) => String(a?.number ?? a?.id ?? '').trim())
    .filter(Boolean)
  const forExport = artworksForExport(withUrls)

  // Optional: Meta vom Server übernehmen (nur K2) – verhindert „zurückdrehen“ durch alte lokale Daten.
  let serverMeta: Record<string, unknown> | null = null
  if (options?.preserveServerMeta) {
    try {
      const res = await fetch(`${GALLERY_DATA_BASE_URL}/api/gallery-data?tenantId=k2&_=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const j = await res.json().catch(() => null)
        if (j && typeof j === 'object') serverMeta = j as Record<string, unknown>
      }
    } catch {
      // ignore → fällt auf lokalen Stand zurück
    }
  }

  const galleryStamm = (serverMeta?.gallery ?? getItemSafe('k2-stammdaten-galerie', {})) as Record<string, unknown>
  const pageContent = serverMeta?.pageContentGalerie
    ? (() => {
        try {
          const raw = String(serverMeta!.pageContentGalerie ?? '')
          const parsed = raw ? JSON.parse(raw) : null
          return parsed && typeof parsed === 'object' ? (parsed as any) : getPageContentGalerie()
        } catch {
          return getPageContentGalerie()
        }
      })()
    : getPageContentGalerie()
  // Nur URLs mitsenden – keine data: (Base64), sonst wird der Payload um MB groß (Speicher/Blob-Limit)
  const toUrlOrEmpty = (v: string | undefined): string => {
    if (!v || typeof v !== 'string') return ''
    if (v.startsWith('data:') || v.startsWith('blob:')) return ''
    return v
  }
  const welcome = (pageContent?.welcomeImage as string) || (galleryStamm?.welcomeImage as string) || ''
  const galerieCard = (pageContent?.galerieCardImage as string) || (galleryStamm?.galerieCardImage as string) || ''
  const virtualTour = (pageContent?.virtualTourImage as string) || (galleryStamm?.virtualTourImage as string) || ''
  const virtualTourVideo = (pageContent?.virtualTourVideo as string) || ''
  const pageContentForServer = {
    ...pageContent,
    welcomeImage: toUrlOrEmpty(pageContent?.welcomeImage as string),
    galerieCardImage: toUrlOrEmpty(pageContent?.galerieCardImage as string),
    virtualTourImage: toUrlOrEmpty(pageContent?.virtualTourImage as string),
    virtualTourVideo: toUrlOrEmpty(virtualTourVideo),
  }
  const data = {
    martina: (serverMeta?.martina ?? getItemSafe('k2-stammdaten-martina', {})),
    georg: (serverMeta?.georg ?? getItemSafe('k2-stammdaten-georg', {})),
    gallery: {
      ...galleryStamm,
      welcomeImage: toUrlOrEmpty(welcome), galerieCardImage: toUrlOrEmpty(galerieCard), virtualTourImage: toUrlOrEmpty(virtualTour)
    },
    artworks: forExport,
    events: (Array.isArray(serverMeta?.events) ? (serverMeta!.events as any[]) : (loadEvents('k2') as any[])).slice(0, 100),
    documents: (Array.isArray(serverMeta?.documents) ? (serverMeta!.documents as any[]) : (loadDocuments('k2') as any[])).slice(0, 100),
    designSettings: (serverMeta?.designSettings ?? getItemSafe('k2-design-settings', {})),
    pageTexts: (serverMeta?.pageTexts ?? getItemSafe('k2-page-texts', null)),
    pageContentGalerie: JSON.stringify(pageContentForServer),
    version: Date.now(),
    buildId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    exportedAt: new Date().toISOString(),
    tenantId: 'k2'
  }

  const json = JSON.stringify(data)
  const writeUrl = `${GALLERY_DATA_BASE_URL}/api/write-gallery-data`
  const timeoutMs = 60000 // 60 s pro Request

  // Systemsicherheit: API-Key mitschicken, wenn gesetzt (Vercel WRITE_GALLERY_API_KEY + VITE_WRITE_GALLERY_API_KEY)
  const apiKey = typeof import.meta.env.VITE_WRITE_GALLERY_API_KEY === 'string' ? String(import.meta.env.VITE_WRITE_GALLERY_API_KEY).trim() : ''
  const writeHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) writeHeaders['X-API-Key'] = apiKey

  // Kleinere Häppchen: wenn Gesamt-Payload zu groß, in Chunks unter 1 MB senden
  if (json.length > CHUNKED_THRESHOLD_BYTES) {
    const artworks = (data as any).artworks || []
    const base = { ...data, artworks: [] } as any
    const batches: any[][] = []
    let batch: any[] = []
    let batchSize = 0
    for (const a of artworks) {
      const s = JSON.stringify(a).length
      if (batchSize + s > MAX_CHUNK_BYTES && batch.length > 0) {
        batches.push(batch)
        batch = []
        batchSize = 0
      }
      batch.push(a)
      batchSize += s
    }
    if (batch.length > 0) batches.push(batch)
    const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    const totalChunks = batches.length

    for (let i = 0; i < totalChunks; i++) {
      options?.onProgress?.(i + 1, totalChunks, 'chunks')
      const chunkData = i === 0
        ? { ...base, artworks: batches[0] }
        : { tenantId: (data as any).tenantId || 'k2', artworks: batches[i] }
      const body = JSON.stringify({
        chunked: true,
        uploadId,
        chunkIndex: i,
        totalChunks,
        isLast: i === totalChunks - 1,
        data: chunkData
      })
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
      try {
        const response = await fetch(writeUrl, {
          method: 'POST',
          headers: writeHeaders,
          body,
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        const result = await response.json().catch(() => ({}))
        if (!response.ok || result?.success !== true) {
          const err = result?.error || `Server ${response.status}`
          const hint = result?.hint && String(result.hint).trim()
          return {
            success: false,
            error: hint ? `${err}\n\n${hint}` : err,
            artworksCount: forExport.length
          }
        }
      } catch (e) {
        clearTimeout(timeoutId)
        const msg = e instanceof Error ? e.message : String(e)
        const isNetwork =
          /failed to fetch|load failed|networkerror|aborted|timeout/i.test(msg) || (e instanceof Error && e.name === 'AbortError')
        return {
          success: false,
          error: isNetwork
            ? 'Netzwerkfehler (Verbindung oder Zeitüberschreitung). Bitte WLAN prüfen und erneut „An Server senden“.'
            : msg,
          artworksCount: forExport.length
        }
      }
    }

    const out: PublishGalleryDataResult = {
      success: true,
      result: { message: 'Daten gespeichert (Chunked)', artworksCount: forExport.length },
      artworksCount: forExport.length,
      imagesResolved,
      artworkNumbersWithoutImageUrl: artworkNumbersWithoutImageUrl.length > 0 ? artworkNumbersWithoutImageUrl : undefined,
      payloadSizeBytes: json.length
    }
    try {
      const getRes = await fetch(`${GALLERY_DATA_BASE_URL}/api/gallery-data?tenantId=k2&_=${Date.now()}`, { cache: 'no-store' })
      if (getRes.ok) {
        const serverData = await getRes.json().catch(() => null)
        const serverList = Array.isArray(serverData?.artworks) ? serverData.artworks : []
        out.serverArtworksCount = serverList.length
        if (serverData?.exportedAt) out.serverExportedAt = String(serverData.exportedAt)
      }
    } catch (_) {}
    return out
  }

  // Ein Aufruf (Payload unter 4 MB)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(writeUrl, {
      method: 'POST',
      headers: writeHeaders,
      body: json,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    const result = await response.json().catch(() => ({}))
    if (response.ok && result?.success === true) {
      const out: PublishGalleryDataResult = {
        success: true,
        result,
        artworksCount: forExport.length,
        imagesResolved,
        artworkNumbersWithoutImageUrl: artworkNumbersWithoutImageUrl.length > 0 ? artworkNumbersWithoutImageUrl : undefined,
        payloadSizeBytes: json.length
      }
      try {
        const getRes = await fetch(`${GALLERY_DATA_BASE_URL}/api/gallery-data?tenantId=k2&_=${Date.now()}`, { cache: 'no-store' })
        if (getRes.ok) {
          const serverData = await getRes.json().catch(() => null)
          const serverList = Array.isArray(serverData?.artworks) ? serverData.artworks : []
          out.serverArtworksCount = serverList.length
          if (serverData?.exportedAt) out.serverExportedAt = String(serverData.exportedAt)
        }
      } catch (_) {}
      return out
    }
    const err = result?.error || `Server ${response.status}`
    const hint = result?.hint && String(result.hint).trim()
    return {
      success: false,
      error: hint ? `${err}\n\n${hint}` : err,
      artworksCount: forExport.length
    }
  } catch (e) {
    clearTimeout(timeoutId)
    const msg = e instanceof Error ? e.message : String(e)
    const isNetwork =
      /failed to fetch|load failed|networkerror|aborted|timeout|network request failed/i.test(msg) ||
      (e instanceof Error && e.name === 'AbortError')
    const error = isNetwork
      ? 'Netzwerkfehler (Verbindung oder Zeitüberschreitung). Bitte WLAN/Datennetz prüfen und App von k2-galerie.vercel.app öffnen – dann erneut „An Server senden“.'
      : msg
    return { success: false, error, artworksCount: forExport.length }
  }
}
