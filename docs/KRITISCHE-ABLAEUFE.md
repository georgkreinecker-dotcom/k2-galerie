# Kritische Abläufe – eine Quelle, kein Abschwächen

**Zweck:** Diese Abläufe haben wir mühsam zum Laufen gebracht. Sie dürfen nicht durch „Verbesserungen“ oder neue Optionen so geändert werden, dass der **primäre Weg** ausfällt oder zum Fallback wird. Eine Quelle pro Ablauf – Referenz für Code und für die AI.

**Übersicht (alle mit Absicherung/Pflicht-Check bei Änderung):**  
1. Etikett drucken · 2. Veröffentlichen · 3. Laden vom Server · 4. Werke mit Bild speichern · 5. Stand & QR · 6. Kundendaten/geschützte Keys · 7. Stammdaten nicht leer überschreiben · 8. Dokument aus Admin öffnen · 9. Bild einfügen/übernehmen · 10. K2/ök2 Datentrennung · **11. Backup & Wiederherstellung**

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

- **Eine Quelle:** Wer (Mensch oder AI) an diesen Abläufen (1–10) arbeitet, prüft **hier**, was der erlaubte primäre Weg ist.
- **Kein Abschwächen:** Neue Optionen (z. B. „In neuem Tab“) dürfen den primären Weg **nicht** als Default ersetzen. Fallback = nur, wenn der primäre Weg technisch scheitert (z. B. Popup blockiert).
- **Lehre Etikett:** Der Etikett-Druck wurde durch „Default = neuer Tab“ so geändert, dass der Druckdialog nicht mehr aufging – Nutzer: „keine Reaktion“. Das darf nicht wieder vorkommen.
- **Pflicht-Check:** Bei Code-Änderungen in einem dieser Bereiche muss in derselben Antwort ein Prüfblock stehen (Regel: kritische-ablaeufe-nicht-abschnwaechen.mdc).

*Angelegt: März 2026 (nach Etikett-Druck-Wiederherstellung). Erweitert: Abschnitte 5–10 (Stand/QR, Kundendaten, Stammdaten, Dokument öffnen, Bild übernehmen, K2/ök2), Abschnitt 11 (Backup & Wiederherstellung).*
