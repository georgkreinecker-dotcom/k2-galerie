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
          <p className="satz">
            Ziel: Nach dem Lehrgang hat jede Person einen eigenen Internetauftritt – wie eine Galerie.
          </p>
          <p>
            Dieselbe Form wie bei K2: Willkommen, Termine, Kontakt, QR – nicht eine Visitenkarte,
            sondern ein kleines Haus im Netz. Eine Struktur, viele Häuser. Kein Webdesigner. Kein zweites System.
          </p>

          <h2>1. Eine Form für alle</h2>
          <p>
            Zuerst der Lehrgang: eine gemeinsame Galerie für die Gruppe.
            Am Ende: aus derselben Form wird für jede Teilnehmerin, jeden Teilnehmer ein eigenes Haus.
            Wels, Graz, Innsbruck, online – immer dasselbe. Kein Lernportal. Keine extra Website bauen.
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
                <td>Lehrgang-Galerie anlegen: Name, Ort, Bild, Leiter:in, Termine, Teilnehmerliste</td>
                <td>einmal, ca. 20 Minuten – die Liste gibt es ohnehin</td>
              </tr>
              <tr>
                <td>Lehrende</td>
                <td>Termine so lassen, wie sie schon geplant sind</td>
                <td>kein Extra-Schreiben</td>
              </tr>
              <tr>
                <td>Teilnehmer</td>
                <td>in der Lehrgang-Galerie leben: Gruppe, nächster Block, Unterlagen</td>
                <td>ein QR</td>
              </tr>
              <tr>
                <td>Danach</td>
                <td>eigene Galerie: Willkommen, Stunden, Kontakt – Name und Bild aus der Liste</td>
                <td>kein neues System, nur die eigene Fläche öffnen</td>
              </tr>
            </tbody>
          </table>

          <h2>2. Was die angehenden Lehrer davon haben</h2>
          <p>
            In der Ausbildung: sie sind schon in einer Galerie – der des Lehrgangs. Nicht anonym in einem Chat.
          </p>
          <p>
            Nach dem Diplom: sie gehen nicht mit einem Papier nach Hause. Sie haben denselben Auftritt
            wie eine Galerie: eigene Adresse im Netz, eigenes Willkommen, eigene Termine, eigener QR.
            Menschen können sie finden und kommen. Genau das, wofür andere extra eine Website brauchen.
          </p>
          <p>
            Was sie nicht bekommen: extra Lernstoff, Moodle, eine Baustelle. Die Form ist schon da –
            wie bei der Galerie, nur mit ihrem Namen.
          </p>

          <h2>3. Was man sieht</h2>
          <p>
            Akademie = das große Haus. Lehrgang = eine Galerie darin. Absolvent = eine eigene Galerie daneben.
            Dieselbe Sprache, dieselbe Bedienung. Die 200-Stunden-Konkurrenz gibt ein Zertifikat. Hier bleibt ein Auftritt.
          </p>

          <h2>4. Was man nicht tut</h2>
          <p>
            Keine Skripte ins Netz. Keine tägliche Betreuung. Keine zehn Apps.
            Was schon auf der Liste steht, füllt die eigene Galerie – nicht zweimal erfinden.
          </p>

          <h2>5. Pilot</h2>
          <ol>
            <li>Ein Lehrgang, ein Ort (z. B. 300 Stunden Oberösterreich).</li>
            <li>Gemeinsame Lehrgang-Galerie für die Gruppe.</li>
            <li>Am Ende: für jede Person die eigene Galerie aus derselben Form.</li>
            <li>Wenn es sich trägt: nächster Lehrgang genauso. Wenn nicht: abschalten.</li>
          </ol>

          <h2>6. Warum das halten kann</h2>
          <p>
            Das Büro macht sowieso Liste und Termine. Der Auftritt danach ist kein Extra-Projekt –
            er ist dasselbe Haus, nur mit eigenem Namen. Deshalb ist es für alle lebbar.
          </p>

          <h2>7. Konkrete Umsetzung – mit dem, was schon da ist</h2>
          <p>
            Kein neues Produkt bauen. Jede Galerie im Netz ist bei uns schon ein Mandant:
            Adresse <strong>/g/…</strong>, Bearbeiten <strong>/admin?tenantId=…</strong>,
            Daten im eigenen Speicher, nicht in der K2-Galerie von Martina und Georg.
            Genau so entsteht der Yoga-Auftritt.
          </p>

          <h2>Zwei Häuser, eine Form</h2>
          <table>
            <thead>
              <tr>
                <th>Was</th>
                <th>Entspricht</th>
                <th>Im Netz</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lehrgang</td>
                <td>eine Galerie für die Gruppe</td>
                <td>eine Adresse, ein QR für alle Teilnehmer</td>
              </tr>
              <tr>
                <td>Absolvent</td>
                <td>dieselbe Galerie, eigener Name</td>
                <td>eigene Adresse, eigener QR, eigener Admin</td>
              </tr>
            </tbody>
          </table>
          <p>
            Inhalt der Absolventen-Galerie: Willkommen, Bild, nächste Stunden (Termine), Kontakt.
            „Werke“ müssen nicht Kunst sein – später Angebote oder nichts. Zuerst Termine und Gesicht.
          </p>

          <h2>Was das Büro wirklich klickt</h2>
          <ol>
            <li>
              <strong>Lehrgang anlegen</strong> – Name, Ort, Leiter:in, Zeitraum. Einmal.
              Es entsteht die Lehrgang-Galerie (wie nach einem Lizenzkauf, nur ohne Zahlung).
            </li>
            <li>
              <strong>Liste</strong> – Namen wie immer (6–14). Das ist die Teilnehmerliste, kein zweites Formular.
            </li>
            <li>
              <strong>QR Lehrgang</strong> – ein Blatt für Infoabend und WhatsApp. Alle leben in derselben Galerie.
            </li>
            <li>
              <strong>Am Ende: Galerien anlegen</strong> – ein Klick. Für jede Person auf der Liste wird
              automatisch ein Mandant erzeugt: Name und Bild rüber, Willkommen mit ihrem Namen.
            </li>
            <li>
              <strong>Blatt drucken</strong> – pro Person: öffentlicher Link + QR zum Bearbeiten.
              Mitgeben am Abschlusstag. Fertig.
            </li>
          </ol>

          <h2>Was die Absolventin dann tut</h2>
          <p>
            QR scannen → ihre Galerie. Zweiten QR (oder denselben Admin-Link) → Willkommen, Termine, Telefon ändern.
            Eine Tür, wie im Galerie-Admin. Kein Passwort-Urwald. Kein Moodle.
          </p>

          <h2>Reihenfolge, damit es lebbar bleibt</h2>
          <ol>
            <li>
              <strong>Pilot ein Lehrgang</strong> – nur Anlegen, Liste, eine Lehrgang-Galerie, QR. Noch keine 14 Einzelgalerien.
            </li>
            <li>
              <strong>Dann der Abschluss-Klick</strong> – Galerien aus der Liste, Druckblatt. Prüfen: Name stimmt, Link geht, nichts aus K2 drin.
            </li>
            <li>
              <strong>Erst danach</strong> – Stunden als Termine pflegen, optional Kasse. Zahlung/Lizenz nur, wenn die Akademie das später will.
            </li>
          </ol>

          <h2>Was wir bewusst nicht tun</h2>
          <p>
            Keine zweite Website-Baukasten-App. Keine Vermischung mit echten K2-Werken.
            Kein automatisches Anlegen ohne Klick des Büros. Keine zehn Felder, die niemand füllt.
            Stripe und neue Yogasparte im System erst, wenn der Pilot im Alltag trägt.
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
