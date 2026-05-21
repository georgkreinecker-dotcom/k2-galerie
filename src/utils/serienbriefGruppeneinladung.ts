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

const BRIEF_STYLES = `
@page { size: A4; margin: 16mm 18mm 22mm 16mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  margin: 0;
  padding: 1.75rem 1.25rem 2rem;
  font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
  font-size: 11pt;
  line-height: 1.55;
  color: #1a1816;
  background: #fff;
}
.briefkopf {
  text-align: right;
  font-size: 9.5pt;
  color: #5c5650;
  margin-bottom: 1.5rem;
  line-height: 1.45;
}
.briefkopf strong { color: #1a1816; font-size: 10.5pt; }
.empfaenger { margin-bottom: 1.35rem; font-size: 10.5pt; line-height: 1.5; }
h1 { font-size: 1.1rem; color: #2c2419; margin: 0 0 1.15rem; font-weight: 700; }
p { margin: 0 0 0.85rem; }
.fakten {
  background: #fffefb;
  border: 1px solid #c4b8a8;
  border-left: 4px solid #b54a1e;
  padding: 0.75rem 1rem;
  margin: 1rem 0 1.15rem;
  font-size: 10.5pt;
}
.galerie-vorschau { display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; flex-wrap: wrap; }
.galerie-vorschau img { border: 1px solid #c4b8a8; border-radius: 4px; }
.galerie-vorschau-label { font-size: 10pt; margin: 0 0 0.25rem; color: #5c5650; }
.unterschrift { margin-top: 1.75rem; }
.brief-seite { page-break-after: always; }
.brief-seite:last-child { page-break-after: auto; }
a { color: #0f766e; }
`

const GALERIE_QR =
  'https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=6&data=https%3A%2F%2Fk2-galerie.vercel.app%2Fgalerie'

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
<div class="brief-seite${options?.pageBreakAfter ? '' : ''}">
  <div class="briefkopf">
    <strong>K2 Galerie Kunst &amp; Keramik</strong><br />
    Martina &amp; Georg Kreinecker<br />
    Schlossergasse 4 · 4070 Eferding<br />
    georg.kreinecker@kgm.at · 0664 1046337
  </div>
  <div class="empfaenger">
    ${empfaengerExtra}
    <strong>${verein}</strong><br />
    ${adr || '—'}
  </div>
  <h1>Ein Nachmittag mit Kunst – für den ${verein}</h1>
  <p>${anrede}</p>
  <p>
    Wer für den <strong>${verein}</strong> Verantwortung trägt, möchte den Mitgliedern
    gern etwas <strong>Besonderes</strong> schenken – nicht immer dasselbe Programm, sondern ein Erlebnis, das hängen bleibt.
    Dafür schreibe ich Ihnen: Martina malt, ich arbeite mit Keramik. In der Schlossergasse haben wir unsere
    <strong>K2 Galerie Kunst &amp; Keramik</strong> – eine <strong>kleine, feine, persönliche Galerie</strong> in Eferding,
    die wir uns lange gewünscht haben und die wir gern mit Gruppen teilen.
  </p>
  <p>
    Sie können Ihrem Verein so einen Nachmittag anbieten: Wir zeigen unsere Werke, Ihre Leute schauen in Ruhe,
    wir sprechen über die Kunst – was bewegt, wie etwas entstanden ist. Am Eröffnungswochenende war viel Leben drin;
    jetzt ist es oft stiller, und genau dann entstehen die schönsten Gespräche vor einem Bild.
    Kein großer Betrieb, kein Lärm – nur Begegnung mit Malerei und Keramik, in Ihrem Tempo.
  </p>
  <p>
    Manch einer bleibt danach – oder kommt vorher – zum <strong>Mittag- oder Abendessen im Ristorante Antonio</strong>,
    gleich nebenan, ein Schritt von der Tür. Wenn das für Sie und Ihre Leute passt, sprechen wir das gern mit.
  </p>
  <div class="fakten">
    <p><strong>Schlossergasse 4, 4070 Eferding</strong> · wann es Ihnen passt, finden wir gemeinsam</p>
    <div class="galerie-vorschau">
      <div>
        <p class="galerie-vorschau-label">Wer vorher neugierig ist – Link oder QR-Code:</p>
        <p style="margin:0;"><a href="https://k2-galerie.vercel.app/galerie">k2-galerie.vercel.app/galerie</a></p>
      </div>
      <img src="${GALERIE_QR}" width="120" height="120" alt="QR-Code Galerie" />
    </div>
  </div>
  <p>
    Ich würde mich freuen, vom <strong>${verein}</strong> zu hören –
    eine Mail an <a href="mailto:georg.kreinecker@kgm.at">georg.kreinecker@kgm.at</a> oder ein Anruf unter <strong>0664 1046337</strong> reicht.
  </p>
  <p class="unterschrift">
    Herzliche Grüße<br /><br />
    <strong>Martina &amp; Georg Kreinecker</strong><br />
    K2 Galerie Kunst &amp; Keramik<br />
    Schlossergasse 4 · 4070 Eferding
  </p>
</div>`

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
      return m ? `<div class="brief-seite">${m[1]}</div>` : ''
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

export function openHtmlInPrintWindow(html: string, title = 'Serienbrief') {
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) {
    alert('Pop-up blockiert – bitte Pop-ups für diese Seite erlauben, dann erneut drucken.')
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.document.title = title
  w.onload = () => {
    setTimeout(() => w.print(), 400)
  }
}

export function safeFilenamePart(s: string): string {
  return s
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 60)
}
