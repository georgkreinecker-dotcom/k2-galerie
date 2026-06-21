/**
 * K2 echte Galerie: Sommerpause auf der Willkommensseite (nur wenn isK2SommerpauseActive).
 */
import {
  K2_SOMMERPAUSE_BANNER_TITLE,
  getK2SommerpauseBannerBody,
  getK2SommerpausePhone,
} from '../config/k2GalerieSommerpause'

type Props = {
  phone?: string
  /** Willkommensbild-Hero = dunkler Bereich darunter → heller Kasten. */
  onDarkBackground?: boolean
}

export default function K2GalerieSommerpauseBanner({ phone, onDarkBackground = false }: Props) {
  const tel = getK2SommerpausePhone(phone)
  const telHref = tel.replace(/\s+/g, '')

  return (
    <div
      role="note"
      aria-label="Hinweis Sommerpause K2 Galerie"
      style={{
        margin: '0 auto',
        maxWidth: '42rem',
        padding: '0.75rem 1rem',
        background: onDarkBackground ? 'rgba(255, 254, 251, 0.97)' : '#fff8f0',
        border: '2px solid #b54a1e',
        borderRadius: 12,
        boxShadow: onDarkBackground ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 10px rgba(181,74,30,0.15)',
        color: '#1c1a18',
        fontSize: 'clamp(0.88rem, 2.2vw, 1rem)',
        lineHeight: 1.45,
        textAlign: 'center',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '1.05em', marginBottom: '0.35rem', color: '#b54a1e' }}>
        {K2_SOMMERPAUSE_BANNER_TITLE}
      </div>
      <p style={{ margin: '0 0 0.5rem', color: '#5c5650' }}>{getK2SommerpauseBannerBody()}</p>
      {tel ? (
        <p style={{ margin: 0, fontWeight: 600, color: '#1c1a18' }}>
          Telefon{' '}
          <a href={`tel:${telHref}`} style={{ color: '#b54a1e', textDecoration: 'none' }}>
            {tel}
          </a>
        </p>
      ) : null}
    </div>
  )
}
