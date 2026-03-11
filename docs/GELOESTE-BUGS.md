# Gelöste Bugs – Nachschlagewerk für AI (PFLICHT lesen bei Session-Start)

> **Automatische Tests:** `npm run test` (oder `npm test`) – läuft 21 Tests.
> **Tests laufen bei jedem Build automatisch** (in `npm run build` integriert).
> Test-Dateien: `src/tests/datentrennung.test.ts`, `kundendaten-schutz.test.ts`, `bild-upload.test.ts`

**Zweck:** Damit kein Bug zweimal auftaucht. Vor jeder Änderung an betroffenen Stellen: hier nachschauen.

**Einbindung in Qualitätsprozess:** Diese Liste ist Teil des Fehleranalyseprotokolls. Bei jeder Fehlermeldung von Georg prüft die KI zuerst hier (und ggf. CRASH-BEREITS-GEPRUEFT.md), ob gleicher oder ähnlicher Fehler schon vorkam. Siehe **docs/FEHLERANALYSEPROTOKOLL.md** (Abschnitt „Vergangene Fehler – Quellen“) und **.cursor/rules/qualitaet-bei-fehlermeldung.mdc**.

---

## BUG-031 · 5 Bilder (30–33, 38) kommen beim „An Server senden“ nicht mit
**Symptom:** Bilder am iPad drin und gespeichert, aber beim Senden und „Aktuellen Stand holen“ am Mac fehlen sie (30–33, 38).
**Ursache:** **getArtworkImageRefVariants** baut Suchvarianten aus number. Bei number **"K2-K-0030"** ist `digits` = "20030" (alle Ziffern) → Varianten k2-img-0030 und k2-img-30 fehlten. Liegt das Bild unter k2-img-0030 (z. B. nach Merge/Server), fand der Export es nicht.
**Lösung:** Wenn das K2-Muster (K2-X-NNNN) matcht, die Zifferngruppe (0030, 30) explizit als Varianten hinzufügen.
**Betroffene Dateien:** `src/utils/artworkImageStore.ts` (getArtworkImageRefVariants)
**Absicherung:** Test `src/tests/artworkImageStore.test.ts` – schlägt an, wenn K2-K-0030 wieder k2-img-20030 bekommt oder k2-img-0030/30 fehlt. Warn-Kommentar im Code. Bei Änderung an getArtworkImageRefVariants: Test muss grün bleiben.
**Status:** ✅ Behoben (11.03.26).

---

## BUG-030 · Neues Werk: „nicht in Liste gefunden“ – erst zweites Speichern nötig
**Symptom:** Beim Erstellen eines neuen Werks erscheint die Meldung „Werk wurde gespeichert, aber nicht in Liste gefunden“; erst beim **zweiten** Speichern funktioniert es.
**Ursache:** Direkt nach `saveArtworks()` prüft **verifyNewInStorage()** (sofort + 1× nach 100 ms), ob das neue Werk in localStorage steht. Auf Mobile/langsamen Geräten braucht localStorage/IndexedDB nach dem Schreiben einen Moment → Verifikation liest noch die alte Liste.
**Lösung:** Mehrere Retries (bis zu 4×) mit 150 ms Abstand vor dem Alert; Fehlermeldung angepasst: „Bitte einmal erneut auf Speichern tippen – dann erscheint es.“
**Betroffene Dateien:** `components/ScreenshotExportAdmin.tsx` (verifyNewInStorage)
**Status:** ✅ Behoben (11.03.26).

---

## BUG-029 · Mac blockiert 0030–0039 trotz neuer Bilder vom iPad
**Symptom:** Georg hatte überall (auch 30–39) neue Bilder eingefügt, am iPad sichtbar und gesendet – am Mac blieben 30–39 schwarz.
**Ursache:** In **preserveLocalImageData**: Wenn **lokal** (Mac) für ein Werk kein Bild hatte (`!localHasImage`), wurde das Merged-Item immer mit `imageUrl: '', imageRef: ''` zurückgegeben – auch wenn der **Server** (vom iPad) eine echte Bild-URL lieferte. So wurden die neuen Fotos für 30–39 auf dem Mac verworfen.
**Lösung:** Nur noch dann auf „kein Bild“ setzen, wenn **sowohl** lokal **als auch** Server keine echte URL haben (`!localHasImage && !serverHasRealUrl`). Hat der Server eine https-URL, wird sie übernommen.
**Betroffene Dateien:** `src/utils/syncMerge.ts` (preserveLocalImageData)
**Status:** ✅ Behoben (11.03.26).

---

## BUG-028 · iPad sendet → Mac/Handy bekommen Gesendetes nicht (seit 2 Tagen)
**Symptom:** „Es geht niemals das weg was am iPad vorhanden ist, und es kommt niemals das an was gesendet wurde.“ Nach „An Server senden“ vom iPad zeigt Mac/Handy nach „Aktuellen Stand holen“ nicht den gerade gesendeten Stand (falsche/fehlende Bilder, alter Stand).
**Ursache:** In **preserveLocalImageData** (syncMerge.ts) galt: Server-URL nur nutzen wenn **lokal keine** echte URL hatte (`useServerUrl = serverHasRealUrl && !localHasRealUrl`). Hatte der Mac von einem früheren Sync schon eine URL, wurde die **vom iPad frisch gesendete** Server-URL verworfen und die alte lokale beibehalten → „was gesendet wurde, kommt nicht an“.
**Lösung:** Wenn der **Server** eine echte Bild-URL (https) hat → **immer** Server-URL nehmen (damit Gesendetes ankommt). Lokales Bild nur behalten, wenn der Server **keine** URL hat. Regel: `imageUrl = serverHasRealUrl ? item.imageUrl : (local.imageUrl ?? item.imageUrl)` (analog imageRef, previewUrl).
**Betroffene Dateien:** `src/utils/syncMerge.ts` (preserveLocalImageData)
**Doku:** PROZESS-VEROEFFENTLICHEN-LADEN.md, BUG-021 (Ergänzung: Server hat Vorrang wenn Server URL hat)
**Status:** ✅ Behoben (11.03.26).

---

## BUG-027 · Brief an Andreas – weiße Seite nach „Wird geladen“
**Symptom:** Brief öffnet kurz, zeigt „Wird geladen …“, dann weißer Bildschirm, Tab hängt.
**Ursache:** Endlosschleife im Markdown-Parser (renderBoldItalic): Rest wie `**` wurde nicht konsumiert → gleiche Iteration endlos. Auslöser z. B. `**→ [Link](…)**` – nach dem Link blieb `**`.
**Lösung:** Beim Abarbeiten von \*\*/\* mindestens 1 Zeichen (bzw. 2 bei `**`) konsumieren; try/catch + Fehlerzustand bei Fetch/Render.
**Betroffene Dateien:** `src/pages/BriefAnAndreasPage.tsx`
**Status:** ✅ Behoben (11.03.26).

---

## BUG-026 · „Vom Server laden“ – nach Erfolgsmeldung/Schließen keine Werke mehr sichtbar
**Symptom:** User klickt „Vom Server laden“ / „Aktuellen Stand holen“, bekommt Meldung „Daten vom Server geladen (Stand: …)“; beim Schließen oder danach sind **keine Werke mehr vorhanden** („Noch keine Werke vorhanden“).
**Ursache:** **Race:** handleRefresh setzte die Erfolgsmeldung und rief `loadArtworksResolvedForDisplay().then(setArtworksDisplay, setLoadStatus)` auf, beendete den try-Block aber sofort – **finally** setzte `setIsLoading(false)` bevor das .then() lief. Dadurch: `artworks` blieb leer, `isLoading` wurde false → useEffect „wenn leer und !isLoading“ lud erneut; in dem Moment konnte die Anzeige leer bleiben oder überschrieben werden.
**Lösung:** In **GalerieVorschauPage** handleRefresh: Nach Speichern (und in allen Zweigen wo die Anzeige aktualisiert wird) **await loadArtworksResolvedForDisplay()** und **dann** setArtworksDisplay + setLoadStatus aufrufen. So wird die Anzeige gesetzt, **bevor** finally (setIsLoading(false)) läuft – kein Race mehr.
**Betroffene Dateien:** `src/pages/GalerieVorschauPage.tsx` (handleRefresh: Erfolgszweig, Server-leer, Server-weniger, API-nicht-ok, catch, keine Werke in Datei)
**Status:** ✅ Behoben (10.03.26).

---

## BUG-023 · Sync iPad ↔ Mac: „Vom Server laden“ zeigt nicht den frisch vom iPad veröffentlichten Stand
**Symptom:** Synchronisierung der Daten zwischen iPad und Mac funktioniert weiterhin nicht – am Mac kommt nach „Vom Server laden“ nicht der Stand an, den das iPad gerade veröffentlicht hat.
**Ursache:** **Few-Works-Fallback:** Wenn die API (Blob) 200 mit wenigen Werken (≤15) lieferte, wurde die Antwort durch die **statische** `gallery-data.json` (Build-Stand) ersetzt, sobald die mehr Werke hatte. Dadurch konnte der frisch vom iPad veröffentlichte Blob-Inhalt durch den älteren Build-Stand überschrieben werden → zwei Quellen (Blob + statische Datei) vermischt.
**Lösung:** API (Blob) = **einzige** Quelle beim „Vom Server laden“. Den Fallback „API ≤15 Werke → statische Datei nutzen wenn mehr“ in **GaleriePage** (loadData) und **GalerieVorschauPage** (handleRefresh) entfernt. Kein Ersetzen der API-Antwort durch die statische Datei mehr.
**Betroffene Dateien:** `src/pages/GaleriePage.tsx`, `src/pages/GalerieVorschauPage.tsx`, `docs/PROZESS-VEROEFFENTLICHEN-LADEN.md`
**Status:** ✅ Behoben (10.03.26).

---

## BUG-024 · „Bilder 0030–0039 bereinigen“ – Bilder bleiben in der Anzeige
**Symptom:** Nach Klick auf „Bilder 0030–0039 bereinigen“ (lokal, IndexedDB, Supabase, GitHub erfolgreich gemeldet) sind die Bilder in der Galerie weiterhin sichtbar. Auch „nach dutzenden Versuchen“ (Georg).
**Ursache:** (1) **Merge:** preserveLocalImageData gab bei lokal leerem Bild unverändert das Server-Item zurück → alte Server-URL blieb erhalten. (2) **Reload nach Event:** GalerieVorschauPage lud nach `artworks-updated` aus Supabase; Race oder alter Supabase-Stand konnte den gerade gespeicherten lokalen Stand überschreiben. (3) **Admin-Fallback:** lastSavedArtworkImageRef setzte für Werke ohne/kleines imageUrl ein „zuletzt gespeichertes“ Bild ein – damit wurden auch bewusst bereinigte Werke (30–39) wieder mit einem Bild gefüllt.
**Lösung:** (1) **syncMerge.ts** preserveLocalImageData: Wenn lokal kein Bild (`!localHasImage`), Merged-Item explizit ohne Bild setzen. (2) **Nach Bereinigung:** Admin sendet `artworks-updated` mit `detail: { fromBereinigung: true }`; GalerieVorschauPage lädt nur aus localStorage. (3) **Admin:** Bei fromBereinigung lastSavedArtworkImageRef = null; beim Einsetzen des Fallback-Bildes Werke mit Nummer 30–39 nie befüllen; im Bereinigen-Button nach Speichern Ref auf null setzen.
**Ergänzung (10.03.26):** Bilder blieben weiter sichtbar. (4) **Export:** resolveImageUrlForSupabase lieferte für 30–39 noch URLs (bestehende https-URL oder Supabase-Fallback) → veröffentlichte gallery-data enthielt wieder Bilder. (5) **Admin iframe:** setAllArtworksSafe setzte im iframe-Zweig das „last saved“-Bild auch für 30–39 ein. **Zusatz-Fix:** In supabaseClient.ts resolveImageUrlForSupabase zuerst prüfen: Nummer im Bereich 30–39 → sofort undefined (kein Bild beim Export). In setAllArtworksSafe (iframe): für Werke 30–39 nie url aus last-Bild-Map einsetzen.
**Betroffene Dateien:** `src/utils/syncMerge.ts`, `src/utils/supabaseClient.ts` (resolveImageUrlForSupabase, isArtworkNumberInRange30_39), `components/ScreenshotExportAdmin.tsx` (Bereinigen-Handler, handleArtworksUpdate, storage-Listener, lastSavedArtworkImageRef-Logik, setAllArtworksSafe iframe-Zweig), `src/pages/GalerieVorschauPage.tsx` (handleArtworksUpdate)
**Doku:** docs/FEHLERANALYSEPROTOKOLL.md (Protokoll-Einträge 10.03.26)
**Status:** ✅ Behoben (10.03.26, Ergänzung 10.03.26).

---

## BUG-025 · Galerie zeigt „Kein Bild“ / viele Keramik-Bilder fehlen (trotz Bild in Werken / auf Vercel)
**Symptom:** (1) In der Galerie fehlen Fotos, die in den Werken (Admin) vorhanden sind (z. B. K2-K-0013, K2-K-0014). (2) „Viele Keramik-Bilder fehlen“ in der Galerie. (3) Folge einer längeren Fehlersuche (~5 Std).
**Ursache:** (1) **resolveArtworkImages** im catch-Zweig: Bei Fehler (z. B. IndexedDB) wurde Werk unverändert gepusht → ohne imageUrl. (2) **Fallback nur bei imageRef:** Wenn Werke **keinen** imageRef hatten (z. B. nach Merge, älterem Stand), wurde keine Vercel-URL gesetzt → nur Platzhalter. Viele Keramik-Werke haben in den Daten keinen imageRef; die Dateien (werk-K2-K-xxxx.jpg) liegen aber in public/img/k2/.
**Lösung:** (1) artworkImageStore: Im catch dieselbe Vercel-Fallback-URL für Nicht-30–39 setzen wie im try. (2) **Fallback aus number/id:** getVercelFallbackIdFromArtwork; in resolveArtworkImages im else-Zweig (kein imageRef) für Werke mit Nummer K2-X-NNNN (nicht 30–39) Vercel-URL bauen. (3) GalerieVorschauPage loadArtworksResolvedForDisplay: Fallback aus imageRef; zusätzlich Fallback aus number/id, wenn noch kein Bild.
**Betroffene Dateien:** `src/utils/artworkImageStore.ts`, `src/pages/GalerieVorschauPage.tsx`
**Doku:** docs/FEHLERANALYSE-10-03-26-GALERIE-BILDER-STAND.md
**Status:** ✅ Behoben (10.03.26).

---

## BUG-022 · ök2 Willkommensbild – Uraltbild auf erster Seite (zweites Mal)
**Symptom:** Auf der ersten Seite der ök2-Demo (Willkommen) erscheint ein altes/irrelevantes Bild („Uraltbild“), obwohl das Problem schon einmal behoben worden war.
**Ursache:** Default für das ök2-Willkommensbild war wieder ein **Repo-Dateipfad** (`/img/oeffentlich/willkommen.jpg`). Diese Datei kann veraltet sein oder ausgetauscht werden – dann sieht jeder die alte Version. Beim ersten Mal (BUG-020) ging es um Upload-Überschreibung; hier geht es um den **Default** selbst.
**Lösung:** (1) **Default = stabile URL** (Unsplash) in OEK2_WILLKOMMEN_IMAGES.welcomeImage – keine Repo-Datei mehr als Default. (2) **Legacy-Pfade:** OEK2_LEGACY_WELCOME_IMAGE_PATHS listet Pfade, die nie angezeigt werden; getOek2WelcomeImageEffective() filtert sie. (3) **Regel:** .cursor/rules/oek2-willkommensbild-nie-uraltbild.mdc (alwaysApply) – Default nie wieder auf Repo-Datei umstellen, Legacy-Liste nutzen.
**Betroffene Dateien:** `src/config/tenantConfig.ts`, `src/pages/GaleriePage.tsx`, `.cursor/rules/oek2-willkommensbild-nie-uraltbild.mdc`
**Status:** ✅ Behoben (08.03.26). **Wichtig:** Regel einhalten, sonst tritt der Fehler ein drittes Mal auf.

---

## BUG-021 · Werk-Fotos nach Freistellung/Speichern wieder weg oder Platzhalter
**Symptom:** Werk-Fotos werden teilweise nicht mehr angezeigt (Platzhalter mit ID). Freistellung funktioniert, dauert lange – danach sind die Bilder wieder wie vorher (Speicherung hält nicht).
**Ursache:** Beim Laden vom Server (gallery-data API) kommen Werke **ohne** Bilddaten (Export streicht Base64 für kleine Payloads). Der Merge (Server = Quelle) hat die Server-Version übernommen und damit **lokale imageUrl/imageRef überschrieben** → gespeicherte Fotos/Freistellungen gingen verloren.
**Lösung:** Nach dem Merge **lokale Bilddaten erhalten**, wenn die Server-Version kein Bild hat: `preserveLocalImageData(merged, localArtworks)` in `syncMerge.ts`; Aufruf in GaleriePage an beiden Stellen (handleRefresh + Initial-Load) vor `saveArtworksForContext`. So werden imageUrl, imageRef und previewUrl vom lokalen Werk übernommen, sobald der Server-Eintrag kein Bild liefert.
**Ergänzung (06.03.26):** Platzhalter blieben sichtbar, wenn Werke mit **imageRef = URL** (Supabase/Vercel) geladen wurden – `resolveArtworkImages` nutzte nur IndexedDB. Fix: In `artworkImageStore.ts` wird imageRef, sofern es mit `http://` oder `https://` beginnt, direkt als imageUrl verwendet → echte Bilder statt Platzhalter.
**Ergänzung 2 (06.03.26):** Admin-Werkliste zeigte viele „Kein Bild“: Nach GitHub-Upload wurde nur **imageUrl = url** gesetzt, nicht **imageRef**. Beim Reload/anderem Gerät blieb nur imageRef = k2-img-xxx, IndexedDB dort leer → Platzhalter. Fix: In ScreenshotExportAdmin beim Speichern nach Upload auch **imageRef = url** setzen (artworkData + updatedArtworks), damit die URL dauerhaft in den Daten steht und resolveArtworkImages sie überall nutzen kann.
**Ergänzung 3 (07.03.26):** Nach „Bilder vom Server laden“ oder Merge waren überall wieder **Originale** statt Freistellungen. Ursache: preserveLocalImageData übernahm lokale Bilder nur, wenn das gemergte Werk **kein** Bild hatte – lieferte der Server aber z. B. Original-URLs aus gallery-data, galt das als „hat Bild“ und lokale Freistellung wurde verworfen. Fix: Lokale Bilddaten **immer** übernehmen, sobald lokal ein Bild (imageUrl oder imageRef) vorhanden ist – unabhängig vom Server-Eintrag. So gehen Freistellungen bei Merge/Server-Load nicht mehr verloren.
**Betroffene Dateien:** `src/utils/syncMerge.ts` (preserveLocalImageData), `src/pages/GaleriePage.tsx` (beide Merge-Pfade), `src/utils/artworkImageStore.ts` (resolveArtworkImages), `components/ScreenshotExportAdmin.tsx` (Upload-Block: imageRef = url)
**Status:** ✅ Behoben (05.03.26, Ergänzung 06.03.26, 07.03.26)

---

## BUG-020 · Test-Foto (Michal) auf Entdecken-Seite („Katastrophe“)
**Symptom:** Beim Prüfen des Zutritts für Fremde erschien auf der Landing (/entdecken) ein Test-Foto (Michals Porträt) statt eines neutralen Bildes – gleiche Datei wie Demo-Willkommensbild.
**Ursache:** Ein Asset, zwei Zwecke: `/img/oeffentlich/willkommen.jpg` wurde sowohl von der **EntdeckenPage** (global) als auch vom **ök2-Admin-Upload** (Willkommensbild) genutzt. Upload überschrieb die Datei → alle sahen das Test-Foto.
**Lösung:** (1) EntdeckenPage nutzt nur **willkommen.svg** (fest, nie überschrieben). (2) Admin-Upload für ök2 schreibt in **willkommen-demo.jpg**, nie in willkommen.jpg. Regel: Ein Asset, ein Zweck (siehe docs/LEAK-PRUEFUNG-ASSETS.md).
**Betroffene Dateien:** `src/pages/EntdeckenPage.tsx`, `components/ScreenshotExportAdmin.tsx` (welcomeFilename), `docs/LEAK-PRUEFUNG-ASSETS.md`
**Status:** ✅ Behoben (05.03.26)

---

## BUG-019 · QR trotz Gleichstand: Musterbilder / Daten durcheinander
**Symptom:** Nach „Jetzt an Server senden“ und Gleichstand zeigt der QR-Scan auf dem Handy trotzdem Musterwerke oder falsche Daten.
**Ursache:** API-Aufruf ohne explizites tenantId → theoretisch Mehrdeutigkeit; Server-Daten wurden ohne Kontext-Check angewendet.
**Lösung:** (1) Beim Laden von gallery-data **immer** `tenantId=k2` in der URL für die K2-Galerie (`/api/gallery-data?tenantId=k2&...`). (2) Beim Anwenden der Server-Daten: Nur wenn `!musterOnly && !vk2` – sonst `data = null` und nichts in K2-Keys schreiben. So liefert der QR exakt die gleichen Daten wie der Mac; keine Muster/ök2-Daten in der K2-Ansicht.
**Betroffene Dateien:** `src/pages/GaleriePage.tsx` (loadData, handleRefresh: tenantId=k2; Guard beim Anwenden)
**Status:** ✅ Behoben (03.03.26)

---

## BUG-018 · QR / Handy zeigt immer alte Daten („nie in den Griff bekommen“)
**Symptom:** Nach „Jetzt an Server senden“ am Mac zeigt das Handy (QR-Scan oder Galerie öffnen) weiterhin alte Werke/Daten – essenzielles Problem, nie zuverlässig gelöst.
**Ursache:** In GaleriePage loadData wurde auf dem **Handy** (vercel.app) **zuerst** die **statische** Datei `/gallery-data.json` geladen (relative URL). Diese Datei kommt aus dem **Build** (dist/), nicht aus dem Blob. „Veröffentlichen“ schreibt aber in **Vercel Blob** (API write-gallery-data). Die Lese-API `/api/gallery-data` liest aus dem Blob. Wer zuerst die statische Datei lädt, bekommt immer den **alten** Build-Stand.
**Lösung:** **Immer zuerst** `GET /api/gallery-data` (Blob = aktuelle Daten). Nur bei Fehler Fallback auf `/gallery-data.json`. In loadData (Initial-Load) die Reihenfolge geändert: zuerst apiUrl für **alle** (nicht nur localhost), dann pathAndQuery nur als Fallback.
**Betroffene Dateien:** `src/pages/GaleriePage.tsx` (loadData – Reihenfolge API vor static)
**Doku:** `docs/STAND-BUILD-VS-DATEN.md` Abschnitt „ESSENZIELL: Eine Quelle = API (Blob)“
**Status:** ✅ Behoben (03.03.26)

---

## BUG-017 · „Daten an Server senden“ auf iPad zeigt nur „prüfen ob vercel.app geöffnet“, nicht den echten Fehler
**Symptom:** Beim 1. Versuch „Daten an Server senden“ auf iPad: Fehlermeldung „Daten konnten nicht an den Server gesendet werden … Prüfen ob k2-galerie.vercel.app geöffnet ist“ – der tatsächliche Grund (z. B. GITHUB_TOKEN fehlt, Zeitüberschreitung) wurde nicht angezeigt.
**Ursache:** Auf Mobil/Vercel wurde bei API-Fehler immer eine generische Alert-Meldung gezeigt, ohne `result.error` und `result.hint` einzubauen.
**Lösung:** In der Alert-Meldung für Mobil/Vercel den echten Grund anzeigen: `Grund: ${errMsg} ${hint}`. Zusätzlich Hinweis: „Steht GITHUB_TOKEN fehlt → in Vercel unter Einstellungen Token setzen.“
**Betroffene Dateien:** `components/ScreenshotExportAdmin.tsx` (publishMobile, apiPost-.then, Alert bei isMobileDevice/isVercelOrProduction)
**Status:** ✅ Behoben (28.02.26)

---

## BUG-016 · „Daten an Server senden“ auf Mobil öffnet gallery-data.json-Seite
**Symptom:** Auf dem iPad/Handy auf „📤 Daten an Server senden“ tippen → statt Erfolg oder Fehlermeldung öffnet sich eine Seite mit dem rohen JSON (gallery-data.json).
**Ursache:** Wie BUG-015: Bei API-Fehler wurde ein Fallback genutzt (Blob + Download-Link + link.click()). Auf Mobil interpretieren Browser das oft als „Seite öffnen“ → JSON wird als Seite angezeigt.
**Lösung:** Im catch von publishMobile: Wenn Gerät Mobil ist (iPhone|iPad|iPod|Android), **niemals** link.click() mit der JSON – nur eine klare Alert-Meldung anzeigen („Daten konnten nicht gesendet werden … Einfach OK – du bleibst in der App.“). Fallback-Download nur am Mac/Desktop.
**Betroffene Dateien:** `components/ScreenshotExportAdmin.tsx` (publishMobile, catch-Block, isMobileDevice-Check)
**Status:** ✅ Behoben (27.02.26)

---

## BUG-015 · Beim Klick „Werke speichern“ öffnet sich gallery-data.json in neuem Tab
**Symptom:** Auf „Werke speichern“ klicken → eine Seite mit gallery-data.json (roher JSON-Text) öffnet sich, Nutzer muss schließen und über Umwege zurück.
**Ursache:** Nach dem Speichern wird automatisch `publishMobile({ silent: true })` aufgerufen. Schlägt die API fehl, gab es einen Fallback: Blob-URL + programmatischer Klick auf einen Download-Link. Auf iPad/Safari öffnet das oft die JSON in einem neuen Tab statt sie herunterzuladen.
**Lösung:** Bei `silent === true` (automatischer Sync nach „Werke speichern“) keinen Fallback-Download mehr – weder link.click() noch neuer Tab. Nur isDeploying zurücksetzen und in der Konsole loggen. Fallback-Download nur bei explizitem „Veröffentlichen“ (nicht silent).
**Betroffene Dateien:** `components/ScreenshotExportAdmin.tsx` (publishMobile, catch-Block)
**Status:** ✅ Behoben (27.02.26)

---

## BUG-014 · In Vorschau nur „?“ statt Bild nach Werk auf iPad fotografieren
**Symptom:** Werk auf iPad fotografieren, ausfüllen, speichern → in der Vorschau erscheint nur „?“ (kaputtes Bild) statt des Fotos.
**Ursache:** Wenn das Bild als `blob:`-URL gespeichert oder angezeigt wird, ist die URL in der Vorschau oft ungültig (z. B. nach Navigation/Reload). Der Browser zeigt dann das kaputte-Bild-Symbol („?“).
**Lösung:** In GalerieVorschauPage bei der Werkkarten-Anzeige: `blob:`-URLs wie „kein Bild“ behandeln → sofort Platzhalter „Kein Bild“ anzeigen, kein `<img src="blob:...">` (dadurch kein „?“).
**Betroffene Dateien:** `src/pages/GalerieVorschauPage.tsx` (rawSrc vor displaySrc prüfen, blob: auf '' setzen)
**Status:** ✅ Behoben (27.02.26)

---

## BUG-012 · Neu angelegtes Werk (Mac, Bild aus Datei) verschwindet nach „Zur Galerie“
**Symptom:** Werk im Admin speichern (auch am Mac, Bild aus Datei) → „Zur Galerie“ klicken → Werk ist weg.
**Ursache:** GaleriePage lädt gallery-data.json und merged Server + lokal. Lokale Werke, die **nicht** auf dem Server standen, wurden nur in merged übernommen wenn `isMobileWork && isVeryNew`. Am Mac gespeicherte Werke haben `createdOnMobile: false` → kamen nur in toHistory, nicht in merged → beim Schreiben von merged in localStorage gingen sie verloren.
**Lösung:** In GaleriePage an beiden Merge-Stellen (loadData + Initial-Load): Wenn ein lokales Werk nicht auf dem Server ist, **immer** `merged.push(local)` (nicht nur bei Mobile+sehr neu). toHistory für Logging unverändert.
**Betroffene Dateien:** `src/pages/GaleriePage.tsx` (Merge mit serverArtworks)
**Commit:** (27.02.26)
**Status:** ✅ Behoben

---

## BUG-013 · Altes iPad-Werk verschwindet am iPad nach zeitverzögertem „Vom Server laden“
**Symptom:** Werk vor einiger Zeit am iPad erstellt → am Mac erscheint es (z. B. aus gallery-data.json); am iPad ist es plötzlich weg. Nutzer vermutet: „Prozess im Hintergrund zeitverzögert“.
**Ursache:** In GalerieVorschauPage läuft bei „Vom Server laden“ (handleRefresh / Stand-Badge / Aktualisieren) eine Merge-Logik: Start mit Server-Werken, lokale nur hinzufügen wenn `isMobileWork && isVeryNew` (< 10 Min). Ältere lokale Werke (nicht auf Server) landeten nur in toHistory, nicht in merged → beim Speichern von merged gingen sie am iPad verloren.
**Lösung:** Gleiche Regel wie BUG-012 (GaleriePage): Lokale Werke, die **nicht** auf dem Server sind, **immer** in merged übernehmen (nicht nur bei „very new“). In GalerieVorschauPage handleRefresh-Merge: `if (!serverArtwork) { mergedArtworks.push(localArtwork); … }`.
**Betroffene Dateien:** `src/pages/GalerieVorschauPage.tsx` (handleRefresh, Merge mit serverArtworks)
**Status:** ✅ Behoben (27.02.26)

---

## BUG-001 · Bilder in Seitengestaltung verschwinden (localStorage-Verlust)
**Symptom:** Willkommensbild, Galerie-Karte, Rundgang-Bild verschwinden nach einiger Zeit.
**Ursache:** Bilder wurden als Base64 im localStorage gespeichert. Bei vollem Speicher (QuotaExceeded) → SafeMode löscht andere Keys → Bilder weg.
**Lösung:** Nach Upload → GitHub/Vercel hochladen → Vercel-Pfad (`/img/k2/` oder `/img/oeffentlich/`) im localStorage speichern statt Base64.
**Betroffene Dateien:**
- `src/utils/githubImageUpload.ts` → `subfolder` Parameter hinzugefügt
- `components/ScreenshotExportAdmin.tsx` → `uploadPageImageToGitHub` für ök2 aktiviert, `pendingWelcomeFileRef` für ök2 aktiviert
**Commit:** c627076 · 23.02.26
**Status:** ✅ Behoben – gilt für K2 + ök2 (VK2 speichert lokal, kein GitHub-Upload)

---

## BUG-002 · VK2 Mitglieder-Vorschau zeigt K2-Werke statt Mitglieder
**Symptom:** Auf `/projects/vk2/galerie-vorschau` wurden K2-Kunstwerke angezeigt, nicht VK2-Mitglieder.
**Ursache:** `GalerieVorschauPage.tsx` hatte zwei große `useEffect`-Blöcke (Supabase + gallery-data.json) die K2-Artworks luden – ohne `if (vk2) return` Guard.
**Lösung:** Komplett neue eigenständige Komponenten `Vk2GaleriePage.tsx` + `Vk2GalerieVorschauPage.tsx` – laden NUR aus `k2-vk2-stammdaten`, keine K2/ök2-Keys.
**Betroffene Dateien:**
- `src/pages/Vk2GaleriePage.tsx` (NEU)
- `src/pages/Vk2GalerieVorschauPage.tsx` (NEU)
- `src/App.tsx` → Routen auf neue Komponenten umgestellt
**Commit:** 63b3400 · 23.02.26
**Status:** ✅ Behoben – NIEMALS wieder `<GalerieVorschauPage vk2 />` verwenden

---

## BUG-003 · VK2 Willkommensseite zeigt hardcodierten Text statt Admin-Eingaben
**Symptom:** Egal was im Admin eingegeben wurde – VK2-Willkommen zeigte immer „VK2 Vereinsplattform" und „Unsere Mitglieder".
**Ursache:** Text war in JSX hardcodiert, nicht dynamisch aus `galerieTexts` / `displayGalleryName`.
**Lösung:** Durch neue Vk2GaleriePage komplett behoben – lädt immer aus `k2-vk2-page-texts`.
**Commit:** 63b3400 · 23.02.26
**Status:** ✅ Behoben

---

## BUG-005 · Neu angelegte Werke verschwinden nach Rückkehr in die Verwaltung
**Symptom:** Zwei Werke in Galerievorschau angelegt, überall sichtbar – nach Wechsel in Admin/Verwaltung waren sie weg.
**Ursache:** (1) Beim Laden aus Supabase wurde localStorage mit Supabase-Liste überschrieben – Supabase hatte die neuen Werke noch nicht (nur lokal gespeichert). (2) Beim Laden aus localStorage wurde gefilterte Liste (Muster/VK2 raus) zurück in localStorage geschrieben und konnte Werke reduzieren. (3) Mobile-Polling (gallery-data.json) konnte mit weniger Werken überschreiben.
**Lösung:** (1) Supabase: Wenn Supabase weniger Werke liefert als aktuell in localStorage, localStorage nicht überschreiben, lokale Daten behalten. (2) Beim Laden aus localStorage gefilterte Liste nicht mehr zurückschreiben (nur Anzeige filtern, Regel „niemals still löschen“). (3) syncFromGalleryData: Nur schreiben wenn toSave.length >= localCount. (4) Admin: Werke nach 0,4 s statt 3 s laden.
**Betroffene Dateien:** `src/pages/GalerieVorschauPage.tsx`, `components/ScreenshotExportAdmin.tsx`
**Commit:** (27.02.26)
**Status:** ✅ Behoben

---

## BUG-011 · iPad-Chaos: neues Werk weg, Musterwerke wieder da, Ersetzen übernimmt nicht
**Symptom:** Am iPad: Verwaltung zeigt keine Musterbilder, Galerie schon; neues Werk erstellt → unter dem Werk öffnet sich 0001; Werk ersetzen nimmt nicht (altes bleibt); in Galerie neues Werk nicht sichtbar; zurück in Verwaltung → Musterwerke wieder da, eigenes Werk weg.
**Ursache:** (1) **Admin loadArtworks() (ök2):** Gefilterte Liste (K2-M-/K2-K- entfernt) wurde in localStorage geschrieben → beim nächsten Laden weniger Werke. (2) **GalerieVorschauPage syncFromGalleryData:** Bei „Keine Server-Daten“ / „Server nicht erreichbar“ / Fehler wurde filterK2ArtworksOnly(localArtworks) in localStorage geschrieben; wenn Filter Werke entfernt, Reduktion. (3) Regel verletzt: niemals still mit weniger Werken überschreiben.
**Lösung:** (1) Admin: Im ök2-Kontext nur Anzeige filtern, **kein** setItem nach Filter – localStorage bleibt unverändert. (2) GalerieVorschauPage: Bei „Keine Server-Daten“ und „Server nicht erreichbar“ nur setItem wenn toKeep.length >= localArtworks.length; bei Fehler-Polling gar kein setItem, nur setArtworks für Anzeige. (3) Kein automatisches Überschreiben mit weniger Werken (eine Quelle, keine stillen Löschungen).
**Betroffene Dateien:** `components/ScreenshotExportAdmin.tsx` (loadArtworks), `src/pages/GalerieVorschauPage.tsx` (syncFromGalleryData)
**Commit:** (27.02.26)
**Status:** ✅ Behoben

---

## BUG-004 · Admin-Kontext-Vergiftung (K2 sieht ök2-Daten nach Kontextwechsel)
**Symptom:** Nach Besuch von `/admin?context=oeffentlich` → nächster Admin-Aufruf ohne `?context=` → K2-Fotos wurden in ök2-Keys gespeichert.
**Ursache:** `sessionStorage['k2-admin-context']` blieb auf `'oeffentlich'` hängen.
**Lösung:** `syncAdminContextFromUrl()` löscht den Key wenn kein `?context=`-Parameter vorhanden. Außerdem: `isOeffentlichAdminContext()` prüft zuerst URL, dann sessionStorage.
**Betroffene Dateien:** `components/ScreenshotExportAdmin.tsx` Zeile 28-43
**Commit:** (in früherer Session)
**Status:** ✅ Behoben – NIEMALS sessionStorage-Kontext ohne URL-Prüfung vertrauen

---

## BUG-005 · VK2 Demo-Mitglieder ohne Fotos (leere Karten)
**Symptom:** VK2-Mitglieder-Karten zeigten nur Namen, kein Foto, kein Werkbild.
**Ursache:** `VK2_DEMO_STAMMDATEN` hatte keine `mitgliedFotoUrl` / `imageUrl`.
**Lösung:** SVG Data-URL Generatoren `_mkPortrait()` + `_mkWerk()` in `tenantConfig.ts`. `initVk2DemoStammdatenIfEmpty()` füllt Fotos nach wenn Vereinsname = „Kunstverein Muster" und Foto fehlt.
**Betroffene Dateien:** `src/config/tenantConfig.ts`
**Commit:** de75451 · 23.02.26
**Status:** ✅ Behoben

---

## BUG-006 · QR-Code auf Handy zeigt alte Version (Cache)
**Symptom:** Nach Deployment zeigt Handy via QR noch alte Version.
**Ursache:** QR-URL hatte nur lokalen BUILD_TIMESTAMP – kein Server-Stand, kein Cache-Bust.
**Lösung:** `buildQrUrlWithBust(url, useQrVersionTimestamp())` aus `src/hooks/useServerBuildTimestamp.ts` – hängt Server-Timestamp + `&_=Date.now()` an.
**Betroffene Dateien:** `src/pages/GaleriePage.tsx`, `src/pages/PlatformStartPage.tsx`, `src/pages/MobileConnectPage.tsx`
**Regel:** `.cursor/rules/stand-qr-niemals-zurueck.mdc`
**Status:** ✅ Behoben – NIEMALS nur `urlWithBuildVersion()` für QR verwenden

---

## BUG-007 · Reload-Loop → Cursor Crash (Code 5)
**Symptom:** App lädt sich selbst neu → Loop → Cursor/Preview crasht (Code 5).
**Ursache:** Automatischer Reload wenn „Server neuer als lokaler Stand" → in Cursor Preview (iframe) → Loop.
**Lösung:** Kein automatischer Reload. Nur Badge/Button anzeigen, Nutzer tippt manuell.
**Regel:** `.cursor/rules/code-5-crash-kein-auto-reload.mdc`
**Status:** ✅ Behoben – NIEMALS `setTimeout(() => location.reload(), ...)` bei Stand-Vergleich

---

## BUG-008 · Admin Input-Felder unleserlich (weiß auf hellem Hintergrund)
**Symptom:** Stammdaten-Felder im VK2-Admin waren nicht lesbar.
**Ursache:** Schriftfarbe war weiß, Hintergrund hell (WERBEUNTERLAGEN_STIL).
**Lösung:** `color: s.text` für Input-Felder im Admin.
**Regel:** `.cursor/rules/ui-kontrast-lesbarkeit.mdc`
**Status:** ✅ Behoben

---

## BUG-009 · APf zeigt falsche Seite beim Zurückkommen
**Symptom:** Beim Zurückkehren zur APf wird eine andere Seite angezeigt als zuletzt bearbeitet.
**Ursache:** `useEffect` für `pageFromUrl` feuerte auch bei leerem `pageFromUrl` (null) und überschrieb dadurch die gespeicherte Seite aus `k2-apf-last-page`.
**Lösung:** Guard `if (pageFromUrl && pageFromUrl.trim())` – nur setzen wenn wirklich ein URL-Parameter vorhanden.
**Betroffene Dateien:** `src/pages/DevViewPage.tsx` Zeile ~134
**Commit:** 9909a61 · 24.02.26
**Status:** ✅ Behoben

---

## BUG-010 · Foto in mök2/VK2 verschwindet nach Speichern
**Symptom:** Foto wird hochgeladen, kurz sichtbar, dann weg (bleibt nur in Vorschau).
**Ursache:** Base64-Komprimierung zu schwach (maxW 1200px, Qualität 0.85) → große Datenmenge → localStorage läuft voll → Foto fällt weg.
**Lösung:** Komprimierung verschärft: maxW 600px, Qualität 0.55 (Fallback 0.4). Reicht für Vorschau, passt zuverlässig in localStorage.
**Betroffene Dateien:** `src/pages/MarketingOek2Page.tsx` `compressImageAsDataUrl()`
**Commit:** 9909a61 · 24.02.26
**Status:** ✅ Behoben

---

## Checkliste bei Session-Start (PFLICHT)

- [ ] Diese Datei gelesen?
- [ ] `docs/DIALOG-STAND.md` gelesen (wo waren wir)?
- [ ] `docs/GRAFIKER-TISCH-NOTIZEN.md` gelesen (offene Wünsche)?
- [ ] Letzten Commit mit `git log --oneline -5` geprüft?

## Regel für neue Bugs

Wenn ein Bug behoben wird: **sofort hier eintragen** bevor die Antwort an Georg geht.
Format: BUG-NNN · Titel · Symptom · Ursache · Lösung · Datei · Commit · Status

**Gleiche Problemstellung = ein Standard** – verschiedene Wege für dieselbe Aufgabe sind Fehlerquellen. Siehe **.cursor/rules/ein-standard-problem.mdc** und **docs/00-INDEX.md** (Prinzipien & Regeln).
