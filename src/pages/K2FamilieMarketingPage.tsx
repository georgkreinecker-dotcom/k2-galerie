/**
 * K2 Familien Marketing – USP und Marketing-Konzept (Arbeitsfläche wie mök2, Inhalt nur K2 Familie).
 * Strukturiert, als PDF druckbar; keine Vermischung mit Galerie-/ök2-Stammdaten.
 */

import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES, MOK2_ROUTE } from '../config/navigation'
import ProductCopyright from '../components/ProductCopyright'
import { adminTheme } from '../config/theme'

const R = PROJECT_ROUTES['k2-familie']
const t = adminTheme

const printStyles = `
  @media print {
    @page { margin: 12mm 14mm 14mm 14mm; }
    .k2-fam-mkt-no-print { display: none !important; }
    .k2-fam-marketing-page { max-width: none !important; padding: 0 !important; background: #fffefb !important; color: #1c1a18 !important; font-size: 10pt; line-height: 1.45; }
    .k2-fam-marketing-page section { break-inside: avoid; margin-bottom: 0.6rem !important; }
    .k2-fam-marketing-page h1 { font-size: 1.15rem; }
    .k2-fam-marketing-page h2 { font-size: 0.98rem; margin: 0.5rem 0 0.25rem 0 !important; }
    .k2-fam-marketing-page p, .k2-fam-marketing-page li { font-size: 9.5pt; }
    .k2-fam-marketing-page a { color: #1c1a18 !important; text-decoration: underline; }
    .k2-fam-marketing-page table { font-size: 7.5pt !important; }
    .k2-fam-marketing-page table th, .k2-fam-marketing-page table td { padding: 0.2rem 0.25rem !important; }
    .seitenfuss { position: fixed; bottom: 6mm; right: 14mm; font-size: 8pt; color: #5c5650; }
  }
`

export default function K2FamilieMarketingPage() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname !== R.familienMarketing) return
    const raw = location.hash?.replace(/^#/, '').trim()
    if (!raw) return
    const timer = window.setTimeout(() => {
      const el = document.getElementById(raw)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 200)
    return () => clearTimeout(timer)
  }, [location.pathname, location.hash])

  const handlePrint = () => window.print()

  return (
    <>
      <style>{printStyles}</style>
      <article
        className="k2-fam-marketing-page"
        style={{
          maxWidth: 880,
          margin: '0 auto',
          padding: '1.25rem 1.5rem 2.5rem',
          fontFamily: t.fontBody,
          color: t.text,
          background: t.bgCard,
          minHeight: '100%',
        }}
      >
        <header className="k2-fam-mkt-no-print" style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
          <Link
            to={R.meineFamilie}
            style={{ fontSize: '0.88rem', color: t.muted, textDecoration: 'none' }}
          >
            ← Meine Familie
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.88rem',
              borderRadius: t.radius,
              border: `1px solid rgba(181, 74, 30, 0.35)`,
              background: '#b54a1e',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Als PDF drucken
          </button>
        </header>

        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', color: '#0f7668', fontWeight: 700 }}>
          K2 Familien Marketing
        </h1>
        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', color: t.muted, lineHeight: 1.5 }}>
          Ein klarer Rahmen für USP, Außenauftritt und Kommunikation rund um <strong>K2 Familie</strong> – vergleichbar mit der Rolle von{' '}
          <strong>mök2</strong> (Marketing ök2), aber <strong>eigenständig</strong> und nur für dieses Produkt.
        </p>

        <section id="fam-mkt-ueberblick" style={{ marginBottom: '1.5rem', padding: '1rem 1.1rem', background: 'rgba(15, 118, 104, 0.06)', borderRadius: 10, border: '1px solid rgba(15, 118, 104, 0.2)' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f7668' }}>1. Überblick</h2>
          <p style={{ margin: '0 0 0.5rem 0', lineHeight: 1.55 }}>
            <strong>K2 Familien Marketing</strong> ist die verbindliche Sammelstelle für Positionierung, Nutzenversprechen und Kanäle von K2 Familie: was wir einzigartig macht, wen wir ansprechen, wie wir sichtbar werden – ohne die sensiblen Familiendaten zu vermischen mit anderen Produkten (Galerie, ök2, Vereinsplattform).
          </p>
          <p style={{ margin: 0, lineHeight: 1.55 }}>
            Alles, was hier steht, orientiert sich an der <strong>Grundbotschaft</strong> (Respekt, keine Ausgrenzung, Daten bleiben bei der Familie, keine kommerzielle Verwertung der Familiendaten) und am <strong>Raumschiff-Anspruch</strong>: Qualität vor Schnelligkeit.
          </p>
        </section>

        <section id="fam-mkt-usp" style={{ marginBottom: '1.5rem', breakInside: 'avoid' as const }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f7668', borderBottom: '1px solid rgba(181, 74, 30, 0.15)', paddingBottom: '0.35rem' }}>
            2. USP & Positionierung
          </h2>
          <p style={{ margin: '0 0 0.65rem 0', lineHeight: 1.55 }}>
            <strong>Kernversprechen:</strong> Eine moderne, respektvolle Heimat für die eigene Familienstruktur – sichtbar, vernetzt, mit klaren Beziehungen aus den Karten (keine Vermutungen), mit Raum für Geschichte, Gedenken und Alltag.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.55 }}>
            <li><strong>Eine Wahrheit in den Beziehungen:</strong> Eltern, Kinder, Partner – nur aus gespeicherten Karten, nachvollziehbar und konsistent.</li>
            <li><strong>Datenhoheit bei der Familie:</strong> Kein Verkauf, kein Profiling durch Dritte; das steht im Genom des Produkts.</li>
            <li><strong>Offene Gesellschaftsbilder:</strong> Keine Mittelalter-Schubladen – viele Lebensformen abbildbar.</li>
            <li><strong>Eigenes Fahrzeug:</strong> K2 Familie ist kein Anhänger von Galerie oder ök2; Module von dort höchstens als technisches Muster, nie als Datenmix.</li>
          </ul>
        </section>

        <section id="fam-mkt-mitbewerb" style={{ marginBottom: '1.5rem', breakInside: 'avoid' as const }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f7668', borderBottom: '1px solid rgba(181, 74, 30, 0.15)', paddingBottom: '0.35rem' }}>
            3. Produktvergleich (Marktüberblick)
          </h2>
          <p style={{ margin: '0 0 0.65rem 0', lineHeight: 1.55, fontSize: '0.92rem', color: t.muted }}>
            Kein Ranking einzelner Marken – ein sachlicher Überblick, wo sich <strong>K2 Familie</strong> von typischen Angeboten unterscheidet. Konkurrenten sind oft gut für ihre Zielgruppe; unser Versprechen ist ein anderes.
          </p>
          <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
            <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.04)' }}>
                  <th style={{ textAlign: 'left', padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', width: '18%' }}>Kriterium</th>
                  <th style={{ textAlign: 'left', padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)' }}>Typische Stammbuch-/Forschungs-Apps</th>
                  <th style={{ textAlign: 'left', padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)' }}>Soziale Netzwerke & Messenger</th>
                  <th style={{ textAlign: 'left', padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(15, 118, 104, 0.07)' }}>K2 Familie</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>Hauptzweck</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top' }}>Ahnenforschung, Dokumente, oft DNA/Zusatzangebote; Geschäftsmodell häufig Abo oder Datenökonomie.</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top' }}>Austausch, Fotos, Gruppen – kein konsistenter Stammbaum aus einer Quelle.</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top', background: 'rgba(15, 118, 104, 0.06)' }}>Lebendige Familienstruktur mit einer klaren Regel: Beziehungen nur aus den Karten – für Vertrauen und Nachvollziehbarkeit.</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>Daten &amp; Werbung</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top' }}>Nutzungsbedingungen und Hosting oft außerhalb des EU-Raums; Werbung und Zusatzgeschäft sind üblich.</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top' }}>Finanzierung über Werbung und Profiling; Familieninhalte sind Nebenprodukt.</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top', background: 'rgba(15, 118, 104, 0.06)' }}>Daten gehören der Familie; <strong>keine kommerzielle Verwertung</strong> der Familiendaten – verbindlich im Produktgenom.</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>Lebensformen</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top' }}>Oft traditionelles Stammbaum-Bild; Patchwork und wechselnde Partnerschaften nur bedingt abbildbar.</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top' }}>Kein strukturiertes Modell – alles fließt.</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top', background: 'rgba(15, 118, 104, 0.06)' }}>Offene Gesellschaft: viele Konstellationen sichtbar, ohne zu werten; keine „Mittelalter-Schubladen“.</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>Technik</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top' }}>Eigene Apps, teils schwerer Einstieg.</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top' }}>App des jeweiligen Anbieters.</td>
                  <td style={{ padding: '0.4rem 0.45rem', border: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top', background: 'rgba(15, 118, 104, 0.06)' }}>Web-App / PWA, skalierbar als Instanz – ein Aufbau, viele Familien.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ margin: '0.75rem 0 0 0', lineHeight: 1.5, fontSize: '0.88rem', color: t.muted }}>
            <strong>Hinweis:</strong> Namen von Wettbewerbern können in Präsentationen bei Bedarf ergänzt werden – hier bewusst typologisch, ohne einzelne Marken zu benennen, um sachlich zu bleiben und nicht in Werbeclaims abzurutschen.
          </p>
        </section>

        <section id="fam-mkt-markt" style={{ marginBottom: '1.5rem', breakInside: 'avoid' as const }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f7668', borderBottom: '1px solid rgba(181, 74, 30, 0.15)', paddingBottom: '0.35rem' }}>
            4. Marktanalyse &amp; realistischer Marktanteil
          </h2>
          <p style={{ margin: '0 0 0.65rem 0', lineHeight: 1.55, fontSize: '0.92rem', color: t.muted }}>
            Seriöse Marktzahlen brauchen <strong>Quellen</strong> (Statistikämter, Branchenstudien, eigene Nutzerzahlen). Hier der <strong>Rahmen</strong>, in den ihr später konkrete Zahlen einsetzt – ohne vorgegaukelte Prozentwerte.
          </p>
          <p style={{ margin: '0 0 0.5rem 0', lineHeight: 1.55, fontWeight: 600, color: t.text }}>Drei Ebenen (gängiges Schema)</p>
          <ul style={{ margin: '0 0 0.85rem 0', paddingLeft: '1.25rem', lineHeight: 1.55 }}>
            <li><strong>TAM</strong> (Total Addressable Market): Gesamtinteresse an digitaler Familien- und Ahnenforschung bzw. „Familie organisieren“ – sehr groß, aber größtenteils von großen Plattformen und anderen Modellen abgedeckt.</li>
            <li><strong>SAM</strong> (Serviceable Addressable Market): Personen und Familien, die <strong>explizit</strong> Datenschutz, Datenhoheit bei der Familie und unser Nutzungsmodell ansprechend finden – deutlich kleiner, dafür passender.</li>
            <li><strong>SOM</strong> (Serviceable Obtainable Market): Was in den nächsten Jahren <strong>realistisch erreichbar</strong> ist (Vertrieb, Reichweite, Lizenzmodell) – immer noch eine Nische, aber planbar.</li>
          </ul>
          <p style={{ margin: '0 0 0.5rem 0', lineHeight: 1.55, fontWeight: 600, color: t.text }}>Was „Marktanteil“ hier bedeutet</p>
          <p style={{ margin: '0 0 0.65rem 0', lineHeight: 1.55 }}>
            K2 Familie konkurriert <strong>nicht</strong> um den gesamten globalen Stammbaum-Markt wie ein Massenanbieter. Ein sinnvoller Marktanteil ist der Anteil an der <strong>Zielgruppe SAM</strong> (bzw. an aktiven Haushalten in DACH/EU, die ihr mit Marketing und Partnerschaften erreichen könnt). Ein einstelliges bis niedriges zweistelliges Prozent von SAM kann bei konsequenter Positionierung langfristig realistisch sein – <strong>ohne</strong> dass wir hier eine konkrete Zahl behaupten; die kommt aus Recherche + Geschäftsplan.
          </p>
          <div style={{ padding: '0.75rem 0.9rem', background: 'rgba(181, 74, 30, 0.06)', borderRadius: 8, border: '1px solid rgba(181, 74, 30, 0.18)' }}>
            <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.88rem', fontWeight: 600, color: t.text }}>Szenario-Denken (zum Ausfüllen mit Zahlen)</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.04)' }}>
                  <th style={{ textAlign: 'left', padding: '0.35rem 0.4rem', border: '1px solid rgba(0,0,0,0.08)' }}>Szenario</th>
                  <th style={{ textAlign: 'left', padding: '0.35rem 0.4rem', border: '1px solid rgba(0,0,0,0.08)' }}>Bedeutung für Marktanteil</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.35rem 0.4rem', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>Vorsichtig</td>
                  <td style={{ padding: '0.35rem 0.4rem', border: '1px solid rgba(0,0,0,0.08)' }}>Nische, Mundpropaganda, wenig Budget – Anteil an SAM bleibt klein, aber tragfähig, wenn Kosten passen.</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.35rem 0.4rem', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>Basis</td>
                  <td style={{ padding: '0.35rem 0.4rem', border: '1px solid rgba(0,0,0,0.08)' }}>Klare Ansprache, wiedererkennbares Produkt, stabile Einnahmen pro Instanz – schrittweise Ausweitung des erreichbaren Marktes (SOM).</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.35rem 0.4rem', border: '1px solid rgba(0,0,0,0.08)', fontWeight: 600 }}>Optimistisch</td>
                  <td style={{ padding: '0.35rem 0.4rem', border: '1px solid rgba(0,0,0,0.08)' }}>Partnerschaften, Presse, Empfehlung – SAM wird besser erreicht; Marktanteil an SAM steigt, bleibt aber von außen begrenzt (Qualität vor Massenwachstum).</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ margin: '0.75rem 0 0 0', lineHeight: 1.5, fontSize: '0.85rem', color: t.muted }}>
            <strong>Nächster Schritt:</strong> Bevölkerungs-/Haushaltszahlen (z. B. Destatis) und ggf. Branchennotizen zu Genealogie-Software mit Quellenangabe in eine Tabelle übernehmen – dann sind TAM/SAM schätzbar und der erwartbare Anteil an SAM ehrlich begründbar.
          </p>
        </section>

        <section id="fam-mkt-zielgruppe" style={{ marginBottom: '1.5rem', breakInside: 'avoid' as const }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f7668', borderBottom: '1px solid rgba(181, 74, 30, 0.15)', paddingBottom: '0.35rem' }}>
            5. Zielgruppe & Kanäle
          </h2>
          <p style={{ margin: '0 0 0.65rem 0', lineHeight: 1.55 }}>
            <strong>Zielgruppe:</strong> Familien und Personen, die Stammbaum, Erinnerungen und Außenauftritt (Einladungen, Einblicke für Vertraute) sicher und würdevoll bündeln wollen – ohne Social-Media-Druck und ohne Daten als Ware.
          </p>
          <p style={{ margin: '0 0 0.35rem 0', fontWeight: 600, color: t.text }}>Kanäle & Werkzeuge (ein Standard pro Aufgabe)</p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.55 }}>
            <li>
              <Link to={R.benutzerHandbuch} style={{ color: '#b54a1e', fontWeight: 600 }}>Benutzerhandbuch</Link> – Orientierung und Erklärung
            </li>
            <li>
              <Link to={R.familiePraesentationsmappe} style={{ color: '#b54a1e', fontWeight: 600 }}>Präsentationsmappe</Link> – Story und Übergabe
            </li>
            <li>
              <Link to={R.willkommen} style={{ color: '#b54a1e', fontWeight: 600 }}>Einstiegsseite (Flyer/QR)</Link> – kurzer öffentlicher Einstieg
            </li>
            <li>
              <Link to={R.uebersicht} style={{ color: '#b54a1e', fontWeight: 600 }}>Projekt & Leitbild</Link> – Kontext und Lizenz-Brücke
            </li>
          </ul>
        </section>

        <section id="fam-mkt-abgrenzung" style={{ marginBottom: '1.5rem', breakInside: 'avoid' as const }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f7668', borderBottom: '1px solid rgba(181, 74, 30, 0.15)', paddingBottom: '0.35rem' }}>
            6. Abgrenzung
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.04)' }}>
                <th style={{ textAlign: 'left', padding: '0.45rem 0.5rem', border: '1px solid rgba(0,0,0,0.08)' }}>Bereich</th>
                <th style={{ textAlign: 'left', padding: '0.45rem 0.5rem', border: '1px solid rgba(0,0,0,0.08)' }}>Rolle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '0.45rem 0.5rem', border: '1px solid rgba(0,0,0,0.08)' }}><strong>K2 Familien Marketing</strong> (diese Seite)</td>
                <td style={{ padding: '0.45rem 0.5rem', border: '1px solid rgba(0,0,0,0.08)' }}>USP, Konzept, Kanäle für <strong>K2 Familie</strong> – eigenes Produkt.</td>
              </tr>
              <tr>
                <td style={{ padding: '0.45rem 0.5rem', border: '1px solid rgba(0,0,0,0.08)' }}><strong>mök2</strong> (Marketing ök2)</td>
                <td style={{ padding: '0.45rem 0.5rem', border: '1px solid rgba(0,0,0,0.08)' }}>
                  Vertrieb und Außenkommunikation für <strong>ök2</strong> (Demo-Galerie / Lizenz) –{' '}
                  <Link to={MOK2_ROUTE} style={{ color: '#b54a1e' }}>Einstieg {MOK2_ROUTE}</Link>, Inhalt auch unter{' '}
                  <Link to={R.marketingOek2} style={{ color: '#b54a1e' }}>Marketing ök2</Link>.
                </td>
              </tr>
              <tr>
                <td style={{ padding: '0.45rem 0.5rem', border: '1px solid rgba(0,0,0,0.08)' }}><strong>K2 Galerie / ök2</strong></td>
                <td style={{ padding: '0.45rem 0.5rem', border: '1px solid rgba(0,0,0,0.08)' }}>Eigenes Geschäftsfeld (Kunst & Keramik bzw. Demo) – keine K2-Familien-Stammdaten, keine Vermischung.</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={{ marginBottom: '1.25rem', breakInside: 'avoid' as const }}>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: '#0f7668' }}>7. Tonfall</h2>
          <p style={{ margin: 0, lineHeight: 1.55 }}>
            Ruhig, respektvoll, klar. Keine aggressive Verkaufssprache, keine „Affiliate“-Logik. Wenn wir Einladungen oder Texte formulieren, immer: einfache Sprache, ehrlich, ohne Druck – im Einklang mit dem Benutzerhandbuch und der Präsentationsmappe.
          </p>
        </section>

        <footer style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(181, 74, 30, 0.2)' }}>
          <ProductCopyright />
        </footer>

        <div className="seitenfuss" aria-hidden>
          Seite 1
        </div>
      </article>
    </>
  )
}
