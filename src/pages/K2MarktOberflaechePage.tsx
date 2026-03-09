/**
 * K2 Markt – eigene Arbeitsoberfläche (Kreativprozess).
 * Nur für den Markt-Kreativprozess: Leitvision, „heute X auf den Markt bringen“, Ideen, Kampagne, dann zum Tor.
 * docs/K2-MARKT-KREATIVPROZESS-LEITVISION.md, K2-MARKT-STAND-ZIEL-NOETIG.md
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

type ProduktWahl = 'k2' | 'oek2' | 'k2-familie' | null

export default function K2MarktOberflaechePage() {
  const [produkt, setProdukt] = useState<ProduktWahl>(null)

  return (
    <div className="mission-wrapper">
      <div className="viewport" style={{ padding: '1.5rem 2rem', maxWidth: 900 }}>
        <header className="no-print" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, color: '#5ffbf1', fontSize: '1.75rem' }}>🎯 K2 Markt – Arbeitsoberfläche</h1>
            <p className="meta" style={{ marginTop: '0.35rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              Deine eigene Welt für den Kreativprozess – hier startest du, dann geht es ans Tor.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
            <Link to={PROJECT_ROUTES['k2-galerie'].home} style={{ color: '#5ffbf1', textDecoration: 'none', fontSize: '0.9rem' }}>← K2 Galerie</Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].k2Markt} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>Mappe (Doku)</Link>
            <Link to={PROJECT_ROUTES['k2-markt'].tor} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>🚦 Zum Tor</Link>
          </div>
        </header>

        {/* Leitvision */}
        <section style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 0.75rem', color: '#5ffbf1', fontSize: '1.1rem' }}>Leitvision</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.95)', lineHeight: 1.65, fontSize: '1rem' }}>
            Ich setze mich an meinen Mac und sage: <strong>Heute möchte ich meine K2 oder ök2 oder etwas anderes – zum Beispiel K2 Familie – auf den Markt bringen.</strong> Du hast alles, was du dafür brauchst.
          </p>
          <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.9)', lineHeight: 1.65, fontSize: '0.98rem' }}>
            Wenn Bilder, Videos oder Texte fehlen: Im Werkzeugkasten haben wir ein <strong>Studio</strong>, in dem wir das selbst professionell erzeugen und ergänzen können.
          </p>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem' }}>
            <Link to="/admin" style={{ color: '#5ffbf1', textDecoration: 'none', fontWeight: 600 }}>→ Studio (Admin: Design, Bildverarbeitung)</Link>
            {' '}– Freistellen, Zuschneiden, Bilder und Texte professionell ergänzen.
          </p>
        </section>

        {/* C: Studio im Werkzeugkasten – sichtbar verknüpft */}
        <section style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 0.5rem', color: '#fbbf24', fontSize: '1.05rem' }}>Fehlt was? → Studio</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            Bilder, Videos oder Texte für Flyer, Galerie oder Kampagne? Im <strong>Admin</strong> (Tab Design, Bildverarbeitung) kannst du sie selbst professionell erzeugen und einbinden – Freistellen, Zuschneiden, Hintergrund, Willkommensbild, Galerie-Karte.
          </p>
          <Link
            to="/admin"
            style={{
              display: 'inline-block',
              marginTop: '0.75rem',
              padding: '0.5rem 1rem',
              background: 'rgba(251,191,36,0.25)',
              color: '#fbbf24',
              border: '1px solid rgba(251,191,36,0.5)',
              borderRadius: 8,
              fontSize: '0.95rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Studio öffnen (Admin)
          </Link>
        </section>

        {/* B: Kreativprozess-Einstieg – klarer Ablauf in 3 Schritten */}
        <section style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 1rem', color: '#86efac', fontSize: '1.15rem' }}>Dein Ablauf</h2>
          <ol style={{ margin: 0, paddingLeft: '1.35rem', color: 'rgba(255,255,255,0.95)', lineHeight: 1.9, fontSize: '0.98rem' }}>
            <li>
              <strong>Wofür?</strong> Wähle, was du heute auf den Markt bringen willst: K2 Galerie, ök2 oder K2 Familie. (Unten „Heute will ich …“)
            </li>
            <li>
              <strong>Ideen & Linie.</strong> Sieh dir in mök2 und Kampagne an, welche Botschaft und welche Linie du nutzen willst. (Unten „Ideen & Quellen“)
            </li>
            <li>
              <strong>Entwurf prüfen & freigeben.</strong> Am Tor wählst du mök2-Idee und optional Kampagne, siehst den Entwurf, prüfst nach DoD und gibst frei. (Button „Zum Tor“)
            </li>
          </ol>
          <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>
            Einstieg ist immer Schritt 1 – nicht das Tor. Erst Produkt und Ideen, dann Tor.
          </p>
        </section>

        {/* Heute will ich … auf den Markt bringen = Schritt 1 */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 0.5rem', color: '#5ffbf1', fontSize: '1.15rem' }}>Schritt 1: Heute will ich … auf den Markt bringen</h2>
          <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>Wofür arbeitest du? Wähle ein Produkt.</p>
          <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Wähle, wofür du gerade arbeiten willst – dann hast du Ideen und Kampagne dafür im Blick.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setProdukt('k2')}
              style={{
                padding: '0.85rem 1.25rem',
                background: produkt === 'k2' ? 'rgba(13,148,136,0.5)' : 'rgba(95,251,241,0.1)',
                color: '#5ffbf1',
                border: `1px solid ${produkt === 'k2' ? '#0d9488' : 'rgba(95,251,241,0.35)'}`,
                borderRadius: 10,
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: produkt === 'k2' ? 600 : 500,
              }}
            >
              K2 Galerie
            </button>
            <button
              type="button"
              onClick={() => setProdukt('oek2')}
              style={{
                padding: '0.85rem 1.25rem',
                background: produkt === 'oek2' ? 'rgba(13,148,136,0.5)' : 'rgba(95,251,241,0.1)',
                color: '#5ffbf1',
                border: `1px solid ${produkt === 'oek2' ? '#0d9488' : 'rgba(95,251,241,0.35)'}`,
                borderRadius: 10,
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: produkt === 'oek2' ? 600 : 500,
              }}
            >
              ök2
            </button>
            <button
              type="button"
              onClick={() => setProdukt('k2-familie')}
              style={{
                padding: '0.85rem 1.25rem',
                background: produkt === 'k2-familie' ? 'rgba(13,148,136,0.5)' : 'rgba(95,251,241,0.1)',
                color: '#5ffbf1',
                border: `1px solid ${produkt === 'k2-familie' ? '#0d9488' : 'rgba(95,251,241,0.35)'}`,
                borderRadius: 10,
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: produkt === 'k2-familie' ? 600 : 500,
              }}
            >
              K2 Familie
            </button>
          </div>
          {produkt && (
            <p style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem' }}>
              Du arbeitest für <strong>{produkt === 'k2' ? 'K2 Galerie' : produkt === 'oek2' ? 'ök2' : 'K2 Familie'}</strong>. Nutze unten Ideen & Kampagne, dann erzeuge Momente und gehe zum Tor.
            </p>
          )}
        </section>

        {/* Schritt 2: Ideen & Quellen */}
        <section style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem', background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.2)', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 0.5rem', color: '#5ffbf1', fontSize: '1.1rem' }}>Schritt 2: Ideen & Quellen</h2>
          <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
            Botschaft und Linie: mök2 und Kampagne ansehen.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
            <li>
              <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} style={{ color: '#5ffbf1', textDecoration: 'none' }}>mök2 (Marketing ök2)</Link>
              {' '}– USPs, Botschaft, Zielgruppe, Lizenzen, Ideen ausgearbeitet.
            </li>
            <li>
              <Link to={PROJECT_ROUTES['k2-galerie'].kampagneMarketingStrategie} style={{ color: '#5ffbf1', textDecoration: 'none' }}>Kampagne Marketing-Strategie</Link>
              {' '}– Dokumente für Linie und Ansprache.
            </li>
            <li>
              <Link to={PROJECT_ROUTES['k2-galerie'].k2Markt} style={{ color: '#5ffbf1', textDecoration: 'none' }}>K2 Markt Mappe</Link>
              {' '}– Vision, Kreativprozess, Stand & Ziel, Handbuch.
            </li>
          </ul>
        </section>

        {/* Schritt 3: Zum Tor */}
        <section style={{ marginBottom: '1rem', padding: '1.25rem 1.5rem', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: 12 }}>
          <h2 style={{ margin: '0 0 0.5rem', color: '#86efac', fontSize: '1.1rem' }}>Schritt 3: Entwurf prüfen & freigeben</h2>
          <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
            Am Tor wählst du mök2-Idee und optional Kampagne, siehst den Entwurf, prüfst nach DoD und gibst frei – eine Freigabe, dann marktfähig.
          </p>
          <Link
            to={PROJECT_ROUTES['k2-markt'].tor}
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.25rem',
              background: 'rgba(34,197,94,0.35)',
              color: '#86efac',
              border: '1px solid rgba(34,197,94,0.6)',
              borderRadius: 8,
              fontSize: '1rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            🚦 Zum Tor – Entwurf prüfen & freigeben
          </Link>
        </section>
      </div>
    </div>
  )
}
