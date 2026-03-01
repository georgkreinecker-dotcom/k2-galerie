/**
 * Vercel Serverless: gallery-data speichern – primär in Vercel Blob (kein Token nötig),
 * optional zusätzlich ins GitHub-Repo (Backup, wenn GITHUB_TOKEN gesetzt).
 *
 * Blob: BLOB_READ_WRITE_TOKEN wird von Vercel automatisch gesetzt, sobald ein Blob Store
 * im Projekt angelegt ist (Vercel Dashboard → Storage → Create Database/Blob).
 */
import { put } from '@vercel/blob'

const REPO_OWNER = 'georgkreinecker-dotcom'
const REPO_NAME = 'k2-galerie'
const FILE_PATH = 'public/gallery-data.json'
const BLOB_PATHNAME = 'gallery-data.json'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' })
  }

  let body = ''
  for await (const chunk of req) body += chunk
  if (!body || body.length > 6 * 1024 * 1024) {
    return res.status(400).json({ error: 'Body leer oder zu groß (max 6MB)' })
  }

  try {
    JSON.parse(body)
  } catch {
    return res.status(400).json({ error: 'Ungültiges JSON' })
  }

  let artworksCount = 0
  try {
    const parsed = JSON.parse(body)
    artworksCount = Array.isArray(parsed.artworks) ? parsed.artworks.length : 0
  } catch {}

  // 1. Primär: Vercel Blob (kein GITHUB_TOKEN nötig – BLOB_READ_WRITE_TOKEN kommt von Vercel)
  try {
    await put(BLOB_PATHNAME, body, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true
    })
  } catch (blobErr) {
    console.error('Blob put Fehler:', blobErr)
    const msg = blobErr?.message || String(blobErr)
    const isToken = /token|BLOB_READ_WRITE|authorization/i.test(msg)
    return res.status(500).json({
      error: isToken ? 'Blob-Speicher nicht eingerichtet' : 'Speichern fehlgeschlagen',
      hint: isToken
        ? 'In Vercel: Storage → Blob Store anlegen. Danach ist BLOB_READ_WRITE_TOKEN automatisch gesetzt.'
        : msg.substring(0, 200)
    })
  }

  // 2. Optional: Backup ins GitHub-Repo (wenn GITHUB_TOKEN gesetzt)
  const token = process.env.GITHUB_TOKEN
  if (token) {
    try {
      const contentBase64 = Buffer.from(body, 'utf8').toString('base64')
      const getRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
      )
      let sha = null
      if (getRes.ok) {
        const data = await getRes.json()
        sha = data.sha
      } else if (getRes.status !== 404) {
        console.error('GitHub GET:', getRes.status, await getRes.text())
      }
      const putBody = {
        message: `Update gallery-data.json (${new Date().toISOString().slice(0, 10)})`,
        content: contentBase64
      }
      if (sha) putBody.sha = sha
      const putRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(putBody)
        }
      )
      if (!putRes.ok) {
        console.error('GitHub PUT:', putRes.status, await putRes.text())
      }
    } catch (gitErr) {
      console.error('GitHub Backup Fehler (nicht kritisch):', gitErr)
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Daten gespeichert',
    size: body.length,
    artworksCount,
    source: 'blob'
  })
}
