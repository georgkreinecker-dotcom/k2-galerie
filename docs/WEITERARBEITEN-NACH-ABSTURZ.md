# Weiterarbeiten nach Absturz – sofort orientieren

**Zweck:** Nach Code-5 oder Neustart sofort weiterarbeiten, ohne auf einen Befehl zu warten. Georgs Anweisungen sollen **lückenlos** umgesetzt werden – auch nach Crash die begonnene Umsetzung zu Ende führen. Diese Datei gibt den Stand und die nächsten Schritte.

---

## 🔒 WICHTIG: Crash während Programmieren ≠ App-Fehler (nicht im Kreis drehen)

**Abstürze während des Programmierens** (wenn der AI-Assistent oder du Dateien speicherst und Cursor/Vite neu lädt) kommen von **Cursor / HMR (Hot Module Reload)**, **nicht** von der K2-Galerie-App.

- **Im normalen Browser-Betrieb** (Handy, Vercel, localhost im Chrome/Safari) **crasht die App nicht**.
- **Keine** „Crash-Fixes“ in der App für dieses Verhalten – das führt nur im Kreis (siehe Regel `.cursor/rules/regel-nach-3-versuchen-vertiefen.mdc`).
- **Praktisch:** App zum Testen im **normalen Browser** (z. B. http://localhost:5177) öffnen, nicht in der Cursor-Preview. Siehe `docs/CODE-5-CURSOR-PREVIEW.md`.

Diese Klarstellung gilt dauerhaft, damit in zukünftigen Sessions nicht wieder App-Code für Cursor/HMR-Abstürze geändert wird.

---

## Aktueller Stand (Datenfluss / Komprimierung)

### Erledigt
- **Regel:** `.cursor/rules/komprimierung-fotos-videos.mdc` – maximale Komprimierung bei Fotos/Filmen überall.
- **Werke speichern (mobil):** Aggressivere Komprimierung (560 px, 0.5, max ~600 KB), damit Speicherung schnell ist.
- **Export (Veröffentlichen):**  
  - `compressArtworksForExport` – große Werke-Bilder vor Export komprimieren.  
  - `compressGalleryImageForExport` – Willkommensbild, Galerie-Karte, Virtueller Rundgang.  
  - `compressEventsAndDocumentsForExport` – Event- und Dokument-Anhänge (Bilder) im Export komprimieren.  
  - In `publishMobile` werden alle drei genutzt; `data` enthält bereits `eventsCompressed` und `documentsCompressed`.
- **Git-Button:** API `/api/run-git-push-gallery-data` (Vite), Button ruft sie auf; Fallback Zwischenablage. Script prüft vor Push auf Bilddaten.
- **Regel Revert:** `.cursor/rules/revert-aufraumen-strikt.mdc` – bei Rücknahme alles aufräumen, kein Müll liegen lassen.
- **Event-Dokumente:** Beim Hinzufügen eines Bilds zu einem Event (Upload) wird vor dem Speichern komprimiert (`handleAddEventDocument` – `compressDataUrl` wenn Bild und >250 KB).
- **ChatDialog:** Bei Bild-Drop wird vor dem Senden an die API komprimiert (`compressImageDataUrl` in ChatDialog.tsx, max 800 px, 0.6).

### Prüfen nach Absturz
1. **Anweisung zu Ende?** War gerade eine Anweisung von Georg in Arbeit? → Fehlende Teile unter „Nächste Schritte“ ergänzen und **sofort** abarbeiten (Regel: anweisung-lueckenlos-umsetzen.mdc).
2. **Build:** Im Projektordner `npm run build` – läuft er durch?
3. **Export:** In `ScreenshotExportAdmin.tsx` in `publishMobile` steht `eventsCompressed`/`documentsCompressed` in `data`. Wenn dort noch die alten Variablen stehen, Export anpassen.
4. **Stand:** `node scripts/write-build-info.js` ausführen.

---

## Nächste Schritte (ohne Befehl abarbeiten)

1. Build prüfen: `npm run build`. Bei Fehlern: TypeScript/Fehlerstelle beheben.
2. Stand aktualisieren: `node scripts/write-build-info.js`.
3. Nach Änderungen: Kurz unter „Erledigt“ ergänzen und „Nächste Schritte“ anpassen.

### Erledigt diese Session (18.02.26)
- **GalerieVorschauPage:** Filter-Typ um VK2-Kategorien (fotografie, textil) erweitert → Build läuft.
- **KundenPage / KundenTab:** Unter VK2-Route (`/projects/vk2/kunden`) Anzeige „Mitgliederdaten“, „Vereinsmitglieder“, Back-Link zu Admin mit `?context=vk2`; alle Labels im Tab (Neuer Kunde → Neues Mitglied etc.) kontextabhängig.

### Putzkolonne (19.02.26)
- **GalerieVorschauPage:** TEMPORÄR-Kommentar + iPad-Debug-console.log im Speichern-Handler entfernt (ohne Logik zu ändern).
- **vite.config.ts:** Kommentar zu react()/fastRefresh gekürzt.

### Externe URLs zentral (19.02.26)
- **externalUrls.ts:** Alle betrieblichen Basis-URLs (APP_BASE_URL, BUILD_INFO_URL, GALLERY_DATA_BASE_URL) aus einer Datei; Env `VITE_APP_BASE_URL` für Self-Host.
- **navigation.ts, GaleriePage, MobileConnectPage, GalerieVorschauPage, DevViewPage:** Hardcoded `k2-galerie.vercel.app` durch Import aus `externalUrls` ersetzt.
- **Doku:** `docs/EXTERNE-VERBINDUNGEN.md`, Regel `.cursor/rules/externe-verbindungen-nur-zentral.mdc`.

---

## Wichtige Dateien

| Thema | Datei |
|-------|--------|
| Export / Veröffentlichen | `components/ScreenshotExportAdmin.tsx` – `publishMobile`, `compressArtworksForExport`, `compressEventsAndDocumentsForExport` |
| Werke speichern (mobil) | ebd. – `handleSaveArtwork`, `compressImage` |
| Git-Push API | `vite.config.ts` – Middleware `/api/run-git-push-gallery-data` |
| Git-Push Script | `scripts/git-push-gallery-data.sh` – Prüfung auf Bilddaten |
| Code-Update-Button | `src/pages/DevViewPage.tsx` – `handleGitPush` |
| Regeln Komprimierung | `.cursor/rules/komprimierung-fotos-videos.mdc` |
| Regeln Revert/Aufräumen | `.cursor/rules/revert-aufraumen-strikt.mdc` |

---

## Bei Code-5 (Cursor-Absturz)

- App im **normalen Browser** (Chrome/Safari) unter `http://localhost:5177` öffnen – nicht in Cursor-Preview. Siehe `docs/CODE-5-CURSOR-PREVIEW.md`.
