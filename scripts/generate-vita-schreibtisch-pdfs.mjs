/**
 * Erzeugt PDFs für die K2-Kurzbiographien (public/texte-schreibtisch/).
 * Nutzt jspdf (Projekt-Dependency), kein Playwright.
 *
 * Aufruf: node scripts/generate-vita-schreibtisch-pdfs.mjs
 */
import { jsPDF } from 'jspdf'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pub = path.join(__dirname, '..', 'public', 'texte-schreibtisch')

const MARGIN = 18
const LINE_MM = 5.2
const TITLE_SIZE = 15
const BODY_SIZE = 10.5
const SUB_SIZE = 10.5
const ACCENT = [12, 92, 85]
const BODY = [28, 26, 24]
const MUTED = [100, 116, 139]

function writePdf(filename, draw) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const maxW = pageW - 2 * MARGIN
  let y = MARGIN

  function ensureSpace(lines) {
    const need = lines.length * LINE_MM + 4
    if (y + need > pageH - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  function addTitle(text) {
    doc.setFontSize(TITLE_SIZE)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...ACCENT)
    const lines = doc.splitTextToSize(text, maxW)
    ensureSpace(lines)
    doc.text(lines, MARGIN, y)
    y += lines.length * LINE_MM + 4
    doc.setTextColor(...BODY)
  }

  function addSub(text) {
    doc.setFontSize(SUB_SIZE)
    doc.setFont('helvetica', 'bold')
    const lines = doc.splitTextToSize(text, maxW)
    ensureSpace(lines)
    doc.text(lines, MARGIN, y)
    y += lines.length * LINE_MM + 3
    doc.setFont('helvetica', 'normal')
  }

  function addPara(text) {
    doc.setFontSize(BODY_SIZE)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(text, maxW)
    ensureSpace(lines)
    doc.text(lines, MARGIN, y)
    y += lines.length * LINE_MM + 3.5
  }

  function addHeading(text) {
    doc.setFontSize(11.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...ACCENT)
    const lines = doc.splitTextToSize(text, maxW)
    ensureSpace(lines)
    doc.text(lines, MARGIN, y)
    y += lines.length * LINE_MM + 2
    doc.setTextColor(...BODY)
    doc.setFont('helvetica', 'normal')
  }

  function addBullet(text) {
    doc.setFontSize(BODY_SIZE)
    const bullet = '• '
    const indent = 5
    const lines = doc.splitTextToSize(bullet + text, maxW - indent)
    ensureSpace(lines)
    doc.text(lines, MARGIN + indent, y)
    y += lines.length * LINE_MM + 2.2
  }

  function addFoot(text) {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MUTED)
    const lines = doc.splitTextToSize(text, maxW)
    ensureSpace(lines)
    doc.text(lines, MARGIN, y)
    doc.setTextColor(...BODY)
  }

  draw({ addTitle, addSub, addPara, addHeading, addBullet, addFoot })

  const buf = Buffer.from(doc.output('arraybuffer'))
  const out = path.join(pub, filename)
  fs.writeFileSync(out, buf)
  console.log('OK', filename)
}

function main() {
  if (!fs.existsSync(pub)) {
    console.error('Fehlt Ordner:', pub)
    process.exit(1)
  }

  writePdf('vita-martina-k2-kurzbiographie-2026-03.pdf', (a) => {
    a.addTitle('Kurzbiographie Martina Kreinecker')
    a.addSub(
      'Mein Werdegang: Arbeitslehrerin, Mutter, Assistentin der Geschäftsführung, Bewegungstrainerin.'
    )
    a.addPara(
      'Das Experimentieren mit verschiedenen Farben, Textilien und Techniken fasziniert mich schon mein Leben lang. Die kreative Fähigkeit, meine persönlichen Erfahrungen in kleinen und großen Kunstwerken zu verarbeiten, wurde mir wahrscheinlich schon von meinen Eltern in die Wiege gelegt – beide liebten ihr Handwerk sehr.'
    )
    a.addPara(
      'Durch meine gute Freundin und Künstlerin Len van Hagendoorn wurde ich ermutigt, tiefer in die Welt der künstlerischen Ausdrucksmöglichkeiten einzutauchen, dabei meine Ängste zu überwinden und so zu meiner Leidenschaft, dem Malen, zu finden.'
    )
    a.addPara(
      'Mit meiner Ausstellung „Mutprobe“ im Frühjahr 2025 trat ich erstmals allein in die Öffentlichkeit und präsentierte Werke aus allen meinen Schaffensperioden.'
    )
    a.addHeading('Besuchte Kurse und Stationen')
    a.addBullet('1997 – Kurs, Volkshochschule')
    a.addBullet('1998–2000 – Kurse bei Len van Hagendoorn')
    a.addBullet('2002 – Malworkshop Aboriginal Art mit Ausstellung')
    a.addBullet('2003 – Malreise in die Toskana')
    a.addBullet(
      '2004–2006 – Zeichenkurse im Bildungshaus Puchberg (Mag. Martin Staufer: Akt/Portrait; Mag. Harald Birklhuber: Perspektive)'
    )
    a.addBullet('Es folgten weitere Kurse bei Christine Kastner in Krems (PanArt).')
    a.addBullet(
      '2018 – Beitritt zur Aktzeichengruppe Karl Breuer und zu einer Künstlergruppe'
    )
    a.addBullet(
      'Seit 2020 – jährliche Teilnahme an Sommerakademien (unter anderem in Eferding)'
    )
    a.addBullet(
      '2023 – Gemeinschaftsausstellung der Aktgruppe in der Konditorei Vogl und in der „Kleinen Kellergalerie“'
    )
    a.addBullet('2025 – Gastausstellung bei der Künstlergilde Eferding')
    a.addFoot('K2 Galerie Kunst & Keramik · Entwurf März 2026 · Texte-Schreibtisch')
  })

  writePdf('vita-georg-k2-kurzbiographie-2026-03.pdf', (a) => {
    a.addTitle('Kurzbiographie Georg Kreinecker')
    a.addPara(
      '1983 legte ich die Schlossermeisterprüfung ab. 1985 gründete ich als Unternehmer das Kreinecker Georg Maschinenbau (KGM). Daraus wurden über die Jahre die kgm consulting & trading GmbH, die kgm Immobilien GmbH und kgm solution.'
    )
    a.addPara(
      'Meine künstlerischen Ambitionen erwachten 2009 in einem Kurs für Bildhauerei mit Steinbearbeitung; es folgten Versuche im Bronzeguss und schließlich die Leidenschaft für die Keramik. Ich besuchte Praxiskurse bei Georg Niemann, bei Sabine Classen und im Keramikzentrum Grenzhausen (Keramik-Kombinat). Umfangreiche Literatur und viel Experimentieren sind die Basis meiner keramischen Arbeit.'
    )
    a.addHeading('Weblinks (Kurse & Werkstätten)')
    a.addPara('http://www.ceramic4you.com/')
    a.addPara('http://www.sabineclassen.de/')
    a.addPara('https://natur-kultur-keramik.de/keramik-kombinat/')
    a.addFoot('K2 Galerie Kunst & Keramik · Entwurf März 2026 · Texte-Schreibtisch')
  })
}

main()
