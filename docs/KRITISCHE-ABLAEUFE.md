# Kritische Abläufe – eine Quelle, kein Abschwächen

**Zweck:** Diese Abläufe haben wir mühsam zum Laufen gebracht. Sie dürfen nicht durch „Verbesserungen“ oder neue Optionen so geändert werden, dass der **primäre Weg** ausfällt oder zum Fallback wird. Eine Quelle pro Ablauf – Referenz für Code und für die AI.

**Übersicht (alle mit Absicherung/Pflicht-Check bei Änderung):**  
1. Etikett drucken · 2. Veröffentlichen · 3. Laden vom Server · 4. Werke mit Bild speichern · 5. Stand & QR · 6. Kundendaten/geschützte Keys · 7. Stammdaten nicht leer überschreiben · 8. Dokument aus Admin öffnen · 9. Bild einfügen/übernehmen · 10. K2/ök2 Datentrennung · 11. Backup & Wiederherstellung · 12. K2 echte Galerie = fertig (eisernes Gesetz) · 13. Events/Dokumente – Kontext-Trennung K2/ök2/VK2 (100 % symmetrisch) · 14. Schutzmechanismen – alle Bereiche – keine Ausnahmen · **15. VK2-Refactors – K2-Kern unberührt (Admin, Impressum, Stammdaten)**

---

## 1. Etikett drucken

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | Ein Klick „🖨️ Etikett drucken“ → **Druckdialog öffnet sich** (Popup-Fenster + `win.print()`). Nutzer wählt Brother/AirPrint und druckt. |
| **Doku** | **DRUCKER-AIRPRINT.md** (Ablauf „Etikett-Druck in K2: Ablauf (klassisch)“). |
| **Code** | `components/ScreenshotExportAdmin.tsx` – `handleShareLabel` (Desktop): zuerst Popup + `win.print()`; nur bei blockiertem Popup Fallback „In neuem Tab öffnen“. |

**NIEMALS:** Den Default so setzen, dass der Button **nur** einen neuen Tab öffnet und der Druckdialog **nie** erscheint. Option „Etikett in neuem Tab“ = nur Fallback oder Zusatz, **kein** Ersatz für den Druckdialog als Standard-Reaktion auf den Button.

---

## 2. Veröffentlichen (gallery-data an Server)

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | Ein Weg: **publishGalleryDataToServer(artworks)**. Ablauf: resolve → artworksForExport → POST /api/write-gallery-data. |
| **Doku** | docs/PROZESS-VEROEFFENTLICHEN-LADEN.md, .cursor/rules/prozesssicherheit-veroeffentlichen-laden.mdc. |
| **Code** | src/utils/publishGalleryData.ts. Aufrufer: DevViewPage, GalerieVorschauPage. |

**NIEMALS:** Eigenen Fetch oder eigenen Export-Pfad an anderer Stelle erfinden.

---

## 3. Laden vom Server (Stand, „Bilder vom Server laden“)

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | Immer **mergeServerWithLocal** + **preserveLocalImageData** (in dieser Reihenfolge). |
| **Doku** | docs/PROZESS-VEROEFFENTLICHEN-LADEN.md, ein-standard-problem.mdc. |
| **Code** | src/utils/syncMerge.ts. Aufrufer: GaleriePage loadData, GalerieVorschauPage handleRefresh. |

**NIEMALS:** Server-Daten direkt in localStorage schreiben ohne Merge; keinen zweiten Lade-Pfad ohne preserveLocalImageData.

**K2-Dokumente und K2-Events:** Beim Übernehmen aus der Server-Antwort (GaleriePage handleRefresh/loadData) **nur überschreiben, wenn der Server mindestens so viele Einträge hat wie lokal** (sonst stiller Datenverlust – BUG-040). Design nur bei hasMeaningfulDesign(server) übernehmen.

---

## 4. Werke mit Bild speichern

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | Immer ImageStore-Pfad: **prepareArtworksForStorage** / **saveArtworksByKeyWithImageStore** (oder -ForContextWithImageStore). |
| **Doku** | werke-bilder-immer-imagestore.mdc, docs/WERKE-SPEICHERUNG-CHECKLISTE.md. |
| **Code** | artworkImageStore.ts, artworksStorage.ts. |

**NIEMALS:** Nur saveArtworks/saveArtworksForContext mit data-URL-Listen – führt zu Speicherchaos (0031/0035).

---

## 5. Stand & QR (Handy = gleicher Stand wie Vercel)

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | QR-Scan / Stand-Badge / Seitenöffnung → **immer aktuelle Version** vom Server (kein gecachter alter Build). QR = Server-Timestamp + Cache-Bust; index.html enthält Inject-Script (Stale-Check, build-info-Fetch). |
| **Doku** | .cursor/rules/stand-qr-niemals-zurueck.mdc, docs/VERCEL-STAND-HANDY.md. |
| **Code** | `src/hooks/useServerBuildTimestamp.ts` (buildQrUrlWithBust, useQrVersionTimestamp), GaleriePage/PlatformStartPage/MobileConnectPage (QR-URLs), scripts/write-build-info.js (--inject-html), vercel.json (no-cache). |

**NIEMALS:** Nur `urlWithBuildVersion` (lokaler Build) für QR verwenden; Inject-Script entfernen oder no-cache abschwächen; Fallback-Regex in write-build-info.js entfernen.

---

## 6. Kundendaten / geschützte localStorage-Keys

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | Geschützte Keys (k2-artworks, k2-stammdaten-*, k2-vk2-stammdaten, k2-oeffentlich-artworks, …) **nur lesen** oder **nur nach expliziter User-Aktion** schreiben. Kein Filter, der Daten entfernt und zurück in den Key schreibt. |
| **Doku** | .cursor/rules/niemals-kundendaten-loeschen.mdc, .cursor/rules/datentrennung-localstorage-niemals-loeschen.mdc. |
| **Code** | Alle Stellen, die localStorage.setItem für k2-* aufrufen; syncMerge (Server-Daten: Leer-Prüfung, 50%-Prüfung vor Überschreiben). |

**NIEMALS:** Filter + setItem auf geschützte Keys; automatisches „Aufräumen“ oder Überschreiben mit weniger Daten ohne User-Aktion; Server-Leer oder drastisch kleinere Liste als Ersatz für lokal nehmen.

---

## 7. Stammdaten nicht leer überschreiben

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | Beim Laden/Speichern/Merge von Stammdaten: **bestehende Werte aus Speicher übernehmen**, wenn der neue Wert leer ist. welcomeImage, virtualTourImage, galerieCardImage, Kontakt, Adresse nie mit '' ersetzen. |
| **Doku** | .cursor/rules/kein-datenverlust.mdc. |
| **Code** | src/utils/autoSave.ts (mergeStammdatenPerson, mergeStammdatenGallery), publishGalleryData (toUrlOrEmpty für Bilder), alle Stellen die setGalleryData/setMartinaData/setGeorgData oder Stammdaten aus Server mergen. |

**NIEMALS:** Objekt bauen mit leeren Bild-/Kontaktfeldern ohne vorher bestehenden Speicher zu lesen; „Reparieren“ so umsetzen, dass das gesamte Objekt ersetzt wird (nur Kontaktfelder reparieren, Rest aus existing übernehmen).

---

## 8. Dokument aus Admin öffnen

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | Ein Standard: **openDocumentInApp** – gleicher Öffnungsweg, gleiche Leiste, gleiche Zurück-Navigation für Flyer, Presse, Newsletter, QR-Plakat, Vita, gespeicherte Dateien. |
| **Doku** | .cursor/rules/ein-standard-problem.mdc (Tabelle „Dokument aus Admin öffnen“). |
| **Code** | Alle Aufrufer von Dokument-Öffnen (Admin, DevView, Handbuch-Links); eine Implementierung, viele Aufrufer. |

**NIEMALS:** Eigenen Öffnungsweg pro Dokumenttyp (neues Fenster, anderer Viewer, andere Zurück-URL) erfinden.

---

## 9. Bild einfügen / Bild übernehmen

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | Ein Ablauf: **runBildUebernehmen(dataUrl, mode, preset, onApplied)** in ScreenshotExportAdmin. Gleiche Verarbeitung, gleiche Statusmeldungen („⏳ Bild wird verarbeitet…“, „✅ Bild übernommen“); kontextspezifisch nur in onApplied. |
| **Doku** | .cursor/rules/bild-einfuegen-ein-standard.mdc, ein-standard-problem.mdc. |
| **Code** | components/ScreenshotExportAdmin.tsx (runBildUebernehmen), alle Stellen mit ImageProcessingOptions / „Bild übernehmen“ (Design, VK2, Dokumente, Events). |

**NIEMALS:** Eigenen processImageForSave-Ablauf oder eigene Statusmeldungen pro Modal; zweiten „Bild übernehmen“-Pfad einführen.

---

## 10. K2/ök2 Datentrennung (keine Vermischung)

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | Auf ök2-Routen / Admin context=oeffentlich: **nur** k2-oeffentlich-* Keys und Muster-State. getPageTexts / getPageContentGalerie **immer mit Tenant** (musterOnly ? 'oeffentlich' : undefined). Shop: „Zur Galerie“ und Kontakt aus **fromOeffentlich**. Admin-Links zu Galerie/Vorschau: isOeffentlichAdminContext() → galerieOeffentlich. |
| **Doku** | .cursor/rules/k2-oek2-trennung.mdc, docs/K2-OEK2-DATENTRENNUNG.md. |
| **Code** | GaleriePage, GalerieVorschauPage (musterOnly, getPageTexts, getPageContentGalerie), ShopPage (fromOeffentlich, galerieLink, displayPhone/Email), ScreenshotExportAdmin (alle Galerie/Vorschau-Links). |

**NIEMALS:** Auf ök2 K2-Keys oder K2-Stammdaten lesen/schreiben; getPageTexts()/getPageContentGalerie() ohne Tenant aufrufen; Admin-Links fest auf galerie/galerieVorschau ohne Kontext-Check.

---

## 11. Backup & Wiederherstellung

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | **Vollbackup herunterladen:** Admin → Einstellungen → Backup & Wiederherstellung → Button erzeugt JSON-Datei (Stammdaten, Werke, Events, Dokumente, Design). **Aus Backup-Datei wiederherstellen:** gleicher Ort → Datei wählen → Bestätigung → Daten werden aus der Datei wiederhergestellt. Spiegelung auf backupmicro empfohlen. |
| **Doku** | BACKUP-SYSTEM.md, docs/BILD-WEG-WIEDERHERSTELLUNG-VOLLBACKUP.md, docs/PRAXISTEST-BEFUELLEN-SICHERHEIT.md, k2team-handbuch (Backup/Vollbackup). |
| **Code** | `src/utils/autoSave.ts` (restoreFromBackup, restoreFromBackupFile, createK2Backup/createOek2Backup/createVk2Backup, downloadBackupAsFile, restoreK2FromBackup/…), `components/ScreenshotExportAdmin.tsx` (Einstellungen → Backup & Wiederherstellung: „Vollbackup herunterladen“, „Aus Backup-Datei wiederherstellen“, „Aus letztem Backup wiederherstellen“). |

**NIEMALS:** „Vollbackup herunterladen“ oder „Aus Backup-Datei wiederherstellen“ entfernen oder so umstellen, dass sie nicht mehr als Hauptweg funktionieren; Wiederherstellung ohne Nutzer-Bestätigung (Dateiauswahl/Bestätigungsdialog); Backup-Format so ändern, dass bestehende Backup-Dateien nicht mehr lesbar sind; den Bereich Backup & Wiederherstellung aus den Einstellungen entfernen oder verstecken.

---

## Warum diese Datei

- **Eine Quelle:** Wer (Mensch oder AI) an diesen Abläufen (1–13) arbeitet, prüft **hier**, was der erlaubte primäre Weg ist.
- **Kein Abschwächen:** Neue Optionen (z. B. „In neuem Tab“) dürfen den primären Weg **nicht** als Default ersetzen. Fallback = nur, wenn der primäre Weg technisch scheitert (z. B. Popup blockiert).
- **Lehre Etikett:** Der Etikett-Druck wurde durch „Default = neuer Tab“ so geändert, dass der Druckdialog nicht mehr aufging – Nutzer: „keine Reaktion“. Das darf nicht wieder vorkommen.
- **Pflicht-Check:** Bei Code-Änderungen in einem dieser Bereiche muss in derselben Antwort ein Prüfblock stehen (Regel: kritische-ablaeufe-nicht-abschnwaechen.mdc).

---

## 12. K2 echte Galerie = fertig (eisernes Gesetz)

| Was | Quelle |
|-----|--------|
| **Regel** | **K2 (echte Galerie – Kunst & Keramik) = fertig.** Nichts an Abläufen, Speichern, Anzeige, Kategorien (Bilder, Keramik, …), Nummern (M/K/G/S/O), Werke verwalten, Galerie, Veröffentlichen, Laden **ändern** – **außer Georg ordnet es ausdrücklich an.** |
| **Doku** | .cursor/rules/k2-echte-galerie-eisernes-gesetz.mdc. |
| **Bereich** | k2-artworks, Werke-UI für K2, Galerie/Vorschau K2, Veröffentlichen/Laden für K2, Stammdaten K2. |

**NIEMALS:** K2-Kern „verbessern“, refactoren oder neue Optionen einbauen ohne **dezidierte Anordnung** von Georg. ök2/VK2/andere Projekte davon unberührt.

*Eingefügt 14.03.26 (Georg: „Die ist für mich fertig, da wird nichts mehr verändert, nur wenn ich es dezidiert anordne. Eisernes Gesetz.“)*

---

## 13. Events/Dokumente – Kontext-Trennung (K2, ök2, VK2) – 100 % symmetrisch

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | **Jeder Kontext** (K2, ök2, VK2) ist geschützt: (1) **Keine leere Liste** überschreibt, wenn 2+ Einträge vorhanden (Schutz vor Löschung von außen). (2) **Keine fremden Kontext-Daten:** K2 nimmt keine VK2-Daten; ök2 nimmt keine K2- und keine VK2-Daten; VK2 nimmt keine K2- und keine ök2-Daten. Beim Tab-Wechsel darf Auto-Save nie den noch alten State eines anderen Kontexts in den aktuellen Key schreiben. |
| **Doku** | .cursor/rules/k2-events-documents-niemals-vk2-schreiben.mdc, docs/EVENTPLANUNG-24-26-04-WIEDERHERSTELLUNG.md. |
| **Code** | **eventsStorage.ts:** saveEvents(tenantId): Leere-Liste-Schutz für alle drei; K2 filtert VK2-IDs, bricht ab wenn nur VK2 übrig; ök2 filtert K2/VK2-IDs, bricht ab wenn nur Fremddaten; VK2 filtert K2/ök2-IDs, bricht ab wenn nur Fremddaten. **documentsStorage.ts:** saveDocuments(tenantId): Leere-Liste-Schutz für alle drei; K2 bricht ab wenn Liste = k2-vk2-documents; ök2 bricht ab wenn Liste = K2 oder VK2; VK2 bricht ab wenn Liste = K2 oder ök2. **autoSave.ts:** Guards für K2 (Daten nicht wie reine VK2). **ScreenshotExportAdmin:** Events bei Kontextwechsel sofort (0 ms) laden. |

**NIEMALS:** Kontext-Erkennung oder Abbruch beim Schreiben entfernen; Schutz „leere Liste überschreibt nicht bei 2+ Einträgen“ nicht abschwächen (gilt für K2, ök2, VK2); kein Delay beim Events-Laden; Auto-Save nicht ohne Guards in K2 schreiben.

*Eingefügt 16.03.26 (Lehre: Auto-Save beim Tab-Wechsel VK2→K2 hatte VK2-State in K2-Keys geschrieben → K2-Eventplanung weg). Erweitert: Schutz vice versa für ök2 und VK2 (100 % symmetrisch).*

---

## 14. Schutzmechanismen – alle Bereiche, keine Ausnahmen

| Was | Quelle |
|-----|--------|
| **Primäre Aktion** | Dieselben Schutzmechanismen (Kontext-Trennung K2/ök2/VK2, kein Leer-Überschreiben bei 2+ Einträgen wo anwendbar, keine fremden Kontext-Daten) gelten **in allen folgenden Bereichen. Es gibt keine Ausnahmen:** Werke hinzufügen und bearbeiten, Kassa, Lager, Listen, Werkkatalog, Presse, Buchhaltung, Galerie gestalten, Einstellungen. |
| **Doku** | .cursor/rules/schutzmechanismen-alle-bereiche-keine-ausnahmen.mdc (alwaysApply). |
| **Bereiche** | Werke hinzufügen/bearbeiten, Kassa, Lager, Listen, Werkkatalog, Presse, Buchhaltung, Galerie gestalten, Einstellungen. |

**NIEMALS:** In einem dieser Bereiche Kontext vermischen, mit leer überschreiben wo 2+ Einträge existieren (ohne User-Aktion), oder fremde Kontext-Daten in einen anderen Kontext schreiben. Vor Änderungen in einem der Bereiche: Checkliste in der Regel-Datei durchgehen.

---

## 15. VK2-Überarbeitung / VK2-Refactors – K2-Kern unberührt

| Was | Quelle |
|-----|--------|
| **Regel** | **VK2-Änderungen dürfen K2-Kern nicht beeinträchtigen.** Nach der VK2-Überarbeitung traten u. a. auf: Admin wieder mit E-Mail/Passwort-Login, K2-Impressum ohne Stammdaten, Routenplaner-Link weg. Diese Abläufe müssen auch nach VK2-Refactors weiter funktionieren. |
| **K2-Kern (unberührt lassen)** | (1) **Admin:** Eine Tür, kein E-Mail/Passwort-Gate (APf = Admin ohne Hürden). (2) **K2-Impressum:** Stammdaten (Adresse, Telefon, E-Mail) und **Routenplaner (Google)**-Link immer sichtbar; Quelle = State + localStorage + K2_STAMMDATEN_DEFAULTS (GaleriePage: impressumStammdatenK2). (3) **Stammdaten-Anzeige:** Kein Leer-Überschreiben durch Server/Load; Merge mit bestehendem. |
| **Code** | AdminRoute.tsx (nur ScreenshotExportAdmin, kein AdminLoginForm). GaleriePage: impressumStammdatenK2 (useMemo), Impressum-Block nutzt diese Quelle; handleRefresh: Stammdaten nur mergen (setX(prev => …)). |

**NIEMALS:** Bei VK2-Refactors Admin-Login-Gate wieder einbauen; K2-Impressum nur aus State speisen (wenn State leer → Fallback localStorage + Repo-Defaults); Stammdaten aus Server-Response ohne Merge in State schreiben.

*Eingefügt 16.03.26 (Lehre: Mit VK2-Überarbeitung begannen hier u. a. Admin-Login wieder da, Impressum K2 ohne Stammdaten/Routenplaner).*

---

*Angelegt: März 2026 (nach Etikett-Druck-Wiederherstellung). Erweitert: Abschnitte 5–10 (Stand/QR, Kundendaten, Stammdaten, Dokument öffnen, Bild übernehmen, K2/ök2), Abschnitt 11 (Backup & Wiederherstellung), Abschnitt 12 (K2 echte Galerie eisernes Gesetz), Abschnitt 13 (Events/Dokumente Kontext-Trennung K2/ök2/VK2 – 100 % symmetrisch), Abschnitt 14 (Schutzmechanismen alle Bereiche keine Ausnahmen), Abschnitt 15 (VK2-Refactors – K2-Kern unberührt).*
