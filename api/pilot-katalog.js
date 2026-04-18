/**
 * Vercel Serverless: Piloten-/Testuser-Katalog (APf) – eine Liste, alle Geräte gleich.
 * GET: volle Liste (geschützt wenn PILOT_KATALOG_API_KEY gesetzt).
 * POST: volle Liste ersetzen (Merge passiert im Client).
 * Speicher: Vercel Blob pilot-katalog.json
 */
const { get, put } = require('@vercel/blob')

const BLOB_PATH = 'pilot-katalog.json'
const API_KEY_HEADER = 'x-api-key'
const AUTH_HEADER = 'authorization'
const MAX_BODY_BYTES = 900 * 1024
const MAX_ENTRIES = 400

function getExpectedKey() {
  return process.env.PILOT_KATALOG_API_KEY || ''
}

/** 'ok' | 'denied' | 'not_configured' */
function getAuthState(req) {
  const expected = getExpectedKey()
  if (!expected || typeof expected !== 'string' || expected.length < 8) {
    return 'not_configured'
  }
  const apiKey = req.headers[API_KEY_HEADER] || (req.headers[AUTH_HEADER] || '').replace(/^Bearer\s+/i, '').trim()
  return apiKey === expected ? 'ok' : 'denied'
}

async function loadEntries() {
  try {
    const result = await get(BLOB_PATH, { access: 'public' })
    if (!result?.stream) return []
    const chunks = []
    for await (const chunk of result.stream) chunks.push(chunk)
    const json = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (Array.isArray(json)) return json
    if (json && Array.isArray(json.entries)) return json.entries
    return []
  } catch (_) {
    return []
  }
}

function isValidEntry(e) {
  if (!e || typeof e !== 'object') return false
  if (typeof e.id !== 'string' || e.id.length < 1 || e.id.length > 96) return false
  if (typeof e.name !== 'string' || e.name.length > 200) return false
  if (typeof e.appName !== 'string' || e.appName.length > 200) return false
  if (typeof e.email !== 'string' || e.email.length > 200) return false
  if (typeof e.phone !== 'string' || e.phone.length > 80) return false
  if (typeof e.notiz !== 'string' || e.notiz.length > 2000) return false
  if (typeof e.status !== 'string') return false
  const ALLOWED_STATUS = new Set([
    'bewerbung',
    'zugang_gesendet',
    'test_aktiv',
    'protokoll_eingereicht',
    'freigabe',
    'sonstiges',
  ])
  if (!ALLOWED_STATUS.has(e.status)) return false
  if (typeof e.createdAt !== 'string' || e.createdAt.length > 40) return false
  if (e.zugangsblattUrl != null && (typeof e.zugangsblattUrl !== 'string' || e.zugangsblattUrl.length > 4000)) return false
  if (e.zettelNr != null && (typeof e.zettelNr !== 'string' || e.zettelNr.length > 64)) return false
  if (e.pilotRegKey != null && (typeof e.pilotRegKey !== 'string' || e.pilotRegKey.length > 500)) return false
  if (e.pilotLinie != null && !['oek2', 'vk2', 'familie'].includes(e.pilotLinie)) return false
  if (e.updatedAt != null && typeof e.updatedAt !== 'string') return false
  return true
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const auth = getAuthState(req)
  if (auth === 'not_configured') {
    return res.status(503).json({
      error: 'Pilot-Katalog nicht konfiguriert',
      hint: 'In Vercel: PILOT_KATALOG_API_KEY setzen (min. 8 Zeichen). Client: VITE_PILOT_KATALOG_API_KEY gleicher Wert.',
    })
  }
  if (auth === 'denied') {
    return res.status(401).json({ error: 'Nicht autorisiert', hint: 'API-Key fehlt oder falsch (Header x-api-key).' })
  }

  if (req.method === 'GET') {
    try {
      const entries = await loadEntries()
      return res.status(200).json({
        entries,
        fetchedAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error('pilot-katalog GET:', err)
      const msg = (err?.message || String(err)).trim()
      const isSuspended = /BlobStoreSuspendedError|suspended|store has been suspended/i.test(msg)
      const isToken = /token|BLOB_READ_WRITE|authorization/i.test(msg)
      const hint = isToken ? 'Vercel: Storage → Blob anlegen.' : isSuspended ? 'Vercel Blob pausiert.' : msg.substring(0, 200)
      return res.status(500).json({
        error: isToken ? 'Blob nicht eingerichtet' : isSuspended ? 'Blob pausiert' : 'Laden fehlgeschlagen',
        hint,
      })
    }
  }

  if (req.method === 'POST') {
    let body = ''
    for await (const chunk of req) body += chunk
    if (body.length > MAX_BODY_BYTES) {
      return res.status(400).json({ error: 'Payload zu groß' })
    }
    let parsed
    try {
      parsed = body ? JSON.parse(body) : {}
    } catch {
      return res.status(400).json({ error: 'Ungültiges JSON' })
    }
    const entries = Array.isArray(parsed.entries) ? parsed.entries : null
    if (!entries) {
      return res.status(400).json({ error: 'entries muss ein Array sein' })
    }
    if (entries.length > MAX_ENTRIES) {
      return res.status(400).json({ error: `Maximal ${MAX_ENTRIES} Einträge` })
    }
    for (let i = 0; i < entries.length; i++) {
      if (!isValidEntry(entries[i])) {
        return res.status(400).json({ error: `Ungültiger Eintrag bei Index ${i}` })
      }
    }
    try {
      await put(BLOB_PATH, JSON.stringify({ entries, savedAt: new Date().toISOString() }), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
    } catch (err) {
      console.error('pilot-katalog POST put:', err)
      const msg = (err?.message || String(err)).trim()
      const isSuspended = /BlobStoreSuspendedError|suspended|store has been suspended/i.test(msg)
      const isToken = /token|BLOB_READ_WRITE|authorization/i.test(msg)
      const hint = isToken ? 'Vercel: Storage → Blob anlegen.' : isSuspended ? 'Vercel Blob pausiert.' : msg.substring(0, 200)
      return res.status(500).json({
        error: isToken ? 'Blob nicht eingerichtet' : isSuspended ? 'Blob pausiert' : 'Speichern fehlgeschlagen',
        hint,
      })
    }
    return res.status(200).json({ ok: true, count: entries.length })
  }

  return res.status(405).json({ error: 'Nur GET und POST erlaubt' })
}
