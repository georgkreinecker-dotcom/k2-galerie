/**
 * Testpilot-Einladung: HMAC-Token (serverseitig nur mit PILOT_INVITE_SECRET).
 * Keine Geheimnisse im Browser.
 */
import crypto from 'crypto'

const EXP_SEC = 60 * 60 * 24 * 30 // 30 Tage

/**
 * Vor-/Nachname + E-Mail; rückwärtskompatibel mit nur { name } (ein Feld → Vorname, Rest → Nachname).
 * @param {object} payload
 * @returns {{ vn: string, nn: string, n: string, email: string }}
 */
function normalizePilotInvitePayload(payload) {
  let vn = String(payload.firstName ?? payload.vorname ?? '').trim()
  let nn = String(payload.lastName ?? payload.nachname ?? '').trim()
  const email = String(payload.email ?? '').trim().toLowerCase()
  if (!vn && !nn) {
    const legacy = String(payload.name || '').trim()
    if (legacy) {
      const sp = legacy.indexOf(' ')
      if (sp > 0) {
        vn = legacy.slice(0, sp).trim()
        nn = legacy.slice(sp + 1).trim()
      } else {
        vn = legacy
      }
    }
  }
  const n = [vn, nn].filter(Boolean).join(' ').trim()
  return { vn, nn, n, email }
}

/**
 * Kompakter Token, damit der Link kürzer bleibt.
 * @param {object} payload – { firstName, lastName, email, name? (legacy), context: 'oeffentlich'|'vk2' }
 * @param {string} secret
 */
export function signPilotInviteToken(payload, secret) {
  if (!secret || typeof secret !== 'string') throw new Error('PILOT_INVITE_SECRET fehlt')
  const { vn, nn, n, email } = normalizePilotInvitePayload(payload)
  if (!n) throw new Error('Name fehlt')
  const data = {
    v: 3,
    vn,
    nn,
    n,
    e: email,
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
  const vn = String(data.vn ?? '').trim()
  const nn = String(data.nn ?? '').trim()
  const nameFromParts = [vn, nn].filter(Boolean).join(' ').trim()
  const name = nameFromParts || String(data.n ?? data.name ?? '').trim()
  // Backward-compatible Normalisierung (v1/v2 nur n; v3 vn/nn/e)
  return {
    name,
    firstName: vn,
    lastName: nn,
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

/**
 * Gleicher Token wie buildPilotEinladungUrl, aber Query `?t=` statt Pfad.
 * E-Mail-Clients umbrechen lange Zeilen oft mit Leerzeichen – im Pfad entsteht so ein kaputter Token.
 * Query-Form + spitze Klammern im Plaintext sind robuster.
 */
export function buildPilotEinladungUrlQuery(baseUrl, token) {
  const base = baseUrl.replace(/\/$/, '')
  return `${base}/p?t=${encodeURIComponent(token)}`
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
 * Einheitlicher Fließtext für Resend (text) und mailto-Fallback – eine Quelle.
 * @param {object} p
 * @param {string} p.name – Anrede (Vor- und Nachname oder ein Feld)
 * @param {string} [p.greetingName] – nur Vorname für „Hallo …“ (sonst name)
 * @param {string} p.inviteUrl
 * @param {string} p.contextLabel z. B. „öffentliche Demo (ök2)“
 * @param {'oeffentlich'|'vk2'} [p.inviteContext]
 */
export function buildPilotInviteEmailPlainText({ name, greetingName, inviteUrl, contextLabel, inviteContext = 'oeffentlich' }) {
  const vk2 = inviteContext === 'vk2'
  const demoButton = vk2 ? 'Weiter zur VK2-Vorschau (Verein)' : 'Weiter zur öffentlichen Demo (ök2)'
  const nachDemo = vk2
    ? 'Du siehst die Vereins-Vorschau und kannst dort stöbern.'
    : 'Du landest direkt in den Einstellungen (Stammdaten) – Name und E-Mail kannst du dort prüfen. Von dort aus öffnest du die öffentliche Demo.'
  const hallo = String(greetingName || name || '').trim() || 'Testpilot:in'
  return [
    `Hallo ${hallo},`,
    '',
    `du bist als Testpilot:in für die K2 Galerie eingeladen (${contextLabel}).`,
    '',
    'Wichtig: Du brauchst kein Passwort und hast auf der Demo noch kein eigenes Benutzerkonto wie später bei einer Lizenz. Der Link ist mit Vorname, Nachname und E-Mail abgestimmt; auf der Einladungsseite und in den Stammdaten siehst du dieselben Daten. Was du siehst, sind Muster-Daten – zum Ausprobieren.',
    '',
    'So gehst du vor:',
    `1) Den Link unten öffnen (oder die Adresse aus den spitzen Klammern kopieren).`,
    `2) Auf der Einladungsseite den Button „${demoButton}“ wählen.`,
    `3) ${nachDemo}`,
    '4) Wenn du magst: oben „Admin“ öffnen – Werke, Stammdaten, Design, Kasse nur zum Ausprobieren (ebenfalls Muster).',
    '',
    'Direktlink (eine Zeile, ggf. aus spitzen Klammern kopieren):',
    `<${inviteUrl}>`,
    '',
    'Der Link ist personalisiert und einige Wochen gültig.',
  ].join('\n')
}

/**
 * Resend REST (optional)
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function sendPilotInviteViaResend({
  toEmail,
  name,
  greetingName,
  inviteUrl,
  resendKey,
  resendFrom,
  contextLabel,
  inviteContext = 'oeffentlich',
}) {
  if (!resendKey) return { ok: false, error: 'Kein RESEND_API_KEY' }
  const from = resendFrom || 'K2 Galerie <onboarding@resend.dev>'
  const subject = 'Deine Testpilot-Einladung – K2 Galerie'
  const vk2 = inviteContext === 'vk2'
  const demoButton = vk2 ? 'Weiter zur VK2-Vorschau (Verein)' : 'Weiter zur öffentlichen Demo (ök2)'
  const nachDemo = vk2
    ? 'Du siehst die Vereins-Vorschau und kannst dort stöbern.'
    : 'Du landest direkt in den Einstellungen (Stammdaten). Von dort aus öffnest du die öffentliche Demo.'
  const hallo = String(greetingName || name || '').trim() || 'Testpilot:in'
  const text = buildPilotInviteEmailPlainText({ name, greetingName, inviteUrl, contextLabel, inviteContext })
  const html = `
    <p>Hallo ${escapeHtml(hallo)},</p>
    <p>du bist als <strong>Testpilot:in</strong> für die K2 Galerie eingeladen (${escapeHtml(contextLabel)}).</p>
    <p><strong>Wichtig:</strong> Du brauchst kein Passwort und hast auf der Demo noch kein eigenes Benutzerkonto wie später bei einer Lizenz. Einladung ist mit Vorname, Nachname und E-Mail abgestimmt. Was du siehst, sind <strong>Muster-Daten</strong> – zum Ausprobieren.</p>
    <p><strong>So gehst du vor:</strong></p>
    <ol>
      <li>Den Button unten anklicken (oder die Adresse unter dem Button kopieren).</li>
      <li>Auf der Einladungsseite den Button <strong>„${escapeHtml(demoButton)}“</strong> wählen.</li>
      <li>${escapeHtml(nachDemo)}</li>
      <li>Optional: in der Demo oben <strong>„Admin“</strong> – Werke, Design, Kasse nur zum Ausprobieren (Muster).</li>
    </ol>
    <p><a href="${inviteUrl}" style="display:inline-block;padding:10px 14px;background:#0d9488;color:#fff;text-decoration:none;border-radius:8px">Jetzt Testpilot starten</a></p>
    <p style="color:#666;font-size:12px">Der Link ist personalisiert und einige Wochen gültig.</p>
    <p style="color:#666;font-size:12px">Direktlink (falls der Button nicht geht): <a href="${inviteUrl}" style="color:#0d9488">diesen Link</a> – gleiche Adresse wie der Button (nicht den sichtbaren Text aus einer umbrochenen Zeile kopieren).</p>
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
