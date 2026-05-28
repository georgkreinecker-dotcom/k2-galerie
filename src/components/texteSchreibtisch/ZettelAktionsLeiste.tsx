/**
 * Texte-Schreibtisch: eine Aktionsleiste pro Zettel (Blättern, Öffnen, Drucken, Link kopieren).
 */

import { useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  absoluteUrlVonPath,
  kopiereUrl,
  oeffneDruckdialogFuerUrl,
  teileTitelUrl,
} from '../../utils/staticPageDruckWeiterleiten'

export type ZettelBlaetternNav = {
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  prevTitel?: string
  nextTitel?: string
}

type ZettelAktionsProps = {
  titel: string
  href: string
  showDruckWeiterleiten?: boolean
  compact?: boolean
  onVorOeffnen?: () => void
  /** Seitenansicht auf dem Schreibtisch (ohne Wegnavigation) */
  onSeitenAnsicht?: () => void
  blaettern?: ZettelBlaetternNav
}

function isStaticDocumentHref(to: string): boolean {
  return /\.(pdf|html)(\?|#|$)/i.test(to)
}

function ZettelOeffnenLink({
  to,
  children,
  style,
  onVorOeffnen,
}: {
  to: string
  children: ReactNode
  style: CSSProperties
  onVorOeffnen?: () => void
}) {
  if (isStaticDocumentHref(to)) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" style={style} onClick={() => onVorOeffnen?.()}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} style={style} onClick={() => onVorOeffnen?.()}>
      {children}
    </Link>
  )
}

const btnBase: CSSProperties = {
  padding: '0.42rem 0.7rem',
  borderRadius: 8,
  border: '1px solid rgba(28,26,24,0.15)',
  background: '#fffefb',
  color: '#1c1a18',
  fontWeight: 700,
  fontSize: '0.78rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 1.2,
}

const leisteWrap: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem',
  marginTop: '0.15rem',
}

const aktionenZeile: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(7.5rem, 1fr))',
  gap: '0.4rem',
}

export function ZettelAktionsLeiste({
  titel,
  href,
  showDruckWeiterleiten,
  compact,
  onVorOeffnen,
  onSeitenAnsicht,
  blaettern,
}: ZettelAktionsProps) {
  const [hinweis, setHinweis] = useState<string | null>(null)
  const abs = absoluteUrlVonPath(href)
  const kannTeilen = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const melde = (text: string) => {
    setHinweis(text)
    window.setTimeout(() => setHinweis(null), 3200)
  }

  const nav = blaettern && blaettern.total > 1 ? blaettern : null

  return (
    <div style={leisteWrap} role="group" aria-label={`Aktionen: ${titel}`}>
      {nav && (
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '0.35rem',
            padding: '0.35rem 0.4rem',
            borderRadius: 10,
            background: 'rgba(28,26,24,0.05)',
            border: '1px solid rgba(28,26,24,0.1)',
          }}
        >
          <button
            type="button"
            onClick={nav.onPrev}
            style={{ ...btnBase, flex: '1 1 0', minWidth: 0, textAlign: 'left' }}
            title={nav.prevTitel ? `Zurück: ${nav.prevTitel}` : 'Vorheriger Zettel'}
            aria-label="Vorheriger Zettel"
          >
            ◀ Zurück
          </button>
          <div
            style={{
              flex: '0 0 auto',
              alignSelf: 'center',
              padding: '0 0.35rem',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#5c5650',
              whiteSpace: 'nowrap',
            }}
            aria-live="polite"
          >
            {nav.index + 1} / {nav.total}
          </div>
          <button
            type="button"
            onClick={nav.onNext}
            style={{ ...btnBase, flex: '1 1 0', minWidth: 0, textAlign: 'right' }}
            title={nav.nextTitel ? `Weiter: ${nav.nextTitel}` : 'Nächster Zettel'}
            aria-label="Nächster Zettel"
          >
            Weiter ▶
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: onSeitenAnsicht ? '1fr 1fr' : '1fr',
          gap: '0.4rem',
        }}
      >
        {onSeitenAnsicht && (
          <button
            type="button"
            onClick={() => {
              onVorOeffnen?.()
              onSeitenAnsicht()
            }}
            style={{
              ...btnBase,
              padding: compact ? '0.45rem 0.6rem' : '0.55rem 0.75rem',
              background: '#1c4a7a',
              color: '#fff',
              border: '1px solid #153e6a',
              fontWeight: 800,
              fontSize: compact ? '0.78rem' : '0.84rem',
            }}
            title="Groß auf dem Schreibtisch – blättern ohne die Übersicht zu verlassen"
          >
            📄 Seite
          </button>
        )}
        <ZettelOeffnenLink
          to={href}
          onVorOeffnen={onVorOeffnen}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: compact ? '0.45rem 0.6rem' : '0.55rem 0.75rem',
            borderRadius: 10,
            background: '#b54a1e',
            color: '#fff',
            fontWeight: 800,
            fontSize: compact ? '0.78rem' : '0.84rem',
            textDecoration: 'none',
            border: '1px solid rgba(28,26,24,0.12)',
          }}
        >
          Öffnen →
        </ZettelOeffnenLink>
      </div>

      {showDruckWeiterleiten && (
        <div style={aktionenZeile}>
          <button
            type="button"
            onClick={() => oeffneDruckdialogFuerUrl(abs)}
            style={btnBase}
            title="In neuem Tab öffnen und Druckdialog"
          >
            🖨️ Drucken
          </button>
          <button
            type="button"
            onClick={async () => {
              if (await kopiereUrl(abs)) melde('Link kopiert.')
              else melde('Kopieren nicht möglich – Link unten in der Adresszeile.')
            }}
            style={{ ...btnBase, background: '#1c1917', color: '#fff', border: '1px solid #292524' }}
            title="Link in die Zwischenablage"
          >
            📋 Link kopieren
          </button>
          {kannTeilen && (
            <button
              type="button"
              onClick={async () => {
                if (await teileTitelUrl(titel, abs)) melde('Teilen-Dialog geöffnet.')
              }}
              style={btnBase}
              title="Per Mail, AirDrop, … teilen"
            >
              📤 Teilen
            </button>
          )}
        </div>
      )}

      {hinweis && (
        <p style={{ margin: 0, fontSize: '0.72rem', textAlign: 'center', color: '#166534', fontWeight: 700 }}>
          ✓ {hinweis}
        </p>
      )}
    </div>
  )
}
