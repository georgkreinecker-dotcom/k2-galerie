# Dialog-Stand

**Kernfrage bei Wiedereinstieg:** Woran haben wir in der letzten Viertelstunde gearbeitet? → Inhaltlicher Faden, nicht nur letzter Auftrag. Kontexte verbinden, abrufbar machen.

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
