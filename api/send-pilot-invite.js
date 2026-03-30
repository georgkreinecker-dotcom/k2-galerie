/**
 * Vercel Serverless: Testpilot-Einladung per E-Mail (Resend) oder Antwort mit Link + mailto-Fallback.
 * POST Body: { toEmail: string, name: string, context?: 'oeffentlich'|'vk2' }
 *
 * Env: PILOT_INVITE_SECRET (Pflicht), optional RESEND_API_KEY, RESEND_FROM,
 *      PILOT_INVITE_ALLOWED_ORIGINS (kommagetrennte URL-Präfixe)
 */
import {
  signPilotInviteToken,
  isPilotInviteAllowedOrigin,
  isValidPilotInviteEmail,
  buildPilotEinladungUrl,
  sendPilotInviteViaResend,
} from './pilotInviteShared.js'

function baseUrlFromReq(req) {
  const envUrl = (process.env.VITE_APP_URL || process.env.VERCEL_URL || '').trim()
  if (envUrl.startsWith('http')) return envUrl.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '')
  const host = req.headers.host || 'k2-galerie.vercel.app'
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim()
  return `${proto}://${host}`.replace(/\/$/, '')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Nur POST erlaubt' })

  const origin = req.headers.origin || ''
  if (!isPilotInviteAllowedOrigin(origin, process.env.PILOT_INVITE_ALLOWED_ORIGINS)) {
    return res.status(403).json({ error: 'Ungültiger Aufruf (Origin).' })
  }

  const secret = process.env.PILOT_INVITE_SECRET
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
    token = signPilotInviteToken(
      { email: toEmail, name, context, licenceType: 'proplus' },
      secret,
    )
  } catch (e) {
    console.error('send-pilot-invite sign', e)
    return res.status(500).json({ error: 'Token konnte nicht erstellt werden.' })
  }

  const base = baseUrlFromReq(req)
  const inviteUrl = buildPilotEinladungUrl(base, token)

  const contextLabel = context === 'vk2' ? 'VK2 Vereins-Demo' : 'öffentliche Demo (ök2)'

  const resendKey = (process.env.RESEND_API_KEY || '').trim()
  const mailSubject = encodeURIComponent('Deine Testpilot-Einladung – K2 Galerie')
  const mailBody = encodeURIComponent(
    `Hallo ${name},\n\nhier ist dein persönlicher Link zur Testpilot-Galerie (${contextLabel}):\n\n${inviteUrl}\n\nViel Erfolg!`,
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
        message: 'E-Mail wurde gesendet.',
      })
    }
    console.warn('send-pilot-invite: Resend fehlgeschlagen', sendRes.error)
  }

  return res.status(200).json({
    ok: true,
    sent: false,
    inviteUrl,
    mailtoUrl,
    message:
      resendKey
        ? 'E-Mail-Versand fehlgeschlagen – Link und mailto unten nutzen.'
        : 'Kein RESEND_API_KEY – Link kopieren oder E-Mail-Programm öffnen (mailto).',
  })
}
