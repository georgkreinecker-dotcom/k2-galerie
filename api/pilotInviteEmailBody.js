/**
 * Testpilot-Einladung: Fließtext für E-Mail / mailto – eigene Datei (ein Export),
 * damit Bundler/Vite keinen Named-Export-Konflikt mit pilotInviteShared.js erzeugen.
 */

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
