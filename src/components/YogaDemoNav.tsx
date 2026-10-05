import { Link } from 'react-router-dom'
import { YOGA_FONT_HREF, YOGA_MARKE } from '../config/yogaAkademieMarke'
import { getYogaDemoBeispiele, type YogaDemoBeispielId } from '../config/yogaDemoBeispiele'

type Props = {
  /** Aktuelles Beispiel – wird hervorgehoben */
  active: YogaDemoBeispielId
  /** Zusatztext rechts / darunter */
  hint?: string
  /** className für Druck ausblenden */
  className?: string
}

/**
 * Feste Leiste: alle Anschau-Beispiele bleiben sichtbar, egal welche Seite offen ist.
 */
export default function YogaDemoNav({ active, hint, className = 'yoga-demo-nav' }: Props) {
  const m = YOGA_MARKE
  const items = getYogaDemoBeispiele()

  return (
    <div
      className={className}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: '#fff',
        borderBottom: `2px solid ${m.goldSoft}`,
        padding: '0.55rem 0.85rem',
        fontFamily: m.font,
      }}
    >
      <link rel="stylesheet" href={YOGA_FONT_HREF} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', maxWidth: 960, margin: '0 auto' }}>
        <img src={m.logo} alt="" width={40} height={26} style={{ objectFit: 'contain', flexShrink: 0 }} />
        {items.map((b) => {
          const on = b.id === active
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
                background: on ? m.goldSoft : m.bgCard,
                color: m.violett,
                border: on ? `1px solid ${m.gold}` : `1px solid ${m.gold}33`,
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
        </p>
      ) : null}
    </div>
  )
}
