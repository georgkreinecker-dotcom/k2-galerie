/**
 * ök2: Vertrauens-Banner für Ads-Besucher (Demo ≠ echte Galerie, Software von kgm solution).
 */
import { Link } from 'react-router-dom'
import {
  OEK2_ADS_BANNER_BODY,
  OEK2_ADS_BANNER_TITLE,
  OEK2_AGB_PATH,
  OEK2_LIZENZ_KAUFEN_PATH,
  OEK2_LIZENZ_PREISE_PATH,
} from '../config/oek2AdsTransparency'

type Props = {
  /** Auf dunklem Galerie-Hintergrund (Willkommen) – heller Kasten für Lesbarkeit. */
  onDarkBackground?: boolean
}

export default function Oek2AdsTransparencyBanner({ onDarkBackground = false }: Props) {
  const bg = onDarkBackground ? 'rgba(255, 254, 251, 0.96)' : '#fff8f0'
  const border = '#b54a1e'
  const text = '#1c1a18'
  const muted = '#5c5650'
  const link = '#b54a1e'

  return (
    <div
      role="note"
      aria-label="Hinweis: Muster-Demo Galerie-Software"
      style={{
        margin: '0 auto',
        maxWidth: '42rem',
        padding: '0.65rem 0.85rem',
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: 12,
        boxShadow: onDarkBackground ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 8px rgba(181,74,30,0.12)',
        color: text,
        fontSize: 'clamp(0.82rem, 2vw, 0.92rem)',
        lineHeight: 1.45,
        textAlign: 'center',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: border }}>
        {OEK2_ADS_BANNER_TITLE}
      </div>
      <p style={{ margin: '0 0 0.45rem', color: muted }}>{OEK2_ADS_BANNER_BODY}</p>
      <p style={{ margin: 0, fontSize: '0.85em' }}>
        <Link to={OEK2_LIZENZ_PREISE_PATH} style={{ color: link, fontWeight: 600 }}>
          Preise
        </Link>
        {' · '}
        <Link to={OEK2_LIZENZ_KAUFEN_PATH} style={{ color: link, fontWeight: 600 }}>
          Lizenz kaufen
        </Link>
        {' · '}
        <Link to={OEK2_AGB_PATH} style={{ color: link, fontWeight: 600 }}>
          AGB
        </Link>
      </p>
    </div>
  )
}
