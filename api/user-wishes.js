/**
 * Vercel Serverless: Rückmeldungen (Idee/Wunsch + Problem melden) – Smart Panel.
 * GET: Liste (neueste zuerst), POST: neuer Eintrag. Speicher: Vercel Blob user-wishes.json.
 * CommonJS für zuverlässigen Vercel-Build (ohne "type": "module").
 */
const { get, put } = require('@vercel/blob')

const BLOB_PATH = 'user-wishes.json'

async function loadWishes() {
  try {
    const result = await get(BLOB_PATH, { access: 'public' })
    if (!result?.stream) return []
    const chunks = []
    for await (const chunk of result.stream) chunks.push(chunk)
    const json = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    return Array.isArray(json) ? json : []
  } catch (_) {
    return []
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const list = await loadWishes()
      const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return res.status(200).json({ wishes: sorted })
    } catch (err) {
      console.error('user-wishes GET:', err)
      const msg = (err?.message || String(err)).trim()
      const isSuspended = /BlobStoreSuspendedError|suspended|store has been suspended/i.test(msg)
      const isToken = /token|BLOB_READ_WRITE|authorization/i.test(msg)
      const hint = isToken ? 'Vercel: Storage → Blob anlegen.' : isSuspended ? 'Vercel Blob pausiert. Dashboard → Storage prüfen.' : msg.substring(0, 200)
      return res.status(500).json({ error: isToken ? 'Blob nicht eingerichtet' : isSuspended ? 'Blob pausiert' : 'Laden fehlgeschlagen', hint })
    }
  }

  if (req.method === 'POST') {
    let body = ''
    for await (const chunk of req) body += chunk
    let parsed
    try {
      parsed = body ? JSON.parse(body) : {}
    } catch {
      return res.status(400).json({ error: 'Ungültiges JSON' })
    }
    const text = typeof parsed.text === 'string' ? parsed.text.trim() : ''
    if (!text || text.length > 2000) {
      return res.status(400).json({ error: 'Text fehlt oder zu lang (max 2000 Zeichen)' })
    }
    const source = typeof parsed.source === 'string' ? parsed.source.slice(0, 64) : 'entdecken'
    const kind = parsed.kind === 'problem' ? 'problem' : 'wish'
    const list = await loadWishes()
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      text,
      source,
      kind,
      createdAt: new Date().toISOString(),
    }
    list.push(entry)
    try {
      await put(BLOB_PATH, JSON.stringify(list), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
    } catch (err) {
      console.error('user-wishes POST put:', err)
      const msg = (err?.message || String(err)).trim()
      const isSuspended = /BlobStoreSuspendedError|suspended|store has been suspended/i.test(msg)
      const isToken = /token|BLOB_READ_WRITE|authorization/i.test(msg)
      const hint = isToken ? 'Vercel: Storage → Blob anlegen.' : isSuspended ? 'Vercel Blob pausiert. Dashboard → Storage prüfen.' : msg.substring(0, 200)
      return res.status(500).json({ error: isToken ? 'Blob nicht eingerichtet' : isSuspended ? 'Blob pausiert' : 'Speichern fehlgeschlagen', hint })
    }
    return res.status(200).json({ ok: true, id: entry.id })
  }

  return res.status(405).json({ error: 'Nur GET und POST erlaubt' })
}
