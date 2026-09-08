import { Link } from 'react-router-dom'
import { PLATFORM_ROUTES, HUNDRED_GENERATION_ROUTE } from '../config/navigation'
import '../App.css'

/**
 * 100 Generationen – Kapitel Fläche: Parallel-Konzept für bildnerische Künstler:innen.
 */
export default function HundredGenerationFlaechePage() {
  return (
    <div className="hundert-generation-flaeche-page">
      <style>{`
        .hundert-generation-flaeche-page {
          --hg-bg: #10131a;
          --hg-panel: #161b24;
          --hg-ink: #eef2f7;
          --hg-muted: #a8b3c4;
          --hg-accent: #8fa8c8;
          --hg-line: rgba(143, 168, 200, 0.4);
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 15% 0%, rgba(143, 168, 200, 0.14), transparent 55%),
            radial-gradient(ellipse 55% 40% at 90% 15%, rgba(40, 52, 72, 0.55), transparent 50%),
            var(--hg-bg);
          color: var(--hg-ink);
          font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
        }
        .hundert-generation-flaeche-page .hg-shell {
          max-width: 42rem;
          margin: 0 auto;
          padding: 1.25rem 1.25rem 3.5rem;
        }
        .hundert-generation-flaeche-page .hg-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          font-family: system-ui, sans-serif;
          font-size: 0.9rem;
        }
        .hundert-generation-flaeche-page .hg-nav a {
          color: var(--hg-muted);
          text-decoration: none;
        }
        .hundert-generation-flaeche-page .hg-nav a:hover { color: var(--hg-accent); }
        .hundert-generation-flaeche-page .hg-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .hundert-generation-flaeche-page .hg-btn {
          appearance: none;
          border: 1px solid var(--hg-line);
          background: rgba(143, 168, 200, 0.12);
          color: var(--hg-ink);
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .hundert-generation-flaeche-page .hg-btn:hover { background: rgba(143, 168, 200, 0.22); }
        .hundert-generation-flaeche-page .hg-chapters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0 0 1.5rem;
          font-family: system-ui, sans-serif;
        }
        .hundert-generation-flaeche-page .hg-chapters a {
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.85rem;
          border: 1px solid var(--hg-line);
          color: var(--hg-muted);
        }
        .hundert-generation-flaeche-page .hg-chapters a:hover { color: var(--hg-accent); }
        .hundert-generation-flaeche-page .hg-chapters .is-active {
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--hg-accent);
          background: rgba(143, 168, 200, 0.2);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--hg-ink);
        }
        .hundert-generation-flaeche-page .hg-kicker {
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 0.72rem;
          color: var(--hg-accent);
          font-family: system-ui, sans-serif;
          margin: 0 0 0.75rem;
        }
        .hundert-generation-flaeche-page h1 {
          font-size: clamp(1.85rem, 5vw, 2.6rem);
          font-weight: 600;
          line-height: 1.15;
          margin: 0 0 0.5rem;
        }
        .hundert-generation-flaeche-page .hg-subtitle {
          font-size: clamp(1.05rem, 2.8vw, 1.25rem);
          color: var(--hg-muted);
          margin: 0 0 0.75rem;
          font-style: italic;
        }
        .hundert-generation-flaeche-page .hg-lede {
          font-size: 1.02rem;
          line-height: 1.55;
          color: var(--hg-muted);
          margin: 0 0 2rem;
        }
        .hundert-generation-flaeche-page section {
          margin: 0 0 1.75rem;
          padding: 1.15rem 1.2rem;
          background: var(--hg-panel);
          border: 1px solid rgba(238, 242, 247, 0.08);
          border-left: 3px solid var(--hg-accent);
          border-radius: 4px 12px 12px 4px;
          break-inside: avoid;
        }
        .hundert-generation-flaeche-page h2 {
          font-size: 1.15rem;
          margin: 0 0 0.75rem;
          color: var(--hg-accent);
          letter-spacing: 0.02em;
        }
        .hundert-generation-flaeche-page h3 {
          font-size: 1.02rem;
          margin: 1rem 0 0.4rem;
          color: var(--hg-ink);
        }
        .hundert-generation-flaeche-page p {
          margin: 0 0 0.75rem;
          line-height: 1.65;
          font-size: 0.98rem;
        }
        .hundert-generation-flaeche-page p:last-child { margin-bottom: 0; }
        .hundert-generation-flaeche-page .hg-label {
          font-family: system-ui, sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--hg-accent);
          display: block;
          margin-bottom: 0.25rem;
        }
        .hundert-generation-flaeche-page footer.hg-foot {
          margin-top: 2.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(238, 242, 247, 0.12);
          font-family: system-ui, sans-serif;
          font-size: 0.8rem;
          color: var(--hg-muted);
          line-height: 1.5;
        }
        .hundert-generation-flaeche-page .seitenfuss { display: none; }
        @media print {
          .hundert-generation-flaeche-page {
            background: #fffefb;
            color: #1c1a18;
          }
          .hundert-generation-flaeche-page .hg-nav,
          .hundert-generation-flaeche-page .no-print { display: none !important; }
          .hundert-generation-flaeche-page .hg-shell { max-width: none; padding: 0; }
          .hundert-generation-flaeche-page section {
            background: transparent;
            border: none;
            padding: 0;
            margin: 0 0 0.9rem;
          }
          .hundert-generation-flaeche-page h2,
          .hundert-generation-flaeche-page .hg-kicker,
          .hundert-generation-flaeche-page .hg-label { color: #3d5a80; }
          .hundert-generation-flaeche-page .hg-subtitle,
          .hundert-generation-flaeche-page .hg-lede,
          .hundert-generation-flaeche-page footer.hg-foot { color: #5c5650; }
          .hundert-generation-flaeche-page .seitenfuss {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9pt;
            color: #5c5650;
            font-family: system-ui, sans-serif;
          }
          .hundert-generation-flaeche-page .seitenfuss::after {
            content: "Seite " counter(page);
          }
          @page { margin: 14mm 16mm 16mm 16mm; }
        }
      `}</style>

      <div className="hg-shell">
        <nav className="hg-nav no-print">
          <Link to={PLATFORM_ROUTES.projects}>← Projekte</Link>
          <div className="hg-actions">
            <button type="button" className="hg-btn" onClick={() => window.print()}>
              Als PDF drucken
            </button>
          </div>
        </nav>

        <p className="hg-kicker">Künstlerisches Projekt · Kapitel Fläche</p>
        <h1>100 Generationen</h1>
        <p className="hg-subtitle">Fläche &amp; Code: Die Evolution des Bildes</p>
        <div className="hg-chapters no-print">
          <Link to={HUNDRED_GENERATION_ROUTE}>🏺 Keramik – Volumen</Link>
          <span className="is-active">🖼️ Fläche – Bild</span>
        </div>
        <p className="hg-lede">
          Parallel-Konzept zur Keramikserie – für bildnerische Künstler:innen
          (Malerei, Zeichnung, Collage). Dieselbe Achse Chaos und Code, derselbe
          historische Anker; die Metamorphose geschieht auf der Fläche: vom Fleck
          zum festgeschriebenen Muster.
        </p>

        <section>
          <h2>1. Dieselbe metaphysische Achse – andere Materie</h2>
          <p>
            Wie in der Keramik geht es um das Bändigen des Chaos durch das Muster.
            Im Bild ist das Chaos nicht die plastische Masse, sondern die offene
            Fläche: Geste, Fleck, Untergrund, ungeschlossene Farbe. Der Code ist
            nicht der Brand, sondern die Entscheidung auf der Fläche – Linie,
            Raster, Schicht, kompositorisches Flechtwerk.
          </p>
          <p>
            <span className="hg-label">Chaosgötter auf der Fläche</span>
            Eruptive Geste, gebrochene Farbe, Rohgrund – Masse ohne festgeschriebenes
            Bild. Die ersten Generationen als visuelle Konfrontation: roh, direkt,
            ohne Metallglanz der „fertigen“ Oberfläche.
          </p>
          <p>
            <span className="hg-label">KI und Flechtwerk als Bildcode</span>
            Das 2/2-Köper-Muster der Zeremonialaxt wird zur Bildstruktur: gemalt,
            geritzt, collagiert oder als Negativraum freigelassen. Es wirkt wie ein
            fehlerfreies Datenraster – Wissen, das Chaos ordnet, ohne selbst zu „leben“.
          </p>
        </section>

        <section>
          <h2>2. Historischer Anker – gleicher Faden</h2>
          <p>
            Der Anker bleibt die originale „Di Kurugu“-Zeremonialaxt der Mbowamb-Kultur
            und der Wendepunkt der 1960er Jahre (Entwicklungshelfer, Clan-Aufnahme,
            Insignie). Im bildnerischen Kapitel wird die Axt zur
            <strong> Schnittfigur in der Fläche</strong>: Silhouette, Spalt, diagonale
            Kante – nicht Volumen, sondern Zeichnung und Freiraum.
          </p>
        </section>

        <section>
          <h2>3. Der bildnerische Prozess – Metamorphose der Fläche</h2>
          <p>
            Parallel zur keramischen Steinwerdung steht hier die Verwandlung vom
            offenen Fleck zum unwiderruflichen Bild. Der Betrachter soll Schichten
            lesen: was darunter war, was darüber siegt.
          </p>
          <p>
            <span className="hg-label">Chaos – Grund und Geste</span>
            Grundierung, Wisch, Rohleinwand, unruhige Farbe. Noch ist alles reversibel
            oder zumindest übermalbar. Der Zustand entspricht den Chaosgöttern:
            Energie ohne festgeschriebenes Muster.
          </p>
          <p>
            <span className="hg-label">Wendepunkt – Untermalung und Suche</span>
            Erste Linien, Untermalung, Kompositionsachsen. Die Hand sucht Ordnung.
            Korrigierbar, aber nicht mehr beliebig. Der kulturelle Wendepunkt
            (Axt / Wissen) trifft den bildnerischen: die Fläche beginnt zu entscheiden.
          </p>
          <p>
            <span className="hg-label">Code – letzte Schicht und Festschreibung</span>
            Klare Hell-Dunkel-Struktur, Herringbone, geschlossene Form. Firnis oder
            letzte Schicht macht das Ergebnis dauerhaft – analog zum Brand: was
            entschieden wurde, bleibt.
          </p>
          <p>
            <span className="hg-label">Was die Ausstellung damit will</span>
            Nicht nur Motiv und Raster, sondern die Verwandlung spüren: rau gegen
            glatt, offen gegen verdichtet, Fleck gegen Code. Mythos, Wissen und
            Materialprozess – drei Erzählspuren auf der Fläche.
          </p>
        </section>

        <section>
          <h2>4. Die drei Elemente – auf jedem Bild</h2>
          <p>
            Jedes Werk komprimiert Chaos, Wendepunkt und Code – und zugleich die
            Stufen der bildnerischen Metamorphose.
          </p>
          <p>
            <span className="hg-label">Element I – Basis (Ur-Chaos)</span>
            Dunkle, gebrochene Fläche: Geste, Fleck, erdige Farbigkeit. Die
            formlosen Generationen und der offene Anfang des Bildes.
          </p>
          <p>
            <span className="hg-label">Element II – Stamm (Wendepunkt)</span>
            Organische Linien und Übergänge, die suchen – erste Ordnung ohne
            endgültiges Raster.
          </p>
          <p>
            <span className="hg-label">Element III – Spitze (Code)</span>
            Scharfes Hell-Dunkel-Flechtmuster (2/2-Köper), so präzise, als wäre es
            berechnet. Festgeschriebene Bildstruktur.
          </p>
        </section>

        <section>
          <h2>5. Drei autonome Bildvarianten</h2>
          <h3>Variante A – „Der codierte Ausbruch“</h3>
          <p>
            Amorphe Farbmasse (Chaosgott), durchbrochen von einer diagonalen
            Schnittkante – abstrakte Axt-Silhouette. Im Schnittfeld das
            Herringbone-Raster. Aussage: Der Code seziert und zähmt die Urfläche.
          </p>
          <h3>Variante B – „Die algorithmische Stele“</h3>
          <p>
            Hochformat: von unten „Datenrauschen“ (ungeordnete Striche/Flecken)
            zu oben makellosem Flechtgewebe. Aussage: Evolution als Aufstieg –
            Wissen übernimmt die Kontrolle über die Geste; Haptik der Schicht
            vom Weichen zum Verdichteten.
          </p>
          <h3>Variante C – „Der gespaltene Monolith“</h3>
          <p>
            Dunkler, geschlossener Flächenblock; geschwungener Spalt als
            Negativraum der Axt. Im Spalt das feine Köpermuster. Aussage:
            Entdeckung – Wissen liegt geschützt im Inneren des rauen Erbes;
            außen Erde/Fleck, innen Code.
          </p>
        </section>

        <section>
          <h2>6. Materialästhetik und Ausführung</h2>
          <p>
            <span className="hg-label">Träger und Farbe</span>
            Kontrast zwischen grobem, erdigem Untergrund (Chaos) und klarer,
            dichter Zeichnung oder Schicht (Code). Acryl, Öl, Tempera, Kohle,
            Collage – je nach Handschrift; entscheidend ist die Lesbarkeit der
            Metamorphose.
          </p>
          <p>
            <span className="hg-label">Oberfläche</span>
            Kein glänzender Effekt um seiner selbst willen. Matte oder zurückhaltende
            Oberflächen lassen Schichten und Raster ehrlich stehen – analog zur
            unglasierten Keramik.
          </p>
          <p>
            <span className="hg-label">Prozesssichtbarkeit</span>
            Spuren des Machens (Wisch, Riss im Grund, Übermalung, Kante) bleiben
            bewusst. Der bildnerische Prozess ist eigene Ausstellungsschicht:
            Chaos, Ordnung, Festschreibung.
          </p>
        </section>

        <section>
          <h2>7. Keramik und Fläche – ein Projekt, zwei Medien</h2>
          <p>
            <span className="hg-label">Keramik</span>
            Metamorphose von Erde zu Stein.
          </p>
          <p>
            <span className="hg-label">Fläche</span>
            Metamorphose von Fleck zu festgeschriebenem Code auf dem Bildträger.
          </p>
          <p>
            Gleiche Geschichte – anderes Medium. Gemeinsam: 100 Generationen,
            Chaosgötter, KI/Muster, Zeremonialaxt, drei Elemente, drei Varianten.
          </p>
        </section>

        <footer className="hg-foot">
          Projekt 100 Generationen · Kapitel Fläche &amp; Code · Konzept und Manifest
          <br />
          Parallel zur Keramikserie · eigenständiges künstlerisches Vorhaben.
        </footer>
      </div>

      <div className="seitenfuss" aria-hidden="true" />
    </div>
  )
}
