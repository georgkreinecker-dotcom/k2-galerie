# Weiterarbeiten nach Absturz – sofort orientieren

**Zweck:** Nach Code-5 oder Neustart sofort weiterarbeiten, ohne auf einen Befehl zu warten. Georgs Anweisungen sollen **lückenlos** umgesetzt werden – auch nach Crash die begonnene Umsetzung zu Ende führen. Diese Datei gibt den Stand und die nächsten Schritte.

**💬 Wo im Dialog?** Wenn du nach einem Absturz wieder **genau dort weiterarbeiten** willst, wo ihr im Gespräch aufgehört habt (z. B. Marketingkonzept, Plan): **`docs/DIALOG-STAND.md`** – dort steht immer der letzte Dialog-Stand und der nächste Schritt. Sag einfach „weiter nach Absturz“, dann liest die KI diese eine Datei und macht dort weiter.

**🔄 Reopen – Code nicht verlieren:** Bei Cursor siehst du oft nur „Reopen“ und z. B. „Restore“. **Sicherer Weg:** **Zuerst alle Dateien speichern** (Cmd+S oder „File → Save All“). Dann sind die Änderungen schon auf der Platte. Wenn du danach „Reopen“ klickst, lädt Cursor die Datei von der Platte – und die enthält dann deine gespeicherten Änderungen. So geht nichts verloren. Nicht die Option wählen, die die **aktuellen Editor-Inhalte verwirft** (je nach UI kann das „Restore“ oder anders heißen – im Zweifel: immer zuerst speichern). Damit die KI weitermachen kann: **`docs/DIALOG-STAND.md`** lesen („Nächster Schritt“).

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
  - Werke: `artworksForExport` und `resolveArtworkImageUrlsForExport` (src/utils/artworkExport, publishGalleryData) – Base64 wird nicht mitgeschickt, nur URLs.  
  - Event- und Dokument-Anhänge: komprimiert; `data` enthält `eventsCompressed` und `documentsCompressed`.  
  - **Server-Daten vor Speichern:** Beim „Vom Server laden“, „Nur Server-Stand“ und „Werke vom Server zurückholen“ wird `stripBase64FromArtworks` angewendet, damit nie Base64 in localStorage gelangt.
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

## ro5 / Code-5 – damit wir nicht wie Idioten dastehen

**Wenn Georg „ro5“ schreibt:** Reopen nach Code-5-Absturz. KI: kurz in `docs/CRASH-BEREITS-GEPRUEFT.md` eintragen („ro5 – [Datum]“), dann DIALOG-STAND + ggf. diese Datei lesen und **dort** weitermachen. ro5 ist **kein** Auftrag für ein bestimmtes Feature – Kontext kommt von Georg/dem Faden.

**Design-Vorschau Build-Fix (06.03.26):** Der JSX-Fehler in `ScreenshotExportAdmin.tsx` (Design-Tab → Vorschau) wurde behoben, indem der gesamte Vorschau-Block in eine Hilfsfunktion **`renderDesignVorschau`** ausgelagert wurde. Einfügepunkt: **nach** Zeile mit `  }` (Schließung VK2-Block), **vor** `  return (` (Haupt-JSX). Im JSX nur noch: `{designSubTab === 'vorschau' && renderDesignVorschau()}`. Nach ro5: **nicht** wieder Wrapper/IIFE im JSX versuchen – die Auslagerung in eine Funktion ist der richtige Weg. **Vollständige Analyse (was das Desaster war, warum, Prävention):** **docs/ANALYSE-ADMIN-BUILD-DESASTER-06-03.md**. Regel: .cursor/rules/jsx-grosse-bloeke-auslagern.mdc.

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

### Crash-Check (20.02.26)
- **App.tsx:** Button „Reset & neu laden“ im iframe abgesichert (nur setState, kein location.reload).
- **GalerieVorschauPage:** Beide Polling-Intervalle (Mac Mobile-Updates, Mobile-zu-Mobile) nur wenn nicht im iframe (notInIframe). Doku: `docs/CRASH-BEREITS-GEPRUEFT.md` ergänzt.

---

## Wichtige Dateien

| Thema | Datei |
|-------|--------|
| Export / Veröffentlichen | `publishGalleryData.ts` – `artworksForExport`, `resolveArtworkImageUrlsForExport`; Admin: `publishMobile`, `stripBase64FromArtworks` beim Speichern von Server-Daten |
| Werke speichern (mobil) | ebd. – `handleSaveArtwork`, `compressImage` |
| Git-Push API | `vite.config.ts` – Middleware `/api/run-git-push-gallery-data` |
| Git-Push Script | `scripts/git-push-gallery-data.sh` – Prüfung auf Bilddaten |
| Code-Update-Button | `src/pages/DevViewPage.tsx` – `handleGitPush` |
| Regeln Komprimierung | `.cursor/rules/komprimierung-fotos-videos.mdc` |
| Regeln Revert/Aufräumen | `.cursor/rules/revert-aufraumen-strikt.mdc` |

---

## Bei Code-5 (Cursor-Absturz)

- App im **normalen Browser** (Chrome/Safari) unter `http://localhost:5177` öffnen – nicht in Cursor-Preview. Siehe `docs/CODE-5-CURSOR-PREVIEW.md`.
