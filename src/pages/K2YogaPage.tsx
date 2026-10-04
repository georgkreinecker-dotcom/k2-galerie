import { Link } from 'react-router-dom'
import { K2_GALERIE_APF_EINSTIEG } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

/**
 * K2 YOGA – APf-Projekt. Eine Form: Lehrgang bleibt sichtbar.
 */
export default function K2YogaPage() {
  return (
    <div className="k2-yoga-page">
      <style>{`
        .k2-yoga-page {
          min-height: 100vh;
          background: #f6f2eb;
          color: #1c1a18;
          font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif;
        }
        .k2-yoga-page .yoga-shell {
          max-width: 44rem;
          margin: 0 auto;
          padding: 1.1rem 1.15rem 2.4rem;
        }
        .k2-yoga-page .yoga-nav {
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 0.8rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem 0.9rem;
          margin: 0 0 0.9rem;
        }
        .k2-yoga-page .yoga-nav a { color: #5b21b6; font-weight: 600; text-decoration: none; }
        .k2-yoga-page .yoga-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin: 0 0 0.85rem;
        }
        .k2-yoga-page .yoga-actions button {
          font: 700 0.88rem ui-sans-serif, system-ui, sans-serif;
          background: #b54a1e;
          color: #fff;
          border: 0;
          border-radius: 10px;
          padding: 0.5rem 1rem;
          cursor: pointer;
        }
        .k2-yoga-page .yoga-blatt {
          background: #fffefb;
          padding: 1.15rem 1.3rem 1.2rem;
          border-radius: 10px;
          box-shadow: 0 8px 28px rgba(40, 30, 20, 0.08);
        }
        .k2-yoga-page .kicker {
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6d28d9;
          font-weight: 700;
          margin: 0 0 0.25rem;
        }
        .k2-yoga-page h1 { font-size: 1.28rem; margin: 0 0 0.5rem; line-height: 1.25; }
        .k2-yoga-page h2 {
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 0.88rem;
          margin: 0.95rem 0 0.32rem;
          color: #5b21b6;
        }
        .k2-yoga-page p { margin: 0 0 0.55rem; font-size: 10.5pt; line-height: 1.5; }
        .k2-yoga-page .satz {
          background: #f5f3ff;
          border-left: 4px solid #7c3aed;
          padding: 0.55rem 0.75rem;
          margin: 0.5rem 0 0.8rem;
          font-weight: 600;
        }
        .k2-yoga-page table {
          width: 100%;
          border-collapse: collapse;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 0.8rem;
          margin: 0.2rem 0 0.7rem;
        }
        .k2-yoga-page th, .k2-yoga-page td {
          text-align: left;
          padding: 0.32rem 0.4rem;
          border-bottom: 1px solid #e8e4dc;
          vertical-align: top;
        }
        .k2-yoga-page th { color: #5c5650; font-weight: 600; }
        .k2-yoga-page ol { margin: 0 0 0.65rem; padding-left: 1.2rem; }
        .k2-yoga-page li { margin: 0 0 0.22rem; }
        .k2-yoga-page .fuss {
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 0.75rem;
          color: #5c5650;
          margin-top: 0.7rem;
        }
        .k2-yoga-page .seitenfuss { display: none; }
        @media print {
          .k2-yoga-page .yoga-nav, .k2-yoga-page .yoga-actions { display: none !important; }
          .k2-yoga-page { background: #fff; }
          .k2-yoga-page .yoga-blatt { box-shadow: none; }
          .k2-yoga-page .seitenfuss {
            display: block;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-family: ui-sans-serif, system-ui, sans-serif;
            font-size: 8pt;
            color: #5c5650;
          }
          .k2-yoga-page .seitenfuss::after { content: "Seite " counter(page); }
        }
      `}</style>
      <div className="yoga-shell">
        <nav className="yoga-nav" aria-label="APf">
          <Link to={K2_GALERIE_APF_EINSTIEG}>← APf</Link>
        </nav>
        <div className="yoga-actions">
          <button type="button" onClick={() => window.print()}>Drucken</button>
        </div>
        <article className="yoga-blatt">
          <p className="kicker">K2 YOGA · Projekt</p>
          <h1>Der Lehrgang bleibt sichtbar</h1>
          <p className="satz">Die anderen verkaufen den Kurs. Wir machen sichtbar, was danach bleibt.</p>
          <p>
            Yogalehrer-Ausbildungen klingen überall gleich. Abheben geht nicht über noch mehr Text auf der Website –
            sondern über einen Ort, den Teilnehmer und Absolventen wirklich benutzen, ohne Extra-Arbeit.
          </p>

          <h2>1. Eine Form für alle</h2>
          <p>
            Ein Lehrgang = eine kleine Fläche. Dieselbe Form in Wels, Graz, Innsbruck, online.
            Kein neues System pro Ort. Kein Lernportal. Keine zweite Website.
          </p>
          <table>
            <thead>
              <tr>
                <th>Wer</th>
                <th>Was sie tun</th>
                <th>Aufwand</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Büro</td>
                <td>Lehrgang anlegen: Name, Ort, Bild, Leiter:in, nächste Termine, Teilnehmerliste</td>
                <td>einmal, ca. 20 Minuten – die Liste gibt es ohnehin</td>
              </tr>
              <tr>
                <td>Lehrende</td>
                <td>Termine so lassen, wie sie schon geplant sind</td>
                <td>kein Extra-Schreiben</td>
              </tr>
              <tr>
                <td>Teilnehmer</td>
                <td>einen QR scannen: Gruppe, nächster Block, Unterlagen</td>
                <td>ein Scan</td>
              </tr>
              <tr>
                <td>Danach</td>
                <td>dieselbe Fläche bleibt – wird zur Praxis-Karte der Absolventin</td>
                <td>kein zweites Anlegen</td>
              </tr>
            </tbody>
          </table>

          <h2>2. Was man sieht</h2>
          <p>
            Nicht „noch ein Zertifikat“. Ein Haus: die Akademie. Darin Zimmer: jeder Lehrgang.
            Nach dem Abschluss bleibt das Zimmer stehen – mit Gesicht, Ort, nächsten Stunden.
          </p>

          <h2>3. Was man nicht tut</h2>
          <p>
            Keine Skripte ins Netz. Keine tägliche Betreuung. Keine zehn Apps.
            Was schon auf der Liste steht, wird einmal übernommen.
          </p>

          <h2>4. Pilot</h2>
          <ol>
            <li>Ein Lehrgang, ein Ort (z. B. 300 Stunden Oberösterreich).</li>
            <li>Kleingruppe wie immer (6–14).</li>
            <li>Drei Dinge im Alltag: QR am Infoabend, Termine, Namen der Gruppe.</li>
            <li>Am Ende: Fläche bleibt für die, die unterrichten wollen.</li>
          </ol>
          <p>Wenn es sich im Alltag trägt, dieselbe Form für den nächsten Lehrgang. Wenn nicht: abschalten.</p>

          <h2>5. Warum das halten kann</h2>
          <p>
            Es hängt nicht an Sonderaktionen. Es hängt an einem Ablauf, den das Büro sowieso macht –
            nur an einem Ort, den Menschen danach noch brauchen.
          </p>
          <p className="fuss">
            {PRODUCT_COPYRIGHT_BRAND_ONLY}
            <br />
            {PRODUCT_URHEBER_ANWENDUNG}
          </p>
        </article>
      </div>
      <div className="seitenfuss" />
    </div>
  )
}
