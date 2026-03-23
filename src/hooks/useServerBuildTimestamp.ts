import { useCallback, useEffect, useState } from 'react'
import { BUILD_TIMESTAMP } from '../buildInfo.generated'

/** Produktions-API; localhost nutzt dieselbe URL, damit QR/Stand = immer Vercel-Stand (nicht 404 auf lokalem /api). */
const BUILD_INFO_PRODUCTION = 'https://k2-galerie.vercel.app/api/build-info'

function getBuildInfoFetchUrl(): string {
  if (typeof window === 'undefined') return BUILD_INFO_PRODUCTION
  const h = window.location.hostname
  if (h === 'localhost' || h === '127.0.0.1') return BUILD_INFO_PRODUCTION
  if (h.includes('vercel.app')) return `${window.location.origin}/api/build-info`
  return BUILD_INFO_PRODUCTION
}

export type BuildInfo = { timestamp: number; label: string } | null

function fetchBuildInfo(): Promise<BuildInfo> {
  const url = getBuildInfoFetchUrl() + '?t=' + Date.now() + '&r=' + Math.random()
  return fetch(url, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((d: { timestamp?: number; label?: string } | null) =>
      d?.timestamp != null ? { timestamp: d.timestamp, label: d.label ?? '' } : null
    )
    .catch(() => null)
}

/** Holt den aktuellen Build-Stand vom Server (Vercel). QR-Code zeigt dann immer die live-Version. */
export function useServerBuildTimestamp(): { timestamp: number | null; serverLabel: string; refetch: () => void } {
  const [info, setInfo] = useState<BuildInfo>(null)
  const refetch = useCallback(() => {
    fetchBuildInfo().then(setInfo)
  }, [])
  useEffect(() => {
    let cancelled = false
    const inIframe = typeof window !== 'undefined' && window.self !== window.top
    fetchBuildInfo().then((i) => { if (!cancelled && i) setInfo(i) })
    if (inIframe) return () => { cancelled = true }
    const interval = setInterval(() => {
      fetchBuildInfo().then((i) => { if (!cancelled && i) setInfo(i) })
    }, 2 * 60 * 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])
  return { timestamp: info?.timestamp ?? null, serverLabel: info?.label ?? '', refetch }
}

/**
 * QR-URL mit Version + einmaligem Cache-Bust (_=now).
 * Scan liefert immer die aktuelle Version; jeder Aufruf erzeugt eine neue URL (kein CDN-Cache).
 */
export function buildQrUrlWithBust(baseUrl: string, versionTimestamp: number): string {
  const sep = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${sep}v=${versionTimestamp}&_=${Date.now()}`
}

/** Version für QR: Server-Stand wenn schon geladen, sonst lokaler BUILD_TIMESTAMP. refetch = QR mit aktuellem Stand neu laden. */
export function useQrVersionTimestamp(): { versionTimestamp: number; serverLabel: string; refetch: () => void } {
  const { timestamp, serverLabel, refetch } = useServerBuildTimestamp()
  return { versionTimestamp: timestamp ?? BUILD_TIMESTAMP, serverLabel, refetch }
}
