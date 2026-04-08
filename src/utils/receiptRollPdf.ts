/**
 * Kassenbon als **PDF mit fester Rollenbreite (mm)** – für Mobilgeräte, wo der HTML-Druckdialog
 * keine Brother-Papierformate anbietet. Gleiche HTML-Quelle wie der Druck-Tab; Raster → eine PDF-Seite.
 */

export function receiptPdfHeightMmFromCanvas(canvas: HTMLCanvasElement, paperWidthMm: number): number {
  if (canvas.width < 1 || canvas.height < 1) return Math.max(25, paperWidthMm)
  const h = (canvas.height / canvas.width) * paperWidthMm
  return Math.min(5000, Math.max(25, h))
}

export type ShareReceiptPdfResult = 'shared' | 'downloaded' | 'cancelled' | 'failed'

/**
 * Teilt die PDF (iOS: System-Dialog → Drucken / Brother / Dateien) oder lädt sie herunter.
 */
export async function shareReceiptPdfBlob(blob: Blob, filename: string): Promise<ShareReceiptPdfResult> {
  const file = new File([blob], filename, { type: 'application/pdf' })
  try {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({ files: [file], title: 'Kassenbon' })
      return 'shared'
    }
  } catch (e: unknown) {
    const name = e && typeof e === 'object' && 'name' in e ? String((e as { name?: string }).name) : ''
    if (name === 'AbortError') return 'cancelled'
  }
  try {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return 'downloaded'
  } catch {
    return 'failed'
  }
}

/**
 * Rendert dasselbe Bon-HTML wie `document.write` in einem versteckten Iframe, erfasst `#k2-receipt-root`
 * (sonst `body`) und erzeugt ein PDF mit Seitenbreite = `paperWidthMm`.
 */
export async function exportReceiptHtmlToRollPdfBlob(
  html: string,
  paperWidthMm: number
): Promise<Blob | null> {
  const safeHtml = String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
  const trimmed = safeHtml.trim()
  const fullDoc =
    /^<!DOCTYPE/i.test(trimmed) || /<html[\s>]/i.test(trimmed)
      ? safeHtml
      : `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body>${safeHtml}</body></html>`

  const iframeWidthPx = Math.max(200, Math.round((paperWidthMm / 25.4) * 96))
  const iframe = document.createElement('iframe')
  iframe.setAttribute('title', 'k2-receipt-pdf')
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
        reject(new Error('iframe'))
      }
    })

    const idoc = iframe.contentDocument
    const body = idoc?.body
    if (!body || !body.innerHTML.trim()) return null

    const head = idoc.head
    if (head) {
      const st = idoc.createElement('style')
      st.setAttribute('data-k2-receipt-pdf', '1')
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

    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())))
    await new Promise<void>(r => window.setTimeout(r, 100))

    const scrollH = Math.max(1, Math.ceil(captureRoot.scrollHeight))
    const html2canvasMod = await import('html2canvas')
    const runHtml2Canvas = (html2canvasMod as { default?: unknown }).default ?? html2canvasMod
    if (typeof runHtml2Canvas !== 'function') return null

    const h2cOpts = {
      scale: 2.25,
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
    if (!canvas || canvas.width < 1 || canvas.height < 1) return null

    const wMm = paperWidthMm
    const hMm = receiptPdfHeightMmFromCanvas(canvas, wMm)
    const imgData = canvas.toDataURL('image/jpeg', 0.92)

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'mm', format: [wMm, hMm], orientation: 'portrait' })
    pdf.addImage(imgData, 'JPEG', 0, 0, wMm, hMm, undefined, 'FAST')

    const out = pdf.output('blob')
    return out instanceof Blob ? out : null
  } catch (e) {
    console.warn('exportReceiptHtmlToRollPdfBlob', e)
    return null
  } finally {
    iframe.remove()
  }
}
