/**
 * PDF für Beschwerde Schmiedstraßenfest / Schlossergasse (Texte-Schreibtisch).
 * Aufruf: node scripts/generate-beschwerde-eferding-pdf.mjs
 */
import { jsPDF } from 'jspdf'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outFile = path.join(
  __dirname,
  '..',
  'public',
  'texte-schreibtisch',
  'beschwerde-schmiedstrassenfest-schlossergasse-eferding.pdf',
)

const MARGIN_L = 22
const MARGIN_R = 20
const MARGIN_T = 16
const LINE = 4.65
const BODY = 10.5
const SMALL = 10

function main() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const maxW = pageW - MARGIN_L - MARGIN_R
  let y = MARGIN_T

  function textRight(lines, xRight, size = SMALL) {
    doc.setFontSize(size)
    doc.setFont('helvetica', 'normal')
    for (const line of lines) {
      doc.text(line, xRight, y, { align: 'right' })
      y += LINE
    }
  }

  function para(text, opts = {}) {
    doc.setFontSize(opts.size ?? BODY)
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(text, maxW)
    doc.text(lines, MARGIN_L, y)
    y += lines.length * LINE + (opts.gap ?? 2.2)
  }

  // Absender rechts (ohne Person / Straße)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(SMALL)
  doc.text('KGM Immobilien GmbH', pageW - MARGIN_R, y, { align: 'right' })
  y += LINE
  textRight(['Ristorante Antonio', '4070 Eferding'], pageW - MARGIN_R)
  y += 3

  para('Eferding, 11. Juli 2026', { size: SMALL, gap: 4 })

  para('Stadtgemeinde Eferding\n4070 Eferding', { gap: 4.5 })

  para(
    'Betreff: Beschwerde betreffend Sperrung der Schlossergasse während des Schmiedstraßenfestes am 10. Juli 2026',
    { bold: true, gap: 4 },
  )

  para('Sehr geehrte Damen und Herren,')

  para(
    'anlässlich des Schmiedstraßenfestes am 10. Juli 2026 wurde im Kreuzungsbereich Schmiedstraße / Schlossergasse eine Ausschank errichtet. Ein regulärer Durchgang in die Schlossergasse war nicht mehr möglich: Fußgänger konnten die Gasse nur noch links und rechts der Ausschankanlage über einen sehr schmalen Gang im Schankbereich passieren.',
  )

  para(
    'Auf unsere Anfrage beim Betreiber – einem auswärtigen Wirten – erhielten wir die Auskunft, dies sei so vorgesehen und genehmigt; es müsse lediglich ein Rettungsdurchgang gewährleistet sein. Unserer Bitte um Anpassung, damit auch die geschäftlichen Interessen der Anrainer in der Schlossergasse gewahrt werden, wurde nicht nachgekommen.',
  )

  para(
    'In den vergangenen Jahren war die Situation für die Schlossergasse bereits ungünstig; in der jetzigen Form ist sie für uns nicht mehr hinnehmbar.',
  )

  para('Unsere Forderungen:', { bold: true, gap: 1.5 })

  const forderungen = [
    'Die Stadtgemeinde Eferding soll sicherstellen, dass bei künftigen Veranstaltungen in der Schmiedstraße die Interessen aller Bürgerinnen und Bürger sowie der Anrainer und Geschäftsleute gleichermaßen berücksichtigt werden.',
    'Konkret bitten wir um verbindliche Vorgaben, dass bei künftigen Festen in der Schmiedstraße mindestens 50 % der Fahrbahnbreite in Richtung Schlossergasse als öffentlicher Durchgang freizuhalten sind.',
    'Im Sinne einer gemeinsamen Weiterentwicklung des Festgeländes bitten wir die Gemeinde zusätzlich, dahingehend einzuwirken, dass die Schlossergasse bis zur Volksbank-Einfahrt in das Schmiedstraßengeschehen einbezogen wird. Das Ristorante Antonio ist der einzige Gastronomiebetrieb, der unmittelbar an die Schmiedstraße angrenzt und seit 23 Jahren am Standort tätig ist.',
  ]

  forderungen.forEach((f, i) => {
    doc.setFontSize(BODY)
    doc.setFont('helvetica', 'normal')
    const prefix = `${i + 1}. `
    const lines = doc.splitTextToSize(prefix + f, maxW - 4)
    doc.text(lines, MARGIN_L + 2, y)
    y += lines.length * LINE + 1.8
  })

  y += 0.5
  para(
    'Wir bitten um schriftliche Stellungnahme und um entsprechende Beschlüsse bzw. Regelungen für kommende Veranstaltungen.',
  )

  para('Mit freundlichen Grüßen', { gap: 6 })

  para('KGM Immobilien GmbH', { size: SMALL, gap: 0.3 })
  para('Ristorante Antonio', { size: SMALL, gap: 0 })

  const pages = doc.getNumberOfPages()
  if (pages > 1) {
    console.warn('Warnung: PDF hat', pages, 'Seiten – Layout prüfen')
  }

  fs.writeFileSync(outFile, Buffer.from(doc.output('arraybuffer')))
  console.log('OK', path.basename(outFile), `(${pages} Seite${pages === 1 ? '' : 'n'})`)
}

main()
