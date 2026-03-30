/** Browser-Vollbild für ein Element (Plakat-Overlay). Ohne User-Gesture kann es fehlschlagen – dann bleibt normales fixed-Overlay. */

type FsDoc = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
}

export function getFullscreenElement(): Element | null {
  if (typeof document === 'undefined') return null
  const d = document as FsDoc
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? null
}

export async function requestElementFullscreen(el: HTMLElement): Promise<void> {
  if (!el || typeof el.requestFullscreen !== 'function') {
    const wk = (el as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen
    if (typeof wk === 'function') wk.call(el)
    return
  }
  await el.requestFullscreen()
}

export async function exitElementFullscreenIfActive(el: HTMLElement): Promise<void> {
  const active = getFullscreenElement()
  if (active !== el) return
  const d = document as FsDoc
  try {
    if (document.exitFullscreen) await document.exitFullscreen()
    else if (typeof d.webkitExitFullscreen === 'function') await d.webkitExitFullscreen()
  } catch {
    /* ignore */
  }
}
