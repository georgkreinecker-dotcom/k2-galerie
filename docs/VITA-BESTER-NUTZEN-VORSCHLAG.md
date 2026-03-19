# Vita – bester Nutzen für unsere User (konkreter Vorschlag)

**Ziel:** Eine klare Linie für die Vita – eine Quelle, sichtbar für Besucher, druckfertig, ohne Doppelpflege. Maximaler Nutzen für Künstler:innen und Galerien.

---

## 1. Ausgangslage (kurz)

| Wo | Was heute |
|----|-----------|
| **Daten** | K2: `vita` in Stammdaten (Martina/Georg). ök2: eigene Keys `k2-oeffentlich-vita-martina/georg`. VK2: Mitglieder haben `vita`. |
| **Bearbeiten** | Admin → Einstellungen → Stammdaten (Person 1/2, Vita aufklappbar). Oder VitaPage (`/projects/k2-galerie/vita/martina`) wenn von Admin kommend (mayEditContent). |
| **Anzeige Besucher** | Galerie-Seite: Bereich „Die Kunstschaffenden“ mit zwei Karten; Button „📄 Vita“ öffnet **druckfertiges Dokument** (neues Fenster, Nutzer-Design). VitaPage: eigener Weg „← Zur Galerie“, nur Lesen wenn Besucher. |
| **Druck/PDF** | `buildVitaDocumentHtml` + Fenster öffnen (GaleriePage openVita). Pressemappe nutzt vita aus Stammdaten. |

**Stärken:** Eine inhaltliche Quelle (Stammdaten/vita), druckfertiges Layout, Kontakt aus Stammdaten.

**Schwachstellen:** (1) Zwei Einstiege zum Bearbeiten (Admin Stammdaten vs. VitaPage) → Verwirrung „wo pflege ich?“ (2) Platzhalter „(Hier Vita erweitern: Werdegang …)“ in buildInitialVita – kein klarer Nutzen. (3) Besucher können Vita nur über „📄 Vita“-Button in der Karte öffnen; eigener Link „Vita“ in der Galerie-Navigation fehlt oft. (4) Keine leichte Struktur (z. B. Kurzbiografie / Ausstellungen / Kontakt) – nur Fließtext.

---

## 2. Leitprinzip: Eine Quelle, ein Klick, sichtbar

- **Eine Quelle:** Vita lebt in den Stammdaten (K2: martina/georg; ök2: k2-oeffentlich-vita-*; VK2: Mitglied.vita). Alles, was Vita anzeigt oder druckt, liest **nur** von dort. Kein zweiter Speicher „nur für Vita“.
- **Ein Klick:** „Vita anzeigen“ / „Vita drucken“ = ein Klick vom Besucher bzw. vom Admin. Kein Umweg über zwei verschiedene „Vita-Seiten“ mit unterschiedlichem Verhalten.
- **Sichtbar:** Besucher finden die Vita ohne Suchen: klarer Bereich auf der Galerie („Kunstschaffende“) und optional ein Einstieg im Willkommen/Footer („Über uns“ / „Vita“).

---

## 3. Konkreter Vorschlag (Phasen)

### Phase A – Klarheit & Sichtbarkeit (schnell umsetzbar)

1. **Eine Bearbeitungsstelle im Admin**
   - **Empfehlung:** Vita **nur** in den **Einstellungen → Stammdaten** (Person 1 / Person 2) bearbeiten. Die VitaPage bleibt für **Lesen** (Besucher, Deep-Link) und für „Vita als Dokument öffnen“ (druckfertig) – aber **kein** zweiter Bearbeitungsmodus mit Speichern.
   - Alternativ: VitaPage behalten, Speichern schreibt aber **in dieselbe Quelle** (Stammdaten für K2, k2-oeffentlich-vita-* für ök2) und Admin zeigt einen klaren Hinweis: „Vita hier oder in Einstellungen → Stammdaten bearbeiten – dieselbe Quelle.“
   - **Nutzen:** User wissen: „Ich pflege Vita an einem Ort.“

2. **Sichtbarkeit auf der Galerie**
   - Bereich „Die Kunstschaffenden“ bleibt. Zusätzlich: **klarer Link „Vita“** pro Person (Name + „Vita lesen“ oder „📄 Vita“), der entweder (a) die VitaPage öffnet (Lesefassung, gleiche Domain) oder (b) das druckfertige Dokument in neuem Tab (wie heute openVita). **Empfehlung:** (a) für bessere UX und SEO; „Als PDF drucken“ auf der VitaPage anbieten (Browser Drucken).
   - Optional: Im Willkommen oder Footer einen Sammellink „Über uns / Vita“ → führt zur ersten Kunstschaffenden-Vita oder zu einer Übersicht („Martina | Georg“).

3. **Platzhalter entfernen oder nutzen**
   - Den Text „(Hier Vita erweitern: Werdegang, Ausstellungen, Techniken, Statement …)“ in `buildInitialVita` entweder entfernen oder durch einen **kurzen Hinweis** ersetzen, der nur in der **Bearbeitungsansicht** erscheint (z. B. „Tipp: Werdegang, Ausstellungen und Techniken machen deine Vita für Galerien und Presse wertvoll.“). Nicht in der Besucher-Anzeige.

**Ergebnis Phase A:** Eine Quelle, klare Bearbeitung, Vita für Besucher gut auffindbar, kein verwirrender Platzhalter.

---

### Phase B – Optional: Strukturierte Vita (mittlerer Aufwand)

- **Idee:** Vita nicht nur als ein Fließtext, sondern mit **optionalen Abschnitten** (z. B. Kurzbiografie, Werdegang, Ausstellungen, Techniken, Statement, Kontakt). Kontakt kommt weiter aus Stammdaten (Name, E-Mail, Telefon).
- **Umsetzung:** In Stammdaten entweder (1) **ein** Feld `vita` (wie heute), Inhalt mit Markdown oder festen Überschriften („## Werdegang“, „## Ausstellungen“), die beim Anzeigen/Druck formatiert werden, oder (2) zusätzliche optionale Felder `vitaWerdegang`, `vitaAusstellungen` etc., die beim Rendern zusammengesetzt werden.
- **Empfehlung:** (1) – ein Feld, Nutzer:in schreibt z. B. „Werdegang\n—\n…\n\nAusstellungen\n—\n…“. `vitaDocument.ts` und Anzeige können Doppel-Zeilenumbruch oder Zeile „—“ als Abschnittstrenner nutzen (bereits Absatz-Logik vorhanden). Kein Datenmodell-Change nötig.
- **Nutzen:** Galerien und Presse bekommen schnell erfassbare, druckfertige Lebensläufe ohne neue Oberfläche.

---

### Phase C – Ein Standard für „Dokument öffnen“ (optional, Konsistenz)

- Heute: GaleriePage `openVita` öffnet mit `window.open(url)` (neues Fenster/Tab). Andere Dokumente (Flyer, Presse) nutzen **openDocumentInApp** (gleiche Leiste, Zurück, Drucken).
- **Vorschlag:** Vita-Dokument (HTML) ebenfalls über **openDocumentInApp** öffnen, wenn der Aufruf aus der **App** kommt (Galerie, Admin). So: ein Standard, gleiche UX (Zurück, Drucken), weniger Pop-up-Probleme.
- Ausnahme: Direktlink von außen (z. B. „/vita/martina“) bleibt die VitaPage (Lesefassung, SEO, kein App-Rahmen).

**Ergebnis Phase C:** Vita verhält sich wie Presse/Flyer – ein Klick, ein Viewer, drucken aus der App.

---

## 4. Priorisierung für „besten Nutzen“

| Priorität | Maßnahme | Nutzen |
|-----------|----------|--------|
| **1** | Eine Bearbeitungsstelle kommunizieren + Platzhalter nur als Bearbeitungs-Tipp | Keine Verwirrung, klare Quelle. |
| **2** | Auf der Galerie „Vita“ klar anbieten (Button/Link zur VitaPage oder Dokument); ggf. „Als PDF drucken“ auf VitaPage | Besucher finden Vita sofort; ein Klick zum Lesen/Drucken. |
| **3** | Optional: Vita-Dokument über openDocumentInApp (wie Presse/Flyer) | Ein Standard, weniger Pop-up, gleiche UX. |
| **4** | Optional: Strukturierte Abschnitte (Werdegang, Ausstellungen) per Konvention im Fließtext + Darstellung | Bessere Nutzung für Presse/Galerien ohne Datenmodell-Änderung. |

---

## 5. Nächster Schritt (Empfehlung)

- **Sofort:** Doku/Handbuch: „Vita pflegst du in den Einstellungen unter Stammdaten (Person 1 / Person 2). Sie erscheint auf der Galerie bei ‚Die Kunstschaffenden‘ und ist mit einem Klick druckfertig.“
- **Kurzfristig (Phase A):** Platzhalter in `buildInitialVita` nur in Bearbeitungsansicht oder durch hilfreichen Tipp ersetzen; prüfen ob VitaPage-Link von Galerie aus sichtbar/genutzt wird („Vita lesen“ neben „📄 Vita“ drucken).
- **Danach:** Entscheidung zu Phase B (Struktur im Fließtext) und Phase C (openDocumentInApp für Vita).

---

**Quellen:** VitaPage.tsx, vitaDocument.ts, GaleriePage (openVita, Kunstschaffende), ScreenshotExportAdmin (Stammdaten Vita), KRITISCHE-ABLAEUFE (openDocumentInApp), PRODUCT-VISION (Zielgruppe Künstler:innen).
