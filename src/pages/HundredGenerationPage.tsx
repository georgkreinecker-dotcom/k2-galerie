import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PLATFORM_ROUTES, HUNDRED_GENERATION_FLAECHE_ROUTE } from '../config/navigation'
import '../App.css'

/**
 * Künstlerisches Projekt „100 Generationen“ – Ausstellungskonzept Chaos & Code.
 * Eigenständig von der K2-Galerie-Software; fertige Lese- und Druckfassung.
 */

const KERAMIK_ENTWUERFE = [
  { src: '/100-generation/entwurf-01-chaosgott.png', title: '1 · Chaosgott', note: 'Rohmasse, eruptiv' },
  { src: '/100-generation/entwurf-02-axt-anker.png', title: '2 · Axt-Anker', note: 'Di Kurugu, abstrahiert' },
  { src: '/100-generation/entwurf-03-metamorphose.png', title: '3 · Metamorphose', note: 'Chaos → Muster' },
  { src: '/100-generation/entwurf-04-code-muster.png', title: '4 · Code-Muster', note: 'Flechtwerk / Ordnung' },
  { src: '/100-generation/entwurf-05-drei-elemente.png', title: '5 · Drei Elemente', note: 'modulares Volumen' },
  { src: '/100-generation/uebersicht-varianten-abc.png', title: 'Übersicht A / B / C', note: 'drei Varianten' },
  { src: '/100-generation/uebersicht-ausstellungsraum.png', title: 'Ausstellungsraum', note: 'Serie im Raum' },
] as const

export default function HundredGenerationPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash !== '#entwuerfe') return
    const el = document.getElementById('entwuerfe')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="hundert-generation-page">
      <style>{`
        .hundert-generation-page {
          --hg-bg: #14110f;
          --hg-panel: #1c1814;
          --hg-ink: #f5efe6;
          --hg-muted: #c4b8a8;
          --hg-accent: #d4a017;
          --hg-line: rgba(212, 160, 23, 0.35);
          min-height: 100vh;
          background:
            radial-gradient(ellipse 80% 50% at 20% 0%, rgba(161, 98, 7, 0.18), transparent 55%),
            radial-gradient(ellipse 60% 40% at 90% 20%, rgba(69, 46, 20, 0.45), transparent 50%),
            var(--hg-bg);
          color: var(--hg-ink);
          font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
        }
        .hundert-generation-page .hg-shell {
          max-width: 42rem;
          margin: 0 auto;
          padding: 1.25rem 1.25rem 3.5rem;
        }
        .hundert-generation-page .hg-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          font-family: system-ui, sans-serif;
          font-size: 0.9rem;
        }
        .hundert-generation-page .hg-nav a {
          color: var(--hg-muted);
          text-decoration: none;
        }
        .hundert-generation-page .hg-nav a:hover { color: var(--hg-accent); }
        .hundert-generation-page .hg-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .hundert-generation-page .hg-btn {
          appearance: none;
          border: 1px solid var(--hg-line);
          background: rgba(212, 160, 23, 0.12);
          color: var(--hg-ink);
          padding: 0.45rem 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .hundert-generation-page .hg-chapters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0 0 1.5rem;
          font-family: system-ui, sans-serif;
        }
        .hundert-generation-page .hg-chapters a {
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          text-decoration: none;
          font-size: 0.85rem;
          border: 1px solid var(--hg-line);
          color: var(--hg-muted);
        }
        .hundert-generation-page .hg-chapters a:hover {
          color: var(--hg-accent);
        }
        .hundert-generation-page .hg-chapters .is-active {
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--hg-accent);
          background: rgba(212, 160, 23, 0.2);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--hg-ink);
        }
        .hundert-generation-page .hg-kicker {
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 0.72rem;
          color: var(--hg-accent);
          font-family: system-ui, sans-serif;
          margin: 0 0 0.75rem;
        }
        .hundert-generation-page h1 {
          font-size: clamp(1.85rem, 5vw, 2.6rem);
          font-weight: 600;
          line-height: 1.15;
          margin: 0 0 0.5rem;
        }
        .hundert-generation-page .hg-subtitle {
          font-size: clamp(1.05rem, 2.8vw, 1.25rem);
          color: var(--hg-muted);
          margin: 0 0 0.75rem;
          font-style: italic;
        }
        .hundert-generation-page .hg-lede {
          font-size: 1.02rem;
          line-height: 1.55;
          color: var(--hg-muted);
          margin: 0 0 2rem;
        }
        .hundert-generation-page .hg-entwuerfe-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
          gap: 0.85rem;
          margin: 0.75rem 0 0;
        }
        .hundert-generation-page .hg-entwurf {
          margin: 0;
          padding: 0;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(212, 160, 23, 0.25);
          border-radius: 10px;
          overflow: hidden;
        }
        .hundert-generation-page .hg-entwurf a {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        .hundert-generation-page .hg-entwurf img {
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          object-fit: cover;
          background: #0a0c10;
        }
        .hundert-generation-page .hg-entwurf.hg-entwurf-wide img {
          aspect-ratio: 16 / 9;
        }
        .hundert-generation-page .hg-entwurf figcaption {
          padding: 0.55rem 0.65rem 0.7rem;
          font-family: system-ui, sans-serif;
        }
        .hundert-generation-page .hg-entwurf figcaption strong {
          display: block;
          font-size: 0.82rem;
          color: var(--hg-ink);
          margin-bottom: 0.15rem;
        }
        .hundert-generation-page .hg-entwurf figcaption span {
          font-size: 0.72rem;
          color: var(--hg-muted);
        }
        .hundert-generation-page section {
          margin: 0 0 1.75rem;
          padding: 1.15rem 1.2rem;
          background: var(--hg-panel);
          border: 1px solid rgba(245, 239, 230, 0.08);
          border-left: 3px solid var(--hg-accent);
          border-radius: 4px 12px 12px 4px;
          break-inside: avoid;
        }
        .hundert-generation-page h2 {
          font-size: 1.15rem;
          margin: 0 0 0.75rem;
          color: var(--hg-accent);
          letter-spacing: 0.02em;
        }
        .hundert-generation-page h3 {
          font-size: 1.02rem;
          margin: 1rem 0 0.4rem;
          color: var(--hg-ink);
        }
        .hundert-generation-page p {
          margin: 0 0 0.75rem;
          line-height: 1.65;
          font-size: 0.98rem;
        }
        .hundert-generation-page p:last-child { margin-bottom: 0; }
        .hundert-generation-page .hg-label {
          font-family: system-ui, sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--hg-accent);
          display: block;
          margin-bottom: 0.25rem;
        }
        .hundert-generation-page footer.hg-foot {
          margin-top: 2.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(245, 239, 230, 0.12);
          font-family: system-ui, sans-serif;
          font-size: 0.8rem;
          color: var(--hg-muted);
          line-height: 1.5;
        }
        .hundert-generation-page .seitenfuss {
          display: none;
        }
        @media print {
          .hundert-generation-page {
            background: #fffefb;
            color: #1c1a18;
          }
          .hundert-generation-page .hg-nav,
          .hundert-generation-page .no-print {
            display: none !important;
          }
          .hundert-generation-page .hg-shell {
            max-width: none;
            padding: 0;
          }
          .hundert-generation-page section {
            background: transparent;
            border: none;
            border-left: none;
            padding: 0;
            margin: 0 0 0.9rem;
          }
          .hundert-generation-page h2,
          .hundert-generation-page .hg-kicker,
          .hundert-generation-page .hg-label {
            color: #7a4e08;
          }
          .hundert-generation-page .hg-subtitle,
          .hundert-generation-page .hg-lede,
          .hundert-generation-page footer.hg-foot {
            color: #5c5650;
          }
          .hundert-generation-page .seitenfuss {
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
          .hundert-generation-page .seitenfuss::after {
            content: "Seite " counter(page);
          }
          @page {
            margin: 14mm 16mm 16mm 16mm;
          }
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

        <p className="hg-kicker">Künstlerisches Projekt · Kapitel Keramik</p>
        <h1>100 Generationen</h1>
        <p className="hg-subtitle">Chaos &amp; Code: Die Evolution des Musters</p>
        <div className="hg-chapters no-print">
          <span className="is-active">🏺 Keramik – Volumen</span>
          <Link to={HUNDRED_GENERATION_FLAECHE_ROUTE}>🖼️ Fläche – Bild</Link>
        </div>
        <p className="hg-lede">
          Ausstellungskonzept und Manifest für eine skulpturale Keramikserie –
          künstlerisch-wissenschaftliches Exposé mit metaphysischer Meta-Ebene
          (Chaosgötter und KI) und mit dem keramischen Prozess selbst: der
          Metamorphose des Materials von formlosem Ton zu dauerhaftem Stein.
        </p>

        <section id="entwuerfe" className="no-print">
          <h2>KI-Entwürfe – Keramikmodelle</h2>
          <p>
            Erste visuelle Entwürfe zum Formenbau. Keine fertigen Werke – Orientierung
            für die Serie Chaos &amp; Code. Tippen öffnet das Bild groß.
          </p>
          <div className="hg-entwuerfe-grid">
            {KERAMIK_ENTWUERFE.map((e) => (
              <figure
                key={e.src}
                className={`hg-entwurf${e.src.includes('uebersicht') ? ' hg-entwurf-wide' : ''}`}
              >
                <a href={e.src} target="_blank" rel="noopener noreferrer">
                  <img src={e.src} alt={e.title} loading="lazy" />
                  <figcaption>
                    <strong>{e.title}</strong>
                    <span>{e.note}</span>
                  </figcaption>
                </a>
              </figure>
            ))}
          </div>
        </section>

        <section>
          <h2>1. Das metaphysische Manifest: Chaosgötter vs. Algorithmus</h2>
          <p>
            Dieses Projekt untersucht die fundamentale menschliche und technologische Konstante:
            das Bändigen des Chaos durch das Muster. Es zieht eine direkte philosophische Parallele
            zwischen zwei scheinbar unvereinbaren Welten.
          </p>
          <h3>Die Chaosgötter – das Ur-Chaos</h3>
          <p>
            Sie verkörpern die totale Formlosigkeit, das eruptive, unvorhersehbare Leben und die
            ungezähmte Natur. Sie sind die biologische Masse, aus der alles entsteht. Im Kontext
            dieses Projekts stehen sie auch für die ersten 100 Generationen der Menschheit, die im
            Hochland von Neuguinea in direkter, rauer Konfrontation mit der Natur lebten.
          </p>
          <h3>Die KI und das Flechtwerk – das pure Wissen</h3>
          <p>
            Künstliche Intelligenz erschafft nichts aus dem Nichts – sie besitzt kein biologisches
            Bewusstsein. Sie ist der ultimative Speicher von bestehendem Wissen und fehlerfreien
            Mustern. Exakt so verhält sich das traditionelle 2/2-Köper-Flechtmuster (Herringbone)
            der historischen Zeremonialaxt: ein über Generationen mathematisch perfektioniertes
            Datenraster. Das Muster ist der Code, der das Chaos bändigt.
          </p>
        </section>

        <section>
          <h2>2. Wissenschaftliche Provenienz und historischer Bezug</h2>
          <p>
            Der reale Anker der Ausstellung ist eine originale „Di Kurugu“-Zeremonialaxt der
            Mbowamb-Kultur (Region Mount Hagen, Papua-Neuguinea).
          </p>
          <p>
            <span className="hg-label">Der Zeitzeuge</span>
            In den 1960er Jahren arbeitete der Bruder des Künstlers als landwirtschaftlicher
            Entwicklungshelfer im Hochland. Er erlebte das Ende einer ununterbrochenen Kette von
            hunderten Generationen, die bis dahin metallfrei lebten.
          </p>
          <p>
            <span className="hg-label">Das Ritual</span>
            Als Dank für die Strukturierung der Landwirtschaft wurde er rituell in den Clan
            aufgenommen. Die Axt wurde ihm als Insignie des Respekts überreicht. Sie markiert
            historisch den Wendepunkt, an dem westliches Wissen (Entwicklungshilfe) auf die
            jahrtausendealte Muster-Struktur der Ahnen traf.
          </p>
        </section>

        <section>
          <h2>3. Der keramische Prozess – Metamorphose des Materials</h2>
          <p>
            Parallel zur Geschichte von Chaos und Code steht der keramische Prozess selbst im
            Zentrum der Ausstellung. Keramik ist keine bloße Technik, mit der Motive auf Ton
            gesetzt werden – sie ist die sichtbare Metamorphose der Materie: aus Erde wird Form,
            aus Form wird Stein. Jedes Werk erzählt diese Verwandlung mit, nicht nur darüber.
          </p>
          <p>
            <span className="hg-label">Chaos – der plastische Zustand</span>
            Nasser, formbarer Ton ist das Ur-Chaos der Werkstatt: nachgiebig, schwer, lebendig
            unter der Hand. Hier entscheidet sich noch nichts Endgültiges. Druck, Riss, Schamotte,
            Abdruck – alles bleibt reversibel, bis der Prozess weitergeht. Dieser Zustand entspricht
            den Chaosgöttern: Masse ohne festgeschriebenes Muster.
          </p>
          <p>
            <span className="hg-label">Wendepunkt – Trocknung und Haut</span>
            Beim Trocknen verlässt das Wasser die Masse. Die Form verhärtet, die Oberfläche wird
            Haut. Erste Ordnung entsteht – noch ohne Feuer. Die Hand kann korrigieren, aber nicht
            mehr beliebig. Der Wendepunkt der Plastik und der Wendepunkt der Kultur (Axt / Wissen)
            treffen sich hier: das Material beginnt, sich gegen das Chaos zu entscheiden.
          </p>
          <p>
            <span className="hg-label">Code – Brand und Steinwerdung</span>
            Im Brand geschieht die eigentliche Metamorphose: chemische und physikalische Umwandlung
            zu Steinzeug. Was weich war, wird dauerhaft. Was gesucht war, wird festgeschrieben.
            Das 2/2-Köper-Muster an der Spitze steht nicht nur für KI und Ahnenwissen – es steht
            auch für den Moment, in dem der Prozess das Ergebnis unwiderruflich macht. Der Brand
            ist der Algorithmus der Erde: Hitze, Zeit, Atmosphäre schreiben den Code in die Materie.
          </p>
          <p>
            <span className="hg-label">Was die Ausstellung damit will</span>
            Der Betrachter soll nicht nur Silhouette und Flechtwerk lesen, sondern die Verwandlung
            spüren: rau gegen glatt, porös gegen verdichtet, Erde gegen Stein. Der keramische
            Prozess ist die dritte Erzählspur neben Mythos (Chaosgötter) und Wissen (KI / Muster) –
            und ihre materielle Wahrheit.
          </p>
        </section>

        <section>
          <h2>4. Die drei plastischen Elemente – auf jedem Objekt</h2>
          <p>
            Jedes Werk der Serie ist ein autonomes Einzelstück: Es komprimiert die gesamte
            Evolutionstheorie und bildet alle drei Elemente gleichzeitig ab – zugleich die Stufen
            der keramischen Metamorphose (Chaos → Wendepunkt → Steinwerdung).
          </p>
          <p>
            <span className="hg-label">Element I – Das Ur-Chaos (Basis)</span>
            Grober, stark schamottierter, dunkler Ton. Oberflächen aufgerissen, unregelmäßig
            geschlagen, mit Manganoxiden verwittert. Formlose Chaosgötter und die ersten
            Ur-Generationen – und der plastische, noch erdige Zustand der Materie.
          </p>
          <p>
            <span className="hg-label">Element II – Der Wendepunkt (Stamm)</span>
            Fließender Übergang: der Ton wird glatter. Erste plastisch applizierte Tonbänder
            winden sich wie organische Ranken um die Form – der suchende Versuch des Geistes,
            das Chaos zu ordnen; zugleich der Moment, in dem Trocknung und Formfindung die Masse
            festlegen.
          </p>
          <p>
            <span className="hg-label">Element III – Der algorithmische Code (Spitze)</span>
            Perfekt glatte, mathematische Geometrie. Feinstes Ton-Weben oder Mishima-Intarsien
            tragen das 2/2-Köper-Zickzackmuster in scharfem Hell-Dunkel-Kontrast – so präzise,
            als wäre es von einer KI berechnet oder von einem 3D-Drucker erzeugt. Nach dem Brand:
            dauerhafter Stein, festgeschriebenes Muster.
          </p>
        </section>

        <section>
          <h2>5. Die Ausstellungsserie – drei autonome Einzelvarianten</h2>
          <p>
            Mehrere Einzelobjekte variieren das Thema aus unterschiedlichen bildhauerischen
            Blickwinkeln – jeweils so, dass auch der Prozess der Materie ablesbar bleibt.
          </p>

          <h3>Variante A – „Der codierte Ausbruch“</h3>
          <p>
            Fokus: Keilform und Grafik. Amorphe, kraterartige Tonform (Chaosgott), durchbrochen
            von einer messerscharfen diagonalen Schnittkante – abstrakte Silhouette der Axt.
            Der Schnitt legt eine flache Oberfläche frei, via Mishima mit dem fehlerfreien
            Herringbone-Code überzogen. Aussage: Das rationale Datenraster seziert und zähmt die
            unberechenbare Urform – und der Brand macht den Schnitt unwiderruflich.
          </p>

          <h3>Variante B – „Die algorithmische Stele“</h3>
          <p>
            Fokus: Vertikalität und Haptik. Sich nach oben windender Torso, Spitze in elegantem
            asymmetrischem Knick nach vorne (Abstraktion des Axtschafts). Reales dreidimensionales
            Ton-Weben an der Spitze: in der Mitte ungeordnetes Datenrauschen, nach oben makelloses
            geflochtenes Gewebe. Aussage: Evolution als Aufstieg – mathematisches Wissen übernimmt
            fließend die Kontrolle über die organische Materie; die Haptik zeigt den Weg vom
            Weichen zum Verdichteten.
          </p>

          <h3>Variante C – „Der gespaltene Monolith“</h3>
          <p>
            Fokus: Hohlraum und Relief. Scheinbar geschlossener, rauer, dunkler Felsblock. Ein
            tiefer, geschwungener Spalt bildet als Negativraum die Silhouette der Zeremonialaxt.
            Das Innere des Spalts trägt ein feines Relief-Prägemuster des Köpergeflechts. Aussage:
            Die Entdeckung – mathematische Perfektion und gesammeltes Wissen (KI/Kultur) liegen
            geschützt im Inneren des rauen, geschichtlichen Erbes; der Spalt ist zugleich Schnitt
            durch die Metamorphose: außen Erde, innen Code in Stein.
          </p>
        </section>

        <section>
          <h2>6. Materialästhetik und Ausführung</h2>
          <p>
            <span className="hg-label">Scherben</span>
            Kontrast zwischen grobem, eisenhaltigem Steinzeugton (Chaos, erdige Masse) und feinem,
            weißem Porzellan oder Steinzeug (Muster, verdichteter Code). Der Wechsel der Tone ist
            Teil der Erzählung von der Metamorphose – nicht nur optischer Effekt.
          </p>
          <p>
            <span className="hg-label">Oberfläche</span>
            Absoluter Verzicht auf glänzende Glasuren. Brand unglasiert im Steinzeugbereich –
            ehrliche, steinerne Textur des Schiefers und matte Haptik der Pflanzenfasern. So bleibt
            der Brand als Verwandlung lesbar: kein Überzug verdeckt, was Hitze und Zeit aus der
            Erde gemacht haben.
          </p>
          <p>
            <span className="hg-label">Prozesssichtbarkeit</span>
            Spuren des Machens – Riss, Naht, Gewebeband, Schnittkante – bleiben bewusst stehen.
            Der keramische Prozess soll nicht hinter dem Motiv verschwinden, sondern als eigene
            Schicht der Ausstellung mitwirken: Chaos, Ordnung, Steinwerdung.
          </p>
        </section>

        <footer className="hg-foot">
          Projekt 100 Generationen · Chaos &amp; Code · Konzept und Manifest
          <br />
          Eigenständiges künstlerisches Vorhaben (nicht K2-Galerie-Software).
        </footer>
      </div>

      <div className="seitenfuss" aria-hidden="true" />
    </div>
  )
}
