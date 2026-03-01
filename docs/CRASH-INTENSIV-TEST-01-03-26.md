# Crash – Intensiver Test (01.03.26)

**Anlass:** Georg macht Pause wegen wiederholter Reopens/Crashes. „Es kann so nicht mehr weitergehen.“ Dieser Test wurde in seiner Abwesenheit durchgeführt.

---

## Durchgeführte Prüfungen

### 1. location.reload / location.replace / location.href

| Datei | Status |
|-------|--------|
| **main.tsx** | App-Start ohne iframe-Sonderpfad; Fehler-Buttons nutzen `safeReload` (env.ts hat iframe-Check). ✓ |
| **env.ts** | `safeReload()`: `window.self !== window.top` → return, kein replace. ✓ |
| **SmartPanel** | `startFremderModus()`: iframe-Check vor `location.href`. nav() und Item-Button: iframe-Check. ✓ |
| **GaleriePage** | Pull-to-Refresh, Admin-Links, QR: alle mit `window.self === window.top`. Intervalle (QR, Stammdaten, Mobile) nur bei `window.self === window.top`. ✓ |
| **DevViewPage** | Mobile-Intervall: zu Beginn des useEffects `if (window.self !== window.top) return`. ✓ |
| **GalerieVorschauPage** | Beide Polling-Intervalle nur bei notInIframe. ✓ |
| **useServerBuildTimestamp** | Kein setInterval im iframe, nur einmaliger Fetch. ✓ |
| **ScreenshotExportAdmin** | location.href in VK2/Vorstand/Abmelden/Zurück/Kassa: entweder in Popup-Kontext (eigenes top) oder mit `window.self === window.top`. ✓ |
| **index.html** | root-onclick und Fehler-Button: safeReload (iframe-Check). ✓ |
| **write-build-info.js** | Inject-Script: `window.self!==window.top` return; `localhost` → return (kein bust). ✓ |

**Fazit:** Kein Reload/Redirect ohne iframe-Check oder außerhalb Preview-Kontext.

---

### 2. setInterval / setTimeout

| Bereich | Cleanup / iframe |
|---------|-------------------|
| **GaleriePage** | setInterval (QR 15s, Stammdaten 2s, Mobile-Polling): nur wenn `window.self === window.top`; Cleanup mit clearInterval. ✓ |
| **DevViewPage** | setInterval(10s) nur wenn nicht im iframe; Cleanup. ✓ |
| **GalerieVorschauPage** | Beide Intervalle nur notInIframe; clearInterval im Cleanup. ✓ |
| **useServerBuildTimestamp** | Im iframe kein Intervall; nur einmal fetch. ✓ |
| **ScreenshotExportAdmin** | Viele setTimeouts; in useEffects mit return () => clearTimeout(...) oder isMounted + clearTimeout. ✓ |
| **autoSave.ts** | setInterval global; wird von Admin genutzt, kein iframe-Check (Admin läuft außerhalb Preview oder in neuem Tab). Kein zusätzlicher Risikopunkt für Preview. ✓ |
| **ShopPage / PlatzanordnungPage** | setInterval für Kamera/Scanner; nur wenn Nutzer auf der Seite. Kein iframe-Check nachgetragen nötig für Standard-Workflow. ✓ |

**Fazit:** Intervalle in kritischen Seiten (Galerie, DevView, Vorschau) im iframe deaktiviert; Timeouts in ScreenshotExportAdmin mit Cleanup.

---

### 3. addEventListener / removeEventListener

Geprüft: GaleriePage, DevViewPage, main.tsx, ScreenshotExportAdmin, Vk2GaleriePage, VirtuellerRundgangPage, GlobaleGuideBegleitung – useEffects mit Listener haben return () => removeEventListener. ✓

---

### 4. App-Start / createRoot

- createRoot nur einmal, kein Retry mit zweitem createRoot.
- StrictMode aus (doppeltes Mounten vermieden).
- Kein bedingter App-Start mehr im iframe in main (App wird immer geladen; Entlastung war früher über appBootstrap/iframe – aktuell läuft volle App, wenn man sie öffnet).

---

### 5. Write-Build-Info / HMR

- write-build-info.js schreibt nur, wenn sich Build-Minute/Label geändert hat → weniger HMR bei jedem Save.
- Missetäter-Regel: write-build-info wird **nicht** am Ende jeder AI-Antwort ausgeführt (nur bei Commit/Build oder auf Aufforderung).

---

### 6. Ergänzung aus diesem Test

- **main.tsx:** In iframe (Cursor Preview) ist `MAX_LOGS` jetzt **15** statt 100. Weniger Console-Output in der Preview reduziert Speicher- und Verarbeitungslast und kann Crashes mindern.

---

## Bekannte Grenzen

1. **Cursor Preview / IDE:** Die Instabilität (Code 5) liegt teils in der Cursor/Electron-Preview-Umgebung (Speicher, HMR, iframe). App-seitige Absicherungen können das abmildern, aber nicht immer vollständig verhindern.
2. **Workaround (verbindlich):** Preview in Cursor **schließen**, App **nur im Browser** (localhost:5177) nutzen. So arbeitet Georg ohne Preview-Crashes.
3. **Nach Reopen:** Browser-Tab mit localhost vor dem Schließen von Cursor schließen; nach erneutem Öffnen von Cursor zuerst `npm run dev`, dann Browser. Vermeidet Reconnect-Chaos.

---

## Empfehlung für die nächste Session

- **CRASH-BEREITS-GEPRUEFT.md** um diesen Test ergänzen (Datum 01.03.26, „Intensiv-Test“, MAX_LOGS iframe).
- **CRASH-LETZTER-KONTEXT.md** aktualisieren: Thema „Intensiv-Crash-Test“, keine neuen Code-Fixes außer MAX_LOGS in main.
- Georg: Weiterhin **Preview zu, App im Browser** – bis Cursor/IDE seitig etwas geändert wird, ist das der stabilste Weg.

---

*Erstellt: 01.03.26 (während Georg Pause macht).*
