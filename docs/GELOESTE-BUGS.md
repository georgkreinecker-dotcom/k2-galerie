# Gelöste Bugs – Nachschlagewerk für AI (PFLICHT lesen bei Session-Start)

> **Automatische Tests:** `npm run test` (oder `npm test`) – läuft 21 Tests.
> **Tests laufen bei jedem Build automatisch** (in `npm run build` integriert).
> Test-Dateien: `src/tests/datentrennung.test.ts`, `kundendaten-schutz.test.ts`, `bild-upload.test.ts`

**Zweck:** Damit kein Bug zweimal auftaucht. Vor jeder Änderung an betroffenen Stellen: hier nachschauen.

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
