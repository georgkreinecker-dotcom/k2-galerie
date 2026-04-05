/**
 * Promo-Video-Produktion – APf-Werkzeug (nur localhost / ?apf=1 / ?dev=1).
 * Kein Player in der öffentlichen Galerie-App: hier Datenquelle, Arbeitsablauf, fertiges Produkt
 * (z. B. YouTube) in Stammdaten eintragen – neutrale Stimme, nicht die Stimme des Galeristen.
 */

import { Link, Navigate } from 'react-router-dom'
import {
  ENTDECKEN_ROUTE,
  K2_GALERIE_APF_EINSTIEG,
  PROJECT_ROUTES,
  shouldShowK2GalerieApfProjectHub,
} from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

export default function PromoVideoProduktionPage() {
  if (!shouldShowK2GalerieApfProjectHub()) {
    return <Navigate to={ENTDECKEN_ROUTE} replace />
  }

  const mappe = PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion
  const adminOek2Stammdaten = '/admin?context=oeffentlich&tab=einstellungen'

  return (
    <article
      style={{
        maxWidth: '820px',
        margin: 0,
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        background: 'var(--k2-bg-1, #1a0f0a)',
        color: 'var(--k2-text, #fff5f0)',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(95,251,241,0.25)' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#5ffbf1' }}>Promo-Video-Produktion</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>
          Eigener Arbeitsplatz auf der APf – nicht in der Besucher-App eingebunden. Hier: Inhalte und
          Ablauf; das fertige Video verlinkst du in den Stammdaten (ök2), nicht hier.
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
          <Link to={K2_GALERIE_APF_EINSTIEG} style={{ color: '#5ffbf1', textDecoration: 'none' }}>
            ← Projekt-Start
          </Link>
          {' · '}
          <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} style={{ color: '#5ffbf1', textDecoration: 'none' }}>
            ← Marketing ök2 (mök2)
          </Link>
        </p>
      </header>

      <section style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#fde68a', margin: '0 0 0.5rem' }}>Stimme &amp; Rolle</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6, fontSize: '0.92rem' }}>
          <li>
            <strong>Neutrale Stimme</strong> für Sprecher/TTS – nicht die persönliche Stimme der Galerie.
          </li>
          <li>
            Diese Seite ist nur <strong>Arbeits- und Orientierungsort</strong> (Daten holen, Skript/Story,
            Export); kein eingebetteter Player für die öffentliche Galerie.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#fde68a', margin: '0 0 0.5rem' }}>Datenquelle</h2>
        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.55, fontSize: '0.92rem' }}>
          Inhaltliche Basis: <strong>Präsentationsmappe Vollversion</strong> (Markdown unter{' '}
          <code style={{ fontSize: '0.85em' }}>public/praesentationsmappe-vollversion/</code>).
        </p>
        <p style={{ margin: 0 }}>
          <Link to={mappe} style={{ color: '#5ffbf1', fontWeight: 600 }}>
            → Präsentationsmappe Vollversion öffnen
          </Link>
        </p>
      </section>

      <section style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', color: '#fde68a', margin: '0 0 0.5rem' }}>Fertiges Produkt einspielen</h2>
        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.55, fontSize: '0.92rem' }}>
          Wenn das Video (z. B. bei YouTube) steht: <strong>Link in den Stammdaten der ök2-Demo</strong> pflegen
          – eine Quelle für Außenkommunikation und Galerie (YouTube / Instagram / Highlight-Video).
        </p>
        <p style={{ margin: 0 }}>
          <Link to={adminOek2Stammdaten} style={{ color: '#5ffbf1', fontWeight: 600 }}>
            → Admin → Einstellungen (Kontext ök2)
          </Link>
        </p>
      </section>

      <section
        style={{
          marginBottom: '2rem',
          padding: '1rem 1.1rem',
          background: 'rgba(95,251,241,0.07)',
          borderRadius: '12px',
          border: '1px solid rgba(95,251,241,0.22)',
        }}
      >
        <h2 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '0 0 0.5rem' }}>Ablauf (Orientierung)</h2>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.65, fontSize: '0.88rem' }}>
          <li>Texte und Kernaussagen aus der Mappe übernehmen.</li>
          <li>Storyboard / Kapitel mit neutraler Stimme vorschlagen (TTS oder Sprecher:in).</li>
          <li>Video exportieren, auf YouTube hochladen (oder vergleichbar).</li>
          <li>Öffentlichen Link in Stammdaten ök2 eintragen – Besucher sehen ihn in der Galerie-App.</li>
        </ol>
      </section>

      <footer style={{ marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.12)', fontSize: '0.75rem', color: 'rgba(255,245,240,0.65)', lineHeight: 1.5 }}>
        <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
        <div style={{ marginTop: '0.25rem' }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
      </footer>
    </article>
  )
}
