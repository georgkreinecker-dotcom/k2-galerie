/**
 * Fester „Teilen“-Button mit Popover (WhatsApp, Link kopieren, System teilen) –
 * gleiche Logik wie GaleriePage (Server-Stand + Cache-Bust über buildQrUrlWithBust).
 */

import React, { useEffect, useRef, useState } from 'react'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { isLocalOrPrivateOrigin } from '../utils/publicShare'

export type PublicTeilenVariant = 'oeffentlich' | 'vk2' | 'familie'

export interface PublicTeilenFixedProps {
  variant: PublicTeilenVariant
  /** Für WhatsApp / System-Teilen */
  displayName: string
  /** Kanonische Produktions-URL – bei localhost/LAN wird diese geteilt statt lokaler Origin */
  canonicalPublicUrl: string
  /** z. B. wenn rechts noch ein Admin-Button sitzt */
  fixedRight?: string
  buttonLabel?: string
  /** Wenn abweichend vom Standard „… – Schau dir die Werke an“ */
  getShareText?: () => string
  /**
   * `inline` = Button im normalen Layout (z. B. Sticky-Nav), kein fixed – vermeidet Überlappung mit Rundgang/Mitglied.
   * `fixed` = bisheriges Verhalten (oben rechts im Viewport), z. B. Galerie ök2 Vollfläche.
   */
  layout?: 'fixed' | 'inline'
}

/** Kurzhinweis unter den Teilen-Aktionen – kein Presse-„Verteiler“; sitzt pro Kontext (Demo / Verein / Familie). */
const SHARE_FOOTER_HINT: Record<PublicTeilenVariant, string> = {
  oeffentlich:
    'Die Demo-Galerie per Link teilen – für Chats, Mail und überall.',
  vk2: 'Die Vereinsseite per Link teilen – für Mitglieder und Bekannte.',
  familie: 'Den Familien-Link teilen – für Angehörige und Bekannte.',
}

const VARIANT_PRIMARY_BUTTON: Record<
  PublicTeilenVariant,
  { background: string; border: string; color: string }
> = {
  oeffentlich: {
    background: 'rgba(107, 144, 128, 0.25)',
    border: '1px solid rgba(107, 144, 128, 0.5)',
    color: '#fff',
  },
  vk2: {
    background: 'linear-gradient(135deg, #d4622a, #b54a1e)',
    border: '1px solid rgba(255, 140, 66, 0.7)',
    color: '#fff',
  },
  familie: {
    background: 'linear-gradient(135deg, #d4622a, #b54a1e)',
    border: '1px solid #8c3a18',
    color: '#fff',
  },
}

export function PublicTeilenFixed(props: PublicTeilenFixedProps) {
  const {
    variant,
    displayName,
    canonicalPublicUrl,
    fixedRight = 'clamp(1rem, 2vw, 1.5rem)',
    buttonLabel = '📤 Galerie teilen',
    getShareText,
    layout = 'fixed',
  } = props
  const isInline = layout === 'inline'
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const [sharePopoverOpen, setSharePopoverOpen] = useState(false)
  const [shareLinkCopied, setShareLinkCopied] = useState(false)
  const sharePopoverContainerRef = useRef<HTMLDivElement>(null)

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    const base = isLocalOrPrivateOrigin()
      ? canonicalPublicUrl
      : `${window.location.origin}${window.location.pathname}`
    return buildQrUrlWithBust(base, qrVersionTs)
  }

  const defaultShareText = () => (displayName || 'Galerie') + ' – Schau dir die Werke an'
  const resolveShareText = () => (getShareText ? getShareText() : defaultShareText())

  const handleCopyLink = async () => {
    const url = getShareUrl()
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const ta = document.createElement('textarea')
        ta.value = url
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setShareLinkCopied(true)
      setTimeout(() => setShareLinkCopied(false), 2500)
      setSharePopoverOpen(false)
    } catch (_) {}
  }

  const handleWhatsAppShare = () => {
    const url = getShareUrl()
    const text = resolveShareText()
    const full = text + ' ' + url
    const waUrl = 'https://wa.me/?text=' + encodeURIComponent(full)
    const isStandalone =
      (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
      (typeof navigator !== 'undefined' && (navigator as { standalone?: boolean }).standalone === true)

    if (isStandalone) {
      window.location.href = waUrl
    } else {
      const w = window.open(waUrl, '_blank', 'noopener,noreferrer')
      if (!w) window.location.href = waUrl
    }
    setSharePopoverOpen(false)
  }

  const handleSystemShare = async () => {
    if (typeof navigator === 'undefined') return
    const url = getShareUrl()
    const text = resolveShareText()
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: displayName || 'Galerie', text, url })
        setSharePopoverOpen(false)
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') void handleCopyLink()
      }
    } else {
      void handleCopyLink()
    }
  }

  useEffect(() => {
    if (!sharePopoverOpen) return
    const close = (e: MouseEvent | TouchEvent) => {
      const el = sharePopoverContainerRef.current
      if (el && e.target instanceof Node && !el.contains(e.target)) setSharePopoverOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close, { passive: true })
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [sharePopoverOpen])

  const pb = VARIANT_PRIMARY_BUTTON[variant]

  if (typeof navigator === 'undefined') return null

  const buttonBase: React.CSSProperties = {
    background: pb.background,
    border: pb.border,
    color: pb.color,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontFamily: 'inherit',
  }

  const buttonPosition: React.CSSProperties = isInline
    ? {
        position: 'relative',
        zIndex: 2,
        flexShrink: 0,
        borderRadius: 8,
        ...(variant === 'familie'
          ? { padding: '0.5rem 1rem', fontSize: '0.88rem' }
          : { padding: '0.28rem 0.65rem', fontSize: '0.78rem', fontFamily: 'system-ui, sans-serif' }),
        boxShadow: variant !== 'oeffentlich' ? '0 2px 8px rgba(0,0,0,0.12)' : undefined,
      }
    : {
        position: 'fixed',
        top: 'max(clamp(1rem, 2vw, 1.5rem), calc(env(safe-area-inset-top, 0px) + 1rem))',
        right: fixedRight,
        padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
        borderRadius: '10px',
        fontSize: 'clamp(0.78rem, 1.8vw, 0.9rem)',
        zIndex: 1001,
        boxShadow: variant !== 'oeffentlich' ? '0 4px 16px rgba(0,0,0,0.25)' : undefined,
      }

  const popoverPosition: React.CSSProperties = isInline
    ? {
        position: 'absolute',
        top: 'calc(100% + 6px)',
        right: 0,
        zIndex: 5000,
      }
    : {
        position: 'fixed',
        top: 'max(clamp(3.5rem, 8vw, 4.5rem), calc(env(safe-area-inset-top, 0px) + 3.5rem))',
        right: fixedRight,
        zIndex: 1002,
      }

  return (
    <div
      ref={sharePopoverContainerRef}
      style={
        isInline
          ? { position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }
          : { position: 'relative' }
      }
    >
      <button
        type="button"
        onClick={() => setSharePopoverOpen((v) => !v)}
        title="Teilen – WhatsApp, Link, überall (öffentlicher Link)"
        style={{ ...buttonBase, ...buttonPosition }}
      >
        {buttonLabel}
      </button>
      {sharePopoverOpen && (
        <div
          role="dialog"
          aria-label="Teilen"
          style={{
            ...popoverPosition,
            background: 'rgba(26, 15, 10, 0.98)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '0.5rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            minWidth: '200px',
          }}
        >
          <button
            type="button"
            onClick={handleWhatsAppShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0.9rem',
              background: 'rgba(37, 211, 102, 0.2)',
              border: '1px solid rgba(37, 211, 102, 0.5)',
              borderRadius: 8,
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
            }}
          >
            💬 WhatsApp teilen
          </button>
          <button
            type="button"
            onClick={() => void handleCopyLink()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0.9rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8,
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
            }}
          >
            {shareLinkCopied ? '✓ Link kopiert!' : '🔗 Link kopieren'}
          </button>
          {typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={() => void handleSystemShare()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.9rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 8,
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              📤 System teilen (Mail, AirDrop, …)
            </button>
          )}
          <p
            style={{
              margin: '0.5rem 0 0',
              padding: '0 0.25rem',
              fontSize: '0.75rem',
              lineHeight: 1.4,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            {SHARE_FOOTER_HINT[variant]}
          </p>
        </div>
      )}
    </div>
  )
}
