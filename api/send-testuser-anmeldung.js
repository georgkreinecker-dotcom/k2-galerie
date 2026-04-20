/**
 * Vercel Serverless: Testuser-Anmeldung per E-Mail an kgm (Resend).
 * POST Body: { name, appName, email, phone?, oek2, vk2, familie, anmerkung? }
 *
 * Env: RESEND_API_KEY + RESEND_FROM (wie send-pilot-invite).
 * Optional: TESTUSER_ANMELDUNG_TO_EMAIL (Standard: info@kgm.at)
 * Origin-Schutz: PILOT_INVITE_ALLOWED_ORIGINS + gleiche Logik wie send-pilot-invite
 */
import { getPilotInviteRequestOrigin, isPilotInviteAllowedOrigin, isValidPilotInviteEmail } from './pilotInviteShared.js'

const DEFAULT_TO = 'info@kgm.at'

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function clip(s, max) {
  const t = String(s ?? '')
  return t.length > max ? `${t.slice(0, max)}…` : t
}

function buildPlainText(p) {
  const lines = [
    'Testuser-Anmeldung (kgm solution)',
    '',
    `Name: ${p.name}`,
    `Wunsch-Name für die App (Test): ${p.appName}`,
    `E-Mail: ${p.email}`,
    `Telefon: ${p.phone || '–'}`,
    'Interesse an Produktlinie:',
    `  ök2 (Demo): ${p.oek2 ? 'ja' : 'nein'}`,
    `  VK2 (Verein): ${p.vk2 ? 'ja' : 'nein'}`,
    `  K2 Familie: ${p.familie ? 'ja' : 'nein'}`,
    '',
    p.anmerkung.trim() ? `Anmerkung:\n${p.anmerkung.trim()}` : '',
  ]
  return lines.filter(Boolean).join('\n')
}

function buildHtml(p) {
  const t = escapeHtml
  const am = p.anmerkung.trim()
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#1c1a18;max-width:40rem">
<p><strong>Testuser-Anmeldung</strong> (kgm solution)</p>
<table style="border-collapse:collapse;font-size:15px">
<tr><td style="padding:6px 14px 6px 0;vertical-align:top"><strong>Name</strong></td><td>${t(p.name)}</td></tr>
<tr><td style="padding:6px 14px 6px 0;vertical-align:top"><strong>App-Name (Test)</strong></td><td>${t(p.appName)}</td></tr>
<tr><td style="padding:6px 14px 6px 0;vertical-align:top"><strong>E-Mail</strong></td><td>${t(p.email)}</td></tr>
<tr><td style="padding:6px 14px 6px 0;vertical-align:top"><strong>Telefon</strong></td><td>${t(p.phone || '–')}</td></tr>
<tr><td style="padding:6px 14px 6px 0;vertical-align:top"><strong>ök2</strong></td><td>${p.oek2 ? 'ja' : 'nein'}</td></tr>
<tr><td style="padding:6px 14px 6px 0;vertical-align:top"><strong>VK2</strong></td><td>${p.vk2 ? 'ja' : 'nein'}</td></tr>
<tr><td style="padding:6px 14px 6px 0;vertical-align:top"><strong>K2 Familie</strong></td><td>${p.familie ? 'ja' : 'nein'}</td></tr>
</table>
${am ? `<p style="margin-top:1rem"><strong>Anmerkung</strong></p><p style="white-space:pre-wrap">${t(am)}</p>` : ''}
</body></html>`
}

async function sendViaResend({ to, replyTo, subject, text, html, resendKey, resendFrom }) {
  const from = resendFrom || 'K2 Galerie <onboarding@resend.dev>'
  const body = {
    from,
    to: [to],
    subject,
    html,
    text,
  }
  if (replyTo && isValidPilotInviteEmail(replyTo)) {
    body.reply_to = replyTo
  }
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    const raw = await r.text()
    let msg = raw
    try {
      const j = JSON.parse(raw)
      if (typeof j.message === 'string') msg = j.message
      else if (Array.isArray(j.errors) && j.errors.length) msg = JSON.stringify(j.errors[0])
    } catch {
      /* Roh-Text */
    }
    return { ok: false, error: `[${r.status}] ${msg}`.slice(0, 500) }
  }
  return { ok: true }
}

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

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  } catch {
    return res.status(400).json({ error: 'Ungültiger JSON-Body' })
  }

  const name = clip(body.name, 200).trim()
  const appName = clip(body.appName, 200).trim()
  const email = String(body.email || '')
    .trim()
    .toLowerCase()
  const phone = clip(body.phone, 80).trim()
  const anmerkung = clip(body.anmerkung, 8000)
  const oek2 = Boolean(body.oek2)
  const vk2 = Boolean(body.vk2)
  const familie = Boolean(body.familie)
  const ein = body.einverstanden === true || body.einverstanden === 'true'
  if (!ein) {
    return res.status(400).json({ error: 'Einwilligung zur Datenverarbeitung ist erforderlich.' })
  }

  if (!name || !appName || !isValidPilotInviteEmail(email)) {
    return res.status(400).json({ error: 'Name, App-Name und gültige E-Mail sind Pflicht.' })
  }
  if (!oek2 && !vk2 && !familie) {
    return res.status(400).json({ error: 'Mindestens eine Produktlinie auswählen.' })
  }

  const payload = { name, appName, email, phone, oek2, vk2, familie, anmerkung }
  const text = buildPlainText(payload)
  const html = buildHtml(payload)
  const subject = `Testuser-Anmeldung: ${appName} (${email})`
  const to = String(process.env.TESTUSER_ANMELDUNG_TO_EMAIL || DEFAULT_TO)
    .trim()
    .toLowerCase()

  if (!isValidPilotInviteEmail(to)) {
    console.error('send-testuser-anmeldung: TESTUSER_ANMELDUNG_TO_EMAIL ungültig')
    return res.status(500).json({ error: 'Empfänger-Adresse nicht konfiguriert.' })
  }

  const resendKey = (process.env.RESEND_API_KEY || '').trim()
  if (!resendKey) {
    return res.status(200).json({
      ok: true,
      sent: false,
      message:
        'Kein RESEND_API_KEY – keine Server-E-Mail. Bitte mailto oder .txt nutzen (Vercel: RESEND_API_KEY und RESEND_FROM setzen).',
    })
  }

  const sendRes = await sendViaResend({
    to,
    replyTo: email,
    subject,
    text,
    html,
    resendKey,
    resendFrom: process.env.RESEND_FROM,
  })

  if (sendRes.ok) {
    return res.status(200).json({
      ok: true,
      sent: true,
      message: 'Anmeldung wurde per E-Mail an kgm solution übermittelt.',
    })
  }
  console.warn('send-testuser-anmeldung: Resend fehlgeschlagen', sendRes.error)
  return res.status(200).json({
    ok: true,
    sent: false,
    resendError: typeof sendRes.error === 'string' ? sendRes.error.slice(0, 400) : undefined,
    message:
      'E-Mail-Versand fehlgeschlagen. Bitte mailto oder .txt nutzen; in Vercel RESEND_API_KEY / RESEND_FROM / Domain prüfen.',
  })
}
