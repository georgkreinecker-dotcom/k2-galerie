import { buildPilotInviteEmailHtml } from '../../api/pilotInviteEmailHtml.js'
import { buildPilotInviteEmailPlainText } from '../../api/pilotInviteEmailBody.js'

/**
 * .eml herunterladen: Apple Mail / viele Clients öffnen multipart/alternative mit HTML wie die Resend-Mail.
 * mailto: kann kein HTML – deshalb dieser Weg ohne Resend.
 */
export function downloadPilotInviteEml(opts: {
  toEmail: string
  firstName: string
  lastName: string
  inviteUrl: string
  inviteContext: 'oeffentlich' | 'vk2'
}): void {
  const fullName = `${opts.firstName} ${opts.lastName}`.trim()
  const contextLabel = opts.inviteContext === 'vk2' ? 'VK2 Vereins-Demo' : 'öffentliche Demo (ök2)'
  const html = buildPilotInviteEmailHtml({
    name: fullName,
    greetingName: opts.firstName,
    inviteUrl: opts.inviteUrl,
    contextLabel,
    inviteContext: opts.inviteContext,
  })
  const text =
    buildPilotInviteEmailPlainText({
      name: fullName,
      greetingName: opts.firstName,
      inviteUrl: opts.inviteUrl,
      contextLabel,
      inviteContext: opts.inviteContext,
    }) + '\n\nViel Erfolg!'

  const boundary =
    '----=_K2Pilot_' +
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '')
      : Math.random().toString(36).slice(2))
  const subject = 'Deine Testpilot-Einladung – K2 Galerie'
  const crlf = '\r\n'
  const norm = (s: string) => s.replace(/\r\n/g, '\n').split('\n').join(crlf)

  const eml = [
    `From: "K2 Galerie" <einladung@local.invalid>`,
    `To: ${opts.toEmail}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    norm(text),
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    norm(html),
    ``,
    `--${boundary}--`,
    ``,
  ].join(crlf)

  const blob = new Blob([eml], { type: 'message/rfc822' })
  const a = document.createElement('a')
  const safeFn = (opts.firstName || 'empfaenger').replace(/[^\wäöüÄÖÜß-]/g, '_').slice(0, 40)
  a.href = URL.createObjectURL(blob)
  a.download = `Testpilot-Einladung-${safeFn}.eml`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}
