/**
 * GET /api/validate-pilot-token?t=... – prüft Token (ohne Geheimnis preiszugeben).
 * Rückwärtskompatibel auch mit ?token=
 */
import { verifyPilotInviteTokenWithReason } from './pilotInviteShared.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Nur GET erlaubt' })

  const secret =
    typeof process.env.PILOT_INVITE_SECRET === 'string' ? process.env.PILOT_INVITE_SECRET.trim() : ''
  if (!secret) {
    return res.status(500).json({ valid: false, error: 'Server nicht konfiguriert.' })
  }

  const token =
    (typeof req.query?.t === 'string'
      ? req.query.t
      : '') ||
    (typeof req.query?.token === 'string'
      ? req.query.token
      : '') ||
    new URL(req.url || '', 'http://localhost').searchParams.get('t') ||
    new URL(req.url || '', 'http://localhost').searchParams.get('token') ||
    ''

  if (!token) {
    return res.status(400).json({ valid: false, error: 'token fehlt' })
  }

  const vr = verifyPilotInviteTokenWithReason(token, secret)
  if (!vr.ok) {
    const reason = vr.reason
    const error =
      reason === 'expired'
        ? 'Dieser Einladungslink ist abgelaufen (über 30 Tage).'
        : reason === 'malformed'
          ? 'Der Link ist unvollständig oder beschädigt.'
          : 'Ungültiger Link – Prüfung fehlgeschlagen.'
    const code = reason === 'expired' ? 'EXPIRED' : reason === 'malformed' ? 'MALFORMED' : 'INVALID'
    const hint =
      reason === 'bad_signature'
        ? 'Häufig: Die Einladung wurde auf localhost erzeugt, der Link zeigt aber auf k2-galerie.vercel.app. Dann muss PILOT_INVITE_SECRET in Vercel (Production) exakt dieselbe Zeichenkette sein wie in der Projekt-.env auf dem Mac. Zuverlässig: Lizenzen direkt auf https://k2-galerie.vercel.app öffnen und die Einladung dort erzeugen.'
        : reason === 'expired'
          ? 'Bitte unter APf → Lizenzen einen neuen Testpilot-Link erzeugen.'
          : reason === 'malformed'
            ? 'Bitte den Link aus der E-Mail vollständig nutzen oder einen neuen Link erzeugen.'
            : undefined
    return res.status(200).json({
      valid: false,
      error,
      code,
      ...(hint ? { hint } : {}),
    })
  }
  const data = vr.data

  return res.status(200).json({
    valid: true,
    name: data.name,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    context: data.context,
    licenceType: data.licenceType,
  })
}
