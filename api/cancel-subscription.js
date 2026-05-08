/**
 * Vercel Serverless: Kündigungswunsch erfassen (Lizenz beenden) + Mandanten-Daten löschen.
 * POST Body: { tenantId?: string, grund?: string, verbesserung?: string }
 * - tenantId: welcher Mandant (z. B. 'oeffentlich' für ök2). Wenn gesetzt und erlaubt → Blob wird gelöscht.
 * - grund, verbesserung: optionales Feedback.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' })

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Ungültiger JSON-Body' })
  }

  const { grund, verbesserung } = body
  if (grund || verbesserung) {
    console.log('[cancel-subscription] Feedback:', { grund: grund || '(nicht angegeben)', verbesserung: verbesserung || '(nicht angegeben)' })
  }

  return res.status(200).json({
    ok: true,
    message: 'Kündigung erfasst',
    info: 'Datenlöschung erfolgt ausschließlich über den geschützten Endpoint /api/delete-tenant-data.',
  })
}
