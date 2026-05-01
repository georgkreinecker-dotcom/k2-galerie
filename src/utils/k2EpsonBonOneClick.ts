/**
 * K2: Kassenbon als PNG → lokaler Print-Server (IPP) → Epson TM im WLAN.
 * Zusätzlicher Weg neben Druckdialog/Teilen – primärer Weg bleibt unverändert.
 */

import { receiptPdfHeightMmFromCanvas } from './receiptRollPdf'

export function normalizeK2PrintServerBaseUrl(url: string): string {
  let s = String(url || '').trim()
  if (!s) return ''
  s = s.replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(s)) {
    s = `http://${s.replace(/^\/+/, '')}`
  }
  return s
}

/** Browser blockiert https-Seite → http-Print-Server (Mixed Content). */
export function canPostToK2PrintServer(printServerUrl: string): { ok: boolean; reason?: string } {
  const u = normalizeK2PrintServerBaseUrl(printServerUrl)
  if (!u) {
    return {
      ok: false,
      reason:
        'Print-Server-URL fehlt. In der K2-Administration unter Einstellungen → Drucker eintragen (z. B. http://MAC-IP:3847).',
    }
  }
  if (typeof window === 'undefined') return { ok: true }
  try {
    const page = new URL(window.location.href)
    const srv = new URL(u)
    if (page.protocol === 'https:' && srv.protocol === 'http:') {
      return {
        ok: false,
        reason:
          'Diese Seite läuft mit https – der Browser erlaubt keinen Aufruf zu einem http-Print-Server (Sicherheit). Öffne die Kasse im gleichen WLAN unter http://… (Mac oder lokaler Vite-Link), oder richte einen https-Zugang zum Print-Server ein. Details: docs/DRUCKER-EPSON-TM-M30II-K2.md',
      }
    }
  } catch {
    return { ok: false, reason: 'Print-Server-URL ist ungültig.' }
  }
  return { ok: true }
}

export function canOfferK2EpsonBonOneClick(args: {
  fromOeffentlich: boolean
  kassaIp: string
  printServerUrl: string
}): boolean {
  if (args.fromOeffentlich) return false
  if (!String(args.kassaIp || '').trim()) return false
  if (!String(args.printServerUrl || '').trim()) return false
  return true
}

export type SendPngToK2PrintServerPayload = {
  image: string
  printerIP: string
  ippPath: string
  widthMm: number
  heightMm: number
  jobName?: string
}

export async function sendPngToK2PrintServer(
  printServerBaseUrl: string,
  opts: SendPngToK2PrintServerPayload
): Promise<void> {
  const base = normalizeK2PrintServerBaseUrl(printServerBaseUrl)
  const url = `${base}/print`
  let b64 = String(opts.image || '').trim()
  const comma = b64.indexOf(',')
  if (b64.startsWith('data:') && comma !== -1) {
    b64 = b64.slice(comma + 1)
  }
  if (!b64) throw new Error('Kein Bild (Base64) zum Senden.')

  const controller = new AbortController()
  const tid = window.setTimeout(() => controller.abort(), 90000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: b64,
        printerIP: opts.printerIP.trim(),
        ippPath: String(opts.ippPath || 'EPSON_IPP_Printer').replace(/^\/+/, ''),
        widthMm: opts.widthMm,
        heightMm: opts.heightMm,
        jobName: opts.jobName || 'k2-bon',
      }),
      signal: controller.signal,
    })
    const text = await res.text()
    let errMsg = ''
    try {
      const j = JSON.parse(text) as { error?: string }
      errMsg = j.error || ''
    } catch {
      errMsg = text.slice(0, 400)
    }
    if (!res.ok) {
      throw new Error(errMsg || `Server antwortet mit ${res.status}`)
    }
  } finally {
    window.clearTimeout(tid)
  }
}

export type RenderReceiptPngResult = {
  base64: string
  widthMm: number
  heightMm: number
}

/**
 * Gleiches Muster wie receiptRollPdf: HTML im versteckten iframe, html2canvas auf #k2-receipt-root.
 * Liefert reines Base64 (ohne data:-Prefix) und mm-Maße für IPP.
 */
export async function renderReceiptHtmlToPngBase64(
  html: string,
  paperWidthMm: number
): Promise<RenderReceiptPngResult> {
  const paperW = paperWidthMm === 62 || paperWidthMm === 80 ? paperWidthMm : 80
  const safeHtml = String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
  const trimmed = safeHtml.trim()
  const fullDoc =
    /^<!DOCTYPE/i.test(trimmed) || /<html[\s>]/i.test(trimmed)
      ? safeHtml
      : `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body>${safeHtml}</body></html>`

  const iframeWidthPx = Math.max(200, Math.round((paperW / 25.4) * 96))
  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'k2-receipt-ipp-png')
  iframe.style.cssText = `position:fixed;left:-9999px;top:0;width:${iframeWidthPx}px;height:3200px;border:none;margin:0;padding:0;background:#fff;`
  document.body.appendChild(iframe)

  try {
    iframe.srcdoc = fullDoc
    await new Promise<void>((resolve, reject) => {
      const t = window.setTimeout(() => resolve(), 12000)
      iframe.onload = () => {
        window.clearTimeout(t)
        resolve()
      }
      iframe.onerror = () => {
        window.clearTimeout(t)
        reject(new Error('Bon-Vorschau konnte nicht geladen werden.'))
      }
    })

    const idoc = iframe.contentDocument
    const body = idoc?.body
    if (!body || !body.innerHTML.trim()) {
      throw new Error('Bon-Inhalt leer – nichts zum Drucken.')
    }

    const head = idoc.head
    if (head) {
      const st = idoc.createElement('style')
      st.setAttribute('data-k2-receipt-ipp', '1')
      st.textContent = `
        .receipt-tab-hint, .receipt-print-hint-screen { display: none !important; }
        @media screen {
          body { margin: 0 auto !important; border: none !important; box-shadow: none !important; }
        }
      `
      head.appendChild(st)
    }

    const captureRoot =
      (idoc.getElementById('k2-receipt-root') as HTMLElement | null) || body

    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
    await new Promise<void>((r) => window.setTimeout(r, 120))

    const scrollH = Math.max(1, Math.ceil(captureRoot.scrollHeight))
    const html2canvasMod = await import('html2canvas')
    const runHtml2Canvas = (html2canvasMod as { default?: unknown }).default ?? html2canvasMod
    if (typeof runHtml2Canvas !== 'function') {
      throw new Error('html2canvas nicht verfügbar.')
    }

    const h2cOpts = {
      scale: 2,
      windowWidth: iframeWidthPx,
      windowHeight: Math.min(Math.max(scrollH + 48, 320), 12000),
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
    }

    const canvas = await (runHtml2Canvas as (el: HTMLElement, o: typeof h2cOpts) => Promise<HTMLCanvasElement>)(
      captureRoot,
      h2cOpts
    )
    if (!canvas || canvas.width < 1 || canvas.height < 1) {
      throw new Error('Bon-Grafik konnte nicht erzeugt werden.')
    }

    const widthMm = paperW
    let heightMm = receiptPdfHeightMmFromCanvas(canvas, widthMm)
    heightMm = Math.min(2200, Math.max(25, heightMm))

    const dataUrl = canvas.toDataURL('image/png')
    const comma = dataUrl.indexOf(',')
    const base64 = comma === -1 ? dataUrl : dataUrl.slice(comma + 1)
    return { base64, widthMm, heightMm }
  } finally {
    iframe.remove()
  }
}
