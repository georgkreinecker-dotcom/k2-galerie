/**
 * Vercel Serverless Function: gallery-data.json per GitHub API aktualisieren.
 * Ermöglicht Veröffentlichen von iPad/iPhone auf Vercel (ohne lokalen Dev-Server).
 *
 * Benötigt in Vercel: Environment Variable GITHUB_TOKEN
 * (GitHub → Settings → Developer settings → Personal access tokens, scope: repo)
 */
const REPO_OWNER = 'georgkreinecker-dotcom'
const REPO_NAME = 'k2-galerie'
const FILE_PATH = 'public/gallery-data.json'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Nur POST erlaubt' })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.error('GITHUB_TOKEN nicht gesetzt')
    return res.status(500).json({
      error: 'GITHUB_TOKEN fehlt',
      hint: 'In Vercel: Settings → Environment Variables → GITHUB_TOKEN hinzufügen'
    })
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

  const contentBase64 = Buffer.from(body, 'utf8').toString('base64')

  try {
    // 1. Aktuellen SHA holen (für Update)
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    )

    let sha = null
    if (getRes.ok) {
      const data = await getRes.json()
      sha = data.sha
    } else if (getRes.status !== 404) {
      const err = await getRes.text()
      console.error('GitHub GET Fehler:', getRes.status, err)
      return res.status(502).json({
        error: 'GitHub GET fehlgeschlagen',
        detail: err.substring(0, 200)
      })
    }

    // 2. Datei erstellen/aktualisieren
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
      const errText = await putRes.text()
      console.error('GitHub PUT Fehler:', putRes.status, errText)
      return res.status(502).json({
        error: 'GitHub Update fehlgeschlagen',
        detail: errText.substring(0, 300)
      })
    }

    const result = await putRes.json()
    let artworksCount = 0
    try {
      const parsed = JSON.parse(body)
      artworksCount = Array.isArray(parsed.artworks) ? parsed.artworks.length : 0
    } catch {}

    return res.status(200).json({
      success: true,
      message: 'gallery-data.json aktualisiert',
      size: body.length,
      artworksCount,
      git: { success: true, output: 'GitHub API Update erfolgreich' }
    })
  } catch (err) {
    console.error('write-gallery-data Fehler:', err)
    return res.status(500).json({
      error: err.message || 'Unbekannter Fehler'
    })
  }
}
