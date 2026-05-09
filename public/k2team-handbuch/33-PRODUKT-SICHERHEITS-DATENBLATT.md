# Produkt-Sicherheitsdatenblatt – Informationstechnik

**Hinweis:** Dieses Blatt beschreibt **Informationssicherheit, Datenschutz und Betrieb** der Software **K2 Galerie** und der verwandten Produktlinien **öffentliche Demo ök2**, **Vereinsplattform VK2** und **K2 Familie**. Es ist **kein** chemisches Sicherheitsdatenblatt nach REACH, CLP oder GHS.

**Stand:** Mai 2026 · **Dokumenttyp:** interne und nutzerlesbare Kurzfassung · **Vertiefung:** ausführliche technische Details liegen in der Projekt-Doku unter `docs/` im Entwickler-Repository.

[SEITENUMBRUCH]

## 1. Produktbezeichnung und Anwendungsbereich

| Feld | Inhalt |
|------|--------|
| **Bezeichnung** | K2 Galerie – Progressive Web App und zugehörige Mandanten-Oberflächen |
| **Produktlinien** | Galerie mit Admin für Kunsthandel und Selbstvermarktung; Demo-Mandant ök2; Vereinsplattform VK2; Familien-Stammbaum K2 Familie |
| **Auslieferung** | Über Hosting-Anbieter **Vercel** als HTTPS-Webanwendung; Datenhaltung im Browser **localStorage** auf dem Gerät des Nutzers sowie – je nach Feature – Anbindungen an **Supabase**, Zahlungsdienst **Stripe** und weitere in der Konfiguration genannte Dienste |

## 2. Hersteller und verantwortliche Stelle

**kgm solution** – Konzept, Design und technische Umsetzung: **G. Kreinecker**.

Anfragen zu diesem Blatt und zur dokumentierten Schutzstellung erfolgen über die im Produkt angegebenen Kontaktwege **Stammdaten / Impressum** der jeweiligen Mandanten-Instanz bzw. über die veröffentlichten Kontaktdaten von kgm solution.

## 3. Zweck und sicherheitsrelevante Ziele

- **Vertraulichkeit:** Trennung von Demo-Daten und Echtdaten; keine Vermischung von Mandanten-Kontexten in Speicher, Belegen oder öffentlichen Ansichten.
- **Integrität:** Kein automatisches Löschen oder Überschreiben von Nutzerdaten durch die App; nachvollziehbare Backup- und Wiederherstellungswege.
- **Verfügbarkeit:** Bereitstellung über das Hosting mit Transportverschlüsselung; dokumentierte Stand- und QR-Logik, damit Mobilgeräte nicht auf veralteten Bundles „hängen bleiben“.

## 4. Datenhaltung und Kontext-Trennung

Die Anwendung arbeitet mit **klar getrennten Speicher-Schlüsseln** für K2, ök2, VK2 und K2 Familie. Wesentliche Regeln:

- **ök2** enthält ausschließlich **Muster- und Demo-Inhalte**, keine echten K2-Stamm- oder Werkdaten.
- **Besucher** dürfen auf öffentlichen Seiten **keine gemeinsamen Stammdaten oder Werke verändern**; Ausnahme nach Konzept: **Shop-Bestellung** als Kundeneingabe.
- **Backup und Wiederherstellung** sind je Kontext getrennt vorgesehen; Wiederherstellung nur mit Prüfung des Kontext-Feldes im Backup.

Details und Checklisten: intern **DATENSICHERHEIT-ABSICHERUNG.md**, **KRITISCHE-ABLAEUFE.md**.

## 5. Technische Schutzmaßnahmen (Auslieferung Production)

Auf **Production** werden unter anderem folgende Maßnahmen eingesetzt:

| Stufe | Inhalt |
|-------|--------|
| **A – Transport und Basis-HTTP** | HTTPS, **HSTS**, **X-Content-Type-Options: nosniff**, **X-Frame-Options**, **Referrer-Policy** |
| **B – CSP und Anwendung** | **Content-Security-Policy**; kritische Stand-/Update-Logik in ausgelagerten Skripten unter **`/boot/`** statt unsicherem Inline-HTML-Skript; gehärtete Behandlung externer Links und Checkout-URLs wo dokumentiert |

**Bewusste Grenzen:** Es gibt **kein** externes Siegel und **keinen** pauschalen Penetrationstest durch Dritte in Standard-Produktversprechen. Ohne formale Zertifizierung bleibt ein **Restbetriebsrisiko** wie bei jeder komplexen Webanwendung – siehe nächster Abschnitt.

Vertiefung: **SICHERHEIT-CSP-UND-SCHUTZSTUFE.md**, **SICHERHEIT-VERANTWORTUNG-AUSSENKOMMUNIKATION.md**.

## 6. Backup und Wiederherstellung

- **Vollbackup** und **Wiederherstellung aus Datei** sind im Admin unter **Einstellungen** als verbindlicher Hauptweg vorgesehen.
- Nutzerinnen und Nutzer sind angehalten, **vor größeren Änderungen** ein Backup zu ziehen und bei Vereinen oder Familien **Rollen und Zugriffe** gemäß Handbuch zu pflegen.

## 7. Qualität im Entwicklungsprozess

- Automatisierte **Tests** und **Build-Prüfungen** begleiten Änderungen; kritische Konfiguration wird durch Guards abgesichert.
- **Fehleranalyse** und nachvollziehbare Regeln im Repository reduzieren Wiederholungen bekannter Fehlerklassen.

## 8. Grenzen und Restrisiko – keine übertriebenen Versprechen

Seriös und ausdrücklich **nicht** zugesagt werden unter anderem:

- „Hundertprozentig hackerfest“ oder vergleichbare Absolute.
- Ein „amtlich bestätigtes Sicherheitslabel“, wenn keines vorliegt.
- Haftung für Schäden aus **fehlerhafter Nutzung**, **schwachen Passwörtern**, **kompromittierten Endgeräten** oder **Drittanbietern** außerhalb des dokumentierten Verantwortungsbereichs.

Maßnahmen und dokumentierte Grenzen werden **fortlaufend** angepasst.

## 9. Aktualität dieses Blattes

Bei größeren Änderungen an Sicherheitsarchitektur, Hosting oder gesetzlichen Anforderungen ist dieser Text zu prüfen und die **Stand-Zeile** oben anzupassen.

---

**Copyright © 2026 kgm solution. Alle Rechte vorbehalten.**

**Konzept, Design und technische Umsetzung: kgm solution (G. Kreinecker). Alle Rechte vorbehalten.**
