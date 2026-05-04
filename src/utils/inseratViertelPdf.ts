/**
 * Lokalzeitungs-Inserat (96 × 129 mm) als PDF – eine Datei zum Speichern, E-Mail-Anhang oder Teilen.
 * Nutzt dieselbe sichtbare Karte wie im Browser (html2canvas + jsPDF).
 */

import { shareBlobAsFile, type SharePrintFileResult } from './sharePrintFile'

export const INSERAT_VIERTEL_MM = { w: 96, h: 129 } as const

export async function exportInseratViertelToPdfBlob(el: HTMLElement | null): Promise<Blob | null> {
  if (!el || typeof el.getBoundingClientRect !== 'function') return null
  try {
    /** Voller Inhalt (keine Leerfläche durch feste Kastenhöhe); PDF-Seite bleibt 96×129 mm. */
    const wPx = Math.max(1, Math.round(el.scrollWidth))
    const hPx = Math.max(1, Math.round(el.scrollHeight))

    const html2canvasMod = await import('html2canvas')
    const runHtml2Canvas = (html2canvasMod as { default?: unknown }).default ?? html2canvasMod
    if (typeof runHtml2Canvas !== 'function') return null

    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))

    const canvas = await (runHtml2Canvas as (node: HTMLElement, opts: Record<string, unknown>) => Promise<HTMLCanvasElement>)(
      el,
      {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#fffefb',
        width: wPx,
        height: hPx,
        windowWidth: wPx,
        windowHeight: hPx,
        scrollX: 0,
        scrollY: 0,
        logging: false,
      }
    )
    if (!canvas || canvas.width < 2 || canvas.height < 2) return null

    const { w: wMm, h: hMm } = INSERAT_VIERTEL_MM
    const imgData = canvas.toDataURL('image/jpeg', 0.94)
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'mm', format: [wMm, hMm], orientation: 'portrait' })
    const imgW = canvas.width
    const imgH = canvas.height
    const imgRatio = imgW / imgH
    const pageRatio = wMm / hMm
    let drawW = wMm
    let drawH = hMm
    if (imgRatio > pageRatio) {
      drawH = wMm / imgRatio
    } else {
      drawW = hMm * imgRatio
    }
    const ox = (wMm - drawW) / 2
    const oy = (hMm - drawH) / 2
    pdf.setFillColor(255, 254, 251)
    pdf.rect(0, 0, wMm, hMm, 'F')
    pdf.addImage(imgData, 'JPEG', ox, oy, drawW, drawH, undefined, 'FAST')
    const out = pdf.output('blob')
    return out instanceof Blob ? out : null
  } catch (e) {
    console.warn('exportInseratViertelToPdfBlob', e)
    return null
  }
}

const PDF_FILENAME = 'K2-Inserat-Lokalzeitung-96x129mm.pdf'

export async function shareInseratViertelPdf(el: HTMLElement | null): Promise<SharePrintFileResult> {
  const blob = await exportInseratViertelToPdfBlob(el)
  if (!blob) return 'failed'
  return shareBlobAsFile(blob, PDF_FILENAME, {
    title: 'Inserat Lokalzeitung',
    text: 'Viertelseite 96 × 129 mm – K2 / kgm solution',
    mimeType: 'application/pdf',
  })
}
