/**
 * K2 Markt – Homepage / Arbeitsoberfläche (Dashboard-Stil).
 * Eigenständiges Projekt; Datenquelle ök2. Von Beginn an so definiert.
 * "Was möchtest du heute tun?" – ein Klick pro Bereich.
 */

import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

const cards: Array<{
  title: string
  subtitle: string
  to: string
  accent?: boolean
  icon?: string
}> = [
  {
    title: 'Mappe',
    subtitle: 'Vision, Handbuch, K2 Markt-Material – alles für Ideen & Linie.',
    to: PROJECT_ROUTES['k2-markt'].mappe,
    accent: true,
    icon: '📁',
  },
  {
    title: 'Zum Tor',
    subtitle: 'Entwurf prüfen, DoD prüfen, freigeben – heute auf den Markt.',
    to: PROJECT_ROUTES['k2-markt'].tor,
    icon: '🚦',
  },
  {
    title: 'Studio',
    subtitle: 'Design, Bildverarbeitung – fehlende Bilder, Texte, Willkommensbild (ök2).',
    to: '/admin?context=oeffentlich',
    icon: '🖌️',
  },
  {
    title: 'mök2',
    subtitle: 'USPs, Botschaft, Lizenzen – Vertrieb ök2.',
    to: PROJECT_ROUTES['k2-galerie'].marketingOek2,
    icon: '📢',
  },
  {
    title: 'Kampagne',
    subtitle: 'Marketing-Strategie – Kampagne planen.',
    to: PROJECT_ROUTES['k2-galerie'].kampagneMarketingStrategie,
    icon: '📋',
  },
  {
    title: 'K2 Galerie',
    subtitle: 'Zurück zur Galerie-Projektübersicht.',
    to: PROJECT_ROUTES['k2-galerie'].home,
    icon: '🏠',
  },
]

export default function K2MarktOberflaechePage() {
  return (
    <div className="mission-wrapper" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 35%, #0f172a 100%)' }}>
      <div className="viewport" style={{ padding: '2rem 1.5rem', maxWidth: 900, margin: '0 auto' }}>
        {/* Nav – minimal */}
        <nav className="no-print" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', fontSize: '0.9rem' }}>
          <Link to={PROJECT_ROUTES['k2-galerie'].home} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← K2 Galerie</Link>
          <Link to={PROJECT_ROUTES['k2-markt'].mappe} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Mappe</Link>
          <Link to={PROJECT_ROUTES['k2-markt'].tor} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Zum Tor</Link>
        </nav>

        {/* Vision: So soll die neue Schicht aussehen – und so funktioniert sie schon */}
        <section style={{
          marginBottom: '2rem',
          padding: '1rem 0',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <h2 style={{
            margin: '0 0 0.75rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#5eead4',
            letterSpacing: '-0.01em',
          }}>
            Vision: Die nächste Generation – so soll die neue Schicht aussehen
          </h2>
          <Link to={PROJECT_ROUTES['k2-markt'].schicht} style={{ display: 'block' }}>
            <img
              src="/k2-markt/img/k2-markt-zukunftsoberflaeche.png"
              alt="Vision: Kreativ-Schicht – Quellen, KI/Agenten, Ausgabe, Tor"
              style={{
                width: '100%',
                maxWidth: 720,
                height: 'auto',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'block',
              }}
            />
          </Link>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            Quellen → KI/Agenten (etwas Neues erzeugen) → Ausgabe → Tor. Genau dort arbeiten wir hin.
          </p>
          <Link
            to={PROJECT_ROUTES['k2-markt'].schicht}
            style={{
              display: 'inline-block',
              marginTop: '0.75rem',
              padding: '0.6rem 1.2rem',
              background: 'rgba(20, 184, 166, 0.25)',
              color: '#5eead4',
              border: '1px solid rgba(20, 184, 166, 0.4)',
              borderRadius: 10,
              fontSize: '0.95rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            → So funktioniert die neue Schicht (öffnen)
          </Link>
        </section>

        {/* Zentrale Frage – wie Dashboard */}
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(1.6rem, 4vw, 2rem)',
            fontWeight: 700,
            color: '#f0fdfa',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Was möchtest du heute tun?
          </h1>
          <p style={{
            margin: '0.5rem 0 0',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.5,
          }}>
            Ein Klick – du bist im Bereich. Das sind alle Bereiche der Kreativwerkstatt.
          </p>
        </header>

        {/* Aktionskarten – 2x3 Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.25rem',
        }}>
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              style={{
                display: 'block',
                padding: '1.35rem 1.25rem',
                background: card.accent
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.18) 0%, rgba(20, 184, 166, 0.1) 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${card.accent ? 'rgba(34, 197, 94, 0.35)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 14,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s, background 0.15s',
                boxShadow: card.accent ? '0 4px 20px rgba(0,0,0,0.12)' : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = card.accent ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255,255,255,0.2)'
                e.currentTarget.style.background = card.accent ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.22) 0%, rgba(20, 184, 166, 0.14) 100%)' : 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = card.accent ? 'rgba(34, 197, 94, 0.35)' : 'rgba(255,255,255,0.1)'
                e.currentTarget.style.background = card.accent ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.18) 0%, rgba(20, 184, 166, 0.1) 100%)' : 'rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{card.icon}</span>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: card.accent ? '#86efac' : '#f0fdfa',
                  }}>
                    {card.title}
                  </h2>
                  <p style={{
                    margin: '0.35rem 0 0',
                    fontSize: '0.88rem',
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.5,
                  }}>
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Kurze Leitvision – kompakt darunter */}
        <section style={{
          marginTop: '2.5rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(20, 184, 166, 0.06)',
          border: '1px solid rgba(20, 184, 166, 0.2)',
          borderRadius: 12,
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.65 }}>
            <strong style={{ color: '#5eead4' }}>Leitvision:</strong> Heute möchte ich meine K2 oder ök2 oder K2 Familie auf den Markt bringen – du hast alles, was du dafür brauchst. Fehlt was, ist das Studio da (Design, Bildverarbeitung).
          </p>
        </section>

        {/* Footer-Nav */}
        <footer className="no-print" style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
          <Link to={PROJECT_ROUTES['k2-galerie'].home} style={{ color: 'inherit', textDecoration: 'none', marginRight: '1rem' }}>K2 Galerie</Link>
          <Link to={PROJECT_ROUTES['k2-markt'].mappe} style={{ color: 'inherit', textDecoration: 'none', marginRight: '1rem' }}>Mappe</Link>
          <Link to={PROJECT_ROUTES['k2-markt'].tor} style={{ color: 'inherit', textDecoration: 'none' }}>Zum Tor</Link>
        </footer>
      </div>
    </div>
  )
}
