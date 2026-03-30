/**
 * GET /api/validate-pilot-token?token=... – prüft Token (ohne Geheimnis preiszugeben).
 */
import { verifyPilotInviteToken } from './pilotInviteShared.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Nur GET erlaubt' })

  const secret = process.env.PILOT_INVITE_SECRET
  if (!secret) {
    return res.status(500).json({ valid: false, error: 'Server nicht konfiguriert.' })
  }

  const token =
    typeof req.query?.token === 'string'
      ? req.query.token
      : new URL(req.url || '', 'http://localhost').searchParams.get('token') || ''

  if (!token) {
    return res.status(400).json({ valid: false, error: 'token fehlt' })
  }

  const data = verifyPilotInviteToken(token, secret)
  if (!data) {
    return res.status(200).json({ valid: false, error: 'Ungültiger oder abgelaufener Link.' })
  }

  return res.status(200).json({
    valid: true,
    name: data.name,
    email: data.email,
    context: data.context,
    licenceType: data.licenceType,
  })
}
