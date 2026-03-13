/**
 * Vercel Serverless: gallery-data speichern – primär in Vercel Blob (kein Token nötig),
 * optional für K2 zusätzlich ins GitHub-Repo (Backup, wenn GITHUB_TOKEN gesetzt).
 * Tenantfähig: body.tenantId oder body.kontext = k2|oeffentlich|vk2 oder beliebiger sicherer Mandant (a-z0-9-, max 64 Zeichen).
 * Mandantenzahl = nur durch Speicher begrenzt.
 *
 * Chunked Upload: Body kann { chunked, uploadId, chunkIndex, totalChunks, isLast, data } sein.
 * Chunks werden unter upload/{tenantId}/{uploadId}/{chunkIndex}.json gespeichert; bei isLast werden sie gelesen, zusammengeführt und einmal in gallery-data.json geschrieben.
 */
import { put, get, list, del } from '@vercel/blob'

const REPO_OWNER = 'georgkreinecker-dotcom'
const REPO_NAME = 'k2-galerie'
const FILE_PATH = 'public/gallery-data.json'
const LEGACY_TENANTS = ['k2', 'oeffentlich', 'vk2']

/** Erlaubt: Kleinbuchstaben, Ziffern, Bindestrich; 1–64 Zeichen. */
function isSafeTenantId(id) {
  if (!id || typeof id !== 'string') return false
  return /^[a-z0-9-]{1,64}$/.test(id)
}

function getBlobPath(tenantId) {
  if (tenantId === 'k2') return 'gallery-data.json'
  if (tenantId === 'oeffentlich') return 'gallery-data-oeffentlich.json'
  if (tenantId === 'vk2') return 'gallery-data-vk2.json'
  if (isSafeTenantId(tenantId)) return `gallery-data-${tenantId}.json`
  return 'gallery-data.json'
}

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
  // Vercel Serverless Request-Body-Limit ~4,5 MB – darüber schlägt die Anfrage oft still fehl
  const maxBodyBytes = 4 * 1024 * 1024 // 4 MB
  if (!body || body.length > maxBodyBytes) {
    return res.status(400).json({
      error: 'Daten zu groß',
      hint: `Payload ${Math.round(body.length / 1024)} KB (max ${Math.round(maxBodyBytes / 1024)} KB). Bitte weniger Werke oder Bilder verkleinern (Admin: Komprimierung), dann erneut „An Server senden“.`
    })
  }

  let parsed
  try {
    parsed = JSON.parse(body)
  } catch {
    return res.status(400).json({ error: 'Ungültiges JSON' })
  }

  // Chunked Upload: mehrere kleine Teile, am Ende zusammenführen und einmal schreiben
  const isChunked = parsed?.chunked === true && typeof parsed?.uploadId === 'string' && Number.isInteger(parsed?.chunkIndex) && parsed?.data != null
  const uploadIdSafe = isChunked && /^[a-z0-9-]{1,80}$/.test(parsed.uploadId.trim())

  if (isChunked && uploadIdSafe) {
    const tenantIdRaw = (parsed.data?.tenantId ?? 'k2').toLowerCase().trim()
    const tenantId = (LEGACY_TENANTS.includes(tenantIdRaw) || isSafeTenantId(tenantIdRaw)) ? tenantIdRaw : 'k2'
    const chunkPath = `upload/${tenantId}/${parsed.uploadId.trim()}/${parsed.chunkIndex}.json`
    const chunkBody = JSON.stringify(parsed.data)
    const maxChunkBytes = 1024 * 1024 // 1 MB pro Chunk
    if (chunkBody.length > maxChunkBytes) {
      return res.status(400).json({ error: 'Chunk zu groß', hint: `Max ${Math.round(maxChunkBytes / 1024)} KB pro Teil.` })
    }
    try {
      await put(chunkPath, chunkBody, { access: 'public', contentType: 'application/json', addRandomSuffix: false })
    } catch (putErr) {
      console.error('Chunk put Fehler:', putErr)
      const msg = (putErr?.message || String(putErr)).trim()
      const isToken = /token|BLOB_READ_WRITE|authorization/i.test(msg)
      return res.status(500).json({
        error: isToken ? 'Blob-Speicher nicht eingerichtet' : 'Speichern fehlgeschlagen',
        hint: isToken ? 'In Vercel: Storage → Blob Store anlegen.' : msg.substring(0, 300)
      })
    }

    if (!parsed.isLast || parsed.totalChunks == null) {
      return res.status(200).json({ success: true, message: 'Chunk gespeichert', chunkIndex: parsed.chunkIndex })
    }

    // Letzter Chunk: alle Teile lesen, zusammenführen, einmal in gallery-data schreiben
    const prefix = `upload/${tenantId}/${parsed.uploadId.trim()}/`
    let allArtworks = []
    let merged = null
    try {
      const { blobs } = await list({ prefix })
      const sorted = blobs.slice().sort((a, b) => {
        const na = parseInt(a.pathname.replace(/^.*\/(\d+)\.json$/, '$1'), 10)
        const nb = parseInt(b.pathname.replace(/^.*\/(\d+)\.json$/, '$1'), 10)
        return na - nb
      })
      for (const blob of sorted) {
        const r = await get(blob.pathname, { access: 'public' })
        if (!r?.stream) continue
        const chunks = []
        for await (const c of r.stream) chunks.push(c)
        const buf = Buffer.concat(chunks)
        const part = JSON.parse(buf.toString('utf8'))
        if (merged == null) merged = { ...part }
        const arr = Array.isArray(part.artworks) ? part.artworks : []
        allArtworks = allArtworks.concat(arr)
      }
      if (merged == null) {
        return res.status(400).json({ error: 'Keine Chunks gefunden', hint: 'Upload erneut starten.' })
      }
      merged.artworks = allArtworks
      const finalBody = JSON.stringify(merged)
      const BLOB_PATHNAME = getBlobPath(tenantId)
      await put(BLOB_PATHNAME, finalBody, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true
      })
      const urlsToDelete = sorted.map((b) => b.url).filter(Boolean)
      if (urlsToDelete.length > 0) await del(urlsToDelete)
    } catch (mergeErr) {
      console.error('Chunk merge Fehler:', mergeErr)
      const msg = (mergeErr?.message || String(mergeErr)).trim()
      return res.status(500).json({
        error: 'Zusammenführen fehlgeschlagen',
        hint: msg.substring(0, 300)
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Daten gespeichert (Chunked)',
      size: merged ? JSON.stringify(merged).length : 0,
      artworksCount: allArtworks.length,
      source: 'blob'
    })
  }

  const tenantIdRaw = (parsed?.tenantId ?? parsed?.kontext ?? 'k2').toLowerCase().trim()
  const tenantId = (LEGACY_TENANTS.includes(tenantIdRaw) || isSafeTenantId(tenantIdRaw)) ? tenantIdRaw : 'k2'
  const BLOB_PATHNAME = getBlobPath(tenantId)

  let artworksCount = 0
  try {
    artworksCount = Array.isArray(parsed.artworks) ? parsed.artworks.length : 0
  } catch {}

  // 1. Primär: Vercel Blob (ein Aufruf, gesamte Daten)
  try {
    await put(BLOB_PATHNAME, body, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true
    })
  } catch (blobErr) {
    console.error('Blob put Fehler:', blobErr)
    const msg = (blobErr?.message || String(blobErr)).trim()
    const isToken = /token|BLOB_READ_WRITE|authorization/i.test(msg)
    const hint = isToken
      ? 'In Vercel: Storage → Blob Store anlegen. Danach ist BLOB_READ_WRITE_TOKEN automatisch gesetzt.'
      : (msg || 'Unbekannter Blob-Fehler. In Vercel Dashboard → Logs prüfen.').substring(0, 400)
    return res.status(500).json({
      error: isToken ? 'Blob-Speicher nicht eingerichtet' : 'Speichern fehlgeschlagen',
      hint
    })
  }

  // 2. Optional: Backup ins GitHub-Repo nur für K2 (wenn GITHUB_TOKEN gesetzt)
  const token = process.env.GITHUB_TOKEN
  if (token && tenantId === 'k2') {
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
