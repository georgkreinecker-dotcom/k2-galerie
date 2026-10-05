import { Link } from 'react-router-dom'
import { YOGA_ABSOLVENT_MARKE, YOGA_ABSOLVENT_FONT_HREF } from '../config/yogaAbsolventMarke'
import { YOGA_FONT_HREF, YOGA_MARKE } from '../config/yogaAkademieMarke'
import { getYogaDemoBeispiele, type YogaDemoBeispielId } from '../config/yogaDemoBeispiele'

type Props = {
  active: YogaDemoBeispielId
  hint?: string
  className?: string
}

const ABSOLVENT_IDS: YogaDemoBeispielId[] = ['auftritt', 'absolvent']

/**
 * Feste Leiste: Akademie-Farben oder Absolvent-Farblinie – je nach aktiver Seite.
 */
export default function YogaDemoNav({ active, hint, className = 'yoga-demo-nav' }: Props) {
  const absolventAktiv = ABSOLVENT_IDS.includes(active)
  const m = absolventAktiv ? YOGA_ABSOLVENT_MARKE : YOGA_MARKE
  const accent = absolventAktiv ? YOGA_ABSOLVENT_MARKE.teal : YOGA_MARKE.gold
  const accentSoft = absolventAktiv ? YOGA_ABSOLVENT_MARKE.tealSoft : YOGA_MARKE.goldSoft
  const ink = absolventAktiv ? YOGA_ABSOLVENT_MARKE.ink : YOGA_MARKE.violett
  const items = getYogaDemoBeispiele()

  return (
    <div
      className={className}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#fff',
        borderBottom: `2px solid ${accentSoft}`,
        padding: '0.55rem 0.85rem',
        fontFamily: m.font,
      }}
    >
      <link rel="stylesheet" href={absolventAktiv ? YOGA_ABSOLVENT_FONT_HREF : YOGA_FONT_HREF} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', maxWidth: 960, margin: '0 auto' }}>
        {!absolventAktiv ? (
          <img src={YOGA_MARKE.logo} alt="" width={40} height={26} style={{ objectFit: 'contain', flexShrink: 0 }} />
        ) : (
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: accentSoft,
              border: `1px solid ${accent}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
            aria-hidden
          >
            🧘
          </span>
        )}
        {items.map((b) => {
          const on = b.id === active
          const itemAbsolvent = ABSOLVENT_IDS.includes(b.id)
          const chipAccent = itemAbsolvent ? YOGA_ABSOLVENT_MARKE.teal : YOGA_MARKE.gold
          const chipSoft = itemAbsolvent ? YOGA_ABSOLVENT_MARKE.tealSoft : YOGA_MARKE.goldSoft
          const chipInk = itemAbsolvent ? YOGA_ABSOLVENT_MARKE.ink : YOGA_MARKE.violett
          return (
            <Link
              key={b.id}
              to={b.path}
              style={{
                padding: '0.35rem 0.7rem',
                borderRadius: 999,
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: on ? 700 : 600,
                background: on ? chipSoft : m.bgCard,
                color: chipInk,
                border: on ? `1px solid ${chipAccent}` : `1px solid ${chipAccent}33`,
                whiteSpace: 'nowrap',
              }}
            >
              {b.label}
            </Link>
          )
        })}
      </div>
      {hint ? (
        <p
          style={{
            margin: '0.4rem auto 0',
            maxWidth: 960,
            fontSize: '0.75rem',
            color: m.muted,
            lineHeight: 1.35,
          }}
        >
          {hint}
          {absolventAktiv ? ' · Farblinie Absolvent:in (Petrol)' : ' · Farblinie Akademie (Gold/Violett)'}
        </p>
      ) : null}
    </div>
  )
}
