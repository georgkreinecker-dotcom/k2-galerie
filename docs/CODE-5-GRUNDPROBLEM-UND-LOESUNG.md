# Code 5 – Grundproblem und endgültige Lösung

**Zweck:** Eine Stelle, die das **Grundproblem** (Ursache) und die **endgültige Lösung** festhält. Nicht Symptome bekämpfen („kürzere Sätze“), sondern die Ursache kennen und die richtige Lösung anwenden.

---

## 1. Das wirkliche Grundproblem (Georg, 05.03.26)

**Die KI bemerkt den Absturz gar nicht – sie muss auf deine Eingabe warten.**

Nach einem Code-5-Absturz ist Cursor wieder offen, der Chat wieder da – aber die KI hat **kein Signal**, dass etwas passiert ist. Sie weiß nicht, dass gerade ein Crash war, dass du neu hereingekommen bist, dass du weitermachen willst. Sie wartet passiv auf die nächste Nachricht. **Du musst etwas tippen** („ro“, „weiter“, „Absturz“), damit die KI überhaupt reagiert.

**Das ist das wirkliche Problem:** Nicht nur, dass Code 5 passiert, sondern dass die KI danach **nichts mitbekommt** und du immer wieder die erste sein musst, die etwas sagt. Ohne deine Eingabe passiert nichts.

**Konsequenz:** Wir können die KI nicht so bauen, dass sie den Crash „sieht“. Die einzige Lösung ist: **Dein eine Eingabe (z. B. „ro“) muss reichen.** Danach macht die KI alles Nötige in einem Zug (Stand lesen, weiterarbeiten, abschließen, kurze Antwort) – ohne dass du nochmal tippen oder lange lesen musst (weil langes Lesen wieder Code 5 auslösen kann). Kurz: Eine Eingabe von dir = ein vollständiger Zyklus von der KI, damit du nicht in eine Spirale aus „ro“ → lange Antwort → Crash → „ro“ gerätst.

---

## 2. Technische Ursachen von Code 5 (warum es crasht)

**Code 5** = „The window terminated unexpectedly (reason: crashed, code: 5)“ – Cursor/Electron stürzt ab.

**Wo es passiert:** Beim **Programmieren mit Cursor** (Georg schreibt, AI arbeitet), **nicht** beim normalen Nutzen der App im Browser oder auf dem Handy.

**Die eigentliche Ursache liegt in der Cursor/Electron-Umgebung, nicht im K2-App-Code:**

| Auslöser | Was passiert |
|----------|----------------|
| **Cursor Preview (iframe)** | Wenn die App in der Preview läuft, lädt ein iframe die App. Begrenzter Speicher, HMR bei jedem Speichern. Schwere Chunks (z. B. Admin, große Bundles) → Speicher/CPU-Spitze → Code 5. Der **ganze Host** kann mit abstürzen. |
| **Datei-Schreibvorgänge** | AI oder Editor schreibt Dateien → Cursor-Dateiwächter feuern → Reindex, ggf. Reopen, HMR. Viele Schreibvorgänge oder Schreiben am Ende einer AI-Antwort (z. B. write-build-info) = Lastspitze → Code 5. |
| **Auto-Save-Kaskade** | Wenn `files.autoSave: "afterDelay"`, speichert Cursor nach kurzer Verzögerung auch andere offene Dateien. AI schreibt eine Datei → Cursor speichert weitere → Kaskade → Code 5. (Aktuell: autoSave „off“.) |
| **Lange AI-Antwort / viel Lesen** | Sehr lange Antwort = Georg scrollt lange, Cursor rendert viel, Fenster unter Last. Kann mit ausreichen, um über die Kante zu kippen. |

**Kern:** Code 5 wird durch **Last in Cursor/Electron** ausgelöst (Preview + Dateiänderungen + HMR + großes Rendering). App-Code-Fixes entlasten, beheben aber nicht die Hauptursache: instabile Preview-Umgebung und Schreib-/Watcher-Last.

**Millisekunden (Georg):** Wenn der Absturz „sofort“ kommt, gibt es **einen diskreten Auslöser** – kein langsamer Verschleiß, sondern ein einzelnes Ereignis. Typisch: **ein** Dateischreibvorgang (AI schreibt oder du speicherst) → Watcher/HMR feuert → Spitze → Code 5. Oder **eine** sehr große AI-Antwort → ein schwerer Render-Schub. Praktisch: Weniger in einem Rutsch schreiben (weniger Dateien pro Antwort, kürzere Antworten), write-build-info nie am Ende – so trifft der „Millisekunden-Auslöser“ seltener zu.

---

## 3. Die endgültige Lösung (verbindlich)

### A) Cursor stabil starten (umgesetzt im Projekt)

**Eingabecode – im Mac-Terminal (im Projektordner k2Galerie):**

```bash
bash scripts/cursor-start-stabil.sh
```

Öffnet Cursor mit `--disable-gpu` für dieses Projekt (empfohlen vom Cursor-Forum). Kann Code-5-Crashes reduzieren. Einmal ausführen, wenn du Cursor für dieses Projekt starten willst.

### B) Strukturell: Preview nicht nutzen

- **Cursor Preview schließen** (Tab/Panel zu, nicht nur minimieren).
- **App nur im Browser:** Im Cursor-Terminal `npm run dev`, dann **Chrome oder Safari** → http://localhost:5177. Galerie, Admin, alles dort.
- **In Cursor:** Nur Editor + Terminal + Chat. Keine laufende App in der Preview.

**Warum:** Die Abstürze kommen von der Preview/iframe-Umgebung. Ohne Preview entfällt der Hauptlast-Faktor. Siehe docs/LOSUNG-CRASH-SPIRALE.md.

### C) Bei „ro“ (Reopen / weiterarbeiten)

- **AI:** DIALOG-STAND lesen → Nächsten Schritt ausführen → **kurze Antwort** (2–5 Sätze), **kein** write-build-info, **keine** massiven Doku-Updates in derselben Runde (nur DIALOG-STAND am Ende).
- **Warum kurz:** Lange Antwort = langes Lesen/Rendern = mehr Last = Risiko Code 5 direkt danach. Kurz = gleiche Info (Details in DIALOG-STAND), weniger Last.
- Regel: .cursor/rules/reopen-info.mdc (ro-Protokoll).

### D) Regeln, die Code-5-Auslöser vermeiden

- **Missetäter:** write-build-info **niemals** am Ende einer AI-Antwort. Nur beim Commit-Push (im Build) oder wenn Georg „Stand aktualisieren“ sagt.
- **Kein automatischer Reload** in der App (nur Badge/Button).
- **Reload/Redirect nur wenn nicht in iframe** (window.self === window.top).
- **files.autoSave: "off"** (explizit speichern mit Cmd+S).
- **files.watcherExclude:** docs/, buildInfo, dist, node_modules usw. (weniger Reindex bei Schreibzugriff).

---

## 4. ro5 – Georg sagt, es war Code 5 (05.03.26)

**Konvention:** Wenn Georg **„ro5“** schreibt (statt nur „ro“), heißt das: **Reopen nach Code-5-Absturz.** Die KI kann den Crash nicht von selbst erkennen – mit „ro5“ weiß sie es sofort.

**Was die AI bei „ro5“ tut:**
- Wie bei „ro“: DIALOG-STAND lesen → nächsten Schritt tun → **kurze Antwort** (2–5 Sätze), kein write-build-info.
- **Zusätzlich:** Den Code-5-Fall **dokumentieren** (z. B. in CRASH-BEREITS-GEPRUEFT.md unter „Bereits geprüft“ oder ein kurzer Eintrag „ro5 – [Datum]“), damit wir wissen, dass wieder einer war. Kein großer Crash-Check, kein langer Text – nur: ro5 erkannt, dokumentiert, weitergemacht.
- **Nicht:** Jetzt Zeit für „diesen Scheiß“ (Code 5) nehmen – das machen wir ein andermal. Einfach weitermachen.

---

## 4a. Vermutung: Absichtlicher Qualitätsfilter? (Georg, 05.03.26)

**Hypothese:** Code 5 / Reopen könnte von Cursor bewusst als **Qualitätsfilter** oder **Hürde** eingebaut sein – um Nutzer:innen zu testen oder um „schwierige“ Nutzung zu begrenzen. Man weiß es nicht.

**Für uns:** Egal ob Absicht oder Bug – unser Verhalten (kurze Antworten, kein write-build-info am Ende, Preview zu, App im Browser) bleibt sinnvoll und reduziert Last. Festgehalten, falls sich später dazu etwas klärt oder die Idee wieder aufkommt.

---

## 5. Analyse: Warum eine komplexe Session ohne Code 5 blieb (05.03.26)

**Beobachtung:** Die Speichermix-Operation (IndexedDB, Admin, autoSave, GalerieVorschauPage, viele Dateien) lief ohne einen einzigen Code-5-Absturz. Der Unterschied zu früheren „crash-anfälligen“ Sessions:

| Faktor | Früher (crash-anfällig) | Diesmal (stabil) |
|--------|--------------------------|-------------------|
| **Missetäter** | write-build-info am Ende der AI-Antwort ausgeführt → Dateischreiben → Watcher/HMR → Spitze → Code 5 | **Nicht** ausgeführt. Stand kommt nur mit Build (Commit-Push). Regel eingehalten. |
| **Dateischreiben** | Mehrere generierte Dateien am Ende einer Antwort (buildInfo, index.html, …) in einem Rutsch | Nur **Edit** bestehender Dateien (StrReplace). Build lief separat (ggf. im Hintergrund), schreibt in dist/ und Build-Info – nicht „am Ende der Chat-Antwort“. |
| **Automatischer Reload** | Manchmal Reload-Logik in der App → Loop in Preview | Keine neue Reload-Logik eingebaut. Nur async Speicherlogik (IndexedDB), kein location.reload. |
| **Crash-Check als Auslöser** | Nach Crash: großer Check (viele Dateien lesen + Doku schreiben in derselben Antwort) → selbst Lastspitze | Kein Crash gemeldet → kein großer Check. Regel „nur neue Bugs, wenig lesen, Doku nicht in derselben Runde“ war nicht nötig, aber würde greifen. |
| **Umfang pro Antwort** | Sehr lange Antworten, viele Dateien auf einmal lesen/ändern | Gezielte Änderungen (Admin-Zeilen, autoSave, Vorschau-Ladepfade), dann Tests/Build. Kein „alles auf einmal lesen + alles dokumentieren“. |
| **Preview** | Unklar – wenn offen, lastet jede Änderung dort | Wenn Preview zu war: Hauptlast-Faktor entfallen (App im Browser). |

**Kern:** Die **verbotenen Auslöser** wurden vermieden (kein write-build-info am Ende, kein Auto-Reload, kein massiver Check+Doku in einem Rutsch). Die **Arbeitsweise** war entlastend: fokussierte Edits, Build separat, keine Schreib-Kaskade am Ende der Antwort. Das bestätigt die Regeln (Missetäter, crash-neue-bugs-suchen, kurze Antworten bei ro) als wirksam.

---

## 6. Was die AI bei „ro“ und bei Code-5-Meldung tun muss

1. **Das wirkliche Grundproblem im Kopf haben:** Die KI bemerkt den Absturz nicht – sie wartet auf deine Eingabe. Dein „ro“ oder „ro5“ ist das einzige Signal. Also: Bei „ro“/„ro5“ sofort handeln, einen vollständigen Zyklus durchziehen, kurze Antwort (damit du nicht lange lesen musst und wieder Code 5 riskierst).
2. **Bei „ro“:** reopen-info.mdc befolgen (lesen → handeln → kurze Antwort, kein write-build-info). Kein „ich habe bemerkt …“ – die KI hat nichts bemerkt, bis du geschrieben hast.
3. **Bei „ro5“:** Wie „ro“, plus: Code 5 dokumentieren (kurz), dann weitermachen. Keine große Code-5-Analyse in dieser Runde.
4. **Bei „Code 5“ / „Crash“:** CRASH-LETZTER-KONTEXT.md + CRASH-BEREITS-GEPRUEFT.md lesen; nur neue Ursachen suchen. Lösung: Preview zu, App im Browser; ggf. Eintrag in CRASH-BEREITS-GEPRUEFT.

---

## 7. Verweise

- **ro5/Reopen – Kernregel (gefiltert, ohne Ballast):** .cursor/rules/ro5-kern.mdc – eine Stelle für ro/ro5, Missetäter, Verweise.
- **ro-Routine:** .cursor/rules/reopen-info.mdc (verweist auf ro5-kern).
- **Lösungen aus dem Netz (Forum/Gurus):** docs/CODE-5-LOESUNGEN-AUS-DEM-NETZ.md – Checkliste zum Durchprobieren (GPU aus, workspaceStorage, Reset, Erweiterungen, Cache).
- **Lösung Spirale:** docs/LOSUNG-CRASH-SPIRALE.md  
- **Bereits geprüft / Übersicht:** docs/CRASH-BEREITS-GEPRUEFT.md  
- **Letzter Kontext:** docs/CRASH-LETZTER-KONTEXT.md  
- **Crash beim Programmieren:** .cursor/rules/crash-beim-programmieren-vermeiden.mdc  
- **Bei Cursor eskalieren (dringend):** docs/CODE-5-ESKALATION-CURSOR.md – Text zum Kopieren für Forum/Feedback, damit Cursor das Problem priorisiert.

---

*Erstellt: 05.03.26 – damit das Grundproblem und die endgültige Lösung an einer Stelle stehen und bei „ro“ / Code 5 nicht wieder von vorn geraten wird.*
