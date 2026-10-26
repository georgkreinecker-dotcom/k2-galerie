import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PLATFORM_ROUTES, HUNDRED_GENERATION_FLAECHE_ROUTE, HUNDRED_GENERATION_ENTWURFSMAPPE_ROUTE } from '../config/navigation'
import {
  HUNDRED_GENERATION_LICHT,
  HUNDRED_GENERATION_LICHT_FOTO,
  HUNDRED_GENERATION_MODELLE,
} from '../config/hundredGenerationEntwuerfe'
import { HundredGenerationSchrift } from '../components/hundredGeneration/HundredGenerationSchrift'
import '../App.css'

/**
 * Künstlerisches Projekt „100 Generationen“ – Ausstellungskonzept Chaos & Code.
 * Eigenständig von der K2-Galerie-Software; fertige Lese- und Druckfassung.
 */

const UMGESETZTE_WERKE = [
  {
    src: '/100-generation/umgesetzt/werk-01-axtblatt-ahnenraster.jpg',
    title: 'Axtblatt',
    note: 'Köper über die ganze Fläche. In der Mitte das Ahnenraster, rosa eingelegt. Die Axt trägt den Code schon auf sich.',
  },
  {
    src: '/100-generation/umgesetzt/werk-02-stele.jpg',
    title: 'Stele',
    note: 'Rauer Fuß, darüber der Stamm. Links geprägtes Muster, rechts Punktfeld. Chaos steigt in Ordnung auf.',
  },
  {
    src: '/100-generation/umgesetzt/werk-03-bogen.jpg',
    title: 'Bogen',
    note: 'Grober Ring, im Durchbruch das helle Pyramidenraster, unten ein feines Linienband. Der Code sitzt im Spalt.',
  },
] as const

const CODE_ENTWUERFE = [
  {
    src: '/100-generation/entwuerfe-code/entwurf-code-01-brandmauer.jpg',
    title: 'Entwurf 1 · Brandmauer',
    note: 'Die raue Masse läuft gegen eine Naht und kommt nicht weiter. Dahinter Köper und Ahnenraster. Der Code bestimmt die Grenze.',
  },
  {
    src: '/100-generation/entwuerfe-code/entwurf-code-02-weg-endet.jpg',
    title: 'Entwurf 2 · Der Weg endet',
    note: 'Ein rissiger Fluss aus Ton stirbt an der Musterplatte. Wer die Bauart bricht, verliert den Weg. Kein Schlag, ein Ende.',
  },
  {
    src: '/100-generation/entwuerfe-code/entwurf-code-03-norm-im-kern.jpg',
    title: 'Entwurf 3 · Norm im Kern',
    note: 'Die schwere Masse hängt an einer Säule aus Code. Ohne dieses Rückgrat sackt die Form zusammen. Die Norm trägt.',
  },
] as const

const CODE_ENTWUERFE_OHNE_MUSTER = [
  {
    src: '/100-generation/entwuerfe-code/entwurf-code-04-horizont.jpg',
    title: 'Entwurf 4 · Die Fuge',
    note: 'Kein Muster. Eine gemessene waagrechte Lücke schneidet die raue Säule. Der Code ist der Schnitt.',
  },
  {
    src: '/100-generation/entwuerfe-code/entwurf-code-05-leere.jpg',
    title: 'Entwurf 5 · Die Leere',
    note: 'Kein Flechtwerk. Ein genauer Kreis aus Nichts durch die grobe Platte. Was fehlt, bestimmt das Stück.',
  },
  {
    src: '/100-generation/entwuerfe-code/entwurf-code-06-kugel.jpg',
    title: 'Entwurf 6 · Die Kugel',
    note: 'Keine Raster. Eine genaue Kugel trägt die wirre Masse. Die ideale Form ist das Gesetz.',
  },
] as const

const CHAOSGOTT = HUNDRED_GENERATION_MODELLE.find((m) => m.id === 'chaosgott')

function WerkRaster({
  werke,
}: {
  werke: readonly { src: string; title: string; note: string }[]
}) {
  return (
    <div className="hg-werke-grid">
      {werke.map((werk) => (
        <figure key={werk.src} className="hg-werk">
          <img src={werk.src} alt={werk.title} />
          <figcaption>
            <strong>{werk.title}</strong>
            <span>{werk.note}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

const FUGEN_ENTWUERFE = [
  {
    src: '/100-generation/entwuerfe-code/entwurf-fuge-01-polygon-frei.jpg',
    title: 'Entwurf 7 · Das Polygon',
    note: 'Granit gegen Keramik. Die Zickzackfuge schließt auf den Millimeter. Grau bleibt Stein, hell bleibt Ton.',
  },
  {
    src: '/100-generation/entwuerfe-code/entwurf-fuge-02-negativ-frei.jpg',
    title: 'Entwurf 8 · Das Negativ',
    note: 'Der raue Stein schwebt über seinem Abdruck. Jede Kante hat ihre Mulde in der Keramik.',
  },
  {
    src: '/100-generation/entwuerfe-code/entwurf-fuge-03-einsatz-frei.jpg',
    title: 'Entwurf 9 · Der Einsatz',
    note: 'Eine keramische Fläche sitzt bündig im Granit. Die Fuge ist nur eine Haarlinie.',
  },
  {
    src: '/100-generation/entwuerfe-code/entwurf-fuge-04-ebene-frei.jpg',
    title: 'Entwurf 10 · Die Ebene',
    note: 'Der Stein bleibt gebrochen. Eine Seite ist eine tote, genaue Fläche aus Keramik.',
  },
  {
    src: '/100-generation/entwuerfe-code/entwurf-fuge-05-dichtung-frei.jpg',
    title: 'Entwurf 11 · Die Welle',
    note: 'Zwei Steine. Dazwischen eine dünne Keramik, die der Bruchlinie folgt.',
  },
  {
    src: '/100-generation/entwuerfe-code/entwurf-fuge-06-schnitt-frei.jpg',
    title: 'Entwurf 12 · Der Schnitt',
    note: 'Der Granit ist geöffnet. Innen liegt Keramik, auf den Millimeter an den Stein gegossen.',
  },
] as const

export default function HundredGenerationPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = window.location.hash.replace('#', '')
    if (!id) return
    const el = document.getElementById(id)
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
        .hundert-generation-page .hg-schriften {
          margin: 0.4rem 0 0;
          padding-left: 1.15rem;
          color: var(--hg-ink);
        }
        .hundert-generation-page .hg-schriften a {
          color: var(--hg-accent);
        }
        .hundert-generation-page .hg-schrift {
          background: #fffefb;
          color: #1c1a18;
          border-radius: 12px;
          padding: 1.15rem 1.15rem 0.35rem;
          margin: 1.1rem 0 0.4rem;
        }
        .hundert-generation-page .hg-schrift p,
        .hundert-generation-page .hg-schrift li {
          line-height: 1.55;
        }
        .hundert-generation-page .hg-schriften li {
          margin: 0.75rem 0;
        }
        .hundert-generation-page .hg-schriften li span {
          display: block;
          margin-top: 0.2rem;
          color: var(--hg-muted);
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
        .hundert-generation-page .hg-werke-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
          gap: 0.85rem;
          margin: 0.75rem 0 0;
        }
        .hundert-generation-page .hg-werk {
          margin: 0;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(212, 160, 23, 0.35);
          border-radius: 10px;
          overflow: hidden;
        }
        .hundert-generation-page .hg-werk img {
          display: block;
          width: 100%;
          height: auto;
          background: #f4efe8;
        }
        .hundert-generation-page .hg-werk figcaption {
          padding: 0.65rem 0.75rem 0.8rem;
          font-family: system-ui, sans-serif;
        }
        .hundert-generation-page .hg-werk figcaption strong {
          display: block;
          font-size: 0.95rem;
          color: var(--hg-ink);
          margin-bottom: 0.25rem;
        }
        .hundert-generation-page .hg-werk figcaption span {
          font-size: 0.82rem;
          line-height: 1.4;
          color: var(--hg-muted);
        }
        .hundert-generation-page section {
          scroll-margin-top: 0.75rem;
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
          .hundert-generation-page footer.hg-foot,
          .hundert-generation-page .hg-werk figcaption span {
            color: #5c5650;
          }
          .hundert-generation-page .hg-werk figcaption strong {
            color: #1c1a18;
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

        <p className="hg-kicker">Ausstellung · Objekte und Schrift</p>
        <h1>100 Generationen</h1>
        <p className="hg-subtitle">Chaos &amp; Code: Die Evolution des Musters</p>
        <div className="hg-chapters no-print">
          <a href="#chaos">1 · Chaos</a>
          <a href="#axt">2 · Axt</a>
          <a href="#code">3 · Code</a>
          <a href="#stein">4 · Stein</a>
          <a href="#licht">5 · Licht</a>
          <Link to={HUNDRED_GENERATION_ENTWURFSMAPPE_ROUTE}>🗂️ Entwurfsmappe</Link>
          <Link to={HUNDRED_GENERATION_FLAECHE_ROUTE}>🖼️ Fläche – Bild</Link>
        </div>
        <p className="hg-lede">
          Was fest scheint, ist ein Zustand derselben Materie. Über hundert
          Generationen hält Wissen diesen Zustand in Form: Muster, Axt, Stein,
          Code. Reißt die Kette, hält man den Zustand für ein Wesen. Das Projekt
          zeigt den Übergang. Ton wird Stein. Stein wird wieder Masse. Der Code
          ist das Wissen von heute. Öffentlich bleibt er ein Rezept. Verschlossen
          wird er der nächste Stein.
        </p>
        <p className="hg-lede">
          Der Rundgang hat fünf Schritte. Zu jedem Schritt steht ein Objekt,
          gebaut oder als Entwurf. Die Schrift führt durch den Gedanken dahinter.
          Essay und Botschaft sind keine eigenen Räume. Sie sind die Schrift des
          dritten und des fünften Schritts. Die Entwurfsmappe ist die Werkstatt,
          nicht der Gang.
        </p>

        <section id="chaos">
          <h2>1 · Chaos</h2>
          <p>
            Dieses Projekt untersucht die fundamentale menschliche und technologische Konstante:
            das Bändigen des Chaos durch das Muster.
          </p>
          <p>
            Die Chaosgötter verkörpern die totale Formlosigkeit, das eruptive, unvorhersehbare
            Leben und die ungezähmte Natur. Sie sind die biologische Masse, aus der alles entsteht.
            Im Kontext dieses Projekts stehen sie auch für die ersten 100 Generationen der
            Menschheit, die im Hochland von Neuguinea in direkter, rauer Konfrontation mit der
            Natur lebten.
          </p>
          <p>
            <span className="hg-label">Objekt · gebaut</span>
            Die Stele steigt aus dieser Masse. Unten der raue Fuß, oben die erste Ordnung.
          </p>
          <WerkRaster werke={[UMGESETZTE_WERKE[1]]} />
          <p>
            Fokus der Stele: Vertikalität und Haptik. Ein sich nach oben windender Torso.
            Unten ungeordnetes Datenrauschen, nach oben das geflochtene Gewebe. Evolution als
            Aufstieg – das Wissen übernimmt fließend die Kontrolle über die organische Materie.
          </p>
          {CHAOSGOTT ? (
            <>
              <p>
                <span className="hg-label">Objekt · Entwurf</span>
                Der Chaosgott ist die Masse, bevor ein Muster sie hält. Noch nicht in Ton.
              </p>
              <WerkRaster
                werke={[{ src: CHAOSGOTT.src, title: CHAOSGOTT.title, note: CHAOSGOTT.note }]}
              />
            </>
          ) : null}
        </section>

        <section id="axt">
          <h2>2 · Die Axt</h2>
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
            historisch den Wendepunkt, an dem westliches Wissen auf die jahrtausendealte
            Muster-Struktur der Ahnen traf.
          </p>
          <p>
            Das 2/2-Köper-Flechtmuster der Axt ist bereits ein Datenraster: über Generationen
            mathematisch perfektioniert. Das Muster ist der Code, der das Chaos bändigt.
          </p>
          <p>
            <span className="hg-label">Objekt · gebaut</span>
            Das Axtblatt trägt dieses Raster schon auf sich.
          </p>
          <WerkRaster werke={[UMGESETZTE_WERKE[0]]} />
          <p>
            Die Form dazu: eine amorphe Masse, durchbrochen von einer messerscharfen Schnittkante,
            der Silhouette der Axt. Der Schnitt legt das fehlerfreie Herringbone-Muster frei.
            Das rationale Raster seziert die unberechenbare Urform. Der Brand macht den Schnitt
            unwiderruflich.
          </p>
        </section>

        <section id="code">
          <h2>3 · Der Code</h2>
          <p>
            Die Zeremonialaxt war die Insignie des Wendepunkts: Respekt, Wissen, die Macht,
            Chaos zu ordnen. Heute wird diese Axt durch den Code der Künstlichen Intelligenz
            ersetzt. Was damals in der Hand lag, liegt jetzt in der Architektur der Systeme.
            Der Code speichert, ordnet und entscheidet mit, wer handeln kann.
          </p>
          <p>
            Nicht nur das Muster steht für Wissen. Der Code selbst ist die neue Insignie.
            Er tritt an die Stelle der Axt.
          </p>
          <p>
            <span className="hg-label">Objekt · gebaut</span>
            Der Bogen hält den Code im Spalt.
          </p>
          <WerkRaster werke={[UMGESETZTE_WERKE[2]]} />
          <p>
            Die Form dazu: ein rauer, dunkler Block. Ein tiefer Spalt bildet als Negativraum
            die Silhouette der Axt. Innen liegt das Köpergeflecht. Außen Erde, innen Code in Stein.
          </p>
          <p>
            <span className="hg-label">Objekte · Entwürfe</span>
            Sechs Körper, noch nicht gebaut. Der Code bestimmt, wo die Masse aufhört, wo ein Weg
            endet, was die Form trägt, und wo Schnitt, Leere und Kugel das Gesetz sind.
          </p>
          <WerkRaster werke={CODE_ENTWUERFE} />
          <WerkRaster werke={CODE_ENTWUERFE_OHNE_MUSTER} />
          <p>
            <span className="hg-label">Schrift dieses Schritts</span>
            Der Essay führt durch die Gedankenwelt dieser Ersetzung: die Hoffnung auf eine
            unbestechliche Maschine, die Illusion der einen Weltmacht, die Brandmauer, die bleibt.
            Thesenpapier und Umsetzungspapier sind die Quellen dahinter.
          </p>
          <HundredGenerationSchrift
            id="essay"
            path="/notizen-georg/diverses/essay-bessere-welt-durch-ki.md"
          />
          <p>
            Die eine unbestechliche Weltmaschine, die den Frieden erzwingt, ist eine Illusion.
            Was bleibt, ist die Brandmauer: Norm im Kern, Recht und Beleg, offene Netze. Gebaut
            wird sie im gewöhnlichen Leben. Die Maschine ersetzt den Menschen nicht. So hat die
            Axt das Chaos nicht abgeschafft. Sie hat es gezeichnet. Der Code zeichnet es heute.
          </p>
          <ul className="hg-schriften">
            <li>
              <a href="/notizen-georg/diverses/thesenpapier-ki-betriebssystem-weltfrieden.md">
                Thesenpapier · Die KI als unbestechliches Betriebssystem des Weltfriedens
              </a>
            </li>
            <li>
              <a href="/notizen-georg/diverses/umsetzungspapier-ki-betriebssystem-weltfrieden.md">
                Umsetzungspapier · Was fehlt noch zur Umsetzung
              </a>
            </li>
          </ul>
        </section>

        <section id="stein">
          <h2>4 · Der Stein gibt nach</h2>
          <p>
            Die millimetergenaue Fuge der großen Steine war kein Rätsel der Kraft.
            Sie war ein Rezept. Wasserglas macht Stein wieder zur Masse. Zwei Körper
            finden sich, solange sie nachgeben. Dann werden sie wieder Stein. Die
            Passung ist gegossen, nicht geschlagen. Dieses Wissen ist nicht verloren,
            weil es falsch war. Es ist vergessen, weil die Kette riss.
          </p>
          <p>
            <span className="hg-label">Die Frage</span>
            Für uns Menschen ist der Stein das Feste, das Unumstößliche. In der Materie
            ist er dasselbe wie alles andere um uns: homogen, nur in einem Zustand, der
            sich hart anfühlt. Was wir für ein Wesen halten, ist ein Zustand.
          </p>
          <p>
            <span className="hg-label">Die eigene Hand</span>
            Der Künstler hat das am Stein gelernt. Vor etwa zwanzig Jahren begann die
            Kunst, etwa fünf Jahre lang an Steinskulpturen. Danach kam die Keramik.
            Die Hand kennt den Widerstand. Wenn der Stein nachgeben kann, dann ist auch
            das, was wir für unverrückbar halten, nur Materie in einem festen Zustand.
          </p>
          <p>
            Ton wird im Brand zu Stein. Stein wird durch das Rezept wieder formbar.
            Der Code ist hier keine Klinge. Er ist die Kenntnis, wann die Masse weich
            ist und wann sie fest wird. Hundert Generationen sind diese Kette. Die Axt
            zeichnet das Chaos. Das Rezept öffnet den Stein. Die KI ist die Frage, ob
            ein Code heute noch einmal abreißen kann, oder ob er öffentlich bleibt.
          </p>
          <p>
            <span className="hg-label">Objekte · Entwürfe</span>
            Sechs Fugen. Stein bleibt grau, Keramik bleibt hell. Die Präzision sitzt
            in der Fuge. Noch nicht gebaut.
          </p>
          <WerkRaster werke={FUGEN_ENTWUERFE} />
        </section>

        <section id="licht">
          <h2>5 · Das Licht</h2>
          <p>
            Drei Körper aus dem 26. Oktober. Kein Schwert, kein Schalter.
            Dieselbe Sprache wie die Naht und die Fuge: Masse, Öffnung, Abstand.
            Das Licht geht nicht als Schlag hinaus. Es lässt eine Tür offen.
          </p>
          <p>
            <span className="hg-label">Objekte · Entwürfe</span>
            Noch nicht in Ton. Von links: Zwei Türen, der Strahl, das Mysterium.
          </p>
          <figure className="hg-werk">
            <img src={HUNDRED_GENERATION_LICHT_FOTO} alt="Drei Körper: Zwei Türen, der Strahl, das Mysterium" />
            <figcaption>
              <strong>Das Licht · 26. Oktober</strong>
              <span>Von links: Zwei Türen, der Strahl, das Mysterium.</span>
            </figcaption>
          </figure>
          <ul className="hg-schriften">
            {HUNDRED_GENERATION_LICHT.map((e) => (
              <li key={e.id}>
                <strong>{e.title}</strong>
                <span>{e.note}</span>
              </li>
            ))}
          </ul>
          <p>
            <span className="hg-label">Schrift dieses Schritts</span>
            Die Botschaft führt durch die Gedankenwelt dieser Körper: nicht kämpfen,
            die Tür offen lassen, den Strahl, das Mysterium.
          </p>
          <HundredGenerationSchrift
            id="botschaft"
            path="/notizen-georg/diverses/botschaft-des-guten-im-netz.md"
          />
          <p className="no-print">
            <Link to={`${HUNDRED_GENERATION_ENTWURFSMAPPE_ROUTE}#licht`}>
              In der Entwurfsmappe öffnen
            </Link>
          </p>
        </section>

        <section id="hand">
          <h2>Auf jedem Objekt</h2>
          <p>
            Die fünf Schritte sind der Gang. Was folgt, ist die Hand. Keramik ist keine
            Technik, mit der ein Motiv auf Ton gesetzt wird. Sie ist die Verwandlung:
            aus Erde wird Form, aus Form wird Stein. Jedes Werk trägt diese Verwandlung
            mit, nicht nur ein Thema.
          </p>
          <p>
            <span className="hg-label">Chaos – der plastische Zustand</span>
            Nasser Ton ist das Ur-Chaos der Werkstatt: nachgiebig, schwer, lebendig.
            Druck, Riss, Schamotte, Abdruck bleiben umkehrbar, bis der Prozess weitergeht.
          </p>
          <p>
            <span className="hg-label">Wendepunkt – Trocknung und Haut</span>
            Beim Trocknen verlässt das Wasser die Masse. Die Form verhärtet, die Oberfläche
            wird Haut. Die Hand kann korrigieren, aber nicht mehr beliebig.
          </p>
          <p>
            <span className="hg-label">Code – Brand und Steinwerdung</span>
            Im Brand wird, was weich war, dauerhaft. Der Brand ist der Algorithmus der Erde:
            Hitze, Zeit, Atmosphäre schreiben den Code in die Materie.
          </p>
          <p>
            <span className="hg-label">Drei Schichten, auf jedem Stück</span>
            Unten grober, dunkler, aufgerissener Ton. In der Mitte der Übergang, erste Bänder,
            die Masse sucht Ordnung. Oben glatte Geometrie, das Köpermuster, nach dem Brand
            festgeschrieben.
          </p>
          <p>
            <span className="hg-label">Scherben</span>
            Grober, eisenhaltiger Ton gegen feines, helles Steinzeug. Der Wechsel der Tone
            ist die Erzählung, nicht ein Effekt.
          </p>
          <p>
            <span className="hg-label">Oberfläche</span>
            Keine glänzende Glasur. Brand unglasiert. So bleibt lesbar, was Hitze und Zeit
            aus der Erde gemacht haben.
          </p>
          <p>
            <span className="hg-label">Prozesssichtbarkeit</span>
            Riss, Naht, Gewebeband, Schnittkante bleiben stehen. Der Prozess verschwindet
            nicht hinter dem Motiv.
          </p>
        </section>

        <p className="hg-lede no-print" id="entwuerfe">
          Weitere Modelle, Mythos-Varianten und drehbare Ansichten liegen in der Werkstatt:{' '}
          <Link to={HUNDRED_GENERATION_ENTWURFSMAPPE_ROUTE} style={{ color: 'var(--hg-accent)' }}>
            Entwurfsmappe öffnen →
          </Link>
        </p>

        <footer className="hg-foot">
          Projekt 100 Generationen · Chaos &amp; Code · Ausstellung
          <br />
          Eigenständiges künstlerisches Vorhaben (nicht K2-Galerie-Software).
        </footer>
      </div>

      <div className="seitenfuss" aria-hidden="true" />
    </div>
  )
}
