/**
 * Bild direkt via GitHub API in public/img/k2/ hochladen.
 * Vercel deployt automatisch → Bild sofort überall sichtbar.
 */

import { compressImageForStorage } from './compressImageForStorage'

const GITHUB_API = 'https://api.github.com'
const REPO = 'georgkreinecker-dotcom/k2-galerie'
const BRANCH = 'main'

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

  const compressed = await compressImageForStorage(file, { maxWidth: 800, quality: 0.75 })
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

/** Lädt ein Video (File-Objekt) via GitHub API hoch. Gibt die öffentliche URL zurück. */
export async function uploadVideoToGitHub(
  file: File,
  filename: string = 'virtual-tour.mp4',
  onStatus?: (msg: string) => void
): Promise<string> {
  const token = getToken()
  if (!token) throw new Error('Kein GitHub Token konfiguriert')

  onStatus?.('Video wird vorbereitet…')

  // Video als Base64 lesen (keine Komprimierung – Browser kann Videos nicht einfach komprimieren)
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      // Data-URL Prefix entfernen
      resolve(result.split(',')[1] || '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const path = `public/img/k2/${filename}`

  onStatus?.('Prüfe vorhandene Datei…')
  const sha = await getFileSha(path, token)

  onStatus?.('Video wird hochgeladen…')
  const body: any = {
    message: `Video aktualisiert: ${filename}`,
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
  return `/img/k2/${filename}`
}

