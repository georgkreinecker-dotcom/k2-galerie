# Analyse: Handwerk vs. Standard – Fehlerzeit & ersetzbare Komponenten

**Zweck:** Einschätzen, wie viel Zeit in Fehlersuche und -behebung fließt, und wo handwerklich gebaute Teile durch standardisierte Komponenten ersetzt werden könnten (Profi statt Dilettant, Rad nicht zweimal erfinden).

**Stand:** 28.02.26

---

## 1. Zeit für Fehlersuche und -behebung (Einschätzung)

### Dokumentierte Bugs (GELOESTE-BUGS.md)

| # | Bereich | Wiederkehrendes Muster |
|---|---------|-------------------------|
| **16** dokumentierte Bugs | Sync, Merge, localStorage, Kontext, Crash, UI, Cache | Viele Bugs hängen an **demselben** Themen: Merge Server/Lokal, Kontext (K2/ök2/VK2), localStorage-Schreibregeln, Reload/iframe. |

**Zeitbild (qualitativ):**

- **Sync / Merge / „Werke verschwinden“** (BUG-005, 011, 012, 013, 014, 015, 016): Immer wieder Merge-Logik, „wer hat Priorität“, stilles Überschreiben, Mobil vs. Mac. **Sehr viel Zeit** in mehreren Sessions.
- **Crash (Cursor/Preview, Code 5)** (CRASH-BEREITS-GEPRUEFT): Reload, iframe, HMR, Listener-Cleanup – viele Prüfrunden, immer wieder ähnliche Checklisten. **Viel Zeit**.
- **Kontext / Datentrennung** (BUG-002, 003, 004): K2 vs. ök2 vs. VK2 – sessionStorage, Keys, falsche Datenquelle. **Wiederkehrend**.
- **localStorage / Quota / Bilder** (BUG-001, 010): Base64, Größe, SafeMode, Upload-Pfad. **Wiederkehrend**.
- **Stand / Cache / QR** (BUG-006): Server-Stand, Cache-Bust, Build-Info. **Mehrfach** angefasst.
- **UI/Kontrast, APf-Navigation** (BUG-008, 009): Einmalige Fixes, weniger „Dauerbrenner“.

**Fazit:** Ein Großteil der Fehlerzeit entsteht an **wenigen Wurzeln**:  
(1) **eigene Sync-/Merge-Logik** (Server + Lokal, mehrere Geräte),  
(2) **eigene Persistenz** (viele localStorage-Keys, keine einheitliche Schicht),  
(3) **eigene Reload/Stand-Logik** (Build-Info, QR, iframe),  
(4) **Kontext/Mehr-Mandanten** ohne klare Abstraktion.

---

## 2. Handwerklich gebaute Komponenten (Überblick)

### 2.1 Daten & Persistenz

| Komponente / Bereich | Handwerklich | Standard-Alternative („zukaufen“) |
|----------------------|--------------|-----------------------------------|
| **Artworks / Werke** | Eigene Logik in `artworksStorage.ts`, `autoSave.ts`, plus viele direkte `localStorage.getItem/setItem` in GaleriePage, GalerieVorschauPage, ScreenshotExportAdmin | Zentraler State-Store (z. B. Zustand) + **eine** Persistenz-Schicht (z. B. localStorage-Adapter oder Supabase als Single Source). Oder: React Query + Supabase für Server-State, klar getrennt von lokalem Cache. |
| **Stammdaten (Martina, Georg, Galerie)** | Viele Keys (`k2-stammdaten-*`), `autoSave.ts` mit eigenem Merge (mergeStammdatenPerson, mergeStammdatenGallery), über 60+ Zeilen nur Merge-Logik | Ein Objekt/Namespace pro Kontext, eine Schreib-API („saveStammdaten“), keine verstreuten setItem. Oder Stammdaten vollständig in Supabase, App nur Consumer. |
| **Kontext (K2 / ök2 / VK2)** | sessionStorage + URL-Parameter, an vielen Stellen `isOeffentlichAdminContext()`, `getArtworksKey()`, getrennte Keys pro Kontext | Ein **Context-Provider** (React Context oder Store), eine Quelle für „aktueller Mandant“. Keine Duplikation der Prüfung in jeder Komponente. |
| **Sync Server ↔ Lokal** | Eigene Merge-Logik in GaleriePage, GalerieVorschauPage, ScreenshotExportAdmin (wer hat Priorität, „nie mit weniger überschreiben“, createdOnMobile, isVeryNew …) | Klare Regel: **eine** Quelle der Wahrheit (z. B. Server), Client nur Cache mit invalidation. Oder Offline-First-Bibliothek (z. B. Dexie + Sync-Pattern) statt selbst gebauter Merge. |

### 2.2 Netzwerk & API

| Komponente / Bereich | Handwerklich | Standard-Alternative |
|----------------------|--------------|----------------------|
| **Datentransport (publishMobile, „Vom Server laden“)** | Eigener fetch zu `/api/write-gallery-data` und `gallery-data.json`, eigenes Retry, eigene Fehlerauswertung | Einheitlicher API-Client (z. B. kleine Wrapper-Funktion mit Retry, Timeout, Fehlerformat). Optional: React Query oder SWR für „Vom Server laden“ (Caching, Invalidierung, Retry standardisiert). |
| **Build-Info / Stand** | Eigenes Script in index.html, eigener Hook `useServerBuildTimestamp`, Cache-Bust an mehreren Stellen | Eine kleine „version/stand“-API, Client fragt einmal ab; oder Standard-Pattern für Cache-Invalidierung (ETag/Last-Modified) statt vieler eigener Bust-Parameter. |
| **Supabase** | Direkte Nutzung in einigen Stellen, daneben viel eigenes localStorage | Entweder Supabase als **primäre** Quelle für Werke/Stammdaten (dann weniger eigene Sync-Logik) oder klare Grenze: „nur für X“, Rest über eine eigene API-Schicht. |

### 2.3 UI & Laufzeitumgebung

| Komponente / Bereich | Handwerklich | Standard-Alternative |
|----------------------|--------------|----------------------|
| **Reload / iframe / Crash-Vermeidung** | Viele Einzelprüfungen `window.self === window.top`, Reload nur an manchen Stellen, viele Regeln in .cursor/rules | Ein zentraler „Environment-Check“ (ist iframe, ist Cursor Preview), eine Funktion `safeReload()` – alle Reloads laufen darüber. Weniger Duplikation, weniger Vergessen. |
| **Error Boundaries** | Eigene Klassen ErrorBoundary, AdminErrorBoundary, Reload-Buttons mit iframe-Check | Beibehalten, aber Reload-Logik **einmal** zentral (z. B. in safeReload), Boundaries rufen nur darauf zu. |
| **Theming / Kontrast** | WERBEUNTERLAGEN_STIL, manuelle Farben an vielen Stellen, BUG-008 (unleserlich) | Design Tokens (eine Datei/Variable pro Kontext: Hintergrund, Text, Akzent), Komponenten beziehen nur Tokens. Oder UI-Bibliothek mit Theme-Support. |

### 2.4 Bilder & Medien

| Komponente / Bereich | Handwerklich | Standard-Alternative |
|----------------------|--------------|----------------------|
| **Komprimierung** | Eigene Logik in mehreren Stellen (professionalImageBackground, MarketingOek2Page, Admin), unterschiedliche Parameter | **Eine** Utility „compressImageForStorage(options)“ (maxBreite, Qualität, Kontext), alle Aufrufer nutzen sie. Bereits teilweise da – konsequent durchziehen. |
| **Upload (GitHub → Vercel)** | Eigenes `githubImageUpload.ts`, Subfolder-Logik, Aufruf von vielen Stellen | Beibehalten als „zukaufbare“ Komponente (eine Funktion), aber Aufruf nur über **eine** Schicht (z. B. „uploadPageImage“), keine Duplikation der Subfolder-Logik. |
| **Background-Removal** | @imgly/background-removal (bereits Lib) | Bereits Standard – gut. |

---

## 3. Wo die meiste Fehlerzeit entsteht (priorisiert)

1. **Sync / Merge / „Werke verschwinden“** – wiederholte Bugs (012, 013, 011, 005), komplexe Regeln („nie mit weniger überschreiben“, „lokale Priorität“, createdOnMobile …). **Ersetzbarkeit:** Eine klare Datenquelle (Server oder Offline-First-Lib) plus eine Schreib-API würde viele dieser Bugs von vornherein vermeiden.
2. **localStorage-Persistenz** – viele Keys, viele direkte getItem/setItem, Merge und Filter an verschiedenen Stellen. **Ersetzbarkeit:** Ein zentraler Store + eine Persistenz-Schicht (oder Supabase als Hauptspeicher) reduziert „still überschrieben“ und „falscher Key“.
3. **Kontext (K2/ök2/VK2)** – Vergiftung (BUG-004), falsche Datenquelle (BUG-002, 003). **Ersetzbarkeit:** Ein Mandanten-Context, eine Funktion „currentArtworksKey()“ etc., keine 20 Stellen mit derselben if-Abfrage.
4. **Reload / iframe / Crash** – viele Einzelchecks. **Ersetzbarkeit:** Eine zentrale `safeReload()` / Environment-Check, alle Reloads darüber.
5. **API/Fehlerbehandlung** – unterschiedliche fetch-Patterns, teils eigenes Retry, teils nicht. **Ersetzbarkeit:** Ein API-Client mit Retry, Timeout, einheitlichem Fehlerformat.

---

## 4. Konkrete Empfehlungen (Priorität)

| Priorität | Was | Aktion (Profi statt Dilettant) |
|-----------|-----|--------------------------------|
| **Hoch** | Sync/Merge Server–Lokal | **Eine** klare Regel dokumentieren („Server = Quelle“ oder „Lokal = Quelle mit Sync“). Dann **eine** zentrale Merge-Funktion, alle Aufrufer nutzen sie. Optional: Prüfen, ob eine Lib (z. B. Offline-First mit Sync) das Rad ersetzt. |
| **Hoch** | localStorage-Persistenz | **Eine** Schicht für „Artworks lesen/schreiben“ (artworksStorage ausbauen), **keine** direkten setItem für Werke in GaleriePage/Vorschau/Admin. Stammdaten analog: eine Schicht, keine verstreuten Keys. |
| **Mittel** | Kontext/Mandant | Ein React Context (oder ein Store) „currentTenant“, alle Key- und Kontext-Abfragen darüber. Keine Duplikation von isOeffentlichAdminContext() an 50 Stellen. |
| **Mittel** | Reload/Stand | Eine Funktion `safeReload()` (iframe-Check drin), alle Reload-Buttons und Stand-Badge rufen nur diese auf. Build-Info wie gehabt, aber Client-Seite vereinheitlichen. |
| **Niedrig** | API-Client | Kleine Wrapper: `api.post(url, body)`, `api.get(url)` mit Retry + Timeout + einheitlichem Fehler-Objekt. publishMobile und handleLoadFromServer nutzen diese. |
| **Niedrig** | Bild-Komprimierung | Eine Funktion `compressImageForStorage(ctx)` mit festen Parametern pro Kontext, alle Aufrufer umstellen. |

---

## 5. Kurzfassung

- **Fehlerzeit** konzentriert sich auf: Sync/Merge, localStorage-Regeln, Kontext-Trennung, Reload/Crash-Vermeidung. Viele Bugs sind **Wiederholungen** derselben Themen.
- **Handwerklich** sind vor allem: eigene Sync-/Merge-Logik, verstreute Persistenz (viele Keys, viele setItem), eigene Reload/Stand-Logik, Kontext ohne zentrale Abstraktion.
- **Standardisierbar:** Eine Quelle der Wahrheit für Daten, eine Persistenz-Schicht, ein Mandanten-Context, eine safeReload(), ein API-Client, eine Komprimierungs-Utility. Das reduziert Duplikation und „Vergessen einer Stelle“ – und damit Fehlerzeit.

**Nächster Schritt:** Mit Georg priorisieren – zuerst **eine** Baustelle (z. B. „eine Merge-Funktion, alle nutzen sie“ oder „eine Persistenz-Schicht für Artworks“) und umsetzen, dann die nächste.
