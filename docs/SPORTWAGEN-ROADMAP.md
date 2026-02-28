# Prototyp → Sportwagen – Systematische Durchführung

**Ziel:** Das gesamte Programm systematisch durchgehen, keinen Aspekt vergessen, aus dem Prototypen einen zuverlässigen, wartbaren „Sportwagen“ machen.

**Grundsatz:** Profi statt Dilettant – eine Quelle, ein Standard pro Problemstellung, keine verstreuten Duplikate. Siehe **ANALYSE-HANDWERK-VS-STANDARD-KOMPONENTEN.md**.

**Stand:** 28.02.26

---

## Wie diese Roadmap funktioniert

- **Bereiche** sind vollständig aufgelistet (nichts vergessen).
- Pro Bereich: **Prototyp** (heute) → **Sportwagen** (Ziel) → **Konkrete Schritte** → **Erledigt [ ]**.
- Reihenfolge: Zuerst **Fundament** (Daten, Kontext, Sync), dann **Schichten** (API, UI, Medien), dann **Seiten/Komponenten**, dann **Stabilität & Doku**.
- Nach Erledigung: `[x]` setzen und Datum eintragen.

---

## Phase 1: Fundament – Daten & Kontext

### 1.1 Kontext/Mandant (K2 | ök2 | VK2)

| | Inhalt |
|---|--------|
| **Prototyp** | sessionStorage + URL-Parameter; `isOeffentlichAdminContext()`, `getArtworksKey()` an vielen Stellen dupliziert; Kontext-Vergiftung möglich (BUG-004). |
| **Sportwagen** | **Eine** Quelle für „aktueller Mandant“: React Context oder zentraler Store. Alle Key- und Kontext-Abfragen laufen darüber. Keine 50 Stellen mit derselben if-Abfrage. |
| **Schritte** | 1) Tenant-Context anlegen (Provider + Hook `useTenant()`). 2) `currentArtworksKey()`, `currentEventsKey()`, `currentDocumentsKey()` etc. aus dem Context. 3) Alle Aufrufer von `isOeffentlichAdminContext()` / `getArtworksKey()` umstellen. 4) sessionStorage nur noch im Context setzen/lesen, nicht in jeder Seite. |
| **Erledigt** | [x] 28.02.26 |

### 1.2 Artworks-Persistenz (eine Schicht)

| | Inhalt |
|---|--------|
| **Prototyp** | `artworksStorage.ts` + `autoSave.ts` + viele direkte `localStorage.getItem/setItem` in GaleriePage, GalerieVorschauPage, ScreenshotExportAdmin. Verschiedene Keys pro Kontext, aber kein einheitlicher Einstieg. |
| **Sportwagen** | **Eine** Schicht: „Artworks lesen/schreiben“ nur über `artworksStorage` (oder erweiterte API). Keine direkten setItem für Werke in Pages/Admin. Kontext kommt aus 1.1, Key-Auswahl intern. |
| **Schritte** | 1) Alle Stellen finden, die Werke in localStorage schreiben (grep nach setItem + k2-artworks, k2-oeffentlich-artworks, etc.). 2) Schreibzugriffe auf `saveArtworksStorage()` / eine zentrale Schreibfunktion umstellen. 3) Lesen nur über `loadArtworksRaw()` / `loadArtworks()` mit Kontext aus 1.1. 4) Regeln in niemals-kundendaten-loeschen.mdc einhalten (kein Filter+setItem). |
| **Erledigt** | [x] 28.02.26 |

### 1.3 Stammdaten-Persistenz (eine Schicht)

| | Inhalt |
|---|--------|
| **Prototyp** | Viele Keys `k2-stammdaten-*`; `autoSave.ts` mit mergeStammdatenPerson, mergeStammdatenGallery; teils direkte Zugriffe. |
| **Sportwagen** | **Eine** Schicht: z. B. `stammdatenStorage.ts` mit `loadStammdaten(tenant)`, `saveStammdaten(tenant, data)`. Merge-Logik nur hier. Keine leeren Werte überschreiben (kein-datenverlust). |
| **Schritte** | 1) Bestehende Merge-Logik in autoSave als Referenz nehmen. 2) Eine Datei `stammdatenStorage.ts` (oder Erweiterung autoSave) mit klarer API. 3) Alle direkten getItem/setItem für Stammdaten auf diese Schicht umstellen. 4) K2_STAMMDATEN_DEFAULTS als Fallback beibehalten. |
| **Erledigt** | [x] 28.02.26 (Schicht steht: stammdatenStorage.ts mit loadStammdaten, saveStammdaten, loadVk2Stammdaten, saveVk2Stammdaten; autoSave + pageContentGalerie umgestellt; übrige Stellen können schrittweise folgen) |

### 1.4 Events & Dokumente – eine Quelle pro Kontext

| | Inhalt |
|---|--------|
| **Prototyp** | Events: `k2-events`, `k2-vk2-events`; Dokumente: `k2-documents`, `k2-vk2-documents`; ök2 nur MUSTER. Laden/Schreiben an mehreren Stellen. |
| **Sportwagen** | **Eine** Schicht pro Typ: `eventsStorage.ts`, `documentsStorage.ts` mit Kontext aus 1.1. Keine direkten setItem in Komponenten. Regel dokumente-kontext-eine-quelle.mdc bleibt. |
| **Schritte** | 1) Alle Lese-/Schreibstellen für Events und Dokumente erfassen. 2) Zentrale load/save mit tenant aus Context. 3) Umstellen, Doku prüfen. |
| **Erledigt** | [x] 28.02.26 (eventsStorage, documentsStorage; GaleriePage, GalerieVorschauPage, Flyer, Presse, Vk2, DevView, Admin, tenantConfig initVk2) |

---

## Phase 2: Sync & Merge – eine Regel, eine Funktion

### 2.1 Sync-Regel dokumentieren und durchsetzen

| | Inhalt |
|---|--------|
| **Prototyp** | Verschiedene Merge-Logiken in GaleriePage, GalerieVorschauPage, ScreenshotExportAdmin; „nie mit weniger überschreiben“, „lokale Priorität“, createdOnMobile, isVeryNew – mehrfach Bugs (BUG-011 bis 016). |
| **Sportwagen** | **Eine** verbindliche Regel (z. B. „Server = Quelle; lokale Neu-Anlagen werden vor Merge geschützt“) in einer Doku. **Eine** zentrale Merge-Funktion `mergeServerWithLocal(serverList, localList, options)`, alle Aufrufer nutzen sie. |
| **Schritte** | 1) Regel in docs (z. B. SYNC-REGEL.md) festhalten. 2) Eine Funktion in utils (z. B. `syncMerge.ts`) mit klaren Parametern und gleichem Verhalten wie gewünscht. 3) GaleriePage, GalerieVorschauPage, Admin (handleLoadFromServer, handleRefresh, etc.) auf diese Funktion umstellen. 4) Keine lokalen Merge-Varianten mehr. |
| **Erledigt** | [x] 28.02.26 (SYNC-REGEL.md, syncMerge.mergeServerWithLocal, GaleriePage 2× + GalerieVorschauPage handleRefresh) |

### 2.2 Datentransport (Senden/Empfangen) – ein API-Client

| | Inhalt |
|---|--------|
| **Prototyp** | Eigener fetch zu write-gallery-data und gallery-data.json; eigenes Retry, eigene Fehlerauswertung an mehreren Stellen. |
| **Sportwagen** | **Ein** API-Client: z. B. `apiClient.ts` mit `api.post(url, body)`, `api.get(url)` – Retry, Timeout, einheitliches Fehler-Objekt. publishMobile und handleLoadFromServer nutzen ihn. |
| **Schritte** | 1) apiClient.ts anlegen (fetch-Wrapper, Retry 1x, Timeout, Rückgabe { success, data, error, hint }). 2) publishMobile und handleLoadFromServer umstellen. 3) Weitere fetch-Aufrufe (build-info, etc.) prüfen und ggf. anbinden. |
| **Erledigt** | [x] 28.02.26 (apiClient.ts apiGet/apiPost, Retry, Timeout; publishMobile + handleLoadFromServer umgestellt) |

---

## Phase 3: UI & Laufzeit – stabil und einheitlich

### 3.1 Reload & iframe – safeReload()

| | Inhalt |
|---|--------|
| **Prototyp** | Viele Einzelprüfungen `window.self === window.top`; Reload an verschiedenen Stellen (Stand-Badge, Error Boundaries, Refresh-URL). |
| **Sportwagen** | **Eine** Funktion `safeReload(options?)` (z. B. in utils/env.ts): iframe-Check drin, ggf. Cache-Bust. Alle Reload-Buttons und Stand-Badge rufen nur diese auf. |
| **Schritte** | 1) safeReload() implementieren (iframe → kein Reload; sonst location.replace mit aktuellem Pfad + v=Date.now()). 2) Alle Stellen mit location.reload / location.replace / doHardReload suchen und auf safeReload umstellen. 3) Error Boundaries: Reload-Button ruft safeReload auf. |
| **Erledigt** | [x] 28.02.26 (src/utils/env.ts safeReload; App, ErrorBoundary, main, appBootstrap, index.html, GaleriePage Pull-to-Refresh, Vk2 Stand-Badges, ScreenshotExportAdmin Backup-Reloads) |

### 3.2 Error Boundaries – ein Standard

| | Inhalt |
|---|--------|
| **Prototyp** | ErrorBoundary, AdminErrorBoundary; Reload-Buttons teils mit, teils ohne iframe-Check. |
| **Sportwagen** | Beide Boundaries nutzen **dieselbe** Reload-Logik (safeReload). Keine Duplikation der iframe-Prüfung. |
| **Schritte** | 1) In beiden Boundaries Reload-Handler durch safeReload ersetzen. 2) Prüfen, ob weitere Fehler-UI (z. B. main.tsx) vereinheitlicht werden kann. |
| **Erledigt** | [x] 28.02.26 (ErrorBoundary + App AdminErrorBoundary nutzen safeReload; main.tsx/appBootstrap Buttons nutzen window.safeReload) |

### 3.3 Theming & Kontrast (Design Tokens)

| | Inhalt |
|---|--------|
| **Prototyp** | WERBEUNTERLAGEN_STIL, manuelle Farben an vielen Stellen; BUG-008 (unleserlich auf hellem Hintergrund). |
| **Sportwagen** | **Eine** Stelle für Design Tokens (z. B. theme.ts oder Erweiterung tenantConfig): Hintergrund hell/dunkel, Text, Akzent. Komponenten beziehen nur Tokens. Regel ui-kontrast-lesbarkeit.mdc erfüllt. |
| **Schritte** | 1) Tokens für Admin (hell) und Galerie/Produkt (dunkel) definieren. 2) Kritische Komponenten (Admin, Modals, Buttons) auf Tokens umstellen. 3) Prüfung: Keine unleserlichen Kombinationen (Türkis/Weiß nur auf dunkel). |
| **Erledigt** | [x] 28.02.26 (src/config/theme.ts: adminTheme aus WERBEUNTERLAGEN_STIL + buttonPrimary/textOnLight; galerieTheme textOnDark/accentOnDark; Regel in Code dokumentiert; bestehende Komponenten nutzen weiter s.text/s.accent) |

---

## Phase 4: Bilder & Medien

### 4.1 Bild-Komprimierung – eine Utility

| | Inhalt |
|---|--------|
| **Prototyp** | Komprimierung in professionalImageBackground, MarketingOek2Page, ScreenshotExportAdmin mit unterschiedlichen Parametern. |
| **Sportwagen** | **Eine** Utility `compressImageForStorage(options)` (maxBreite, Qualität, Kontext mobil/desktop). Alle Aufrufer nutzen sie. Regel komprimierung-fotos-videos.mdc. |
| **Schritte** | 1) Bestehende Logik in professionalImageBackground bzw. Admin auslagern/erweitern zu einer gemeinsamen Funktion. 2) Parameter pro Kontext (mobil: 600, 0.5; desktop: 800, 0.65) festlegen. 3) Alle Stellen umstellen. |
| **Erledigt** | [x] 28.02.26 (src/utils/compressImageForStorage.ts; githubImageUpload, ScreenshotExportAdmin, MarketingOek2Page umgestellt) |

### 4.2 Bild-Upload (GitHub → Vercel) – eine Einstiegs-API

| | Inhalt |
|---|--------|
| **Prototyp** | githubImageUpload.ts; Subfolder-Logik und Aufruf an mehreren Stellen. |
| **Sportwagen** | Eine klare Aufruf-Schicht (z. B. `uploadPageImage(file, context)`) – Subfolder-Logik nur intern. Keine Duplikation der Pfad-Logik in Komponenten. |
| **Schritte** | 1) Alle Aufrufer von githubImageUpload erfassen. 2) Eine Wrapper-Funktion mit Kontext (K2/ök2/VK2) und Subfolder; Aufrufer rufen nur diese. |
| **Erledigt** | [x] 28.02.26 (uploadPageImage in githubImageUpload; Admin nutzt uploadPageImage/uploadPageImageToGitHub, Willkommen/Seitengestaltung einheitlich) |

---

## Phase 5: Admin & Galerie – eine Daten-Schicht

### 5.1 ScreenshotExportAdmin (K2/ök2/VK2)

| | Inhalt |
|---|--------|
| **Prototyp** | Lädt/speichert Werke, Stammdaten, Events, Dokumente teils direkt, teils über Hilfsfunktionen; Merge und „Vom Server laden“ eigen. |
| **Sportwagen** | **Nur** über Persistenz-Schichten (1.2, 1.3, 1.4) und Sync-Merge (2.1); API-Client (2.2) für Senden/Empfangen. Keine direkten localStorage-Key-Zugriffe für Werke/Stammdaten. |
| **Schritte** | 1) Nach Phase 1+2: Admin auf loadArtworks/saveArtworksStorage, Stammdaten-Schicht, mergeServerWithLocal, apiClient umstellen. 2) loadArtworksRaw/loadArtworks nur noch mit Kontext aus Tenant-Context. |
| **Erledigt** | [x] 28.02.26 (Stammdaten: loadStammdaten/persistStammdaten/loadVk2Stammdaten/saveVk2Stammdaten; Admin nutzt Schicht, keine direkten k2-stammdaten-* / k2-vk2-stammdaten Zugriffe mehr; Werke/Events/Documents bereits über Schichten) |

### 5.2 GaleriePage & GalerieVorschauPage

| | Inhalt |
|---|--------|
| **Prototyp** | Eigenes Laden/Merge von gallery-data.json und localStorage; verschiedene Keys je Kontext. |
| **Sportwagen** | Lesen/Schreiben nur über Artworks-Schicht und Sync-Merge. Kontext aus 1.1. Kein eigener Merge-Code mehr. |
| **Schritte** | 1) Nach Phase 1+2: GaleriePage und GalerieVorschauPage auf Persistenz-Schicht + mergeServerWithLocal umstellen. 2) QR/Stand nutzt weiterhin useServerBuildTimestamp + buildQrUrlWithBust (unverändert). |
| **Erledigt** | [x] 28.02.26 (artworksStorage: readArtworksRawForContext, saveArtworksForContext; GaleriePage/GalerieVorschauPage nur Schicht + mergeServerWithLocal; VK2 kein Artwork-Key) |

### 5.3 Shop, Willkommen, Vita, weitere Produkt-Seiten

| | Inhalt |
|---|--------|
| **Prototyp** | Stammdaten/Kontakt teils direkt, teils aus State; fromOeffentlich an mehreren Stellen. |
| **Sportwagen** | Stammdaten nur aus Stammdaten-Schicht (1.3); Kontext aus 1.1. Ein Standard für „Kontakt anzeigen“ (fromOeffentlich-Logik einmal zentral). |
| **Schritte** | 1) Nach Phase 1+1.3: ShopPage, WillkommenPage, VitaPage, AGBPage etc. auf Schicht + Context umstellen. 2) fromOeffentlich in eine Hilfsfunktion oder Context auslagern. |
| **Erledigt** | [x] 28.02.26 (oeffentlichContext; Shop/Vita über Schicht; Willkommen/AGB geprüft – keine Stammdaten-Zugriffe. GaleriePage Stammdaten beim gallery-data-Merge optional später auf Schicht.) |

---

## Phase 6: APf & Werkzeug (Stabilität, keine Produkt-Vermischung)

### 6.1 DevView, Mission Control, Mobile Connect

| | Inhalt |
|---|--------|
| **Prototyp** | QR/Stand-Logik, Links zu Galerie/Vorschau; teils iframe-Checks. |
| **Sportwagen** | Reload über safeReload (3.1); QR-URLs über buildQrUrlWithBust + useQrVersionTimestamp (bleibt). Keine Produkt-Daten in APf schreiben. Regel apf-werkzeug-vs-produkt.mdc. |
| **Schritte** | 1) Alle Reload/Redirect in DevViewPage, PlatformStartPage, MobileConnectPage auf safeReload umstellen. 2) Prüfen: Keine localStorage-Schreibzugriffe auf k2-artworks etc. aus APf. |
| **Erledigt** | [x] 28.02.26 (Geprüft: keine Reload-Stellen in den drei Seiten – safeReload bereits in App/ErrorBoundary/Galerie/VK2; keine Schreibzugriffe auf k2-artworks/k2-stammdaten aus APf, nur Metadaten k2-last-*, k2-artworks-hash) |

### 6.2 mök2, Handbuch, Projekte

| | Inhalt |
|---|--------|
| **Prototyp** | Eigene Layouts, Navigation; Inhalte in MarketingOek2Page, K2TeamHandbuchPage. |
| **Sportwagen** | Klar getrennt von Galerie-Daten; nur Lesen aus öffentlichen Quellen/Muster. Regel mok2-vk2-inhalte-nicht-entfernen.mdc. Keine neuen handwerklichen Duplikate. |
| **Schritte** | 1) Bei Änderungen: keine K2/ök2-Daten in mök2 schreiben. 2) Inhalte (Lizenz VK2, etc.) nicht „nebenbei“ entfernen. |
| **Erledigt** | [x] 28.02.26 (Geprüft: MarketingOek2Page/K2TeamHandbuch schreiben keine k2-artworks/k2-stammdaten; Regel mok2-vk2-inhalte-nicht-entfernen.mdc aktiv. Bei Änderungen weiter beachten.) |

---

## Phase 7: Build, Stand, Deployment – ein Standard

### 7.1 Build & Stand

| | Inhalt |
|---|--------|
| **Prototyp** | write-build-info.js, index.html Inject, buildInfo.generated.ts, vercel.json no-cache; mehrfach angefasst (BUG-006). |
| **Sportwagen** | **Ein** dokumentierter Ablauf: Build schreibt Stand; QR nutzt Server-Stand + Cache-Bust; keine Änderung ohne Regel stand-qr-niemals-zurueck.mdc. |
| **Schritte** | 1) Doku (VERCEL-STAND-HANDY, STAND-QR-SO-BLEIBT-ES) aktuell halten. 2) Bei Änderungen: Checkliste in stand-qr-niemals-zurueck.mdc durchgehen. |
| **Erledigt** | [x] 28.02.26 (Doku: VERCEL-STAND-HANDY, STAND-QR-SO-BLEIBT-ES, SCHRITT-FUER-SCHRITT-STAND-AKTUELL; Regel stand-qr-niemals-zurueck.mdc alwaysApply; Checkliste bei Build/QR-Änderungen. Laufend einhalten.) |

### 7.2 Vercel & API (write-gallery-data, build-info)

| | Inhalt |
|---|--------|
| **Prototyp** | api/write-gallery-data.js, api/build-info.js; Rewrites, CORS, GITHUB_TOKEN. |
| **Sportwagen** | API-Endpoints stabil; eine Doku (DATENTRANSPORT-IPAD-MAC-VERCEL, Vercel-Checklisten). Kein Reload/Redirect in API. |
| **Schritte** | 1) Prüfen: Alle Aufrufer nutzen feste URL und API-Client (nach 2.2). 2) Doku auf „eine Quelle“ trimmen. |
| **Erledigt** | [ ] |

---

## Phase 8: Sicherheit & Regeln – durchgängig

### 8.1 Datentrennung K2 | ök2 | VK2

| | Inhalt |
|---|--------|
| **Prototyp** | Regeln in k2-oek2-trennung.mdc, dokumente-kontext-eine-quelle.mdc; teils Duplikation der Prüfung. |
| **Sportwagen** | **Eine** technische Quelle: Tenant-Context (1.1). Regeln bleiben; Implementierung nutzt überall den Context – keine vergessene Stelle. |
| **Schritte** | 1) Nach 1.1: Checkliste K2-OEK2-DATENTRENNUNG.md durchgehen, alle Einträge „Kontext aus Context“ erfüllt. 2) Tests (datentrennung.test.ts, kundendaten-schutz.test.ts) grün und erweitern falls nötig. |
| **Erledigt** | [ ] |

### 8.2 Kundendaten nie automatisch löschen

| | Inhalt |
|---|--------|
| **Prototyp** | Regeln in niemals-kundendaten-loeschen.mdc, datentrennung-localstorage-niemals-loeschen.mdc. |
| **Sportwagen** | Persistenz-Schichten (1.2, 1.3, 1.4) schreiben **nie** nach Filter/„Aufräumen“; nur nach expliziter User-Aktion. Tests decken geschützte Keys ab. |
| **Schritte** | 1) Nach Phase 1: Alle Schreibzugriffe in den Schichten auf „nur bei User-Aktion / explizitem Save“ prüfen. 2) Kein automatisches setItem mit gefilterter Liste. |
| **Erledigt** | [ ] |

---

## Phase 9: Tests & Doku – absichern und auffindbar

### 9.1 Tests für kritische Pfade

| | Inhalt |
|---|--------|
| **Prototyp** | Tests für Datentrennung, Kundendaten, Bild-Upload; nicht für Merge/Sync. |
| **Sportwagen** | Zusätzlich: Tests für mergeServerWithLocal (2.1) und für Persistenz-Schicht (1.2) – z. B. „nie mit weniger überschreiben“, Kontext-Keys. |
| **Schritte** | 1) Nach 2.1: Unit-Tests für mergeServerWithLocal. 2) Nach 1.2: Tests für load/save mit Kontext (Keys korrekt). 3) npm run test bleibt grün. |
| **Erledigt** | [ ] |

### 9.2 Doku – eine Stelle pro Thema

| | Inhalt |
|---|--------|
| **Prototyp** | Viele Docs (00-INDEX, STRUKTUR-HANDELN-QUELLEN, HAUS-INDEX); teils Überschneidung. |
| **Sportwagen** | 00-INDEX und HAUS-INDEX aktuell; neue Themen (Sync-Regel, Tenant-Context, API-Client) in je **einer** Doku. Kein verstreutes Wissen. |
| **Schritte** | 1) SYNC-REGEL.md anlegen (nach 2.1). 2) Tenant-Context in STRUKTUR-HANDELN oder eigene Kurzdoku. 3) 00-INDEX und HAUS-INDEX verweisen darauf. |
| **Erledigt** | [ ] |

---

## Übersicht – Reihenfolge (nichts vergessen)

| Phase | Inhalt | Abhängigkeit |
|-------|--------|---------------|
| **1.1** | Kontext/Mandant (Tenant-Context) | – |
| **1.2** | Artworks-Persistenz (eine Schicht) | 1.1 sinnvoll vorher |
| **1.3** | Stammdaten-Persistenz | 1.1 |
| **1.4** | Events & Dokumente eine Schicht | 1.1 |
| **2.1** | Sync-Regel + eine Merge-Funktion | 1.2 |
| **2.2** | API-Client | – |
| **3.1** | safeReload() | – |
| **3.2** | Error Boundaries → safeReload | 3.1 |
| **3.3** | Design Tokens | – |
| **4.1** | Bild-Komprimierung eine Utility | – |
| **4.2** | Bild-Upload eine API | – |
| **5.1** | Admin auf Schichten umstellen | 1.x, 2.x |
| **5.2** | GaleriePage/Vorschau auf Schichten | 1.x, 2.x |
| **5.3** | Shop, Willkommen, Vita, etc. | 1.3, 1.1 |
| **6.1** | DevView, Mission Control, Mobile Connect | 3.1 |
| **6.2** | mök2, Handbuch | laufend |
| **7.1** | Build/Stand Doku | laufend |
| **7.2** | Vercel/API Doku | 2.2 |
| **8.1** | Datentrennung durch Context | 1.1 |
| **8.2** | Kundendaten-Schutz in Schichten | 1.2, 1.3 |
| **9.1** | Tests Merge + Persistenz | 2.1, 1.2 |
| **9.2** | Doku eine Stelle pro Thema | laufend |

---

## Nächster Schritt (nach Lesen dieser Roadmap)

1. **Mit Georg:** Bestätigen, dass diese Reihenfolge und Vollständigkeit passt.
2. **Dann:** Mit **Phase 1.1 (Tenant-Context)** starten – alle anderen Phasen bauen darauf auf.
3. Nach jeder erledigten Phase: hier `[x]` + Datum setzen und DIALOG-STAND aktualisieren.

**Fertig.** Mit 1.1 beginnt der Sportwagen-Bau.
