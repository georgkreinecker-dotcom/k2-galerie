/**
 * Allgemeine Geschäftsbedingungen (AGB) – rechtliche Absicherung für Nutzung, Demo, Datenschutz, Steuern.
 * Struktur in Einklang mit docs/KONZEPT-LIZENZMODELL-HAUPT-NEBENLIZENZEN.md (Haupt-/Nebenlizenz, Mandant).
 * Bei Eintritt über die Willkommensseite muss die Bestätigung erfolgen (üblich).
 * Keine Navigations-Links auf dieser Seite (kein mök2, keine festen Sprünge) – Zurück nur über den Browser.
 */

import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
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
        padding: '1rem 0.75rem 3rem',
        boxSizing: 'border-box',
      }}
    >
      <link rel="stylesheet" href={PROMO_FONTS_URL} />
      <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', padding: '0 0.25rem' }}>
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
          {PRODUCT_BRAND_NAME} · Stand April 2026 · Gültig für Nutzung, Demo, Lizenzen und alle damit verbundenen Leistungen.
        </p>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>1. Geltungsbereich und Vertragspartner</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform und Anwendung „{PRODUCT_BRAND_NAME}“, einschließlich aller Demo-, Vorschau- und Testzugänge, sowie für alle damit in Verbindung stehenden Leistungen, Lizenzen und Informationen. Mit dem Eintritt in den Zugangsbereich (Ansicht, Vorschau, erster Entwurf) bestätigt der Nutzer bzw. die Nutzerin, diese AGB gelesen und akzeptiert zu haben.
          </p>
          <p style={{ margin: '1rem 0 0', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <strong>Vertragspartner (Anbieter)</strong> ist <strong>{PRODUCT_BRAND_NAME}</strong> (Inhaber G. Kreinecker). Anschrift, Kontakt und Impressum ergeben sich aus der jeweils in der Anwendung angezeigten Impressumsseite bzw. den dort angegebenen Kontaktwegen (z. B. E-Mail).
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>2. Lizenzmodell: Haupt- und Nebenlizenzen; Mandantentrennung</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            <strong>Hauptlizenz:</strong> Der jeweils gebuchte, beschriebene Leistungsumfang (z. B. Galerie-Software in einer Stufe wie Basic, Pro oder vergleichbar, oder ein anderes als Hauptprodukt ausgewiesenes Angebot) bildet die vertragliche Grundlage für <strong>eine</strong> abgegrenzte Nutzungs- und Datenwelt (<strong>Mandant</strong> / technische Instanz).
          </p>
          <p style={{ margin: '1rem 0 0', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <strong>Nebenlizenzen</strong> (z. B. zusätzlicher Mandant mit eigener Datenwelt, zusätzliche Bearbeitende innerhalb eines Mandanten, oder ein weiteres ausdrücklich benanntes Zusatzprodukt) werden <strong>nur</strong> wirksam, wenn sie <strong>separat</strong> bestellt und abgerechnet sind. Es gibt keine still mitgelieferten „Zusatzwelten“.
          </p>
          <p style={{ margin: '1rem 0 0', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <strong>Mandantentrennung:</strong> Daten verschiedener Mandanten werden technisch und zweckmäßig getrennt gehalten; der Nutzer ist für die ordnungsgemäße Zuordnung seiner Inhalte zum jeweiligen Mandanten bzw. zur gewählten Lizenz selbst verantwortlich, soweit die Anwendung dies vorsieht.
          </p>
          <p style={{ margin: '1rem 0 0', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <strong>Produkt „K2 Familie“</strong> (Familienraum, Stammbaum) ist ein <strong>eigenständiges</strong> Lizenzprodukt mit eigener Produkt- und Kostendokumentation. Es besteht <strong>keine</strong> automatische vertragliche oder buchhalterische Verknüpfung mit einer Galerie-Lizenz; eine Buchung beider Produkte ist nur wirksam, wenn beide klar getrennt bestellt wurden.
          </p>
          <p style={{ margin: '1rem 0 0', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <strong>K2 Familie – Privatheit und Zugang:</strong> Der Familienraum ist <strong>privat</strong>; <strong>vollständiger Zugang</strong> zur eigenen Personenkarte und die damit verbundenen Rechte setzen <strong>neben</strong> dem Familien-Zugang die <strong>persönliche ID</strong> auf der jeweiligen Personenkarte voraus, wie in der Anwendung und den zugehörigen Nutzerunterlagen beschrieben.
          </p>
          <p style={{ margin: '1rem 0 0', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <strong>Empfehlungs-Programm:</strong> Werbung durch Nutzerinnen und Nutzer (Empfehler-ID, Vergütung/Rabatt) richtet sich nach den in der Anwendung und den dazugehörigen beschreibenden Unterlagen genannten Regeln; Missbrauch (z. B. unzulässige Selbstempfehlung) ist ausgeschlossen.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>3. Testphase (2 Wochen kostenlos) und Umgang mit Daten</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Der Nutzer bzw. die Nutzerin kann eine <strong>Testphase von 2 Wochen</strong> kostenlos nutzen. Dafür sind die erforderlichen Angaben (z. B. E-Mail-Adresse) einzugeben. Wir versichern: Die in der Testphase eingegebenen Daten werden ausschließlich für die Durchführung der Testphase und die Abwicklung einer eventuell abgeschlossenen Lizenz verwendet. <strong>Wenn nach Ablauf der 2 Wochen keine Lizenz abgeschlossen wird, werden die in der Testphase gespeicherten Daten unverzüglich gelöscht</strong>; die Lizenz erlischt in diesem Fall. Der Eintritt in den Zugangsbereich bzw. der Start der Testphase setzt voraus, dass die AGB gelesen und durch Bestätigung (z. B. Ankreuzen) akzeptiert wurden – wie bei der Nutzung üblich.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>4. Leistung und Nutzung</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Die angebotenen Leistungen umfassen Software bzw. webbasierte Anwendungen zur Darstellung und Verwaltung von Galerie- bzw. Künstlerinhalten sowie ggf. weitere ausdrücklich benannte Module. Demo- und Vorschauversionen dienen der unverbindlichen Information. Ein Rechtsanspruch auf bestimmte Funktionalitäten, Verfügbarkeit oder Datenbestand besteht nicht. Die Nutzung erfolgt auf eigenes Risiko.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>5. Haftungsausschluss</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Soweit gesetzlich zulässig wird jede Haftung – aus welchem Rechtsgrund auch immer – für Schäden, die aus der Nutzung oder der Unmöglichkeit der Nutzung der Anwendung, aus Fehlern, Unterbrechungen, Datenverlust, Verzögerungen oder aus Handlungen Dritter entstehen, ausgeschlossen. Dies gilt insbesondere für indirekte Schäden, Folgeschäden, entgangenen Gewinn und Produkt- oder Beschwerdefälle. Die Haftung für Vorsatz und grobe Fahrlässigkeit sowie für Personenschäden bleibt im gesetzlich zulässigen Umfang unberührt.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>6. Datenschutz</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Der Nutzer ist für die Rechtmäßigkeit der von ihm eingegebenen und verarbeiteten Daten selbst verantwortlich. Es wird keine Gewähr dafür übernommen, dass die Verarbeitung oder Speicherung von Daten in der Anwendung den für den Nutzer geltenden datenschutzrechtlichen Vorgaben (z. B. DSGVO) entspricht. Der Nutzer stellt sicher, dass er über die erforderlichen Einwilligungen und Rechtsgrundlagen verfügt. Für Schäden oder Folgen aus datenschutzrechtlichen Verstößen oder Beanstandungen durch Aufsichtsbehörden haftet der Anbieter nicht, soweit nicht zwingend gesetzliche Haftung besteht.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>7. Urheberrecht an der Anwendung</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Die Anwendung (Software, Konzept, Design und technische Umsetzung) ist urheberrechtlich geschützt. Alle Rechte liegen bei <strong>{PRODUCT_BRAND_NAME}</strong> (G. Kreinecker). Alle Rechte vorbehalten. Die Nutzung ist nur im Rahmen dieser AGB und der vereinbarten Lizenz gestattet.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>8. Steuern, Buchhaltung und Finanzen</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Die Anwendung ersetzt keine steuerliche, rechtliche oder betriebswirtschaftliche Beratung. Der Nutzer ist allein verantwortlich für die Richtigkeit seiner Angaben gegenüber Finanzämtern, Behörden und Dritten. Es wird keine Haftung für Folgen aus steuerlichen Prüfungen, Nachforderungen oder sonstigen finanziellen Konsequenzen übernommen. Bei Fragen zu Steuern und Buchführung ist eine qualifizierte Beratung (Steuerberater, Rechtsanwalt) einzuholen.
          </p>
          <p style={{ margin: '1rem 0 0', lineHeight: 1.7, fontSize: '0.95rem' }}>
            <strong>Buchhaltung:</strong> Für die in der Anwendung angebotenen Buchhaltungsfunktionen (Kassabuch, Exporte, Belege, Summen, Zeiträume) übernimmt der Anbieter <strong>keine Haftung</strong>. Die Funktionen dienen der Vorarbeit für Steuerberater bzw. Behörden; sie ersetzen weder eine ordnungsgemäße Buchführung noch die Prüfung durch einen Steuerberater. Der Nutzer ist für die Vollständigkeit, Richtigkeit und rechtzeitige Weitergabe seiner Unterlagen selbst verantwortlich.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>9. Produktbeschwerden und Mängel</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Für Demo- und Vorschauversionen wird keine Gewähr für Fehlerfreiheit oder Eignung für einen bestimmten Zweck übernommen. Bei kostenpflichtigen Leistungen gelten die gesetzlichen Gewährleistungsrechte; darüber hinaus wird die Haftung auf den vorhersehbaren, typischerweise eintretenden Schaden begrenzt, soweit nicht Vorsatz oder grobe Fahrlässigkeit vorliegen. Ansprüche aus Produktbeschwerden Dritter (z. B. Kunden der Nutzer) sind gegen den Anbieter ausgeschlossen; der Nutzer tritt hierfür nicht ein.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>10. Beendigung der Lizenz durch den Nutzer (Ausstieg)</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Die Lizenz kann vom Nutzer bzw. von der Nutzerin <strong>jederzeit</strong> beendet werden. Es besteht <strong>keine Mindestlaufzeit</strong> und keine Bindung. Der Ausstieg soll so einfach möglich sein wie der Einstieg – ohne Zwangsbeglückung. Die Beendigung erfolgt in der Anwendung (z. B. in den Einstellungen) oder über den gleichen Kanal wie der Lizenzabschluss; es sind keine Anrufe oder besonderen Formulare erforderlich. Bis zum Ende der Laufzeit bleibt der Zugang bestehen; vor Beendigung kann der Nutzer seine Daten exportieren bzw. sichern (Backup-Funktion in der Anwendung). Ein Anspruch auf Rückerstattung bereits gezahlter Beträge für die laufende Abrechnungsperiode besteht nur in den gesetzlich vorgesehenen Fällen.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>11. Änderungen und Beendigung durch den Anbieter</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Der Anbieter ist berechtigt, die AGB, die Anwendung und die angebotenen Leistungen zu ändern oder einzustellen. Über wesentliche Änderungen der AGB wird in angemessener Form informiert; die weitere Nutzung nach Wirksamwerden gilt als Zustimmung. Ein Anspruch auf Fortführung bestimmter Funktionen oder Zugänge besteht nicht.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>12. Schlussbestimmungen</h2>
          <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
            Es gilt das Recht der Republik Österreich unter Ausschluss des UN-Kaufrechts. Gerichtsstand für alle Streitigkeiten ist, soweit gesetzlich zulässig, der Sitz des Anbieters. Die Unwirksamkeit einzelner Klauseln berührt die Gültigkeit der übrigen nicht. Diese AGB ersetzen alle vorherigen Vereinbarungen zum Gegenstand.
          </p>
        </section>

        <section style={{ marginBottom: '1.75rem', padding: '1rem', background: s.accentSoft, borderRadius: s.radius, borderLeft: `4px solid ${s.accent}` }}>
          <h2 style={{ fontFamily: s.fontHeading, fontSize: '1rem', color: s.text, margin: '0 0 0.5rem', fontWeight: 600 }}>Hinweis</h2>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: '0.9rem', color: s.text }}>
            Dieses Dokument dient der rechtlichen Orientierung und Absicherung des Anbieters. Für eine verbindliche Prüfung im Einzelfall wird die Konsultation einer Rechtsanwältin bzw. eines Rechtsanwalts empfohlen. Die fachliche Lizenz-Struktur (Haupt-/Nebenlizenz) ist in der Projektdokumentation festgehalten; bei Widerspruch zwischen Kurzfassung und gebuchtem Produkt gelten der konkrete Leistungsinhalt und die gesonderte Preis-/Produktbeschreibung zum Zeitpunkt des Abschlusses.
          </p>
        </section>

        <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: s.muted }}>
          {PRODUCT_COPYRIGHT_BRAND_ONLY}
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: s.muted, opacity: 0.95 }}>
          {PRODUCT_URHEBER_ANWENDUNG}
        </p>
      </div>
    </div>
  )
}
