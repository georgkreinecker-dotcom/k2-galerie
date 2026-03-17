# Ablauf Dokument Öffentlichkeitsarbeit – Verbesserungspotenziale

**Analyse des Prozesses (Generierung → Zwischenlagern → Absenden) auf Verbesserungspotenziale.**  
Stand: 16.03.26. Basis: [ABLAUF-DOKUMENT-OEFFENTLICHKEITSARBEIT.md](ABLAUF-DOKUMENT-OEFFENTLICHKEITSARBEIT.md).

---

## 1. Übersicht nach Kategorien

| Kategorie | Schwerpunkt | Priorität (Einschätzung) |
|-----------|-------------|---------------------------|
| **Daten & Architektur** | Ein Schreibweg, Schutzmechanismen überall | Hoch |
| **UX / Kein Datenverlust** | Speichern ohne Druck, klare Bestätigung | Hoch |
| **Ein Standard pro Problem** | Öffnen/Anzeigen, Feldnamen, eine Schicht | Mittel |
| **One-Click / Absenden** | Weniger Schritte, klare Führung | Mittel |
| **Lesbarkeit & Wartung** | Doppelungen, Delay, Feedback | Niedrig |

---

## 2. Daten & Architektur

### 2.1 Zwei Schreibwege für Dokumente (Schicht umgehen)

**Ist:**  
- Im Admin: **lokale** Funktion `saveDocuments(docs)` (ScreenshotExportAdmin, ca. Zeile 7913) schreibt direkt `localStorage.setItem(tenant.getDocumentsKey(), JSON.stringify(docs))` und `setDocuments(docs)`.
- Die zentrale Schicht **documentsStorage.saveDocuments(tenantId, documents)** wird im Admin beim normalen Speichern **nicht** verwendet; nur z. B. bei Export (`saveDocumentsToStorage('k2', documentsForExport)`).

**Risiko:**  
Die in `documentsStorage` eingebauten **Schutzmechanismen** (kein Überschreiben mit leerer Liste bei 2+ Dokumenten, K2 nicht mit VK2-Daten überschreiben, ök2/VK2 vice versa) greifen bei allen Schreibvorgängen aus dem Admin **nicht**. Theoretisch könnte ein Bug oder Race (z. B. Kontextwechsel + Auto-Save) dazu führen, dass eine leere Liste oder fremde Kontext-Daten geschrieben werden.

**Verbesserung:**  
- **Ein Schreibweg:** Im Admin überall dort, wo Dokumente persistent gespeichert werden, `saveDocumentsToStorage(tenant.tenantId, docs)` (bzw. der passende TenantId-Wert) aufrufen und danach `setDocuments(docs)`. Die lokale `saveDocuments(docs)` durch einen Aufruf ersetzen, der die Schicht nutzt und den Rückgabewert/Erfolg prüft (Schicht kann bei Schutz abbrachen und nichts schreiben – dann State nicht überschreiben).
- So gelten Leer-Liste-Schutz und Kontext-Trennung **immer**, auch im Admin.

---

### 2.2 Feld `data` vs. `fileData`

**Ist:**  
Dokumente haben teils `data`, teils `fileData` für den HTML/Base64-Inhalt. `handleViewEventDocument` liest `document.fileData || document.data`. Beim Speichern nach Bearbeitung wird oft `data` gesetzt (`{ ...d, data: reader.result }`).

**Risiko:**  
Inkonsistenz kann an anderen Stellen (z. B. GaleriePage, Export, Backup) zu „Dokument ohne Inhalt“ führen, wenn nur ein Feld erwartet wird.

**Verbesserung:**  
- **Ein Feld** für den Binär-/Base64-Inhalt (z. B. einheitlich `fileData`) in Doku und Code festlegen; beim Lesen weiterhin beide Felder unterstützen (Rückwärtskompatibilität), beim Schreiben immer nur das eine Feld setzen.
- Oder explizit in documentsStorage/Doku: „Dokumente haben fileData; data ist Alias für Anzeige.“ und überall beim Speichern beide setzen oder migrieren.

---

## 3. UX / Kein Datenverlust

### 3.1 Speichern nur bei „Druck“ (Presse/Plakat/Flyer im neuen Fenster)

**Ist:**  
Bei Presse/Plakat/Flyer wird teilweise ein **neues Fenster** mit `window.open(blobUrl)` geöffnet. Der aktuelle Inhalt wird nur **nach dem Druck** (Event `afterprint`) per FileReader in Base64 gewandelt und in die Dokumenten-Liste geschrieben. Schließt der Nutzer das Fenster **ohne zu drucken**, gehen alle Änderungen im Fenster **verloren**.

**Verbesserung:**  
- **„Speichern“-Button** im geöffneten Dokument (neben „Als PDF drucken“ / „Zurück“): Klick liest aktuelles HTML (z. B. aus `document.documentElement.outerHTML` oder aus dem gerenderten Inhalt), sendet es per `postMessage` an den Admin (analog zu `k2-save-social-doc`) oder triggert ein Speichern mit aktuellem Blob; Admin aktualisiert den Dokument-Eintrag.
- **Oder:** Beim Schließen des Fensters (`beforeunload`) Rückfrage: „Änderungen speichern?“ → bei Ja: gleicher Mechanismus wie afterprint (Blob/HTML an Admin senden, dann schließen).
- So gilt: **Bearbeiten + Speichern** ist explizit möglich, nicht nur über Druck.

---

### 3.2 Sichtbare Bestätigung nach Speichern

**Ist:**  
Nach dem Speichern aus dem Social-Media-Modal (postMessage) oder aus der Newsletter-Redaktion wird die Liste aktualisiert, aber es gibt nicht überall eine **explizite** UI-Bestätigung (z. B. „Gespeichert“ oder kurzer Toast).

**Verbesserung:**  
- Nach jedem erfolgreichen `saveDocuments(updated)` (aus postMessage, Redaktions-Modal, afterprint) eine **kurze, einheitliche Bestätigung** anzeigen (z. B. Toast oder Hinweis neben der Dokumentenliste: „Gespeichert.“), damit der Nutzer sicher ist, dass die Änderung angekommen ist.

---

## 4. Ein Standard pro Problem

### 4.1 Öffnen: In-App-Viewer vs. neues Fenster

**Ist:**  
- **In-App-Viewer** (`openDocumentInApp`): gleicher Tab, einheitliche Leiste, Druck-Fußzeile – wird für viele Dokumente genutzt.
- **Neues Fenster** (`window.open(blobUrl)`): bei einigen Presse-/Plakat-/Flyer-Flows; anderes Verhalten („Zurück“ schließt Fenster, Fokus wechselt), Speichern nur via afterprint.

**Verbesserung:**  
- Wo technisch sinnvoll: **ein Standard „Dokument öffnen = In-App-Viewer“** (ein-standard-problem.mdc). Bearbeitbare Presse/Plakat/Flyer entweder:
  - im In-App-Viewer mit eingebettetem „Speichern“-Button (Inhalt als HTML an State/Liste zurückmelden), oder
  - weiter im neuen Fenster, aber mit **explizitem Speichern-Button** und optional beforeunload (siehe 3.1).
- So ist das Verhalten vorhersehbar und „Zurück“ führt immer in den Admin.

---

### 4.2 300-ms-Delay beim Laden der Dokumente (Kontextwechsel)

**Ist:**  
Beim Kontextwechsel werden Dokumente mit `setTimeout(..., 300)` verzögert aus localStorage geladen (`loadDocuments()` dann `setDocuments(docs)`).

**Risiko:**  
Kurz sichtbar alte Daten oder leere Liste; bei schnellem Tab-Wechsel theoretisch Race. Grund für das Delay ist vermutlich, dass der Kontext (tenant) erst wechselt und dann der richtige Key gelesen werden soll.

**Verbesserung:**  
- Prüfen, ob 300 ms zwingend nötig sind; wenn ja, in Doku kurz begründen (z. B. „Kontext/Key erst nach Render gesetzt“). Wenn nein: Delay entfernen oder auf Minimum reduzieren und ggf. Abhängigkeit von `tenant.dynamicTenantId` / Kontext-Status klar machen, damit keine Races entstehen.

---

## 5. One-Click / Absenden

### 5.1 Absenden = viele manuelle Schritte

**Ist:**  
„Absenden“ passiert außerhalb der App: Presse „In Zwischenablage“ → E-Mail-Programm öffnen → Medienspiegel → „E-Mail-Adressen kopieren“ → BCC einfügen → Text einfügen → Senden. Mehrere getrennte Aktionen.

**Hinweis:**  
Bewusste Entscheidung: **Kein E-Mail-Versand aus der App** (Skalierung, keine direkte Kundenbindung per Versand aus K2). Daher kein Vorschlag „Versand aus der App“.

**Verbesserung (optional):**  
- **Ein Klick „Alles für E-Mail kopieren“:** Presse-Text und BCC-Adressen (aus Medienspiegel-Auswahl) in einem definierten Format in die Zwischenablage (z. B. erst Text, dann Hinweis „BCC-Adressen: …“ oder zweiter Klick für BCC). So reduziert sich die Schrittzahl im E-Mail-Programm (einmal einfügen, BCC aus zweiter Ablage oder einem Klick).
- Oder klare **Kurz-Anleitung im UI** (ein Satz): „Presse: 1) In Zwischenablage 2) Medienspiegel: E-Mails kopieren 3) In E-Mail bei BCC einfügen“ – damit der Ablauf immer sichtbar ist.

---

### 5.2 Medienspiegel und Presse-Dokument verknüpfen

**Ist:**  
Medienspiegel und das geöffnete Presse-Dokument sind getrennt (anderer Tab/Bereich). Nutzer muss selbst wechseln und sich merken, wo er was kopiert hat.

**Verbesserung (optional):**  
- Beim Öffnen eines Presse-Dokuments oder beim Button „In Zwischenablage“ einen **kurzen Hinweis** anzeigen: „Tipp: E-Mail-Adressen für BCC unter Eventplanung → Medienspiegel.“ Oder in der Presse-Ansicht einen kleinen Link „E-Mail-Adressen kopieren (Medienspiegel)“ anbieten, der zum Medienspiegel scrollt oder die aktuelle Auswahl kopiert.

---

## 6. Lesbarkeit & Wartung

### 6.1 Doppelte Logik (afterprint, goBack, cleanup)

**Ist:**  
Mehrere Dokument-Typen (Presse, Plakat, Newsletter, Social, Flyer, PR-Vorschläge) bauen jeweils eigenes HTML mit eingebettetem Script; darin wiederholt sich die gleiche Logik: `afterprint` → goBack, cleanup, setFormat, ADMIN_RETURN_URL. Viele fast identische Blöcke.

**Verbesserung:**  
- **Gemeinsame Hilfsfunktion** (z. B. `buildPrDocumentShell(htmlBody, options)`) die Kopf, Script-Block (goBack, afterprint, setFormat, cleanup) und Fuß aus Options zusammensetzt. Reduziert Duplikate und Fehleranfälligkeit bei Änderungen (z. B. neues Verhalten beim Speichern).

---

### 6.2 Größenprüfung / Quota

**Ist:**  
- Admin: lokale `saveDocuments` fängt `QuotaExceededError` ab und versucht `tryFreeLocalStorageSpace()`.
- documentsStorage: nur Prüfung `json.length > 10_000_000`; kein Abfangen von Quota im Aufrufer.

**Verbesserung:**  
- Beim Schreiben über die Schicht (`documentsStorage.saveDocuments`) im Admin auf Quota-Fehler reagieren (z. B. try/catch, bei QuotaExceeded gleiche Logik wie lokal: Speicher freigeben, Hinweis). Wenn Admin künftig nur noch die Schicht nutzt (siehe 2.1), diese Fehlerbehandlung einmal dort oder im Aufrufer vorsehen.

---

## 7. Priorisierte Empfehlungen

| Nr. | Maßnahme | Kategorie | Aufwand (grob) |
|-----|----------|-----------|----------------|
| 1 | Admin-Schreibvorgänge über documentsStorage laufen lassen (ein Schreibweg, alle Schutzmechanismen) | Daten & Architektur | Mittel |
| 2 | „Speichern“-Button oder beforeunload-Speichern für Presse/Plakat/Flyer im neuen Fenster (kein Datenverlust ohne Druck) | UX | Mittel |
| 3 | Sichtbare Bestätigung „Gespeichert“ nach jedem Dokument-Speichern | UX | Gering |
| 4 | Einheitliches Feld für Dokument-Inhalt (fileData) und beim Schreiben immer setzen | Daten | Gering–Mittel |
| 5 | Dokumente einheitlich im In-App-Viewer öffnen oder im neuen Fenster mit Speichern-Button (ein Standard) | Ein Standard | Mittel |
| 6 | Optional: „Alles für E-Mail kopieren“ oder klare Einzeiler-Anleitung für Absenden | One-Click | Gering |
| 7 | Gemeinsame Shell/Hilfsfunktion für PR-Dokument-HTML (afterprint, goBack, cleanup) | Wartung | Mittel |
| 8 | 300-ms-Delay beim Dokumente-Laden prüfen und ggf. reduzieren oder begründen | Wartung | Gering |

---

## 8. Kurzfassung

- **Stärkste Hebel:** (1) **Ein Schreibweg** über documentsStorage im Admin, damit alle Schutzmechanismen greifen; (2) **Speichern ohne Druck** (Button oder beforeunload) für bearbeitbare Dokumente im neuen Fenster, damit keine Änderungen verloren gehen.
- **Schnelle Verbesserungen:** Einheitliche „Gespeichert“-Bestätigung; ein Feld (fileData) für Inhalt; optional eine Anleitung oder ein Kombi-Kopiervorgang für Absenden.
- **Sportwagenmodus:** Ein Standard für „Dokument öffnen“ und „Dokument speichern“; eine Schicht für alle Schreibvorgänge.

Die bewusste Entscheidung **kein E-Mail-Versand aus der App** bleibt unberührt; die Verbesserungen betreffen nur Speichern, Schichtnutzung und klare Führung bis zum „Kopieren/Drucken + Versand selbst“.

---

## 9. Umsetzung (16.03.26)

| Nr. | Maßnahme | Status |
|-----|----------|--------|
| 1 | Ein Schreibweg: Admin nutzt documentsStorage überall | ✅ Umgesetzt |
| 2 | Speichern-Button für Presse im neuen Fenster (postMessage k2-save-doc-html) | ✅ Umgesetzt |
| 3 | Sichtbare Bestätigung „✓ Gespeichert“ (documentSaveFeedback, Viewer + Öffentlichkeitsarbeit-Bereich) | ✅ Umgesetzt |
| 4 | Einheitlich fileData beim Speichern; Lesen fileData \|\| data | ✅ Umgesetzt |
| 5 | 300-ms-Delay beim Dokumente-Laden entfernt (0 ms, wie bei Events) | ✅ Umgesetzt |
| 6 | Optional: Kurze Absenden-Anleitung im UI | Feinschliff (ein Satz) |

**Feinschliff:** Doku konsistent; optional ein Satz im UI für Presse-Absenden (Zwischenablage → Medienspiegel → BCC).
