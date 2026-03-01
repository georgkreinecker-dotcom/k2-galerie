# Crash – Intensiver Test (01.03.26)

**Anlass:** Georg macht Pause wegen wiederholter Reopens; „es kann so nicht mehr weitergehen“. Systematische Prüfung aller bekannten Crash-Ursachen.

---

## Durchgeführte Prüfung

### 1. location.reload / location.replace / location.href

| Datei | Status |
|-------|--------|
| main.tsx | safeReload nur bei window.self === window.top ✓ |
| env.ts | safeReload: iframe-Check vor replace ✓ |
| SmartPanel | startFremderModus: if (window.self !== window.top) return vor href ✓ |
| GaleriePage | Pull-to-Refresh, Admin-Links: nur bei window.self === window.top ✓ |
| ScreenshotExportAdmin | VK2 Vorstand/Abmelden/Zurück: iframe-Check ✓; location.href in Popup-Kontext (eigenes Fenster) ✓ |
| index.html / write-build-info.js | Inject-Script: if (window.self!==window.top)return; + localhost-Check ✓ |

### 2. setInterval / setTimeout

| Datei | Cleanup / iframe |
|-------|------------------|
| GaleriePage | QR-Bust, Stammdaten, Mobile-Polling: nur wenn window.self === window.top ✓ |
| DevViewPage | Mobile-Update-Intervall: if (window.self !== window.top) return ✓ |
| GalerieVorschauPage | Beide Polling-Intervalle: notInIframe ✓; clearInterval im Cleanup ✓ |
| useServerBuildTimestamp | Kein setInterval im iframe, nur einmaliger Fetch ✓ |
| ScreenshotExportAdmin | Viele setTimeouts mit clearTimeout im useEffect-Cleanup ✓ |
| autoSave | setInterval (Stammdaten) – wird nur von Admin genutzt; kein iframe-Check (Admin läuft außerhalb Preview) |

### 3. Event-Listener

| Datei | removeEventListener im Cleanup |
|-------|-------------------------------|
| GaleriePage | storage, stammdaten-updated, etc. mit Cleanup ✓ |
| DevViewPage | Listener mit Cleanup ✓ |
| ScreenshotExportAdmin | keydown, mousedown, etc. mit Cleanup ✓ |
| main.tsx | error, unhandledrejection, dragover, drop – global, kein Cleanup nötig |

### 4. write-build-info.js (Missetäter)

- Schreibt nur, wenn sich Build-Minute/Label geändert hat → kein HMR-Stoß bei jeder AI-Antwort ✓
- Pflichtregel: **write-build-info nicht am Ende jeder AI-Antwort** – nur bei Commit-Push oder auf Aufforderung ✓

### 5. Ergänzung aus diesem Test

- **main.tsx:** In Cursor Preview (iframe) MAX_LOGS von 100 auf **15** reduziert → weniger Console-Output, weniger Speicherlast. (01.03.26)

---

## Bekannte Grenze

**Cursor Preview (iframe) ist instabil.** Auch mit allen Absicherungen kann Code 5 auftreten – Ursache liegt in der IDE/Electron-Umgebung, nicht nur im App-Code.

**Verbindliche Empfehlung (siehe CRASH-BEREITS-GEPRUEFT.md):**

1. **Preview in Cursor schließen** (Tab/Panel zu).
2. **App nur im Browser:** `npm run dev` → Chrome/Safari → http://localhost:5177
3. In Cursor nur Editor + Terminal + Chat.

---

## Bei neuem Crash

1. **CRASH-LETZTER-KONTEXT.md** lesen (wo zuletzt gearbeitet).
2. **CRASH-BEREITS-GEPRUEFT.md** lesen (nicht dieselben Stellen wieder prüfen).
3. Nur **neue** Stellen prüfen (letzte Änderungen, neue useEffects, neue Intervalle).
4. Beide Dokus ergänzen.

---

*Erstellt: 01.03.26*
