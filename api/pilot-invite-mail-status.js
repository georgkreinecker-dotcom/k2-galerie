/**
 * GET: Ob auf diesem Server automatischer Versand per Resend möglich ist (ohne Geheimnisse).
 * Liefert nur { resendConfigured: boolean } – für Lizenzen-UI vor dem Absenden.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Nur GET erlaubt' })

  const resendConfigured = !!(process.env.RESEND_API_KEY || '').trim()
  res.setHeader('Cache-Control', 'no-store, must-revalidate')
  return res.status(200).json({ resendConfigured })
}
