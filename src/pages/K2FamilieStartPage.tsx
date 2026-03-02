/**
 * K2 Familie – Projekt-Start. Vision, Roadmap, Raumschiff.
 * Route: /projects/k2-familie
 */

import { Link } from 'react-router-dom'
import { PROJECT_ROUTES, PLATFORM_ROUTES } from '../config/navigation'

export default function K2FamilieStartPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--k2-bg-1, #1a0f0a)', color: 'var(--k2-text, #fff5f0)', padding: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: 720, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={PLATFORM_ROUTES.projects} style={{ color: '#5ffbf1', textDecoration: 'none', fontSize: '0.95rem' }}>
          ← Projekte
        </Link>
      </div>

      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: '0 0 0.5rem', color: '#5ffbf1' }}>
        K2 Familie
      </h1>
      <p style={{ margin: '0 0 1.5rem', fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
        Zusammenleben sichtbar machen – jede Form von Familie, wechselnde Partnerschaften, Freud, Leid und Alltag. Basis: K2-Struktur, tenantfähig.
      </p>

      <div style={{ padding: '1.25rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 12, marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem', color: '#5ffbf1' }}>Leitbild</h2>
        <p style={{ margin: 0, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
          Wir sind eine offene Gesellschaft – nicht Mittelalter. Jede Art des Zusammenlebens ist Familie und soll abgebildet werden können: wechselnde Partnerschaften, Schicksalsschläge und freudige Ereignisse, die wir gemeinsam erleben, und der ganz normale Alltag. All das bekommt hier seinen Platz. Keine Ausgrenzung – in keiner Form. Religion und Politik haben hier nichts zu suchen. Jeder respektiert den anderen so, wie er ist.
        </p>
      </div>

      <div style={{ padding: '1.25rem', background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: 12, marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem', color: '#5ffbf1' }}>Vision</h2>
        <p style={{ margin: 0, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
          Jede Form des Zusammenlebens = ein Mandant. Jede Person = eine Seite (Foto, Text, Momente). Beziehungen = der Baum. Modern, app-tauglich, für jede Konstellation.
        </p>
      </div>

      <div style={{ padding: '1.25rem', background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.4)', borderRadius: 12, marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem', color: '#0d9488' }}>Raumschiff</h2>
        <p style={{ margin: '0 0 1rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
          Roadmap und Phasen (Fundament → Stammbaum & Personen-Seite → Momente & Events → Skalierung) stehen in der Doku. Vom Sportwagen zum Raumschiff – wir heben ab.
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>Nächste Schritte:</strong> Datenmodell Person + Beziehungen festlegen → erste UI (Stammbaum, Personen-Seite).
        </p>
      </div>

      <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
        Roadmap & Phasen: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>docs/K2-FAMILIE-ROADMAP.md</code> (im Repo).
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to={PROJECT_ROUTES['k2-familie'].stammbaum}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(13,148,136,0.25)',
            color: '#14b8a6',
            border: '1px solid rgba(13,148,136,0.5)',
            borderRadius: 10,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '1rem',
          }}
        >
          → Stammbaum öffnen
        </Link>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].plan}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'rgba(255,255,255,0.1)',
            color: '#5ffbf1',
            border: '1px solid rgba(95,251,241,0.4)',
            borderRadius: 10,
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '1rem',
          }}
        >
          K2 Galerie Plan
        </Link>
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
        Die Grundbotschaft prägt Form der App, Sprache und jede zukünftige KI-Kommunikation. Moralisches Fundament: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>docs/K2-FAMILIE-GRUNDBOTSCHAFT.md</code>
      </p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
        Projekt gestartet 01.03.26 – Let&apos;s go.
      </p>
    </div>
  )
}
