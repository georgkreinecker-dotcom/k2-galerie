/**
 * Eine Hilfsfunktion für **Druck-Dateien** (PDF, PNG-Etikett): Web Share API mit Datei,
 * sonst Download – Sportwagenmodus: ein Standard, mehrere Aufrufer (Kasse, Etikett, …).
 */

export type SharePrintFileResult = 'shared' | 'downloaded' | 'cancelled' | 'failed'

export function downloadBlobAsFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1500)
  }
}

export type ShareBlobAsFileOptions = {
  title?: string
  /** Optional: Untertitel im Teilen-Dialog (z. B. Werk-Titel) */
  text?: string
  /** MIME für `File` – sonst `blob.type` oder Fallback */
  mimeType?: string
}

/**
 * Zuerst `navigator.share` mit Datei (wenn möglich), bei Abbruch `cancelled`,
 * sonst Download-Fallback (oder `failed`).
 */
export async function shareBlobAsFile(
  blob: Blob,
  fileName: string,
  opts?: ShareBlobAsFileOptions
): Promise<SharePrintFileResult> {
  const mime = opts?.mimeType ?? (blob.type || 'application/octet-stream')
  const file = new File([blob], fileName, { type: mime })
  const title = opts?.title ?? 'Datei'
  const shareData: ShareData = { title, files: [file] }
  if (opts?.text) shareData.text = opts.text

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    let mayShare = true
    if (typeof navigator.canShare === 'function') {
      try {
        mayShare = navigator.canShare(shareData)
      } catch {
        mayShare = false
      }
    }
    if (mayShare) {
      try {
        await navigator.share(shareData)
        return 'shared'
      } catch (e: unknown) {
        const name = e && typeof e === 'object' && 'name' in e ? String((e as { name?: string }).name) : ''
        if (name === 'AbortError') return 'cancelled'
      }
    }
  }

  try {
    downloadBlobAsFile(blob, fileName)
    return 'downloaded'
  } catch {
    return 'failed'
  }
}
