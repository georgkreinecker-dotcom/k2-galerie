/**
 * Ein Standard: Zeitplan (01. Mai), Pilot-Ablauf, Stripe-Test – überall gleich lesbar.
 */
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

export type LizenzZeitplanVariant = 'board' | 'licences' | 'kaufen'

interface Props {
  variant: LizenzZeitplanVariant
}

export default function LizenzZeitplanPilotStripeInfo({ variant }: Props) {
  const lizenzKaufenPath = PROJECT_ROUTES['k2-galerie'].lizenzKaufen
  const licencesPath = PROJECT_ROUTES['k2-galerie'].licences

  if (variant === 'board') {
    return (
      <section
        aria-label="Zeitplan Lizenzen, Pilot, Stripe-Test"
        style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.15rem',
          borderRadius: '12px',
          border: '2px solid rgba(251,191,36,0.55)',
          background: 'linear-gradient(135deg, rgba(254,243,199,0.12) 0%, rgba(245,158,11,0.08) 100%)',
          color: '#fef9c3',
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fde68a', marginBottom: '0.35rem' }}>
          Lizenzen – Zeitplan &amp; Test
        </div>
        <div style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '0.5rem' }}>
          01. Mai – regulärer Start
        </div>
        <p style={{ margin: '0 0 0.65rem', fontSize: '0.92rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.92)' }}>
          Ab <strong style={{ color: '#fff' }}>1. Mai</strong> ist die <strong style={{ color: '#fff' }}>öffentliche</strong> Lizenzanmeldung der Standard (nicht „1.5“ – gemeint ist der <strong style={{ color: '#fff' }}>erste Mai</strong>).
        </p>
        <ol style={{ margin: '0 0 0.65rem', paddingLeft: '1.2rem', fontSize: '0.88rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
          <li><strong style={{ color: '#fde68a' }}>Pilot:</strong> Einladung durch uns</li>
          <li>Vereinbarung (Testphase)</li>
          <li>Zugang – u. a. <strong style={{ color: '#fde68a' }}>Lizenz kaufen</strong> / Stripe nach Freigabe</li>
        </ol>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>
          <strong style={{ color: '#a7f3d0' }}>Stripe testen:</strong> Checkout starten, bei der Karte{' '}
          <code style={{ background: 'rgba(0,0,0,0.25)', padding: '0.1rem 0.35rem', borderRadius: 4, fontSize: '0.82rem' }}>4242 4242 4242 4242</code>
          {' '}– nur im <strong>Testmodus</strong> (lokal <code style={{ fontSize: '0.78rem' }}>sk_test_…</code> in der Umgebung).
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
          <Link
            to={lizenzKaufenPath}
            style={{
              display: 'inline-block',
              padding: '0.45rem 0.9rem',
              borderRadius: 8,
              background: '#f59e0b',
              color: '#1c0a00',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            → Lizenz auswählen &amp; bezahlen
          </Link>
          <Link to={licencesPath} style={{ color: '#a7f3d0', fontSize: '0.88rem', fontWeight: 600 }}>
            Lizenzen-Übersicht
          </Link>
        </div>
      </section>
    )
  }

  if (variant === 'licences') {
    return (
      <section
        aria-label="Zeitplan Lizenzen, Pilot, Stripe-Test"
        style={{
          background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '1rem 1.1rem',
          marginBottom: '1rem',
          color: '#1c1a18',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#92400e', marginBottom: '0.25rem' }}>
          Zeitplan · Pilot · Stripe-Test
        </div>
        <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.65rem)', fontWeight: 800, color: '#78350f', lineHeight: 1.2, marginBottom: '0.45rem' }}>
          01. Mai – öffentlicher regulärer Lizenzstart
        </div>
        <p style={{ margin: '0 0 0.55rem', fontSize: '0.9rem', lineHeight: 1.55, color: '#292524' }}>
          <strong style={{ color: '#78350f' }}>Regulär ab 01.05.</strong> (= <strong>1. Mai</strong>, Kalender Tag.Monat) – öffentlicher Standardstart. Bis dahin kein allgemeiner Selbstservice für alle. Wer „<strong>ab 1.05</strong>“ sucht: dasselbe Datum. Nicht „1.5“ als Dezimalzahl verwechseln.
        </p>
        <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Pilot-Zugang (kurz)</div>
        <ol style={{ margin: '0 0 0.6rem', paddingLeft: '1.2rem', fontSize: '0.88rem', lineHeight: 1.55, color: '#1c1917' }}>
          <li>Einladung und Absprache mit uns</li>
          <li>Vereinbarung (Testphase)</li>
          <li>Zugang; Online-Zahlung nach Freigabe – z. B. über{' '}
            <Link to={lizenzKaufenPath} style={{ color: '#b45309', fontWeight: 700 }}>Lizenz kaufen</Link>
          </li>
        </ol>
        <div style={{ fontSize: '0.86rem', lineHeight: 1.5, color: '#44403c', paddingTop: '0.5rem', borderTop: '1px solid rgba(180,83,9,0.35)' }}>
          <strong style={{ color: '#92400e' }}>Zahlung testen (Stripe):</strong> Testkarte{' '}
          <code style={{ background: 'rgba(255,255,255,0.85)', padding: '0.12rem 0.35rem', borderRadius: 4 }}>4242 4242 4242 4242</code>
          {' '}– nur wenn der Server im <strong>Testmodus</strong> läuft (<code style={{ fontSize: '0.8rem' }}>sk_test_…</code>). Details: Doku „STRIPE-TEST“ im Projekt.
        </div>
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.86rem', lineHeight: 1.5, color: '#57534e' }}>
          <strong style={{ color: '#92400e' }}>Testpilot:in per E-Mail einladen:</strong> Formular weiter unten auf{' '}
          <strong>dieser</strong> Seite (Abschnitt „✉️ Testpilot:in per E-Mail einladen“) – nach den Lizenzstufen-Karten.
        </p>
      </section>
    )
  }

  // kaufen
  return (
    <section
      aria-label="Zeitplan, Pilot, Stripe-Test"
      style={{
        background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
        border: '2px solid #f59e0b',
        borderRadius: '12px',
        padding: '1rem 1.1rem',
        marginBottom: '1.25rem',
        color: '#1c1a18',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ fontSize: 'clamp(1.15rem, 2.8vw, 1.45rem)', fontWeight: 800, color: '#78350f', marginBottom: '0.4rem' }}>
        01. Mai – regulärer öffentlicher Start
      </div>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', lineHeight: 1.5, color: '#292524' }}>
        Technisch kannst du diese Seite schon nutzen. Vor dem <strong>1. Mai</strong> richtet sich der Ablauf an <strong>Testpilot:innen nach Einladung</strong> – nicht am allgemeinen Start für alle.
      </p>
      <p style={{ margin: '0 0 0.45rem', fontSize: '0.88rem', lineHeight: 1.5, color: '#44403c' }}>
        <strong style={{ color: '#92400e' }}>Pilot:</strong> Einladung → Vereinbarung → Zugang (dann u. a. hier bezahlen).
      </p>
      <p style={{ margin: 0, fontSize: '0.86rem', lineHeight: 1.5, color: '#57534e' }}>
        <strong style={{ color: '#92400e' }}>Stripe testen:</strong> Nach „Weiter zur Zahlung“ bei der Karte{' '}
        <code style={{ background: 'rgba(255,255,255,0.9)', padding: '0.1rem 0.35rem', borderRadius: 4 }}>4242 4242 4242 4242</code>
        {' '}eintragen (nur Testmodus).
      </p>
      <p style={{ margin: '0.75rem 0 0', fontSize: '0.88rem', lineHeight: 1.55, color: '#292524', paddingTop: '0.5rem', borderTop: '1px solid rgba(180,83,9,0.35)' }}>
        <strong style={{ color: '#92400e' }}>Testpilot:in per E-Mail einladen:</strong> steht nicht hier, sondern auf der Seite{' '}
        <Link to={`${licencesPath}#testpilot-einladen`} style={{ color: '#b45309', fontWeight: 700 }}>
          Lizenzen
        </Link>
        {' '}(oben in mök2 gleicher gelber Kasten – darunter scrollen zum Formular).
      </p>
    </section>
  )
}
