type Props = {
  accentColor: string
  mutedColor: string
  className?: string
}

/** Leere Seite im aktuellen Tab – keine K2-/Produkt-Route. */
function navigateToNeutralUserPage(): void {
  try {
    window.location.replace('about:blank')
  } catch {
    window.location.href = 'about:blank'
  }
}

/**
 * Besucher verlassen die Galerie-Ansicht: **neutrale leere Seite** (`about:blank`), keine K2-Eingangsseite.
 * Relativ zur App: kein Link zu einer anderen Produkt-URL.
 */
export function AppVerlassenFooterLink({ accentColor, mutedColor, className }: Props) {
  return (
    <div className={className} style={{ marginTop: '0.75rem', textAlign: 'center' }}>
      <button
        type="button"
        onClick={() => navigateToNeutralUserPage()}
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
        App verlassen
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
        Es öffnet sich eine leere Seite – den Tab können Sie schließen. Installierte App: über den System-App-Umschalter beenden oder Tab schließen.
      </p>
    </div>
  )
}
