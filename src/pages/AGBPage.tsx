/**
 * Allgemeine Geschäftsbedingungen (AGB) – rechtliche Absicherung für Nutzung, Demo, Datenschutz, Steuern.
 * Bei Eintritt über die Willkommensseite muss die Bestätigung erfolgen (üblich).
 */

import { Link } from 'react-router-dom'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT } from '../config/tenantConfig'
import { WILLKOMMEN_ROUTE, MOK2_ROUTE } from '../config/navigation'
import { WERBEUNTERLAGEN_STIL, PROMO_FONTS_URL } from '../config/marketingWerbelinie'

const s = WERBEUNTERLAGEN_STIL

export default function AGBPage() {
  return (
    <div
      style={{
        background: s.bgDark,
        minHeight: '100vh',
        color: s.text,
        fontFamily: s.fontBody,
        padding: '2rem 1rem 4rem',
      }}
    >
      <link rel="stylesheet" href={PROMO_FONTS_URL} />
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem' }}>
          <Link to={MOK2_ROUTE} style={{ color: s.accent, textDecoration: 'none' }}>← mök2</Link>
          {' · '}
          <Link to={WILLKOMMEN_ROUTE} style={{ color: s.accent, textDecoration: 'none' }}>Willkommensseite</Link>
        </p>
        <h1
          style={{
            fontFamily: s.fontHeading,
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 600,
            color: s.accent,
            margin: '0 0 0.5rem',
          }}
        >
          Allgemeine Geschäftsbedingungen
        </h1>
        <p style={{ color: s.muted, fontSize: '0.9rem', margin: '0 0 2rem' }}>
          {PRODUCT_BRAND_NAME} · Stand 2026 · Gültig für Nutzung, Demo und alle damit verbundenen Leistungen.
        </p>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>1. Geltungsbereich</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Anwendung „{PRODUCT_BRAND_NAME}“, einschließlich aller Demo-, Vorschau- und Testzugänge, sowie für alle damit in Verbindung stehenden Leistungen und Informationen. Mit dem Eintritt in den Zugangsbereich (Ansicht, Vorschau, erster Entwurf) bestätigt der Nutzer bzw. die Nutzerin, diese AGB gelesen und akzeptiert zu haben.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>2. Leistung und Nutzung</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Die angebotenen Leistungen umfassen Software bzw. webbasierte Anwendungen zur Darstellung und Verwaltung von Galerie- bzw. Künstlerinhalten. Demo- und Vorschauversionen dienen der unverbindlichen Information. Ein Rechtsanspruch auf bestimmte Funktionalitäten, Verfügbarkeit oder Datenbestand besteht nicht. Die Nutzung erfolgt auf eigenes Risiko.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>3. Haftungsausschluss</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Soweit gesetzlich zulässig wird jede Haftung – aus welchem Rechtsgrund auch immer – für Schäden, die aus der Nutzung oder der Unmöglichkeit der Nutzung der Anwendung, aus Fehlern, Unterbrechungen, Datenverlust, Verzögerungen oder aus Handlungen Dritter entstehen, ausgeschlossen. Dies gilt insbesondere für indirekte Schäden, Folgeschäden, entgangenen Gewinn und Produkt- oder Beschwerdefälle. Die Haftung für Vorsatz und grobe Fahrlässigkeit sowie für Personenschäden bleibt im gesetzlich zulässigen Umfang unberührt.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>4. Datenschutz</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Der Nutzer ist für die Rechtmäßigkeit der von ihm eingegebenen und verarbeiteten Daten selbst verantwortlich. Es wird keine Gewähr dafür übernommen, dass die Verarbeitung oder Speicherung von Daten in der Anwendung den für den Nutzer geltenden datenschutzrechtlichen Vorgaben (z. B. DSGVO) entspricht. Der Nutzer stellt sicher, dass er über die erforderlichen Einwilligungen und Rechtsgrundlagen verfügt. Für Schäden oder Folgen aus datenschutzrechtlichen Verstößen oder Beanstandungen durch Aufsichtsbehörden haftet der Anbieter nicht, soweit nicht zwingend gesetzliche Haftung besteht.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>5. Steuern und Finanzen</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Die Anwendung ersetzt keine steuerliche, rechtliche oder betriebswirtschaftliche Beratung. Der Nutzer ist allein verantwortlich für die Richtigkeit seiner Angaben gegenüber Finanzämtern, Behörden und Dritten. Es wird keine Haftung für Folgen aus steuerlichen Prüfungen, Nachforderungen oder sonstigen finanziellen Konsequenzen übernommen. Bei Fragen zu Steuern und Buchführung ist eine qualifizierte Beratung (Steuerberater, Rechtsanwalt) einzuholen.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>6. Produktbeschwerden und Mängel</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Für Demo- und Vorschauversionen wird keine Gewähr für Fehlerfreiheit oder Eignung für einen bestimmten Zweck übernommen. Bei kostenpflichtigen Leistungen gelten die gesetzlichen Gewährleistungsrechte; darüber hinaus wird die Haftung auf den vorhersehbaren, typischerweise eintretenden Schaden begrenzt, soweit nicht Vorsatz oder grobe Fahrlässigkeit vorliegen. Ansprüche aus Produktbeschwerden Dritter (z. B. Kunden der Nutzer) sind gegen den Anbieter ausgeschlossen; der Nutzer tritt hierfür nicht ein.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>7. Änderungen und Beendigung</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Der Anbieter ist berechtigt, die AGB, die Anwendung und die angebotenen Leistungen zu ändern oder einzustellen. Über wesentliche Änderungen der AGB wird in angemessener Form informiert; die weitere Nutzung nach Wirksamwerden gilt als Zustimmung. Ein Anspruch auf Fortführung bestimmter Funktionen oder Zugänge besteht nicht.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>8. Schlussbestimmungen</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Es gilt das Recht der Republik Österreich unter Ausschluss des UN-Kaufrechts. Gerichtsstand für alle Streitigkeiten ist, soweit gesetzlich zulässig, der Sitz des Anbieters. Die Unwirksamkeit einzelner Klauseln berührt die Gültigkeit der übrigen nicht. Diese AGB ersetzen alle vorherigen Vereinbarungen zum Gegenstand.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', padding: '1rem', background: s.accentSoft, borderRadius: s.radius, borderLeft: `4px solid ${s.accent}` }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>Hinweis</h2>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.9rem', color: s.text }}>
            Dieses Dokument dient der rechtlichen Absicherung des Anbieters. Für eine verbindliche Prüfung im Einzelfall wird die Konsultation eines Rechtsanwalts oder einer Rechtsanwältin empfohlen.
          </p>
        </section>

        <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: s.muted }}>
          <Link to={MOK2_ROUTE} style={{ color: s.accent, textDecoration: 'none' }}>← mök2</Link>
          {' · '}
          <Link to={WILLKOMMEN_ROUTE} style={{ color: s.accent, textDecoration: 'none' }}>Willkommensseite</Link>
        </p>
        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: s.muted }}>
          {PRODUCT_COPYRIGHT}
        </p>
      </div>
    </div>
  )
}
