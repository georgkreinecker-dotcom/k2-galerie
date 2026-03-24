/**
 * Vercel Serverless: Entdecken-Eingangstor-Bild → GitHub (public/img/oeffentlich/entdecken-hero.jpg).
 * Der Browser hat keinen GitHub-Token; GITHUB_TOKEN nur hier (wie Backup in write-gallery-data).
 * Auth: optional WRITE_GALLERY_API_KEY (wie write-gallery-data).
 */
const REPO_OWNER = 'georgkreinecker-dotcom'
const REPO_NAME = 'k2-galerie'
const FILE_PATH = 'public/img/oeffentlich/entdecken-hero.jpg'

const API_KEY_HEADER = 'x-api-key'
const AUTH_HEADER = 'authorization'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' })
  }

  const expectedKey = process.env.WRITE_GALLERY_API_KEY
  if (expectedKey && typeof expectedKey === 'string' && expectedKey.length > 0) {
    const apiKey = req.headers[API_KEY_HEADER] || (req.headers[AUTH_HEADER] || '').replace(/^Bearer\s+/i, '').trim()
    if (apiKey !== expectedKey) {
      return res.status(401).json({ error: 'Nicht autorisiert', hint: 'API-Key fehlt oder ist ungültig.' })
    }
  }

  let raw = ''
  for await (const chunk of req) raw += chunk
  const maxBodyBytes = 5 * 1024 * 1024
  if (!raw || raw.length > maxBodyBytes) {
    return res.status(400).json({
      error: 'Daten zu groß oder leer',
      hint: `Max. ca. ${Math.round(maxBodyBytes / 1024)} KB JSON.`,
    })
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return res.status(400).json({ error: 'Ungültiges JSON' })
  }

  const contentBase64 = typeof parsed?.contentBase64 === 'string' ? parsed.contentBase64.trim() : ''
  if (!contentBase64 || contentBase64.length < 100) {
    return res.status(400).json({ error: 'contentBase64 fehlt oder zu kurz' })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token || typeof token !== 'string') {
    return res.status(503).json({
      error: 'Server: GITHUB_TOKEN fehlt',
      hint: 'Vercel → Projekt → Settings → Environment Variables → GITHUB_TOKEN (Repo-Schreibzugriff).',
    })
  }

  try {
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } }
    )
    let sha = null
    if (getRes.ok) {
      const data = await getRes.json()
      sha = data.sha || null
    } else if (getRes.status !== 404) {
      const t = await getRes.text()
      console.error('upload-entdecken-hero GitHub GET:', getRes.status, t)
      return res.status(502).json({ error: 'GitHub lesen fehlgeschlagen', hint: String(t).slice(0, 200) })
    }

    const putBody = {
      message: `Entdecken: Eingangstor-Bild aktualisiert (${new Date().toISOString().slice(0, 10)})`,
      content: contentBase64,
      branch: 'main',
    }
    if (sha) putBody.sha = sha

    const putRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(putBody),
      }
    )

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}))
      const msg = errJson.message || `GitHub PUT ${putRes.status}`
      console.error('upload-entdecken-hero GitHub PUT:', putRes.status, msg)
      return res.status(502).json({
        error: 'GitHub Speichern fehlgeschlagen',
        hint: typeof msg === 'string' ? msg.slice(0, 300) : String(msg),
      })
    }

    return res.status(200).json({
      success: true,
      path: '/img/oeffentlich/entdecken-hero.jpg',
      message: 'Bild im Repo – nach Vercel-Deploy (~1–2 Min) überall sichtbar',
    })
  } catch (e) {
    console.error('upload-entdecken-hero:', e)
    return res.status(500).json({
      error: 'Unerwarteter Fehler',
      hint: (e && e.message) || String(e),
    })
  }
}
