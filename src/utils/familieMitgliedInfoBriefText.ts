/**
 * K2 Familie – Mustertext „Mitglieder informieren“ für die Inhaber:in (Einstellungen, Mail/WhatsApp).
 * Eine Quelle für den Kurztext; Geschwister-Briefe nutzen dieselbe inhaltliche Linie ausführlicher in K2FamilieEinladungGeschwisterBriefePage.
 */

import { APP_BASE_URL_SHAREABLE } from '../config/externalUrls'
import { PROJECT_ROUTES } from '../config/navigation'

const R = PROJECT_ROUTES['k2-familie']

export type MitgliederInformationsParams = {
  tenantId: string
  familienZ: string
  familyDisplayName: string
  signaturName: string
}

/** Kanonischer Familien-Einstieg (t + z + optional fn) — wie K2FamilieEinladungGeschwisterBriefePage. */
export function buildFamilieEinladungsUrlKurz(
  tenantId: string,
  familienZ: string,
  familyDisplayName?: string,
): string {
  const z = familienZ.trim()
  if (!z) return ''
  const base = new URL(`${APP_BASE_URL_SHAREABLE}${R.meineFamilie}`)
  base.searchParams.set('t', tenantId)
  base.searchParams.set('z', z)
  const fn = (familyDisplayName ?? '').trim()
  if (fn) base.searchParams.set('fn', fn)
  return base.toString()
}

/**
 * Mustertext (Platzhalter werden ersetzt). Für Anzeige in Einstellungen und Kopieren in die Zwischenablage.
 */
export const MUSTERTEXT_MITGLIEDER_INFORM_KERN = `Liebe Familie,

ich möchte euch zur K2 Familie einladen – unser geschützter, privater Raum für Stammbaum, Geschichten, Termine und Erinnerungen.

**Name der Familie in der App:** {{FAMILIENNAME}}

**Familien-Kennung** (gemeinsame Zugangsnummer, steckt auch in den persönlichen Links mit drin):
{{FAMILIEN_Z}}

**Einstieg für alle** (Link zum Weitergeben – öffnen oder in den Browser einfügen):
{{FAMILIEN_LINK}}

**Ohne Smartphone:** denselben Link in die Adresszeile am PC einfügen — gleicher Einstieg wie beim QR-Scannen.

Persönliche Zugänge mit Namen, Code und langem Link zum Scannen findet ihr unter „Mitglieder & Codes“ in den Einstellungen der K2 Familie:
{{MITGLIEDER_CODES_LINK}}

Wenn etwas unklar ist, meldet euch bei mir.

Herzliche Grüße
{{SIGNATUR}}`

function fallbackName(display: string): string {
  const t = display.trim()
  return t || 'eure Familie'
}

/**
 * Freundlicher Gruß nur mit Vornamen (Briefe, Mail-Mustertext) – nicht der volle Listenname.
 * „Nachname, Vorname“ → erster Vorname nach dem Komma; „Du“ bleibt.
 */
export function vornameAusAnzeigeName(raw: string | undefined | null): string {
  const s = (raw ?? '').trim()
  if (!s) return ''
  if (s === 'Du') return 'Du'
  const comma = s.indexOf(',')
  if (comma > 0) {
    const after = s.slice(comma + 1).trim()
    const first = after.split(/\s+/)[0]
    if (first) return first
  }
  return s.split(/\s+/)[0] ?? ''
}

/** Entfernt **markdown**-artige Sternchen für reine Text/WhatsApp-Ausgabe. */
function stripEinfacheMarkdownStars(s: string): string {
  return s.replace(/\*\*([^*]+)\*\*/g, '$1')
}

/** Baut den fertigen Kurztext für Mail, Messenger und Kopie – mit Zeilenumbrüchen. */
export function buildMitgliederInformationsText(p: MitgliederInformationsParams): string {
  const familienName = fallbackName(p.familyDisplayName)
  const z = p.familienZ.trim()
  const familienZDisplay = z || '(noch eintragen unter Einstellungen: Familien-Kennung)'
  const link = z ? buildFamilieEinladungsUrlKurz(p.tenantId, z, p.familyDisplayName) : '(Familien-Kennung zuerst eintragen – dann erscheint der Link)'
  const mitgliederCodesLink = `${APP_BASE_URL_SHAREABLE}${R.mitgliederCodes}`
  const signatur = p.signaturName.trim() || '(Name „Ich bin …“ unter Einstellungen)'

  let t = MUSTERTEXT_MITGLIEDER_INFORM_KERN
  t = t.replace(/\{\{FAMILIENNAME\}\}/g, familienName)
  t = t.replace(/\{\{FAMILIEN_Z\}\}/g, familienZDisplay)
  t = t.replace(/\{\{FAMILIEN_LINK\}\}/g, link)
  t = t.replace(/\{\{MITGLIEDER_CODES_LINK\}\}/g, mitgliederCodesLink)
  t = t.replace(/\{\{SIGNATUR\}\}/g, signatur)
  return stripEinfacheMarkdownStars(t)
}
