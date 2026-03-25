/**
 * Entdecken-Eingangstor-Bild: lokal mit VITE_GITHUB_TOKEN → direkt GitHub;
 * sonst → Vercel-API (GITHUB_TOKEN serverseitig), gleiche Basis-URL wie „Veröffentlichen“.
 */
import { GALLERY_DATA_BASE_URL } from '../config/externalUrls'
import { compressImageForStorage } from './compressImageForStorage'

function getDevGithubToken(): string {
  return (import.meta.env.VITE_GITHUB_TOKEN as string) || ''
}

export type UploadEntdeckenHeroResult = { path: string; dataUrl: string }

export type UploadEntdeckenHeroOptions = {
  /** Bereits komprimierte Data-URL – vermeidet zweites Dekodieren/Komprimieren (UI friert nicht ein). */
  preparedDataUrl?: string
}

export async function uploadEntdeckenHeroImage(
  file: File,
  onStatus?: (msg: string) => void,
  options?: UploadEntdeckenHeroOptions
): Promise<UploadEntdeckenHeroResult> {
  const token = getDevGithubToken()
  const useClientGitHub = import.meta.env.DEV && Boolean(token)

  const pre = options?.preparedDataUrl?.trim() ?? ''
  let dataUrl: string
  if (pre.startsWith('data:image/')) {
    dataUrl = pre
  } else {
    onStatus?.('Bild wird vorbereitet…')
    dataUrl = await compressImageForStorage(file, { context: 'pageHero', maxWidth: 1920, quality: 0.82 })
  }

  if (useClientGitHub) {
    const { uploadCompressedPageImageDataUrl } = await import('./githubImageUpload')
    const path = await uploadCompressedPageImageDataUrl(
      dataUrl,
      'oeffentlich',
      'entdecken-hero.jpg',
      onStatus
    )
    return { path, dataUrl }
  }

  const contentBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')

  const apiKey =
    typeof import.meta.env.VITE_WRITE_GALLERY_API_KEY === 'string'
      ? String(import.meta.env.VITE_WRITE_GALLERY_API_KEY).trim()
      : ''
  const url = `${GALLERY_DATA_BASE_URL}/api/upload-entdecken-hero`
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-API-Key'] = apiKey

  onStatus?.('Wird gespeichert (Server → GitHub)…')
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ contentBase64 }),
  })
  const j = (await res.json().catch(() => ({}))) as { error?: string; hint?: string; path?: string }
  if (!res.ok) {
    const msg = [j.hint, j.error].filter(Boolean).join(' – ') || res.statusText
    throw new Error(msg || 'Upload fehlgeschlagen')
  }

  onStatus?.('✅ Im Repo – Vercel deployt (~1–2 Min)')
  const path =
    typeof j.path === 'string' && j.path.startsWith('/') ? j.path : '/img/oeffentlich/entdecken-hero.jpg'
  return { path, dataUrl }
}
