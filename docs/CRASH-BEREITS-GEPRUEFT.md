# Crash: Bereits geprüft & behoben (bei neuem Crash zuerst lesen)

**Strenge Regel:** Bei jedem neuen Crash **zuerst diese Datei lesen**. Nicht wieder dieselben Stellen von vorne durchsuchen – nur **neue** Ursachen suchen und diese Liste danach ergänzen.

---

## Bereits geprüfte Stellen (nicht erneut durchgehen)

| Datum   | Bereich | Was geprüft |
|--------|---------|-------------|
| 18.02.26 | main.tsx | Iframe-Check, Crash-Handler, Console-Throttling, kein createRoot in iframe |
| 18.02.26 | main.tsx | App/React nur per dynamischem Import (appBootstrap) – iframe lädt nur kleinen Einstieg |
| 18.02.26 | appBootstrap.tsx | createRoot, BrowserRouter, App nur hier – wird im iframe nie geladen |
| 18.02.26 | GaleriePage | useEffects, setInterval (Stammdaten in iframe = 0), storage-Listener mit Cleanup, Touch-Handler Cleanup, Mobile-Polling nur wenn !isEmbed |
| 18.02.26 | DevViewPage | Admin lazy (ScreenshotExportAdmin), Vercel-Check mit Timeout, keine Auto-Vercel-Prüfung |
| 18.02.26 | ScreenshotExportAdmin | Kein Auto-Sync beim Admin-Start, Syntax (replace /</g) behoben |
| 18.02.26 | index.html / write-build-info.js | Build-Info-Script: im iframe kein location.replace (Reload-Schleife → Totalabsturz) |
| 18.02.26 | App.tsx | /admin/login nur mit Navigate, keine AdminLoginPage-Route (Host-Crash nach AdminLoginPage-Einbindung) |
| 19.02.26 | location.reload / location.href | Alle nutzergetriggerten Reloads: ErrorBoundary, App.tsx (Reset/Neu laden, AdminErrorBoundary), GaleriePage (Pull-to-Refresh) – nur ausführen wenn window.self === window.top (kein Reload im iframe) |
| 19.02.26 | ScreenshotExportAdmin | Kontext-Effect [location.search]: nur setState, kein Reload/Redirect; isMounted-Check + Cleanup ergänzt (kein setState nach Unmount) |
| 19.02.26 | Crash-Check (neu) | location.reload/replace: main.tsx, appBootstrap nur bei !inIframe ✓. Vk2GaleriePage, VirtuellerRundgangPage: Listener-Cleanup ✓. DevViewPage: iframe-Check vor Intervall, Listener-Cleanup ✓. |
| 20.02.26 | App.tsx, GalerieVorschauPage | App.tsx: „Reset & neu laden“ hatte keinen iframe-Check → ergänzt (im iframe nur setState, kein reload). GalerieVorschauPage: Beide Polling-Intervalle (Mac Mobile-Updates, Mobile-zu-Mobile) nur wenn notInIframe (wie DevViewPage). |

---

## Bereits behobene Bugs (nicht nochmal „fixen“)

| Bug | Fix |
|-----|-----|
| Volle App im iframe → Host crasht | main.tsx importiert kein App/React; bei inIframe nur Hinweis-HTML; App nur via import('./appBootstrap') wenn !inIframe |
| Unterminated template (ScreenshotExportAdmin) | .replace(/\</g → .replace(/</g (alle Vorkommen) |
| rememberAdmin Typ | useState<boolean>(...) für setRememberAdmin(e.target.checked) |
| Stammdaten-Intervall in iframe | stammdatenIntervalMs = inIframe ? 0 : 2000 |
| Doppelte createRoot / StrictMode | StrictMode aus; createRoot nur einmal; kein Retry mit zweitem createRoot |
| Reload-Schleife im iframe (Build-Info-Script) | Am Anfang des Inject-Scripts: if(window.self!==window.top)return; – kein location.replace in Cursor Preview |
| Reload nach Backup-Wiederherstellung im iframe | Beide setTimeout(… reload, 800) nur ausführen wenn window.self === window.top |
| Reload in ErrorBoundary / App.tsx / GaleriePage Pull-to-Refresh | 19.02.26: Alle nur wenn window.self === window.top (kein Reload in Cursor Preview) |
| Vk2MemberAdminPage setTimeout ohne Cleanup | 19.02.26: savedTimeoutRef + clearTimeout im useEffect-Cleanup (kein setState nach Unmount) |
| Redirect/Reload im iframe (main, GaleriePage, ErrorBoundary) | main: skipBootstrapForReload nur wenn notInIframe; GaleriePage Pull-to-Refresh: location.href nur wenn window.self===window.top; ErrorBoundary: handleReload im iframe nur handleReset(), kein reload() |
| App.tsx Reload-Buttons im iframe | AppErrorBoundary + AdminErrorBoundary: „Reset & neu laden“, „Nur neu laden“, „Seite neu laden“ im iframe nur setState(hasError: false), kein location.reload() (20.02.26) |
| DevViewPage Mobile-Intervall im iframe | setInterval(checkForMobileUpdates) startet nicht, wenn window.self !== window.top (20.02.26) |
| App.tsx „Reset & neu laden“ im iframe | 20.02.26: iframe-Check ergänzt – im iframe nur setState(hasError: false), kein location.reload() |
| GalerieVorschauPage Polling im iframe | 20.02.26: Beide Intervalle (checkForMobileUpdates, syncFromGalleryData) nur wenn notInIframe |

---

## Erfolg bestätigt

| Datum   | Beobachtung |
|--------|-------------|
| 18.02.26 | Erneuter Crash (z. B. Preview), **aber Host ist diesmal nicht mit abgestürzt** → Iframe-Entlastung (App nur per appBootstrap außerhalb iframe) wirkt. |
| 18.02.26 | Crash erneut – **Host bleibt stabil, Cursor öffnet neu** → Absicherungen greifen. |

---

## Bei neuem Crash: Ablauf (strenge Regel)

1. **Diese Datei lesen** (docs/CRASH-BEREITS-GEPRUEFT.md).
2. **Nicht** die oben gelisteten Stellen erneut als „erste Vermutung“ durchsuchen.
3. **Neue** potenzielle Ursachen suchen (andere useEffects, andere Listener, neue Dateien, HMR-relevante Änderungen).
4. Nach jeder Untersuchung: **Diese Datei ergänzen** (neue Zeile unter „Bereits geprüft“ bzw. „Bereits behoben“), damit die nächste Session nicht von vorne anfängt.

---

---

## Letzter Crash (18.02.26) – neue Ursache

Totalabsturz erneut. **Neue** Ursache (nicht main/GaleriePage/Admin): Build-Info-Script in **index.html** führt `location.replace` aus – auch im iframe (Cursor Preview). Dadurch Reload-Schleife → Host crasht. **Fix:** Am Anfang des Scripts `if(window.self!==window.top)return;` (in write-build-info.js und index.html). Ab dem nächsten Build wird das Script nur noch so injiziert.

| 18.02.26 | App.tsx / AdminLoginPage | Route `/admin/login` hatte kurzzeitig `<AdminLoginPage />` mit `useEffect` + `window.location.replace` → danach Crash (auch Host). **Fix:** Route wieder nur `<Navigate to={...} replace />`, AdminLoginPage wird **nicht** aus den Routen geladen (Crash-Risiko vermeiden). |
| 18.02.26 | vite.config.ts | `react({ fastRefresh: false })` → TS2353 „fastRefresh does not exist in type 'Options'“. **Fix:** Option entfernt (in dieser Vite-Version nicht typisiert), Build läuft wieder. |
| 19.02.26 | main.tsx, GaleriePage, ErrorBoundary | Reload/Redirect nur außerhalb iframe: main.tsx `location.replace` nur wenn `window.self === window.top`; GaleriePage Pull-to-Refresh nur wenn `window.self === window.top`; ErrorBoundary `handleReload` im iframe nur State-Reset, kein `location.reload()`. |
| 20.02.26 | App.tsx, DevViewPage | App.tsx: AppErrorBoundary + AdminErrorBoundary – Reload-Buttons im iframe abgesichert (nur `setState({ hasError: false })`, kein `location.reload()`). DevViewPage: Mobile-Update-Intervall im iframe deaktiviert (`window.self !== window.top` → return). |

---

## Neue Beobachtung (18.02.26): Localhost stürzt erst ab, wenn Cursor wieder öffnet

**Ablauf:** Absturz passiert, aber **localhost (Browser/App) läuft noch**. Erst wenn Georg **Cursor wieder öffnet**, stürzt localhost ab.

**Vermutung:** Beim erneuten Öffnen von Cursor passiert etwas (Projekt wird geladen, Dateiwächter, HMR-Reconnect vom Browser?), das die Verbindung Browser ↔ Dev-Server oder den Tab zum Kippen bringt.

**Workaround (empfohlen):**
- **Vor dem Schließen von Cursor:** Browser-Tab mit localhost **schließen** (dann gibt es beim Wiederöffnen von Cursor keinen Reconnect von einem alten Tab).
- **Nach dem Öffnen von Cursor:** Dev-Server neu starten (`npm run dev`), **dann** im Browser localhost öffnen.
- Kurz: Cursor öffnen → Terminal: `npm run dev` → Browser: localhost. Nicht: Browser-Tab offen lassen, Cursor schließen, Cursor wieder öffnen (dann crasht localhost oft).

---

## Spurensuche: Dem Missetäter auf die Spur kommen

**Wenn du sehen willst, was beim „Cursor wieder öffnen“ passiert:**

1. **Im Browser (Chrome/Safari):** localhost öffnen, **DevTools** öffnen (F12 oder Rechtsklick → Untersuchen).
2. **Console-Tab:** Haken setzen bei **„Log beibehalten“** / **„Preserve log“** (damit beim Absturz die letzten Meldungen sichtbar bleiben).
3. **Cursor schließen** (oder so lassen), dann **Cursor wieder öffnen** und abwarten, bis localhost abstürzt.
4. **In der Console schauen:** Was steht **als Letztes** vor dem Absturz? (z. B. HMR-Update, Fehlermeldung, „WebSocket …“)
5. **Optional:** Im Terminal, in dem `npm run dev` läuft, beim Wiederöffnen von Cursor auf Meldungen achten (z. B. viele Datei-Änderungen, Fehler).

**Was wir schon wissen:** Es gibt einen `visibilitychange`-Listener (autoSave, speichert nur wenn Tab versteckt wird) und `focus`-Listener (z. B. VirtuellerRundgang). Beim Reconnect könnte Vite HMR viele Updates schicken. Wenn du eine konkrete letzte Meldung siehst, notieren – dann können wir gezielt nachbessern.

**Hilfe im Code:** In der App wird in der Entwicklung bei jedem HMR-Update einmal `[HMR] beforeUpdate` in die Console geschrieben. Wenn direkt vor dem Absturz diese Meldung kommt, war sehr wahrscheinlich **HMR** der Auslöser.

**Test (18.02.26):** React Fast Refresh in Vite deaktiviert (`fastRefresh: false` in vite.config.ts), um bei Cursor-Wiederöffnen weniger Last zu haben. Wenn es danach seltener crasht, war React Refresh mit im Spiel.

---

## Beobachtung (18.02.26): Crash direkt nach „Fertig“-Meldung – Vercel + Host

**Ablauf:** Nach der Fertigstellung der Konfigurations-/Antwort-Meldung (AI „war fertig“) sind **Vercel und Host** abgestürzt. Es ist **nur ein kleiner Moment**, in dem das passiert.

**Ursache (gezielt):** Am Ende jeder AI-Antwort wird `node scripts/write-build-info.js` ausgeführt. Das schreibt **immer** `src/buildInfo.generated.ts` und `public/build-info.json`. Sobald diese Dateien sich ändern, erkennt der laufende Vite-Dev-Server die Änderung → **HMR-Stoß** (viele Module invalidiert, App baut neu) → in dem kurzen Moment können Cursor/Preview/Host kippen.

**Fix (18.02.26):** In `scripts/write-build-info.js` wird **nur noch geschrieben, wenn sich der Inhalt geändert hat**. Vorher: bestehende Datei lesen, mit neuem Inhalt vergleichen. Gleich → **kein Schreiben** → keine Datei-Änderung → **kein HMR** → Crash-Moment entfällt. Beim echten Build (neue Minute) wird wie bisher geschrieben.

**Empfehlung:** Workaround wie oben (Browser-Tab mit localhost schließen vor Cursor-Schließen; nach Cursor-Öffnen zuerst `npm run dev`, dann Browser). Bei Vercel: nach Crash Deployment-Status prüfen und bei Bedarf erneut pushen.

---

## Crash-Check (18.02.26, Session-Ende)

**Geprüft:** main.tsx (location.replace nur bei !inIframe ✓), Vk2GaleriePage (useEffect mit Cleanup ✓), ScreenshotExportAdmin (VK2 Design-Block: nur State/inputs, kein neuer useEffect/Reload ✓).  
**Behoben:** Zwei Reloads nach Backup-Wiederherstellung – nur noch ausführen wenn `window.self === window.top` (kein Reload in Cursor Preview).

---

## Crash-Check 19.02.26

**Geprüft:** location.reload / location.replace / location.href im gesamten Repo. main.tsx: Replace nur bei !inIframe ✓. ScreenshotExportAdmin Backup-Reloads bereits mit window.self === window.top ✓.  
**Behoben:** Nutzer-Reloads in ErrorBoundary (handleReload), App.tsx (Reset & neu laden, Nur neu laden, AdminErrorBoundary „Seite neu laden“), GaleriePage (Pull-to-Refresh) – alle nur noch wenn window.self === window.top.

| 21.02.26 | GaleriePage Mobile-Polling | useEffect Zeile ~1090: isMobile && !isVercel → `notInIframe` (window.self===window.top) ergänzt. Sonst startet Polling auch in Cursor Preview. |
| 21.02.26 | ScreenshotExportAdmin Backup-Reload | Zeilen ~9521 + ~9609: Beide `setTimeout(reload)` nach Backup-Wiederherstellung mit `window.self===window.top` abgesichert (waren nicht gechekt). |

| 25.02.26 | SmartPanel | location.href in startFremderModus, nav(), Item-Button – iframe-Check ergänzt (kein location.href wenn window.self !== window.top) |
| 26.02.26 | main.tsx, appBootstrap.tsx | Fehler-HTML „Seite neu laden“-Buttons: beide hatten onclick="window.location.reload()" ohne iframe-Check. Im Preview-Klick → Reload im iframe → Loop/Crash. **Fix:** onclick nur ausführen wenn window.self===window.top (alle 3 Buttons). |
| 26.02.26 | index.html | (1) root-div onclick (Laden … tippen): location.reload() ohne iframe-Check. (2) Timeout-Fehler-HTML „Galerie lädt nicht“ – Button onclick="location.reload()" ohne iframe-Check. **Fix:** Beide nur wenn window.self===window.top. |
| 26.02.26 | App.tsx, Vk2GaleriePage, Vk2GalerieVorschauPage | **Neue Prüfung:** doHardReload() (Stand-Badge-Klick) ohne iframe-Check → Reload im Preview möglich. VK2 Stand-Badges (Vk2GaleriePage, Vk2GalerieVorschauPage) onClick mit location.href ohne iframe-Check. **Fix:** doHardReload am Anfang `if (window.self !== window.top) return`; beide VK2-Stand-Badges nur wenn `window.self === window.top` dann location.href. |

| 27.02.26 | GalerieVorschauPage | Mobile-Polling: setTimeout(5000) wurde im Cleanup nicht gecleart → nach Unmount konnte setState laufen. **Fix:** initialSyncTimeoutId + clearTimeout im Cleanup. |
| 27.02.26 | ScreenshotExportAdmin | location.href ohne iframe-Check: VK2 Vorstand→Admin (8873), Abmelden→/vk2-login (8890), „Zurück zur Übersicht“ Entdecken (9099), Kassa-Links Hub (9572, 9665). **Fix:** Alle nur wenn window.self === window.top. |

*Zuletzt ergänzt: 27.02.26 (Crash-Check: GalerieVorschauPage 5s-Cleanup, ScreenshotExportAdmin location.href iframe-gesichert)*
