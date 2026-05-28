/**
 * Texte-Schreibtisch: ein Zettel groß – blättern, Drucken, Kopieren, Retour zur Übersicht.
 */

import { useCallback, useMemo, type CSSProperties } from 'react'
import { ZettelAktionsLeiste, type ZettelBlaetternNav } from './ZettelAktionsLeiste'

export type SeitenAnsichtZettel = {
  id: string
  titel: string
  zweck: string
  to: string
  showDruckWeiterleiten?: boolean
}

export type SeitenAnsichtKontext = {
  bereichId: string
  bereichTitel: string
  zettel: SeitenAnsichtZettel[]
  zettelIndex: number
}

type Props = {
  kontext: SeitenAnsichtKontext
  resolveHref: (z: SeitenAnsichtZettel) => string
  onZurueck: () => void
  onIndexChange: (index: number) => void
  onMerken?: (z: SeitenAnsichtZettel) => void
}

function kannIframeVorschau(href: string): boolean {
  if (/\.pdf(\?|#|$)/i.test(href)) return false
  if (/\.html(\?|#|$)/i.test(href)) return true
  if (href.includes('?page=handbuch') || href.includes('?doc=')) return true
  if (href.startsWith('/projects/') && !href.includes('#')) return true
  return false
}

export function TexteSchreibtischSeitenAnsicht({
  kontext,
  resolveHref,
  onZurueck,
  onIndexChange,
  onMerken,
}: Props) {
  const n = kontext.zettel.length
  const safeIdx = n === 0 ? 0 : Math.min(Math.max(0, kontext.zettelIndex), n - 1)
  const z = n > 0 ? kontext.zettel[safeIdx] : null
  const href = z ? resolveHref(z) : ''
  const prevIdx = n < 2 ? 0 : safeIdx <= 0 ? n - 1 : safeIdx - 1
  const nextIdx = n < 2 ? 0 : safeIdx >= n - 1 ? 0 : safeIdx + 1

  const goPrev = useCallback(() => {
    if (n < 2) return
    const neu = safeIdx <= 0 ? n - 1 : safeIdx - 1
    const zz = kontext.zettel[neu]
    if (zz) onMerken?.(zz)
    onIndexChange(neu)
  }, [n, safeIdx, kontext.zettel, onIndexChange, onMerken])

  const goNext = useCallback(() => {
    if (n < 2) return
    const neu = safeIdx >= n - 1 ? 0 : safeIdx + 1
    const zz = kontext.zettel[neu]
    if (zz) onMerken?.(zz)
    onIndexChange(neu)
  }, [n, safeIdx, kontext.zettel, onIndexChange, onMerken])

  const blaettern: ZettelBlaetternNav | undefined = useMemo(
    () =>
      n > 1
        ? {
            index: safeIdx,
            total: n,
            onPrev: goPrev,
            onNext: goNext,
            prevTitel: kontext.zettel[prevIdx]?.titel,
            nextTitel: kontext.zettel[nextIdx]?.titel,
          }
        : undefined,
    [n, safeIdx, goPrev, goNext, kontext.zettel, prevIdx, nextIdx],
  )

  const iframeSrc = z && kannIframeVorschau(href) ? href : null

  if (!z) {
    return (
      <section style={{ marginBottom: '1.25rem' }}>
        <button type="button" onClick={onZurueck} style={zurueckBtn}>
          ← Zur Übersicht
        </button>
        <p style={{ margin: '0.75rem 0 0', color: '#5c5650' }}>Kein Zettel in dieser Schublade.</p>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="seitenansicht-heading"
      style={{
        marginBottom: '1.25rem',
        padding: '1rem 1.05rem 1.15rem',
        borderRadius: 14,
        background: 'linear-gradient(165deg, #fffefb 0%, #faf6f0 100%)',
        border: '2px solid #b54a1e',
        boxShadow: '0 8px 24px rgba(181,74,30,0.15)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <button type="button" onClick={onZurueck} style={zurueckBtn}>
          ← Zur Übersicht
        </button>
        <span style={{ fontSize: '0.78rem', color: '#5c5650', fontWeight: 600 }}>
          Schublade: <strong style={{ color: '#1c1a18' }}>{kontext.bereichTitel}</strong>
          {n > 1 ? ` · Zettel ${safeIdx + 1} von ${n}` : ''}
        </span>
      </div>

      <header style={{ marginBottom: '0.75rem' }}>
        <h2 id="seitenansicht-heading" style={{ margin: '0 0 0.35rem', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.25 }}>
          {z.titel}
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#5c5650', lineHeight: 1.45 }}>{z.zweck}</p>
      </header>

      {iframeSrc ? (
        <div
          style={{
            marginBottom: '0.85rem',
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid rgba(28,26,24,0.12)',
            background: '#fff',
            minHeight: 280,
          }}
        >
          <iframe
            title={`Vorschau: ${z.titel}`}
            src={iframeSrc}
            style={{ display: 'block', width: '100%', height: 'min(52vh, 520px)', border: 'none' }}
          />
        </div>
      ) : (
        <p
          style={{
            margin: '0 0 0.85rem',
            padding: '0.55rem 0.65rem',
            borderRadius: 8,
            background: 'rgba(28,26,24,0.04)',
            fontSize: '0.82rem',
            color: '#5c5650',
            lineHeight: 1.45,
          }}
        >
          Vorschau hier nicht möglich (z. B. PDF oder App-Seite). Nutze <strong>Öffnen</strong> – oder Drucken / Link kopieren, wenn verfügbar.
        </p>
      )}

      <ZettelAktionsLeiste
        titel={z.titel}
        href={href}
        showDruckWeiterleiten={z.showDruckWeiterleiten}
        onVorOeffnen={onMerken ? () => onMerken(z) : undefined}
        blaettern={blaettern}
      />
    </section>
  )
}

const zurueckBtn: CSSProperties = {
  padding: '0.5rem 0.85rem',
  borderRadius: 10,
  border: '1px solid rgba(28,26,24,0.18)',
  background: '#1c1917',
  color: '#fff',
  fontWeight: 800,
  fontSize: '0.84rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
