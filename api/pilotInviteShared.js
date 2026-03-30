/**
 * Testpilot-Einladung: HMAC-Token (serverseitig nur mit PILOT_INVITE_SECRET).
 * Keine Geheimnisse im Browser.
 */
import crypto from 'crypto'

const EXP_SEC = 60 * 60 * 24 * 30 // 30 Tage

/**
 * Kompakter Token, damit der Link kürzer bleibt.
 * @param {object} payload – { name, context: 'oeffentlich'|'vk2' }
 * @param {string} secret
 */
export function signPilotInviteToken(payload, secret) {
  if (!secret || typeof secret !== 'string') throw new Error('PILOT_INVITE_SECRET fehlt')
  const data = {
    v: 2,
    n: String(payload.name || '').trim(),
    c: payload.context === 'vk2' ? 'vk2' : 'oeffentlich',
    x: Math.floor(Date.now() / 1000) + EXP_SEC,
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
  const exp = Number(data.x ?? data.exp ?? 0)
  if (exp && Math.floor(Date.now() / 1000) > exp) return null
  // Backward-compatible Normalisierung (v1 und v2 Tokens)
  return {
    name: String(data.n ?? data.name ?? '').trim(),
    email: String(data.e ?? data.email ?? '').trim().toLowerCase(),
    context: data.c === 'vk2' || data.context === 'vk2' ? 'vk2' : 'oeffentlich',
    licenceType: String(data.l ?? data.licenceType ?? 'proplus'),
    exp,
  }
}

/**
 * Origin für Pilot-API: Bei same-origin POST senden manche Umgebungen keinen Origin-Header.
 * Dann Referer-Origin, sonst aus Host + Schema (Vercel/Dev).
 * @param {import('http').IncomingMessage} req
 */
export function getPilotInviteRequestOrigin(req) {
  const raw = req.headers?.origin
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  const ref = req.headers?.referer
  if (typeof ref === 'string' && ref.trim()) {
    try {
      return new URL(ref).origin
    } catch {
      /* ignore */
    }
  }
  const hostRaw = (req.headers?.['x-forwarded-host'] || req.headers?.host || '').split(',')[0].trim()
  if (!hostRaw) return ''
  let hostnameForLocalCheck = hostRaw
  try {
    hostnameForLocalCheck = new URL(`http://${hostRaw}`).hostname
  } catch {
    hostnameForLocalCheck = hostRaw.split(':')[0]
  }
  const isLocal =
    hostnameForLocalCheck === 'localhost' ||
    hostnameForLocalCheck === '127.0.0.1' ||
    hostnameForLocalCheck === '::1'
  const proto = (req.headers?.['x-forwarded-proto'] || '').split(',')[0].trim()
  const scheme = isLocal ? 'http' : proto === 'http' ? 'http' : 'https'
  return `${scheme}://${hostRaw}`
}

/**
 * @param {string} origin – effektiver Origin (s. getPilotInviteRequestOrigin)
 * @param {string} [extraOrigins] – PILOT_INVITE_ALLOWED_ORIGINS kommagetrennt
 * @param {import('http').IncomingMessage} [req] – optional: gleicher Host wie Origin (eigene Domain)
 */
export function isPilotInviteAllowedOrigin(origin, extraOrigins, req) {
  if (!origin || typeof origin !== 'string') return false
  try {
    const u = new URL(origin)
    const h = u.hostname.toLowerCase()
    if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1') return true
    if (h === 'k2-galerie.vercel.app') return true
    if (h.endsWith('.vercel.app') && h.includes('k2-galerie')) return true
    const appUrl = String(typeof process !== 'undefined' && process.env?.VITE_APP_URL || '').trim()
    if (appUrl.startsWith('http')) {
      try {
        if (new URL(appUrl).origin === origin) return true
      } catch {
        /* ignore */
      }
    }
    const extras = String(extraOrigins || '')
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean)
    if (extras.some((e) => origin.startsWith(e))) return true
    if (req && req.headers) {
      const hostHeader = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim()
      if (hostHeader) {
        try {
          const reqH = new URL(`http://${hostHeader}`).hostname.toLowerCase()
          const oriH = u.hostname.toLowerCase()
          if (oriH === reqH) return true
        } catch {
          /* ignore */
        }
      }
    }
    return false
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
  return `${base}/p/${encodeURIComponent(token)}`
}

/** Standard-Öffentlichkeits-URL für Einladungslinks (Handy, Safari, externe Empfänger). */
const PILOT_INVITE_DEFAULT_PUBLIC_BASE = 'https://k2-galerie.vercel.app'

/**
 * Basis-URL für Testpilot-Einladungslinks in E-Mail und API-Antwort.
 * – PILOT_INVITE_PUBLIC_BASE_URL setzen zum Überschreiben (z. B. nur lokal testen: http://localhost:5177)
 * – Ohne gesetzte Variable: Aufruf vom lokalen Dev-Server → feste Production-URL, damit Empfänger nicht localhost im Link haben
 * – Sonst: wie bisher aus Host / VITE_APP_URL / VERCEL_URL
 * @param {import('http').IncomingMessage} req
 */
export function getPilotInviteLinkBaseUrl(req) {
  const forced = (typeof process !== 'undefined' && process.env?.PILOT_INVITE_PUBLIC_BASE_URL
    ? String(process.env.PILOT_INVITE_PUBLIC_BASE_URL)
    : ''
  ).trim()
  if (forced.startsWith('http')) return forced.replace(/\/$/, '')

  const hostHeader = (req.headers?.['x-forwarded-host'] || req.headers?.host || '').split(',')[0].trim()
  let hostname = ''
  if (hostHeader) {
    try {
      hostname = new URL(`http://${hostHeader}`).hostname.toLowerCase()
    } catch {
      hostname = hostHeader.split(':')[0].toLowerCase()
    }
  }
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '::1'
  if (isLocal) return PILOT_INVITE_DEFAULT_PUBLIC_BASE.replace(/\/$/, '')

  const envUrl = (typeof process !== 'undefined' && process.env?.VITE_APP_URL ? String(process.env.VITE_APP_URL) : '').trim()
  if (envUrl.startsWith('http')) return envUrl.replace(/\/$/, '')
  if (typeof process !== 'undefined' && process.env?.VERCEL_URL) {
    return `https://${String(process.env.VERCEL_URL).replace(/\/$/, '')}`
  }
  const proto = (req.headers?.['x-forwarded-proto'] || 'https').split(',')[0].trim()
  return `${proto}://${hostHeader || 'k2-galerie.vercel.app'}`.replace(/\/$/, '')
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
  const text = [
    `Hallo ${name},`,
    '',
    `du bist als Testpilot:in für die K2 Galerie eingeladen (${contextLabel}).`,
    '',
    'So startest du:',
    '1) Auf den Link unten tippen oder die URL kopieren.',
    '2) Auf der Seite „Weiter zur Demo“ wählen.',
    '3) Bei Bedarf „Admin“ öffnen.',
    '',
    inviteUrl,
    '',
    'Link ist personalisiert und einige Wochen gültig.',
  ].join('\n')
  const html = `
    <p>Hallo ${escapeHtml(name)},</p>
    <p>du bist als <strong>Testpilot:in</strong> für die K2 Galerie eingeladen (${escapeHtml(contextLabel)}).</p>
    <p><strong>So startest du:</strong></p>
    <ol>
      <li>Auf den Button klicken.</li>
      <li>Auf der Seite „Weiter zur Demo“ wählen.</li>
      <li>In der Demo bei Bedarf oben „Admin“ öffnen.</li>
    </ol>
    <p><a href="${inviteUrl}" style="display:inline-block;padding:10px 14px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px">Jetzt Testpilot starten</a></p>
    <p style="color:#666;font-size:12px">Link ist personalisiert und einige Wochen gültig.</p>
    <p style="color:#666;font-size:12px;word-break:break-all">Direktlink (falls Button nicht geht): <a href="${inviteUrl}" style="color:#0d9488">${escapeHtml(inviteUrl)}</a></p>
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
      text,
    }),
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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
