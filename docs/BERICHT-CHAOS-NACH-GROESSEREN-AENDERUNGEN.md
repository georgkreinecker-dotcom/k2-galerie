# Bericht: Chaos nach größeren Änderungen – wo wir schon reparieren mussten

**Zweck:** Übersicht, wo nach größeren Änderungen wiederholt Chaos entstand und wir es mühsam in den Griff bringen mussten. Grundlage für die **eiserne Regel**, damit das Muster (große Änderung → Chaos → Reparatur) nicht weiter passiert.

**Stand:** März 2026. Wird bei neuen Reparatur-Themen ergänzt.

---

## 1. Admin / Kontext / Layout

| Was passiert ist | Reparatur (wo/wie) | Regel/Doku |
|------------------|--------------------|------------|
| **Admin „fehlte“ in K2/VK2, ök2 „falsch“** – Kontext aus sessionStorage, drei konkurrierende UIs (Guide-Balken, zwei Guide-Panels, Hub). | TenantContext: `/admin` ohne `?context=` = immer K2. Guide-Balken und beide Guide-Panels mit `false &&` abgeschaltet; ein Hub für alle. | admin-einheitliches-layout.mdc, ADMIN-LAYOUT-REGEL.md |
| **K2-Galerie zeigte VK2-Inhalte** – Auto-Save schrieb bei VK2-Kontext in K2-Keys. | Auto-Save nur bei K2; URL `?context=` case-insensitive; zweite Absicherung: Auto-Save nur wenn URL weder oeffentlich noch vk2. | BUG-039, BUG-038; fehlersuche-zuerst-struktur-datenfluss.mdc |
| **K2-Events/K2-Dokumente mit VK2 überschrieben** – Tab-Wechsel, State noch VK2, Auto-Save schrieb in k2-events/k2-documents. | eventsStorage/documentsStorage lehnen fremde Kontext-Daten ab; autoSave-Guards; Events bei Kontextwechsel sofort (0 ms) laden. | k2-events-documents-niemals-vk2-schreiben.mdc |
| **Kontext-Vergiftung** – Nach ök2-Admin blieb sessionStorage; nächster K2-Aufruf ohne ?context= zeigte ök2, K2-Fotos in falsche Keys. | Kontext aus URL vor Storage; beim Absichern immer „Was passiert beim Wechsel zurück?“ prüfen. | kontext-vergiftung-vermeiden.mdc |
| **Admin iframe: Bilder verschwinden / nur in Bearbeiten sichtbar** – data: gestrippt, Liste verwarf blob:-URLs. | convertDataUrlsToBlobUrlsInList überall; blob in Liste nicht verwerfen; ANALYSE-ADMIN-BILD-VERSCHWINDET. | BUG-033, ANALYSE-ADMIN-BILD-VERSCHWINDET-BEI-SPEICHERN.md |
| **Admin Build rot** – Riesiger JSX-Block mit IIFEs, Parser-Chaos. | Große Conditional-Blöcke in Hilfsfunktion auslagern; Build nie dauerhaft rot. | jsx-grosse-bloeke-auslagern.mdc, ANALYSE-ADMIN-BUILD-DESASTER-06-03.md |

---

## 2. Sync / Veröffentlichen / Laden / Merge

| Was passiert ist | Reparatur (wo/wie) | Regel/Doku |
|------------------|--------------------|------------|
| **Lokal überschrieb Server** – Nach „An Server senden“ beim Abholen wieder alte lokale Version. Viele Stunden Frust. | serverAsSoleTruth: true; Grundregel: Nach Senden ist Server einzige Wahrheit. | BUG-037, LEHRE-DESIGN-FEHLER-SERVER-WAHRHEIT.md, prozesssicherheit-veroeffentlichen-laden.mdc |
| **Merge ohne preserveLocalImageData** – Server-Daten ersetzten lokale Bilddaten. | mergeServerWithLocal + preserveLocalImageData überall; „Werke vom Server zurückholen“ mit preserve. | BUG-021, BUG-024, BUG-029 |
| **QR/Handy alte Daten** – Statische gallery-data.json vor API geladen. | Immer zuerst GET /api/gallery-data; nur bei Fehler Fallback. | BUG-018, BUG-023 |
| **Link öffnet APf statt Unterseite („10.mal“)** – Route-Reihenfolge, stiller Redirect. | Spezifische Routen vor `/projects/:projectId`; NotFoundOrRedirect; Checkliste bei neuer Unterseite. | BUG-034, ANALYSE-LINK-OEFFNET-APF-STATT-UNTERSEITE.md, link-projekt-unterseite-nie-apf.mdc |

---

## 3. Bilder / Werke / ImageStore

| Was passiert ist | Reparatur (wo/wie) | Regel/Doku |
|------------------|--------------------|------------|
| **Bild bei Werk A verschwindet beim Speichern von B** – iframe, imageRef verloren, mehrere State-Pfade. | convertDataUrlsToBlobUrlsInList überall; blob in Liste nicht verwerfen; systematische Analyse aller Schreibpfade. | BUG-033, ANALYSE-ADMIN-BILD-VERSCHWINDET-BEI-SPEICHERN.md |
| **Bearbeiten nutzte keinen ImageStore** – data-URL direkt in localStorage → Speicherproblem, Platzhalter. | Werke mit Bild = immer prepareArtworksForStorage / saveArtworksByKeyWithImageStore. | werke-bilder-immer-imagestore.mdc, BUG-031/0035, standard-verstoss-alle-stellen-nachziehen.mdc |
| **K2-K-0030 Varianten falsch** – digits = "20030", Export fand Bild nicht. | K2-Muster: Zifferngruppe (k2[2]) für Varianten; nie digits aus ganzem String. | ein-standard-problem.mdc (Bild-Ref-Varianten), artworkImageStore.test.ts |
| **ök2 Musterwerke alle gleiches Bild (Vase)** – prepareArtworksForStorage + Varianten für M1/K1/G1/S1. | Externe URL als imageRef; Musterwerke nicht aus IndexedDB befüllen; getOek2DefaultArtworkImage. | BUG-035 |

---

## 4. Stammdaten / Datentrennung / Keys

| Was passiert ist | Reparatur (wo/wie) | Regel/Doku |
|------------------|--------------------|------------|
| **Filter + setItem löschte VK2-Mitgliederdaten** – still aus localStorage entfernt. | Niemals Filter + setItem; Kundendaten nur nach expliziter User-Aktion schreiben. | datentrennung-localstorage-niemals-loeschen.mdc, niemals-kundendaten-loeschen.mdc |
| **Stammdaten mit leer überschrieben** – welcomeImage, virtualTourImage, Kontakt weg. | Merge: bestehenden Wert aus Speicher übernehmen wenn neu leer; K2_STAMMDATEN_DEFAULTS. | kein-datenverlust.mdc |
| **mök2/VK2-Inhalte bei Refactor gelöscht** – Sektionen, Lizenzstruktur VK2 weg. | Bei Refactor prüfen: Betrifft es mök2/VK2? Nur explizit genannte Teile ändern. | mok2-vk2-inhalte-nicht-entfernen.mdc, MOK2-VK2-BEREICHE-SCHUETZEN.md |

---

## 5. Sonstige (Stand, Reload, Variable, UX)

| Was passiert ist | Reparatur (wo/wie) | Regel/Doku |
|------------------|--------------------|------------|
| **QR mit lokalem Build → Handy alte Version** | buildQrUrlWithBust + useQrVersionTimestamp; nie nur urlWithBuildVersion. | stand-qr-niemals-zurueck.mdc |
| **Automatischer Reload → Code 5** | Kein Auto-Reload; nur Badge/Button. | code-5-crash-kein-auto-reload.mdc |
| **useLocation vor Verwendung** – „Cannot access uninitialized variable“. | Router-Hooks am Komponentenanfang. | variable-vor-verwendung-hooks.mdc, ANALYSE-OEK2-GALERIE-BETRETEN-FEHLER-06-03.md |
| **ök2 Willkommensbild Uraltbild (zweimal)** | Default = stabile URL; Legacy-Pfade; getOek2WelcomeImageEffective. | oek2-willkommensbild-nie-uraltbild.mdc |
| **Etikett-Druck: nur neuer Tab, kein Druckdialog** | Primärer Weg = Druckdialog; „In neuem Tab“ nur Fallback. | kritische-ablaeufe-nicht-abschnwaechen.mdc |

---

## 6. Wiederholungen (gleiche Fehlerklasse mehrfach)

| Fehlerklasse | Wie oft / Zitat | Absicherung |
|--------------|------------------|-------------|
| Link zu Projekt-Unterseite öffnet APf | 10× – „dieser Fehler passiert dir jetzt schon das 10.mal wo bleibt fehleranalyse“ | Route vor /projects/:projectId; Regel + Checkliste |
| Admin: Bild bei Werk A verschwindet bei Speichern von B | Wiederholung – „wie oft machst du das gleiche“ | BUG-033, Analyse-Dokument, alle setAllArtworksSafe + convertDataUrlsToBlobUrlsInList |
| Sofort an Oberfläche reparieren statt Quelle | K2 zeigte VK2 – Fix war an der Schreibstelle (Auto-Save), nicht an der Anzeige | fehlersuche-zuerst-struktur-datenfluss.mdc, DATENFLUSS-GALERIE-STRUKTUR.md |

---

## 7. Fazit für die eiserne Regel

- **Muster:** Größere Änderung (Refactor, neues Feature, „Aufräumen“) berührt oft mehrere Stellen oder Kontexte. Ohne Vorprüfung (GELOESTE-BUGS, Regeln, Datenfluss) und ohne Nachprüfung (alle Pfade, Tests) entsteht Chaos – danach müssen wir reparieren.
- **Bereiche mit hohem Risiko:** Admin/Kontext, Sync/Merge/Laden, Werke/Bilder/ImageStore, Stammdaten/Keys, Routen/Links, Stand/QR.
- **Verbindung:** Eiserne Regel **eiserne-regel-groessere-aenderung-kein-chaos.mdc** – vor/in/nach größerer Änderung Pflicht-Checks, damit dieses Muster nicht weitergeht.
