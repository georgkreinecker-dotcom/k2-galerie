/**
 * K2 Familie – Präsentationsmappe (Einstieg).
 * Inhalt und PDFs: public/k2-familie-praesentation/ – eigenständig zur Galerie-Präsentationsmappe.
 */

import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

const ACCENT = '#0d9488'
const ACCENT_DARK = '#0f766e'

export default function K2FamiliePraesentationsmappePage() {
  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem 1rem 3rem', color: '#1c1a18', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @media print {
          .k2fam-pm-no-print { display: none !important; }
          .k2fam-pm-wrap { padding: 0 !important; }
        }
      `}</style>

      <nav className="k2fam-pm-no-print" style={{ marginBottom: '1.25rem' }}>
        <Link to={PROJECT_ROUTES['k2-familie'].meineFamilie} style={{ color: ACCENT, textDecoration: 'none', fontWeight: 600 }}>
          ← Zurück zu K2 Familie
        </Link>
      </nav>

      <header style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT_DARK} 0%, ${ACCENT} 100%)`, color: '#fff' }}>
        <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700 }}>Präsentationsmappe K2 Familie</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', opacity: 0.95, lineHeight: 1.45 }}>
          Eigenständiger Bereich für Werbemittel und Vertriebsunterlagen – getrennt von der K2-Galerie-Präsentationsmappe.
        </p>
      </header>

      <section style={{ background: '#fffefb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.15rem', color: ACCENT_DARK }}>Ablage im Projekt</h2>
        <p style={{ margin: '0 0 0.75rem', lineHeight: 1.65 }}>
          Unter <code style={{ background: '#f3f4f6', padding: '0.15rem 0.4rem', borderRadius: 4 }}>public/k2-familie-praesentation/</code> liegen README und künftig PDFs, Texte und Bilder nur für K2 Familie.
        </p>
        <p style={{ margin: 0, lineHeight: 1.65 }}>
          <strong>Nächster Schritt:</strong> Inhalte einfügen und diese Seite Schritt für Schritt mit Kacheln, Druck und ggf. QR ergänzen – analog zum bewährten Muster der Galerie-Präsentationsmappe, aber nur Familie.
        </p>
      </section>

      <section className="k2fam-pm-no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '0.55rem 1.1rem',
            background: ACCENT_DARK,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          🖨️ Seite drucken
        </button>
        <Link
          to={PROJECT_ROUTES['k2-familie'].benutzerHandbuch}
          style={{
            padding: '0.55rem 1.1rem',
            background: '#f3f4f6',
            color: '#1c1a18',
            border: `1px solid ${ACCENT}`,
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          📖 Benutzerhandbuch K2 Familie
        </Link>
      </section>

      <footer style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e7eb', fontSize: '0.82rem', color: '#5c5650', lineHeight: 1.5 }}>
        <p style={{ margin: '0 0 0.35rem' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
        <p style={{ margin: 0 }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
      </footer>
    </div>
  )
}
