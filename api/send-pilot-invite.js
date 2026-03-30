/**
 * Vercel Serverless: Testpilot-Einladung per E-Mail (Resend) oder Antwort mit Link + mailto-Fallback.
 * POST Body: { toEmail: string, name: string, context?: 'oeffentlich'|'vk2' }
 *
 * Env: PILOT_INVITE_SECRET (Pflicht), optional RESEND_API_KEY, RESEND_FROM,
 *      PILOT_INVITE_ALLOWED_ORIGINS (kommagetrennte URL-Präfixe)
 */
import {
  signPilotInviteToken,
  getPilotInviteRequestOrigin,
  isPilotInviteAllowedOrigin,
  isValidPilotInviteEmail,
  buildPilotEinladungUrl,
  getPilotInviteLinkBaseUrl,
  sendPilotInviteViaResend,
} from './pilotInviteShared.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' })

  const origin = getPilotInviteRequestOrigin(req)
  if (!isPilotInviteAllowedOrigin(origin, process.env.PILOT_INVITE_ALLOWED_ORIGINS, req)) {
    return res.status(403).json({ error: 'Ungültiger Aufruf (Origin).' })
  }

  const secret =
    typeof process.env.PILOT_INVITE_SECRET === 'string' ? process.env.PILOT_INVITE_SECRET.trim() : ''
  if (!secret) {
    console.error('send-pilot-invite: PILOT_INVITE_SECRET fehlt')
    return res.status(500).json({ error: 'Einladungssystem nicht konfiguriert (PILOT_INVITE_SECRET).' })
  }

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Ungültiger JSON-Body' })
  }

  const toEmail = String(body.toEmail || body.email || '').trim().toLowerCase()
  const name = String(body.name || '').trim()
  const context = body.context === 'vk2' ? 'vk2' : 'oeffentlich'

  if (!name || !isValidPilotInviteEmail(toEmail)) {
    return res.status(400).json({ error: 'Gültiger Name und eine E-Mail-Adresse sind Pflicht.' })
  }

  let token
  try {
    token = signPilotInviteToken({ name, context }, secret)
  } catch (e) {
    console.error('send-pilot-invite sign', e)
    return res.status(500).json({ error: 'Token konnte nicht erstellt werden.' })
  }

  const base = getPilotInviteLinkBaseUrl(req)
  const inviteUrl = buildPilotEinladungUrl(base, token)

  const contextLabel = context === 'vk2' ? 'VK2 Vereins-Demo' : 'öffentliche Demo (ök2)'

  const resendKey = (process.env.RESEND_API_KEY || '').trim()
  const mailSubject = encodeURIComponent('Deine Testpilot-Einladung – K2 Galerie')
  const mailBody = encodeURIComponent(
    `Hallo ${name},\n\nhier ist deine Testpilot-Einladung für die K2 Galerie (${contextLabel}).\n\nSo startest du:\n1) Link öffnen\n2) „Weiter zur Demo“ wählen\n3) Bei Bedarf „Admin“ öffnen\n\nDirektlink:\n${inviteUrl}\n\nViel Erfolg!`,
  )
  const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${mailSubject}&body=${mailBody}`

  if (resendKey) {
    const sendRes = await sendPilotInviteViaResend({
      toEmail,
      name,
      inviteUrl,
      resendKey,
      resendFrom: process.env.RESEND_FROM,
      contextLabel,
    })
    if (sendRes.ok) {
      return res.status(200).json({
        ok: true,
        sent: true,
        inviteUrl,
        message: 'E-Mail wurde gesendet (Resend). Posteingang prüfen; ggf. Spam.',
      })
    }
    console.warn('send-pilot-invite: Resend fehlgeschlagen', sendRes.error)
    return res.status(200).json({
      ok: true,
      sent: false,
      inviteUrl,
      mailtoUrl,
      resendError: typeof sendRes.error === 'string' ? sendRes.error.slice(0, 400) : undefined,
      message:
        'Resend hat die E-Mail nicht angenommen – Link unten nutzen oder mailto. In Vercel: RESEND_API_KEY / RESEND_FROM prüfen (Domain bei Resend verifiziert?).',
    })
  }

  return res.status(200).json({
    ok: true,
    sent: false,
    inviteUrl,
    mailtoUrl,
    message:
      'Kein RESEND_API_KEY auf dem Server – es wird keine E-Mail verschickt. Persönlichen Link unten kopieren oder „mailto“ öffnen. Für automatischen Versand: Vercel → RESEND_API_KEY (und RESEND_FROM) setzen.',
  })
}
