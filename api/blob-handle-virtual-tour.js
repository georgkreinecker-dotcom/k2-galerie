/**
 * Vercel Serverless: Token für Client-Upload des Virtueller-Rundgang-Videos (bis 100 MB).
 * Ohne GitHub-Token im Browser – nutzt BLOB_READ_WRITE_TOKEN nur hier.
 * Pfad fest: k2/site-virtual-tour.mp4 | oeffentlich/site-virtual-tour.mp4
 */
const ALLOWED = new Set(['k2/site-virtual-tour.mp4', 'oeffentlich/site-virtual-tour.mp4'])

async function loadHandleUpload() {
  const candidates = ['@vercel/blob/client', '@vercel/blob/dist/client.js', '@vercel/blob']
  const errors = []

  for (const spec of candidates) {
    try {
      const mod = await import(spec)
      if (typeof mod?.handleUpload === 'function') return mod.handleUpload
      errors.push(`${spec}: handleUpload fehlt`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${spec}: ${msg}`)
    }
  }

  throw new Error(`Blob SDK nicht ladbar: ${errors.join(' | ')}`)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' })

  let raw = ''
  for await (const chunk of req) raw += chunk
  let body
  try {
    body = raw ? JSON.parse(raw) : null
  } catch {
    return res.status(400).json({ error: 'Ungültiges JSON' })
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Leerer Body' })

  try {
    const handleUpload = await loadHandleUpload()
    const jsonResponse = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!ALLOWED.has(pathname)) {
          throw new Error('Pfad nicht erlaubt')
        }
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'application/octet-stream'],
          maximumSizeInBytes: 100 * 1024 * 1024,
          allowOverwrite: true,
          addRandomSuffix: false,
        }
      },
    })
    return res.status(200).json(jsonResponse)
  } catch (err) {
    console.error('blob-handle-virtual-tour:', err)
    const msg = (err?.message || String(err)).trim()
    const isToken = /token|BLOB_READ_WRITE|authorization|BlobStoreNotFoundError/i.test(msg)
    const isSuspended = /BlobStoreSuspendedError|suspended/i.test(msg)
    return res.status(isToken || isSuspended ? 503 : 400).json({
      error: isToken
        ? 'Blob-Speicher nicht eingerichtet'
        : isSuspended
          ? 'Blob-Speicher pausiert'
          : msg || 'Upload-Token fehlgeschlagen',
      hint: isToken
        ? 'Vercel: Storage → Blob; BLOB_READ_WRITE_TOKEN für Production prüfen.'
        : isSuspended
          ? 'Vercel Dashboard → Storage → Blob.'
          : undefined,
    })
  }
}
