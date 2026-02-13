import { useEffect, useState } from 'react'
import { BUILD_TIMESTAMP } from '../buildInfo.generated'

const BUILD_INFO_URL = 'https://k2-galerie.vercel.app/build-info.json'

/** Holt den aktuellen Build-Stand vom Server (Vercel). QR-Code zeigt dann immer die live-Version. */
export function useServerBuildTimestamp(): number | null {
  const [ts, setTs] = useState<number | null>(null)
  useEffect(() => {
    const url = BUILD_INFO_URL + '?t=' + Date.now() + '&r=' + Math.random()
    fetch(url, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { timestamp?: number } | null) => (d?.timestamp != null ? setTs(d.timestamp) : undefined))
      .catch(() => {})
  }, [])
  return ts
}

/**
 * QR-URL mit Version + einmaligem Cache-Bust (_=now).
 * Scan liefert immer die aktuelle Version; jeder Aufruf erzeugt eine neue URL (kein CDN-Cache).
 */
export function buildQrUrlWithBust(baseUrl: string, versionTimestamp: number): string {
  const sep = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${sep}v=${versionTimestamp}&_=${Date.now()}`
}

/** Version für QR: Server-Stand wenn schon geladen, sonst lokaler BUILD_TIMESTAMP. */
export function useQrVersionTimestamp(): number {
  const serverTs = useServerBuildTimestamp()
  return serverTs ?? BUILD_TIMESTAMP
}
