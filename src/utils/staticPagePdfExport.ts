/**
 * Texte-Schreibtisch: statische HTML- oder PDF-Seiten als PDF speichern / versenden.
 * Eine Quelle für alle Zettel mit showDruckWeiterleiten (Sportwagenmodus).
 */

import { getWerbemittelHtml2canvasCaptureCss } from '../config/marketingWerbelinie'
import { absoluteUrlVonPath } from './staticPageDruckWeiterleiten'
import {
  downloadBlobAsFile,
  shareBlobAsFile,
  type SharePrintFileResult,
} from './sharePrintFile'

export type StaticPagePdfJsFormat = 'a4' | 'a3' | 'a5' | [number, number]

export function kannAlsPdfExportieren(href: string): boolean {
  return /\.(html|pdf)(\?|#|$)/i.test(href)
}

export function safeStaticPagePdfFileName(title: string): string {
  const base = title
    .replace(/[<>:"/\\|?*]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 72)
  return `${base || 'K2-Dokument'}.pdf`
}

/** Erkennung anhand URL (und optional HTML) – welches PDF-Format und welcher Capture-Pfad. */
export function resolveStaticPagePdfProfile(
  url: string,
  htmlHint = '',
): {
  jsFormat: StaticPagePdfJsFormat
  iframeWidthPx: number
  isPlakatstaender: boolean
  isOeffnungszeitenFlyerA5: boolean
} {
  const u = url.toLowerCase()
  const h = htmlHint.toLowerCase()
  if (u.includes('plakatstaender') || h.includes('plakatständer') || /\bclass=["'][^"']*\ba1\b/.test(h)) {
    return { jsFormat: 'a4', iframeWidthPx: 900, isPlakatstaender: true, isOeffnungszeitenFlyerA5: false }
  }
  if (u.includes('oeffnungszeiten-flyer-a5') || h.includes('class="a5"')) {
    return { jsFormat: 'a5', iframeWidthPx: 820, isPlakatstaender: false, isOeffnungszeitenFlyerA5: true }
  }
  if (/\bplakat\b/.test(h) || u.includes('plakat')) {
    return { jsFormat: 'a3', iframeWidthPx: 1240, isPlakatstaender: false, isOeffnungszeitenFlyerA5: false }
  }
  return { jsFormat: 'a4', iframeWidthPx: 900, isPlakatstaender: false, isOeffnungszeitenFlyerA5: false }
}

/** Plakatständer: print-a4-Regeln als Screen-CSS (html2canvas nutzt kein @media print). */
export function getPlakatstaenderA4CaptureCss(): string {
  return `
    .no-print, .hinweis-screen { display: none !important; }
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .wrap { padding: 0 !important; display: block !important; }
    .a1-print-scale { width: 210mm !important; height: 297mm !important; overflow: hidden !important; margin: 0 auto !important; }
    .a1 { width: 210mm !important; height: 297mm !important; box-shadow: none !important; transform: none !important; }
    .hero { display: block !important; flex: none !important; }
    .heute-offen, .heute-offen .zeile, .heute-offen .zeile.offen, .fuss-text .adresse, .kopf .marke {
      text-shadow: none !important; -webkit-text-stroke: 0 !important;
    }
    .pfeil-gelb { filter: none !important; }
    .pfeil-gelb svg path { stroke: none !important; fill: #ffcc00 !important; }
    .fuss { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
    .bg-foto img { filter: none !important; object-fit: cover !important; object-position: center 42% !important; }
    .kopf .marke { font-family: Georgia, 'Times New Roman', serif !important; font-size: 30pt !important; }
    .kopf .unter { font-family: Arial, Helvetica, sans-serif !important; font-size: 8.5pt !important; }
    .heute-offen .zeile { font-size: 96pt !important; line-height: 0.92 !important; }
    .heute-offen .zeile.offen { font-size: 108pt !important; }
    .fuss-text .adresse { font-size: 22pt !important; }
    .qr img { width: 14.8mm !important; height: 14.8mm !important; }
    .qr p { font-size: 5.5pt !important; }
    .copyright { font-size: 4.5pt !important; }
    .bg-foto, .bg-foto img, .bg-overlay, .kopf, .hero, .fuss, .heute-offen, .copyright, .pfeil-gelb {
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
  `
}

async function waitForIframePaint(idoc: Document, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs
  try {
    const fonts = (idoc as Document & { fonts?: FontFaceSet }).fonts
    if (fonts?.ready) await fonts.ready.catch(() => undefined)
  } catch {
    /* ignore */
  }
  const imgs = Array.from(idoc.images)
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve()
      return new Promise<void>((resolve) => {
        const ms = Math.max(400, deadline - Date.now())
        const t = window.setTimeout(() => resolve(), ms)
        const done = () => {
          window.clearTimeout(t)
          resolve()
        }
        img.addEventListener('load', done, { once: true })
        img.addEventListener('error', done, { once: true })
      })
    }),
  )
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
}

function pickCaptureRoot(body: HTMLElement, profile: ReturnType<typeof resolveStaticPagePdfProfile>): HTMLElement {
  if (profile.isPlakatstaender) {
    return (
      (body.querySelector('.a1-print-scale .a1') as HTMLElement | null) ||
      (body.querySelector('.a1') as HTMLElement | null) ||
      body
    )
  }
  if (profile.isOeffnungszeitenFlyerA5) {
    return (body.querySelector('.a5') as HTMLElement | null) || body
  }
  return (
    (body.querySelector('.plakat') as HTMLElement | null) ||
    (body.querySelector('.flyer') as HTMLElement | null) ||
    (body.querySelector('.page') as HTMLElement | null) ||
    (body.querySelector('main') as HTMLElement | null) ||
    body
  )
}

function inferWerbemittelFormat(jsFormat: StaticPagePdfJsFormat): 'a4' | 'a3' {
  return jsFormat === 'a3' ? 'a3' : 'a4'
}

async function canvasToPdfBlob(canvas: HTMLCanvasElement, jsFormat: StaticPagePdfJsFormat): Promise<Blob | null> {
  try {
    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const { jsPDF } = await import('jspdf')

    let pageW = 210
    let pageH = 297
    let orientation: 'portrait' | 'landscape' = 'portrait'
    let format: string | [number, number] = 'a4'

    if (jsFormat === 'a3') {
      format = 'a3'
      pageW = 297
      pageH = 420
    } else if (jsFormat === 'a5') {
      format = 'a5'
      pageW = 148
      pageH = 210
    } else if (Array.isArray(jsFormat)) {
      format = jsFormat
      pageW = jsFormat[0]
      pageH = jsFormat[1]
    }

    const pdf = new jsPDF({ unit: 'mm', format, orientation })
    const imgRatio = canvas.width / canvas.height
    const pageRatio = pageW / pageH
    let drawW = pageW
    let drawH = pageH
    if (imgRatio > pageRatio) {
      drawH = pageW / imgRatio
    } else {
      drawW = pageH * imgRatio
    }
    const ox = (pageW - drawW) / 2
    const oy = (pageH - drawH) / 2
    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 0, pageW, pageH, 'F')
    pdf.addImage(imgData, 'JPEG', ox, oy, drawW, drawH, undefined, 'FAST')
    const out = pdf.output('blob')
    return out instanceof Blob ? out : null
  } catch (e) {
    console.warn('canvasToPdfBlob', e)
    return null
  }
}

async function fetchExistingPdfBlob(url: string): Promise<Blob | null> {
  try {
    const res = await fetch(absoluteUrlVonPath(url), { cache: 'no-store', credentials: 'same-origin' })
    if (!res.ok) return null
    const blob = await res.blob()
    if (!blob || blob.size < 32) return null
    return blob
  } catch {
    return null
  }
}

async function exportHtmlUrlToPdfBlob(url: string, htmlHint = ''): Promise<Blob | null> {
  const profile = resolveStaticPagePdfProfile(url, htmlHint)
  const abs = absoluteUrlVonPath(url)
  const iframeMinHeightPx = profile.jsFormat === 'a3' ? 2000 : 1400

  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'k2-static-pdf-export')
  iframe.style.cssText = `position:fixed;left:-9999px;top:0;width:${profile.iframeWidthPx}px;height:${iframeMinHeightPx}px;border:none;margin:0;padding:0;background:#fff;`
  document.body.appendChild(iframe)

  try {
    await new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(() => resolve(), 15000)
      iframe.onload = () => {
        window.clearTimeout(t)
        resolve()
      }
      iframe.onerror = () => {
        window.clearTimeout(t)
        reject(new Error('iframe load failed'))
      }
      iframe.src = abs
    })

    const idoc = iframe.contentDocument
    const body = idoc?.body
    if (!body || !idoc) return null

    try {
      body.style.setProperty('-webkit-print-color-adjust', 'exact')
      body.style.setProperty('print-color-adjust', 'exact')
    } catch {
      /* ignore */
    }

    const head = idoc.head
    if (head) {
      const captureStyle = idoc.createElement('style')
      captureStyle.setAttribute('id', 'k2-static-page-pdf-capture')
      if (profile.isPlakatstaender) {
        idoc.documentElement.classList.add('print-a4')
        captureStyle.textContent = getPlakatstaenderA4CaptureCss()
      } else {
        const wf = inferWerbemittelFormat(profile.jsFormat)
        captureStyle.textContent = getWerbemittelHtml2canvasCaptureCss(htmlHint || body.innerHTML.slice(0, 8000), wf)
      }
      head.appendChild(captureStyle)
    }

    const captureRoot = pickCaptureRoot(body, profile)
    await waitForIframePaint(idoc, 12000)
    await new Promise<void>((r) => window.setTimeout(() => r(), 400))

    const scrollH = Math.max(1, Math.ceil(captureRoot.scrollHeight))
    const html2canvasMod = await import('html2canvas')
    const runHtml2Canvas = (html2canvasMod as { default?: unknown }).default ?? html2canvasMod
    if (typeof runHtml2Canvas !== 'function') return null

    const canvas = await (
      runHtml2Canvas as (
        el: HTMLElement,
        opts: Record<string, unknown>,
      ) => Promise<HTMLCanvasElement>
    )(captureRoot, {
      scale: profile.jsFormat === 'a3' ? 2.2 : 2.1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: profile.iframeWidthPx,
      windowHeight: Math.min(Math.max(scrollH + 120, iframeMinHeightPx), 8000),
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc: Document) => {
        try {
          clonedDoc.querySelectorAll('.no-print, .hinweis-screen').forEach((n) => {
            ;(n as HTMLElement).style.setProperty('display', 'none', 'important')
          })
        } catch {
          /* ignore */
        }
      },
    })

    if (!canvas || canvas.width < 2 || canvas.height < 2) return null
    return canvasToPdfBlob(canvas, profile.jsFormat)
  } catch (e) {
    console.warn('exportHtmlUrlToPdfBlob', url, e)
    return null
  } finally {
    iframe.remove()
  }
}

/** PDF-Blob: vorhandene .pdf-Datei laden oder HTML rendern. */
export async function exportStaticPageToPdfBlob(url: string, title = ''): Promise<Blob | null> {
  if (/\.pdf(\?|#|$)/i.test(url)) {
    return fetchExistingPdfBlob(url)
  }
  if (!/\.html(\?|#|$)/i.test(url)) return null
  return exportHtmlUrlToPdfBlob(url, title)
}

export async function downloadStaticPagePdf(url: string, title: string): Promise<boolean> {
  const blob = await exportStaticPageToPdfBlob(url, title)
  if (!blob) return false
  try {
    downloadBlobAsFile(blob, safeStaticPagePdfFileName(title))
    return true
  } catch {
    return false
  }
}

export async function shareStaticPagePdf(url: string, title: string): Promise<SharePrintFileResult> {
  const blob = await exportStaticPageToPdfBlob(url, title)
  if (!blob) return 'failed'
  return shareBlobAsFile(blob, safeStaticPagePdfFileName(title), {
    title,
    text: title,
    mimeType: 'application/pdf',
  })
}
