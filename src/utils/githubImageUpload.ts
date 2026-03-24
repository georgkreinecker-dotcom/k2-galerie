/**
 * Bild direkt via GitHub API in public/img/k2/ hochladen.
 * Vercel deployt automatisch → Bild sofort überall sichtbar.
 */

import { compressImageForStorage } from './compressImageForStorage'

const GITHUB_API = 'https://api.github.com'
const REPO = 'georgkreinecker-dotcom/k2-galerie'
const BRANCH = 'main'
const GITHUB_UPLOAD_TIMEOUT_MS = 3 * 60 * 1000
const FILE_READ_TIMEOUT_MS = 2 * 60 * 1000

function getToken(): string {
  return (import.meta.env.VITE_GITHUB_TOKEN as string) || ''
}

/** Holt den aktuellen SHA einer Datei (nötig für Update via GitHub API) */
async function getFileSha(path: string, token: string): Promise<string | null> {
  try {
    const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    if (res.status === 404) return null
    if (!res.ok) return null
    const data = await res.json()
    return data.sha || null
  } catch {
    return null
  }
}

/** Kontext für Seitengestaltung: bestimmt Subfolder (k2, oeffentlich, vk2→k2). */
export type PageImageContext = 'k2' | 'oeffentlich' | 'vk2'

function contextToSubfolder(context: PageImageContext): 'k2' | 'oeffentlich' {
  return context === 'oeffentlich' ? 'oeffentlich' : 'k2'
}

/**
 * Eine Aufruf-Schicht für Seiten-Bilder: Kontext statt Subfolder.
 * Subfolder-Logik nur hier – Aufrufer geben nur Kontext an.
 */
export async function uploadPageImage(
  file: File,
  context: PageImageContext,
  filename: string = 'willkommen.jpg',
  onStatus?: (msg: string) => void
): Promise<string> {
  return uploadImageToGitHub(file, filename, onStatus, contextToSubfolder(context))
}

/** Lädt ein Bild (File-Objekt) via GitHub API hoch. Gibt die öffentliche URL zurück. */
export async function uploadImageToGitHub(
  file: File,
  filename: string = 'willkommen.jpg',
  onStatus?: (msg: string) => void,
  subfolder: 'k2' | 'oeffentlich' = 'k2'
): Promise<string> {
  const token = getToken()
  if (!token) throw new Error('Kein GitHub Token konfiguriert')

  onStatus?.('Bild wird vorbereitet…')

  // Seiten-Heldenbilder: pageHero (scharf auf großen Displays); Werke bleiben separat „artwork“.
  const compressed = await compressImageForStorage(file, { context: 'pageHero' })
  const base64 = compressed.replace(/^data:image\/\w+;base64,/, '')

  const path = `public/img/${subfolder}/${filename}`

  onStatus?.('Prüfe vorhandene Datei…')
  const sha = await getFileSha(path, token)

  onStatus?.('Bild wird hochgeladen…')
  const body: any = {
    message: `Bild aktualisiert: ${filename}`,
    content: base64,
    branch: BRANCH
  }
  if (sha) body.sha = sha

  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Upload fehlgeschlagen (${res.status})`)
  }

  onStatus?.('✅ Hochgeladen – Vercel deployt (~2 Min)')
  return `/img/${subfolder}/${filename}`
}

/** Löscht eine Datei im Repo via GitHub API (nötig: SHA). Gibt true wenn gelöscht oder 404. */
async function deleteFileInRepo(path: string, token: string): Promise<boolean> {
  const sha = await getFileSha(path, token)
  if (!sha) return true // nicht vorhanden = Erfolg
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${path}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: `Bild entfernt: ${path}`, sha, branch: BRANCH })
  })
  return res.ok || res.status === 404
}

/**
 * Löscht Werkbilder für Nummern 30–39 in public/img/k2/ (Vercel = Deployment aus Repo).
 * Versucht werk-0030.jpg … werk-0039.jpg und werk-30.jpg … werk-39.jpg.
 * Kein Token = keine Aktion (nur lokale/IDB/Supabase-Bereinigung).
 */
export async function deleteArtworkImagesFromGitHubForNumberRange(
  fromNum: number,
  toNum: number
): Promise<{ deleted: string[]; skipped: string }> {
  const token = getToken()
  if (!token) return { deleted: [], skipped: 'Kein GitHub-Token (Vercel-Bilder nur manuell löschbar)' }
  const deleted: string[] = []
  for (let n = fromNum; n <= toNum; n++) {
    const padded = String(n).padStart(4, '0')
    for (const filename of [`werk-${padded}.jpg`, `werk-${n}.jpg`]) {
      const path = `public/img/k2/${filename}`
      try {
        const ok = await deleteFileInRepo(path, token)
        if (ok) deleted.push(filename)
      } catch (_) {}
    }
  }
  return { deleted, skipped: '' }
}

/**
 * Vollständige öffentliche URL des Virtueller-Rundgang-Videos im Blob-Store (Production ohne GitHub-Token).
 * Muss mit ALLOWED in api/blob-handle-virtual-tour.js übereinstimmen.
 */
function virtualTourBlobPathname(subfolder: 'k2' | 'oeffentlich'): string {
  return subfolder === 'oeffentlich' ? 'oeffentlich/site-virtual-tour.mp4' : 'k2/site-virtual-tour.mp4'
}

/** Lädt ein Video hoch: lokal mit Token → GitHub (Repo-Pfad /img/…); sonst → Vercel Blob (HTTPS-URL).
 *  subfolder: 'k2' | 'oeffentlich' – für ök2-Demo dauerhafte URL statt blob (blob ist nur session-gebunden). */
export async function uploadVideoToGitHub(
  file: File,
  filename: string = 'virtual-tour.mp4',
  onStatus?: (msg: string) => void,
  subfolder: 'k2' | 'oeffentlich' = 'k2'
): Promise<string> {
  const token = getToken()

  // Production / Handy: kein VITE_* Token im Bundle → Vercel Blob (API /api/blob-handle-virtual-tour).
  // Reiner Vite-Devserver hat diese API nicht → ohne Token: klare Meldung (oder .env mit Token = GitHub-Zweig oben).
  if (!token) {
    if (import.meta.env.DEV) {
      throw new Error(
        'Lokal ohne GitHub-Token: Video bitte auf k2-galerie.vercel.app hochladen, oder VITE_GITHUB_TOKEN in .env setzen.'
      )
    }
    const { upload } = await import('@vercel/blob/client')
    const pathname = virtualTourBlobPathname(subfolder)
    onStatus?.('Video wird hochgeladen…')
    const blob = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/blob-handle-virtual-tour',
      contentType: file.type || 'video/mp4',
      multipart: true,
    })
    const url = blob?.url?.trim()
    if (!url) throw new Error('Keine Blob-URL nach Upload')
    onStatus?.('✅ Video gespeichert – in der Galerie abspielbar.')
    return url
  }

  onStatus?.('Video wird vorbereitet…')

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    const timeout = window.setTimeout(() => {
      reader.abort()
      reject(new Error('Video-Vorbereitung hat zu lange gedauert'))
    }, FILE_READ_TIMEOUT_MS)
    reader.onload = (e) => {
      const result = e.target?.result as string
      clearTimeout(timeout)
      resolve(result.split(',')[1] || '')
    }
    reader.onerror = () => {
      clearTimeout(timeout)
      reject(new Error('Video konnte nicht gelesen werden'))
    }
    reader.readAsDataURL(file)
  })

  onStatus?.('Video wird an GitHub gesendet…')

  const path = `public/img/${subfolder}/${filename}`

  onStatus?.('Prüfe vorhandene Datei…')
  const sha = await getFileSha(path, token)

  onStatus?.('Video wird hochgeladen…')
  const body: Record<string, unknown> = {
    message: `Video aktualisiert: ${filename}`,
    content: base64,
    branch: BRANCH
  }
  if (sha) body.sha = sha

  const controller = new AbortController()
  const ghTimeout = window.setTimeout(() => controller.abort(), GITHUB_UPLOAD_TIMEOUT_MS)
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: controller.signal
  }).finally(() => clearTimeout(ghTimeout))

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || `Upload fehlgeschlagen (${res.status})`)
  }

  onStatus?.('✅ Hochgeladen – Vercel deployt (~2 Min)')
  return `/img/${subfolder}/${filename}`
}

