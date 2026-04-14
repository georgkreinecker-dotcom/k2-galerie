/**
 * K2-Welt – Strategie & Portfolio (eigenständig, nicht mök2).
 * Marketingtext, Kundenkreis, Wert-/Strategie-Analyse – sachlich, druckbar.
 */

import { Link } from 'react-router-dom'
import { PROJECT_ROUTES, K2_GALERIE_APF_EINSTIEG } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

export default function K2WeltStrategiePage() {
  return (
    <div className="mission-wrapper k2-welt-strategie-page">
      <style>{`
        @media print {
          .k2-welt-strategie-page .no-print { display: none !important; }
          .k2-welt-strategie-page .mission-wrapper .viewport { padding: 12mm 14mm !important; }
        }
      `}</style>
      <div className="viewport" style={{ padding: '1.5rem 2rem', maxWidth: 900, margin: '0 auto' }}>
        <header className="no-print" style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ margin: 0, color: '#5ffbf1', fontSize: '1.65rem' }}>K2-Welt – Strategie und Portfolio</h1>
          <p className="meta" style={{ marginTop: '0.35rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>
            Eigenständiger Arbeitsort (nicht mök2). Drei Produkte unter einer Linie – Texte zum Drucken und Weitergeben.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
            <Link to={K2_GALERIE_APF_EINSTIEG} style={{ color: '#5ffbf1', textDecoration: 'none', fontSize: '0.9rem' }}>
              ← APf / K2 Galerie
            </Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>
              mök2 – nur Vertrieb ök2
            </Link>
            <button
              type="button"
              className="no-print"
              onClick={() => window.print()}
              style={{
                padding: '0.45rem 0.9rem',
                background: 'linear-gradient(135deg, rgba(129,140,248,0.35), rgba(99,102,241,0.2))',
                border: '1px solid rgba(129,140,248,0.55)',
                borderRadius: 8,
                color: '#e0e7ff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Drucken / PDF
            </button>
          </div>
        </header>

        <article
          style={{
            background: 'rgba(95,251,241,0.06)',
            padding: '1.5rem 1.75rem',
            borderRadius: 12,
            border: '1px solid rgba(95,251,241,0.2)',
            color: 'rgba(255,255,255,0.92)',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', color: '#5ffbf1', marginBottom: '0.65rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
            Portfolio K2-Welt: Marketingtext, Kundenkreis, Wert (sachlich)
          </h2>
          <p style={{ marginBottom: '0.65rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>
            Drei Produkte unter einer technischen und gestalterischen Linie (kgm solution): öffentliche Galerie und Geschäftsprozesse (ök2), Vereinsplattform (VK2), digitale Familienheimat mit klarer Datenhoheit (K2 Familie). Keine Vermischung sensibler Daten zwischen den Welten – das ist Teil des Versprechens.
          </p>

          <h3 style={{ fontSize: '1rem', color: '#e2e8f0', margin: '1rem 0 0.5rem', fontWeight: 600 }}>Kurztext für Außenkommunikation</h3>
          <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', lineHeight: 1.55 }}>
            Die K2-Welt bündelt, was viele Einzeltools nur fragmentiert abdecken: <strong>sichtbar werden</strong> mit professioneller Präsentation und Verkauf (ök2), <strong>Gemeinschaften organisieren</strong> mit Vereinsstruktur und gemeinsamem Auftritt (VK2), <strong>Beziehungen und Erinnerungen</strong> verlässlich abbilden, ohne Familiendaten in Werbe- oder Datenökonomien zu geben (K2 Familie). Entstanden aus der Kunst und dem Galerie-Alltag, ausgebaut für den breiteren Markt – konfigurierbar, skalierbar, mit einem gemeinsamen Qualitätsanspruch.
          </p>
          <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', lineHeight: 1.55 }}>
            Für Nutzer:innen bedeutet das: ein Partner mit durchgängiger Oberfläche statt einer Ansammlung uneinheitlicher Apps. Für Organisationen bedeutet es: klare Rollen, nachvollziehbare Prozesse und ein Angebot, das vom Einzelkünstler bis zum Verein reicht – ohne die jeweiligen Datenbereiche zu vermischen.
          </p>

          <h3 style={{ fontSize: '1rem', color: '#e2e8f0', margin: '1rem 0 0.5rem', fontWeight: 600 }}>Möglicher Kundenkreis (Einordnung)</h3>
          <ul style={{ margin: '0 0 0.85rem', paddingLeft: '1.25rem', lineHeight: 1.55, fontSize: '0.9rem', color: 'rgba(255,255,255,0.88)' }}>
            <li>
              <strong>ök2 / Galerie-Lizenz:</strong> Selbstständige, Werkstätten, kleine Galerien und alle, die Ideen oder Produkte professionell zeigen wollen; Bedarf an Webpräsenenz, Werken, Events, optional Shop – ohne eigene IT-Abteilung.
            </li>
            <li>
              <strong>VK2:</strong> Vereine mit regelmäßigem Außenauftritt und Mitgliederverwaltung (Einstieg z. B. Kunstvereine; dieselbe Struktur ist für andere Vereinstypen denkbar). Entscheider: Vorstände, ehrenamtlich Organisierende.
            </li>
            <li>
              <strong>K2 Familie:</strong> Haushalte und Familien, die Stammbaum und Beziehungen sauber aus den Karten ableiten wollen, mit hohen Ansprüchen an Datenschutz und ohne kommerzielle Verwertung sensibler Familiendaten durch Dritte.
            </li>
            <li>
              <strong>Überschneidungen:</strong> Wenige Personen nutzen alle drei Produkte privat; häufiger sind <strong>organisatorische</strong> Überschneidungen (z. B. Verein plus ausstellende Mitglieder; berufliche Präsentation plus privater Familienbereich) – technisch und vertraglich klar getrennte Mandanten, eine Marke.
            </li>
          </ul>

          <h3 style={{ fontSize: '1rem', color: '#e2e8f0', margin: '1rem 0 0.5rem', fontWeight: 600 }}>Wert- und strategische Analyse (ohne Kursziele)</h3>
          <p style={{ marginBottom: '0.65rem', fontSize: '0.92rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
            <strong>Wirtschaftlicher Wert</strong> zeigt sich vor allem in <strong>wiederkehrenden Einnahmen</strong> (Lizenzen, Abos, gestaffelte Vereinsmodelle), nicht in einer einmaligen „Softwarebewertung“. Vergleichbare europäische Nischen-SaaS erreichen bei tragfähigem Vertrieb und niedrigem Wechsel oft Größenordnungen im <strong>sechs- bis siebenstelligen Euro-Bereich Jahresumsatz</strong>, bevor sie zum Massenmarkt werden; genaue Zahlen hängen von Akquise, Supportlast und Preisgestaltung ab.
          </p>
          <p style={{ marginBottom: '0.65rem', fontSize: '0.92rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
            <strong>Strategischer Wert</strong> liegt im <strong>Bündel</strong>: weniger Wechselkosten für Kund:innen, die mehrere Bedürfnisse (Öffentlichkeit, Verein, Familie) adressieren; höhere Wechselbereitschaft zum Wettbewerb, wenn Daten und Arbeitsabläufe in einem konsistenten System liegen. Die bewusste <strong>Trennung</strong> der Datenräume (keine K2-Stammdaten in der Demo, keine Vermischung Familie/Galerie) ist langfristig <strong>Vertrauenskapital</strong> und unterscheidet das Angebot von generischen Social- oder reinen Shop-Lösungen.
          </p>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.92rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
            <strong>Bewertung / Übernahme (Marktüblich):</strong> Bei investierenden oder kaufenenden Dritten werden oft Vielfache des wiederkehrenden Umsatzes diskutiert (grobe Größenordnung in der Branche häufig etwa <strong>3–8× jährlicher wiederkehrender Umsatz</strong>, stark abhängig von Wachstum, Rentabilität und Abhängigkeit von Einzelpersonen). Das ist keine Prognose für dieses Projekt, sondern eine <strong>Einordnung</strong>, wie der Markt solche Angebote lesen kann.
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>
            Quelle: interne Abstimmung; Produktlinie siehe docs/PRODUKT-VISION.md. Keine Anlageberatung.
          </p>
        </article>

        <footer style={{ marginTop: '1.75rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.12)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div style={{ marginTop: '0.25rem' }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </div>
    </div>
  )
}
