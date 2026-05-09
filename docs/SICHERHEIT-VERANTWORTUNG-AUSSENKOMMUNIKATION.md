# Verantwortung beim Marktgang – Außenkommunikation & Nachweis

**Zweck:** Ein **seriöses**, **kurzes** Wording für Piloten, Zahlungsdienstleister oder andere Gesprächspartner – **ohne** Übertreibung und **ohne** falsche Zertifikatsversprechen. Zusätzlich: festhalten, **was wir dokumentiert und praktisch umgesetzt haben**, damit klar ist: Der Marktgang erfolgt **bewusst und mit Sorgfalt**, nicht aus Naivität.

---

## 1. Kurzfassung zum Übernehmen (E-Mail, Gespräch, Anhang)

> **K2 Galerie / kgm solution – Umgang mit Sicherheit und Daten**
>
> Die Plattform wird so entwickelt und betrieben, dass **Datenschutz und Systemsicherheit** von Anfang an mitgedacht sind: klare **Trennung** von Demo-Umgebung (öffentliche Vorstellung) und **echten Mandantendaten**, **kein stillschweigendes Löschen** von Nutzerdaten durch die App, nachvollziehbare **Backup- und Wiederherstellungswege**, sowie technische **Absicherung** der öffentlichen Auslieferung (verschlüsselter Transport, Schutz-Header, Content-Security-Policy, gehärtete Behandlung externer Links und Checkout-URLs).
>
> Maßnahmen und Grenzen sind **im Projekt dokumentiert** und werden vor größeren Releases durch **automatisierte Tests** und festgelegte **Prüfabläufe** begleitet. Wir stellen **kein** externes „Siegel“ oder **keinen** vollständigen Penetrationstest durch Dritte in Aussicht, es sei denn, ein solcher liegt vor oder wird beauftragt – entsprechend bleibt ein **restliches Betriebsrisiko** wie bei jeder Software, das wir **offen** so benennen und **fortlaufend** reduzieren.

*(Du kannst den ersten Absatz alleine nutzen, wenn es kürzer sein soll; den zweiten Absatz nur ergänzen, wenn Nachfrage zu „Nachweis“ oder „Restrisiko“ kommt.)*

---

## 2. Was wir getan haben, um nicht verantwortungslos zu handeln

Das ist **kein** Anspruch auf „perfekte Sicherheit“. Es ist die **Leiste**, an der wir uns messen und die wir **schriftlich** festhalten:

| Maßnahmenbereich | Konkret |
|------------------|---------|
| **Datenhoheit & Trennung** | Strikte Regeln K2 / ök2 / VK2 / Lizenzmandanten; keine Vermischung von Demo- und Echtdaten in Belegen oder öffentlicher Demo; dokumentiert u. a. in **DATENSICHERHEIT-ABSICHERUNG.md**, Regeln **k2-oek2-eisernes-gesetz**, **schutzmechanismen-alle-bereiche**. |
| **Schutz vor Datenverlust durch die App** | Kein automatisches Löschen oder „Aufräumen“ von Kundendaten; Merge- und Server-Regeln mit Leer-/Schwellenprüfungen wo vorgesehen; Backup & Wiederherstellung als verbindlicher Hauptweg (**KRITISCHE-ABLAEUFE**, **eiserne-regel-backup-wiederherstellung**). |
| **Auslieferung & Angriffsfläche (Production)** | HTTPS, HSTS, nosniff, Frame-Optionen, Referrer-Policy; **Content-Security-Policy** und Boot-Skripte ohne kritisches Inline-Script (**SICHERHEIT-CSP-UND-SCHUTZSTUFE.md**); QR/Stand so gebaut, dass Mobilgeräte nicht auf veralteten Bundles hängen bleiben (**STAND-QR-SO-BLEIBT-ES.md**). |
| **Phishing & unsichere Navigation** | Nur erlaubte URL-Schemata für nutzerrelevante Links; Checkout nur über geprüfte Pfade; **`noopener`/`noreferrer`** wo dokumentiert (**safeExternalUrl**, Tests). |
| **Qualität vor Live-Schaltung** | Build-Pipeline mit Tests; kritische Konfiguration z. B. **vercel-config-guard**; dokumentierte **Audit-/Go-Live-Checklisten** (**AUDIT-PROZESS-PROGRAMMSICHERHEIT-GO-LIVE.md**, **SICHERHEIT-VOR-GO-LIVE.md**) – auch wenn nicht jedes Kästchen in jedem Mandanten sofort abgehakt ist. |
| **Lernen aus Fehlern** | **FEHLERANALYSEPROTOKOLL**, **GELOESTE-BUGS** – Wiederholungen werden erkannt und Regeln geschärft (Sportwagenmodus: ein Standard pro Problemstellung). |

**Ehrliche Grenze:** Ohne regelmäßiges **externes** Sicherheitsaudit durch eine spezialisierte Firma und ohne formale **Zertifizierung** bleibt ein Restrisiko. Wir behandeln das Produkt **nicht** als „unkritisches Spielzeug“, sondern dokumentieren **Maßnahmen und Grenzen** und verbessern sie **fortlaufend**.

---

## 3. Verweise (tiefer einsteigen)

| Thema | Dokument |
|--------|-----------|
| Daten & Kontext | **DATENSICHERHEIT-ABSICHERUNG.md** |
| CSP & Profilstufe | **SICHERHEIT-CSP-UND-SCHUTZSTUFE.md** |
| Go-Live / Audit-Ablauf | **SICHERHEIT-VOR-GO-LIVE.md**, **AUDIT-PROZESS-PROGRAMMSICHERHEIT-GO-LIVE.md** |
| Kritische Nutzerabläufe | **KRITISCHE-ABLAEUFE.md** |
| Datenschutz K2 Familie (falls relevant) | **K2-FAMILIE-DATENSCHUTZ-SICHERHEIT.md** |

---

## 4. Was wir bewusst nicht behaupten

- Kein „von einer Behörde bestätigtes Sicherheitslabel“, wenn keines vorliegt.
- Kein „hundertprozentig hackerfest“ – das gibt es bei komplexen Webanwendungen nicht seriös zu versprechen.
- Kein Unterstellungen gegenüber anderen **Einzelpersonen** oder **Klischees** („Laie = unverantwortlich“): Verantwortung zeigt sich an **Prozess, Dokumentation und Nachbesserung** – nicht am Abschluss eines Informatikstudiums.

**Stand:** wird mit Produkt und Regelwerk mitgeführt; bei größeren Änderungen an Sicherheitsarchitektur dieses Dokument kurz prüfen und ggf. Datum/Kernaussagen anpassen.
