/**
 * Testpilot-Einladung: Fließtext für E-Mail / mailto – eigene Datei (ein Export),
 * damit Bundler/Vite keinen Named-Export-Konflikt mit pilotInviteShared.js erzeugt.
 * Symbolwesen: wenig Text, klare Zeichen; Kurzlink inviteUrl möglichst einzeilig.
 */

/**
 * @param {object} p
 * @param {string} p.name
 * @param {string} [p.greetingName]
 * @param {string} p.inviteUrl – Kurzlink /p/i/… oder Fallback ?t=
 * @param {string} p.contextLabel
 * @param {'oeffentlich'|'vk2'} [p.inviteContext]
 */
export function buildPilotInviteEmailPlainText({ name, greetingName, inviteUrl, contextLabel, inviteContext = 'oeffentlich' }) {
  const vk2 = inviteContext === 'vk2'
  const demoKurz = vk2 ? 'VK2-Demo' : 'ök2-Demo'
  const hallo = String(greetingName || name || '').trim() || 'Testpilot:in'
  return [
    `Hallo ${hallo},`,
    '',
    `▶ Siehst du einen grünen Button in dieser E-Mail? → Den tippen.`,
    '',
    `▶ Kein Button (nur Text wie hier)? → Die Zeile unten komplett kopieren, im Browser einfügen, Enter.`,
    '',
    inviteUrl,
    '',
    `Testpilot · ${contextLabel} · kein Passwort · Muster · danach „${demoKurz}“ auf der Seite.`,
    '',
  ].join('\n')
}
