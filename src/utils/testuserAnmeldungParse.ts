/**
 * Anmeldetext aus Testuser-Formular / E-Mail an info@kgm.at parsen (gleiches Format wie buildPayload).
 */

export type ParsedTestuserAnmeldung = {
  name: string
  appName: string
  email: string
  phone: string
  oek2: boolean
  vk2: boolean
  familie: boolean
  anmerkung: string
}

function lineValue(text: string, label: RegExp): string {
  const m = text.match(label)
  return m?.[1]?.trim() ?? ''
}

function lineJaNein(text: string, label: RegExp): boolean {
  const v = lineValue(text, label).toLowerCase()
  return v === 'ja' || v === 'yes' || v === 'j'
}

/** E-Mail-Text oder Zwischenablage → Felder der Bewerbung */
export function parseTestuserAnmeldungText(raw: string): ParsedTestuserAnmeldung | null {
  const text = raw.replace(/\r\n/g, '\n').trim()
  if (!text) return null

  const name = lineValue(text, /^Name:\s*(.+)$/im)
  const appName = lineValue(text, /^Wunsch-Name für die App \(Test\):\s*(.+)$/im)
  const email = lineValue(text, /^E-Mail:\s*(.+)$/im)
  const phone = lineValue(text, /^Telefon:\s*(.+)$/im)

  if (!name || !appName || !email.includes('@')) return null

  const oek2 =
    lineJaNein(text, /ök2\s*\(Demo\):\s*(.+)$/im) ||
    lineJaNein(text, /oek2\s*\(Demo\):\s*(.+)$/im)
  const vk2 = lineJaNein(text, /VK2\s*\(Verein\):\s*(.+)$/im)
  const familie = lineJaNein(text, /K2 Familie:\s*(.+)$/im)

  let anmerkung = ''
  const anmM = text.match(/Anmerkung:\s*\n([\s\S]*)$/i)
  if (anmM?.[1]) anmerkung = anmM[1].trim()

  return { name, appName, email, phone: phone === '–' ? '' : phone, oek2, vk2, familie, anmerkung }
}

export function selectedPilotLinien(p: ParsedTestuserAnmeldung): Array<'oek2' | 'vk2' | 'familie'> {
  const out: Array<'oek2' | 'vk2' | 'familie'> = []
  if (p.oek2) out.push('oek2')
  if (p.vk2) out.push('vk2')
  if (p.familie) out.push('familie')
  return out
}
