/**
 * Ein Standard: Druckbare HTML-Dokumente im Admin.
 * Bevorzugt In-App-Viewer (mit „← Zurück“ + „Drucken“) – kein _blank auf Mobil ohne Ausstieg.
 * Fallback: Popup nur wenn kein openInApp übergeben (z. B. isolierte Tests).
 */

export type OpenDocumentInAppFn = (html: string, title: string) => void

export type OpenPrintableHtmlOptions = {
  openInApp?: OpenDocumentInAppFn
  /** Nur Popup-Fallback: Druckdialog nach kurzer Verzögerung */
  autoPrint?: boolean
}

export function openPrintableHtmlDocument(
  html: string,
  title: string,
  options?: OpenPrintableHtmlOptions
): void {
  if (options?.openInApp) {
    options.openInApp(html, title)
    return
  }

  const w = window.open('', '_blank')
  if (!w) {
    alert('Pop-up blockiert – bitte erlauben oder die Seite im Browser neu laden.')
    return
  }
  try {
    w.focus()
  } catch {
    /* ignore */
  }
  w.document.write(html)
  w.document.close()
  if (options?.autoPrint !== false) {
    const delay = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 500 : 300
    setTimeout(() => {
      try {
        w.print()
      } catch {
        /* ignore */
      }
    }, delay)
  }
}
