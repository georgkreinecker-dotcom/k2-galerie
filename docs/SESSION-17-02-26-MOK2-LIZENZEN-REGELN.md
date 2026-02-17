# Session 17.02.26 – mök2, Lizenzen, Regeln

**Gut abgespeichert:** Was wir heute umgesetzt und festgelegt haben.

---

## 1. Crash („unexpected 5“)

- **main.tsx:** Reload mit Cache-Buster nur noch bei **echtem Mobile-UserAgent** (nicht bei schmalem Cursor-Fenster ≤768px) → keine Endlosschleife mehr.
- **Crash-Handler** sofort synchron installiert (bevor async safeMode lädt).
- **createRoot** nur einmal pro Seite, kein Retry mit zweitem createRoot.

---

## 2. Vergütung & Empfehlung (einstufig)

- **Nur eine Stufe:** Werber erhält 50 % der Lizenzgebühren.
- **ID im Link** (`?empfehler=K2-E-XXXXXX`); der Geworbene muss nichts eintragen.
- **Entscheidung beim Lizenzabschluss:** Empfehlung annehmen (dann Zuordnung) oder **ohne Empfehlung lizensieren** – beides möglich.
- Texte in **VerguetungPage** und **EmpfehlungstoolPage** angepasst.

---

## 3. Lizenzmodell (Basic, Pro, Enterprise)

- **Doku:** `docs/LIZENZMODELL-BASIC-PRO-ENTERPRISE.md` – Stufen, Limits, Feature-Matrix, Aufstufung.
- **LicencesPage (mök2):** Ausführliches Lizenzmodell „wie für Kunden“ direkt auf der Seite (Überblick, Basic/Pro/Enterprise, Feature-Matrix, **Aufstufung**).
- **Fachbegriffe:** Klickbare Begriffe (White-Label, Custom Domain, API, Dedicated Support, Standard-URL) mit Erklärung – Komponente `TermWithExplanation.tsx`, Glossar `TERM_EXPLANATIONS`.
- **Aufstufung:** Jederzeit Basic → Pro oder Pro → Enterprise; Differenz anteilig, Daten bleiben erhalten.
- **Begriff „Licences“ → „Lizenzen“** in der gesamten UI (Anzeigetexte); `/platform/licences` leitet auf mök2 um.

---

## 4. mök2 – alles an einem Ort

- **Plattform:** „Licences“ und Schnellzugriff führen in **mök2** (Seite mit mök2-Leiste). Kein doppelter Einstieg mehr.
- **Neue Karte/Button:** „mök2 (Marketing & Vertrieb)“ auf der Plattform → direkter Einstieg.
- **Route** `/platform/licences` → Redirect auf `/projects/k2-galerie/licences` (immer mit mök2-Layout).

---

## 5. Regeln (Cursor)

- **keine-eingaben-zweimal.mdc:** Keine doppelten Eingaben – vorhandene Daten nutzen, Stammdaten aus Muster-Galerie nach Lizenz übernehmen. **Insbesondere Werbeunterlagen:** Namen, Kontakt, Adresse, Galerie nur aus Stammdaten, keine eigenen Eingabefelder dafür.
- Regel ist `alwaysApply: true`.

---

## 6. Geplant / vorbereitet (Stammdaten Muster → Lizenz)

- **Keys** für Muster-Galerie-Stammdaten in ScreenshotExportAdmin vorbereitet: `k2-oeffentlich-stammdaten-martina/georg/galerie`.
- **Noch umzusetzen:** In ök2-Admin Stammdaten in diese Keys speichern und laden; beim ersten Öffnen der K2-Galerie (wenn K2-Stammdaten leer) einmalig aus Muster-Stammdaten übernehmen. Siehe Regel „keine-eingaben-zweimal“.

---

## Wichtige Dateien

| Bereich        | Dateien |
|----------------|---------|
| Lizenzmodell   | `docs/LIZENZMODELL-BASIC-PRO-ENTERPRISE.md`, `docs/LICENCE-STRUKTUR.md` |
| mök2 / Lizenzen| `src/pages/LicencesPage.tsx`, `src/pages/VerguetungPage.tsx`, `src/pages/EmpfehlungstoolPage.tsx` |
| Fachbegriffe   | `src/components/TermWithExplanation.tsx` |
| Einstieg       | `src/pages/PlatformStartPage.tsx`, `src/App.tsx` (Redirect licences) |
| Regeln         | `.cursor/rules/keine-eingaben-zweimal.mdc`, `.cursor/rules/georg-smarte-benutzeroberflaeche.mdc` |
| Crash          | `src/main.tsx` |

---

*Stand: 17.02.26 – Session abgespeichert.*
