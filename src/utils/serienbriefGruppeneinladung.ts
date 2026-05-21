/** Serienbrief Gruppeneinladung – CSV (Excel) + Brief-HTML für Word/Druck */

export const SERIENBRIEF_CSV_URL =
  '/texte-schreibtisch/serienbrief-pensionistenvereine-eferding-grieskirchen.csv'

export const LS_SERIENBRIEF_ROWS = 'k2-serienbrief-gruppeneinladung-rows'

export type SerienbriefEmpfaenger = {
  id: string
  organisation: string
  typ: string
  bezirk: string
  anrede: string
  name: string
  funktion: string
  strasse: string
  plz: string
  ort: string
  email: string
  telefon: string
  hinweis: string
  /** Brief mit ausgeben */
  aktiv: boolean
}

const CSV_HEADERS = [
  'Organisation',
  'Typ',
  'Bezirk',
  'Anrede',
  'Vorname_Nachname',
  'Funktion',
  'Strasse',
  'PLZ',
  'Ort',
  'Email',
  'Telefon',
  'Hinweis',
] as const

/** Semikolon-CSV (Excel DE) – einfacher Parser */
export function parseSemicolonCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((l) => l.trim())
  if (lines.length < 2) return []

  const parseLine = (line: string): string[] => {
    const out: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"'
          i++
        } else inQuotes = !inQuotes
      } else if (ch === ';' && !inQuotes) {
        out.push(cur.trim())
        cur = ''
      } else cur += ch
    }
    out.push(cur.trim())
    return out
  }

  const headers = parseLine(lines[0]).map((h) => h.trim())
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i])
    if (cells.every((c) => !c)) continue
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? ''
    })
    rows.push(row)
  }
  return rows
}

export function parseKontaktZeilen(funktion: string, vornameNachname: string): { funktion: string; name: string } {
  let funktionLine = funktion.trim()
  let nameLine = vornameNachname.trim()
  const combined = /^(Obfrau|Obmann|Obfrau-Stv\.?|Obmann-Stv\.?)\s+(.+)$/i.exec(funktionLine)
  if (!nameLine && combined) {
    funktionLine = combined[1]
    nameLine = combined[2]
  } else if (nameLine && !funktionLine && /^(Obfrau|Obmann)\b/i.test(nameLine)) {
    const m = /^(Obfrau|Obmann)\s+(.+)$/i.exec(nameLine)
    if (m) {
      funktionLine = m[1]
      nameLine = m[2]
    }
  }
  return { funktion: funktionLine, name: nameLine }
}

/** Anrede vorschlagen wenn Spalte leer */
export function suggestAnrede(anrede: string, funktion: string, name: string): string {
  const a = anrede.trim()
  if (a) return a
  const f = funktion.toLowerCase()
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const nachname = parts.length ? parts[parts.length - 1] : ''
  if (!nachname) return 'Sehr geehrte Damen und Herren,'
  if (f.includes('obfrau') || f.includes('vorsitzende') || f.includes('obfrau')) {
    return `Sehr geehrte Frau ${nachname},`
  }
  if (f.includes('obmann') || f.includes('vorsitzender') || f.includes('bezirksob')) {
    return `Sehr geehrter Herr ${nachname},`
  }
  return `Sehr geehrte/r ${name},`
}

export function adresseZeile(e: SerienbriefEmpfaenger): string {
  const plzOrt = [e.plz.trim(), e.ort.trim()].filter(Boolean).join(' ')
  if (e.strasse.trim() && plzOrt) return `${e.strasse.trim()}, ${plzOrt}`
  if (e.strasse.trim()) return e.strasse.trim()
  return plzOrt
}

export function rowIdFromOrganisation(org: string, index: number): string {
  const slug = org
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return slug || `empfaenger-${index}`
}

export function csvRowToEmpfaenger(row: Record<string, string>, index: number): SerienbriefEmpfaenger {
  const org = row.Organisation ?? row.organisation ?? ''
  const { funktion, name } = parseKontaktZeilen(row.Funktion ?? '', row.Vorname_Nachname ?? '')
  const anredeRaw = row.Anrede ?? ''
  const emp: SerienbriefEmpfaenger = {
    id: rowIdFromOrganisation(org, index),
    organisation: org,
    typ: row.Typ ?? '',
    bezirk: row.Bezirk ?? '',
    anrede: suggestAnrede(anredeRaw, funktion, name),
    name,
    funktion,
    strasse: row.Strasse ?? '',
    plz: row.PLZ ?? '',
    ort: row.Ort ?? '',
    email: row.Email ?? '',
    telefon: row.Telefon ?? '',
    hinweis: row.Hinweis ?? '',
    aktiv: Boolean((row.Strasse ?? '').trim() || ((row.PLZ ?? '').trim() && (row.Ort ?? '').trim())),
  }
  return emp
}

export function empfaengerToCsvRow(e: SerienbriefEmpfaenger): Record<string, string> {
  return {
    Organisation: e.organisation,
    Typ: e.typ,
    Bezirk: e.bezirk,
    Anrede: e.anrede,
    Vorname_Nachname: e.name,
    Funktion: e.funktion,
    Strasse: e.strasse,
    PLZ: e.plz,
    Ort: e.ort,
    Email: e.email,
    Telefon: e.telefon,
    Hinweis: e.hinweis,
  }
}

export function empfaengerListToCsv(rows: SerienbriefEmpfaenger[]): string {
  const header = CSV_HEADERS.join(';')
  const lines = rows.map((e) => {
    const r = empfaengerToCsvRow(e)
    return CSV_HEADERS.map((h) => {
      const v = r[h] ?? ''
      return v.includes(';') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
    }).join(';')
  })
  return [header, ...lines].join('\n')
}

/** QR kompakt – Brief füllt eine gestaltete A4-Seite */
const BRIEF_QR_PX = 52

/** Hinweis für Georg im Druckdialog (Browser-Kopf/Fuß lassen sich nicht per CSS abschalten) */
export const BRIEF_DRUCK_HINWEIS =
  'Im Druckdialog: „Kopf- und Fußzeile“ ausschalten (Safari/Chrome: Einstellungen unten). Adresse sitzt für Fenstercouvert (DIN 5008). Brief falten: unten ⅓ hoch, oben ⅓ runter.'

const BRIEF_STYLES = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  width: 210mm;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
body {
  font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
  font-size: 11pt;
  line-height: 1.55;
  color: #1a1816;
  background: #fffefb;
}
.brief-a4 {
  width: 210mm;
  min-height: 297mm;
  margin: 0;
  padding: 0;
  background: #fffefb;
  position: relative;
}
/* DIN 5008 Form B – Adressfeld für Fenstercouvert (20 mm links, 45 mm oben, 85×45 mm) */
.brief-adressfeld {
  position: absolute;
  top: 45mm;
  left: 20mm;
  width: 85mm;
  min-height: 45mm;
  max-height: 45mm;
  overflow: hidden;
  font-size: 10.5pt;
  line-height: 1.35;
  margin: 0;
  padding: 0;
}
.brief-adressfeld strong { font-size: 10.5pt; color: #2c2419; font-weight: 700; }
.brief-absender-zurueck {
  position: absolute;
  top: 17mm;
  right: 20mm;
  width: 75mm;
  text-align: right;
  font-size: 8pt;
  line-height: 1.35;
  color: #5c5650;
}
.brief-absender-zurueck strong {
  display: block;
  font-size: 8.5pt;
  color: #1a1816;
  margin-bottom: 0.15rem;
}
.brief-leiste {
  height: 3px;
  width: 100%;
  background: linear-gradient(90deg, #b54a1e 0%, #c9a227 55%, #e8e0d4 100%);
  border-radius: 2px;
  margin: 0 0 0.5rem;
  flex-shrink: 0;
}
.brief-hauptteil {
  margin-top: 90mm;
  padding: 0 18mm 16mm 22mm;
  font-size: 10.5pt;
  line-height: 1.45;
}
h1 {
  font-size: 12.5pt;
  font-weight: 700;
  color: #2c2419;
  letter-spacing: 0.02em;
  line-height: 1.3;
  margin: 0 0 0.5rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #d4c4b0;
}
.brief-text p {
  margin: 0 0 0.65rem;
  text-align: left;
  hyphens: auto;
}
.fakten {
  margin-top: 0.35rem;
  padding: 0.45rem 0.65rem;
  background: linear-gradient(135deg, #fffefb 0%, #f6f0e6 100%);
  border: 1px solid #d4c4b0;
  border-radius: 5px;
  font-size: 10pt;
  line-height: 1.38;
}
.fakten-adresse {
  margin: 0 0 0.55rem;
  font-weight: 600;
  color: #2c2419;
}
.galerie-vorschau {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.galerie-vorschau-text { flex: 1; min-width: 0; }
.galerie-vorschau-label {
  margin: 0 0 0.2rem;
  font-size: 9.5pt;
  color: #5c5650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.galerie-vorschau-link { margin: 0; font-size: 10pt; }
.galerie-vorschau-link a { color: #0d6b62; text-decoration: none; border-bottom: 1px solid #9fd4cf; }
.galerie-vorschau img.qr-klein {
  width: ${BRIEF_QR_PX}px;
  height: ${BRIEF_QR_PX}px;
  flex-shrink: 0;
  border: 1px solid #d4c4b0;
  border-radius: 4px;
  padding: 3px;
  background: #fff;
}
.abschluss {
  margin: 0.5rem 0 0;
  font-size: 10pt;
}
.brief-gruss {
  margin-top: 0.75rem;
  padding-top: 0.55rem;
  border-top: 1px solid #e8e0d4;
}
.unterschrift {
  margin: 0;
  line-height: 1.4;
  font-size: 10pt;
}
.unterschrift strong { font-size: 10.5pt; }
.brief-a4.brief-seite { page-break-after: always; page-break-inside: avoid; break-inside: avoid; }
.brief-a4.brief-seite:last-child { page-break-after: auto; }
a { color: #0d6b62; }
@media print {
  html, body { width: 210mm; height: auto; background: #fffefb; }
  .brief-a4 {
    min-height: 297mm;
    height: auto;
    max-height: 297mm;
    padding: 0;
    overflow: hidden;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .brief-adressfeld {
    top: 45mm;
    left: 20mm;
  }
  .brief-absender-zurueck {
    top: 17mm;
    right: 20mm;
  }
}
`

const GALERIE_QR = `https://api.qrserver.com/v1/create-qr-code/?size=${BRIEF_QR_PX}x${BRIEF_QR_PX}&margin=2&data=https%3A%2F%2Fk2-galerie.vercel.app%2Fgalerie`

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Einzelbrief als vollständiges HTML (Word am Mac öffnet das direkt) */
export function buildBriefHtml(e: SerienbriefEmpfaenger, options?: { pageBreakAfter?: boolean }): string {
  const verein = escapeHtml(e.organisation)
  const anrede = escapeHtml(e.anrede)
  const adr = escapeHtml(adresseZeile(e))
  const funktion = escapeHtml(e.funktion)
  const name = escapeHtml(e.name)
  const empfaengerExtra = [funktion, name].filter(Boolean).map((line) => `${line}<br />`).join('')

  const body = `
<article class="brief-a4 brief-seite">
  <div class="brief-absender-zurueck" aria-hidden="true">
    <strong>K2 Galerie Kunst &amp; Keramik</strong>
    Martina &amp; Georg Kreinecker · Schlossergasse 4 · 4070 Eferding
  </div>
  <div class="brief-adressfeld">
    ${empfaengerExtra}
    <strong>${verein}</strong><br />
    ${adr || '—'}
  </div>
  <main class="brief-hauptteil">
    <div class="brief-leiste" aria-hidden="true"></div>
    <h1>Kunst erleben – für den ${verein}</h1>
    <div class="brief-text">
      <p>${anrede}</p>
      <p>
        Wer für den <strong>${verein}</strong> Verantwortung trägt, möchte den Mitgliedern
        gern etwas <strong>Besonderes</strong> schenken – nicht immer dasselbe Programm, sondern ein Erlebnis, das hängen bleibt.
        Dafür schreibe ich Ihnen: Martina malt, ich arbeite mit Keramik. In der Schlossergasse haben wir unsere
        <strong>K2 Galerie Kunst &amp; Keramik</strong> – eine <strong>kleine, feine, persönliche Galerie</strong> in Eferding,
        die wir uns lange gewünscht haben und die wir gern mit Gruppen teilen.
      </p>
      <p>
        Sie können Ihrem Verein einen Besuch mit Kunst schenken – <strong>wann es passt, finden wir gemeinsam</strong>
        (Vormittag, Nachmittag, was Ihrer Gruppe gut tut): Wir zeigen unsere Werke, Ihre Leute schauen in Ruhe,
        wir sprechen über die Kunst – was bewegt, wie etwas entstanden ist. Am Eröffnungswochenende war viel Leben drin;
        jetzt ist es oft stiller, und genau dann entstehen die schönsten Gespräche vor einem Bild.
        Kein großer Betrieb, kein Lärm – nur Begegnung mit Malerei und Keramik, in Ihrem Tempo.
      </p>
      <p>
        Manch einer bleibt danach – oder kommt vorher – zum <strong>Mittag- oder Abendessen im Ristorante Antonio</strong>,
        gleich nebenan, ein Schritt von der Tür. Wenn das für Sie und Ihre Leute passt, sprechen wir das gern mit.
      </p>
    </div>
    <div class="fakten">
      <p class="fakten-adresse">Schlossergasse 4, 4070 Eferding · Termin nach Absprache</p>
      <div class="galerie-vorschau">
        <div class="galerie-vorschau-text">
          <p class="galerie-vorschau-label">Galerie vorab ansehen</p>
          <p class="galerie-vorschau-link"><a href="https://k2-galerie.vercel.app/galerie">k2-galerie.vercel.app/galerie</a></p>
        </div>
        <img class="qr-klein" src="${GALERIE_QR}" width="${BRIEF_QR_PX}" height="${BRIEF_QR_PX}" alt="QR-Code Galerie" />
      </div>
    </div>
    <p class="abschluss">
      Ich würde mich freuen, vom <strong>${verein}</strong> zu hören –
      <a href="mailto:georg.kreinecker@kgm.at">georg.kreinecker@kgm.at</a> · <strong>0664 1046337</strong>.
    </p>
    <footer class="brief-gruss">
      <p class="unterschrift">
        Herzliche Grüße<br />
        <strong>Martina &amp; Georg Kreinecker</strong><br />
        K2 Galerie Kunst &amp; Keramik · Schlossergasse 4 · 4070 Eferding
      </p>
    </footer>
  </main>
</article>`

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<title>Brief – ${verein}</title>
<style>${BRIEF_STYLES}</style>
</head>
<body>${body}</body>
</html>`
}

export function buildAlleBriefeHtml(empfaenger: SerienbriefEmpfaenger[]): string {
  const aktiv = empfaenger.filter((e) => e.aktiv)
  const pages = aktiv
    .map((e, i) => {
      const inner = buildBriefHtml(e, { pageBreakAfter: i < aktiv.length - 1 })
      const m = inner.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      return m ? m[1] : ''
    })
    .join('\n')
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<title>Serienbrief Gruppeneinladung (${aktiv.length} Briefe)</title>
<style>${BRIEF_STYLES}</style>
</head>
<body>${pages}</body>
</html>`
}

export function downloadTextFile(content: string, filename: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob(['\ufeff', content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

let serienbriefPrintFrame: HTMLIFrameElement | null = null

/**
 * Druckdialog ohne Pop-up (versteckter iframe – funktioniert auch bei blockierten Pop-ups).
 */
export function printHtmlDocument(
  html: string,
  title = 'Serienbrief',
): { ok: boolean; message: string } {
  if (typeof document === 'undefined') {
    return { ok: false, message: 'Druck nur im Browser möglich.' }
  }

  if (!serienbriefPrintFrame) {
    serienbriefPrintFrame = document.createElement('iframe')
    serienbriefPrintFrame.setAttribute('title', 'Druckvorschau Serienbrief')
    serienbriefPrintFrame.setAttribute('aria-hidden', 'true')
    serienbriefPrintFrame.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none'
    document.body.appendChild(serienbriefPrintFrame)
  }

  const win = serienbriefPrintFrame.contentWindow
  const doc = win?.document
  if (!win || !doc) {
    downloadTextFile(html, `Druck-${safeFilenamePart(title)}.html`, 'text/html;charset=utf-8')
    return {
      ok: false,
      message: 'Druck nicht möglich – HTML wurde heruntergeladen (in Word öffnen und drucken).',
    }
  }

  doc.open()
  doc.write(html)
  doc.close()
  doc.title = title

  const runPrint = () => {
    setTimeout(() => {
      try {
        win.focus()
        win.print()
      } catch {
        downloadTextFile(html, `Druck-${safeFilenamePart(title)}.html`, 'text/html;charset=utf-8')
      }
    }, 600)
  }

  if (doc.readyState === 'complete') runPrint()
  else serienbriefPrintFrame!.onload = () => runPrint()

  return { ok: true, message: `Druckdialog öffnet sich. ${BRIEF_DRUCK_HINWEIS}` }
}

/** @deprecated Nutze printHtmlDocument – kein Pop-up mehr nötig */
export function openHtmlInPrintWindow(html: string, title = 'Serienbrief') {
  printHtmlDocument(html, title)
}

export function safeFilenamePart(s: string): string {
  return s
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 60)
}
