import { useCallback, useEffect, useMemo, useState } from 'react'
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

/**
 * QR für lange URLs (z. B. K2 Familie Einladung t+z+m): nur Server-Stand (`v=`), kein `_=Date.now()`.
 * Kürzer = weniger Module im QR = zuverlässigerer Kamera-Scan; URL bleibt zwischen Renders stabil.
 * Galerie-/QR-Stand-Regel: weiterhin `buildQrUrlWithBust` (v + _) für Galerie, Mobile, Mission Control.
 */
export function buildQrUrlWithVersionOnly(baseUrl: string, versionTimestamp: number): string {
  const sep = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${sep}v=${versionTimestamp}`
}

/** Version für QR: Server-Stand wenn schon geladen, sonst lokaler BUILD_TIMESTAMP. refetch = QR mit aktuellem Stand neu laden. */
export function useQrVersionTimestamp(): { versionTimestamp: number; serverLabel: string; refetch: () => void } {
  const { timestamp, serverLabel, refetch } = useServerBuildTimestamp()
  return { versionTimestamp: timestamp ?? BUILD_TIMESTAMP, serverLabel, refetch }
}

/**
 * Liefert eine stabile QR-URL (mit Cache-Bust), die sich nicht bei jedem Render ändert.
 * Wichtig gegen Render-Loops auf Seiten mit QR-Code-Generierung.
 */
export function useStableQrBustedUrl(
  baseUrl: string,
  versionTimestamp: number
): { qrUrl: string; refreshQrUrl: () => void } {
  const [nonce, setNonce] = useState(0)
  const refreshQrUrl = useCallback(() => setNonce((v) => v + 1), [])
  const qrUrl = useMemo(
    () => buildQrUrlWithBust(baseUrl, versionTimestamp),
    [baseUrl, versionTimestamp, nonce]
  )
  return { qrUrl, refreshQrUrl }
}
