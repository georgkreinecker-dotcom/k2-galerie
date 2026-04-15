/**
 * K2 Familie – Lizenz beenden / Abo verwalten (Stripe, eigener Einstieg ohne Galerie-Verweis).
 * Route: /projects/k2-familie/lizenz-kuendigen
 */
import { Link } from 'react-router-dom'
import '../App.css'
import { AGB_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { WERBEUNTERLAGEN_STIL, PROMO_FONTS_URL } from '../config/marketingWerbelinie'
import { adminTheme } from '../config/theme'

const R = PROJECT_ROUTES['k2-familie']

/** Stripe: Kundenlogin – E-Mail eingeben, Link zur Abo-Verwaltung erhalten */
const STRIPE_BILLING_LOGIN = 'https://billing.stripe.com/p/login'

export default function K2FamilieLizenzKuendigenPage() {
  const a = adminTheme
  const accent = '#b54a1e'
  const accentSoft = '#d4622a'
  const bgPage = '#f6f4f0'
  const bgCard = '#fffefb'
  const text = '#1c1a18'
  const muted = '#5c5650'

  return (
    <div style={{ background: bgPage, minHeight: '100vh', fontFamily: a.fontBody, color: text }}>
      <link rel="stylesheet" href={PROMO_FONTS_URL} />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 2.5rem) 1rem' }}>
        <h1
          style={{
            fontFamily: WERBEUNTERLAGEN_STIL.fontHeading,
            fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)',
            fontWeight: 700,
            color: text,
            marginBottom: '0.35rem',
          }}
        >
          K2 Familie – Lizenz beenden
        </h1>
        <p style={{ color: muted, fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: 1.55 }}>
          Hier geht es nur um <strong>K2 Familie</strong>. <strong>Monatslizenz</strong> = laufendes Abo über Stripe – Kündigung oder Zahlungsmittel ändern dort.{' '}
          <strong>Jahreslizenz</strong> = einmalige Zahlung für ein Jahr; in der App läuft kein automatisches Abo weiter.
        </p>

        <div
          style={{
            marginBottom: '1.25rem',
            padding: '1rem 1.15rem',
            background: bgCard,
            border: `1px solid rgba(181,74,30,0.25)`,
            borderRadius: 16,
          }}
        >
          <p style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', lineHeight: 1.55 }}>
            <strong style={{ color: accent }}>Monatslizenz</strong> – Abo verwalten oder kündigen:
          </p>
          <a
            href={STRIPE_BILLING_LOGIN}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box',
              padding: '0.95rem 1rem',
              background: `linear-gradient(135deg, ${accentSoft} 0%, ${accent} 100%)`,
              color: '#fff',
              borderRadius: 10,
              fontWeight: 700,
              fontFamily: a.fontBody,
              fontSize: '1.02rem',
              textDecoration: 'none',
            }}
          >
            → Stripe: Abo verwalten / kündigen
          </a>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: muted, lineHeight: 1.5 }}>
            Sie öffnen die <strong>Stripe-Kundenanmeldung</strong>. Dort dieselbe E-Mail nutzen wie beim Kauf; Stripe sendet einen sicheren Link zur Verwaltung Ihres Abos.
          </p>
        </div>

        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            background: 'rgba(30, 41, 59, 0.06)',
            border: '1px solid rgba(30, 41, 59, 0.12)',
            borderRadius: 12,
            fontSize: '0.88rem',
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: text }}>Jahreslizenz</strong>
          <p style={{ margin: '0.4rem 0 0' }}>
            Einmalzahlung – kein laufendes Abo in der App. Fragen zur Laufzeit oder Verlängerung: siehe{' '}
            <Link to={AGB_ROUTE} style={{ color: accent, fontWeight: 600 }}>
              AGB
            </Link>
            .
          </p>
        </div>

        <div
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            background: 'rgba(185, 28, 28, 0.06)',
            border: '1px solid rgba(185, 28, 28, 0.15)',
            borderRadius: 12,
            fontSize: '0.88rem',
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: text }}>Vor dem Ende</strong>
          <p style={{ margin: '0.4rem 0 0' }}>
            <strong>Sicherung</strong> anlegen, damit Ihre Daten bei Ihnen bleiben:{' '}
            <Link to={R.sicherung} style={{ color: accent, fontWeight: 600 }}>
              → Sicherung
            </Link>
          </p>
        </div>

        <p style={{ fontSize: '0.85rem', color: muted, marginTop: '1.25rem', lineHeight: 1.55 }}>
          <Link to={R.einstellungen} style={{ color: accent, fontWeight: 600 }}>
            ← Einstellungen
          </Link>
          {' · '}
          <Link to={R.lizenzErwerben} style={{ color: accent, fontWeight: 600 }}>
            Lizenz erwerben
          </Link>
        </p>

        <footer
          style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(181,74,30,0.2)',
            fontSize: '0.72rem',
            color: muted,
            lineHeight: 1.5,
          }}
        >
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div style={{ marginTop: '0.35rem' }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </main>
    </div>
  )
}
