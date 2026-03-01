# Code 5 – Was genau geändert wurde (und was den Crash auslösen kann)

**Stand:** 01.03.26  
**Zweck:** Klar festhalten, welche Änderungen im Repo stehen und was den „window terminated (code: 5)“-Crash in Cursor plausibel auslöst.

---

## 1. Relevante Änderungen (git diff, uncommitted)

### main.tsx
- **Hinzugefügt:** `const inIframe = typeof window !== 'undefined' && window.self !== window.top` (oben, damit Zeile 143 sie nutzen kann).
- **Geändert:** `MAX_LOGS = inIframe ? 15 : 100` (in Cursor-Preview weniger Logs).
- **Bereits vorher umgebaut:** Im iframe wird die App nicht mehr geladen (nur Hinweis-HTML); außerhalb wird `import('./appBootstrap')` genutzt. Das war eine frühere Crash-Maßnahme, nicht die letzte kleine Änderung.

**Einschätzung:** Die inIframe-Änderung ist minimal und logisch. Sie läuft nur in der **App** (Browser/Vite). Cursor selbst führt deinen App-Code nicht aus – Code 5 ist ein **Cursor/Electron-Fenster-Absturz**. main.tsx kann Cursor also nur indirekt treffen (z. B. wenn Cursor beim **Speichern** die Datei parst/TypeScript prüft), nicht durch „Ausführen“ der App in Cursor.

### components/ScreenshotExportAdmin.tsx (~17.632 Zeilen)
- Neuer Import: `ImageCropModal`
- Neuer State: `cropImageSrc`, `photoImageMode` (ersetzt `photoUseFreistellen`)
- Neues useEffect: K2_LAST_ARTWORK_CATEGORY beim Öffnen „Neues Werk“
- Beim Speichern: `imageDisplayMode` am Werk setzen; `photoImageMode` beim Bearbeiten laden
- Neuer Button „Bild zuschneiden“ inkl. async Handler (blob/URL → Data-URL, dann `setCropImageSrc`)
- Anzeige von `<ImageCropModal>` wenn `cropImageSrc` gesetzt
- Diverse Anpassungen Keramik/Freistellung/Vollkachel

**Einschätzung:** Die Datei ist **sehr groß**. Jedes **Speichern** löst in Cursor u. a. aus:
- erneutes Parsen der ganzen Datei,
- TypeScript-Check,
- ggf. Linter,
- bei `npm run dev`: HMR/Recompile.

Das ist die **einzige Änderung, die „Last“ in Cursor direkt erhöht**: mehr Code in einer bereits riesigen Datei → mehr Arbeit bei jedem Save. Code 5 tritt oft genau in solchen Situationen auf (Speichern / Recompile / großer Kontext).

### Weitere geänderte Dateien (kurz)
- **GalerieVorschauPage.tsx:** Nur ein Kommentar zur Vollkachel – praktisch keine Last.
- **Neue Dateien:** `cropImageToDataUrl.ts`, `ImageCropModal.tsx` – klein, unkritisch für Cursor-Last.

---

## 2. Was den Crash plausibel auslöst

- **Nicht** die laufende App (die läuft bei dir im Browser).
- **Nicht** die inIframe-Logik in main.tsx (minimal, App-seitig).
- **Plausibel:** **Speichern von ScreenshotExportAdmin.tsx** (oder Öffnen/Wechseln in diese Datei). Große Datei + erneute Analyse/TS-Check/HMR beim Speichern = hohe Last für Cursor/Electron → Fenster kann mit „code: 5“ beenden.

---

## 3. Was du sofort prüfen kannst

1. **Crash reproduzieren:** Cursor öffnen, **nur** `ScreenshotExportAdmin.tsx` öffnen, eine kleine Änderung (z. B. Leerzeichen), Speichern. Tritt Code 5 danach auf?
2. **Ohne diese Datei arbeiten:** Ein paar Minuten nur in anderen, kleineren Dateien arbeiten und speichern. Tritt Code 5 seltener auf?
3. **Temporär zurückbauen:** Den **„Bild zuschneiden“-Block** (Button + cropImageSrc-Logik + ImageCropModal-Render) in ScreenshotExportAdmin wieder entfernen, speichern. Wenn Cursor danach stabiler läuft, bestätigt das die Vermutung „große Datei + Änderung = Trigger“.

---

## 4. Nächste Schritte (je nach Ergebnis)

- **Wenn Crash an ScreenshotExportAdmin hängt:** Zuschnitt-Feature in eine **eigene Komponente** auslagern (z. B. `WerkBildBereich.tsx`), die in ScreenshotExportAdmin nur eingebunden wird. So wird die Riesen-Datei nicht noch größer und wird beim Bearbeiten des Zuschnitts weniger oft voll geparst.
- **Wenn Crash auch ohne diese Datei auftritt:** Dann liegt die Ursache woanders (Cursor/Electron, Speicher, anderes großes File). Dann: Regelwerk-Last prüfen (siehe REGELWERK-LAST-UND-UMSTRUKTURIERUNG.md) oder Editor-Wechsel (VS Code) testen.

---

**Kurz:** Die in dieser Session sichtbaren Änderungen mit dem größten Einfluss auf Cursor sind **mehr Code in ScreenshotExportAdmin.tsx**. Der konkrete Trigger für Code 5 ist sehr wahrscheinlich **Speichern (oder Fokus) dieser großen Datei**, nicht der Inhalt von main.tsx oder der laufenden App.
