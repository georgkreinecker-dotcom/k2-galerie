# Dialog-Stand

**Letzter Stand:** 23.03.26 – **ök2 Werkkatalog: 2 fehlende Vorschaubilder (M1, G1):** **`resolveArtworkImages`** setzte bei Musterwerken mit **`imageRef`** absichtlich **`imageUrl: ''`** (kein IDB-Lookup) – Werkkatalog zeigt nur **`imageUrl`** → leere Zelle. **Fix:** **`getOek2DefaultArtworkImage(category)`** als **`imageUrl`**, **`imageRef`** bleibt. **`artworkImageStore.ts`**, Test **`artworkImageStore.test.ts`**. K2-Kern unberührt (`isOek2MusterArtwork` nur Demo-Nummern). Tests + Build grün. **Commit:** b6a6542 ✅ nach Push

**Vorher:** 22.03.26 – **Admin-Hub:** Hinweiszeile **„🔗 Ein Bereich, ein Ablauf“** (grüne Karte unter den Hub-Kacheln) entfernt – **Georg:** nicht mehr nötig. **ScreenshotExportAdmin.** Tests + Build grün. **Commit:** 90fb394 ✅ auf GitHub

**Vorher:** 21.03.26 – **Werkkatalog ök2 = Sparte wie „Werke verwalten“:** **WerkkatalogTab** – `getEffectiveDirectionFromWork`, `getCategoriesForDirection`, `getShopSoldArtworksKey`; Doku **dc47af8** / **e8f9d15**. ✅

**Vorher:** 21.03.26 – **Session-Ende (Georg):** **StatistikTab**, **TEST-PROTOKOLL**, Build-Info-Dateien, **DIALOG-STAND**, **WIR-PROZESS**; Tests + Build grün. **Commit:** 81609e3 ✅ auf GitHub

**Vorher:** 21.03.26 – **Korrektur CD = Cooperate Design (Georg):** **CD** ist **kein** Buchhaltungsbegriff. **Benutzerhandbuch** Buchhaltung nur noch **EK-Kalkulation** und **Rohertrag/Lager** in der Demo (`08`, `09`, `00-INDEX`, Kassa-Absatz in `03`). **Cooperate Design** in `02-GALERIE-GESTALTEN`, `03` Design-Absatz, **Präsi** `06-DESIGN-VEROEFFENTLICHUNG` + Verweis in `05-WERKE-ERFASSEN`; Kassa-Präsi `07` ohne falsche CD-Controlling-Zeile. **Commit:** baebf92 ✅ auf GitHub

**Vorher:** 21.03.26 – **Buchhaltung ök2: Rohertrag + Lager-Vorschau:** **`BuchhaltungPage`** nur **`tenant === 'oeffentlich'`**; Utils **`buchhaltungRohertragOek2`**, **`buchhaltungLagerstandOek2`**. **Commit:** f8b06e1 ✅ auf GitHub

**Vorher:** 21.03.26 – **Werkkarte: EK + VK:** **`purchasePrice`**, Eigenproduktion, Export ohne EK, Werkkatalog/Admin – siehe History.

**Vorher:** 21.03.26 – **Verkaufsstatistik: Preisspanne nur ök2 (Georg):** **Preisspanne** (Min/Max/Ø), **Ø-Verkaufspreis-Kachel** und **Ø-Zeile** beim Druck **„Verkaufs- & Lagerstatistik“** nur bei **`tenant.isOeffentlich`**; **K2 und VK2** ohne. **`StatistikTab`** Prop **`showPreisspanneVerkauf`**, **ScreenshotExportAdmin** setzt **`tenant.isOeffentlich`**. Tests + Build grün. **Commit:** (siehe History) ✅

**Vorher:** 21.03.26 – **ök2 Vorschau: Kategorie-Tabs = nur Sparte ∩ Werke:** Ursache des Chaos: **`categoriesWithArtworks`** baute Tabs aus **allen** `work.category`-Werten und sortierte nur nach Sparte → bei Sparte **Kunst** erschienen **Möbel**, **Serie/Edition**, **Konzept** (MUSTER_ARTWORKS product/idea + ggf. Alt-Werke). **Neu:** **`getOek2GalleryFilterTabsForWorks`** in **`tenantConfig`** – erlaubte IDs nur aus **`getCategoriesForDirection`**, Tab nur wenn ein Werk diese Kategorie in der Liste hat. **`GalerieVorschauPage`** nutzt das bei **`musterOnly`**. K2/VK2-Pfad unverändert. Tests **`oek2GalleryFilterTabs.test.ts`**. Tests + Build grün. **Commit:** 9f7bc67 ✅ auf GitHub

**Vorher:** 21.03.26 – **ök2 Fremde-Test: grüner Balken + Werke 4/4 + Sparte Kunst:** **GaleriePage** `showOek2FremdeOrientierungsBanner`: bei **`k2-from-entdecken`** immer **true** (SPA-Referrer oft leer). **EntdeckenPage** `openByChoice`: **`k2-galerie-from-admin`** + **`k2-oek2-from-apf`** entfernen, damit Fremde-Flow nicht blockiert. **ScreenshotExportAdmin** Gamification ök2: Liste nach **`getEffectiveDirectionFromWork`** vs. **`galleryData.focusDirections[0]`** gefiltert (kein fremdes Handwerk-Werk für 4/4). **`stammdatenStorage`** `loadStammdaten(oeffentlich, gallery)`: gespeicherte Sparte **`handwerk`** → Lesen als **`kunst`** (Demo-Muster). Tests + Build grün. **Commit:** f9e9dec ✅ auf GitHub

**Vorher:** 21.03.26 – **Grep-Audit `k2-artworks` + Fixes:** `ZertifikatTab` / `PressemappeTab`: Lesen über **`readArtworksRawForContext`** + **`loadStammdaten`** / VK2 **`loadVk2Stammdaten`** (Props `isOeffentlich`/`isVk2` aus Admin). **`ControlStudioPage`** Archiv: **`useTenant`** + **`getShopSoldArtworksKey`** + Werke-Key ök2/K2 bzw. VK2-`k2-vk2-artworks-*`. **`GalerieVorschauPage`** `addToCart`: verkauft-Check mit **`getShopSoldArtworksKey(musterOnly, vk2)`** statt immer `k2-sold-artworks`. Doku **`K2-OEK2-VERMISCHUNG-URSACHEN.md`** §8 Tabelle. Tests + Build grün. **Commit:** a3c6abf ✅ auf GitHub

**Vorher:** 21.03.26 – **K2/ök2 Vermischung – Analyse + Fix Vorschau:** Ursachenklassen in **`docs/K2-OEK2-VERMISCHUNG-URSACHEN.md`** (SessionStorage, direkte Keys, Render-Fallback, Auto-Save/State, Restore, `getPageTexts` ohne Tenant). **Bug:** `GalerieVorschauPage` Render-Fallback lud **`k2-artworks`** auch bei **`musterOnly`** (ök2) → echte K2-Werke in der Demo-Vorschau möglich. **Fix:** Fallback nur wenn **`!musterOnly`**. **00-INDEX** verlinkt die neue Doku. Tests + Build grün. **Commit:** 73c13bb ✅ auf GitHub

**Vorher:** 21.03.26 – **K2 K→M Batch: Nummern wirkten nicht (Georg):** Nach dem Button lud **`safeReload`** die Galerie – **Merge Server+lokal** erkennt `K2-K-0031` und `K2-M-0031` über dieselbe Ziffer **`0031`**; mit **`serverAsSoleTruth`** blieb der **alte Server-Stand** → lokale Korrektur weg. **Fix:** Nach Batch wie bei Veröffentlichen **`publishGalleryDataToServer(resolveArtworkImages(...))`**, dann Reload. Zusätzlich **grafik** + **sonstiges** wie **malerei** (Martina-Bereich). **Commit:** 38f3a05 ✅ auf GitHub

**Vorher:** 20.03.26 – **K2 Malerei-Button sichtbar (Georg):** Der Batch-Button war nur im Unter-Tab **„Passwort & Sicherheit“** – **K2 hat diese Kachel nicht** (nur ök2). **Fix:** gleicher Button jetzt unter **Einstellungen → Kachel „Backup & Bilder“** (Unter-Tab `backup`). **Commit:** 3b649c0 ✅ auf GitHub

**Vorher:** 20.03.26 – **K2 Malerei: K2-K- → K2-M- automatisch (Georg):** Martinas **Bilder** (Kategorie **malerei**) mit fälschlich **K2-K-…** statt **K2-M-…** – Nummer soll **nicht** manuell gefummelt werden, sondern aus **Systemlogik** (Stammdaten Martina/Georg + Kategorie). **Neu:** `k2MalereiMartinaKtoMPrefixFix.ts` – Vornamen-Check (gemeinsamer Nachname allein → Malerei = Martina); Konflikt → `getNextFreeNumberInCategory`. **Admin** `saveArtworkData`: beim Speichern (neu + bearbeiten) nur **K2** korrigieren. **Einstellungen:** Button **„K2-Malerei: falsche K2-K- Nummern jetzt korrigieren“** (Batch + `k2-sold-artworks` / `k2-reserved-artworks` / `k2-orders` Items). Tests **k2MalereiMartinaKtoMPrefixFix.test.ts**. **Commit:** 2fc92cd ✅ auf GitHub

**Vorher:** 21.03.26 – **Werkkarten: mal Name mal leer (Georg):** Ursache: **Produkt-/Idee-Kategorien** (z. B. **Serie**, **Druck**, **Projekt**) wurden in **`resolveArtistLabelForGalerieStatistik`** nicht wie **`entryType` product/idea** behandelt – wenn `artist` leer und Typ/Kategorie nicht stimmten, kam **„Ohne Künstler“** → UI zeigte **keinen** Namen. **Fix (nur Anzeige):** Produkt-Kategorien (`PRODUCT_CATEGORIES` + **FOCUS_DIRECTION_PRODUCT_CATEGORIES**) → Georg; **IDEA_CATEGORIES** → Martina. **`readKuenstlerFallbackGalerieKarten` / Shop:** fehlender Stammdaten-Name wird aus **K2_STAMMDATEN_DEFAULTS** bzw. **MUSTER_TEXTE** ergänzt (Fallback nie `null` wegen einem leeren Namen). **Commit:** 9d9f139 ✅ auf GitHub

**Vorher:** 21.03.26 – **Werkkarten: Künstler wieder sichtbar (Georg):** `K2-S-…` = Kategorie **Skulptur** (Buchstabe **S**), nicht „gelöscht“. **K2-K-…** = **Keramik** – im Werk unter Bearbeiten setzen. Auf den Karten wurde bisher nur `artist` aus dem JSON gezeigt; bei leerem Feld nichts. **Neu:** dieselbe **Fallback-Logik** wie Statistik (`resolveArtistLabelForGalerieStatistik` + Stammdaten): **GalerieVorschauPage**, **ShopPage** (Warenkorb + Bon/Rechnung A4). Hilfen **`readKuenstlerFallbackGalerieKarten`** / **`readKuenstlerFallbackShop`** in **artworkArtistDisplay.ts**. Kein Schreiben in Werke. **Commit:** aef4745 ✅ auf GitHub

**Vorher:** 21.03.26 – **Manuell gelöschte Werke restlos (Georg):** Eiserne Regel: Löschen muss **nicht** durch „Vom Server laden“ zurückkommen. **Ursache:** Server-JSON hatte alten Stand. **Neu (K2 Admin):** Nach **Löschen** eines Werks automatisch **`publishGalleryDataToServer`** (optional leer: `allowEmptyArtworks`). Regel **`.cursor/rules/manuell-geloeschte-werke-restlos.mdc`**, **PROZESS-VEROEFFENTLICHEN-LADEN.md**. **Commit:** 820a690 ✅ auf GitHub

**Vorher:** 21.03.26 – **Duplikat-Umbenennung + Klarstellung Preis (Georg):** Bei doppelter Werknummer im **Admin-Laden** wurde die zweite Kopie mit **Kategorie-Präfix** neu nummeriert → z. B. gemeinsam **K2-M-…** konnte fälschlich **K2-K-…** werden. **Georg:** die **K2-K-…**-Zeilen tragen den **richtigen Preis**; die parallel verbliebenen **K2-M-…** sind die störenden Doppel (kein Auto-Merge). **Neu:** `parseK2DuplicateRenumberParts` – Buchstabe und Basiszahl aus der **gemeinsamen** Nummer (`K2-M-0011` → Umbenennung `K2-M-0011-1`, nicht K2-K). Bereits gespeicherte Einträge unverändert. **ScreenshotExportAdmin** `loadArtworks`. **Commit:** a127b85 ✅ auf GitHub

**Was wir JETZT tun:** Nach Push: ök2 Admin → Werkkatalog → Spalte **Bild**: M1 und G1 zeigen wieder **malerei.svg** / **grafik.svg**.
**Einordnung:** Ein Standard an der Quelle (`resolveArtworkImages`); keine zweite Fallback-Logik nur im Werkkatalog.

**Vorher:** 21.03.26 – **Wert der Galerie = gesamter Bestand (Georg):** Aufteilungen zählten nur **`inExhibition`** → **Neu:** gesamter Bestand (nicht verkauft). **StatistikTab.**

**Vorher:** 21.03.26 – **Verkaufsstatistik „nach Künstler“: Ohne Künstler trotz Martina/Georg (Georg):** Viele Werke hatten **`artist` leer** in den Daten; die Statistik wertete nur dieses Feld. **Neu:** `resolveArtistLabelForGalerieStatistik` (**artworkArtistDisplay.ts**) – gleiche Logik wie Admin (Kategorie, K2-Werknummer M/K/G/S/O/P/I, Legacy `K2-1234`, `entryType` product/idea); **StatistikTab** + **ScreenshotExportAdmin** (`kuenstlerFallback` aus Stammdaten; **VK2** ohne Fallback). Kein stiller Schreibzugriff auf Werke. Tests **artworkArtistDisplay.test.ts**. **Commit:** 3ac9104 ✅ auf GitHub

**Vorher:** 20.03.26 – **Kassabuch Ja/Nein auf der Kassa (Georg):** Entscheidung **nicht** in **Admin → Einstellungen** (Kachel/Sub-Tab **Kassabuch** entfernt in **ScreenshotExportAdmin**). **KassaEinstiegPage:** Checkbox **„Volles Kassabuch mit Ausgaben“** → `setKassabuchAktiv` / **Auszahlen (Ausgabe)** sichtbar. **KassabuchPage:** Ja/Nein-Buttons entfernt, Hinweis mit Link zur **Kassa**. **KassausgangPage:** bei ausgeschalteten Ausgaben Hinweis + Link **Kassa** (Direkt-URL). **Benutzerhandbuch** 08, **docs/K2-OEK2-KASSABUCH-AGENDA.md**. Tests + Build grün. **Commit:** 5bd4109 ✅ auf GitHub

**Vorher:** 21.03.26 – **ök2 Standard-Sparte „Kunst & Galerie“ (Georg):** Festgelegter Standard war **Kunst**, Code nutzte still **Food** und leere **`focusDirections`**. **Neu:** `DEFAULT_OEK2_FOCUS_DIRECTION_ID` + **`MUSTER_TEXTE.gallery.focusDirections: ['kunst']`**; **`loadStammdaten`** normalisiert ök2-Galerie bei leerer/fehlender Sparte; **`mergeStammdatenGallery`** füllt aus Defaults wenn `focusDirections` im Merge fehlt; Admin/Vorschau/Restore ohne **`?? 'food'`**; Muster-Stammdaten-Reset ohne `focusDirections: []`. **PraesentationsmappePage** / **ProspektGalerieeroeffnungPage:** Cast `as unknown as Record<string, string>`. Tests + Build grün. **Commit:** 0ba31cc ✅ auf GitHub

**Vorher:** 21.03.26 – **Admin Einstellungen: Kacheln gleiche Höhe (Georg):** Grid **alignItems: stretch**; Kacheln **Empfehlungs-Programm**, **Drucker**, **Kassabuch**, **Passwort & Sicherheit**, **Meine Daten**, **Backup**, **Anmeldung** (VK2) u. a. mit **minHeight 7.75rem**, **height 100%**, Flex-Spalte; Untertitel **flex: 1** + **lineHeight 1.35** (**Meine Daten**, **Anmeldung** nachgezogen). **ScreenshotExportAdmin.** Tests + Build grün. **Commit:** e02c86d ✅ auf GitHub

**Vorher:** 21.03.26 – **ök2 Demo/Muster UI (Georg):** Zwei Einstellungs-Zeilen + Stammdaten-Button → **eine** aufklappbare Zeile **„Demo & Muster zurücksetzen“** (zu, bis aufgeklappt); darin alle drei Aktionen + Hinweis Einzellöschen. **Meine Daten:** Verweis statt doppelter Button-Zeile. **Werke:** ein Zeilen-Hinweis. **App.css** `.admin-oek2-demo-details` für sauberes summary. Tests + Build grün. **Commit:** 69b5bae ✅ auf GitHub

**Vorher:** 21.03.26 – **Einstellungen: Lizenzen eine Karte (Georg):** Drei Lizenz-Kacheln → **eine** Karte **„Lizenzen“** mit **Lizenzinformation** als Hauptbutton (dunkelrot), darunter **Lizenz abschließen** und **Lizenz beenden** (ök2). VK2/dynamischer Mandant: dieselbe Karte, nur **Lizenz beenden**. Untermenüs `lizenz` / `lizenzbeenden` / `lizenzinfo` unverändert. **ScreenshotExportAdmin.** Tests + Build grün. **Commit:** 4f86888

**Vorher:** 21.03.26 – **Corporate Design am Eingang + ök2-Banner:** **EntdeckenPage** – Weg „Meine eigene Plattform“ mit **eigener CD**-Hinweis, **Galerie gestalten** als **Mittelpunkt** (Hero, Frage 1, Hub-Stationen mit Badge). **GaleriePage** (ök2 Fremde): Banner-Text stärker CD + Button **„Galerie gestalten (CD)“** → **Mein Bereich** `?context=oeffentlich&tab=design`; **Import** `MEIN_BEREICH_ROUTE` ergänzt (Build-Fix). Mit **navigation** (`OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE`), **BrandLogo**, **PRODUKT-VISION** (Fremde-Einstieg). **Tests + Build grün.** **Commit:** aadb30c ✅ auf GitHub

**Vorher:** 21.03.26 – **ök2 Galerie: grüner Fremde-Balken + Entdecken-Guide:** Balken hing an `musterOnly && !showAdminEntryOnGalerie` – sobald `k2-admin-context=oeffentlich` session-weit gesetzt war, verschwand er (ohne echten Admin-Einstieg). **Neu:** `showOek2FremdeOrientierungsBanner` (ohne Kontext-Shortcut). **GalerieEntdeckenGuide** war nur bei `!musterOnly` gerendert, Name aber nur bei `musterOnly` geladen → auf ök2 nie sichtbar; jetzt `isFremder && guideName` ohne `!musterOnly`. **Commit:** 4e3e5ef (Push falls nötig)

**Vorher:** 21.03.26 – **Eingangstor = `/entdecken` (Georg, Screenshot):** Verbindliches erste Tor = **EntdeckenPage** (Hero, Tor-Bild, „Jetzt entdecken“, Flow → ök2). **`OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE`** = **`ENTDECKEN_ROUTE`** (nicht direkt `galerie-oeffentlich`). **PRODUKT-VISION** + Kommentare **navigation**, **EntdeckenPage**, **GaleriePage**-Tooltip, **BrandLogo**. **Commit:** 4f86888

**Vorher:** 21.03.26 – **kgm solution** oben links: Link über Konstante zum Fremd-Einstieg; zuvor nur Demo-Galerie-URL. **Commit:** 921f297 ✅ auf GitHub

**Vorher:** 21.03.26 – **K2 Galerie: ⚙️ Admin / Einstellungen-Button wieder von APf:** `showAdminEntryOnGalerie` für echte K2-Galerie ergänzt um **`fromApf`** (DevView rendert wie ök2) und **`?embedded=1`** (Desktop/Mobil-Iframe der APf); ohne das war der Button oft weg (Referrer leer/strikt). **DevView:** `GaleriePage` mit `fromApf`. **Tests grün.** **Commit:** ae72a1d ✅ auf GitHub

**Vorher:** 21.03.26 – **Werbemittel-PDF:** html2canvas **direkt im Iframe** auf `captureRoot` (Styles aus Capture-CSS bleiben wirksam); **html2pdf** nur noch **jsPDF aus fertigem Canvas** (`.from(canvas, 'canvas')`), kein DOM-Klon ins Hauptdokument. **Typ:** `Html2PdfWorker.from` zweites Arg erlaubt. **mök2:** `Mok2ChapterPage` Überschrift **Teal `#0d9488`** statt Türkis auf hellem Kasten (Lesbarkeit). **Tests grün, Build grün.** **Commit:** 456fb23 ✅ auf GitHub

**Vorher:** 20.03.26 – **mök2: Texte & KI – eigenes Werkzeug:** Sektion **`#mok2-texte-ki-freiheit`** in **MarketingOek2Page** (externes KI-Tool + Einfügen in App; keine eingebaute KI-Pflicht in der Lizenz); Sidebar **mok2Structure**; Bullet in „5. Weitere Ideen“ verweist dorthin. **Tests 225 grün, Build grün.** **Commit:** 4cb9d77 ✅ auf GitHub

**Vorher:** 20.03.26 – **Hard-Backup erklärt (Georg: „zu wenig Daten“):** `MANIFEST.txt` + Konsolen-Hinweis im Skript – **gallery-data.json** ist absichtlich **klein** (veröffentlichter Stand, Bilder als URL, kein Base64-Blob). **Mehr:** `backup/k2-vollbackup-latest.json` + Skript erneut; Code: `backup-code-to-backupmicro.sh`. **Commit:** d3d5315 ✅ auf GitHub

**Vorher:** 20.03.26 – **Fullbackup auf backupmicro:** `hard-backup-to-backupmicro.sh` → **v007** (`gallery-data.json` + MANIFEST). Code-Spiegelung → `KL2-Galerie-Backups /K2-Galerie-Code-Backups/k2-galerie-code--2026-03-20--19-57`. **Skript-Fix:** `backup-code-to-backupmicro.sh` legt Code-Backups **im gleichen Ordner** wie die v00x-Versionen ab (Volume-Root war nicht beschreibbar). **Commit:** 980db3c ✅ auf GitHub

**Vorher:** 20.03.26 – **Werbemittel-PDF k2-pr-doc = CD wie Vorschau (nicht Grau auf Weiß):** `getK2PrDocHtml2canvasCaptureCss` + **onclone** nutzen **dieselben** Verläufe/Farben wie **Design-Tab** (`designToPlakatVars`: bodyBg, pageBg, text, muted, accent); nur **Gradient-Titel** → feste Akzentfarbe für html2canvas. Tests **marketingWerbelinie-k2-pr-doc-capture.test.ts** angepasst. **Commit:** 7d307c2 ✅ auf GitHub

**Vorher:** 20.03.26 – **mök2: Corporate Design als Marketing-Thema:** Neue Sektion **„Corporate Design – eine Linie“** (`mok2-cd-corporate-design`) in **MarketingOek2Page** + Sidebar **mok2Structure**; USP-Bullet + **Produkt- & Branchenvergleich**-Bullet; **docs/00-INDEX.md** + **KOMMUNIKATION-DOKUMENTE-STRUKTUR.md** (Tabelle). Inhalt: CD = durchgängige Linie Galerie gestalten → Web/Druck, Sportwagenprinzip, Argument für Piloten/PR. **Commit:** 27e38fe ✅ auf GitHub

**Vorher:** 20.03.26 – **Werbemittel-PDF: Kontrast + Werbelinie (html2canvas):** Capture-CSS `vk2-pr-doc` + K2-Design `prDocDesign`; Tests **marketingWerbelinie-k2-pr-doc-capture.test.ts**. **Commit:** 5f636bf ✅ auf GitHub (Doku-Hash-Fix a523bfd)

**Vorher:** 20.03.26 – **Gamification Profi-Modus:** Admin → **Einstellungen** → ein Klick **Checklisten ausblenden**; `localStorage` `k2-admin-hide-gamification-checklists`; `shouldShowGamificationChecklists()` + Hook `useGamificationChecklistsUi` (alle Schicht-B-UI inkl. mök2, Shop-Demo). Doku **GAMIFICATION-OEK2** §3. **Commit:** 9d228d0 ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification Phase 4:** `VITE_OEK2_GAMIFICATION_LAYER_B` + `isGamificationLayerBEnabled()`; Heroes/Lesepfade; mök2 standalone. Doku Phase 4; Test `gamificationLayer.test.ts`. **Commit:** c3eef23 ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification Phase 3 umgesetzt:** VK2 **Vereinsprofil** X/4 (Einstellungen → Meine Daten); **Shop** Demo-Kasse X/4 nur ök2-Admin; **Backup** „letztes Herunterladen“ nach Download-Klick (`autoSave` + Admin); **mök2** Pilot-Hinweis (Lesepfade, keine Spielmechanik). Doku Plan Phase 3 + **GAMIFICATION-OEK2** §5.3. **Commit:** b419c08 ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification Phase 2 umgesetzt (ök2/VK2):** Eventplan → **Events** = X/4 + **Nächstes Event**; Tab **Newsletter** = Empfänger-Zahl + X/4 (`NewsletterTab`); **Veröffentlichen** = Hinweis Stand-Badge (ohne Auto-Reload/Fetch). Doku Plan + **GAMIFICATION-OEK2** §5.2. **K2** ohne diese Blöcke. **Commit:** 2b19f77 ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification Phase 1 abgeschlossen (Doku):** DoD-Checkboxen + Abnahme in **GAMIFICATION-PLAN-OEK2-PHASEN.md**; **§5.1 Abnahme** in **GAMIFICATION-OEK2.md**. **Commit:** 946ba4a ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification Phase 1 – „Werke verwalten“:** Admin → **Werke**: **ök2** = X/4 aus `allArtworks` (Menge, Bild, Preis, Titel); **VK2** = X/4 aus `vk2Stammdaten.mitglieder` (keine Werke-Liste im VK2-Speicher). **K2** ohne Block. **Commit:** 3be6a8d ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification Phase 1 – „Galerie gestalten“:** Admin → **Design** (nur **ök2/VK2**): Hero-SVG wie Presse/Öffentlichkeitsarbeit + **X/4** (Willkommensbild, Galerie-Karte, Virtueller Rundgang, Texte vs. Baseline). Export **`getGaleriePageTextsBaseline`** in `pageTexts.ts`. **K2-Design-Tab** unverändert (kein Block). Doku **GAMIFICATION-PLAN-OEK2-PHASEN** Baseline + Phase-1-Zeile. **Commit:** 67f8098 ✅ auf GitHub

**Vorher:** 20.03.26 – **Guide-Strategie Doku bereinigt:** Prüfung ob Guide-Umbau die Projektstrategie verwirrt hat → **Code + alwaysApply-Regeln waren schon konsistent**; **Widersprüche nur in alter Markdown-Doku** (`ADMIN-LAYOUT-REGEL.md` wollte grünen Balken dauerhaft aus; `GAMIFICATION-*` / `OEK2-ANMELDUNG-*` beschrieben noch globalen Dialog). **Angeglichen:** ADMIN-LAYOUT-REGEL, GAMIFICATION-OEK2, GAMIFICATION-PLAN Phase 1, OEK2-ANMELDUNG, `guide-nahtlos-begleitung.mdc`; Kommentar `GalerieEntdeckenGuide`. **Commit:** 2f64ef0 ✅ auf GitHub

**Vorher:** 20.03.26 – **Korrektur (Georg):** Schwarzer **GlobaleGuideBegleitung** bleibt **aus** – aber **grüner Orientierungs-Balken** im Admin (ök2/VK2) war **fälschlich mit entfernt** und ist **wieder da** (`guideFlowAktiv`, Auto-Start wie zuvor). **`beendeGuideFlow()` beim App-Start entfernt**, damit `k2-guide-flow` den grünen Balken nicht sofort löscht. **Commit:** b38d341 ✅ auf GitHub

**Vorher:** 20.03.26 – Globaler Guide aus: kein Mount; zuvor grüner Balken fälschlich entfernt – **Commit:** fc195b5 ✅ auf GitHub

**Vorher:** 20.03.26 – **Phase 1 Guide ök2:** GlobaleGuideBegleitung wieder sichtbar … **Commit:** 8e80018 ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification: ein Erlebnis (Vereinheitlichung):** Georg: **nicht** zwei getrennte, sich **störenden** UI-Elemente – **Begleitung + Fortschritt/Status** sollen **zusammenwirken** (ein Rahmen, koordiniert). Festgehalten in **GAMIFICATION-OEK2.md** §2 „Vereinheitlichung“, Phasenplan + DoD + Checkliste. **Commit:** e967318 ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification + Sportwagenmodus:** Georg: **weiter** mit **Vorsicht**; **Markt** mit Gamification **drin**; **Plan B** nur **Notlösung**. Zusätzlich: **gesamter** Weg verbindlich **Sportwagenmodus** (eine Lösung pro Problem, keine Parallelwege) – in **GAMIFICATION-PLAN-OEK2-PHASEN.md** und **GAMIFICATION-OEK2.md** festgehalten. **Commit:** 331e6a9 ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification ök2 – verbindliche Doku (Georg):** **docs/GAMIFICATION-OEK2.md** – nur Demo/ök2; **K2 ohne** Gamification-Pflicht; **Kern vs. optionale Schicht** – alle Funktionen **ohne** Gamification gleich bedienbar; **an-/abschaltbar** ohne Ablauf zu ändern. **GAMIFICATION-POTENTIALE-K2.md** + **docs/00-INDEX.md** angepasst. **Commit:** e700042 ✅ auf GitHub

**Vorher:** 20.03.26 – **ök2 Handy: überlappende Buttons oben rechts behoben:** „Galerie teilen“ und Admin „Einstellungen“ nutzten bei **musterOnly** dieselbe `right`-Position, sobald `showAdminEntryOnGalerie` true war – **Ursache:** Bedingung `showAdminEntryOnGalerie && !musterOnly` für den Versatz. **Fix:** `galerieTeilenFixedRight` in **GaleriePage.tsx** – Versatz gilt auch für ök2; mobil ök2 **8.5rem**, K2/VK2 weiter **7rem**. **Commit:** 2d0c724 ✅ auf GitHub

**Vorher:** 20.03.26 – **Multi-User / Datentrennung (Klärung + Absicherung):** Antwort an Georg: Fremde sehen sich nicht gegenseitig im Browser (localStorage pro Gerät). Öffentlich für alle nur **K2**-Veröffentlichung (`gallery-data.json`). **Handy-Werk am Mac:** sehr wahrscheinlich **K2-Pfad** (z. B. K2-Vorschau/Admin) oder **Supabase** (ein gemeinsamer Werk-Speicher → Mac lädt nach). **Fix:** GalerieVorschau Mobile-Speichern-Button blockiert bei **ök2/VK2**, damit nie fälschlich K2/Supabase aus Demo-Kontext beschrieben wird (Modal war ohnehin UI-mäßig versteckt). **Commit:** 750e3ff ✅ auf GitHub

**Vorher:** 20.03.26 – **ök2 Admin Events:** Nach Reload waren neue Events „weg“, obwohl sie in `k2-oeffentlich-events` gespeichert waren – **Ursache:** `loadEvents` im Admin lud nur MUSTER, nicht den Speicher. **Fix:** Merge wie bei Dokumenten (Muster + localStorage) + `k2-events-updated` nach Event-Speichern. **Commit:** fa026ba ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification Baustein 2:** Admin → **Presse & Medien** – dasselbe Hero-SVG + Fortschritt **X/4** (Medienkit-Kernangaben, Presse-Story, Anlass/Datum/Ort, Medienspiegel). Doku **GAMIFICATION-POTENTIALE-K2.md** aktualisiert. **Commit:** a6e2620 ✅ auf GitHub

**Vorher:** 20.03.26 – **Gamification Baustein 1:** Admin → Eventplan → **Öffentlichkeitsarbeit** – Hero-SVG + Fortschritt **X/4** (Events, Medienspiegel, Dokumente, Newsletter) + Doku **docs/GAMIFICATION-POTENTIALE-K2.md** (weitere Bereiche). **Commit:** 41e1062 ✅ auf GitHub

**Vorher:** 20.03.26 – **Medienstudio:** Spielerisches *Gefühl* ohne Videospiel (Ziele, Fortschritt, kleine Triumphe) + **Bildsprache** (weniger Textwüste, Illustrationen/Icons/Leerzustände) – in **MEDIENSTUDIO-EINZIGARTIGKEIT-ROADMAP** ergänzt. Dazu UX-Zeile in **PRODUKT-VISION**. **Commit:** 7e54abe ✅ auf GitHub

**Vorher:** 20.03.26 – **Medienstudio Roadmap Einzigartigkeit:** Ist-Stand Tool (Werbelinie, Event-Dokumente, Verteiler, Prozess-Doku) + priorisierte Erweiterungen (Journalist:innen-Paket/ZIP, KI im Medien-Tab, Redaktions-Checkliste, Embargo, OTS, Versand-Log) in **docs/MEDIENSTUDIO-EINZIGARTIGKEIT-ROADMAP.md**; Index + Verweis in MEDIENSTUDIO-K2. **Commit:** bb90beb ✅ auf GitHub

**Vorher:** 20.03.26 – **Produkt-Bewusstsein:** Medientool = Erfolgsschlüssel am Markt (Differenzierung, Tempo); Kommunikation = Hebel; KI + Medientechnik = zukunftsfähig – festgehalten in **docs/PRODUKT-VISION.md**. **Commit:** d08ee54 ✅ auf GitHub

**Vorher:** 20.03.26 – **Werbemittel 1 Klick:** Erfolgs-Alerts nach Teilen/PDF-Download/Social entfernt – Mail öffnet, PDF lädt still, Zwischenablage ohne Extra-OK. Nur noch: zu langer mailto → ein Hinweis; Fehler/Link-Fall wie zuvor. **Commit:** f47e5d6 (Inhalt) ✅ auf GitHub · **HEAD/Push:** 7c5d70a

**Vorher:** 20.03.26 – **Sportwagenmodus Werbemittel (keine Plakat-Einzellösung im Admin):** Plakat-`@media print` + html2pdf-Capture + onclone in **marketingWerbelinie.ts** gebündelt: `getPlakatPosterPrintCss`, `getWerbemittelHtml2canvasCaptureCss`, `applyWerbemittelCaptureToClone` (baut auf `getK2PrDocHtml2canvasCaptureCss` auf). **ScreenshotExportAdmin** ruft nur noch diese API auf. Tests erweitert in **marketingWerbelinie-k2-pr-doc-capture.test.ts**. **Commit:** 53ce780 ✅ auf GitHub

**Vorher:** 20.03.26 – **Newsletter/Presse-PDF (k2-pr-doc) lesbar:** html2canvas wertet `@media print` nicht aus → bisher fast weiße Schrift auf weiß. **Fix:** `getK2PrDocHtml2canvasCaptureCss()` in **marketingWerbelinie.ts** (sinngleich Druck-Regeln: weiße `.page`, Text `#1a1f3a`, Gradient-Titel entfernt); **renderStyledPdfBlobFromHtmlString** injiziert das bei A4 + `k2-pr-doc` + **onclone**-Absicherung. Test: **marketingWerbelinie-k2-pr-doc-capture.test.ts**. **Commit:** 85a00ab ✅ auf GitHub

**Vorher:** 20.03.26 – **PDF = dasselbe Produkt wie Vorschau:** Plakat `--k2-plakat-pdf-accent`; PDF-Capture nur `.plakat h1`. **Commit:** 0a30955

**Vorher:** 20.03.26 – Plakat-PDF mit erzwungenem Weiß/Orange – **Commit:** 6a4baf8 (zurückgenommen inhaltlich)

**Vorher:** 20.03.26 – Werbemittel-PDF Iframe/html2canvas – **Commit:** 8fbbb2a

**Vorher:** 20.03.26 – **Werbemittel-PDF sauber:** `.no-print` für html2canvas, Plakat A3, Export-Overrides – **Commit:** b504209

**Vorher:** 20.03.26 – **Werbemittel 1-Klick vollständig:** PDF zuerst (html2pdf → Blob), Web Share, sonst mailto + Download – **Commit:** 8a85c2b

**Vorher:** 20.03.26 – Werbemittel-Mail mailto/PDF-Hinweis – **Commit:** 396755f

**Was wir JETZT tun:** ök2 **Sparte** in Admin + Vorschau kurz prüfen (soll überall **Kunst & Galerie** starten, nicht Food); CD-/Eingang wie zuvor bei Bedarf verifizieren.

**Einordnung:** Ein vereinbarter **Demo-Standard** (Kunst) muss im Code **eine Konstante + Muster + Lade/Merge** sein – nicht verstreute `'food'`-Fallbacks.

**Nächster Schritt:** Georg: ök2-Admin **Werke** / **Neues Werk** + **Galerie-Vorschau** (Muster) – Kategorien/Typ aus **Kunst**; bei Abweichung melden.

---

**Vorher:** 17.03.26 – **Server-Load: eine zentrale Merge-Schicht (Überschreibungen generell verhindert).** applyServerDataToLocal.ts: applyServerPayloadK2 für Events, Dokumente, Design, PageTexts (K2). Regeln: nie mit weniger überschreiben; Event-Zeiten aus lokal; Design nur wenn Server sinnvoll und lokal nicht; PageTexts nur wenn Server sinnvoll. GaleriePage (handleRefresh + loadData) und ScreenshotExportAdmin (Tenant-Load + handleLoadFromServer) nutzen nur noch diese Schicht. Doku: KRITISCHE-ABLAEUFE §3, PROZESS-VEROEFFENTLICHEN-LADEN; Regel: .cursor/rules/server-load-nur-mit-merge.mdc.

**📌 Erinnerung – Pro++ (später / vor Go-live):** (1) Migration 008 auf Supabase ausführen. (2) Pro++ manuell testen (Checkout → Lizenz in Supabase). Details: Abschnitt „Pro++“ oben.

**🔒 To-dos – Sicherheit vor Go-Live (4–6 Wochen)** – Details: docs/SICHERHEIT-VOR-GO-LIVE.md  
**Priorität 1 – System:**  
- [ ] Vercel: `WRITE_GALLERY_API_KEY` + `VITE_WRITE_GALLERY_API_KEY` setzen (gleicher Wert), danach „An Server senden“ testen  
- [ ] Supabase: Admin-User anlegen (z. B. georg.kreinecker@kgm.at), Passwort setzen/merken  
- [ ] Supabase: Migration 002 ausführen (SQL Editor → `supabase/migrations/002_artworks_rls_authenticated_only.sql`)  
- [ ] Vercel: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` prüfen (dann Admin-Login online aktiv)  
- [ ] Terminal: `npm audit` – kritische/hohe Meldungen beheben  
- [ ] Vercel/Supabase: alle nötigen Env-Variablen prüfen, keine Secrets im Repo  
**Priorität 2 – Userdaten:**  
- [ ] AGB / Datenschutz / Impressum für Live-Betrieb prüfen (Verantwortlicher, Kontakt, Speicherdauer)  
- [ ] Einmal Vollbackup (Admin → Einstellungen) anlegen und Wiederherstellung testen  

**Einordnung:** Bisher heute: Vision Werke (entryType) → ök2/Überkategorien → Migration Musterwerke → Modal Vorschau → Plausibilität Kategorie → Stammdaten Geschäftskunden → Stammdaten-Überschriften. Gesamtprojekt: K2 Galerie vermarktbar (Künstler:innen, Skalierung); ök2 Demo, VK2; ein Standard pro Problem, Datentrennung. Warum so: Stammdaten neutral („Meine Kontaktdaten“, „Ausstellungs-Galerie“) = für alle Nutzer:innen passend; Geschäftskunden-Felder = Vorbereitung für spätere Lizenznehmer.

**Vorher:** 15.03.26 – QS bis (ohne) E2E: VK2-Unit-Tests (datentrennung + vk2-backup), Lint in CI, Coverage (npm run test:coverage), Test-Szenarien-Checkliste (FEINSCHLIFF-WEIT-TESTEN), Regressions-Check (FEHLERANALYSEPROTOKOLL). 194 Tests, Build grün.

**Vorher:** 13.03.26 – ök2 Musterwerke & Musterstammdaten: Normal = drinnen; leeren nur bei expliziter Aktion. artworksStorage: leere Liste für k2-oeffentlich-artworks wird nie geschrieben. stammdatenStorage: bei leerem Speicher liefert ök2 MUSTER_TEXTE (nicht leere Felder). Test ergänzt.

**Letzter Build-Push:** 13.03.26 – (noch nicht gepusht) Vercel Hobby 12-Functions-Limit: visit + build-info in eine API (visit-and-build) zusammengeführt; api/visit.js und api/build-info.js entfernt; write-build-info.js schreibt build-info-payload.json; Rewrites in vercel.json. Davor: ök2 Musterwerke BUG-035, user-wishes CommonJS.

**Vorher:** 13.03.26 – Wünsche von Nutzer:innen (Entdecken-Modal → API; Smart Panel „💡 Wünsche“). Commit f5ca886 / 9869f8f – Vercel-Deployments zeigten Error.

**Vorher:** 13.03.26 – Aussendungen: Weiterverbreiten-Block (d673df5). Admin „Link zu deiner Galerie“ (9b8493a).

**Kernfrage bei Wiedereinstieg:** Woran haben wir in der letzten Viertelstunde gearbeitet? → Inhaltlicher Faden, nicht nur letzter Auftrag. Kontexte verbinden, abrufbar machen.

**Regel (ro5-Absicherung):** Nach jedem Kapitel / jeder in sich abgeschlossenen Einheit **selbständig commit + push**, damit bei ro5 (Crash/Reopen) nichts verloren geht. Georg muss nicht daran erinnern – Joe macht es automatisch.

---

## Programmierstand (für KI/Orientierung) – Stand 13.03.26

**Speichern und Synchronisieren funktionieren.** Mac, iPad und iPhone können auf einen gemeinsamen Werkestand gebracht werden; Bilder auf den Karten bleiben beim Speichern und beim „Bilder vom Server laden“ erhalten.

- **Speichern:** Werke (neu/bearbeiten) mit ImageStore; Warteschlange im Admin verhindert Überschreiben; Merge aus neuestem Stand vor dem Schreiben (GalerieVorschau).
- **Synchronisieren:** Veröffentlichen → Server (gallery-data); „Bilder vom Server laden“ / Stand-Badge → mergeServerWithLocal + preserveLocalImageData; Server-Bild wird erkannt auch wenn nur imageRef (https) geliefert wird → Gleichstand iPhone/Mac/iPad (inkl. Bilder um Nr. 30).
- **Relevante Doku:** docs/PROZESS-VEROEFFENTLICHEN-LADEN.md, ein-standard-problem.mdc (Veröffentlichen / Laden), GELOESTE-BUGS (BUG-021, BUG-026, BUG-033, …).

Damit die KI bei Reopen oder neuer Session weiß: Der Stand „Speichern & Sync läuft“ ist erreicht; weitere Änderungen daran nur vorsichtig und mit Blick auf diese Abläufe.

---

## Heute 14.03.26 – Vision Werke = Ideen & Produkte (entryType)

- **Umsetzung:** Ein Modell „Werke“, Typ als Feld. tenantConfig: ENTRY_TYPES (artwork, product, idea), getEntryTypeLabel. Admin: State artworkEntryType, Dropdown „Typ“ in beiden Formularen (ök2 + K2/VK2), artworkData.entryType beim Speichern. GalerieVorschauPage: neues Werk (mobil) mit entryType: 'artwork'. Fehlendes entryType überall wie 'artwork' behandelt.
- **ök2-Umsetzung (gleicher Tag):** MUSTER_ARTWORKS mit entryType (M1/G1/S1=artwork, K1=product, O1=idea). MUSTER_TEXTE.welcomeText: „Für Künstler:innen gedacht – für jede Idee und jedes Produkt gebaut. Eine Galerie, ein Modell …“. mök2 Genaue Produktbeschreibung: Absatz Vision + Verweis VISION-WERKE-IDEEN-PRODUKTE.md. SEO seoPageMeta: galerie-oeffentlich und galerie-oeffentlich-vorschau mit neuer description. Plan: PLAN-OEK2-WERKE-IDEEN-PRODUKTE-UMSETZUNG.md.
- **Überkategorien (gleicher Tag):** Plan wohin (PLAN-WOHIN-UEBERKATEGORIEN.md); PRODUCT/IDEA_CATEGORIES, getCategoriesForEntryType, getCategoryPrefixLetter(_, entryType); Admin + Nummernlogik (P/I/W); GalerieVorschau Filter für alle Kategorien.
- **Heute früh bis jetzt:** Wie oben im Letzter Stand; inkl. Badge Werkkarten, Stammdaten Geschäftskunden (erledigt), Stammdaten-Überschriften (erledigt). **Nächster Schritt:** Von Georg festlegen.

---

## Heute 13.03.26 – Eisernes Gesetz Server-Wahrheit + Lehre-Doku (Session-Ende)

- **Georg:** „An Server senden = dieser Stand; nach Abholen müssen Daten und Fotos zu 100 % gleich an Mac und Handy sein – eisernes Gesetz.“
- **Umsetzung:** serverAsSoleTruth in syncMerge.ts; alle Lade-Pfade (GaleriePage, Admin, Supabase) nutzen es. Deploy bf54da1.
- **Lehre:** „Dokumentiere diese Idiotie, damit so etwas nie wieder passiert – auch bei anderen Problemen.“ → docs/LEHRE-DESIGN-FEHLER-SERVER-WAHRHEIT.md (was schief war, warum, Lehre: Bei Sync/authoritative source **zuerst** Grundregel klären, dann bauen). FEHLERANALYSEPROTOKOLL Quelle + Fehlerklasse; GELOESTE-BUGS BUG-037; prozesssicherheit-Regel ergänzt. Commit 693a539.
- **Ende für heute.** Nächste Session: DIALOG-STAND lesen, bei Bedarf weitermachen.

---

## Heute 13.03.26 – ök2 Musterwerke gleiches Bild (BUG-035) + Vercel-Build (user-wishes.js)

- **Georg:** „wieso sehe ich jetzt nur xmal ein werk“ – in Werke verwalten (ök2) zeigten alle vier Karten (M1, K1, G1, S1) dasselbe Bild (Vase).
- **Ursache:** prepareArtworksForStorage speicherte externe URLs (Unsplash) nicht als imageRef; IndexedDB-Suche für M1/K1/G1/S1 lieferte dieselbe Variante (k2-img-1) → ein Bild für alle.
- **Fix:** (1) Externe URL (http/https) in prepareArtworksForStorage als imageRef übernehmen, keine IDB-Suche. (2) resolveArtworkImages: Musterwerke (M1, K1, G1, S1, O1, muster-*) nicht aus IndexedDB befüllen; UI nutzt getOek2DefaultArtworkImage(category). (3) isOek2MusterArtwork in artworkImageStore. (4) GELOESTE-BUGS BUG-035, Fehleranalyseprotokoll-Eintrag, VERCEL-BUILD-FEHLER-UNTERSUCHUNG.md.
- **Vercel-Build:** api/user-wishes.js auf CommonJS umgestellt (require + module.exports), damit Build auf Vercel durchläuft.
- **Vercel-Fehler:** „No more than 12 Serverless Functions … Hobby plan.“ → **Fix:** visit + build-info in **eine** Function: `api/visit-and-build.js` (Dispatch per `k2route=visit` / `k2route=build-info`); Rewrites für `/api/visit` und `/api/build-info`; `api/visit.js` und `api/build-info.js` entfernt; Build-Skript schreibt `api/build-info-payload.json`. Jetzt 12 Functions.
- **Nächster Schritt:** Commit + Push; Vercel-Deployment prüfen. Danach iPad: Stand, „An Server senden“, Musterwerke-Bilder.

---

## Heute 13.03.26 – Aussendungen: Weiterverbreiten in Social Media (ohne selbst drin zu sein)

- **Georg:** Da er in keinen Social-Media-Netzwerken ist, soll die Öffentlichkeitsarbeit so gestaltet sein, dass **Empfänger** (Medien, Gäste) die Aussendungen in ihren Netzwerken weiterverbreiten können – durch klaren Link und Aufforderung in jeder Aussendung.
- **Umgesetzt:** In **alle** generierten Aussendungen einen einheitlichen **Weiterverbreiten-Block** eingebaut:
  - **Presse** (Kopieren als Text): Absatz „WEITERVERBREITEN: Bitte teilen Sie diese Presseinformation … Link zur Galerie: [URL].“
  - **Newsletter** (Kopieren): gleicher Block mit „Link zur Galerie“.
  - **Social-Media-Export:** „Link zum Weiterverbreiten (in alle Kanäle): [URL]“ oben.
  - **Event-Flyer** (K2 + VK2): Abschnitt „TEILEN: Bitte verbreiten Sie diese Einladung … Link zur Galerie: [URL].“
  - **E-Mail-Einladung** (generateEmailNewsletterContent, K2 + VK2): „Bitte teilen Sie diese Einladung in Ihren Netzwerken. Link: [URL].“
- **URL** je Mandant: K2 / ök2 / VK2 (PROJECT_ROUTES + BASE_APP_URL).
- **Doku:** docs/PRESSEARBEIT-STANDARD.md – neuer Abschnitt „Weiterverbreiten in Social Media“. docs/MEDIENSTUDIO-K2.md – Verweis ergänzt.
- **Nächster Schritt:** Commit + Push; am PC Presse/Newsletter/Flyer exportieren und Block prüfen.

---

## Heute 13.03.26 – Social/Teilen: Admin „Link zu deiner Galerie“

- **Umgesetzt:** Tab Veröffentlichen – Block „🔗 Link zu deiner Galerie“ mit Kopieren + Teilen (9b8493a).

---

## Heute 12.03.26 – Admin Anmeldung & Abmeldung (komplettes Szenario inkl. Abmelden)

- **Georg:** „ja komplete inkl abmelde scenario“ – Anmelde- und Abmelde-Flow testen.
- **Umgesetzt:** (1) **Util** `src/utils/adminUnlockStorage.ts`: setAdminUnlock, clearAdminUnlock, clearAdminUnlockIfExpired, isAdminUnlocked (eine Quelle für GaleriePage, ScreenshotExportAdmin, App). (2) **App.tsx:** restoreAdminSessionIfNeeded nutzt clearAdminUnlockIfExpired. (3) **GaleriePage:** Anmeldung (Passwort + „Merken“) nutzt setAdminUnlock/clearAdminUnlock. (4) **ScreenshotExportAdmin:** Abmelden-Button nutzt clearAdminUnlock. (5) **Tests** `src/tests/admin-anmeldung-abmeldung.test.ts`: 8 Tests – Anmeldung (Keys gesetzt, isAdminUnlocked true), Abmeldung (Keys weg, isAdminUnlocked false), Abgelaufen (clearAdminUnlockIfExpired entfernt Keys), kompletter Ablauf Anmeldung → Abmeldung.
- **Tests:** 173 grün (8 neue). Build vor Commit.
- **Nächster Schritt:** Commit + Push; danach am PC: Admin einloggen (Passwort + Merken), Abmelden klicken, prüfen dass erneut Passwort nötig ist.

---

## Heute 12.03.26 – Upload-Download-Test mit vollen Werken + Bild

- **Georg:** Test soll echte Daten nutzen (komplettes Werk mit Bild), sonst wenig wert.
- **Umgesetzt:** Simulationstest erweitert: `mkFullArtwork()` (alle Stammfelder: title, description, price, category, imageRef, …) + echtes kleines PNG-Base64. Upload-Tests 1–50 und Download-Tests 1–50 laufen mit vollen Werken; Export entfernt Base64, Felder bleiben; Merge/Preserve behält Bild-Referenz und Metadaten. 103 Tests grün.
- **Dateien:** src/tests/upload-download-simulation.test.ts.
- **Morgen:** Georg testet ob es in der App wirklich stimmt (manueller Check).

---

## Heute 12.03.26 – Automatisches Downloaden (Daten vom Server bei jedem Neuladen)

- **Georg:** Beim Neuladen des Geräts müssen die Daten automatisch vom Vercel-Server abgeholt werden – keine manuelle Eingabe nötig.
- **Umgesetzt:** (1) **Admin:** Einmal pro Öffnung (1,5 s nach Mount) wird still `handleLoadFromServer({ silent: true })` ausgeführt (nur K2). Kein Alert, nur Sync-Balken „Daten vom Server geladen.“ (2) **handleLoadFromServer** hat optionale `options.silent`: bei silent keine Alerts, nur Sync-Balken; bei Schutzfällen (Server leer, Bildverlust-Risiko) wird still abgebrochen. (3) **Galerie-Seite:** Läd bereits automatisch (loadData nach 1 s) – unverändert. (4) UI-Hinweis: „Beim Öffnen des Admin werden die Daten automatisch vom Server geholt – keine manuelle Eingabe nötig.“
- **Dateien:** ScreenshotExportAdmin.tsx (handleLoadFromServer silent, hasAutoLoadedFromServerRef, useEffect Auto-Load, Sync-Texte).
- **Nächster Schritt:** –

---

## Heute 12.03.26 – Präsentationsmappe: eine Version, PDF-Druck

- **Umgesetzt:** Nur noch eine Version (Vollversion); Langversion-Links im Admin entfernt, ein Link „Präsentationsmappe“. Druck-PDF wie Benutzerhandbuch: kompakte Abstände, kleinere Schrift im Druck, Seitenfuß „Seite X von Y“, @page-Ränder.
- **Dateien:** PraesentationsmappeVollversionPage.tsx (Print-Styles, .pmv-seitenfuss), ScreenshotExportAdmin.tsx (ein Link, Beschreibung angepasst).
- **Tests + Build:** grün. Commit 27e06c4, push auf main.

---

## Reopen – Georg schließt Cursor (Session-Pause)

- **Stand:** Admin-Button auf öffentlicher Galerie (K2, ök2, VK2) nur noch sichtbar, wenn von APf oder freigeschaltet – Besucher von Google sehen keinen Admin. DIALOG-STAND und Code aktuell.
- **Cursor:** Georg schließt Cursor (Dialog-Eingabe war holprig); will nach dem Wiederöffnen wieder einsteigen.
- **Bei Reopen (ro):** DIALOG-STAND + ggf. Ankes Briefing lesen → orientieren → weitermachen. Kein neuer großer Auftrag nötig – Faden liegt hier.

---

## Heute 12.03.26 – Erster erfolgreicher Bildtest (Meilenstein)

- **Georg:** „Alles funktioniert jetzt – das Senden hin und her von Bildern und Abspeichern.“
- **Vermerk:** **Erster erfolgreicher Bildtest** – Senden/Abrufen von Bildern (Server ↔ Mobil) und Speichern laufen durch; Gleichstand Mac ↔ Mobil erreichbar.
- **Doku:** Dieser Meilenstein in DIALOG-STAND und PROZESS-VEROEFFENTLICHEN-LADEN.md vermerkt (Reproduzierbarkeit).

---

## Heute 12.03.26 – Admin iframe: Bilder verschwinden – GELÖST (BUG-033)

- **Georg:** „Hurra gelöst“ – Fehleranalyse durchführen.
- **Ursachen (3):** (1) iframe strippt data:-URLs → State ohne Bild. (2) **Liste verwarf blob:-URLs** → Karten zeigten „Kein Bild“, Bearbeiten zeigte Bild (blob im Objekt). (3) data:→blob nur im Save-Pfad.
- **Lösung:** (1) convertDataUrlsToBlobUrlsInList in iframe überall (Initial-Load, artworks-updated, Save-Pfad). (2) In der Werkkarten-Liste blob:-URLs **nicht** mehr verwerfen; onError bei ungültigem Blob. (3) BUG-033, ANALYSE-ADMIN-BILD-VERSCHWINDET-BEI-SPEICHERN.md Abschnitt 10, Fehleranalyseprotokoll-Eintrag.
- **Nächster Schritt:** Commit + push (QS war grün).

---

## Heute 12.03.26 – Admin: Warteschlange (Bild bei 30 bleibt wenn 31 gespeichert)

- **Georg:** „Bild bei 30 verschwindet wenn ich 31 speichere“ / „woher soll ich wissen was welchen Einfluss hat – das musst du wissen.“
- **Ursache:** Im Admin liefen zwei Speichervorgänge **parallel**. Speichern 31 las `fresh = loadArtworksRaw()` bevor Speichern 30 fertig war → `fresh` ohne 30s Bild → Schreiben überschrieb 30.
- **Fix:** **Warteschlange:** Lese+Schreib-Block in `saveArtworkData` läuft in `lastArtworkSaveRef.current = (lastArtworkSaveRef.current ?? Promise.resolve(true)).then(() => doSerializedWrite())`. Zweiter Save wartet auf ersten → `fresh` enthält 30 mit Bild.
- **Wo:** components/ScreenshotExportAdmin.tsx (saveArtworkData, doSerializedWrite).

---

## Heute 12.03.26 – GalerieVorschau: Bild bei 30 verschwindet wenn 31 gespeichert (Fix)

- **Georg:** „Wenn ich 31 neues Bild mache, verschwindet es bei 30.“
- **Ursache:** Beim Speichern von Werk 31 wurde die Liste aus einem älteren `loadArtworks()`-Stand gebaut → Werk 30 (gerade gespeichert) war darin noch ohne neues Bild → beim Schreiben wurde 30 überschrieben.
- **Fix:** (1) Beim Bearbeiten: Liste aus **neuestem** `loadArtworks()` bauen („latest“), nur dieses eine Werk ersetzen. (2) Unmittelbar vor `saveArtworks`: nochmals `loadArtworks()` lesen („rightBeforeSave“), nur den Eintrag des bearbeiteten Werks durch die vorbereitete Version ersetzen, dann `prepareArtworksForStorage` und speichern. So wird kein anderes Werk (z. B. 30) mit altem Stand überschrieben.
- **Wo:** src/pages/GalerieVorschauPage.tsx (Speicher-Handler Bearbeiten).

---

## Heute 12.03.26 – Stand-Fix (Revert data-URL-Vorfüllung in resolveArtworkImages)

- **Problem:** Nach BUG-032 zeigte „Daten vom Server geladen“ alten Stand (08.03.); Georg: „hat gestern Abend noch funktioniert – du musst heute etwas programmiert haben.“
- **Vermutung:** Der BUG-032-Zusatz (bei fehlendem imageRef 6 Werke mit data-URLs aus IndexedDB vorfüllen) schickte große Daten durch die Pipeline → Stand/Sync gestört.
- **Fix:** In **resolveArtworkImages** den else-Zweig zurückgebaut: Kein Lookup per Varianten mehr, der die 6 Werke mit data-URLs füllt. Lookup passiert nur noch beim Export in **resolveImageUrlForSupabase** (Ref-Varianten + Map) – 6 Bilder sollten weiter ankommen.
- **Zusätzlich:** Erfolgs-Modal nach „An Server senden“ zeigt jetzt **„Stand auf Vercel jetzt: [Datum/Uhrzeit]“** (aus Kontroll-GET) – zur Diagnose.
- **Commit:** 162a81a. **Wo:** src/utils/artworkImageStore.ts, src/utils/publishGalleryData.ts, components/ScreenshotExportAdmin.tsx.
- **Nächster Schritt:** „An Server senden“ testen → prüfen ob Stand auf Vercel aktuell ankommt; ob die 6 Bilder weiterhin mitkommen.

---

## Heute 12.03.26 – 6 Bilder endgültig rein (BUG-032, danach Teil zurückgebaut)

- **Georg:** „Bringen wir endlich dies 6 Bilder rein – fixe das.“ (0030, 0031, 0032, 0033, 0038, K2-M-0018 blieben ohne Bild-URL.)
- **Ursachen:** (1) **resolveArtworkImages:** Ohne imageRef (z. B. nach Merge) wurde für 30–39/K2-M kein IndexedDB-Lookup per Nummer-Varianten gemacht. (2) **supabaseClient:** Fallback-Map und Lookup nutzten für K2-K-0030 weiter „20030“ statt 0030/30.
- **Fix (bleibt):** supabaseClient: Map-Befüllung und tryMap/getFromMap mit K2-Zifferngruppe (k2[2]). **Zurückgebaut:** resolveArtworkImages-Vorfüllung mit data-URLs (siehe Stand-Fix oben).
- **Wo:** src/utils/artworkImageStore.ts, src/utils/supabaseClient.ts. **Doku:** GELOESTE-BUGS.md BUG-032.

---

## Heute 11.03.26 – „Liste nicht gefunden“ / erst zweites Speichern (Fix)

- **Georg:** Beim Erstellen neuer Werke hat erst das **zweite** Speichern funktioniert; Meldung „irgend etwas mit Liste nicht gefunden“.
- **Ursache:** Nach dem Speichern prüft **verifyNewInStorage()** sofort (und einmal nach 100 ms), ob das neue Werk in localStorage steht. Auf Mobile/langsamen Geräten braucht localStorage/IndexedDB länger → Verifikation schlägt fehl → Alert „nicht in Liste gefunden“.
- **Fix:** Mehr Retries (bis zu 4×) mit 150 ms Abstand; Fehlermeldung klarer: „Bitte einmal erneut auf Speichern tippen – dann erscheint es.“
- **Wo:** components/ScreenshotExportAdmin.tsx (verifyNewInStorage). **Doku:** GELOESTE-BUGS.md BUG-030.

---

## Heute 11.03.26 – Bildspeicher-Regelanalyse „gemerkt“

- **Auftrag:** Bildspeicher-Prozess gegen Regeln prüfen → **5 Verstöße** dokumentiert in **docs/ANALYSE-BILDSPEICHER-REGELVERSTOESSE.md** (3 Code, 2 Doku). **Gemerkt:** Regel werke-bilder-immer-imagestore.mdc verweist auf diese Doku; bei Bildspeicher-Thema Abschnitt 5 (Nächste Schritte) abarbeiten. docs/00-INDEX.md enthält Eintrag. Offene Fixes: 3.1 (catch in WithImageStore), 3.2 (compressAllArtworkImages), 3.3 (Supabase-Backup), 3.4+3.5 (Doku PROZESS-VEROEFFENTLICHEN-LADEN).

---

## Heute 11.03.26 – 5 Bilder (30–33, 38): Ref-Varianten für K2-K-0030 (Fix)

- **Code-Check:** Beim „An Server senden“ werden Bild-URLs über **getArtworkImageRefVariants** gesucht. Bei number **"K2-K-0030"** war `digits` = "20030" (alle Ziffern aus K2-K-0030) → es wurden **k2-img-0030** und **k2-img-30** nicht in die Suchvarianten aufgenommen. Liegt das Bild aber unter k2-img-0030 (z. B. nach Merge/Server-Stand), fand der Export es nicht.
- **Fix:** In **getArtworkImageRefVariants** (artworkImageStore.ts): Wenn das K2-Muster matcht (K2-X-NNNN), die **Zifferngruppe** (0030, 30) explizit als Varianten hinzufügen – dann wird das Bild gefunden, egal ob unter k2-img-0030 oder k2-img-K2-K-0030 gespeichert.
- **Wo:** src/utils/artworkImageStore.ts. Nächster Test: iPad „An Server senden“, Mac „Aktuellen Stand holen“ – die 5 Bilder sollten mitkommen.

---

## Heute 11.03.26 – 5 Bilder (0030–0033, 0038) – Ref-Varianten (erster Fix, danach zurückgenommen)

- **Georg:** „Diese Bilder sind drinnen eindeutig“ (am iPad sichtbar, kommen aber nicht an).
- **Ursache:** Beim Lookup (Export/Anzeige) wurden für Nummern wie „0030“ oder „30“ **keine** K2-K-/K2-M-Ref-Varianten probiert. Das Bild liegt in IndexedDB aber oft unter `k2-img-K2-K-0030` → wurde nicht gefunden.
- **Fix:** In **getArtworkImageRefVariants** werden bei reinen Ziffernnummern (0030, 30 …) auch K2-K-/K2-M-Varianten hinzugefügt. Da der Index überall k2-img-K2-K-00xx ist, war das nicht die Ursache für die 5 fehlenden Bilder (siehe Abschnitt oben).
- **Wo:** src/utils/artworkImageStore.ts.

---

## Heute 11.03.26 – Mac blockierte 0030–0039 trotz neuer Bilder vom iPad (Fix)

- **Georg:** „Das habe ich schon vor dem letzten Senden gemacht – überall sind neue Bilder drin, am iPad sichtbar, nur Mac blockiert noch.“
- **Ursache:** In **preserveLocalImageData** (syncMerge.ts): Wenn **lokal** (Mac) für ein Werk **kein** Bild hatte, wurde das Merged-Item immer auf „ohne Bild“ gesetzt – auch wenn der **Server** (vom iPad) eine Bild-URL geliefert hatte. Dadurch wurden die neuen Fotos für 30–39 auf dem Mac verworfen.
- **Fix:** Nur noch dann auf „kein Bild“ setzen, wenn **sowohl** lokal **als auch** Server keine echte URL haben. Hat der Server eine URL (neue Fotos vom iPad), wird sie übernommen – Mac blockiert 30–39 nicht mehr.
- **Wo:** src/utils/syncMerge.ts. **Doku:** GELOESTE-BUGS.md BUG-029.
- **Nächster Schritt:** Georg: Am Mac „Aktuellen Stand holen“ (nachdem vom iPad erneut gesendet wurde) → Bilder 30–39 sollten ankommen.

---

## Heute 11.03.26 – Werke 0030–0039 bleiben schwarz („Sperre“)

- **Georg:** „Dort wo wir einmal alle Bilder rausgelöscht haben (30 bis 38) bleiben die Bilder schwarz – da ist noch eine Sperre drin.“
- **Erklärung:** Die einzige „Sperre“ war: Für **0030–0039** werden **alte Repo-Bilder** nicht angezeigt. **Zusätzlich** blockierte der Mac: wenn lokal kein Bild, wurde Server-Bild verworfen → Fix oben. Nach Fix: neue Bilder vom iPad für 30–39 kommen am Mac an.
- **70 Werke, 60 mit Bild:** Die 10 ohne Bild-URL waren 0030–0039 (bereinigt). Wenn iPad für 30–39 neue Fotos hat und sendet, müssen sie jetzt auch am Mac ankommen.

---

## Heute 11.03.26 – iPad sendet → Mac/Handy bekommen Gesendetes nicht (Fix preserveLocalImageData)

- **Georg:** „Es geht niemals das weg was am iPad vorhanden ist, und es kommt niemals das an was gesendet wurde – und das seit 2 Tagen.“
- **Ursache:** In **preserveLocalImageData** (syncMerge.ts) wurde die Server-URL nur genutzt, wenn **lokal keine** echte URL hatte. Hatte Mac/Handy von früherem Sync schon eine URL, wurde die frisch vom iPad gesendete Server-URL verworfen → Gesendetes kam nicht an.
- **Fix:** Wenn der **Server** eine echte Bild-URL (https) hat → **immer** Server nehmen. Lokales Bild nur, wenn Server keins hat. `imageUrl = serverHasRealUrl ? item.imageUrl : (local.imageUrl ?? item.imageUrl)` (analog imageRef, previewUrl).
- **Wo:** src/utils/syncMerge.ts. **Doku:** GELOESTE-BUGS.md BUG-028.
- **Nächster Schritt:** Georg: Vom iPad „An Server senden“, 1–2 Min warten, am Mac/Handy „Aktuellen Stand holen“ (oder Stand-Badge tippen) → gesendete Bilder sollten ankommen.

---

## Heute 11.03.26 – Handy: falsches/fehlendes Bild (0039 anders, dazwischen fehlen) – Ursache + Fix

- **Georg:** „Es kommen vereinzelt Bilder an, aber z. B. 0039 ist bei iPad und Mac gleich, am Handy ist noch ein anderes Bild; dazwischen fehlen alle Bilder.“
- **Ursache:** Wenn die **API** (Blob = aktueller Stand) fehlschlug oder langsam war, lud das Handy als Fallback die **statische** Datei `/gallery-data.json` aus dem **Build** (alter Stand). Die enthält nicht den letzten „An Server senden“-Stand → falsche/fehlende Bilder.
- **Fix:** **Nur noch API (Blob)** für Galerie-Daten – **kein** Fallback mehr auf statische `gallery-data.json`. Initial-Load und „Stand-Badge tippen“ (handleRefresh) nutzen ausschließlich `/api/gallery-data?tenantId=k2`. Bei API-Fehler: keine Daten überschreiben, Hinweis „Verbindung prüfen / erneut tippen“.
- **Wo:** GaleriePage.tsx (Initial-Load + handleRefresh) – Fallback-Fetches auf pathAndQuery und GALLERY_DATA_PUBLIC_URL + pathAndQuery entfernt.
- **Nächster Schritt:** Am iPad/Mac erneut „An Server senden“, 1–2 Min warten, dann am Handy QR neu scannen oder Stand-Badge tippen → Handy lädt nur noch vom Blob (aktueller Stand).

---

## Heute 11.03.26 – Kette: richtiges Bild an der Karte (keine Aussagen, Kette fix)

- **Georg:** „Ich habe nichts von Aussagen – stelle die Kette richtig und hänge einfach an die Karte das richtige Bild. Das kann doch nicht so schwierig sein.“
- **Umsetzung:** (1) **persistDataUrlsToIndexedDB** in artworkImageStore.ts: Vor jedem stripBase64 werden alle Data-URLs (data:image/…) in IndexedDB gespeichert und in der Liste durch imageRef ersetzt (imageUrl = ''). So geht beim „vom Server laden“ + Speichern kein Bild verloren – die Karte bekommt das Bild über resolveArtworkImages (imageRef → IndexedDB). (2) **Admin:** An allen drei Stellen (Aktuellen Stand holen, Nur Server-Stand, Werke vom Server zurückholen) wird **vor** stripBase64FromArtworks jetzt **persistDataUrlsToIndexedDB** aufgerufen. Kette: Merge → fillSupabase → persistDataUrls → strip → save → Anzeige über resolveArtworkImages.
- **Wo:** src/utils/artworkImageStore.ts (neue Funktion), components/ScreenshotExportAdmin.tsx (3 Aufrufe).
- **Nächster Schritt:** Georg: „Aktuellen Stand holen“ testen – Karten sollten das richtige Bild zeigen (keine leeren Karten wo vorher Bild da war).

---

## Heute 11.03.26 – Bildverlust iPad („bis auf 2 alle weg“) – Fix + Absicherung

- **Georg:** Nach Push/Neuladen auf dem iPad waren fast alle Bilder weg (nur noch 2). Die zuvor gegebene Aussage „beim Neuladen verlierst du keine Bilder“ war falsch.
- **Ursache (wahrscheinlich):** Entweder (1) GaleriePage loadData: beim ersten Laden war **localArtworks** leer oder zu klein → Merge = fast nur Server (2 Werke mit Bild) → Speichern überschrieb lokale 70 mit 2. Oder (2) der neue **Re-Join-Zweig** in prepareArtworksForStorage hatte einen unerwarteten Effekt. Beides wird abgesichert.
- **Maßnahmen (umgesetzt):** (1) **Re-Join-Zweig in prepareArtworksForStorage zurückgebaut** – nur noch data:image in IndexedDB, bestehendes imageRef wird **niemals** leer überschrieben (Schutz: `hadRef && !next.imageRef` → next.imageRef = a.imageRef). (2) **GaleriePage loadData:** Vor saveArtworksForContextWithImageStore: wenn **lokal mehr imageRefs** als nach Merge → **Speichern überspringen** (Console-Warnung, artworks-updated mit saveSkippedImageProtection). So kann „70 mit Bild“ nie durch „2 mit Bild“ ersetzt werden.
- **Wiederherstellung:** Aus **Vollbackup** (Admin → Einstellungen → Backup & Wiederherstellung) oder von einem Gerät, das noch alle Bilder hat, erneut „An Server senden“, dann betroffenes Gerät „Aktuellen Stand holen“.
- **Wo:** artworkImageStore.ts (prepareArtworksForStorage), GaleriePage.tsx (loadData).
- **Commit:** 61a109b – auf GitHub.
- **Nächster Schritt:** Georg: Wiederherstellung aus Backup prüfen; künftig nach „Stand“-Tipp prüfen ob Bilder noch da sind (Schutz verhindert erneuten Verlust).

---

## Heute 11.03.26 – Kette Werk–Bild (Re-Join zurückgebaut)

- **Hinweis:** Die Umsetzung „Kette wieder am gleichen Glied“ (kanonischer Ref + Re-Join in prepareArtworksForStorage) wurde nach dem Bildverlust auf dem iPad **zurückgebaut**. **resolveArtworkImages** behält den **Varianten-Lookup** (Anzeige: wenn unter Ref nichts, unter Varianten suchen). Beim Speichern: nur noch data:image → IndexedDB; bestehendes imageRef wird nie geleert (siehe Abschnitt „Bildverlust iPad“ oben).

---

## Heute 11.03.26 – iPad: Stand nicht ändern (mehr Werke als Server) + 70/51 mit Bild

- **Georg:** „iPad darf ich den Stand nicht ändern, sonst sind meine Bilder wieder gelöscht, weil der Stand vom Server niedriger ist – das hatten wir gestern schon mal, Anke müsste das wissen.“
- **Fix (iPad-Schutz):** Wenn auf **Mobilgerät** (iPad) **mehr Werke lokal** als auf dem Server (z. B. 70 vs. 51) → **„Aktuellen Stand holen“ wird blockiert**. Meldung: „Du hast mehr Werke (70) als der Server (51). Zuerst hier ‚An Server senden‘ tippen. Danach am anderen Gerät ‚Aktuellen Stand holen‘.“ Kein Überschreiben, keine Datenverlust-Gefahr. **Wo:** ScreenshotExportAdmin.tsx handleLoadFromServer (K2), nach der 50%-Prüfung. **Doku:** PROZESS-VEROEFFENTLICHEN-LADEN.md Abschnitt 5c.
- **70 Werke, 51 mit Bild:** Ref-Varianten (11.03.26) sind drin; wenn es weiter bei 51 bleibt, mögliche Ursachen: (1) 19 Bilder nie in IndexedDB gespeichert (z. B. nur imageRef ohne Put), (2) Supabase-Upload schlägt auf iPad für 19 fehl (Auth/Storage, Timeout), (3) andere Ref-Formate. Nächster Check: Auf iPad in Konsole nach „Bild-URL für Export nicht auflösbar“ oder Upload-Warnungen schauen.
- **Anke/Briefing:** Regel „iPad mit mehr Werken als Server = nie Stand holen, zuerst senden“ ist in DIALOG-STAND und PROZESS-VEROEFFENTLICHEN-LADEN.md 5c festgehalten – für künftige Sessions abrufbar.
- **Analyse Karten/Bilder – zwei Speicherwege:** Georg: „Karten/Bilder geht zwei verschiedene Speicherwege und findet oft nicht zusammen – hat uns gestern fast den ganzen Tag beschäftigt.“ Analyse: **docs/ANALYSE-KARTEN-BILDER-ZWEI-SPEICHERWEGE.md**. Ergebnis: Die Änderungen von 11.03.26 (Ref-Varianten, iPad-Block Karten, iPad-Block Bilder) **bauen keine neue Fehlerquelle ein** (nur Lesen bzw. Abbruch, kein Schreiben mit falschem Ref). Fehlerquellen sind v. a. unterschiedliches Nummernformat (0031 vs. K2-K-0031) ohne konsistenten Ref, oder Schreibpfade die prepareArtworksForStorage umgehen. Doku für künftige Änderungen an Karten/Bilder-Speicherung. **Ergänzung:** Abschnitt 6 „Kette wieder am gleichen Glied“ – beim Speichern wird die Kette wieder vereinheitlicht.

---

## Heute 11.03.26 – ök2: Musterstammdaten (Lena Berg, Paul Weber) zurücksetzen

- **Stand:** Musterwerke waren schon zurückgesetzt; es fehlten die **Musterstammdaten** (Person + Galerie). Lena Berg und Paul Weber sind im **Code** (MUSTER_TEXTE) definiert; in der **öffentlichen Galerie** (galerie-oeffentlich) werden sie bei ök2 immer aus MUSTER_TEXTE angezeigt (GaleriePage useEffect + Anzeige) – also **sind sie in der Galerie mit Vita weiterhin da**. Im **Admin** (ök2 Einstellungen) kommen die Felder aus localStorage (k2-oeffentlich-stammdaten-*); wenn die leer oder überschrieben waren, zeigte der Admin keine Muster.
- **Umsetzung:** Im ök2-Admin (Einstellungen) neuer Button **„🔄 Musterstammdaten zurücksetzen“** (unter „Musterwerke zurücksetzen“). Setzt k2-oeffentlich-stammdaten-martina/georg/gallery auf MUSTER_TEXTE (Lena Berg, Paul Weber, Galerie Muster) und aktualisiert sofort den Admin-State.
- **Wo:** ScreenshotExportAdmin.tsx (ök2 Einstellungen, nach Musterwerke-zurücksetzen-Block).
- **Nächster Schritt:** Georg: Im ök2-Admin auf „Musterstammdaten zurücksetzen“ tippen → dann Galerie/Vita prüfen; oder mit bisherigem Faden (Eventplan, Presse) weitermachen.

---

## Heute 10.03.26 – ök2: K2-Werke in Muster-Galerie verhindert + Musterwerke zurücksetzen

- **Problem:** In der ök2-Mustergalerie waren im Admin die Musterwerke weg und in der Galerieansicht K2-Werke sichtbar (Datentrennung verletzt).
- **Ursache:** Beim „Aktuellen Stand holen“ im ök2-Admin wurde im Export-Format-Zweig **data.artworks** ungeprüft in `k2-oeffentlich-artworks` geschrieben – wenn der Server (oder eine falsche Quelle) K2-Daten lieferte, wurden Musterwerke überschrieben.
- **Fix:** (1) **Absicherung:** Im ök2-Zweig werden Werke nur noch übernommen, wenn `data.kontext === 'oeffentlich'` oder die Werke nicht wie K2 aussehen (keine 0030/0031/K2-K-*-Nummern). Sonst Console-Warnung, `k2-oeffentlich-artworks` bleibt unverändert. (2) **Musterwerke zurücksetzen:** Im ök2-Admin (Einstellungen) neuer Button „🔄 Musterwerke zurücksetzen“ – setzt `k2-oeffentlich-artworks` auf MUSTER_ARTWORKS, damit die Demo wieder den Standard zeigt.
- **Wo:** ScreenshotExportAdmin.tsx (ök2 „Aktuellen Stand holen“ else-Branch; neuer Button unter „Musterdaten löschen“).
- **Automatische Reparatur (Georg macht nichts):** Beim Lesen von ök2-Werken (Galerie oder Admin) prüft die Artworks-Schicht, ob `k2-oeffentlich-artworks` K2-Daten enthält (z. B. 0030, 0031, K2-K-*). Wenn ja → wird automatisch durch MUSTER_ARTWORKS ersetzt. Einmal Galerie oder Admin (ök2) öffnen reicht, danach ist alles wieder in Ordnung. Implementierung: `artworksStorage.ts` (repairOek2ArtworksIfContaminated in readArtworksRawForContext und readArtworksRawByKeyOrNull).

---

## Heute 10.03.26 – Presse, Öffentlichkeitsarbeit & Eventplanung direkt aus K2

- **Stand:** (1) **APf:** Zwei Karten – „Presse & Medien (K2)“ → `/admin?tab=presse`; „Öffentlichkeitsarbeit & Eventplanung (K2)“ → `/admin?tab=eventplan` (Veranstaltungen | Flyer & Werbematerial). (2) **mök2 (Sichtbarkeit & Werbung):** Zwei Links – Presse in K2, Öffentlichkeitsarbeit & Eventplanung in K2. (3) **Analyse:** docs/ANALYSE-K2-MARKT-GRUNDLAGE-PRESSE-MEDIEN.md – Grundlage K2 Markt = Presse-Tab + Eventplan-Bereich (Öffentlichkeitsarbeit & Eventplanung).
- **Nächster Schritt:** Georg: Von der APf „Öffentlichkeitsarbeit & Eventplanung“ öffnen → Admin Tab Eventplan mit Veranstaltungen / Flyer & Werbematerial in K2 testen.
- **Wo:** PlatformStartPage.tsx; MarketingOek2Page.tsx; ANALYSE-K2-MARKT-GRUNDLAGE-PRESSE-MEDIEN.md.

---

## Session-Ende 10.03.26

- **Knoten „Vom Server laden“ (Key-Abgleich) behoben:** Beim „Aktuellen Stand holen“ im Admin wurden Server-Werke nur mit `number`/`id` (z. B. 0030) in die Map eingetragen; lokale Werke mit `K2-K-0030` fanden keinen Treffer → Duplikate + Bildverlust/Platzhalter. **Umsetzung:** (1) **syncMerge.ts:** mergeServerWithLocal baut die Server-Map mit **getKeysForMatching** (alle Varianten: 0030, K2-K-0030, 30); Lookup nutzt dieselben Keys. (2) **Admin K2:** handleLoadFromServer nutzt nur noch **applyServerDataToLocal**(server, lokal, { onlyAddLocalIfMobileAndVeryNew: true }) – ein Standard, kein eigener Merge. (3) **Doku:** PROZESS-VEROEFFENTLICHEN-LADEN.md – Abschnitt 2a „Kette: Bild anlegen → Speicherung → zurück“, Abschnitt 4 Key-Abgleich-Fix; Aufrufer Admin ergänzt. Tests grün. **Commit:** 693d548 – auf GitHub.
- **18 Bilder senden/empfangen robuster (Supabase):** (1) Bild-Uploads beim Veröffentlichen in Batches (4er), nicht mehr 48 parallel – weniger Timeouts. (2) Nach dem Senden auf iPad: Meldung „X Werke, Y mit Bild“; wenn Y < X: Hinweis „vom Gerät mit den Fotos erneut senden“. (3) Supabase-Fallback: Abgleich auch mit Kurznummer (0030 etc.), damit bereits in Supabase liegende URLs genutzt werden. Doku: PROZESS-VEROEFFENTLICHEN-LADEN.md Abschnitt 5a; bei weiter fehlenden Bildern: Storage-Policy + „X mit Bild“ prüfen.
- **Bilder 30–48 – Analyse „bis 39 keine Bilder, ab 40 Platzhalter“:** Bis 39: Kein Repo-Fallback (30–39 absichtlich ausgenommen) → wenn echte URL fehlt, nur „Kein Bild“. Ab 40: Fallback-URL (werk-K2-K-0040.jpg …) wird versucht, Dateien existieren im Repo nicht → 404 → Platzhalter. Kern: Echte Bilddaten 30–48 fehlen. FEHLERANALYSEPROTOKOLL: Eintrag mit Analyse + Wiederherstellungshinweis.
- **Bilder 30–48 – zweiter Fix „Werke vom Server zurückholen“:** Der Button in Einstellungen ersetzte lokal komplett durch Server (ohne preserveLocalImageData) → lokale Bilder 30–48 gingen verloren. **Fix:** handleRestoreWerkeFromPublished nutzt jetzt preserveLocalImageData(serverList, localArtworks) vor dem Speichern; Erfolgsmeldung „lokale Bilder beibehalten“. FEHLERANALYSEPROTOKOLL ergänzt. **Commit:** folgt.
- **Bilder 30–48 am Mac nach iPad-Export (Fix):** Admin veröffentlichte mit Rohliste (readArtworksRawByKey) → Bild-URLs für 30–48 fehlten am Server, wenn Mac sie nicht in IndexedDB hatte. **Fix:** Vor jedem publishGalleryDataToServer im Admin mit **resolveArtworkImages** auflösen (Hauptablauf K2 + beide Bereinigung-Buttons). So gehen bestehende URLs und IndexedDB mit. Tests + Build grün. **Commit:** folgt.
- **Speicher-Optimierung (Fortsetzung):** Schreibpfade auf ImageStore umgestellt: (1) GaleriePage Merge-Schreiben (mergedWithImages) → `await saveArtworksForContextWithImageStore`. (2) DevViewPage: beide saveArtworksByKey (Mobile-Merge, syncMobileData) → `saveArtworksByKeyWithImageStore`. (3) GaleriePage ök2-Fetch: .then-Callback async gemacht (await saveArtworksForContextWithImageStore). (4) GaleriePage mobile-artwork-saved: Listener-Typ (listener-Wrapper für async Handler). docs/ANALYSE-DATENMENGEN-WERKE.md: Nächste Schritte 1+2 als erledigt markiert. Tests + Build grün. **Commit:** 31131fa – auf GitHub.
- **Analyse Datenmengen:** docs/ANALYSE-DATENMENGEN-WERKE.md – previewUrl bereits in prepareArtworksForStorage geleert; Schreibpfade GaleriePage, DevViewPage nun ImageStore.
- **Datenmengen / Speicher (abgeschlossen):** (1) **stripBase64FromArtworks** in `src/utils/artworkExport.ts` – entfernt Base64 aus imageUrl/previewUrl. (2) Admin: Beim „Vom Server laden“ (Merge und „Nur Server-Stand“) sowie bei „Werke vom Server zurückholen“ wird vor dem Speichern **stripBase64FromArtworks** angewendet → kein Base64 in localStorage. (3) **Regel/Doku:** komprimierung-fotos-videos.mdc und WEITERARBEITEN-NACH-ABSTURZ.md korrigiert (artworksForExport, resolveArtworkImageUrlsForExport, stripBase64FromArtworks; keine compressArtworksForExport/compressGalleryImageForExport). FEHLERANALYSEPROTOKOLL: Fehlerklasse „Datenmenge/Komprimierung/Speicher“ + Eintrag 10.03.26. Tests + Build grün. **Commit:** folgt.
- **Werke nur im Admin (abgeschlossen):** In der Galerie-Vorschau gibt es kein „Bilder laden“ / „Vom Server laden“ mehr. **Umsetzung:** (1) handleRefresh und refreshImageDelayTimerRef entfernt. (2) Initiales loadData: Wenn lokal keine Werke, nur Hinweis „Im Admin unter Einstellungen ‚Aktuellen Stand holen‘“ – kein Server-Fetch (gallery-data.json/API). (3) Toter Block (~340 Zeilen alter Server-Fetch/Merge) in GalerieVorschauPage loadData gelöscht. (4) Veröffentlichen-Erfolgsmeldung: „Am Mac Vom Server laden“ → „Im Admin unter Einstellungen ‚Aktuellen Stand holen‘“; Kommentare angepasst. Tests + Build grün. **Commit:** folgt.
- **Heute (älter):** (1) **Sync iPad ↔ Mac:** … (2)–(4) … (5) **30–39: Keine alten Repo-Bilder, neue Bilder sichtbar** – Commit b4b2c4c. (6) **„Vom Server laden“ – Fertig-Meldung zu früh:** Georg: Es lädt 70 Werke, sagt in ein paar Sekunden „fertig/schließen“, aber die **Bilder** brauchen noch Zeit zum Laden – da liegt der Hund begraben. **Umsetzung:** Zweiphasige Meldung in GalerieVorschauPage handleRefresh: zuerst „X Werke geladen. Bilder werden angezeigt…“, nach 4 s „X Werke synchronisiert…“ (dann 5 s bis Banner weg). **Commit:** folgt.
- **Ergänzung:** „In der Galerie fehlen noch viele Keramik-Bilder“ – Fallback bisher nur bei vorhandenem imageRef. Viele Werke (v. a. Keramik) haben **keinen** imageRef (z. B. nach Merge). **Fix:** Fallback-URL auch aus **number/id** ableiten: artworkImageStore resolveArtworkImages – bei fehlendem imageRef Vercel-URL aus number bauen (werk-K2-K-xxxx.jpg); GalerieVorschauPage loadArtworksResolvedForDisplay – gleicher Fallback wenn noch kein Bild. Nur 30–39 ausgenommen.
- **Mobil / Bearbeiten:** Nach Foto aufnehmen und Speichern erschien das Bild nicht sofort in der Werkkarte (neu: ok, Bearbeiten: nicht). **Fix:** Optimistic Update (setArtworks mit mobilePhoto), Bearbeiten bei leerem State (loadArtworks + nur bearbeitetes Werk updaten), kein Überschreiben durch loadArtworksResolvedForDisplay nach Bearbeiten; Blob-URLs in Karte erlaubt; 30–39: neu gespeicherte Fotos (data:image) anzeigen, artworkImageStore + Admin-Karten-Logik angepasst. **Commit:** bd18861 – auf GitHub.
- **Keramik 46–48 / Werke ab 30 auf anderen Geräten:** Am Mac fehlten nur 47/48; Geräte die vom Netz laden sahen alle Werke ab 30 ohne Bilder. **Umsetzung:** (1) **Export:** In supabaseClient.ts Früh-Absprung für 30–39 entfernt – alle Werke (1–70) kommen im Payload mit aufgelösten Bild-URLs. (2) **IndexedDB:** MOVE_TO_IDB_THRESHOLD auf 0 – jedes data:image-Bild wird in IndexedDB abgelegt, damit „An Server senden“ alle Bilder mitschicken kann. (3) **Doku:** PROZESS-VEROEFFENTLICHEN-LADEN.md – Abschnitt „Bildspeicher/Ladeproblem“ ergänzt (zuerst vom Gerät wo die Fotos liegen, z. B. iPad, „An Server senden“, dann andere Geräte „Aktuellen Stand holen“). **Commit:** 6eb2d5d – auf GitHub.
- **„Vom Server laden“ – danach keine Werke (BUG-026):** Race behoben: handleRefresh setzt die Anzeige jetzt **vor** isLoading=false (await loadArtworksResolvedForDisplay in allen Zweigen). **Commit:** 60f304e.
- **Nächster Einstieg:** Georg testen: morgen ~20 Fotos am iPad anlegen → „An Server senden“ → am Mac „Aktuellen Stand holen“ (Key-Abgleich + Komprimierung mobil sollten greifen).
- **Heute zusätzlich:** (1) iPad/Handy: „Bild übernehmen“ im Admin nutzt jetzt context **mobile** (stärkere Komprimierung), damit viele Fotos schnell speicherbar sind. (2) Doku: PROZESS-VEROEFFENTLICHEN-LADEN.md Abschnitt 5b (Viele Fotos am iPad). (3) docs/BILDER-BACKUP-NACH-NUMMER.md – Idee „parallele Datei Bilder nach Nummer“ festgehalten; erst bauen wenn Bedarf. (4) Vollbackup: Georg hat Sicherungskopie heruntergeladen; Hard-Backup v005 auf backupmicro (KL2-Galerie-Backups) ausgeführt.
- **Hinweis (10.03.26):** Versehentlich Cmd+R in Cursor – kein inhaltlicher Sprung. Anke: Marketing-Strategie (docs/AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md) bleibt Hauptaufgabe.

---

## Datum: 09.03.26 – Werke 0031/0035: Bilder neu bearbeiten + Speicherproblem gelöst

- **Stand:** Beim Bearbeiten von Werken (z. B. 0031, 0035) mit neuem Bild wurde das Bild bisher nur als große data-URL in localStorage geschrieben → Speicherproblem (Quota, evtl. Anzeige). **Umsetzung:** Beim Speichern nach Bearbeiten wird die Liste zuerst mit **prepareArtworksForStorage** vorbereitet: neues Bild (mobilePhoto) geht in **IndexedDB**, in der Liste bleibt nur **imageRef**. Danach Speichern (Supabase oder localStorage) mit der vorbereiteten Liste. Anzeige nach Speichern nutzt weiterhin loadArtworksResolvedForDisplay() → Bild kommt aus IndexedDB.
- **Nächster Schritt:** Georg testen: Werk 0031 bzw. 0035 bearbeiten, neues Bild wählen, Speichern – Bild soll dauerhaft gespeichert und in Galerie/Werkansicht sichtbar sein; kein Speicher voll / kein Platzhalter.
- **Wo nachlesen:** GalerieVorschauPage.tsx (Bearbeiten-Save-Block ~4398–4422; Import prepareArtworksForStorage, saveArtworksForContextWithImageStore); artworkImageStore.ts (prepareArtworksForStorage).

---

## Datum: 08.03.26 – Sync prozesssicher: „Vom Server laden“ + gleicher Stand Admin/Galerie

- **Stand:** (1) **GalerieVorschauPage:** „Vom Server laden“ schreibt Merge **immer** (wie GaleriePage), nur zwei Schutzfälle (Server 0 oder < 50 % lokal); cache `no-store` für alle Geräte. (2) **Admin + Galerie-Vorschau:** `storage`-Listener auf Werke-Key – wenn ein Tab localStorage ändert, aktualisieren sich die anderen Tabs (gleicher Stand Galerie vs. Admin am Mac). **Commit:** 9179375 – auf GitHub.
- **Nächster Schritt:** Georg testen: „Vom Server laden“ auf verschiedenen Geräten; Admin und Galerie in zwei Tabs – Änderung in einem Tab soll im anderen sichtbar werden.
- **Wo nachlesen:** GalerieVorschauPage.tsx (handleRefresh, storage-Listener); ScreenshotExportAdmin.tsx (storage-Listener); GaleriePage.tsx (handleRefresh als Referenz).

---

## Datum: 09.03.26 – Veröffentlichen: Bilder aus IndexedDB mitschicken (7 fehlende Bilder)

- **Stand:** Vom Handy veröffentlicht, am Mac „vom Server laden“ – Anzahl 61 passte, aber **7 Bilder fehlten**. **Ursache:** Beim Publish wurden Rohdaten aus localStorage genutzt (`loadArtworks()`); dort oft nur **imageRef**, kein imageUrl. Wenn IndexedDB auf dem Handy nicht rechtzeitig geliefert hat, schickte der Server leere Bild-URLs. **Umsetzung:** (1) **GalerieVorschauPage:** Beide Auto-Publish-Stellen nutzen `readArtworksForContextWithResolvedImages(false, false)` + `filterK2OnlyStorage` vor `publishGalleryDataToServer` – so gehen alle Bilder aus IndexedDB mit. (2) **DevViewPage:** Nach Merge (lokal + Supabase) wird `resolveArtworkImages(allArtworks)` aufgerufen; Signatur und Publish laufen mit `allArtworksWithImages`. Damit Handy und Mac alle Bilder mitschicken.
- **Nächster Schritt:** Georg testen: vom Handy veröffentlichen, dann am Mac „Vom Server laden“ – alle 61 Werke inkl. der 7 Bilder sollten da sein.
- **Wo nachlesen:** GalerieVorschauPage.tsx (beide setTimeout-Publish-Blöcke); DevViewPage.tsx (publishMobile, resolveArtworkImages); src/utils/artworkImageStore.ts (resolveArtworkImages).

---

## Datum: 09.03.26 – Prozesssicherheit überall (Launch-kritisch)

- **Stand:** Georg: „Wir müssen prozessicherheit überall herstellen, sonst ist das launchen harakiri.“ **Umsetzung:** (1) **Neue Cursor-Regel** `.cursor/rules/prozesssicherheit-veroeffentlichen-laden.mdc` (alwaysApply): Vor jeder Änderung an Veröffentlichen/Laden PROZESS-VEROEFFENTLICHEN-LADEN.md + ein-standard-problem.mdc lesen; kein zweiter Ablauf. (2) **Lade-Einstieg:** `applyServerDataToLocal(serverList, localList, options)` in `src/utils/syncMerge.ts` – ein Einstieg für mergeServerWithLocal + preserveLocalImageData; Doku ergänzt. (3) **Admin K2:** Veröffentlichen im Admin (K2) nutzt nur noch `publishGalleryDataToServer`: State in localStorage flushen, dann `publishGalleryDataToServer(readArtworksRawByKey('k2-artworks'))`; kein eigener Fetch zu write-gallery-data für K2. (4) Admin verwendet für Export-Priorität `allArtworksRef.current` (State), damit „was du siehst, geht raus“. Doku PROZESS-VEROEFFENTLICHEN-LADEN.md um Admin K2 und applyServerDataToLocal ergänzt.
- **Nächster Schritt:** Optional: GaleriePage/GalerieVorschauPage schrittweise auf `applyServerDataToLocal` umstellen (nur Refactor, Verhalten gleich). Commit + Push folgt.
- **Wo nachlesen:** .cursor/rules/prozesssicherheit-veroeffentlichen-laden.mdc, src/utils/syncMerge.ts (applyServerDataToLocal), components/ScreenshotExportAdmin.tsx (K2-Branch in publishMobile), docs/PROZESS-VEROEFFENTLICHEN-LADEN.md.

---

## Datum: 09.03.26 – Prozesssicherheit Veröffentlichen/Laden (Sportwagenmodus)

- **Stand:** Georg: Es geht um den **Prozess**, nicht um Einzelfix – Prozesssicherheit herstellen. **Umsetzung:** (1) **Ein Standard Veröffentlichen:** Zentrale Funktion `publishGalleryDataToServer(artworks)` in `src/utils/publishGalleryData.ts` – Ablauf: resolveArtworkImageUrlsForExport → artworksForExport → Payload aus localStorage → POST write-gallery-data. (2) **Alle Aufrufer** nutzen nur diese Funktion: DevViewPage (Button Veröffentlichen), GalerieVorschauPage (nach Speichern, nach neuem Werk). (3) **Doku:** docs/PROZESS-VEROEFFENTLICHEN-LADEN.md – Veröffentlichen + „Bilder vom Server laden“ einheitlich beschrieben. (4) **Regel:** .cursor/rules/ein-standard-problem.mdc um Eintrag „Veröffentlichen“ ergänzt.
- **Nächster Schritt:** –
- **Wo nachlesen:** src/utils/publishGalleryData.ts, docs/PROZESS-VEROEFFENTLICHEN-LADEN.md, ein-standard-problem.mdc.

---

## Datum: 09.03.26 – Mac 10 Platzhalter / Bilder weg nach iPad-Rescan

- **Stand:** Mac zeigt 10 Platzhalter-Fotos; die Bilder waren teilweise am Handy, nach neuem QR-Scan am iPad sind sie dort auch weg. **Ursache:** iPad nach App-Löschen/Rescan hat kein Lokal mehr → lädt nur Server-Daten; Server (statische Datei/Blob) hatte für die 10 Werke keine Bild-URLs → Platzhalter. **Doku:** docs/PLATZHALTER-BILDER-WIEDERBEKOMMEN.md – Lösung A: Wenn Handy die Bilder noch hat → Handy **Veröffentlichen**, dann Mac + iPad „Bilder vom Server laden“. Lösung B: Vollbackup wiederherstellen.
- **Nächster Schritt:** Georg prüft: Hat das Handy die 10 Bilder noch? Wenn ja → Handy veröffentlichen, dann Mac/iPad „Bilder vom Server laden“. Wenn nein → Backup prüfen.
- **Wo nachlesen:** docs/PLATZHALTER-BILDER-WIEDERBEKOMMEN.md.

---

## Datum: 09.03.26 – iPad Safari: Favorit/Startseite = alte URL (auch neuer QR nützt nichts)

- **Stand:** Georg: Selbst neuer QR-Code nützt nichts, wenn der Favorit verankert ist – Safari öffnet immer die alte URL. **Doku:** VERCEL-STAND-HANDY.md um Abschnitt „Favorit oder Startseite = alte URL“ ergänzt: Lösung = Favorit entfernen/ersetzen, Startseite prüfen; Galerie besser jedes Mal per aktuellem QR von der APf öffnen.
- **Nächster Schritt:** –
- **Wo nachlesen:** docs/VERCEL-STAND-HANDY.md (Abschnitt iPad/Handy hängt bei altem Stand).

---

## Datum: 09.03.26 – iPad: nur 10 Werke – Few-Works-Fallback (statische Datei wenn API wenig liefert)

- **Stand:** Nach App-Löschen + QR-Scan bekam iPad weiter nur 10 Werke. **Ursache:** API (Vercel Blob) enthielt nur 10 (alter Publish), statische `gallery-data.json` im Build hat 50+. **Umsetzung:** **Few-Works-Fallback:** Wenn API erfolgreich ist, aber `data.artworks.length <= 15`, zusätzlich statische `/gallery-data.json` laden; wenn die **mehr** Werke hat → diese Daten verwenden. Eingebaut in **GalerieVorschauPage** (handleRefresh / „Bilder vom Server laden“) und **GaleriePage** (loadData / Initial-Load beim QR). So bekommt iPad/QR sofort die volle Liste aus der statischen Datei, bis Blob durch „Veröffentlichen“ mit allen Werken aktualisiert ist.
- **Nächster Schritt:** Nach Push: Vercel deployen lassen, dann iPad: App neu öffnen oder QR neu scannen – es sollten alle Werke aus der statischen Datei kommen (Konsole: „📥 API hatte nur X Werke – nutze statische Datei mit Y Werken“). Optional: am Mac einmal **Veröffentlichen**, damit Blob dauerhaft aktuell ist.
- **Wo nachlesen:** GalerieVorschauPage.tsx (handleRefresh, ~Zeile 1962+); GaleriePage.tsx (loadData, ~Zeile 1455+).

---

## Datum: 09.03.26 – iPad: nur 10 Werke / Werkkatalog – API zuerst (Blob = aktuell)

- **Stand:** iPad bekam weiter nur 10 Werke, auch im Werkkatalog nur 10 Bilder. **Ursache:** „Bilder vom Server laden“ holte nur die **statische** `/gallery-data.json` (Stand vom letzten Build im Repo). „Veröffentlichen“ schreibt aber **zuerst in Vercel Blob** – die **API** `/api/gallery-data?tenantId=k2` liefert diesen aktuellen Stand. **Umsetzung:** GalerieVorschauPage handleRefresh: **API zuerst** (`/api/gallery-data?tenantId=k2`), bei Fehler Fallback auf `/gallery-data.json`. Wie GaleriePage – so kommt das iPad an den Blob-Stand (alle Werke nach Veröffentlichen). **Commit:** c69a78a – auf GitHub.
- **Nächster Schritt:** (Ersetzt durch Few-Works-Fallback oben.)
- **Wo nachlesen:** GalerieVorschauPage.tsx (handleRefresh); api/gallery-data.js (Blob lesen); api/write-gallery-data.js (Blob schreiben).

---

## Datum: 08.03.26 – Fortlaufende Werk-Nummern: kein Durcheinander (iPad/Mac/Sync)

- **Stand:** Fortlaufende Nummern abgesichert: (1) Beim **Vergaben** neuer Nummern (Mobile) wird der **bekannte Server-Max** mit einbezogen (localStorage `k2-known-max-number-M` etc.), damit nach Sync keine Doppelnummern entstehen. (2) Bei jedem **Laden von Server-Daten** (Bilder vom Server, Auto-Poll) wird dieser Server-Max aktualisiert. (3) **Vor dem Merge:** Wenn ein lokales Mobile-Werk dieselbe Nummer hat wie ein Server-Werk, aber anderes Werk (anderes id), wird das lokale Werk **umnummeriert** (nächste freie Nummer in der Kategorie), damit kein Überschreiben/Verlust entsteht.
- **Nächster Schritt:** Optional: im Alltag testen (iPad neue Werke, dann Sync – Nummern fortlaufend, keine Doppelten). Commit + Push folgt.
- **Wo nachlesen:** src/utils/syncMerge.ts (updateKnownServerMaxNumbers, getKnownServerMaxForPrefix, renumberCollidingLocalArtworks); GalerieVorschauPage.tsx (Neues Werk, Merge-Pfade); src/tests/syncMerge.test.ts (Fortlaufende Nummern).

---

## Datum: 09.03.26 – K2 Markt: Projekt abgelegt (Stand gespeichert)

- **Stand:** Georg: K2 Markt einmal abspeichern – er kommt später darauf zurück. Alles, was er jetzt braucht, macht er aus dem K2 Galerie Projekt. **Umsetzung:** Commit + Push mit aktuellem K2-Markt-Stand (Schicht mit 4 Ausgabe-Nodes: Flyer, Presse, Markt, Eventplan; Links in Admin; Glas-Fenster, Verbindungslinien, Kugel). Projekt ist auf GitHub gesichert.
- **Nächster Schritt (wenn Georg zurückkommt):** K2 Markt von Projekte-Seite oder /kreativwerkstatt öffnen; Schicht, Mappe, Tor, Eventplan/Presse-Links nutzen.
- **Wo nachlesen:** K2MarktSchichtPage.tsx; docs/K2-MARKT-STAND-ZIEL-NOETIG.md; docs/KREATIVWERKSTATT-URL-HOMEPAGE.md.

---

## Datum: 09.03.26 – K2 Markt Schicht: Optik wie Vision-Bild (Erwartungen erfüllen)

- **Stand:** Georg: Struktur war erkennbar, aber das Bild erzeugt Erwartungen – die Optik muss passen. **Umsetzung:** Schicht-Seite visuell am Vision-Bild ausgerichtet: (1) Eigenes **Glas-Fenster** mit Titelleiste „Kreativ-Schicht“, dunkler Hintergrund #0a0e17, Fenster mit backdrop-blur und türkisem Rand. (2) **Sichtbare Verbindungslinien** (Gradient-Linien) mit **laufenden Leuchtpunkten** (Animation schicht-flow-dot) zwischen links und Mitte sowie Mitte und rechts. (3) **Stärkere Kugel** (120px, kräftiger Glow, radial-gradient), einheitliche **Glas-Nodes** links und rechts (glassNode mit leichtem Schimmer), rechts **Pfeil-in-Dokument-Symbol** (→▭) für Flyer/Presse/Markt. Links Icons: Quellen 📁, mök2 </>, Kampagne 📢, Mappe 📁.
- **Nächster Schritt:** Georg testet im Browser; bei Bedarf Feinabstimmung (Leuchtstärke, Abstände).
- **Wo nachlesen:** K2MarktSchichtPage.tsx; Vision-Bild assets/Bildschirmfoto_2026-03-09….

---

## Datum: 09.03.26 – K2 Markt: Daten da, kreative/automatisierte Schicht fehlt (Richtung)

- **Stand:** Georg: Bisher bis auf das Tor nicht wirklich weiter – unter jeder Kachel zeigen wir **was schon da ist** (mök2, Mappe, Kampagne, Studio). Das als **Datenmaterial** ist richtig, aber wir haben **noch nichts Neues, Kreatives** daraus gemacht, um **automatisiert auf den Markt eintreten** zu können – **wozu KI und Agenten da sind**. Festgehalten in docs/K2-MARKT-STAND-ZIEL-NOETIG.md Abschnitt 4.
- **Nächster Schritt (Richtung):** Kreative/automatisierte Schicht bauen: Eingabe = Quellen (mök2, Kampagne, Mappe), Verarbeitung = KI/Agenten (etwas Neues erzeugen), Ausgabe = marktfähige Formate → Tor → Freigabe. Nicht nur Links zu bestehenden Bereichen.
- **Wo nachlesen:** docs/K2-MARKT-STAND-ZIEL-NOETIG.md (Abschn. 4 + 5); K2-MARKT-VISION-ARCHITEKTUR.md.

---

## Datum: 09.03.26 – K2 Markt eigenständiges Projekt, Tests + Build + Push

- **Stand:** K2 Markt = eigenständiges Projekt (wie K2 Familie), Datenquelle ök2. Homepage = Arbeitsoberfläche; netzfähig. Routen /projects/k2-markt, /mappe, /tor; kurze URL /kreativwerkstatt; Projekte-Seite + Karte; Legacy-Redirects; Doku KREATIVWERKSTATT-URL-HOMEPAGE.md. **Commit:** c1ef854 – auf GitHub.
- **Nächster Schritt:** K2 Markt nutzen (Projekte → K2 Markt oder /kreativwerkstatt); oder mök2 komplett / weitere Formate.
- **Wo nachlesen:** docs/KREATIVWERKSTATT-URL-HOMEPAGE.md; navigation.ts PROJECT_ROUTES['k2-markt'].

---

## Datum: 09.03.26 – K2 Markt aus mök2 & Kampagne speisen

- **Stand:** K2 Markt wird aus mök2 und Kampagne Marketing-Strategie gespeist; daraus werden Produkt-Momente erzeugt, die am Tor umgesetzt werden können. **Umsetzung:** (1) `src/utils/k2MarktQuellen.ts`: getMok2Quellen(), getKontaktFromStammdaten(), fetchKampagneDocPreview(), buildMomentFromQuellen(). (2) Tor lädt Momente aus static (produkt-momente.json) + localStorage (k2-markt-momente), merge nach id. (3) Tor-UI „Moment aus Quellen erzeugen“: optional Kampagne-Dokument wählen, Button „Aus mök2 & Kampagne füllen“ → Form (Titel, Botschaft editierbar) → „Moment speichern“ schreibt in localStorage, Moment erscheint in der Liste und kann freigegeben werden.
- **Nächster Schritt:** mök2 komplett weiter (eine Quelle durchziehen, weitere Sektionen); oder weitere Formate (E-Mail, Presse) mit gleichem Muster.
- **Wo nachlesen:** K2 Markt → Zum Tor; docs/MOK2-KOMPLETT-UMSETZEN.md; src/utils/k2MarktQuellen.ts.

---

## Datum: 09.03.26 – mök2 komplett umsetzen (Ziel + erster Schritt)

- **Stand:** Georg: „Wir stehen erst am Anfang – du hast mök2 und das gilt es komplett umzusetzen.“ Ziel festgehalten in **docs/MOK2-KOMPLETT-UMSETZEN.md**: was „komplett“ umfasst (alle Sektionen mit Inhalt, eine Quelle, Werbeunterlagen, APf-Struktur, K2-Markt-Verknüpfung, Druck/PDF), priorisierte Schritte. **Erster Schritt:** Platzhalter in mök2 geschlossen – „Genaue Produktbeschreibung“ mit redigierter Kurzbeschreibung (ök2 + VK2), „5. Weitere Ideen & Konzepte“ mit klarem Einleitungstext (kein Platzhalter mehr).
- **Nächster Schritt:** Eine Quelle durchziehen (Slogan/Botschaft überall); oder Sidebar/Sektionen abgleichen; oder K2 Markt aus mök2 speisen.
- **Wo nachlesen:** docs/MOK2-KOMPLETT-UMSETZEN.md; MarketingOek2Page.tsx (Sektionen mok2-produktbeschreibung, mok2-5).

---

## Datum: 09.03.26 – K2 Markt: Traceability (Freigabe-Log)

- **Stand:** Beim Freigeben am Tor wird ein Eintrag gespeichert (momentId, momentTitel, template flyer-minimal, timestamp). Log in localStorage (k2-markt-freigaben), Anzeige „Traceability – letzte Freigaben“ in der Tor-Sidebar. Typen/Konstanten in k2MarktFlyerAgent.ts (FreigabeEintrag, FLYER_TEMPLATE_ID). Handbuch aktualisiert.
- **Nächster Schritt:** Weitere Formate (E-Mail, Presse) mit gleichem Muster; oder Planer/Phasen in der Mappe vertiefen.
- **Wo nachlesen:** K2 Markt Mappe, K2-MARKT-HANDBUCH.md; Route /projects/k2-galerie/k2-markt-tor.

---

## Datum: 09.03.26 – K2 Markt: Aus einem Guss (Tor = Mappe-Struktur, Doku)

- **Stand:** Tor-Seite (K2MarktTorPage) an Mappen-Struktur angeglichen: mission-wrapper + viewport, header no-print, gleiche Link-Reihenfolge (← K2 Galerie, K2 Markt Mappe, Kampagne Marketing-Strategie). Grundsatz in Vision festgehalten: „K2 Markt soll aus einem Guss entstehen – einheitliche Struktur, eine Quelle, eine Sprache.“
- **Nächster Schritt:** Phase 2/3 ausprobieren (K2 Markt → Zum Tor), oder Phase 4 (Traceability) / weitere Formate.
- **Wo nachlesen:** K2 Markt Mappe, K2-MARKT-VISION-ARCHITEKTUR.md (Abschnitt Aus einem Guss); Route /projects/k2-galerie/k2-markt-tor.

---

## Datum: 09.03.26 – K2 Markt: A, B, C umgesetzt (Speicherort, Agent, Tor)

- **Stand:** (A) Produkt-Momente in `public/k2-markt/produkt-momente.json`, Beispiel-Moment. (B) `src/utils/k2MarktFlyerAgent.ts`: momentToFlyerEntwurf, erfuelltDoDFlyer. (C) Tor-UI: Route k2-markt-tor, K2MarktTorPage (Entwurf, DoD-Checkliste, Freigabe-Button). Link „Zum Tor“ in K2 Markt Mappe.
- **Nächster Schritt:** Phase 2/3 ausprobieren (K2 Markt → Zum Tor), oder Phase 4 (Traceability) / weitere Formate.
- **Wo nachlesen:** K2 Markt Mappe, Flyer-Agent-Doc; Route /projects/k2-galerie/k2-markt-tor.

---

## Datum: 09.03.26 – K2 Markt: Die richtige Architektur (einzigartig)

- **Stand:** Georg fragte: Wie würdest du die richtige Architektur schaffen – wir machen daraus etwas Einzigartiges. **Joe-Antwort** in docs/K2-MARKT-ARCHITEKTUR-EINZIGARTIG.md (auch in K2-Markt-Mappe): Eine Wahrheit → viele abgeleitete Formate; Qualitäts-Tor mit Definition of Done; eine Freigabe; Regeln im System (Sportwagenmodus als Code). Scharfe Architektur: Produkt-Moment → Agenten (ableiten) → Tor → Freigabe → Markt. Traceability. In Mappe als „Die richtige Architektur – einzigartig (Joe)“ eingetragen.
- **Nächster Schritt:** Mit Georg durchgehen, schärfen; oder nächste Schritte aus dem Doc umsetzen (Produkt-Moment modellieren, DoD pro Format).
- **Wo nachlesen:** K2 Markt Mappe → Die richtige Architektur – einzigartig (Joe); docs/K2-MARKT-ARCHITEKTUR-EINZIGARTIG.md.

---

## Datum: 09.03.26 – K2 Markt Mappe im Smart Panel

- **Stand:** K2 Markt hat eine **eigene Mappe** im Smart Panel (APf). Inhalt: Inhaltsverzeichnis, Vision und Architektur, Handbuch K2 Markt (Dokumentation unserer Arbeit) – sauber koordiniert und sortiert. Quelle: public/k2-markt/; Route /projects/k2-galerie/k2-markt.
- **Was zuletzt gemacht:** K2MarktPage angelegt, Route k2Markt in navigation, Smart Panel um „📁 K2 Markt“ ergänzt (nach Kampagne, in Galerie-Mappen), DevView + App Route. public/k2-markt/: 00-INDEX.md, K2-MARKT-VISION-ARCHITEKTUR.md, K2-MARKT-HANDBUCH.md. Tests + Build grün.
- **Nächster Schritt:** In der Mappe weiterarbeiten (Handbuch fortführen, nächste Schritte aus Vision umsetzen).
- **Wo nachlesen:** Smart Panel → K2 Markt; docs/K2-MARKT-VISION-ARCHITEKTUR.md; public/k2-markt/.

---

## Datum: 09.03.26 – K2 Markt (neues Projekt, Vision + Architektur)

- **Stand:** Georg hat ein neues Projekt skizziert: **K2 Markt** – App/Maschine/Mechanismus, KI-gestützt, liefert **fertige Produkte** für Sichtbarkeit am Markt. Basis: Wir-Regeln, Vermächtnis, Sportwagenmodus. Kette: fertiges Produkt → Markt suchen → Aufmerksamkeit, Platz, emotionale Ansprache + Information. Medienhaus: Abteilungen = Agenten, im Zentrum ein Bildschirm (Prüfung + Bearbeitung mit modernen Tools). mök2 + Kampagne = Vorarbeit, „große Datenbank“, noch unkoordiniert – K2 Markt soll daraus koordinierte, fertige Erzeugnisse machen.
- **Was zuletzt gemacht:** docs/K2-MARKT-VISION-ARCHITEKTUR.md erstellt: Vision, Grundlogik, Medienhaus-Bild, abgeleitete Architektur (Quelle / Agenten / Zentrale / Ausgabe), wo KI unterstützt, Anbindung an mök2/Kampagne. In docs/00-INDEX eingetragen.
- **Nächster Schritt:** Optional: Quelle strukturieren, ersten Agenten definieren, Zentrale skizzieren, Ausgabe-Formate priorisieren. Oder zuerst mit Georg durchgehen und schärfen.
- **Wo nachlesen:** docs/K2-MARKT-VISION-ARCHITEKTUR.md.

---

## Session-Ende 08.03.26

- **Heute erledigt:** Kampagne – Kommunikations-Dokumente in der App sichtbar; Fertige Beispiele (redigierte Seiten) mit konkretem Text (Flyer + E-Mails) für sofortiges Lesen und Zeigen. Commit e79891b.
- **Nächster Einstieg:** Kampagne in mök2 öffnen → „Fertige Beispiele“ oder andere Vorlagen nutzen. Optional: Presse §6 redigieren, Mehrsprachigkeit.

---

## Datum: 08.03.26 – Kampagne: Fertige Beispiele (redigierte Seiten)

- **Stand:** Georg braucht **fertige Dokumente mit Text** – nicht nur Vorlagen mit Platzhaltern. In der Kampagne gibt es jetzt **„Fertige Beispiele (redigierte Seiten)“**: Flyer und alle E-Mails mit konkretem Text (info@kgm.at, 0664 1046337, „Liebe Maria“, „Martina und Georg“ etc.) – zum sofortigen Lesen und Zeigen.
- **Was zuletzt gemacht:** docs/KOMMUNIKATION-FERTIGE-BEISPIELE.md erstellt (5 Abschnitte: Flyer, Ansprache Künstlerin, Ansprache Verein, E-Mail nach Kauf, E-Mail Einladung Test). In Kampagne DOCUMENTS + public aufgenommen; 00-INDEX und KOMMUNIKATION-DOKUMENTE-STRUKTUR ergänzt.
- **Nächster Schritt:** Optional Presse §6 redigieren oder Mehrsprachigkeit. Ansonsten: fertige Beispiele in der Kampagne nutzen.
- **Wo nachlesen:** Kampagne → „Fertige Beispiele (redigierte Seiten)“; docs/KOMMUNIKATION-FERTIGE-BEISPIELE.md.

---

## Datum: 08.03.26 – Kampagne: Kommunikations-Dokumente in der App sichtbar

- **Stand:** Die vier Kommunikations-Vorlagen liegen in der **Kampagne Marketing-Strategie** als bearbeitbare Dokumente – in der Sidebar „Inhalt der Mappe“ sichtbar und anklickbar.
- **Was zuletzt gemacht:** (1) docs → public/kampagne-marketing-strategie: KOMMUNIKATION-DOKUMENTE-STRUKTUR, ANSPRACHE, FLYER, EMAIL-VORLAGEN kopiert; 00-INDEX aktualisiert. (2) KampagneMarketingStrategiePage: DOCUMENTS um vier Einträge erweitert (Kommunikations-Struktur, Ansprache, Flyer, E-Mail-Vorlagen). Tests + Build grün.
- **Nächster Schritt:** Optional: Presse §6 redigieren oder Mehrsprachigkeit. Ansonsten Vorlagen in Phase 1 nutzen.
- **Wo nachlesen:** public/kampagne-marketing-strategie/, src/pages/KampagneMarketingStrategiePage.tsx.

---

## Datum: 08.03.26 – Kommunikation Phase 1 abgeschlossen (Sportwagenmodus)

- **Stand:** Alle Vorlagen für die erste Phase stehen: Ansprache (A/B), Flyer/Handout, E-Mail-Vorlagen (A nach Kauf, B Einladung Test). In der ersten Phase manuell nutzen; **im automatisierten Ablauf läuft dann alles im Netz** (Bestätigungen, Links aus dem System).
- **Was zuletzt gemacht:** (1) **Flyer/Handout** – docs/KOMMUNIKATION-FLYER-HANDOUT.md (eine Seite, Text + QR/Kontakt). (2) **E-Mail-Vorlagen** – docs/KOMMUNIKATION-EMAIL-VORLAGEN.md (A nach Lizenzkauf, B Einladung Test); später automatisierbar. KOMMUNIKATION-DOKUMENTE-STRUKTUR: alle drei als ✅, Kurz „Phase 1 abgeschlossen“. 00-INDEX ergänzt.
- **Nächster Schritt:** Optional Presse §6 redigieren oder Mehrsprachigkeit (wenn DE überall genutzt). Ansonsten: Vorlagen in Phase 1 nutzen; Automatik ausbauen wenn gewünscht.
- **Wo nachlesen:** docs/KOMMUNIKATION-DOKUMENTE-STRUKTUR.md, docs/KOMMUNIKATION-EMAIL-VORLAGEN.md, docs/KOMMUNIKATION-FLYER-HANDOUT.md.

---

## Datum: 08.03.26 – Ziel: 1.000 / 10.000 / 100.000 Lizenzen (Jahr 1–3)

- **Stand:** Georg setzt Ziel: Jahr 1 = 1.000 Lizenzen, Jahr 2 = 10.000, Jahr 3 = 100.000 (10× pro Jahr).
- **Was zuletzt gemacht:** Ziel in MARKTDURCHDRINGUNG-PLAN-EFERDING-WELT.md aufgenommen (Abschnitt „Ziel: Lizenzen Jahr 1–3“, Tabelle + Kurzfassung). 00-INDEX-Eintrag ergänzt.
- **Nächster Schritt:** Commit + Push.
- **Wo nachlesen:** docs/MARKTDURCHDRINGUNG-PLAN-EFERDING-WELT.md.

---

## Datum: 08.03.26 – Vermarktung automatisiert wie Lebenszyklus (Sportwagenmodus)

- **Stand:** Vermarktungsstrategie = automatisiert wie der App-Lebenszyklus: ein Ablauf pro Kanal, eine Quelle, ohne große Kosten.
- **Was zuletzt gemacht:** **docs/VERMARKTUNGSSTRATEGIE-AUTOMATISIERT-SPORTWAGENMODUS.md** erstellt: Kanäle der Kommunikation (Web, QR, Empfehlung, Lizenz/Checkout, SEO, Google Business, Social-Bio, Presse eine Vorlage + ein Verteiler, E-Mail-Signatur, Prospekt-PDF, Verzeichnisse) – je mit „Ein Ablauf / Eine Quelle“, „Was läuft automatisch“, „Kosten“. Prinzip: wie LEBENSZYKLUS (durchgängig, kein Flickenteppich). Kostenkanäle (Ads, Agentur) bewusst außerhalb Standard. 00-INDEX und Kampagnen-Mappe ergänzt.
- **Nächster Schritt:** Commit + Push. Optional: Checkliste „Vermarktung einmal einrichten“ aus dem Doc abarbeiten.
- **Wo nachlesen:** docs/VERMARKTUNGSSTRATEGIE-AUTOMATISIERT-SPORTWAGENMODUS.md.

---

## Datum: 08.03.26 – Plan Marktdurchdringung (Eferding → Welt)

- **Stand:** Technische Überlegung für **wo, wie, wann** starten (Eferding) und Marktdurchdringung bis „Welt“ ist als klarer Plan dokumentiert.
- **Was zuletzt gemacht:** **docs/MARKTDURCHDRINGUNG-PLAN-EFERDING-WELT.md** erstellt: (1) **Wo:** Eferding als Startort (Präsenz, Medien OÖ, kontrollierbar). (2) **Wie (technisch):** Einzige Lücke vor Start = Stripe Go-Live (3 Schritte); danach dieselbe Technik für Eferding, Region, Welt. (3) **Wann:** Meilensteine M1 (Stripe) → M2 (erste sichtbare Aktion Eferding) → M3 (erste Lizenz/Pilot) → M4 (regional ausweiten) → M5 (keine geografische Begrenzung). Verweise auf STRIPE-LIZENZEN-GO-LIVE, MEDIENVERTEILER-EROEFFNUNG, START-NUR-NOCH-OFFEN. 00-INDEX und kampagne-marketing-strategie/00-INDEX um den Plan ergänzt.
- **Nächster Schritt:** Commit + Push. Dann: Stripe-3-Schritte abhaken (M1), danach M2 (Presseinfo oder QR/Flyer in Eferding).
- **Wo nachlesen:** docs/MARKTDURCHDRINGUNG-PLAN-EFERDING-WELT.md.

---

## Datum: 08.03.26 – Neubewertung Programmierarbeit und Marktwert in mök2

- **Stand:** In mök2 (Marketing ök2) gibt es eine **Neubewertung (März 2026)** als eigene Sektion im Kapitel „Bewertung & Lizenzen“. Alte Bewertung (Tabelle 188.000–498.000 €) bleibt unverändert.
- **Was zuletzt gemacht:** Sektion **„Neubewertung Programmierarbeit und Marktwert (März 2026)“** in MarketingOek2Page eingefügt: Produktstand (Sportwagenmodus, Lebenszyklus, Multi-Tenant startklar, 42 Tests, Doku). Wiederbeschaffungswert **bestätigt im Rahmen 188.000–498.000 €**; Marktwert unverändert (Zahlungsbereitschaft, realistische Lizenzgebühren). Verweis auf Team-Hebel / WIR-PROZESS (tatsächlicher Aufwand grob 200 h). Sidebar mök2 um „Neubewertung (März 2026)“ ergänzt (mok2Structure.ts).
- **Nächster Schritt:** Commit + Push. Optional: in mök2 „Als PDF drucken“ prüfen.
- **Wo nachlesen:** src/pages/MarketingOek2Page.tsx (id mok2-neubewertung-2026), mök2 → Bewertung & Lizenzen.

---

## Datum: 08.03.26 – Standard in Doku und für Informatiker

- **Stand:** Erreichter Standard (Sportwagenmodus, Startklar) ist jetzt klar in Doku und im Einstieg für Informatiker verankert. Commit: 64b0b83 ✅ auf GitHub.
- **Was zuletzt gemacht:** (1) **EINSTIEG-INFORMATIKER-SYSTEM-WARTUNG.md:** Tabelle „Zentrale Einstiege“ um Zeile **Erreichter Standard / Startklar** ergänzt (PRODUKT-STANDARD-NACH-SPORTWAGEN, LEBENSZYKLUS-QUALITAETSCHECK, START-NUR-NOCH-OFFEN). Kurzfassung für den ersten Tag: Punkt 1 = Erreichter Standard lesen. (2) **00-INDEX.md:** PRODUKT-STANDARD-Zeile aktualisiert – Abschnitt „Erreichter Standard / Startklar (08.03.26)“, 42 Tests, Verweise auf LEBENSZYKLUS-QUALITAETSCHECK, START-NUR-NOCH-OFFEN.
- **Nächster Schritt:** Optional: Erfolgsseite + „Lizenz beenden“ durchtesten.
- **Wo nachlesen:** docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md, docs/EINSTIEG-INFORMATIKER-SYSTEM-WARTUNG.md, docs/00-INDEX.md.

---

## Datum: 08.03.26 – Lebenszyklus gründlicher Qualitätscheck

- **Stand:** Gesamter Lebenszyklus (Geburt → Aktives Leben → Sterben) durchgecheckt; zwei Lücken behoben.
- **Was zuletzt gemacht:** (1) **docs/LEBENSZYKLUS-QUALITAETSCHECK.md** – Prüfpunkte pro Phase, Sicherheit, Abhängigkeiten, durchgeführte Fixes. (2) **Erfolgsseite Retry:** Bei „Lizenz noch nicht gefunden“ 2× Retry nach 1,5 s und 3 s (Webhook-Race). (3) **Lizenz beenden + dynamische Mandanten:** Button auch bei `tenant.dynamicTenantId` sichtbar; `tenantId` = `dynamicTenantId ?? oeffentlich ?? vk2` an cancel-subscription. (4) 00-INDEX um LEBENSZYKLUS-QUALITAETSCHECK ergänzt. Tests 42/42 ✅, Build ✅.
- **Nächster Schritt:** (erledigt: Standard in Doku/Informatiker ergänzt.)
- **Wo nachlesen:** docs/LEBENSZYKLUS-QUALITAETSCHECK.md, docs/K2-OEK2-DATENTRENNUNG.md.

---

## Datum: 08.03.26 – Pause (Geburtskette fertig, 007 noch offen)

- **Stand:** Georg macht Pause. Alles gespeichert, Commit + Push erledigt.
- **Was zuletzt gemacht:** Komplette **Geburtskette** umgesetzt (Checkout → tenantId → URL → Erfolgsseite mit Links → Route /g/:tenantId). Code und Doku sind committed.
- **Supabase:** ✅ Erledigt (08.03.26) – Georg hat in k2-galerie-test zuerst Tabellen angelegt (003), dann 007 (tenant_id, galerie_url) ausgeführt.
- **Admin ?tenantId=:** ✅ Erledigt (08.03.26) – siehe Eintrag oben.
- **Wo nachlesen:** docs/K2-OEK2-DATENTRENNUNG.md (Lebenszyklus); supabase/migrations/007_licences_tenant_id_galerie_url.sql.

---

## Datum: 08.03.26 – Kündigung → automatisch alles gelöscht (Ablauf umgesetzt)

- **Thema:** Georg: „Und wenn er kündigt wird automatisch alles wieder gelöscht“ – Ablauf jetzt fix umgesetzt.
- **Erledigt:** (1) **api/delete-tenant-data.js** – löscht Blob `gallery-data-{tenantId}.json`, nur mit TENANT_DELETE_SECRET aufrufbar, K2 nie. (2) **api/cancel-subscription.js** – erfasst Feedback (grund, verbesserung) und löscht bei mitgesendetem **tenantId** (oeffentlich, vk2 oder sicherer Custom-Mandant) den Blob direkt per `@vercel/blob` del(). (3) **Frontend:** Beim Klick „Lizenz beenden“ wird tenantId (ök2 → oeffentlich, VK2 → vk2) mitgesendet; Erfolgstext zeigt „Die Galerie-Daten auf dem Server wurden gelöscht“, wenn gelöscht. (4) **api/webhook-stripe.js:** Bei Event **customer.subscription.deleted** wird metadata.tenantId gelesen und delete-tenant-data aufgerufen (TENANT_DELETE_SECRET). (5) **ScreenshotExportAdmin:** TS-Fehler (Klammer Zeile ~17052) behoben – zusätzliche Klammer um ternären Ausdruck. (6) **Doku:** docs/K2-OEK2-DATENTRENNUNG.md Abschnitt „Bei Kündigung“ mit Umsetzung ergänzt; docs/00-INDEX.md angepasst.
- **Hinweis:** GaleriePage-TS-Fehler (SyncMergeResult) behoben: Zeile 1915 nutzt jetzt `const { merged } = mergeServerWithLocal(...)` statt direktem Rückgabewert. Build ✅.
- **Nächster Schritt:** Commit + Push. Vercel: Optional **TENANT_DELETE_SECRET** setzen, wenn Webhook delete-tenant-data aufrufen soll.

---

## Datum: 08.03.26 – ök2: Virtual-Tour-Video bleibt sichtbar (kein Platzhalter mehr)

- **Thema:** Georg: Im ök2 ist nach dem Speichern das Video zum virtuellen Rundgang in der Galerie vorhanden und kann angesehen werden – aber nach kurzer Zeit ist nur noch ein Platzhalter da.
- **Ursache:** Das Video wurde nur als **blob:-URL** gespeichert. Blob-URLs sind nur in derselben Session/Tab gültig; danach wird die URL ungültig und die Galerie zeigt den Platzhalter.
- **Erledigt:** (1) **uploadVideoToGitHub** um optionalen Subfolder `'oeffentlich'` erweitert (githubImageUpload.ts). (2) **Beim Speichern (Schritt 3):** Wenn Virtual-Tour-Video eine blob-URL ist, wird es jetzt auch für **ök2** hochgeladen (nicht nur K2/VK2); gespeichert wird die dauerhafte URL `/img/oeffentlich/virtual-tour.mp4`. (3) **Beim Auswählen des Videos:** Für ök2 wird das Video sofort hochgeladen und die dauerhafte URL gesetzt (wie bei K2/VK2), damit es in der Galerie dauerhaft sichtbar bleibt. Tests 42/42 ✅.
- **Nächster Schritt:** Commit + Push. Georg: ök2 → Design → Virtual-Tour-Video wählen bzw. speichern → Galerie ansehen → Video sollte dauerhaft sichtbar bleiben.

---

## Datum: 08.03.26 – Stammdaten Galerie: Öffnungszeiten-Feld ergänzt

- **Thema:** Georg: „Es fehlen noch immer die Öffnungszeiten in Stammdaten Galerie – habe ich schon 5 mal gemacht.“
- **Ursache:** Im Galerie-Adresse-Block (Einstellungen → Stammdaten → Galerie-Adresse aufklappen) gab es **kein Eingabefeld** für Öffnungszeiten. Die Daten (openingHours) waren im Modell und beim Speichern/Laden schon vorgesehen – nur die UI fehlte.
- **Erledigt:** In ScreenshotExportAdmin im Galerie-Block ein Feld **„Öffnungszeiten“** eingefügt (zwischen Website und Bankverbindung), mit `galleryData.openingHours` gebunden, Placeholder „z. B. Do–So 14–18 Uhr“. Speichern/Laden war bereits korrekt (mergeStammdatenGallery, toWrite, saveStammdaten). Tests 42/42, Build ✅.
- **Nächster Schritt:** Georg: Admin → Einstellungen → Meine Daten → Galerie-Adresse aufklappen → Öffnungszeiten eintragen → Stammdaten speichern.

---

## Datum: 08.03.26 – Stammdaten: Galerie- und Künstler-Adressen getrennt, prominente Adresse

- **Thema:** Georg: Galerie-Adresse und Künstler-Adressen müssen getrennt sein. Wenn eine Galerie-Adresse eingetragen ist, ist sie immer die prominente Adresse (Impressum, alle Dokumente, Google Maps). Nur wenn keine Galerie-Adresse da ist, werden die persönlichen Künstler-Adressen genutzt – mit Hinweis unter den Künstler-Adressfeldern. Google Maps: Galerie-Adresse 1. Wahl.
- **Erledigt:** (1) **Datenmodell:** Galerie behält eigene Adresse; Martina/Georg haben eigene optionale Felder address, city, country (K2_STAMMDATEN_DEFAULTS, stammdatenStorage mergeStammdatenPerson, getEmptyOeffentlich). (2) **Admin UI:** Erster Künstler-Block: Adressfelder an martinaData gebunden (nicht mehr an galleryData); Zweiter Künstler (Georg): Adressfelder ergänzt. Unter beiden Künstler-Adressen: Hinweis „Wird nur für Impressum, Dokumente und Google Maps genutzt, wenn keine Galerie-Adresse eingetragen ist.“ Galerie-Block: Titel „Galerie-Adresse (für Impressum, Dokumente, Google Maps)“ und Beschreibung angepasst. (3) **Prominente Adresse:** getProminenteAdresse / getProminenteAdresseFormatiert in tenantConfig (Galerie zuerst, sonst Martina, sonst Georg). Überall genutzt: GaleriePage Impressum/Maps, BenutzerHandbuchPage Impressum/Maps, ScreenshotExportAdmin Events/Dokumente/Flyer/Plakat/Newsletter/Presse. Build ✅, Tests 42/42.
- **Nächster Schritt:** Commit + Push. Georg: Admin → Einstellungen → Meine Daten prüfen (Galerie-Adresse vs. Künstler-Adressen, Hinweise).

---

## Datum: 08.03.26 – Schritt-für-Schritt-Assistent entfernt (Handbuch genügt)

- **Thema:** Georg: „Schritt für Schritt Assistenten brauchen wir nicht mehr – das Handbuch genügt.“
- **Erledigt:** In ScreenshotExportAdmin: „Schritt-für-Schritt“-Karte aus beiden Hub-Listen (Guide-Banner + „Was möchtest du heute tun?“) entfernt; Tab-Typ und validTabs ohne 'assistent'; initialTab nie mehr 'assistent'; GalerieAssistent-Block und Import entfernt; HUB_CARD_BG/HUB_ICON_TINT/GRID_CARD_STYLE ohne assistent; guideAssistent/getAssistent entfernt. Build ✅.
- **Nächster Schritt:** Commit + Push. Georg: Admin prüfen – nur noch Handbuch-Link für Neueinsteiger, keine Assistenten-Karte mehr.

---

## Datum: 07.03.26 – Marketing-Strategie-Auftrag: zweiter Zweig K2 Familie in Planung

- **Thema:** Georg: In der Planung soll gleich ein **zweiter Zweig für K2 Familie** mit entworfen werden (nicht nur K2 Galerie).
- **Erledigt:** **docs/AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md** angelegt – vollständiger Auftrag für Anke/Agent mit **Zweig 1: K2 Galerie** (weltweit, automatisierter Vertrieb) und **Zweig 2: K2 Familie** (eigener Planungszweig, Raumschiff, Grundbotschaft, keine kommerzielle Verwertung der Familiendaten, Positionierung, Botschaften, bewährte Muster für vertrauenssensible Produkte, zeitliche Abfolge mit Roadmap). Beide Zweige nutzen dieselben übergeordneten Prinzipien (Sportwagenmodus, Kantisches Grundgesetz, Team-Hebel); Referenzen (Produkt-Vision, Grundbotschaft, Roadmap, Datensouveränität) eingetragen. docs/00-INDEX.md ergänzt.
- **Nächster Schritt:** Agent/Anke kann mit diesem Auftrag (inkl. beider Zweige) die Strategie erarbeiten; Output: MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md mit Zweig 1 + Zweig 2 (oder separate Datei für K2-Familie-Zweig).

---

## Datum: 07.03.26 – Benutzerhandbuch = Teil erweiterte Präsentationsmappe (für Anke mitdokumentiert)

- **Thema:** Das Benutzerhandbuch gehört zur **erweiterten Präsentationsmappe** (Prospekt 1 Seite + Benutzerhandbuch). Georg: Handbuch soll auch Teil der erweiterten Präsentationsmappe sein; Anke soll alles mitdokumentiert haben, damit sie eine gute Agentin wird.
- **Doku:** In **docs/K2-GALERIE-PRAESENTATIONSMAPPE.md** Abschnitt „8. Erweiterte Präsentationsmappe“ ergänzt: (1) Prospekt, (2) Benutzerhandbuch (Quelle `public/benutzer-handbuch`, Route `/benutzer-handbuch`). Referenzen aktualisiert.
- **App:** **PraesentationsmappePage** – in der no-print-Leiste neben „Als PDF drucken“ Link **„Benutzerhandbuch (erweiterte Mappe)“** eingebaut (führt zu `BENUTZER_HANDBUCH_ROUTE`).
- **Heute am Handbuch (07.03.26):** Kurzanleitung „Was Sie suchen → Wo nachschlagen“ im 00-INDEX; Inhaltsverzeichnis an echte ##-Punkte angepasst; Admin-Überblick um Empfehlungsprogramm, Kassabuch, Passwort, Drucker ergänzt; Druck-Styles kompakter (eine Seite gespart); **eine Version** (gute Mitte), Langversion/Ausführliche Version wieder entfernt (war zu verwirrend).
- **Für Anke:** Benutzerhandbuch = Teil der erweiterten Präsentationsmappe. Quelle: `public/benutzer-handbuch`. In der App: `/benutzer-handbuch`. Präsentationsmappe = Prospekt + Handbuch; von der PraesentationsmappePage aus per Link zum Handbuch.
- **Session Ende 07.03.26:** Ordentlich abgeschlossen – Tests ✅, Build ✅, Commit + Push. Nächster Schritt: Beim nächsten Einstieg DIALOG-STAND + Briefing lesen.

---

## Datum: 07.03.26 – Handbuch Deckblatt: beide Slogans + Auftrag ernst nehmen

- **Thema:** (1) Deckblatt soll **beide** Werbeslogans zeigen (PRODUCT_WERBESLOGAN + PRODUCT_WERBESLOGAN_2), immer zusammen. (2) Georg: „Warum nimmst du den Auftrag nicht ernst und hinterfragst das – Zeitverschwendung. Merken, auch Anke melden.“
- **Erledigt:** Deckblatt zeigt jetzt zuerst PRODUCT_WERBESLOGAN („K2 Galerie – für Künstler:innen …“), darunter PRODUCT_WERBESLOGAN_2 („Deine Kunst verdient mehr …“). Ankes Briefing ergänzt: **Auftrag ernst nehmen** – wenn Georg etwas klar formuliert hat, umsetzen statt nachfragen („Soll ich X ergänzen?“); sonst Zeitverschwendung.
- **Lehre:** Auftrag war schon gegeben („beide immer in Verbindung kommunizieren“). Nicht nochmal fragen – direkt umsetzen.

---

## Datum: 07.03.26 – Sportwagenmodus Virtueller Rundgang (Video) + Georg: „permanent drin“

- **Thema:** (1) Virtueller Rundgang Video: ein Standard – eine Funktion `handleVirtualTourVideoFile`, beide Video-Inputs (Design Seite 1 + Seite 2) nutzen sie. (2) Georg: „Warum muss ich auf Sportwagenmodus hinweisen – wir sind ja permanent drin.“
- **Erledigt:** ScreenshotExportAdmin: `handleVirtualTourVideoFile(file)` als useCallback (nach runBildUebernehmen); komplette Logik (Größe/Dauer, blob, setPageContent/setPageContentGalerie, Upload K2/VK2, Status) zentral; beide Inputs nur noch `onChange` → Aufruf dieser Funktion. VK2 nach Upload korrekt mit tenantId 'vk2'.
- **Regel:** Sportwagenmodus = Standard für alle Abläufe – von vornherein prüfen (ein Ablauf, viele Aufrufer), nicht erst wenn Georg darauf hinweist.
- **Commit:** c42c79a ✅ auf GitHub.
- **Nächster Schritt:** Georg testen: Admin → Design → Virtueller Rundgang, Video wählen auf Seite 1 und Seite 2 – gleiches Verhalten.

---

## Datum: 07.03.26 – Virtueller Rundgang Admin: nur Video-Indikator (Seite 1 + Seite 2)

- **Thema:** Georg: „Das Symbolbild ist eigentlich schon das obere Bild, unten reicht das Videosymbol, aber erkennbar ob ein Video abgespeichert ist.“
- **Erledigt:** (1) Design-Seite 1 (Virtueller-Rundgang-Karte): große Video-Vorschau entfernt; stattdessen unter „Max. 2 Min. …“ fester Bereich: bei Video „📹 Video gespeichert“, sonst „Kein Video“. (2) Design-Seite 2 (kompakte Ansicht „Optional: Virtueller Rundgang“): gleiche Logik – oben immer Symbolbild-Bereich, darunter nur kompakter Video-Indikator (📹 Video gespeichert / Kein Video), keine große Video-Vorschau mehr.
- **Nächster Schritt:** Georg testen: Admin → Design → Virtueller Rundgang (Seite 1 und Seite 2) – Symbolbild oben, unten nur erkennbar ob Video da ist.

---

## Datum: 07.03.26 – „Rundgang starten“ zeigt Video statt Bild

- **Thema:** Georg: Beim Klick auf „Rundgang starten“ kam das Bild, nicht das Video.
- **Ursache:** Button nutzte für K2 nur auf vercel.app einen Video-Fallback; auf localhost war videoSrc leer → es wurde das Bild geöffnet.
- **Erledigt:** GaleriePage – Button „Rundgang starten“ nutzt dieselbe Logik wie die Kachel: Video hat Vorrang, K2 immer mit Fallback `'/img/k2/virtual-tour.mp4'` wenn kein eigenes Video. **Commit:** abb2a1f ✅ auf GitHub.
- **Nächster Schritt:** Georg testen: Galerie → „Rundgang starten“ → Video im Vollbild.

---

## Datum: 07.03.26 – Desktop: Veröffentlicht-Kachel + Virtueller Rundgang (Bild/Video)

- **Thema:** (1) APf Desktop: „Zuletzt veröffentlicht“ von grüner Leiste zu **kleiner Kachel** (inline-flex, kompakt, „Veröff.: DD.MM.YY HH:MM“). (2) Virtueller Rundgang (Design): Bild = Symbolbild (kein Scroll, flexShrink: 0); Video getrennt unter dem Bild mit Trennlinie – beide behindern sich nicht.
- **Erledigt:** DevViewPage: Badge als kleine Kachel; ScreenshotExportAdmin: Virtueller-Rundgang-Karte mit Kommentar Symbolbild/Video getrennt, Video-Bereich mit borderTop + Abstand. **Commit:** eb54721 ✅ auf GitHub.
- **Nächster Schritt:** Georg testen: APf → kleine Kachel „Veröff.: …“; Admin → Design → Virtueller Rundgang (Bild oben, Video darunter getrennt).

---

## Datum: 07.03.26 – Kassabuch Handy (Retour + Lesbarkeit)

- **Thema:** Kassabuch auf dem Handy: Retour „Kassa“ und „Admin“ zu weit oben/schlecht sichtbar; Liste (Datum, Art, Betrag) Schrift zu hell, nicht lesbar.
- **Erledigt:** (1) Auf schmalen Viewports (≤768px): Retour-Leiste fixiert **unten** (safe-area), gut mit dem Daumen erreichbar; Buttons als sichtbare Kacheln (Rahmen, Hintergrund). (2) Tabellentext dunkel: Datum/Art/Betrag/Beleg mit `color: #1c1a17`, Verwendungszweck `#5c5650`; auf Mobile Tabelle 0.95rem. **Commit:** 16f0e01 ✅ auf GitHub.

---

## Datum: 07.03.26 – Video in Galerie ansehen (umgesetzt)

- **Thema:** Virtual-Tour-Video war in „Galerie ansehen“ nicht abspielbar – Ursache: blob-URL wurde gespeichert, beim Lesen durch Default ersetzt.
- **Erledigt:** Beim Klick „Speichern (auf diesem Gerät)“ wird virtualTourVideo, wenn es eine blob-URL ist, zuerst hochgeladen (uploadVideoToGitHub), dann die Vercel-URL in contentToSave übernommen. So wird nur noch URL in localStorage gespeichert → Video in Galerie ansehen abspielbar. **Commit:** f0d057a ✅ auf GitHub.
- **Nächster Schritt:** Optional testen: Design → Virtual-Tour-Video wählen → Speichern → „Galerie ansehen“ → Video starten.

---

## Datum: 07.03.26 – Galerie gestalten = breiter Kontext (für Anke und künftige Sessions)

- **Thema:** Georg: „Jetzt weißt du was ich gemeint habe – die Galerie gestalten ist noch sehr verwirrend. Merke dir in Zukunft: welcher Kontext hinter einer solchen Aussage von mir stecken kann. Es geht da um viele Bereiche. Auch Anke mitteilen.“
- **Erledigt:** (1) **Regel** `.cursor/rules/georg-aussage-breiter-kontext.mdc` (alwaysApply): Wenn Georg etwas „verwirrend“ nennt oder einen Bereich kritisiert, steckt oft ein **breiter Kontext** dahinter – viele Bereiche/Schritte (Workflow, Bild, Speichern, Anzeige, Platzhalter, Video, Status). Nicht nur eine Stelle fixen, sondern den ganzen Faden mitdenken. (2) **„Galerie gestalten“** konkret: Schritt 1–4 (Foto, Galerie ansehen, Speichern, Veröffentlichen), Willkommensbild/Galerie-Karte/Virtual-Tour, Bild übernehmen, Speichern/Upload, Design-Vorschau, Platzhalter wenn Bild weg, Video in Galerie ansehen.
- **Für Anke:** Bei Georg-Aussagen wie „verwirrend“ oder „Galerie gestalten“ immer den breiten Kontext einbeziehen. Regel georg-aussage-breiter-kontext.mdc lesen.

---

## Datum: 07.03.26 – Commit + Push nach jeder Aktion (frag anke / Anke Bescheid sagen)

- **Thema:** Georg: „Commiten und Pushen machst du nach jeder Aktion ja selbständig, oder nicht mehr?“ – Anke/Briefing soll es wissen.
- **Bestätigung:** Regel unverändert (auto-commit-push-nach-aufgabe.mdc): Nach jeder erledigten Programmier-Aufgabe macht Joe selbst test → build → commit → push. War in einer vorherigen Runde weggelassen worden, wurde nachgeholt.
- **Erledigt (07.03.26):** Alle offenen Änderungen committed und gepusht: APf Smart Panel ein-/ausblendbar, APf-Icon auf Galerie-Seiten ausgeblendet, Kassabuch iPhone-Scroll, Mobile-Lesbarkeit (AGB, Kunden, Werbeunterlagen, Handbücher), drei Icons unten auf Galerie entfernt. **Commit:** a047eb5 (nach Rebase 68a0cca) ✅ auf GitHub.
- **Für Anke/nächste Session:** Keine uncommitteten Änderungen mehr; „Uncommitted“ im Briefing war Stand vor diesem Push. Joe führt Commit + Push nach jeder abgeschlossenen Aufgabe durch.

---

## Datum: 07.03.26 – Anke (Briefing + Konzept)

- **Thema:** Anke – schlanker smarter Agent für unsere Arbeit (Orientierung, Stand, Offen, proaktive Vorschläge); kein zweiter Joe. **Name: Anke** (schöner deutscher Mädchenname – Joe und Anke, nicht zwei männliche Wesen).
- **Was gemacht:** (1) **docs/AGENT-KONZEPT.md** – Analyse Georgs Denk- und Handlungsweise, Spezifikation (Stand, Offen, Proaktiv), Name Anke. (2) **scripts/agenten-briefing.js** – schreibt Ankes Briefing (AGENTEN-BRIEFING.md). (3) **npm run briefing** bei Session-Start. (4) Session-Start-Regeln: Ankes Briefing lesen. (5) Grafiker-Tisch optional; Anke übernimmt die Funktion.
- **Erledigt (07.03.26):** Commit 3eedd34, d2518ef, Push. Anke = Name; Briefing bei jeder Session frisch.
- **Nächster Schritt:** Beim nächsten „Hi Joe“: Ankes Briefing auffrischen, dann DIALOG-STAND + Briefing lesen.

---

## Datum: 07.03.26 – Design-Workflow 3 + 4 (Speichern / Veröffentlichen)

- **Thema:** „Deine Galerie gestalten“ – Punkt 4 „Veröffentlichen jetzt“ ergänzt; Punkt 3/4 Texte nach Georgs Wunsch: 3 = nur „Speichern (auf diesem Gerät)“, 4 = „Veröffentlichen“ + zweite Zeile „für alle jetzt sichtbar“.
- **Erledigt:** Commit 5ae6c28 ✅ auf GitHub. Vercel baut automatisch.

---

## Datum: 07.03.26 – APf Desktop: immer in der Ansicht bleiben (kein Vollbild/neuer Tab)

- **Thema:** Georg: In der APf-Desktop-Ansicht („Was möchtest du heute tun?“) alle Arbeiten dort durchführen können – nicht in Vollbildmodus wechseln, wenn er auf einzelne Seiten geht.
- **Ursache:** In GaleriePage (Guide → „In den Admin“) wurde bei Aufruf im iframe `window.open(adminUrl, '_blank')` genutzt → neuer Tab statt im APf zu bleiben.
- **Was gemacht:** Beide Stellen in GaleriePage geändert: Im iframe (`window.self !== window.top`) wird jetzt `navigate(adminUrl + '&embedded=1')` ausgeführt – Navigation im gleichen Frame, Nutzer bleibt in der APf-Desktop-Ansicht.
- **Erledigt (weiter 07.03.26):** Session-Stand committed + gepusht (Stand-Dateien, Briefing, DIALOG-STAND, DevViewPage). **Commit:** 44a9171 ✅ auf GitHub.
- **Nächster Schritt:** Optional: Georg testen – Desktop-Ansicht → Klick zu Admin (z. B. über Guide) → soll im gleichen Fenster/iframe wechseln, kein neuer Tab. Oder: Grafiker-Tisch (Texte kürzen), anderes Thema.

---

## Datum: 07.03.26 – ro5 + weiter (Commit + Push)

- **Thema:** Georg: ro5, dann „weiter“ – offene Änderungen sichern, Stand sauber.
- **Was gemacht:** (1) ro5 in CRASH-BEREITS-GEPRUEFT eingetragen (07.03.26, frag anke). (2) QS: Tests 42/42, Build ✅. (3) Commit + Push: ScreenshotExportAdmin.tsx, CRASH-BEREITS-GEPRUEFT.md, Build-Info-Dateien. **Commit:** 6883dbe ✅ auf GitHub.
- **Nächster Schritt:** Beim Wiedereinstieg: DIALOG-STAND + Ankes Briefing lesen. Optional: Grafiker-Tisch / Texte kürzen (ök2), oder anderes Thema.

---

## Datum: 06.03.26 – Build-Fix Design-Vorschau + ro5 abgesichert

- **Thema:** JSX-Fehler in ScreenshotExportAdmin (Design-Tab Vorschau) blockierte Vercel-Build; Georg: „weiter, aber bei ro5 nicht wie Idioten dastehen“.
- **Was gemacht:** (1) **ScreenshotExportAdmin:** Vorschau-Block in Hilfsfunktion `renderDesignVorschau` ausgelagert (Einfügepunkt nach `  }`, vor `  return (`); im JSX nur noch `{designSubTab === 'vorschau' && renderDesignVorschau()}`. (2) **GaleriePage:** In `GalerieEntdeckenGuide` fehlte `useNavigate()` → `navigate` war undefined → `const navigate = useNavigate()` am Anfang der Komponente ergänzt. (3) **ro5-Doku:** In WEITERARBEITEN-NACH-ABSTURZ Abschnitt „ro5 / Code-5 – damit wir nicht wie Idioten dastehen“ + Design-Vorschau-Fix beschrieben (richtiger Weg = Auslagerung in Funktion, nicht Wrapper/IIFE). CRASH-BEREITS-GEPRUEFT Eintrag ergänzt.
- **Erledigt:** Commit 8901370, Push. Build grün, Vercel baut. Bei ro5: DIALOG-STAND + WEITERARBEITEN-NACH-ABSTURZ lesen.

---

## Datum: 06.03.26 – „Importing a module script failed“ beim Admin (K2/ök2/VK2)

- **Thema:** Von Galerie in den Admin wechseln → Fehler „Importing a module script failed“; Blockade für K2, ök2, VK2.
- **Ursache:** In **vercel.json** hat das SPA-Rewrite **alle** Pfade außer wenigen Ausnahmen auf index.html geschickt – auch **/assets/** (JS-Chunks). Wenn der Browser den Admin-Chunk (z. B. /assets/AdminRoute-xxx.js) lud, konnte Vercel stattdessen index.html ausliefern → HTML statt JavaScript → „Importing a module script failed“.
- **Was gemacht:** In der Rewrite-Regel **/assets/** (und vite.svg, manifest.json) explizit ausgenommen: `(?!assets/)` etc. in der negative-Lookahead-Liste. So werden Anfragen für JS-Chunks nie mehr auf index.html umgeleitet.
- **Nächster Schritt:** Commit + Push → Vercel baut neu. Danach testen: Galerie (K2/ök2/VK2) → Admin-Button → Admin soll ohne Fehler laden.

---

## Datum: 06.03.26 – Beim Speichern rausgeworfen, keine Werke mehr (Datenverlust-Schutz)

- **Thema:** Georg: Beim Abspeichern wieder hinausgeworfen, danach keine Werke mehr, App neu starten nötig.
- **Was gemacht:** (1) **artworksStorage:** Speichern mit **0 Werken** wird ab jetzt **immer abgelehnt**, wenn im Speicher noch Werke stehen – auch bei allowReduce. So kann kein Bug/Crash mehr die Galerie mit einer leeren Liste überschreiben. (2) **ScreenshotExportAdmin:** Im GitHub-Upload-Block wird nur noch gespeichert, wenn updatedArtworks.length > 0 (kein Überschreiben mit leerer Liste). (3) Neuer Test: „0 Werke schreiben“ bei vorhandenen Daten wird abgelehnt.
- **Wichtig für Georg – wenn Werke schon weg sind:** Admin → **Einstellungen** → **Backup & Wiederherstellung** → „Aus letztem Backup wiederherstellen“ (Auto-Backup alle 5 Sek.) oder „Aus Backup-Datei wiederherstellen“, falls du eine Vollbackup-Datei hast.
- **Nächster Schritt:** Georg prüft, ob Wiederherstellung aus Backup möglich ist; danach beim nächsten Speichern sollte der neue Schutz greifen.

---

## Datum: 06.03.26 – Freistellen: Rauswurf + Ergebnis wurde nicht übernommen

- **Thema:** Georg: Freistellen dauert am Mac lange, hat ihn rausgeschmissen; nach Neuladen war das Foto nicht freigestellt.
- **Was gemacht:** (1) **professionalImageBackground.ts:** Freistellung läuft jetzt mit `proxyToWorker: true` (Arbeit im Web Worker → Hauptthread bleibt reaktiv, kein Rauswurf), `device: 'gpu'` (schneller wo verfügbar), `model: 'isnet_quint8'` (kleiner/schneller). Timeout 90 s, danach Fallback Pro-Hintergrund ohne Freistellung. Option `maxSideForRemoval` ergänzt. (2) **ScreenshotExportAdmin:** Beim Button „Foto jetzt freistellen“ wird `maxSideForRemoval: 600` übergeben (schneller); isMounted-Ref + nur setState wenn Komponente noch gemountet, damit Ergebnis nach langem Warten trotzdem ankommt und kein setState auf unmounted.
- **Nächster Schritt:** Georg testet: Werk bearbeiten → „Foto jetzt freistellen“ – sollte nicht mehr rauswerfen, Fenster bleibt reaktiv; nach Fertigstellung erscheint das freigestellte Bild. Bei GPU-Unterstützung deutlich schneller.

---

## Datum: 06.03.26 – Artworks-Abweichungen behoben (Sportwagenmodus)

- **Thema:** Georg: „ja unbedingt“ – Abweichungen bei Artworks (VirtuellerRundgangPage, ShopPage) beheben: nicht mehr direkt `localStorage.getItem('k2-artworks')`, sondern Artworks-Schicht nutzen.
- **Was gemacht:** (1) **VirtuellerRundgangPage:** `readArtworksRawByKey` aus artworksStorage importiert, lokale `loadArtworks()` ruft jetzt `readArtworksRawByKey('k2-artworks')` auf. (2) **ShopPage:** Import `readArtworksRawByKey`; im useEffect „Alle Werke laden für Suche“ wird `readArtworksRawByKey('k2-artworks')` genutzt, Listener und Cleanup unverändert. (3) **docs/BERICHT-ABLAEUFE-SPORTWAGEN.md:** Abweichung 1 als erledigt markiert, VirtuellerRundgang + Shop in der Tabelle „Bereits standardisiert“ ergänzt.
- **Nächster Schritt:** Optional: API-Aufrufe (gallery-data, licence-data, visit) über apiClient bündeln (Bericht Abschnitt 2). Oder anderes Thema.

---

## Datum: 06.03.26 – Bild einfügen: ein Standard-Ablauf überall (runBildUebernehmen)

- **Thema:** Georg: „Ist das Bild einfügen nicht auch ein standardisierter Ablauf, der überall gleich funktionieren muss und nicht für jedes Modal anders?“
- **Was gemacht:** (1) **Ein zentraler Ablauf:** In ScreenshotExportAdmin `runBildUebernehmen(dataUrl, mode, backgroundPreset, onApplied)` eingeführt – übernimmt Verarbeitung (processImageForSave), Validierung, Statusmeldungen (⏳/✅/⚠️) und Fehlerbehandlung. (2) **Alle „Bild übernehmen“-Stellen** nutzen diese Funktion: Design (Willkommen/Galerie-Karte/Virtual-Tour), VK2 Eingangskarten, VK2 Mitglieder (Foto + Werk), Dokument hochladen, Event-Dokument. Nur die Anwendung (onApplied) ist pro Kontext unterschiedlich. (3) **Regel:** .cursor/rules/bild-einfuegen-ein-standard.mdc (alwaysApply) – neue Bild-einfügen-Stellen müssen runBildUebernehmen verwenden, kein zweiter Ablauf.
- **Nächster Schritt:** Optional Commit + Push. Georg testet: Bild übernehmen in Design, VK2, Dokument, Event – überall gleicher Ablauf und gleiche Meldungen.

---

## Datum: 06.03.26 – Design-Tab: „Bild übernehmen“ funktioniert nicht / spielt verrückt

- **Thema:** Georg: Beim Klick auf „Bild übernehmen“ im Bildverarbeitungs-Modal (Design, Willkommensbild/Galerie-Karte/Virtual-Tour) passiert etwas Verrücktes, das neue Bild wird nicht übernommen.
- **Was gemacht:** **ScreenshotExportAdmin** – Handler „Bild übernehmen“ (Design-Modal) angepasst: (1) **Stale-Closure** behoben: `field`, `dataUrlToProcess`, `fileForWelcome` am Anfang aus `pendingPageImage` auslesen und nach dem `await` nur noch diese lokalen Variablen nutzen. (2) **State-Update** mit funktionalem Updater: `setPageContent(prev => { const next = { ...prev, [field]: result }; setPageContentGalerie(next, designTenant); return next })`, damit immer der aktuelle Stand gemerged wird und das neue Bild nicht durch veraltetes `pageContent` überschrieben wird. (3) Prüfung: Wenn `processImageForSave` kein gültiges Ergebnis liefert, Fehlermeldung anzeigen statt leeren Wert zu setzen.
- **Nächster Schritt:** Georg testet: Design → Foto reinziehen → Bildverarbeitung (z. B. Original) → „Bild übernehmen“ → Bild sollte in der Vorschau erscheinen und nach Speichern bleiben.

---

## Datum: 06.03.26 – Werke verwalten: Platzhalter „Kein Bild“ – Anzeige-Fallback

- **Thema:** Georg: „Es sind noch immer Platzhalter im Werke verwalten.“
- **Was gemacht:** In **ScreenshotExportAdmin** (Werkkarten „Werke verwalten“): Zusätzlicher **Anzeige-Fallback** – wenn `imageUrl`/`previewUrl` leer sind: (1) `imageRef` nutzen, falls es eine http(s)-URL ist (Supabase/GitHub); (2) sonst Vercel-Fallback-URL bauen: `https://k2-galerie.vercel.app/img/k2/werk-{Nummer}.jpg` (wie beim GitHub-Upload). So zeigen Karten auch dann ein Bild, wenn die Liste aus einem Pfad kam, der nicht aufgelöst wurde, oder bei alten Einträgen ohne imageRef.
- **Nächster Schritt:** Commit + Push. Georg testet: Admin → Werke verwalten → Karten sollten Bilder zeigen (oder bei 404 weiter „Kein Bild“ nach onerror).

---

## Datum: 06.03.26 – ök2 „Galerie betreten“: Analyse + Regel (Variable vor Verwendung)

- **Thema:** Georg: „Jetzt gehts wieder – wodurch wurde das verändert, das musst du analysieren, solche Dinge sind sehr lästig.“
- **Was gemacht:** (1) **Analyse:** Ursache war „Variable vor Deklaration“ – im Redirect-useEffect wurde `location` verwendet, `const location = useLocation()` stand aber ~250 Zeilen weiter unten → temporal dead zone → „Cannot access uninitialized variable“. Fix war: useLocation() an Komponentenanfang. (2) **Reproduzierbarkeit:** Doku **docs/ANALYSE-OEK2-GALERIE-BETRETEN-FEHLER-06-03.md** (Ursache, Lehre, Checkliste). (3) **Regel:** **.cursor/rules/variable-vor-verwendung-hooks.mdc** (alwaysApply) – Hook-Variablen (location, navigate, state) nur verwenden, wenn der Hook vor der ersten Verwendung aufgerufen wurde; Router-Hooks am Komponentenanfang. (4) **00-INDEX:** Eintrag unter Stabilität & Crash mit Verweis auf Analyse + Regel.
- **Nächster Schritt:** Optional Commit + Push. Bei ähnlichen Fehlern: Analyse-Doc + Regel prüfen.

---

## Datum: 06.03.26 – Werkbilder: Standard-Lösung statt Eigenbau (Sportwagenmodus)

- **Thema:** Georg: „Warum nehmen wir nicht das her statt stundenlang Fehler zu suchen – wenn möglich fertige funktionierende Lösungen.“
- **Was gemacht:** (1) **SPORTWAGEN-ROADMAP** Phase 4.3 ergänzt: Werkbilder – **eine Quelle = Supabase Storage**. Kein Mix IndexedDB + GitHub + Supabase. (2) **docs/WERKBILDER-EINE-QUELLE.md** angelegt: Ziel (eine Quelle), konkrete Schritte (Supabase als einzige Upload-Ziel für Werkbilder; GitHub-Upload für Werkbilder entfernen/Fallback), betroffene Dateien. (3) **00-INDEX** Eintrag für WERKBILDER-EINE-QUELLE.
- **Nächster Schritt:** ~~Phase 4.3 umsetzen~~ → **erledigt 06.03.26:** Supabase = Standard, imageRef = URL; GitHub nur bei !isSupabaseConfigured(). Commit + Push, dann testen (mit Supabase: Werk speichern → Bild überall sichtbar).

---

## Datum: 06.03.26 – Admin „Kein Bild“: imageRef nach GitHub-Upload mitspeichern

- **Thema:** Georg: „Warum fehlen so viele Werke?“ – viele Karten in der Admin-Werkliste mit „Kein Bild“.
- **Ursache:** Nach GitHub-Upload wurde nur **imageUrl = url** gesetzt, nicht **imageRef**. Beim Reload oder auf anderem Gerät: Liste hat imageRef = k2-img-xxx, IndexedDB dort leer → resolveArtworkImages findet kein Bild → „Kein Bild“.
- **Was gemacht:** In ScreenshotExportAdmin beim Speichern nach Upload **auch imageRef = url** setzen (artworkData + in updatedArtworks). So steht die öffentliche URL dauerhaft in den Daten; resolveArtworkImages nutzt sie (bereits zuvor: imageRef mit http(s) → direkt als imageUrl). GELOESTE-BUGS BUG-021 Ergänzung 2.
- **Nächster Schritt:** Siehe oben – langfristig Phase 4.3 (eine Quelle Supabase).

---

## Datum: 06.03.26 – Platzhalter behoben (imageRef als URL nutzen)

- **Thema:** Georg: „Ich sehe noch immer Platzhalter“ trotz abgeschlossener Arbeiten.
- **Ursache:** `resolveArtworkImages` hat nur IndexedDB genutzt. Wenn Werke von Supabase/gallery-data mit **imageRef = URL** (https://…) kamen, wurde nicht als Bild geladen → Platzhalter.
- **Was gemacht:** In `src/utils/artworkImageStore.ts`: `resolveArtworkImages` – wenn `imageRef` mit `http://` oder `https://` beginnt, wird es direkt als `imageUrl` verwendet (kein IndexedDB-Lookup). Gilt für Supabase-Pfad, API-Load und alle Aufrufer. Tests 41/41, Build ✅.
- **Nächster Schritt:** Commit + Push. Georg testet: Galerie/Vorschau (Handy/Mac) → echte Bilder statt Platzhalter, sobald imageRef eine URL ist.

---

## Datum: 06.03.26 – Drei Mobil-Punkte umgesetzt (waren als „umgesetzt“ bezeichnet, stimmten aber nicht)

- **Thema:** Georg: „Du hast gesagt du hast das schon umgesetzt – warum stimmt das nicht?“ Drei Punkte waren in der Session-Zusammenfassung als erledigt genannt, im Code aber falsch oder fehlend.
- **Was gemacht:** (1) **GalerieVorschauPage:** Button „✏️ Bild bearbeiten“ nur auf **Desktop** anzeigen (auf Mobil ausgeblendet). Bedingung umgedreht: `!(/iPhone|...|| window.innerWidth <= 768)`. (2) **ScreenshotExportAdmin:** `isMobileDevice` ergänzt (iPhone/iPad/Android oder Breite ≤768). Bildverarbeitung (Original | Freigestellt | Vollkachel, „Jetzt freistellen“, Hintergrund) nur anzeigen wenn `!isMobileDevice` – auf Mobil nur Original sichtbar/nutzbar. (3) **ScreenshotExportAdmin beim Speichern:** Auf Mobil wird effektiv nur Original gespeichert: `effectivePhotoMode = isMobileDevice ? 'original' : photoImageMode` vor Freistell-Block; `imageDisplayMode` auf Mobil immer `'normal'`. Tests 41/41, Build erfolgreich.
- **Nächster Schritt:** Commit + Push. Georg testet am Handy: Werk hinzufügen → keine Freistell-Optionen; Speichern → Original; in Galerie kein „Bild bearbeiten“-Button.

---

## Datum: 06.03.26 – Sportwagenmodus: Stand, Datentransport, Bilder

- **Thema:** Stand drücken bringt nie neuen Stand; Platzhalter/Bilder fehlen in Galerie und Werk bearbeiten; Speicherpunkt unklar.
- **Was gemacht:** (1) **Stand drücken = echte Aktualisierung:** Beim Tippen auf den Stand-Badge wird auf Produktion `safeReloadWithCacheBypass()` genutzt → lädt zuerst `/refresh.html` (no-cache), dann Weiterleitung zu `/` mit Cache-Bust. So bekommt das Handy wirklich die neueste App-Version. StandBadgeSync nutzt `/api/build-info` für Abgleich. (2) **Bilder in gallery-data:** Beim Veröffentlichen werden vor dem Export alle Werke mit `resolveArtworkImageUrlsForExport()` durchlaufen → imageRef/IndexedDB wird zu Supabase-URL hochgeladen, gallery-data.json enthält echte Bild-URLs → Handy zeigt keine Platzhalter mehr (wenn Supabase konfiguriert). (3) Doku STAND-BUILD-VS-DATEN: Stand-Badge tippen, App- vs. Daten-Stand, Speicherpunkt erklärt.
- **Nächster Schritt:** Commit + Push. Georg testet: am Handy Stand tippen → neuer Stand erscheint; nach Veröffentlichen Handy aktualisieren → Bilder sichtbar. Supabase Storage muss für Bild-URLs auf dem Handy konfiguriert sein.

---

## Schluss für heute (05.03.26)

- **Thema:** Handy-Reload „keine Werke“ + mök2 Technikerzettel für Informatiker.
- **Was gemacht:** (1) GalerieVorschauPage: Bei leerem Lokal zuerst Supabase laden; wenn gallery-data.json leer liefert, Supabase-Fallback – damit Handy nach Reload Werke von Supabase bekommt. (2) mök2: Neue Gruppe „Technik“ mit Sektion **Technikerzettel (für Informatiker)** – Stack, Gesetzte Standards (allgemein), Architektur, Daten, Sicherheit, Doku, **Beurteilung Level im Vergleich** (Galerie-Websites, MVP, kleines professionelles SaaS, Open-Source), Zweck-Zettel.
- **Nächster Schritt:** Optional Commit + Push; morgen oder bei Wiedereinstieg: DIALOG-STAND + GRAFIKER-TISCH lesen, dann weiter wie geplant.

---

## 🔴 NACH ro5 / CRASH: WO DU GERADE BIST (05.03.26)

- **Thema:** K2 Familie Supabase – Raumschiff-Sync eingebaut.
- **Was gemacht:** Migration 006 (k2_familie_data), Edge Function `familie` (GET/POST), familieSupabaseClient (load+merge, save), familieStorage pusht nach jedem Save zu Supabase, Stammbaum/Person/Events/Kalender laden mit loadFamilieFromSupabase on mount. Doku K2-FAMILIE-SUPABASE-EINBAU.md ergänzt („Erledigt“).
- **Nächster Schritt:** Einmalig: Migration 006 im Supabase Dashboard ausführen; Edge Function `familie` deployen. Dann K2 Familie testen (Person anlegen → auf anderem Gerät sichtbar).

---

## Datum: 05.03.26

## Was zuletzt gemacht (05.03.26)

- **Platzhalter in Galerie nach Werk bearbeiten – lückenlos behoben (05.03.26):** Nach „Werk verändert → in Galerie zur Ansicht“ erschienen wieder viele Platzhalter. **Ursache:** Mehrere Pfade setzten die Anzeige mit Rohdaten (loadArtworks(), stored, backup, exhibitionArtworks aus .map(placeholder)) statt mit aufgelösten Bildern aus IndexedDB. **Lösung:** In GalerieVorschauPage.tsx **jeder** Aufruf von setArtworksDisplay, der Rohdaten nutzte, wurde auf loadArtworksResolvedForDisplay().then(list => setArtworksDisplay(filterK2ArtworksOnly(list))) umgestellt. Betroffen: Sync-Polling, Supabase-Fallback, handleArtworksUpdate (alle Zweige), Force-Load, Merge/Server-Load, Backup-Anzeige, Mobile-Sync, „neues Werk“- und „Werk speichern“-Handler, useEffect bei leerem artworks. Nach Speichern/Bearbeiten wird die Anzeige nun immer aus resolved (imageRef → imageUrl) neu geladen. **Nächster Schritt:** Commit + Push; Georg testet: Werk bearbeiten → Galerie zur Ansicht → keine Platzhalter mehr.

- **BUG-021 – Werk-Fotos/Platzhalter & Speicherung (05.03.26):** Werk-Fotos teilweise nicht angezeigt; Freistellung funktionierte, danach wieder wie vorher. **Ursache:** Server-Daten (gallery-data) haben keine Base64-Bilder → Merge hat lokale Bilddaten überschrieben. **Lösung:** `preserveLocalImageData()` in syncMerge.ts – nach Merge werden imageUrl/imageRef/previewUrl vom lokalen Werk übernommen, wenn Server-Eintrag kein Bild hat. GaleriePage: beide Merge-Stellen (handleRefresh + Initial-Load) rufen preserveLocalImageData vor saveArtworksForContext auf. GELOESTE-BUGS BUG-021 ergänzt. **Nächster Schritt:** Tests + Build → Commit + Push; Georg testet Galerie (Freistellung speichern, Seite neu/Refresh – Bilder sollen bleiben).

- **ro5 (05.03.26):** Reopen. Werbelinie Sportwagenmodus: PRODUKT-STANDARD-NACH-SPORTWAGEN um Abschnitt 4a Marketing-Werbelinie ergänzt (eine Quelle tenantConfig, alle Strategiepapiere ausgerichtet). SPORTWAGEN-ROADMAP 6.4 war bereits eingetragen. **Nächster Schritt:** Tests + Build → Commit + Push.

- **ro5 (05.03.26):** Reopen. CRASH-BEREITS-GEPRUEFT Eintrag. Uncommittete Änderungen: Admin-Button präsenter (GaleriePage), ggf. ScreenshotExportAdmin. **Nächster Schritt:** Tests + Build → Commit + Push.

- **Mein-Bereich: K2/VK2 ohne Zwischenschritt (05.03.26):** /mein-bereich leitet für **alle** Kontexte (K2, ök2, VK2) sofort in den Admin weiter – keine Seite „Künstler-Bereich“ oder „Vereins-Admin“ mehr. Kurzer Hinweis „Weiterleitung in den Admin …“, dann navigate mit replace. Query-Parameter (tab, from, assistent, vorname, pfad, guidetab, guidesubtab) werden durchgereicht. **Commit:** 5760df5 ✅.

- **ro5-Thema entschlackt (05.03.26):** Eine Kernregel **.cursor/rules/ro5-kern.mdc** – ro/ro5 Bedeutung, eine Pflichtregel (write-build-info nie am Ende), Verweise, Erkenntnis Abschn. 5. reopen-info.mdc verweist darauf; CRASH-BEREITS-GEPRUEFT verweist auf ro5-kern. **Commit:** fa250b1 ✅ auf GitHub.

- **Link Willkommen → Entdecken (05.03.26):** Bereits umgesetzt. WillkommenPage: `ENTDECKEN_ROUTE` importiert; in beiden Varianten (A + C) steht „In 1 Min. entdecken“ zwischen „Nur Galerie ansehen“ und „Lizenz anfragen“. Tests grün. **Nächster Schritt:** Commit + Push; optional im Browser prüfen.

- **Entdecken-Seite Hero-Bild – Ein-Klick (05.03.26):** Im K2-Admin unter **Design** oben: Bereich „Entdecken-Seite (Landing) – Bild, das Fremde zuerst sehen“ mit Button **Bild wählen**. Ein Klick → Datei wählen → Upload nach `entdecken-hero.jpg` (oeffentlich), in ca. 2 Min. auf /entdecken sichtbar. EntdeckenPage zeigt `entdecken-hero.jpg`, Fallback auf `willkommen.svg` wenn noch keins hochgeladen. Nur K2 (nicht ök2/VK2). Doku: LEAK-PRUEFUNG-ASSETS.md. **Nächster Schritt:** Commit + Push; im Admin testen (Design → Bild wählen).

- **ro5 (05.03.26, erneut):** Reopen nach Code 5. In CRASH-BEREITS-GEPRUEFT eingetragen. **Nächster Schritt:** „eine Person, eine Adresse“ (ök2) in ScreenshotExportAdmin umsetzen – im Einstellungen-Tab bei ök2 nur einen Künstler-Block anzeigen.

**Heute 05.03.26 – konkret umgesetzt (Kurzbericht):**
1. **ro5-Konvention:** „ro5“ = Reopen nach Code 5. Dokumentiert in CODE-5-GRUNDPROBLEM-UND-LOESUNG.md, reopen-info.mdc, CRASH-BEREITS-GEPRUEFT. KI erkennt es, dokumentiert kurz, macht weiter.
2. **ök2 User reinziehen – Erste Aktion:** Banner auf GalerieVorschauPage (nach „Galerie ausprobieren“): „Das ist deine Galerie. Als Nächstes: Deinen Namen eintragen.“ + „Zum Admin →“ (/mein-bereich?context=oeffentlich&tab=einstellungen). Ausblendbar. Build-Fix: doppelte dismissErsteAktionBanner entfernt.
3. **Konzept-Stand:** OEK2-USER-REINZIEHEN-KONZEPT.md – Einstieg + erste Aktion als erledigt; offen: eine Person/eine Adresse (ök2), Texte kürzen.
4. **Code-5-Doku/Skripte:** CODE-5-GRUNDPROBLEM-UND-LOESUNG.md, CODE-5-LOESUNGEN-AUS-DEM-NETZ.md, cursor-start-stabil.sh (--disable-gpu).
5. **Mein-Bereich** (bereits vorher): Route /mein-bereich, Galerie ohne Admin-Button, Parameter an Admin durchgereicht.

- **ro5 (05.03.26, 2. Reopen):** Erneut Code 5. Dokumentiert in CRASH-BEREITS-GEPRUEFT. **Nächster Schritt:** Optional: Stammdaten eine Person/eine Adresse oder Texte kürzen (OEK2-USER-REINZIEHEN-KONZEPT); sonst Raum bereit.
- **ro5 (05.03.26):** Georg: Reopen nach Code 5. ro5-Konvention dokumentiert; CRASH-BEREITS-GEPRUEFT Eintrag; Tests + Build grün. **Commit:** f003438 ✅.
- **ök2 User reinziehen – Erste Aktion Banner (05.03.26):** GalerieVorschauPage (musterOnly): Nach „Galerie ausprobieren“ erscheint Banner „Das ist deine Galerie. Als Nächstes: Deinen Namen eintragen.“ + „Zum Admin →“ (/mein-bereich?context=oeffentlich&tab=einstellungen). Doppelte dismissErsteAktionBanner entfernt (Build war vorher rot).
- **ök2 User reinziehen – Konzept (05.03.26):** docs/OEK2-USER-REINZIEHEN-KONZEPT.md: Prinzipien (Lösung zuerst, ein Weg ein Ziel, Angst/Ablenkung minimieren, eine Sache pro Bildschirm, sofort überschreibbar). Nächste Schritte: Einstieg prüfen, eine Person/eine Adresse, erste Aktion klar, Texte kürzen. Grafiker-Tisch offene Wünsche ergänzt.
- **Code-5-Lösung umgesetzt (05.03.26):** Skript **scripts/cursor-start-stabil.sh** – startet Cursor mit `--disable-gpu` (Empfehlung Cursor-Staff). Nutzung: Im Terminal am Mac aus dem Projektordner `bash scripts/cursor-start-stabil.sh`. CODE-5-LOESUNGEN-AUS-DEM-NETZ.md oben mit Hinweis ergänzt. **Nächster Schritt:** Optional: einmal so starten und testen; Commit + Push.
- **Code-5-Lösungen aus dem Netz (05.03.26):** Cursor-Forum, Staff (Dean Rie), Community durchsucht. **docs/CODE-5-LOESUNGEN-AUS-DEM-NETZ.md** erstellt: Checkliste – GPU aus (--disable-gpu), Cursor-Daten zurücksetzen (Cursor → CursorBackup), workspaceStorage/Chat-Verlauf (häufigste Ursache), Cache, Erweiterungen, HTTP/2, argv.json disable-hardware-acceleration. Reihenfolge zum Ausprobieren + Verweis in CODE-5-GRUNDPROBLEM-UND-LOESUNG. **Nächster Schritt:** Georg probiert z. B. zuerst `cursor --disable-gpu` oder workspaceStorage für dieses Projekt; optional Commit + Push.
- **Code-5-Grundproblem – eine Doku (05.03.26):** docs/CODE-5-GRUNDPROBLEM-UND-LOESUNG.md: **Grundproblem** (Ursache = Cursor/Preview + Dateischreiben + Last) und **endgültige Lösung** (Preview zu, ro-Protokoll). reopen-info.mdc + CRASH-BEREITS-GEPRUEFT verweisen darauf. **Nächster Schritt:** Commit + Push.
- **ro Antwort max 5 Sätze (05.03.26):** reopen-info.mdc: Antwort nach ro NIEMALS länger als 5 Sätze (Code-5-Schutz). **Commit:** 6539081 ✅.
- **ro endgültige Lösung (05.03.26):** Regel `.cursor/rules/reopen-info.mdc` ergänzt: **ro-Protokoll** (immer gleich: lesen → einen Schritt tun → Commit + DIALOG-STAND → **Antwort maximal kurz**, 2–5 Sätze). Lange Antworten = mehr Last beim Lesen = Code-5-Risiko. Ab jetzt bei „ro“ nur noch kurze Bestätigung + Commit + Nächster Schritt.
- **Mein-Bereich (Künstler-Einstieg, Variante B) – umgesetzt (05.03.26):** Eigener Einstieg `/mein-bereich`; auf der Galerie kein Admin-Button mehr (Besucher sehen nur Galerie). Route + MeinBereichPage (optional Passwort, K2/ök2/VK2), Query-Parameter (tab, from, assistent, …) werden beim Weiterleiten zum Admin durchgereicht. GaleriePage: Admin-Button entfernt, handleAdminButtonClick → navigate zu /mein-bereich (mit context). Vk2GaleriePage: Admin-Button führt zu /mein-bereich?context=vk2. Guide fertigStellen, EntdeckenPage oeffneTab, PlatformStartPage ?admin=true → /mein-bereich. Passwort-Hinweis in Einstellungen bereits vorhanden. Build ✅. **Commit:** 7ad4346 ✅ auf GitHub. **Nächster Schritt:** Optional im Browser /mein-bereich und Galerie (kein Admin-Button) prüfen.
- **ro / ök2 Mobil-Test – Hürden & User reinziehen (05.03.26):** Faden: App-Test ök2 mobil; User verlieren bei kleinsten Hürden das Interesse. (1) **Stammdaten ök2:** Bereits umgesetzt in `stammdatenStorage.ts`: Bei leerem localStorage liefert `loadStammdaten('oeffentlich', …)` leere Felder (`getEmptyOeffentlich`) – neue User sehen keine Musterdaten, sofort überschreibbar. Tests grün. **Nächster Schritt:** Weitere Hürden-Stellen prüfen (Einstieg, andere Felder); Konzept „User in App reinziehen“ (Angst/Ablenkung) ausarbeiten oder in Grafiker-Tisch/Notizen festhalten.
- **Crash 5 gestern – Ursache + Regeln geprüft (05.03.26):** Analyse geschrieben: **docs/CRASH-5-URSACHE-GESTERN-04-03.md**. Drei Ursachen: (1) main.tsx App-Import → volles Bundle in Preview. (2) DevViewPage Admin statisch → schwerer Chunk. (3) AdminPreviewPlaceholder fehlte → ReferenceError in iframe. Regeln-Check: write-build-info nicht am Ende ✓, kein Auto-Reload ✓, iframe-Checks ✓, Pflichtregel vor Fix ✓. CRASH-LETZTER-KONTEXT + CRASH-BEREITS-GEPRUEFT verlinkt. **Nächster Schritt:** Optional: Änderungen committen; sonst weiterarbeiten wie geplant.

## Datum: 04.03.26

## Was zuletzt gemacht (04.03.26)
- **Code 5 – Ursache behoben (04.03.26):** main.tsx importierte App/createRoot/BrowserRouter am Top-Level → in der Preview wurde trotzdem das komplette App-Bundle geladen. **Fix:** Diese Imports entfernt; App lädt nur noch per import('./appBootstrap') wenn nicht in iframe. In der Preview: nur ~7KB statt 1.6MB. Zusätzlich: DevViewPage – AdminPreviewPlaceholder definiert (fehlte), ScreenshotExportAdmin per lazy() (wird in Preview nicht geladen). CRASH-BEREITS-GEPRUEFT.md ergänzt. **Nächster Schritt:** Commit + Push; Preview testen – sollte nur „Im Browser öffnen“ zeigen, Cursor stabil.
- **Crash 5 + Push (04.03.26):** Admin im iframe (Cursor Preview) ohne schwere Base64-Werke im State (stripArtworkImagesForPreview, setAllArtworksSafe); Backup/Auto-Save nutzen loadArtworks(tenant). GaleriePage: doppelte `location`-Deklaration entfernt. Doku: CRASH-BEREITS-GEPRUEFT, CRASH-LETZTER-KONTEXT, AENDERUNGEN-HANDY-OEK2-UEBERSICHT. **Commit:** 235acc4 ✅ auf GitHub (nach Rebase). **Nächster Schritt:** Vercel baut automatisch; Preview in Cursor weiter zu, App im Browser – entlastet am meisten.
- **Änderungen beim Testuser nicht angekommen – Ursache: nicht committed (04.03.26):** Änderungen (Farben-Tab, E-Mail/Telefon/Vita/Person2, Musterdaten entfernen, ImageProcessingOptions) lagen nur lokal. **Erledigt:** Tests + Build grün → Commit + Push auf main. **Commit:** ce6681a ✅ auf GitHub. **Nächster Schritt:** Vercel baut automatisch (1–2 Min). Danach: Testuser soll **Stand-Badge tippen** (Cache-Bypass) oder **Seite neu laden / QR neu scannen**, dann sieht er die neue Version.
- **Pilot-Zettel + Testpilot-Hinweis (04.03.26):** (1) **Zettel:** Parameter `type` (oek2|vk2) aus URL; bei type=oek2 Pilot-QR in ök2-Zeile, bei type=vk2 in VK2-Zeile; Link „Neuer Test-Pilot“. (2) **Einstellungen:** Sichtbarer Hinweis „Du nutzt einen Test-Pilot-Zugang (ök2/VK2)“ in Admin → Einstellungen (nur ök2/VK2), mit Aufforderung „Meine Daten“ ausfüllen. **Commit:** 2c30d88 ✅ (nach Rebase) auf GitHub. **Nächster Schritt:** Optional: Neuer Test-Pilot durchspielen (Name, ök2/VK2, Laufzettel drucken); in ök2/VK2 Admin → Einstellungen prüfen, ob Hinweis sichtbar.
- **Pilot-Zettel – Testpilot:in ök2/VK2, voller Gratis-Zugang (04.03.26):** Zettel in **Pilot-Projekt** umgebaut: allgemein gültig, nicht personenfixiert. **Neues:** Markdown `20-PILOT-ZETTEL-OEK2-VK2.md`, Seite `/zettel-pilot` (Name + optional `pilotUrl` aus URL), **QR indexiert** (bei Pilot-URL erscheinen Adresse und passender QR auf dem Zettel). **Formular** `/zettel-pilot-form`: Name + optional Pilot-Galerie-URL eintragen → „Zettel anzeigen“ → Drucken. Mission Control, Smart Panel, Platform Start, Handbuch, mök2: alle Links auf „Pilot-Zettel“ / `/zettel-pilot-form` umgestellt. `/zettel-martina-muna` leitet auf `/zettel-pilot` weiter.
- **Lagerführung & Bewertung: Preis pro Stück überall (04.03.26):** Galeriewert und Aufteilungen (nach Künstler:in, nach Kategorie) nutzen **Preis × Stückzahl** (Lagerwert). StatistikTab: wertProWerk(a) = price × max(1, quantity). Admin-Statistik „Gesamtwert“ Verkäufe: Summe pro verkauftem Stück (jeder Verkaufseintrag = ein Stück zum Preis pro Stück), nicht pro Werk. **Commit:** f70ac99 ✅ auf GitHub.
- **Werk-Formular: Neu/Ändern, Stückzahl-Erklärung, große Vorschau, Speichern am Bild (04.03.26):** Button „Ändern“ → **„Neu/Ändern“**. Bei **Stückzahl** kurze Erklärung: „Gruppe/Set: ein Foto, Preis pro Stück – z.B. 10 Stück, ein Etikett pro Stück.“ (an beiden Stellen: ausführlich + Kompakt-Grid). **Bildvorschau** nach Auswahl größer: max. 320×280 px, nicht mehr 80×80. **Speichern** als 💾-Button **auf dem Bild** (oben rechts) – ein Klick speichert das Werk. **Commit:** 73df370 ✅ auf GitHub. **Nächster Schritt:** Im Admin prüfen (Neu/Ändern, Stückzahl-Text, große Vorschau, 💾 am Bild).
- **Gruppen/Sets (Keramik etc.) – ein Werk, Stückzahl, Etiketten (04.03.26):** Ein Werk mit **quantity** (z. B. 10) = ein Foto, ein Gruppenpreis, X gleiche Etiketten. **Etikett:** Bei quantity > 1 wird „X Stück“ unter dem Preis angezeigt. **Sammeldruck:** Pro ausgewähltem Werk wird dasselbe Etikett (artwork.quantity ?? 1)-mal gedrucken/geteilt; Button zeigt „X Werke · Y Etiketten“. **Druck-Modal nach Speichern:** Wenn savedArtwork.quantity > 1: Eingabe „Anzahl Etiketten (gleich)“ (1–99), Standard = Stückzahl; Desktop = etikettAnzahl-mal teilen/öffnen, Mobile = Hinweis „Kopien auf X stellen“. Kein neues Datenmodell – nur ein Werk mit quantity. **Commit:** 758af67 ✅ auf GitHub. **Nächster Schritt:** Im Admin testen (Werk mit Stückzahl anlegen, Etiketten drucken, Sammeldruck).
- **Trennung: Nur Lager & Kassa vs. Online-Galerie (04.03.26):** Neue Werke standardmäßig **nur Lager & Kassa** (nicht in Online-Galerie). Beim Anlegen: Checkbox „In Online-Galerie anzeigen (sonst nur Lager & Kassa)“ – unchecked = Werk erscheint in Lager, Kassa, Werkkatalog, aber nicht in der öffentlichen Galerie. Beim Bearbeiten wird der bestehende Wert übernommen. Werkkatalog: Labels „In Online-Galerie“ / „Nur Lager & Kassa“, Filter „In Online-Galerie“ / „Nur Lager & Kassa“. Mobile (GalerieVorschauPage): neu angelegte Werke mit inExhibition: false. **Commit:** a24f310 ✅ auf GitHub. **Nächster Schritt:** Im Admin testen (Neues Werk → Checkbox; Werkkatalog Filter).
- **Keine Verwirrung für User (04.03.26):** Guide- und Karten-Ansicht klar verbunden: Schließen-Button im Guide mit Titel „Schließen – danach siehst du dieselben Bereiche als Karten“. Karten-Grid-Untertitel: „Ein Klick – du bist im Bereich. Das sind alle Bereiche deiner Galerie.“ Assistent in beiden Ansichten einheitlich **„Schritt-für-Schritt“** (statt „Jetzt starten“ im Guide). **Commit:** d4ebc3c ✅ auf GitHub. **Nächster Schritt:** Optional im Admin (ök2) beide Ansichten durchklicken; oder anderes.
- **Galerie gestalten und texten – umgesetzt (04.03.26):** „Aussehen & Design“ überall in **„Galerie gestalten und texten“** umbenannt (EntdeckenPage, GalerieAssistent, Admin-Hub). Admin-Hub: abgestimmte Hintergrundfarben pro Karte, dezente Icon-Tints, **Hover-Effekte** (Lift + Schatten). Regel **standardsachen-k2-oek2-vk2.mdc**: Standardsachen gelten immer für K2, ök2 und VK2. **Commit:** 6f53c17 ✅ auf GitHub.

## Datum: 03.03.26

## Was zuletzt gemacht (03.03.26)
- **Schluss für heute (03.03.26):** Sichtbarkeit/Sitemap – technisch erledigt; Search Console Sitemap eingereicht, Status war noch „konnte nicht abgerufen werden“. **Morgen:** In Search Console unter Sitemaps prüfen, ob Status auf Erfolg und „Erkannte Seiten“ umspringt. Georg-Tipp in Crash-Doku: klein halten, keine Türme.
- **Sitemap für Google (03.03.26):** Sitemap minimal (nur &lt;loc&gt;), **api/sitemap.js** + Rewrite /sitemap.xml → /api/sitemap. Search Console: Verifizierung + Sitemap eingereicht; Status war noch „konnte nicht abgerufen werden“ (kann vom alten Versuch sein). **Nächster Schritt (04.03.):** In Search Console prüfen ob Sitemap jetzt „Erfolg“ zeigt und „Erkannte Seiten“ &gt; 0.
- **Internet gefunden werden – Sitemap + robots.txt (03.03.26):** Fehlende Technik für Suchmaschinen ergänzt: **public/sitemap.xml** (alle öffentlichen URLs: Willkommen, Entdecken, AGB, Galerie, Demo, Shop, Virtueller Rundgang, Vita Martina/Georg) und **public/robots.txt** (Allow / + Sitemap-URL). Suchmaschinen können alle Seiten entdecken. Agenda + Konzept-Doku aktualisiert. **Nächster Schritt:** Commit + Push; nach Deploy prüfen: https://k2-galerie.vercel.app/sitemap.xml und https://k2-galerie.vercel.app/robots.txt.
- **QR Gleichstand – gleiche Daten wie Mac, keine Musterbilder (03.03.26):** API-Aufruf in GaleriePage (loadData + handleRefresh) **immer mit `tenantId=k2`**, damit nur der K2-Blob geladen wird. Guard: Server-Daten nur anwenden wenn `!musterOnly && !vk2` (K2-Route); sonst data = null, keine K2-Keys beschrieben. Doku STAND-BUILD-VS-DATEN.md um Abschnitt „QR = Gleichstand“ ergänzt. **Nächster Schritt:** Commit + Push; QR testen (Veröffentlichen → QR scannen → nur K2-Daten, keine Muster).
- **QR / Handy alte Daten – Ursache behoben (03.03.26):** GaleriePage lud auf dem Handy (vercel.app) **zuerst** die statische `/gallery-data.json` (Build-Stand) statt der API. „Veröffentlichen“ schreibt in **Vercel Blob** (API); die Lese-API `/api/gallery-data` liest aus dem Blob. **Fix:** loadData ruft **immer zuerst** `GET /api/gallery-data` auf, nur bei Fehler Fallback auf statische Datei. Eine Quelle = Blob. Doku: STAND-BUILD-VS-DATEN.md, GELOESTE-BUGS.md BUG-018. Zusätzlich: WerbeunterlagenPage QR mit buildQrUrlWithBust; vercel.json Cache-Control für /api/gallery-data; GaleriePage-Hinweis „Jetzt an Server senden, dann Stand & Daten / QR“. **Nächster Schritt:** Commit + Push; am Mac „Jetzt an Server senden“, dann QR auf Handy scannen – Handy soll aktuelle Daten zeigen.
- **Prospekt (ehem. Präsentationsmappe) – 3 Zeilen + Impressum (03.03.26):** Oberer Bereich in PraesentationsmappePage auf **genau 3 Zeilen** redigiert (Titel, Tagline + Lead in einer Zeile, Plattformen/Lizenzen kompakt). **Impressum** unten eingebaut: Medieninhaber, kgm solution, Kontakt (PRODUCT_LIZENZ_ANFRAGE_EMAIL), PRODUCT_COPYRIGHT – fertig zum Beifügen zu jedem Pressetext und überall als Kurzinformation mitsenden. Button-Text: „Als PDF drucken (1 Seite)“. Print-CSS: Impressum-Link beim Druck dezent (gleiche Farbe wie Text). **Nächster Schritt:** Commit + Push; optional Druck prüfen (eine Seite).
- **Presse & Medien vs. Events – Abgrenzung, keine Dopplung (03.03.26):** Doku MEDIENSTUDIO-K2.md: neuer Abschnitt „Abgrenzung: Presse & Medien vs. Events & Ausstellungen“ (Tabellen: wann Presse-Tab = Medienkit/Vorlage/Stories, wann Eventplan = Presseaussendung pro Event). Verknüpfung in der App angepasst. **In der App:** Presse-Tab: Hinweis „Presseaussendung zu einem konkreten Event? → Events & Ausstellungen → Event wählen → Presseaussendung“ (mit Klick zu Eventplan). Eventplan: bei Presseaussendung-Karte Beschreibung ergänzt: „Für dieses Event – … Medienkit & allgemeine Texte: Presse & Medien.“ 00-INDEX MEDIENSTUDIO-Eintrag um Abgrenzung ergänzt. **Commit:** 7daf1b5 ✅ auf GitHub. **Nächster Schritt:** Optional K2/ök2 testen.
- **Medienstudio für User – Phase 1 umgesetzt (03.03.26):** Tab „Presse & Medien“ im Admin: Medienkit (aus Stammdaten, K2/ök2/VK2 kontextfähig), Button Kopieren; Presse-Vorlage mit Anlass/Datum/Ort, „In Zwischenablage“. Hub-Kacheln und Bereichs-Karten ergänzt. ök2-Hinweis „Demo – in Ihrer Galerie …“. **Commit:** d7f12a3 ✅ auf GitHub. **Nächster Schritt:** K2 testen, dann ök2 prüfen; optional Phase 2 (Pressekontakte), Phase 3 („Presseinfo verschickt“ an Events).
- **Medienstudio für User – Produkt-Feature verbindlich (03.03.26):** Konzept docs/PRODUKT-MEDIENSTUDIO-USER.md: Presse & Medien für Künstler:innen und Kunstvereine – Medienkit aus Stammdaten, Presse-Vorlage (Phase 1), optional Pressekontakte + „Presseinfo verschickt“ an Events (Phase 2/3). In 00-INDEX, FEATURES-ABHEBUNG-ZIELGRUPPE (hohe Priorität, Reihenfolge Nr. 2) und SPORTWAGEN-ROADMAP Phase 10 eingetragen. **Commit:** c98fd34 ✅ auf GitHub. **Nächster Schritt:** Medienstudio Phase 1 umgesetzt – Tab „Presse & Medien“ mit Medienkit + Presse-Vorlage. Du kannst K2 testen (Admin → Presse & Medien), dann ök2 prüfen.
- **Medienstudio K2 – Verlinkungen (03.03.26):** MEDIENSTUDIO-K2.md als zentraler Einstieg für Presse/Medien eingebunden: PRESSEARBEIT-STANDARD, MEDIENVERTEILER, SICHTBARKEIT-PHASE1-VORLAGEN, SICHTBARKEIT-WERBUNG-AGENDA (Punkt 6), mök2 Sichtbarkeit und docs/00-INDEX verweisen darauf. Kurztext in MEDIENSTUDIO-K2: „wie ein eigenes kleines Medienstudio“. **Commit:** 5d426c5 ✅ auf GitHub.
- **Sichtbarkeit – alles von Joe erledigt (03.03.26):** Agenda mit „Von Joe erledigt“ / „Braucht Georg“ (2, 3, 6, 7). Phase1-Vorlagen: Hinweis „du (Georg) führst aus“. mök2: „Braucht dich“ statt „Noch offen“. EntdeckenPage: Empfehlungsprogramm-Zeile in Fußzeile. **Commit:** 90f338a ✅. **Nächster Schritt:** Wenn du willst, Punkte 2, 3, 6, 7 nacheinander – Vorlagen/Listen stehen; ich brauche dich dafür.
- **mök2 Sichtbarkeit & Werbung:** Konzept-Doku `docs/SICHTBARKEIT-SUCHMASCHINEN-WERBUNG-KONZEPT.md` (Suchmaschinen, Verbreitung, ohne/mit Kosten). Sektion „Sichtbarkeit & Werbung“ auf Marketing-ök2-Seite mit Kurzfassung + Verweis auf Doku; in mök2-Sidebar verlinkt, druckbar. **Commit:** 61d176b ✅ auf GitHub.
- **Kassabuch – Lizenzstufen:** Vollständiges Kassabuch nur ab **Pro+**. **Pro** = Kassa (Verkauf erfassen) ja, Kassabuch nur Verkäufe (Eingänge), keine Ausgänge. **Basic** = keine Kassa. Speicher: k2-lizenz-stufe / k2-oeffentlich-lizenz-stufe (basic | pro | proplus). Default K2 = proplus, **ök2 = proplus** (voller Betriebsumfang in der Demo). KassaEinstiegPage: Basic → Hinweis „Kassa ab Pro“; Pro → nur „Erhalten“, kein „Auszahlen“. ShopPage: „Als Kasse öffnen“ und „Auszahlen“ nur bei passender Stufe. KassabuchPage: Basic → Hinweis; Pro → nur Verkäufe, kein Toggle, kein „Neuer Kassausgang“. KassausgangPage: ohne Pro+ → Hinweis „Nur mit Pro+“. Control Studio Kasse-Tab: ohne Kassa „Lizenz ansehen“. Agenda-Doku ergänzt. **Commit:** cd7e65c ✅ auf GitHub.
- **Kassabuch führen in Einstellungen (03.03.26):** „Kassabuch führen“ als wichtiger Punkt in **Admin → Einstellungen** eingebaut: direkt unter der Überschrift, mit **Ja** / **Nein**-Buttons. Nur für K2/ök2 und wenn Kassa verfügbar (ab Pro). Erklärung: Ja = vollständiges Kassabuch (Eingänge + Ausgänge), Nein = nur Verkäufe (Eingänge). **Commit:** 542b44a ✅ auf GitHub.
- **Kassabuch – alles aus Agenda umgesetzt:** (1) Kassaeingänge aus Verkäufen. (2) Einstellung Kassabuch führen Ja/Nein. (3) PDF-Export. **Commit:** 2f9bd0f, a5af566 ✅ auf GitHub.

## Datum: 02.03.26

## Heute diese Session (Schluss für heute) – **WAS WIR GEMACHT HABEN**
- **K2 Familie gegründet / aufgebaut (02.03.26):** Phasen 1.1–4.2 – Beziehungsmodell, Tenant, Stammbaum, Personen, Momente, Events, Kalender, Familien-Auswahl (Dropdown + „Neue Familie“), Homepage, Erste Schritte, Musterfamilie Huber. Stammbaum-Grafik (SVG), Plakat drucken, Spielplatz-Feeling, Grundbotschaft, Rechte/Zweige vorbereitet. Siehe Einträge weiter unten im DIALOG-STAND (alle 02.03.26).
- **Upgrade-Info in Lizenzinformation:** Einstellungen → Lizenzinformation: Block „Wie kann ich upgraden?“ (Einstellungen → Lizenz abschließen, höhere Stufe wählen). Kein E-Mail-Hinweis mehr („keine mail rückantwort“).
- **Lizenz-Erfolg: ausdruckbare Bestätigung:** Nach Stripe-Checkout zeigt LizenzErfolgPage eine Lizenzbestätigung (K2 Galerie, Datum, Referenz) und Button „Bestätigung drucken“ – verbindlich und vertrauenserweckend, ohne dass ihr in Kontakt tretet.
- **Gesetz: Kein direkter Kundenkontakt:** Regel `.cursor/rules/k2-kein-direkter-kundenkontakt.mdc` (alwaysApply): K2-Welt baut keinen direkten Kundenkontakt auf; bei Skalierung weder möglich noch sinnvoll. Automatik und Sachlichkeit; Druckbestätigung ja, persönliche E-Mail/Betreuung nein. PRODUKT-VISION.md um Abschnitt „Gesetz: Kein direkter Kundenkontakt“ ergänzt.
- **ro check crash:** Keine neuen Crash-Quellen; Upgrade-Info nur statischer JSX. CRASH-BEREITS-GEPRUEFT + CRASH-LETZTER-KONTEXT aktualisiert.
- **Commit:** 4f60cdb ✅ (Lizenz/Upgrade/Bestätigung/Gesetz). K2-Familie-Arbeit war bereits vorher committed (mehrere Commits 02.03.26).
- **K2 Familie – Gedenkort (Konzept, 02.03.26):** Ort „Die uns vorausgegangen sind“ – Gedenken an Verstorbene, Gaben hinterlassen (Blume, Kerze, Text, Foto). **Sichtbarkeit:** **privat** (nur für mich, niemand sieht) und **öffentlich** (für die Familie). Konzept: `docs/K2-FAMILIE-GEDENKORT.md`; Roadmap Phase 5 ergänzt. **Commit:** ce085d1 ✅
- **K2 Familie – Startpunkt & aktiv/passiv (02.03.26):** Beim Beginnen: Wo starte ich? (Bei mir / Eltern / Großeltern). **Aktiver Teil** = Bereich, den ich pflege; **passiver Teil** = Vergangenheit, Gedenkort. **Organische Struktur:** Passiver Teil = „Was unsere Familie dazu weiß“ – viele können zu derselben Person (Vorfahre) beitragen (Erinnerung, Korrektur, Foto, Datum); niemand besitzt die Vergangenheit. Konzept: `docs/K2-FAMILIE-STARTPUNKT-AKTIV-PASSIV.md`; in Roadmap Phase 4 verlinkt. **Commit:** ce085d1 ✅
- **K2 Familie – Szenario Geschwister-Geschenk (02.03.26):** Eine Person legt Grundstruktur (Eltern + Geschwister), lädt Geschwister ein; jeder trägt seinen Teil zur Vergangenheit bei; Erinnerungsebene „darunter“ = wer etwas weiß. Was es braucht: Doku `docs/K2-FAMILIE-SZENARIO-GESCHWISTER-GESCHENK.md` (Zugang für mehrere, Schutz Grundstruktur, Beiträge-Umsetzung). **Commit:** 63c5942 ✅
- **K2 Familie – Cloud & Lizenz/Kosten (02.03.26):** Gemeinsamer Ort = Cloud (verbindlich für Lizenzprodukt). Faire Kostenstruktur: wer (Gründer, eine Lizenz pro Familie), wann (jährlich/monatlich), wo (in der App), wie (Stripe). Doku `docs/K2-FAMILIE-LIZENZ-KOSTEN.md`; Szenario Geschwister-Geschenk auf Cloud-Ziel angepasst; Roadmap verlinkt. **Commit:** 3277308 ✅
- **K2/ök2 Kassa – Agenda Kassabuch (02.03.26):** Kassabuch steuerberatergeeignet: Kassaeingänge (Verkäufe), Kassausgänge, Bar privat, Bar mit Beleg (QR-Code einscannen oder Foto), Kassa an Bank, optional „Kassabuch führen Ja/Nein“. Doku **docs/K2-OEK2-KASSABUCH-AGENDA.md**; in 00-INDEX unter Kassa verlinkt. **Commit:** 5ebf03b ✅ **Nächster Schritt:** Bei Umsetzung Agenda als Spezifikation nutzen (Datenmodell, Keys K2/ök2, Bereich unter „Kassa, Lager & Listen“).
- **K2 Familie – Datensouveränität (02.03.26):** Auch bei Einstellung des Betriebs bleiben Familiendaten 100 % verfügbar und erhalten; ausdruckbar und privat abgespeichert (Export). Cloud-Platz entfällt dann – deshalb Export/Druck von Anfang an anbieten und **gut kommunizieren**. Doku **docs/K2-FAMILIE-DATENSOUVERAENITAET.md**; verlinkt in Grundbotschaft, Lizenz-Kosten, Roadmap, 00-INDEX. **Commit:** 067cac3 ✅
- **K2 Familie – Datenschutz & Sicherheit (02.03.26):** EU-Datenschutz (DSGVO) selbstverständlich. Garantie: **Keine Daten verlassen den Familienraum** (Tenant-Isolation, kein Verkauf/Sharing, Zugriff nur für die Familie). **Schutz vor Hacking:** HTTPS, Verschlüsselung at rest, Zugriffskontrolle, RLS, keine Secrets im Code, regelmäßige Prüfungen; ehrlich: „100 % unknackbar“ nicht versprochen, aber alle angemessenen Maßnahmen. Doku **docs/K2-FAMILIE-DATENSCHUTZ-SICHERHEIT.md**; verlinkt in Datensouveränität, Grundbotschaft, Roadmap, 00-INDEX. **Commit:** e3f9717 ✅
- **K2 Familie – Genom: Daten gehören der Familie, keine kommerzielle Verwertung für immer (02.03.26):** In das Genom eingepflanzt: Daten gehören der Familie und dürfen nur dort Verwendung finden; **kommerzielle Verwertung absolut für immer ausgeschlossen** – denn wenn die Sache groß wird, wächst die Versuchung zu manipulieren; wer kennt die Zukunft. Grundbotschaft (Kern Nr. 5 + eigener Abschnitt „Genom“), Regel k2-familie-grundbotschaft.mdc, Datenschutz-Doku ergänzt.

## Wo wir stehengeblieben (aktuell) – **HIER EINSTEIGEN**
- **PDFs & Speicherdaten + Kassa/Lager im Admin (02.03.26):** Georg: „PDFs & Speicherdaten“ gehört nicht in Einstellungen, sondern zu Kassa/Lagerdaten; Werkkatalog und „die ganzen Kassa- und Lagerdaten und Listen“ sollen im Admin sichtbar sein. **Umsetzung:** (1) Block „PDFs & Speicherdaten“ aus Einstellungen entfernt und in den **Statistik-Tab** verschoben (unter Verkaufsstatistik, nur K2/ök2). (2) Hub-Karte und Bereichs-Kopf: „Verkaufsstatistik“ → **„Kassa, Lager & Listen“** mit Untertitel „Verkaufsstatistik, PDF-Export und Speicherdaten – alles an einem Ort.“ So findet Georg Kassa, Lager, Werkkatalog und PDFs/Speicherdaten an einer Stelle im Admin. **Commit:** 871fe4f ✅ auf GitHub.
- **Besucherzähler VK2 getrennt: Mitglieder / Extern (02.03.26):** VK2-Besucher werden getrennt gezählt: **Mitglieder** (nach Mitglied-Login, sessionStorage k2-vk2-mitglied-eingeloggt) und **externe Besucher**. **Erfassung:** Vk2GaleriePage meldet einmal pro Session an POST /api/visit mit tenant `vk2-members` oder `vk2-external`; GaleriePage bei tenantId vk2 ebenso (gleicher Session-Key). **API:** tenant_id `vk2-members` und `vk2-external` erlaubt; Migration 005 erweitert visits-Check und legt Zeilen an. **Anzeige:** Übersicht-Board und Arbeitsplattform zeigen „VK2 Mitglieder: X · VK2 Extern: Y“. **Nächster Schritt:** Migration 005 im Supabase-Dashboard ausführen (nach 004).
- **Besucherzähler K2/ök2 im Admin (02.03.26):** **Erfassung:** GaleriePage meldet einmal pro Session pro Tenant (k2/oeffentlich/vk2) an POST /api/visit – nur wenn nicht in iframe (Cursor Preview), K2 nur wenn Admin nicht freigeschaltet. **Anzeige:** Übersicht-Board zeigt Besucher-Kachel mit K2 / ök2 / VK2; Arbeitsplattform (PlatformStartPage) zeigt „👁 Besucher … → Details“. **Supabase:** Migration 004 + 005 (visits) im Dashboard ausführen.
- **Start – nur notwendige Restriktionen offen (02.03.26):** **docs/START-NUR-NOCH-OFFEN.md** – eine Stelle: was noch offen (nur 3 Stripe-Schritte + optional AGB/npm audit), was startbereit (Galerie, Willkommen, Lizenzen-Code, Export, K2/ök2/VK2). VOR-VEROEFFENTLICHUNG verweist darauf; 00-INDEX ergänzt. Keine weiteren Blockaden.
- **ök2 Priorität 3 – WillkommenPage wieder Einstieg (02.03.26):** Redirect entfernt. /willkommen zeigt Variante A/C mit „Galerie ausprobieren“, **„Lizenz anfragen“** (mailto), **„Lizenz online kaufen“** (Stripe). OEK2-ANMELDUNG Priorität 3 ✅.
- **Stripe/Lizenzen + Sportwagen (02.03.26):** Code fertig (API licence-data, Export CSV/PDF). **Die nächsten 3 Schritte** (nichts vergessen): **docs/STRIPE-LIZENZEN-GO-LIVE.md** – 1) Supabase Migration 003 ausführen, 2) Vercel Env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY), 3) Stripe Webhook konfigurieren. **Sportwagenmodus:** SPORTWAGEN-ROADMAP Phase 7.3 (Lizenzen & Zahlungen) ergänzt; PRODUKT-STANDARD um Lizenzen/Zahlungen erweitert; eine Doku, eine API, Go-Live-Checkliste. **Nächster Schritt:** Die 3 Schritte in STRIPE-LIZENZEN-GO-LIVE.md abarbeiten (oder Georg führt sie aus).
- **Stripe Zahlungssystem implementiert (02.03.26):** **Backend:** create-checkout.js, webhook-stripe.js (siehe oben + DB-Schreiben). **Frontend:** LizenzKaufenPage, LizenzErfolgPage; Link „Lizenz online kaufen“ auf LicencesPage und LicenseManager. **Commit:** 6f2c2c8 ✅ auf GitHub.
- **Empfehlungsprogramm im Lizenzthema sichtbar (02.03.26):** Damit es nicht untergeht: **LicenseManager** (Projektplan) – eigener Block „🤝 Empfehlungsprogramm“ mit Kurztext + Links „Lizenzen vergeben“ und „Empfehlungstool“. **LicencesPage** – Unter „Neue Lizenz vergeben“ Hinweiszeile: „Empfehlungsprogramm: Empfehler-ID eintragen → 10 % Rabatt / 10 % Gutschrift“. **Guide (LizenzInfo)** – eine Zeile: „Empfehlungsprogramm: 10 % Rabatt / 10 % Gutschrift – Empfehler-ID beim Lizenzabschluss angeben.“ **Commit:** ed5b689 ✅ auf GitHub.
- **Lizenz-Projekt (ök2/VK2) – Preise vereinheitlicht (02.03.26):** Priorität 2 erledigt. **Eine Quelle:** `src/config/licencePricing.ts` (LIZENZPREISE: Basic 15 €, Pro 35 €, Pro+ 45 €, VK2 „ab 10 Mitgliedern kostenfrei“). **LicencesPage:** LICENCE_TYPES baut aus LIZENZPREISE. **GlobaleGuideBegleitung (LizenzInfo):** 4 Zeilen (Basic/Pro/Pro+/VK2) aus LIZENZPREISE. **LicenseManager:** 4 Pläne aus LIZENZPREISE, keine editierbaren Preisfelder mehr; Hinweis „Festgelegte Preise“. Doku OEK2-ANMELDUNG-LIZENZIERUNG-STAND.md aktualisiert (Priorität 2 ✅). **Commit:** ecb428c ✅ auf GitHub. Priorität 3 (WillkommenPage) erledigt. **Nächster Schritt:** STRIPE-LIZENZEN-GO-LIVE (3 Schritte) oder PLAN Schritt 5 (Pilot-Verein).
- **Marketing Eröffnung K2 + ök2 + VK2, Links & QR einheitlich (02.03.26):** VK2 überall in Eröffnungs-/Marketingtexten ergänzt (Kernbotschaft, Lounge, Einladung, Presse, Social). **Links und QR-Codes – überall gleich:** Doku Abschnitt 3.6 mit drei verbindlichen URLs (K2 Galerie, Musterseiten/Willkommen, VK2); mök2-Sektion „Eröffnung K2 + ök2 + VK2“ mit denselben Texten inkl. VK2 und Block „Links und QR-Codes“ (gleiche URLs wie Doku). mok2Structure Label angepasst. Technik-Check: Tests + Build grün, URLs aus navigation.ts. **Commit:** eb5994f ✅ auf GitHub.
- **Marketing Eröffnung K2 + ök2 (02.03.26):** Georg will K2 und ök2 zur Galerie-Eröffnung gemeinsam einführen, Werbetrommel in 2 Wochen. Doku: docs/MARKETING-EROEFFNUNG-K2-OEK2.md (Strategie, 2-Wochen-Checkliste, konkrete Texte für gemeinsame Lounge: Kernbotschaft, Lounge-Text, Einladung, Presse, Social). In mök2 Sektion „Eröffnung K2 + ök2 + VK2 (Marketinglinie)“ mit Kernbotschaft + Lounge-Text + Links & QR; 00-INDEX verweist auf die Doku.
- **Grafiker-Tisch – Kachel/Bildverarbeitung (02.03.26):** Georg bestätigt: Kachel-Geschichte funktioniert. In GRAFIKER-TISCH-NOTIZEN von „Offen“ nach „Bereits umgesetzt“ verschoben.
- **K2 Familie – Markt und Standards (02.03.26):** „Rad neu erfinden?“ – Nein. Doku docs/K2-FAMILIE-MARKT-STANDARDS.md: GEDCOM nutzen; Leitlinie Georg: „Wir nehmen, was zu uns passt – und machen etwas ganz Persönliches für jede einzelne Familie: originell und einzigartig.“ Roadmap Phase 4 um Punkt „Austausch (GEDCOM)“ ergänzt.
- **K2 Familie – Skalierung Großfamilien (02.03.26):** Prüfung: System für mehrere hundert Mitglieder. **Ergebnis:** Speicher 10 MB/Key → mit Fotos ca. 100–200 Personen, ohne Fotos 500+; Stammbaum-Grafik und Listen ohne Pagination, aber rechnerisch nutzbar. Doku: docs/K2-FAMILIE-SKALIERUNG-GROSSFAMILIEN.md; Hinweis in familieStorage.ts ergänzt.
- **Stammbaum als Plakat drucken (02.03.26):** Wer Lust hat kann die Stammbaum-Grafik gestalten und als Plakat drucken. **FamilyTreeGraph:** `noPhotos`, `printMode`, `scale` – Druckansicht mit Initial statt Foto (optional), druckfreundliche Farben, keine Klick-Links. **Stammbaum-Seite:** Bereich „Als Plakat drucken“ mit Format (A4 / A3 / Poster), Darstellung (Mit Fotos / Nur Namen), optionaler Titel; Button „Druckvorschau & Drucken“ → URL `?druck=1&format=…&fotos=…` → nur Druck-Container, `window.print()`, nach Druck zurück. **Print-CSS:** `.stammbaum-druck-view` hell, Titel zentriert; body hell wenn nur Druckansicht. Commit: 78bcbf7 ✅ auf GitHub.
- **Stammbaum-Grafik (02.03.26):** Echte Baumdarstellung auf der Stammbaum-Seite: SVG mit Generationen (Wurzeln oben, Kinder darunter), Linien Eltern→Kinder und gestrichelte Partner-Linien. Jede Person als Knoten (Foto oder Icon + Vorname), klickbar → Personen-Seite. Komponente FamilyTreeGraph.tsx. Commit: 771cb16 ✅ auf GitHub.
- **K2 Familie – Spielplatz-Feeling (02.03.26):** Mehr Dynamik und Leben: lebendiger Hintergrund (sanft animierter Verlauf), runde Karten mit Hover-Lift und leichter Rotation, gestaffelte Einstiegs-Animationen (Karten erscheinen nacheinander). Homepage: bunte Buttons (Grün/Orange/Teal), Hero mit Shine, Events-Button mit 🎉. Stammbaum: große runde Fotos, Kachel-Layout, „→ ansehen“. Personen-Seite: rundes Großfoto, Moment-Karten mit Hover. Nav: Pillen-Buttons, Hover-Reaktion. Weniger Buchhaltung, mehr Spielplatz. Commit: a017c7b ✅ auf GitHub.
- **Musterfamilie Huber (02.03.26):** Bunte Demo-Familie: Paul & Antonia, 4 Kinder (Thomas, Stefan, Lisa, Maria), 6 Enkel, 3 Urenkel. Maria mit Lebenspartnerin Sophie und adoptiertem Sohn Leon. Platzhalter-Bilder (picsum), animierte Fotos (Fade-in + Hover), kleine Jahresgeschichte (9 Events, 8 Momente). Button „Musterfamilie Huber laden und anzeigen“ auf Leitbild & Vision → lädt Tenant „huber“, wechselt dorthin, zeigt Homepage. Dropdown: „Familie Huber“ für huber. Commit: e988d0f ✅ auf GitHub.
- **Fertige Homepage K2 Familie umgesetzt (02.03.26):** Nutzer-Homepage = Index (/projects/k2-familie). Config: `pageContentFamilie.ts` + `pageTextsFamilie.ts` pro Tenant (welcomeImage, cardImage; welcomeTitle, introText, Buttons). **K2FamilieHomePage.tsx:** Hero, Willkommenstext, drei Buttons (Stammbaum, Events, Kalender), Link „Leitbild & Vision“. Route **uebersicht** = Leitbild & Vision (K2FamilieStartPage). Nav: Start (Homepage) | Leitbild & Vision | Stammbaum | Events | Kalender. Tests + Build grün. Commit: 8a0bb15 ✅ auf GitHub.
- **Kommandozentrale (02.03.26):** `docs/KOMMANDOZENTRALE.md` – gemeinsamer Zugang für Georg und KI. Steuerung jederzeit: Sofort-Zugriff auf DIALOG-STAND, GRAFIKER-TISCH, GELOESTE-BUGS; Definitionen & Konzepte (Homepage, K2-Familie-Konzept, Skalierung, Raumschiff); Roadmap & Regeln. In HAUS-INDEX Schnellfinder und docs/00-INDEX + STRUKTUR-HANDELN-QUELLEN verankert.
- **Definitionen & Konzepte (02.03.26):** HOMEPAGE-DEFINITION.md (fertige Homepage vs. Projekt-Startseite), K2-FAMILIE-HOMEPAGE-KONZEPT.md (Orientierung ök2, einheitliche Struktur, Gestaltung pro Tenant), SKALIERUNG-KONZEPT.md (stimmig, nach oben unendlich skalierbar; Raumschiff-Qualitätskriterien beim Skalieren). Roadmap + 00-INDEX verweisen darauf.
- **Smart Panel – Zur Startseite (02.03.26):** K2-Familie-Mappe: Button umbenannt in „→ Zur Startseite (erste Seite)“ (war „Start & Vision“), damit klar ist: ein Klick = erste Seite der Homepage.
- **K2 Familie – Button zur Homepage (02.03.26):** Im K2-Familie-Layout feste Nav-Leiste oben: **Start (Homepage)** | Stammbaum | Events | Kalender. Von jeder Unterseite ein Klick auf „Start (Homepage)“ → Startseite. Commit: fda5f76 ✅ auf GitHub.
- **Smart Panel Arbeitsmappen bereinigt (02.03.26):** (1) **K2 Galerie** – Icons (K2, ök2, VK2, mök2), 🧠 Handbuch (K2 Galerie), Als Fremder eintreten, 📋 To-dos. (2) **K2 Familie** – Start & Vision, 📖 Handbuch Familie (Erste Schritte, doc=17). (3) **Notizen** – Notizen + Diverses. (4) **Vermächtnis** – nur Kurztext, 📌 Zentrale Themen (einmal), 🖨️ Schlüssel drucken; **kein** Handbuch (gehört zur Galerie). Doppelte Blöcke unten entfernt. Commit: 57fc30f ✅ auf GitHub.
- **Smart Panel K2 Familie Fix (02.03.26):** Icon „K2 Familie“ führte auf Projektentwicklung statt auf Hompage. Fix: In SmartPanel bei onNavigate (APf) K2-Familie-Klick ruft jetzt `navigate(PROJECT_ROUTES['k2-familie'].home)` auf → immer /projects/k2-familie. Link bleibt für Kontexte ohne onNavigate. DevViewPage Vollbild-Link um k2-familie ergänzt.
- **Pause (02.03.26):** Georg macht Pause. Vorher: Stand änderte sich nicht nach Code-Update, keine neuen Einträge sichtbar – Anleitung gegeben (lokal F5 / Cmd+Shift+R; Vercel: Stand-Badge unten links tippen, Deployment Ready prüfen; Handy: Stand tippen oder QR neu scannen). Bei Wiedereinstieg: DIALOG-STAND lesen, ggf. Entscheidung 4.0 oder anderes.
- **K2 Familie – Dokumentation Nachvollziehbarkeit (02.03.26):** Alles, was wir machen, genau dokumentieren, damit nachvollziehbar ist, was wir kommuniziert haben. In Grundbotschaft und Regel verankert; AI dokumentiert präzise (was geändert, warum, was Georg gesagt hat).
- **K2 Familie – Grundbotschaft als Vermächtnis (02.03.26):** Grundbotschaft soll Form der App, Sprache und jede zukünftige KI/Agent-Kommunikation prägen; Haus auf sicherem moralischen Fundament. Neu: docs/K2-FAMILIE-GRUNDBOTSCHAFT.md (verbindlich für Menschen und KI), Abschnitt in Roadmap, .cursor/rules/k2-familie-grundbotschaft.mdc (Regel für alle K2-Familie-Arbeit), Startseite Verweis auf moralisches Fundament.
- **K2 Familie Leitbild – keine Ausgrenzung, Respekt (02.03.26):** Keine Ausgrenzung; Religion und Politik haben hier nichts zu suchen; jeder respektiert den anderen. In Roadmap, Startseite, APf-Block.
- **K2 Familie Leitbild – offene Gesellschaft (02.03.26):** Leitbild in Roadmap, Startseite und APf: jede Form des Zusammenlebens = Familie, wechselnde Partnerschaften, Freud/Leid/Alltag.
- **APf – K2 Familie eigene Struktur (02.03.26):** Im Smart Panel: K2 Familie als eigener Eintrag mit eigener Farbe (Teal), eigener Block mit Link „→ Start & Vision“. Klar getrennt von K2-Galerie-Themen.
- **Session-Ende 01.03.26:** Schreiben an Michael (Prozess + Kontrast + QR), mök2-Struktur gruppiert, druckbare Kapitelseiten. Alle Änderungen committed und gepusht.
- **Schreiben an Michael (01.03.26):** Eine Seite, ein Klick zur Galerie. Kontrast: heller Hintergrund, dunkle Schrift. QR „Adresse aufs Handy“ führt auf **diese** Seite (schreiben-michael), nicht auf die Galerie – in mök2 war vorher ein falscher QR (Galerie) entfernt. Georg: Link per WhatsApp an Michael → Michael tippt Link → tippt „Galerie öffnen“ → fertig.
- **mök2-Struktur gruppiert (01.03.26):** Sidebar in 5 Kapiteln: Kern, Vertrieb, Bewertung & Lizenzen, Konzepte, Praktisch. Quelle: `src/config/mok2Structure.ts`. Druck: A4, jede Kapitelseite mit eigener Titelseite (Kern, Vertrieb, …). Text unter „Als PDF drucken“ angepasst.
- **Start-Anleitung Piloten (Michael) in mök2 (01.03.26):** Eigene Rubrik in Marketing ök2: „Start-Anleitung Piloten (z.B. Michael)“ – Schreiben mit Schritt-für-Schritt-Anleitung zum Verschicken + QR-Code (zur **Seite** schreiben-michael). Sidebar Mok2Layout + Sektion MarketingOek2Page.
- **Tenant-Sync ök2/VK2 (01.03.26):** Veröffentlichen und „Bilder vom Server laden“ für alle Mandanten (K2, ök2, VK2). API GET/POST mit tenantId; Blob pro Mandant. Doku: docs/TENANT-SYNC-DOMAIN.md. Tests 38 grün, Build ✅.
- **Vor dem Weg – Gepäck-Check (02.03.26):** Grundbotschaft, Raumschiff-Anspruch, Gegenseitige Kontrolle, Dokumentation – in Grundbotschaft + Regel verankert. HAUS-INDEX um K2 Familie ergänzt (Schnellfinder + Obergeschoss). Datenschutz-Prinzip für K2-Familie-Daten in Roadmap Phase 1 vermerkt (keine Auto-Löschung, Backup). Nichts Wichtiges vergessen.
- **K2 Familie Phase 1.1 erledigt (02.03.26):** Beziehungsmodell definiert in `docs/K2-FAMILIE-DATENMODELL.md` und `src/types/k2Familie.ts` (K2FamiliePerson, K2FamiliePartnerRef, K2FamilieMoment, getK2FamiliePersonenKey). Roadmap 1.1 abgehakt.
- **K2 Familie Phase 1.2 & 1.3 erledigt (02.03.26):** Tenant `default` (K2_FAMILIE_DEFAULT_TENANT), `src/utils/familieStorage.ts` mit loadPersonen/savePersonen, Schutz wie artworksStorage. Roadmap 1.2/1.3 abgehakt.
- **K2 Familie Phase 2.1 & 2.2 erledigt (02.03.26):** Stammbaum-Seite (Liste, Person hinzufügen, Link zu Person), Personen-Seite (Foto, Name, Kurztext bearbeitbar, Beziehungen als Links, Momente-Platzhalter). Startseite: Button „Stammbaum öffnen“. 2.3 Beziehungen bearbeitbar folgt.
- **K2 Familie Phase 2.3 erledigt (02.03.26):** Beziehungen bearbeitbar – pro Art Hinzufügen (Dropdown) und Entfernen, beidseitig gespeichert (Eltern↔Kinder, Partner*innen, Geschwister, Wahlfamilie).
- **K2 Familie Phase 2.3 TypeScript-Fix (02.03.26):** In K2FamiliePersonPage alle Beziehungs-Handler mit `if (!id) return` + lokale `thisId` abgesichert; Build + Tests grün, Commit & Push.
- **K2 Familie – Rechte pro Zweig (02.03.26):** Konzept „organisches Wachstum + Schreib-/Löschrechte pro Zweig“ in `docs/K2-FAMILIE-RECHTE-ZWEIGE.md` – Definition Zweig (A/B/C), drei Optionen (Tenant pro Zweig, Rolle pro Person, Verwalter pro Zweig). Roadmap Phase 4.0 ergänzt. Entscheidung durch Georg offen.
- **K2 Familie Phase 3.1 erledigt (02.03.26):** Momente pro Person – Speicher `k2-familie-{tenantId}-momente`, loadMomente/saveMomente (familieStorage), auf Personen-Seite: Liste, Moment hinzufügen/bearbeiten/löschen (Titel, Datum, Bild-URL, Text). Roadmap 3.1 abgehakt.
- **K2 Familie Phase 3.2 erledigt (02.03.26):** Familien-Events – Speicher `k2-familie-{tenantId}-events`, loadEvents/saveEvents; Events-Seite (/projects/k2-familie/events): Liste nach Datum, Event hinzufügen/bearbeiten/löschen, Teilnehmer aus Personen (Checkboxen). Roadmap 3.2 abgehakt.
- **K2 Familie – Architektur zuerst (02.03.26):** Wir arbeiten an der Architektur; der Baumeister (konkrete Umsetzung) kommt später. In RECHTE-ZWEIGE festgehalten.
- **Baumeister (02.03.26):** Wenn es ans konkrete Bauen geht, geht Georg selber ran und kontrolliert die Details.
- **K2 Familie Phase 3.3 erledigt (02.03.26):** Kalender & Übersicht – Seite mit Events + Momente (mit Datum), nach Monat gruppiert, Links zu Events/Person. Roadmap 3.3 abgehakt.
- **K2 Familie Phase 4 – Vorbereitung (02.03.26):** In Roadmap „Nächste Schritte für den Baumeister“ ergänzt (4.0 Entscheidung, 4.1 Tenant-Auswahl, 4.2 Doku/Onboarding). Kein Code – nur Pfad für Phase 4 klar.
- **K2 Familie Phase 4.1 erledigt (02.03.26):** Jede Familie = eigener Tenant. FamilieTenantContext, Layout mit Provider, Familien-Auswahl (Dropdown + „Neue Familie“) auf Start & Stammbaum, alle Seiten nutzen currentTenantId. Roadmap 4.1 abgehakt.
- **K2 Familie Phase 4.2 erledigt (02.03.26):** Doku & Onboarding – „Erste Schritte“ auf Startseite (5 Schritte), Handbuch 17-K2-FAMILIE-ERSTE-SCHRITTE.md, Eintrag im Handbuch-Index. Roadmap 4.2 abgehakt.
- **Crash-Check (02.03.26):** ro check crash – K2-Familie-Seiten geprüft, keine neuen Crash-Quellen (kein setInterval/setTimeout/reload in *familie*). CRASH-BEREITS-GEPRUEFT.md + CRASH-LETZTER-KONTEXT.md aktualisiert.
- **Weiter K2 Familie (02.03.26):** Phase 4.0 vorbereitet – in RECHTE-ZWEIGE Abschnitt „Entscheidung 4.0 – in 3 Fragen“ ergänzt (Zweig A/B/C, Rechte 1/2/3, Empfehlung C + Option 3). Startseite: Card „Nächster Meilenstein: Rechte & Zweige“ mit Verweis auf docs/K2-FAMILIE-RECHTE-ZWEIGE.md. Commit: a99358f ✅ auf GitHub.
- **Nächster Schritt:** Bei Wiedereinstieg: **Commit + Push** falls noch nicht erledigt (Änderungen dieser Session). Dann: Kommandozentrale oder DIALOG-STAND + GRAFIKER-TISCH lesen. Optional: STRIPE-LIZENZEN-GO-LIVE (3 Schritte), K2 Familie Entscheidung 4.0, oder anderes.
- **Info (Georg):** Gestern mit Android + Chrome die Seiten geöffnet – funktioniert problemlos.
- **Vollkachelform / Bildverarbeitung:** Offene Punkte in docs/GRAFIKER-TISCH-NOTIZEN.md unter „Offene Wünsche“.
- **Vollbackup (02.03.26):** Git Commit 0b709f1 + Tag **full-backup-2026-03-02** auf GitHub. Hard-Backup auf backupmicro: v004 (gallery-data.json). Druck-Kontrast K2 Familie (Print-CSS) im Commit. Optional: Im Admin einmal „Vollbackup herunterladen“; Code-Spiegelung auf backupmicro bei Bedarf: backupmicro anstecken → im Terminal `bash scripts/backup-code-to-backupmicro.sh`.

## Reopen – Code behalten, KI kann weitermachen
- **Bei „Reopen“ (evtl. mit Restore/Hackerl):** **Zuerst alle Dateien speichern** (Cmd+S oder File → Save All). Dann „Reopen“ lädt die gespeicherte Version.
- **Damit die KI weitermacht:** DIALOG-STAND.md lesen („Nächster Schritt“) und WEITERARBEITEN-NACH-ABSTURZ.md.

## (Weitere Kontexte – gekürzt, siehe Git-Historie)
- QR/Link „Schreiben an Michael“ – eine URL, eine Seite: `/schreiben-michael` (PILOT_SCHREIBEN_ROUTE).
- Merge-Schutz, Datentransport, Stand-Abgleich, Reopen-Fix (watcherExclude), Crash-Check-Routine unverändert.
- Vollkachelform umgesetzt; Faden Datentransport mobil erledigt.
- Session-Ende / iPad-Stand / Vercel: siehe VERCEL-CHECKLISTE-BEI-KEINEM-STAND.md bei Bedarf.
