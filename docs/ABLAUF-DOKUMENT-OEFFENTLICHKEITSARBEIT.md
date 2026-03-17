# Ablauf eines Dokuments im Flow – Öffentlichkeitsarbeit

**Von der Generierung bis zum Absenden bzw. Zwischenlagern vor Senden.**  
Stand: 16.03.26. Quelle: Code (ScreenshotExportAdmin, documentsStorage, autoSave).

---

## 1. Übersicht

| Phase | Was passiert | Wo (Code / Speicher) |
|-------|--------------|----------------------|
| **1. Generierung** | Content aus Event + Stammdaten erzeugen | Generatoren in ScreenshotExportAdmin |
| **2. Dokument anlegen** | Placeholder-Eintrag + HTML/Blob erstellen | `loadDocuments()` → `saveDocuments([...existing, placeholder])` |
| **3. Zwischenlagern** | Liste in State + localStorage schreiben | `documentsStorage`: k2-documents / k2-oeffentlich-documents / k2-vk2-documents |
| **4. Anzeigen/Bearbeiten** | Dokument öffnen (In-App oder Redaktions-Modal) | `openDocumentInApp`, `handleViewEventDocument`, Newsletter/Social-Redaktion |
| **5. Speichern nach Bearbeitung** | Aktualisierter Inhalt zurück in die Liste | postMessage (Social), afterprint (Presse), Redaktions-Modal „Speichern“ |
| **6. Absenden** | Kein Versand aus der App – Nutzer kopiert/druckt und versendet selbst | Zwischenablage, Medienspiegel (E-Mail-Adressen kopieren), Drucken |

**Kern:** „Absenden“ ist kein technischer Schritt in der App. Das Dokument wird **zwischengelagert** (localStorage + State). Zum **Versand** nutzt der Nutzer „In Zwischenablage“ / „Als PDF drucken“ und sein E-Mail-Programm (Medienspiegel = BCC-Adressen kopieren).

---

## 2. Generierung (Schritt 1)

- **Einstieg:** Admin → Eventplanung → Event wählen → PR-Vorschläge / Presse / Newsletter / Plakat / Social / Event-Flyer.
- **Content-Generatoren** (reine Daten, kein Speicher):
  - `generatePresseaussendungContent(event)`
  - `generateNewsletterContent(event)`
  - `generateSocialMediaContent(event)`
  - `generatePlakatContent` / Flyer-Content
- **Eingaben:** Event (Titel, Datum, Ort), Stammdaten (Galerie/Verein, Kontakt), ggf. mök2-Texte (Presse-Story).  
- **Ausgabe:** Objekte mit `title`, `content`, `subject`, `body`, `instagram`, `facebook`, `whatsapp` usw. – noch **nicht** in der Dokumenten-Liste.

---

## 3. Dokument anlegen (Schritt 2)

- **Auslöser:** Klick auf „Presse (neutral/lokal)“, „Newsletter“, „Plakat“, „Social“, „Event-Flyer“ oder „PR-Vorschläge (alle)“.
- **Ablauf typisch:**
  1. HTML aus Content + Design (z. B. `generateEditablePresseaussendungPDF`, Plakat-HTML, Flyer-HTML) bauen.
  2. **Placeholder** erzeugen: `id`, `name`, `category: 'pr-dokumente'`, `eventId`, `werbematerialTyp` (presse, newsletter, plakat, social, event-flyer), `fileType: 'text/html'`, `fileName`, anfangs `data: ''` oder kleines Blob.
  3. **Speichern:** `const existing = loadDocuments()` (liest aus localStorage, Key abhängig von K2/ök2/VK2), dann `saveDocuments([...existing, placeholder])` und `setDocuments([...existing, placeholder])`.
- **Speicherort:** `documentsStorage.ts` → Key je Kontext: `k2-documents`, `k2-oeffentlich-documents`, `k2-vk2-documents`.  
- **Hinweis:** In ScreenshotExportAdmin gibt es eine **lokale** Funktion `saveDocuments(docs)` (ca. Zeile 7913), die `tenant.getDocumentsKey()` nutzt und sowohl `localStorage.setItem` als auch `setDocuments(docs)` aufruft. Die Schicht `documentsStorage.saveDocuments(tenantId, documents)` wird an anderen Stellen (z. B. GaleriePage, autoSave) genutzt; im Admin wird über die lokale `saveDocuments` der State + der passende Key (über `tenant.getDocumentsKey()`) geschrieben.

---

## 4. Zwischenlagern (Schritt 3)

- **Bedeutung:** Das Dokument „liegt“ in der **Dokumenten-Liste** des aktuellen Kontexts (K2, ök2 oder VK2).
- **Laden:** Beim Öffnen des Admin / Kontextwechsel: `loadDocuments()` aus `documentsStorage` (Key nach Kontext), Ergebnis in State `documents` (useEffect mit 300 ms Delay bei Kontextwechsel).
- **Schreiben:** Jedes „Speichern“ (neu anlegen, nach Bearbeitung, nach Druck) aktualisiert die Liste und schreibt sie in den Kontext-Key (siehe Abschnitt 5).  
- **Auto-Save:** `autoSave.ts` kann periodisch Events + Dokumente aus dem Admin-State in localStorage schreiben – nur im K2-Admin, mit Schutz (keine VK2-Daten in K2).

---

## 5. Anzeigen und Bearbeiten (Schritt 4)

- **Öffnen:** Aus der Event-Liste / Dokumenten-Liste Klick auf ein Dokument → `handleViewEventDocument(document, event)`.
  - Liest `document.fileData` oder `document.data` (Base64-HTML).
  - Spezialfälle: **Social** → `openSocialRedaction(…)` (Modal mit Instagram/Facebook/WhatsApp + Bild). **Newsletter** → `openNewsletterRedaction(…)` (Modal Betreff/Inhalt).
  - Sonst: HTML decodieren, mit „Zurück“-Button wrappen, `openDocumentInApp(html, title)` → Anzeige im **In-App-Viewer** (gleicher Tab, Druck-Fußzeile).
- **Bearbeitbare Presse/Plakat/Flyer (neues Fenster):** Teilweise wird ein **neues Fenster** mit `window.open(blobUrl)` geöffnet; nach **Druck** (afterprint) wird der aktuelle HTML-Stand als Blob gelesen, per FileReader in Base64 gewandelt und der zugehörige Dokument-Eintrag in der Liste mit `data`/`fileData` aktualisiert → `saveDocuments(updated)`.

---

## 6. Speichern nach Bearbeitung (Schritt 5)

- **Social-Media-Dokument:** Geöffnetes Fenster/Modal sendet `postMessage` mit `type: 'k2-save-social-doc'` und Payload (docId, instagram, facebook, whatsapp, imageDataUrl, eventTitle, eventDate). Admin lauscht per `window.addEventListener('message')`, baut aus den Feldern neues HTML, Blob → Base64, ersetzt in der Dokumenten-Liste den Eintrag mit `docId` durch `{ ...d, data: reader.result }` → `saveDocuments(updated)`, `setDocuments(updated)`.
- **Presse/Plakat/Flyer (Fenster mit Druck):** Nach `afterprint` wird der Blob des geöffneten Dokuments gelesen, Base64 in den Eintrag geschrieben, Liste aktualisiert → `saveDocuments(updated)`, `setDocuments(updated)`.
- **Newsletter/PR-Redaktion:** Beim Speichern im Modal wird der bestehende Eintrag mit neuem Inhalt (Betreff, Body, ggf. HTML) aktualisiert und `saveDocuments(updated)` aufgerufen.

Damit ist das **Zwischenlagern vor Senden** abgeschlossen: Das fertige Dokument steht in der Liste und in localStorage.

---

## 7. Absenden (Schritt 6) – außerhalb der App

- **Kein E-Mail-Versand aus der App.** Der Nutzer:
  1. **Presseaussendung:** „In Zwischenablage“ (exportPresseaussendungAsText) → Text in Word/Pages einfügen oder direkt in E-Mail; **Medienspiegel** → Häkchen setzen → „E-Mail-Adressen kopieren“ → im E-Mail-Programm bei BCC einfügen → Senden.
  2. **Newsletter / Social:** Entweder „Als PDF drucken“ und Versand per eigenem Tool, oder „In Zwischenablage“ (Newsletter/Social-Text) und Versand wie oben.
  3. **Plakat/Flyer:** Drucken oder Export als PDF/HTML, dann Verteilung (Druck, Web, Social) manuell.

**Medienspiegel:** Liste von Medien (Name + E-Mail) pro Kontext in localStorage (eigener Key). Dient nur dazu, E-Mail-Adressen auszuwählen und **in die Zwischenablage zu kopieren** (BCC im E-Mail-Programm).

---

## 8. Wichtige Dateien und Funktionen

| Thema | Datei / Funktion |
|-------|-------------------|
| Speicher Keys, Lesen/Schreiben | `src/utils/documentsStorage.ts` – `loadDocuments(tenantId)`, `saveDocuments(tenantId, documents)` |
| Admin: State + lokales Speichern | `components/ScreenshotExportAdmin.tsx` – `saveDocuments(docs)` (lokal), `loadDocuments()`, `setDocuments` |
| Generatoren Content | ScreenshotExportAdmin – `generatePresseaussendungContent`, `generateNewsletterContent`, `generateSocialMediaContent`, Flyer/Plakat-Generatoren |
| Dokument anlegen + öffnen | `generateEditablePresseaussendungPDF`, `generateEditableNewsletterPDF`, Plakat/Flyer-Blöcke, `openDocumentInApp`, `handleViewEventDocument` |
| Speichern aus geöffnetem Doc | postMessage-Handler (`k2-save-social-doc`), afterprint → FileReader → `saveDocuments(updated)` |
| Zwischenablage / „Absenden“-Hilfe | `exportPresseaussendungAsText`, Newsletter/Social „Kopieren“, Medienspiegel „E-Mail-Adressen kopieren“ |

---

## 9. Kurzfassung

- **Generierung:** Content aus Event + Stammdaten, keine Speicherung.
- **Anlegen:** Placeholder in Dokumenten-Liste, sofort `saveDocuments` + `setDocuments` → **Zwischenlagern** in State und localStorage (Kontext-Key).
- **Bearbeiten:** Öffnen im Viewer oder Redaktions-Modal; Speichern aktualisiert den Eintrag (data/fileData) und schreibt die Liste erneut → **Zwischenlagern** bleibt aktuell.
- **Absenden:** Nicht in der App. Nutzer kopiert Text/Adressen oder druckt PDF und versendet mit dem eigenen E-Mail-Programm.

Damit ist der Ablauf von der Generierung bis zum Zwischenlagern und bis zur Nutzung zum Absenden (Kopieren/Drucken + externer Versand) abgedeckt.
