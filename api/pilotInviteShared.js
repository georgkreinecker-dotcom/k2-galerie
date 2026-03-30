/**
 * Testpilot-Einladung: HMAC-Token (serverseitig nur mit PILOT_INVITE_SECRET).
 * Keine Geheimnisse im Browser.
 */
import crypto from 'crypto'

const EXP_SEC = 60 * 60 * 24 * 30 // 30 Tage

/**
 * @param {object} payload – { email, name, context: 'oeffentlich'|'vk2', licenceType?: string }
 * @param {string} secret
 */
export function signPilotInviteToken(payload, secret) {
  if (!secret || typeof secret !== 'string') throw new Error('PILOT_INVITE_SECRET fehlt')
  const data = {
    v: 1,
    email: String(payload.email || '').trim().toLowerCase(),
    name: String(payload.name || '').trim(),
    context: payload.context === 'vk2' ? 'vk2' : 'oeffentlich',
    licenceType: payload.licenceType || 'proplus',
    exp: Math.floor(Date.now() / 1000) + EXP_SEC,
  }
  const payloadStr = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url')
  return `${payloadStr}.${sig}`
}

/**
 * @param {string} token
 * @param {string} secret
 * @returns {object|null}
 */
export function verifyPilotInviteToken(token, secret) {
  if (!token || !secret) return null
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null
  const payloadStr = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = crypto.createHmac('sha256', secret).update(payloadStr).digest('base64url')
  try {
    const a = Buffer.from(sig, 'utf8')
    const b = Buffer.from(expected, 'utf8')
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  let data
  try {
    data = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (data.exp && Math.floor(Date.now() / 1000) > data.exp) return null
  return data
}

/**
 * @param {string} origin – Request-Header Origin
 * @param {string} [extraOrigins] – PILOT_INVITE_ALLOWED_ORIGINS kommagetrennt
 */
export function isPilotInviteAllowedOrigin(origin, extraOrigins) {
  if (!origin || typeof origin !== 'string') return false
  try {
    const u = new URL(origin)
    const h = u.hostname.toLowerCase()
    if (h === 'localhost' || h === '127.0.0.1') return true
    if (h === 'k2-galerie.vercel.app') return true
    if (h.endsWith('.vercel.app') && h.includes('k2-galerie')) return true
    const extras = String(extraOrigins || '')
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean)
    return extras.some((e) => origin.startsWith(e))
  } catch {
    return false
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidPilotInviteEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim())
}

/**
 * @param {object} p
 * @param {string} p.baseUrl – z. B. https://k2-galerie.vercel.app
 * @param {string} p.token
 */
export function buildPilotEinladungUrl(baseUrl, token) {
  const base = baseUrl.replace(/\/$/, '')
  return `${base}/projects/k2-galerie/pilot-einladung?token=${encodeURIComponent(token)}`
}

/**
 * Resend REST (optional)
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function sendPilotInviteViaResend({
  toEmail,
  name,
  inviteUrl,
  resendKey,
  resendFrom,
  contextLabel,
}) {
  if (!resendKey) return { ok: false, error: 'Kein RESEND_API_KEY' }
  const from = resendFrom || 'K2 Galerie <onboarding@resend.dev>'
  const subject = 'Deine Testpilot-Einladung – K2 Galerie'
  const html = `
    <p>Hallo ${escapeHtml(name)},</p>
    <p>du bist als <strong>Testpilot:in</strong> für die K2 Galerie eingeladen (${escapeHtml(contextLabel)}).</p>
    <p><a href="${inviteUrl}">Hier klicken – weiter zur Galerie</a></p>
    <p style="color:#666;font-size:12px">Link ist personalisiert und einige Wochen gültig.</p>
  `
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [toEmail],
      subject,
      html,
    }),
  })
  if (!r.ok) {
    const t = await r.text()
    return { ok: false, error: t.slice(0, 200) }
  }
  return { ok: true }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
