# Crash: Bereits geprüft & behoben (bei neuem Crash zuerst lesen)

**Strenge Regel:** Bei jedem neuen Crash **zuerst diese Datei lesen**. Nicht wieder dieselben Stellen von vorne durchsuchen – nur **neue** Ursachen suchen und diese Liste danach ergänzen.

---

## Wenn Georg „check the crash“ sagt – sofort-Routine

1. **docs/CRASH-LETZTER-KONTEXT.md** lesen → was war zuletzt gemacht, welche Dateien, Hinweis von Georg?
2. **Diese Datei** (CRASH-BEREITS-GEPRUEFT.md) lesen → bereits geprüfte/behobene Stellen nicht wieder durchgehen.
3. **Gezielt suchen:** In den zuletzt genutzten Bereichen + im Repo nach **neuen** setInterval, setTimeout ohne Cleanup, location.reload/replace, useEffects ohne Cleanup.
4. **Eintragen:** Prüfung/Fund in diese Datei; CRASH-LETZTER-KONTEXT.md aktualisieren („Letzte Session“ + ggf. „Hinweis von Georg“).

So können wir den Punkt Schritt für Schritt eingrenzen.

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
| Inject-Script Reload auf localhost | 28.02.26: write-build-info.js – Inject-Script bricht bei location.origin enthält "localhost" sofort ab, kein bust() → kein automatischer Reload in Cursor/Entwicklung |
| useServerBuildTimestamp Intervall im iframe | 28.02.26: Kein 2-Min-Intervall wenn window.self !== window.top; nur einmaliger Fetch beim Mount in Preview |
| DevViewPage Mobile-Update-Intervall im iframe | 28.02.26: Am Anfang des useEffects if (window.self !== window.top) return – kein 10-Sek-Intervall in Cursor Preview |
| GaleriePage QR-Bust-Intervall in iframe | 28.02.26: setInterval(15s) nur wenn window.self === window.top (kein 15s-Re-Render in Preview) |
| GaleriePage Admin-Weiterleitung im iframe | 28.02.26: location.href zu /admin nur bei window.self === window.top; sonst window.open(..., '_blank') |
| GaleriePage Stammdaten-Intervall im iframe | 28.02.26: setInterval(checkStammdatenUpdate, 2000) nur wenn window.self === window.top; in Preview nur einmal loadData() |
| GalerieAssistent setTimeout nach Unmount | 27.02.26: markiereErledigt nutzte setTimeout(400) ohne Cleanup → setState/onGoToStep nach Unmount möglich. **Fix:** stepTimeoutRef, clearTimeout im useEffect-Cleanup, in markiereErledigt Ref setzen und vor neuem Timeout clearen. |
| main.tsx Console in iframe (01.03.26) | MAX_LOGS in Cursor Preview (iframe) auf 15 reduziert – weniger Speicher/Churn (crash-beim-programmieren-vermeiden.mdc). |
| SeitengestaltungPage setSaved-Timeout (01.03.26) | setTimeout(1800) für setSaved(false) ohne Cleanup → bei Unmount (HMR, Navigation) setState nach Ablauf. **Fix:** savedTimeoutRef, clearTimeout im useEffect-Cleanup, in handleSave vor neuem Timeout altes clearen. |

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

**Pflichtregel (verbindlich):** Georg hat festgelegt: **write-build-info wird am Ende jeder AI-Antwort nicht ausgeführt.** Das ist die verbindliche Missetäter-Regel. Stand kommt **nur** beim Commit-Push (dann läuft write-build-info im Build) oder wenn Georg explizit „Stand aktualisieren“ sagt. In .cursorrules und auto-commit-push-nach-aufgabe.mdc ist das so umgesetzt. **Nicht umsetzen = Problem bleibt.**

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
| 28.02.26 | write-build-info.js (Inject-Script) | In Cursor Preview kann Fenster top sein → Script lief komplett → nach 2 Min oder bei neuem Build bust() → location.replace → Reload → Crash. **Fix:** Am Anfang des Inject-Scripts: `var o=location.origin; if(o.indexOf("localhost")!==-1)return;` – bei localhost kein bust(), kein automatischer Reload in der Entwicklung. |
| 28.02.26 | useServerBuildTimestamp | 2-Min-Intervall (fetch build-info) lief auch im iframe → alle 2 Min setState in Preview. **Fix:** Wenn inIframe (window.self!==window.top) kein setInterval, nur einmal fetch beim Mount. |
| 28.02.26 | GaleriePage QR-Bust-Intervall | setInterval(15s) für setQrBustTick lief auch in Preview → alle 15 s Re-Render. **Fix:** Intervall nur starten wenn window.self === window.top. |
| 28.02.26 | GaleriePage Admin-Weiterleitung | Guide/Assistent: window.location.href zu /admin (2 Stellen) ohne iframe-Check. In Preview → Navigation im iframe. **Fix:** Nur wenn window.self === window.top dann location.href; sonst window.open(adminUrl, '_blank'). |
| 28.02.26 | DevViewPage Mobile-Update-Intervall | setInterval(checkForMobileUpdates, 10000) lief auch im iframe (nur isMac-Check). **Fix:** Am Anfang des useEffects: if (window.self !== window.top) return – in Cursor Preview kein 10-Sek-Intervall. |
| 28.02.26 | GaleriePage Stammdaten-Intervall | setInterval(checkStammdatenUpdate, 2000) lief auch im iframe → alle 2 s setState in Preview. **Fix:** Intervall nur starten wenn window.self === window.top; in Cursor Preview nur einmal loadData(), kein 2s-Polling. |
| 28.02.26 | Check „check the crash“ | Routine ausgeführt. Alle setInterval in src: GaleriePage (QR, Stammdaten, Mobile-Polling), DevViewPage, useServerBuildTimestamp, GalerieVorschauPage – iframe/notInIframe-Absicherungen **intakt**. PlatzanordnungPage, ShopPage: Intervall nur bei Nutzer auf Seite (Kamera/QR), kein iframe-Check (bei Bedarf nachrüstbar). Kein neuer Fix; Cursor-Crash weiterhin IDE-seitig. |
| 28.02.26 | Check (erneut) | Kontext: seit letztem Check nur Vercel/Stand-Thema (kein neuer App-Code). write-build-info.js (iframe + localhost) ✓, GaleriePage iframe-Checks ✓. Keine neuen Stellen. |
| 27.02.26 | GalerieAssistent | setTimeout(400) in markiereErledigt ohne Cleanup → bei Unmount setState/onGoToStep nach Ablauf. **Fix:** stepTimeoutRef + clearTimeout im useEffect-Cleanup; in markiereErledigt Ref setzen und vor neuem Timeout clearen. |
| 01.03.26 | Check „ro check the crash“ | Reopen: dev = vite, Missetäter-Regel (write-build-info nicht am Ende). Crash: Keine neuen Stellen; env.ts safeReload bereits mit iframe-Check. Kein neuer Fix. |
| 01.03.26 | Intensiv-Test (Georg Pause) | Systematische Prüfung: location.reload/replace/href, setInterval/setTimeout, addEventListener-Cleanup, write-build-info, App-Start. Alle bekannten Stellen mit iframe-Check bzw. Cleanup. **Fix:** main.tsx – in iframe MAX_LOGS = 15 (statt 100) zur Crash-Vermeidung in Cursor Preview. Doku: docs/CRASH-INTENSIV-TEST.md. |
| 01.03.26 | Code-5-Check (erneut) | **Neue Prüfung:** ImageCropModal (neu) – addEventListener mousemove/mouseup mit Cleanup ✓. env.ts safeReload – iframe-Check ✓. SeitengestaltungPage – setTimeout(1800) für setSaved(false) ohne Cleanup → bei HMR/Navigation setState nach Unmount. **Fix:** savedTimeoutRef + clearTimeout im useEffect-Cleanup. |

*Zuletzt ergänzt: 01.03.26 (Code-5-Check + SeitengestaltungPage setTimeout-Cleanup)*

---

## SO ARBEITEN BIS CRASH WEG IST (sofort anwendbar)

**Cursor Preview ist instabil (Code 5). Du kannst sofort wieder arbeiten:**

1. **Preview in Cursor komplett schließen** (Tab/Panel schließen, nicht nur minimieren).
2. **App nur im Browser:** Im Cursor-Terminal `npm run dev` starten, dann **Chrome oder Safari** öffnen → **http://localhost:5177** (oder angezeigter Port). Galerie, Admin, alles dort.
3. **In Cursor:** Nur Editor + Terminal + Chat – keine laufende App im Preview.

**Warum:** Der Absturz kommt von der Preview/iframe-Umgebung. Im normalen Browser ist die App stabil. Wir bauen weiter Fixes ein; bis es reicht, ist Browser = sicherer Arbeitsplatz.

**Code 5 wiederkehrend (28.02.26):** Crashes passieren im Cursor-Dialog (nicht in der App), unvorhersehbar – mal kurz nach Neustart, mal nach 10 Minuten. Kein klares Muster. Alle App-Fixes (Intervalle/Reload im iframe) sind intakt. **Pragmatisch:** Oft committen, dann geht bei Crash wenig verloren; Preview zu, App im Browser – reduziert Last. Wenn ein Muster auftaucht (z. B. immer beim Speichern), notieren.

---

## Hauptursache nach vielen Reopens (01.03.26)

**Georg:** „Ro hat nichts mit der App zu tun – passiert hauptsächlich beim Codieren.“

**Daraus abgeleitet – die Hauptursache:**

1. **Codieren/Speichern, nicht die laufende App**  
   Reopen tritt vor allem auf beim **Schreiben und Speichern von Code** (Cursor-Editor, Datei speichern, evtl. AI-Antwort mit Dateiänderungen). Nicht primär beim Nutzen der Galerie im Browser oder in der Preview.

2. **Bekannter Auslöser: Datei-Schreibvorgänge**  
   Wenn am Ende einer AI-Antwort Skripte laufen und **Dateien geschrieben** werden (z. B. `write-build-info.js`), feuern **Dateiwächter** und ggf. **Vite HMR** → Lastspitze → Cursor/Electron kann kippen.  
   **Deshalb die Missetäter-Regel:** `write-build-info` **nicht** am Ende jeder AI-Antwort; nur beim Build/Commit oder auf explizite Aufforderung.  
   Zusätzlich: `write-build-info` schreibt nur, wenn sich der Inhalt **wirklich geändert** hat → weniger unnötige Schreibvorgänge.

3. **Cursor/Electron unter Last**  
   Gleichzeitig: Editor, Sprachserver, Linter, Dateiwächter, ggf. Preview, AI – das kann die IDE an ihre Grenzen bringen. Die **App** ist nicht der Treiber; der **Ablauf beim Codieren** (Speichern + Reaktion der IDE) ist es.

**Konsequenz:**  
- App-seitige Crash-Fixes (iframe, Intervalle, Reload) bleiben sinnvoll, beheben aber nicht die **Hauptursache** (Codieren/Speichern/Dateiänderungen).  
- **Reduzieren von Schreibvorgängen** (Missetäter-Regel, nur bei Änderung schreiben) und **weniger Last in Cursor** (Preview zu, ggf. Watcher-Ausnahmen) sind die Hebel.  
- Eine „finale“ Lösung liegt bei **Cursor/Electron** (Stabilität bei vielen Dateiänderungen/HMR); wir können nur entlasten und Regeln einhalten.

**Cursor-weit bekannt:** Code 5 („window terminated unexpectedly, reason: crashed“) wird von vielen Nutzern gemeldet (Cursor Forum, z. B. Error Code 5 – Frequent Window Crashes macOS). Auslöser u. a.: große Chat-Historie, große .cursorrules, Speicherprobleme in manchen Versionen, kaputter Cache. Wir haben das bei uns durch App-Entlastung + Missetäter-Regel ergänzt; die Ursache liegt in der IDE.

---

## Cursor-Community-Empfehlungen (und was wir daraus ableiten)

**Was die Community konkret empfiehlt:**

1. **Cache leeren** – Cursor-Cache-Ordner löschen (z. B. macOS: Application Support/Cursor/Cache). Oft erste Empfehlung bei Code 5.
2. **Einstellungen anpassen** (in Cursor `settings.json`):
   - `"git.autoRefresh": false` – weniger Last durch Git-Status
   - `"files.autoSave": "afterDelay"` – nicht bei jedem Tastendruck speichern
   - `"cursor.server.memoryLimit": 4096` – Speicherlimit für Cursor-Server (MB)
   - `"window.restoreWindows": "none"` – beim Start keine alten Fenster wiederherstellen (weniger Last)
3. **Dateiwächter entlasten** – `files.watcherExclude`: `node_modules`, `dist`, `.git`, generierte Dateien nicht beobachten.
4. **Chat-Historie reduzieren** – große Verläufe können Code 5 auslösen; alte Chats löschen oder neues Projekt testen.
5. **Erweiterungen prüfen** – Cursor mit `--disable-extensions` starten, ob Crashes seltener werden.
6. **Saubere Neuinstallation** – Cursor deinstallieren, Cache/Preferences-Ordner löschen, neu installieren.
7. **Vor Fixes: Stash** – Änderungen sichern (z. B. Git Stash), damit bei Neustart/Reinstall nichts verloren geht.

**Was wir daraus bereits umsetzen / ableiten:**

| Community-Tipp | Unser Stand / Ableitung |
|----------------|-------------------------|
| Cache leeren | Kein Automatismus – Georg kann bei Bedarf manuell leeren. |
| git.autoRefresh: false | In .vscode/settings.json gesetzt (01.03.26). |
| files.watcherExclude | Bereits gesetzt (buildInfo, dist, node_modules, .vite, …) – weniger HMR-/Watcher-Last. |
| Chat-Historie | Keine technische Maßnahme im Projekt; Hinweis: alte Chats ggf. löschen oder Projekt-Chats reduzieren. |
| Kein Auto-Save bei jeder Änderung | Cursor-Einstellung – `files.autoSave: "afterDelay"` empfohlen. |
| write-build-info nicht am Ende jeder Antwort | **Missetäter-Regel** – weniger Dateischreibvorgänge, weniger Watcher-Last. |
| cursor.server.memoryLimit | Optional in settings.json setzbar (z. B. 4096). |
| window.restoreWindows: none | Optional – weniger Last beim Start. |

**Konkret ableitbar:** In `.vscode/settings.json` (oder Cursor-User-Settings) können wir bzw. Georg ergänzen: `git.autoRefresh: false`, ggf. `cursor.server.memoryLimit: 4096`, `window.restoreWindows: "none"`. Dateiwatcher-Ausnahmen sind schon drin. Rest (Cache, Reinstall, Chat reduzieren) ist manuelle Cursor-Pflege.

**Georgs Beobachtung (01.03.26):** Reopen/Crash hat laut Empfinden **nichts mit der App zu tun**, sondern passiert **hauptsächlich beim Codieren** (Speichern, Schreiben). → Ursache liegt eher bei **Cursor/Editor** (Dateiwächter, HMR beim Speichern, IDE-Stabilität) als bei der laufenden App. App-seitige Abschaltungen (iframe, Preview) können trotzdem entlasten; die Hauptquelle ist aber das Schreiben/Speichern im Editor.
