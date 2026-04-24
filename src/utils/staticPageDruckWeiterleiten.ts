/**
 * Drucken / Weiterleiten für statische Seiten unter /public (gleiche Origin).
 * Druck: neuer Tab + Druckdialog (expliziter Klick, kein Auto-Reload).
 */

export function absoluteUrlVonPath(path: string): string {
  if (typeof window === 'undefined') {
    return path.startsWith('http') ? path : `https://k2-galerie.vercel.app${path.startsWith('/') ? path : `/${path}`}`
  }
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${window.location.origin}${p}`
}

export function oeffneDruckdialogFuerUrl(url: string): void {
  const w = window.open(url, '_blank', 'noopener,noreferrer')
  if (!w) return
  w.addEventListener(
    'load',
    () => {
      try {
        w.focus()
        w.print()
      } catch {
        /* ignore */
      }
    },
    { once: true },
  )
}

export async function weiterleitenTitelUrl(title: string, url: string): Promise<'geteilt' | 'kopiert' | 'abgebrochen'> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text: title, url })
      return 'geteilt'
    } catch {
      /* Abbruch oder Fehler — Clipboard versuchen */
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'kopiert'
  } catch {
    return 'abgebrochen'
  }
}
