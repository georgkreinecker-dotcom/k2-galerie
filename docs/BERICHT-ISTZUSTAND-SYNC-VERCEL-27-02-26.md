# Bericht: Istzustand Datenchaos & Vercel – 27.02.26

**Auftrag:** Analytischer Bericht: Was ist der Istzustand, warum funktioniert die Synchronisation (2 Fotos, Mac ↔ iPad, Galerie & Vorschau) nicht, und wie kommen wir zu einer Lösung?

---

## 1. Istzustand (Kurzfassung)

| Bereich | Ist | Soll |
|--------|-----|-----|
| **App-Stand auf Vercel** | Steht bei **27.02.26 13:26** (build-info.json). Mehrere Code-Pushes danach (14:58, 15:04) sind **nicht** auf der Live-URL angekommen. | Jeder Push auf main soll einen neuen Build ausliefern, QR/Stand zeigen aktuelle Zeit. |
| **iPad** | Bekommt keinen neueren Stand. QR-Code und „Vercel-Stand“ zeigen weiter 13:26. refresh.html hilft nicht, weil Vercel selbst noch 13:26 ausliefert. | iPad soll nach Push/Refresh die neueste App-Version und die neuesten Galerie-Daten sehen. |
| **Sync 2 Fotos (Mac ↔ iPad)** | Nicht zuverlässig: Zwei Geräte, Galerie + Vorschau, sollen dieselben Werke zeigen – gelingt nicht stabil. | Ein Werk speichern (Mac oder iPad) → auf dem anderen Gerät in Galerie & Vorschau sichtbar. |

**Fazit Istzustand:** Es gibt **zwei getrennte Probleme**: (A) Vercel liefert keine neue **App-Version** mehr (Stand bleibt 13:26). (B) Die **Daten-Synchronisation** (Werke/Fotos) zwischen Mac und iPad ist fragil und führt zu „Datenchaos“.

---

## 2. Was zusammenspielt (ohne Schuldzuweisung)

### 2.1 Vercel als „Hauptquelle“

- **Idee:** Eine zentrale Stelle (Vercel):  
  - **App:** index.html, build-info.json, JS-Bundles → Version/Stand.  
  - **Daten:** gallery-data.json → Werke, Stammdaten, Events usw.
- **Ablauf gedacht:**
  - Mac/iPad speichern Werk → `publishMobile()` schickt Daten an `/api/write-gallery-data` → GitHub wird per API aktualisiert → Vercel baut neu.
  - Code-Änderung am Mac → `git push` → Vercel baut neu.
  - iPad/Mac öffnen Galerie/Vorschau → laden von k2-galerie.vercel.app (gallery-data.json + App).

### 2.2 Wo es hakt

**A) Warum kommt „kein neuer Stand“ auf dem iPad an?**

- Der **QR-Code** und der angezeigte „Vercel-Stand“ kommen von **build-info.json** auf Vercel.
- Wir haben mehrfach gepusht (u. a. Stand 14:58, 15:04). **Trotzdem** liefert  
  `https://k2-galerie.vercel.app/build-info.json`  
  weiter **27.02.26 13:26**.
- Das heißt: **Nach 13:26 ist kein neuer Production-Build mehr live gegangen.**  
  Nicht weil „der Code Vercel manipuliert“, sondern weil **entweder**:
  - **alle neuen Deployments fehlschlagen** (z. B. Build Error), **oder**
  - der **Production-Branch** in Vercel nicht der Branch ist, auf den gepusht wird (z. B. main vs. main-fresh).

**B) Warum „Datenchaos“ bei 2 Fotos / Sync?**

- Sync hängt an mehreren Gliedern:
  1. **Speichern** → localStorage + `publishMobile()` (schickt an API).
  2. **API** `/api/write-gallery-data` (lokal: Vite-Middleware; auf Vercel: Serverless) → schreibt gallery-data.json (lokal per Skript + git, auf Vercel per **GitHub API**).
  3. **Vercel** baut nach dem Commit neu → gallery-data.json ist auf der Live-URL.
  4. **Anderes Gerät** lädt Galerie/Vorschau → holt gallery-data.json, **merged** mit lokalem localStorage (Regeln: nicht mit weniger Werken überschreiben, lokale „Neu-Anlagen“ nicht verwerfen).

- Wenn **Vercel nicht neu baut** (siehe A), dann ist auch **gallery-data.json** auf der URL nicht aktuell → das andere Gerät sieht alte Daten.
- Zusätzlich: Viele Merge-/Schutzregeln (eine Quelle, nie still überschreiben, Pending, Supabase, Polling) – wenn eine Stelle doch überschreibt oder falsch merged, verschwinden Werke oder es entsteht Uneinheitlichkeit.

---

## 3. Ursachen (analytisch)

### 3.1 Vercel liefert keinen neuen Stand (13:26 bleibt)

- **Wahrscheinlichste Ursache:** **Neue Builds schlagen fehl.**  
  Jeder Push (Code oder gallery-data per API) erzeugt einen neuen Commit und triggert ein Deployment. Wenn das Deployment **Error** hat, wird es nicht „Production“ → die alte Version (13:26) bleibt.
- **Zweite Möglichkeit:** **Production Branch** in Vercel ist nicht der Branch, auf den gepusht wird (z. B. Vercel baut nur `main`, es wird aber woanders gepusht, oder umgekehrt).
- **Nicht die Ursache:** „Vercel wurde manipuliert“ durch refresh.html, no-cache, Inject-Script. Diese Änderungen beeinflussen nur, **was** die App macht, wenn sie schon geladen ist. Sie verhindern nicht, dass Vercel einen neuen Build ausliefert – das blockiert nur ein **fehlgeschlagenes** oder **falsches** Deployment.

### 3.2 Sync-Chaos (2 Fotos, Mac ↔ iPad)

- **Vercel-Stand bleibt alt** → gallery-data.json auf der URL ist alt → das andere Gerät lädt veraltete Werke; Merge kann dann lokale Neu-Anlagen „verstecken“ oder umgekehrt.
- **Timing:** Ein Gerät speichert und ruft die API auf; der andere öffnet die Seite, bevor der Vercel-Build durch ist → sieht noch alte Daten.
- **Merge-Logik:** Trotz Schutz „nie mit weniger Werken überschreiben“ und „lokale Werke ohne Server-Eintrag behalten“ – wenn es viele Pfade gibt (Supabase, gallery-data, Polling, Pending), kann an einer Stelle doch gefiltert/überschrieben werden.
- **Zwei „Quellen“ in der Praxis:** localStorage auf jedem Gerät **und** Server (gallery-data.json). Wenn nicht klar ist, wann welche Quelle gilt (z. B. „erst lokal, dann Server“ vs. „immer Server zuerst“), entsteht Uneinheitlichkeit.

---

## 4. Weg zur Lösung (Schritte, priorisiert)

### Schritt 1: Vercel wieder zum Deployen bringen (unverzichtbar)

- **1.1 Vercel Dashboard prüfen**
  - **Deployments:** Neuestes Deployment mit dem letzten Commit (z. B. „Stand 27.02.26 15:04“) – Status **Ready** (grün) oder **Error** (rot)?
  - Wenn **Error:** Build-Log öffnen, Fehlermeldung notieren (z. B. TypeScript, fehlendes Modul, Speicher). **Dieser Fehler** blockiert jeden neuen Stand.
  - **Settings → Git:** **Production Branch = main.** Nur dann werden Pushes auf `main` zu Production.

- **1.2 Build-Fehler beheben**
  - Wenn das Log einen Fehler zeigt (z. B. in einer bestimmten Datei): genau diese Stelle im Projekt beheben.
  - **Lokal testen:** `npm run build` – muss ohne Fehler durchlaufen. Was lokal fehlschlägt, schlägt auch auf Vercel fehl.

- **1.3 Nach dem Fix**
  - Erneut pushen (oder in Vercel „Redeploy“ beim letzten Commit).
  - Wenn das Deployment **Ready** ist:  
    - `https://k2-galerie.vercel.app/build-info.json` im Browser prüfen → sollte neue Zeit zeigen.  
    - Dann: iPad **refresh.html** oder QR neu scannen → neuer Stand sollte ankommen.

**Erst wenn Vercel wieder zuverlässig neu baut, bringen weitere Änderungen an Stand/QR/Refresh dauerhaft etwas.**

### Schritt 2: Sync wieder auf „eine klare Quelle“ reduzieren

- **2.1 Zielbild**
  - **Eine** anerkannte Quelle für die **Werke** im Produkt: **gallery-data.json auf Vercel** (nach Veröffentlichen).
  - Mac und iPad: Beim **Öffnen** von Galerie/Vorschau **von dort laden**; Merge nur so, dass **nie** lokale Neu-Anlagen still verworfen werden (bestehende Regeln).
  - Beim **Speichern**: weiterhin localStorage + `publishMobile()` → API → GitHub → Vercel-Build.

- **2.2 Konkret prüfen**
  - **Nach Speichern:** Wird `publishMobile()` (bzw. bei K2 `publishMobile({ silent: true })`) zuverlässig aufgerufen? (Bereits so vorgesehen.)
  - **API auf Vercel:** Funktioniert `/api/write-gallery-data` (GITHUB_TOKEN gesetzt)? Sonst kommt „Veröffentlichen“ vom iPad/Mac nicht im Repo an.
  - **Laden:** Galerie/Vorschau – wird gallery-data.json von der **Vercel-URL** geladen (nicht von einer alten Cache-URL)? Cache-Bust (z. B. `?v=…`) ist bereits eingebaut; wichtig ist, dass der **Build** auf Vercel neu ist (Schritt 1).

- **2.3 Optional vereinfachen**
  - Weniger parallele „Quellen“ (z. B. Supabase vs. gallery-data) für K2-Galerie, bis der Ablauf wieder stabil ist.
  - Ein klares Ablauf-Dokument: „Speichern → Veröffentlichen (automatisch oder einmal manuell) → anderes Gerät: Galerie/Vorschau öffnen oder Stand tippen.“

### Schritt 3: Doku und Ablauf festhalten

- In **docs/VERCEL-STAND-HANDY.md** (oder einer kurzen Checkliste) festhalten:
  - Wenn **Stand auf iPad/Mac nicht aktualisiert:** Zuerst **build-info.json** auf Vercel prüfen; wenn dort alte Zeit → Vercel-Deployment prüfen (Error? Production Branch?).
- Ablauf **Sync Mac ↔ iPad:**  
  „Speichern = Daten gehen an zentrale Stelle (API → GitHub → Vercel). Anderes Gerät: Galerie/Vorschau öffnen oder Stand tippen. Wenn Vercel-Build aktuell ist, sind die Daten da.“

---

## 5. Kurzfassung

- **Istzustand:** Vercel liefert keine neue App-Version mehr (Stand 13:26); Sync von 2 Fotos zwischen Mac und iPad (Galerie & Vorschau) ist nicht zuverlässig.
- **Ursache Stand:** Sehr wahrscheinlich **fehlgeschlagene Vercel-Builds** (oder falscher Production-Branch), nicht „Manipulation“ durch unsere Code-Änderungen.
- **Ursache Sync:** Hängt an aktueller Vercel-Version und aktueller gallery-data.json; dazu viele Merge-/Lade-Pfade, die bei Fehlern oder veralteter URL zu Datenchaos führen.
- **Lösung (Reihenfolge):**
  1. **Vercel reparieren:** Dashboard → Deployments (Error?) und Production Branch (main?) prüfen, Build-Fehler beheben, bis neue Builds **Ready** sind.
  2. **Sync stabilisieren:** Eine klare Quelle (gallery-data.json auf Vercel), API und publishMobile sicherstellen, Merge-Regeln beibehalten (kein stilles Verwerfen lokaler Neu-Anlagen).
  3. **Ablauf dokumentieren:** Wann welcher Stand wo erscheint, was bei „kein neuer Stand“ zu prüfen ist.

Damit lässt sich schrittweise aus dem aktuellen Zustand herauskommen und wieder zu einem vorhersehbaren Verhalten kommen.
