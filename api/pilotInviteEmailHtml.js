/**
 * HTML-Body der Testpilot-Einladung – eine Quelle für Resend, .eml und Vorschau-Parität.
 * @param {object} p
 * @param {string} p.name
 * @param {string} [p.greetingName]
 * @param {string} p.inviteUrl
 * @param {string} p.contextLabel
 * @param {'oeffentlich'|'vk2'} [p.inviteContext]
 */
export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildPilotInviteEmailHtml({ name, greetingName, inviteUrl, contextLabel, inviteContext = 'oeffentlich' }) {
  const vk2 = inviteContext === 'vk2'
  const demoButton = vk2 ? 'Weiter zur VK2-Vorschau (Verein)' : 'Weiter zur öffentlichen Demo (ök2)'
  const nachDemo = vk2
    ? 'Du siehst die Vereins-Vorschau und kannst dort stöbern.'
    : 'Du landest direkt in den Einstellungen (Stammdaten). Von dort aus öffnest du die öffentliche Demo.'
  const hallo = String(greetingName || name || '').trim() || 'Testpilot:in'
  const hrefEsc = escapeHtml(String(inviteUrl))
  const ctaLabel = 'Jetzt Testpilot starten'
  const ctaTable = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:14px 0 18px;">
      <tr>
        <td align="center" bgcolor="#0d9488" style="border-radius:10px;mso-padding-alt:14px 28px;">
          <a href="${hrefEsc}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;color:#ffffff !important;text-decoration:none;border-radius:10px;background-color:#0d9488;line-height:1.25;text-align:center;"><span style="font-size:20px;line-height:0;vertical-align:-2px;margin-right:6px">➤</span>${escapeHtml(ctaLabel)}</a>
        </td>
      </tr>
    </table>`
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a;max-width:560px;">
    <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111">Hallo ${escapeHtml(hallo)}</p>
    <p style="margin:0 0 16px;font-size:14px;color:#444">Testpilot:in · ${escapeHtml(contextLabel)}</p>
    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1a1a">Ein Klick – los geht’s:</p>
    ${ctaTable}
    <p style="margin:0 0 20px;font-size:13px;color:#555">Auf der nächsten Seite: <strong>„${escapeHtml(demoButton)}“</strong> antippen. ${escapeHtml(nachDemo)}</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top:1px solid #e8e6e3;margin:0 0 16px"><tr><td style="height:1px;font-size:0;line-height:0">&nbsp;</td></tr></table>
    <p style="margin:0 0 12px;font-size:12px;color:#666;line-height:1.5"><strong>Ohne Lesen:</strong> Grün = dein Einstieg. Kein Passwort. Nur Muster-Daten zum Ausprobieren.</p>
    <p style="margin:0 0 14px;font-size:12px;color:#888;line-height:1.45">Nur Text-Ansicht in der Mail-App? Die lange Zeile in der Textversion komplett kopieren. Button geht nicht? <a href="${hrefEsc}" style="color:#0d9488;font-weight:600">Hier derselbe Link</a>.</p>
    ${ctaTable}
    <p style="margin:8px 0 0;font-size:11px;color:#999">Personalisiert · Pro++ Testpilot · Link ohne Ablauf</p>
    </div>
  `.trim()
}
