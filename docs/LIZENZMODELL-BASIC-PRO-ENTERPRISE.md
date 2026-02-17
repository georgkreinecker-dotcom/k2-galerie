# Lizenzmodell: Basic, Pro, Enterprise

**Stand:** Februar 2026

Sinnvolle Stufen für die Zielgruppe **Künstler:innen** (Einstieg → aktive Nutzung → Galerien/Mehrbedarf). Alle Stufen beinhalten die gleiche App; der Umfang wird über Limits und freigeschaltete Features gesteuert.

---

## 1. Überblick

| Stufe        | Zielgruppe              | Preis (Beispiel)   | Kerndifferenzierung                    |
|-------------|-------------------------|--------------------|----------------------------------------|
| **Basic**   | Einstieg, erste Schritte | 49 €/Monat         | Begrenzte Werke, eine Galerie, Standard-URL |
| **Pro**     | Aktive Künstler:innen   | 99 €/Monat         | Mehr Werke, Custom Domain, volles Marketing |
| **Enterprise** | Galerien, White-Label | nach Vereinbarung  | Unbegrenzt, API, eigenes Branding, Dedicated Support |

---

## 2. Basic (Einstieg)

**Ziel:** Schneller Einstieg ohne hohe monatliche Bindung. Ideal zum Ausprobieren und für kleine Portfolios.

| Bereich        | Inhalt / Limit |
|----------------|----------------|
| **Werke**      | Bis **30 Werke** (ausreichend für erste Ausstellung oder kleines Portfolio). |
| **Galerie**    | **1 Galerie** (eine öffentliche Galerie-URL). |
| **Events**     | Eventplanung inklusive (Termine, Einladungen). |
| **Stammdaten & Design** | Galerie-Name, Kontakt, Farben, Willkommensbild, Galerie-Karte – alles anpassbar. |
| **Kasse / Shop** | Kasse für Verkauf vor Ort (z. B. am iPad). |
| **Etiketten**  | Etikettendruck (z. B. Brother QL) – Werk-Nummer, Titel, QR. |
| **Marketing**  | Grundlegende Werbematerialien (Flyer, Presse, QR-Plakat) aus Stammdaten. |
| **Backup**     | Backup & Wiederherstellung (lokal/Vollbackup). |
| **URL / QR**   | **Standard-URL** (z. B. Subdomain oder Pfad auf k2-galerie.vercel.app). Eigener QR-Code für die Galerie. |
| **Support**    | Doku, FAQ, E-Mail-Support (Standard). |

**Nicht enthalten:** Custom Domain (eigene Domain), unbegrenzte Werke, White-Label, API, Dedicated Support.

---

## 3. Pro (Aktive Künstler:innen)

**Ziel:** Professioneller Dauerbetrieb mit eigenem Auftritt und voller Nutzung aller App-Funktionen.

| Bereich        | Inhalt / Limit |
|----------------|----------------|
| **Werke**      | **Unbegrenzte Werke** (oder z. B. 500+; technisch praktisch unbegrenzt). |
| **Galerie**    | **1 Galerie** (eine Instanz; bei Bedarf später „mehrere Galerien“ als Pro-Plus oder Enterprise). |
| **Events**     | Wie Basic, inkl. erweiterte Öffentlichkeitsarbeit. |
| **Stammdaten & Design** | Wie Basic, volle Anpassung. |
| **Kasse / Shop** | Wie Basic. |
| **Etiketten**  | Wie Basic. |
| **Marketing**   | **Vollumfang:** Flyer, Presse, Newsletter-Vorschläge, Plakat, Social Media, Event-Flyer, QR-Plakat – alles aus Stammdaten im Galerie-Design. |
| **Backup**     | Wie Basic. |
| **URL / QR**   | **Custom Domain** möglich (eigene Domain, z. B. galerie-künstlerin.at). Eigener QR-Code. |
| **Support**    | Wie Basic, priorisierte Bearbeitung (E-Mail). |

**Zusätzlich zu Basic:** Unbegrenzte Werke, Custom Domain, volles Marketing-Set, klare Positionierung für „dauerhafte“ Nutzer:innen.

---

## 4. Enterprise (Galerien / Mehrbedarf)

**Ziel:** Galerien, Agenturen oder Partner, die mehrere Nutzer:innen, eigenes Branding oder technische Anbindung brauchen.

| Bereich        | Inhalt / Limit |
|----------------|----------------|
| **Werke / Galerien** | **Unbegrenzt**; optional **mehrere Galerien/Instanzen** pro Lizenz (wenn technisch umgesetzt). |
| **Alle App-Funktionen** | Wie Pro (Events, Kasse, Etiketten, Marketing, Backup, Custom Domain). |
| **White-Label** | **Eigenes Branding:** Logo, Produktname, Farben auf Wunsch angepasst (z. B. „Galerie XYZ“ statt „K2 Galerie“). |
| **API**        | **API-Zugang** für Anbindung an eigene Systeme (Buchhaltung, Website, Kassen). |
| **Support**    | **Dedicated Support** (fester Ansprechpartner, SLA nach Vereinbarung, Onboarding). |
| **Preis**      | **Nach Vereinbarung** (Jahresvertrag, Staffelpreise bei mehreren Galerien, etc.). |

**Zusätzlich zu Pro:** White-Label, API, Dedicated Support, ggf. mehrere Galerien/Instanzen.

---

## 5. Kurzvergleich (Feature-Matrix)

| Feature / Limit        | Basic | Pro | Enterprise |
|------------------------|-------|-----|------------|
| Werke                  | bis 30 | unbegrenzt | unbegrenzt |
| Galerien (öffentliche URLs) | 1 | 1 | 1 oder mehr (nach Vereinbarung) |
| Events, Stammdaten, Design | ja | ja | ja |
| Kasse, Etiketten       | ja | ja | ja |
| Marketing (Basis)      | ja | ja | ja |
| Marketing (voll)      | nein | ja | ja |
| Standard-URL + QR      | ja | ja | ja |
| Custom Domain          | nein | ja | ja |
| White-Label / eigenes Branding | nein | nein | ja |
| API-Zugang             | nein | nein | ja |
| Support                | Standard (E-Mail/Doku) | Standard, priorisiert | Dedicated |
| Preis                  | 49 €/Monat | 99 €/Monat | nach Vereinbarung |

---

## 6. Aufstufung

- **Jederzeit möglich:** Basic → Pro oder Pro → Enterprise.
- **Abrechnung:** Die Preisdifferenz wird anteilig auf die laufende Abrechnungsperiode berechnet; ab der nächsten Periode gilt der neue Tarif.
- **Daten:** Alle Daten und Einstellungen bleiben beim Aufstieg erhalten.

---

## 7. Technische Umsetzung (Hinweise)

- **Limits (z. B. 30 Werke bei Basic):** In der App beim Speichern oder in der Galerie-Anzeige prüfen (Licence-Typ aus Backend oder lokaler Konfiguration). Überschreitung: Hinweis „Upgrade auf Pro für mehr Werke“ oder Sperre.
- **Custom Domain (Pro/Enterprise):** Technisch über Vercel/Proxy oder DNS; in der App nur „Custom Domain aktivieren“ und Feld für Domain – Umsetzung im Hosting.
- **White-Label / API (Enterprise):** Konfiguration pro Mandant (Name, Logo, API-Key); API später als separates Modul.

---

## 8. Bezug zu anderen Dokumenten

- **Konditionen & Vergebung:** `docs/LICENCE-STRUKTUR.md`
- **Vergütung Empfehlungs-Programm:** `docs/ABRECHNUNGSSTRUKTUR-EMPFEHLUNGSPROGRAMM.md`, VerguetungPage (einstufig 50 %)
- **Produkt-Vision / Zielgruppe:** `docs/PRODUKT-VISION.md`
- **USPs / Markt:** `docs/USP-UND-MARKTCHANCEN.md`

---

*Dieses Dokument definiert die sinnvollen Stufen Basic, Pro und Enterprise für das Lizenzmodell der K2 Galerie. Limits (z. B. 30 Werke) und Preise sind Beispiele und in der App/Config anpassbar.*
