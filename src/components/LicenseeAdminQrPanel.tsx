import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import QRCode from 'qrcode'
import { useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { getLicenseeAdminQrTargetUrl, normalizeLicenseeAdminUrl } from '../utils/publicLinks'

export type LicenseeAdminQrPanelProps = {
  /** Volle oder relative Admin-URL; wird mit normalizeLicenseeAdminUrl vereinheitlicht */
  adminBaseUrl: string
  /** false: Hinweis auf Registrierung statt QR */
  registrationComplete: boolean
  accent: string
  bgCard: string
  text: string
  muted: string
  radius?: string
  /** Primär-Buttons: auf hellem Hintergrund gut lesbar */
  primaryButtonBg?: string
  primaryButtonColor?: string
  heading?: string
  /** Ersetzt den Standard-Erklärungstext unter der Überschrift (z. B. ök2-Demo) */
  adminIntro?: ReactNode
  /** Dateiname beim Speichern des QR-PNG (Standard: admin-qr-k2-galerie.png) */
  downloadFileName?: string
}

export function LicenseeAdminQrPanel({
  adminBaseUrl,
  registrationComplete,
  accent,
  bgCard,
  text,
  muted,
  radius = '12px',
  primaryButtonBg = '#b54a1e',
  primaryButtonColor = '#fff',
  heading = 'Admin auf dem Handy',
  adminIntro,
  downloadFileName = 'admin-qr-k2-galerie.png',
}: LicenseeAdminQrPanelProps) {
  const { versionTimestamp, refetch } = useQrVersionTimestamp()
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [genError, setGenError] = useState(false)

  const adminCanonical = useMemo(() => normalizeLicenseeAdminUrl(adminBaseUrl), [adminBaseUrl])

  const qrTargetUrl = useMemo(
    () => (adminCanonical ? getLicenseeAdminQrTargetUrl(adminBaseUrl, versionTimestamp) : ''),
    [adminBaseUrl, adminCanonical, versionTimestamp]
  )

  useEffect(() => {
    if (!registrationComplete || !qrTargetUrl) {
      setDataUrl(null)
      setGenError(false)
      return
    }
    let cancelled = false
    setGenError(false)
    QRCode.toDataURL(qrTargetUrl, {
      width: 220,
      margin: 2,
      color: { dark: '#1c1a18ff', light: '#ffffffff' },
    })
      .then((u) => {
        if (!cancelled) setDataUrl(u)
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null)
          setGenError(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [qrTargetUrl, registrationComplete])

  const copyAdminLink = useCallback(async () => {
    if (!adminCanonical) return
    try {
      await navigator.clipboard.writeText(adminCanonical)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [adminCanonical])

  const downloadPng = useCallback(() => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = downloadFileName || 'admin-qr-k2-galerie.png'
    a.click()
  }, [dataUrl, downloadFileName])

  if (!registrationComplete) {
    return (
      <div
        style={{
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          background: '#fffbeb',
          border: '1px solid #f59e0b',
          borderRadius: radius,
          color: '#1c1a18',
          fontSize: '0.92rem',
          lineHeight: 1.5,
        }}
      >
        <strong style={{ display: 'block', marginBottom: '0.35rem' }}>{heading}</strong>
        <p style={{ margin: 0 }}>
          Speichere zuerst unter <strong>Einstellungen → Registrierung</strong> deine Lizenznummer. Danach erscheint hier
          ein QR-Code nur für den <strong>Admin</strong> deiner Galerie – nicht für Besucher. So verwechselst du ihn nicht
          mit dem Galerie-QR auf der öffentlichen Seite.
        </p>
      </div>
    )
  }

  if (!adminCanonical) {
    return null
  }

  return (
    <div
      style={{
        padding: '1rem 1.1rem',
        marginBottom: '1rem',
        background: bgCard,
        border: `1px solid ${accent}33`,
        borderRadius: radius,
        color: text,
        fontSize: '0.92rem',
        lineHeight: 1.45,
      }}
    >
      <strong style={{ display: 'block', marginBottom: '0.35rem', fontSize: '1rem' }}>{heading}</strong>
      {adminIntro != null ? (
        <div style={{ margin: '0 0 0.75rem', color: muted, fontSize: '0.88rem', lineHeight: 1.45 }}>{adminIntro}</div>
      ) : (
        <p style={{ margin: '0 0 0.75rem', color: muted, fontSize: '0.88rem' }}>
          Dieser Code öffnet den <strong>Admin</strong> deiner Galerie im Browser auf dem Mobilgerät. Galerie-Passwort wie
          am Computer eingeben oder Lesezeichen setzen. Öffentliche Besucher nutzen den Galerie-QR auf der Galerie-Seite –
          der führt nicht in den Admin.
        </p>
      )}
      <p
        style={{
          margin: '0 0 0.75rem',
          fontSize: '0.82rem',
          wordBreak: 'break-all',
          fontFamily: 'ui-monospace, monospace',
          color: text,
        }}
      >
        {adminCanonical}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start' }}>
        {dataUrl && !genError ? (
          <img src={dataUrl} alt="QR-Code Admin" width={220} height={220} style={{ display: 'block', borderRadius: 8 }} />
        ) : (
          <div
            style={{
              width: 220,
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${accent}0f`,
              borderRadius: 8,
              color: muted,
              fontSize: '0.85rem',
              textAlign: 'center',
              padding: '0.5rem',
            }}
          >
            {genError ? 'QR konnte nicht erzeugt werden.' : 'QR wird erzeugt…'}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 'min(100%, 200px)' }}>
          <button
            type="button"
            onClick={copyAdminLink}
            style={{
              padding: '0.55rem 1rem',
              background: primaryButtonBg,
              color: primaryButtonColor,
              border: 'none',
              borderRadius: 10,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {copied ? '✓ Link kopiert' : 'Admin-Link kopieren'}
          </button>
          <button
            type="button"
            onClick={downloadPng}
            disabled={!dataUrl}
            style={{
              padding: '0.55rem 1rem',
              background: dataUrl ? `${accent}22` : `${muted}33`,
              color: text,
              border: `1px solid ${accent}44`,
              borderRadius: 10,
              fontWeight: 600,
              cursor: dataUrl ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
            }}
          >
            QR-Bild speichern
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            style={{
              padding: '0.45rem 0.85rem',
              background: 'transparent',
              color: muted,
              border: `1px solid ${accent}33`,
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.82rem',
            }}
          >
            Stand für QR neu laden
          </button>
        </div>
      </div>
    </div>
  )
}
