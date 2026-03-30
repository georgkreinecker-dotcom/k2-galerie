/**
 * GET /api/validate-pilot-token?t=... – prüft Token (ohne Geheimnis preiszugeben).
 * Rückwärtskompatibel auch mit ?token=
 */
import {
  normalizePilotInviteToken,
  trimPilotInviteSecret,
  verifyPilotInviteTokenWithReason,
} from './pilotInviteShared.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Nur GET erlaubt' })

  const primary = trimPilotInviteSecret(
    typeof process.env.PILOT_INVITE_SECRET === 'string' ? process.env.PILOT_INVITE_SECRET : '',
  )
  /** Optional: zweites Geheimnis z. B. nach Secret-Wechsel oder alte Vercel-Production-Variable. */
  const secondary = trimPilotInviteSecret(
    typeof process.env.PILOT_INVITE_SECRET_ALT === 'string' ? process.env.PILOT_INVITE_SECRET_ALT : '',
  )
  if (!primary && !secondary) {
    return res.status(500).json({ valid: false, error: 'Server nicht konfiguriert.' })
  }

  const qT = req.query?.t
  const qTok = req.query?.token
  const fromT = typeof qT === 'string' ? qT : Array.isArray(qT) ? qT[0] : ''
  const fromTok = typeof qTok === 'string' ? qTok : Array.isArray(qTok) ? qTok[0] : ''
  const rawToken =
    fromT ||
    fromTok ||
    new URL(req.url || '', 'http://localhost').searchParams.get('t') ||
    new URL(req.url || '', 'http://localhost').searchParams.get('token') ||
    ''

  const token = normalizePilotInviteToken(rawToken)

  if (!token) {
    return res.status(400).json({ valid: false, error: 'token fehlt' })
  }

  let vr = primary ? verifyPilotInviteTokenWithReason(token, primary) : { ok: false, reason: 'bad_signature' }
  if (!vr.ok && vr.reason === 'bad_signature' && secondary) {
    vr = verifyPilotInviteTokenWithReason(token, secondary)
  }
  if (!vr.ok) {
    const reason = vr.reason
    const error =
      reason === 'expired'
        ? 'Dieser Einladungslink ist abgelaufen (über 30 Tage).'
        : reason === 'malformed'
          ? 'Der Link ist unvollständig oder beschädigt.'
          : 'Ungültiger Link – Prüfung fehlgeschlagen.'
    const code =
      reason === 'expired'
        ? 'EXPIRED'
        : reason === 'malformed'
          ? 'MALFORMED'
          : reason === 'bad_signature'
            ? 'BAD_SIGNATURE'
            : 'INVALID'
    const hint =
      reason === 'bad_signature'
        ? 'Häufig: (1) Einladung auf localhost erzeugt, Link öffnet auf k2-galerie.vercel.app → PILOT_INVITE_SECRET in Vercel unter Environment Variables für **Production** (nicht nur Preview) muss **bytegenau** dieselbe Zeichenkette sein wie in der Projekt-.env – ohne Anführungszeichen, ohne Zeilenumbruch; nach Änderung **Redeploy**. (2) Oder: Einladung direkt auf https://k2-galerie.vercel.app unter Lizenzen erzeugen. (3) Nach Secret-Wechsel: optional PILOT_INVITE_SECRET_ALT in Vercel setzen (altes Geheimnis), bis alle neuen Links versendet sind.'
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
