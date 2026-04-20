import { useNavigate } from 'react-router-dom'
import { ENTDECKEN_ROUTE, K2_FAMILIE_WILLKOMMEN_ROUTE } from '../config/navigation'

export type AppVerlassenZiel = 'entdecken' | 'familie-willkommen'

type Props = {
  ziel: AppVerlassenZiel
  accentColor: string
  mutedColor: string
  className?: string
}

/**
 * Ein Standard: Besucher verlassen die Galerie-/Produkt-Ansicht zur Eingangsseite (relativ, kein Link nach außen).
 * K2 Familie: Ziel Willkommen statt Entdecken.
 */
export function AppVerlassenFooterLink({ ziel, accentColor, mutedColor, className }: Props) {
  const navigate = useNavigate()
  const path = ziel === 'entdecken' ? ENTDECKEN_ROUTE : K2_FAMILIE_WILLKOMMEN_ROUTE

  return (
    <div className={className} style={{ marginTop: '0.75rem', textAlign: 'center' }}>
      <button
        type="button"
        onClick={() => navigate(path)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          font: 'inherit',
          fontSize: 'clamp(0.78rem, 1.6vw, 0.88rem)',
          color: accentColor,
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
        }}
      >
        App verlassen · zur Eingangsseite
      </button>
      <p
        style={{
          margin: '0.4rem 0 0',
          fontSize: 'clamp(0.68rem, 1.4vw, 0.78rem)',
          color: mutedColor,
          lineHeight: 1.4,
          opacity: 0.92,
          maxWidth: '28rem',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Installierte App: über den System-App-Umschalter schließen oder den Tab schließen.
      </p>
    </div>
  )
}
