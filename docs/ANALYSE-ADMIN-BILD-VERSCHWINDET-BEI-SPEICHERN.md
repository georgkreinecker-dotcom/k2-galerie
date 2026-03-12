# Analyse: Admin – Bild bei Werk A verschwindet beim Speichern von Werk B

**Stand:** 11.03.26  
**Kontext:** Georg meldet mehrfach: Beim Speichern eines (neuen oder bearbeiteten) Werks verschwindet das Bild eines **anderen** Werks. Trotz mehrerer Fixes (resolveArtworkImages imageRef behalten, preserveStorageImageRefs nach Save, Warteschlange, pauseAutoSave) „Stand 6.58 noch immer kein anderes Ergebnis“. Georg: „Wie oft machst du eigentlich schon jetzt das gleiche – hast du das im Fehleranalyseprotokoll schon analysiert?“

**Zweck:** Keine weiteren Einzel-Fixes ohne Systematik. Diese Datei erfasst **alle** Schreib- und Zustandspfade, an denen imageRef verloren gehen kann. Nächster Schritt: Anhand dieser Liste **eine** Ursache nach der anderen ausschließen oder beheben (z. B. durch Logging/Reproduktion), nicht wieder „noch ein Fix“ versuchen.

---

## 1. Bekannte Fehlerklasse (Wiederholung)

| Protokoll / Bug | Thema |
|-----------------|--------|
| BUG-021 | preserveLocalImageData; Merge überschreibt lokale Bilddaten |
| BUG-029 | preserveLocalImageData setzte imageRef: '' bei lokal ohne Bild |
| BUG-032 | resolveArtworkImages: 30–39/K2-M ohne imageRef → kein Lookup |
| Protokoll 11.03.26 | „60 mit Bild, 59 gespeichert“ (localHasRealUrl data-URL) |
| Protokoll 11.03.26 | iPad Bilder weg (prepareArtworksForStorage, loadData) |
| **Aktuell** | **Admin:** Werk B speichern → Bild von Werk A weg (gleiche Klasse: imageRef geht irgendwo verloren) |

---

## 2. Alle Pfade, die Werke (mit Bild) schreiben

| # | Pfad | Datei / Stelle | Was geschrieben wird | imageRef-Quelle |
|---|------|----------------|----------------------|------------------|
| 1 | saveArtworkData (ein Werk speichern) | ScreenshotExportAdmin.tsx, doSerializedWrite | toSave = fresh (loadArtworksRaw) mit einem Item ersetzt durch artworkData | fresh = localStorage (roh) |
| 2 | AutoSave (Intervall) | autoSave.ts | toSave = mergeMissingFromStorage(state, fromStorage), dann preserveStorageImageRefs(toSave, fromStorage) | State + Speicher |
| 3 | Favorit umschalten | ScreenshotExportAdmin.tsx | saveArtworks(tenant, updated); setAllArtworksSafe(updated) | State (allArtworks) |
| 4 | GitHub-Upload nach Speichern | ScreenshotExportAdmin.tsx | saveArtworks(tenant, updatedArtworks); setAllArtworksSafe(resolved) | list aus localStorage, ein Werk mit url |
| 5 | „Werke vom Server zurückholen“ | Admin | preserveLocalImageData dann save | Server + lokal |
| 6 | Vom Server laden / Aktuellen Stand holen | GaleriePage, GalerieVorschauPage | mergeServerWithLocal + preserveLocalImageData, dann save | Merge-Logik |
| 7 | Sonstige setAllArtworksSafe-Aufrufer | ScreenshotExportAdmin.tsx | Viele Stellen setzen State aus loadArtworksWithResolvedImages oder resolved/merged | Siehe Abschnitt 3 |

---

## 3. Alle Stellen, die State (allArtworks) setzen – ohne imageRef = andere Werke können beim nächsten Schreibvorgang ohne Ref geschrieben werden

| # | Stelle | Quelle der Liste | preserveStorageImageRefs? |
|---|--------|-------------------|----------------------------|
| 1 | Nach saveArtworkData (patched) | loadArtworksWithResolvedImages → patched → **patchedWithRefs** | ✅ ja (eingebaut 11.03.26) |
| 2 | Nach saveArtworkData (setTimeout 100 ms) | againPatched → **againWithRefs** | ✅ ja |
| 3 | Favorit-Button | updated = allArtworks.map(...) | ❌ nein – State direkt geschrieben |
| 4 | Import Werke | setAllArtworksSafe(merged) | ❌ |
| 5 | Diverse loadArtworksWithResolvedImages().then(setAllArtworksSafe) | resolveArtworkImages(list) | nur indirekt (wenn resolve imageRef behält) |

---

## 4. Stellen, die imageRef leeren oder überschreiben (Code)

| Datei | Stelle | Bedingung |
|-------|--------|-----------|
| artworkImageStore.ts | resolveArtworkImages: inExclude && isOldVercelStaticUrl | out.push({ ...a, imageUrl: '', **imageRef: a.imageRef \|\| ''** }) – behält Ref |
| artworkImageStore.ts | clearArtworkImagesForNumberRange | imageRef: '' für Bereich 30–39 (bewusst) |
| syncMerge.ts | preserveLocalImageData | imageRef: '' nur wenn !localHasImage && !serverHasRealUrl |
| prepareArtworksForStorage | hadRef && !next.imageRef | next = { ...next, imageRef: a.imageRef } – behält Ref |

---

## 5. Mögliche Ursachen (noch nicht zweifelsfrei eingegrenzt)

1. **AutoSave schreibt vor dem nächsten „fresh“-Lese:** Race: Save von Werk B liest „fresh“, in dem Moment hat AutoSave gerade State ohne imageRef für Werk A geschrieben → fresh enthält A schon ohne imageRef.
2. **State kommt von einem Aufruf ohne preserveStorageImageRefs:** Z. B. Favorit-Button oder anderer setAllArtworksSafe mit Liste, die irgendwo imageRef: '' für A hat.
3. **resolveArtworkImages liefert an einer anderen Stelle (oder in anderem Kontext) doch imageRef: '':** Z. B. alter Build/Cache oder anderer Zweig.
4. **loadArtworksRaw / readArtworksRawByKey liefert an einer Stelle gefiltert oder transformiert:** Unwahrscheinlich, aber prüfbar.
5. **IndexedDB vs. localStorage:** Bild in IndexedDB, Ref in Liste – beim Lesen wird Liste aus localStorage gelesen; wenn dort imageRef fehlt, geht Anzeige verloren und beim nächsten Schreiben wird ohne Ref geschrieben.

---

## 6. Nächste Schritte (statt weiterer Ad-hoc-Fixes)

1. ~~**Favorit-Pfad absichern**~~ → **Erledigt 11.03.26:** Vor Schreiben/Setzen: fromStorage = loadArtworks(tenant), toWrite = preserveStorageImageRefs(updated, fromStorage), saveArtworks(toWrite), setAllArtworksSafe(toWrite).
2. ~~**Import-Pfad**~~ → **Erledigt 11.03.26:** toWrite = preserveStorageImageRefs(merged, loadArtworks(tenant)); save + setState(toWrite).
3. ~~**Storage-Listener**~~ → **Erledigt 11.03.26:** Vor setAllArtworksSafe(list): withRefs = preserveStorageImageRefs(list, loadArtworks(tenant)), setAllArtworksSafe(withRefs).
4. ~~**API data.artworks (dynamic tenant)**~~ → **Erledigt 11.03.26:** Beide Stellen (initial load + handleLoadFromServer): withRefs = preserveStorageImageRefs(apiArtworks, loadArtworks(tenant)), setAllArtworksSafe(withRefs).
5. **11.03.26 – IndexedDB-Ref-Wiederherstellung:** Wenn localStorage einen imageRef verloren hat, das Bild aber noch in IndexedDB liegt, wurde der Ref nicht wiederhergestellt → jeder weitere Save schrieb die Liste ohne Ref. **Maßnahme:** (1) **fillMissingImageRefsFromIndexedDB** in artworkImageStore.ts: durchläuft die Liste, für jedes Werk ohne imageRef wird per getArtworkImageRefVariants + getArtworkImageByRefVariants in IndexedDB gesucht; Treffer → imageRef gesetzt. (2) **Admin doSerializedWrite:** Nach `fresh = loadArtworksRaw(tenant)` wird `freshHealed = await fillMissingImageRefsFromIndexedDB(fresh)` aufgerufen, toSave wird aus freshHealed gebaut. (3) **AutoSave:** Vor saveArtworksByKeyWithImageStore wird `toSave = await fillMissingImageRefsFromIndexedDB(toSave)` aufgerufen. So gehen fehlende Refs nicht mehr dauerhaft verloren, solange das Bild in IndexedDB ist.
6. **Falls weiterhin Bildverlust:** Reproduktion mit Logging (imageRef in fresh/toSave/state) – siehe Abschnitt 5.
7. **Protokoll:** Jeden durchgeführten Schritt in diesem Dokument ergänzen.

---

## 7. Verweis im Fehleranalyseprotokoll

- **Bekannte Fehlerklasse:** „Admin: Bild bei Werk A verschwindet beim Speichern von Werk B (Wiederholung)“ – Absicherung: siehe diese Analyse; nächster Schritt: Reproduktion + gezielter Fix, nicht weiterer Einzelfix.
- **Protokoll-Eintrag:** 11.03.26 – Georg „wie oft machst du das gleiche“ / Stand 6.58; Wiederholung; ANALYSE-ADMIN-BILD-VERSCHWINDET-BEI-SPEICHERN.md angelegt.

---

## 8. Stand 12.03.26 – Vollbackup von gestern, Test half nicht

- **Georg:** Auch der letzte Test war nicht hilfreich; es funktioniert einfach nicht. Gestern wurde ein Vollbackup gemacht, als es noch funktionierte – vielleicht hilft das.
- **Maßnahme:** Anleitung **docs/BILD-WEG-WIEDERHERSTELLUNG-VOLLBACKUP.md** angelegt: zuerst **aus dem Vollbackup von gestern wiederherstellen** (Admin → Einstellungen → Aus Backup-Datei wiederherstellen), damit der Datenstand wieder der funktionierende ist. Danach: entweder (A) Code-Stand von „wann es noch ging“ im Git vergleichen (Georg sagt z. B. Datum oder „vor Commit X“), oder (B) Reproduktion mit einer Log-Zeile, um die Stelle einzugrenzen.
- **Fix setAllArtworksSafe (iframe: andere Werke imageUrl aus State erhalten)** wurde umgesetzt und Flow-Test „Zweites Bild laden“ ergänzt – bei Georg weiterhin kein anderes Ergebnis; Ursache liegt vermutlich woanders (z. B. Liste kommt schon ohne imageRef, oder nicht im iframe).

---

## 9. Stand 12.03.26 – iframe: data: vor Strip in blob: umwandeln (nur nach Speichern)

- **Ursache:** In iframe wird `stripArtworkImagesForPreview` genutzt (data:-URLs → ''), um Speicher/Crash 5 zu entlasten. `loadArtworksWithResolvedImages` liefert aber **data:**-URLs aus IndexedDB. Nach dem Strip haben alle anderen Werke `imageUrl: ''`; `prev` im State ist ebenfalls gestrippt → kein Bild bleibt sichtbar.
- **Maßnahme:** **convertDataUrlsToBlobUrlsInList** in ScreenshotExportAdmin: In iframe vor dem Setzen der Liste data:-URLs in blob:-URLs umwandeln, damit Strip sie nicht löscht. **Eingesetzt nur im Speicher-Pfad:** (1) nach Speichern (patchedWithRefs), (2) im 100-ms-Nachlade-Callback (againWithRefs). **Nicht** beim initialen Laden und **nicht** im artworks-updated-Handler – dort bleibt das bisherige Strip-Verhalten, um keine Nebeneffekte auf andere Nummernbereiche (z. B. Werke unter Nr. 30) zu riskieren.

---

## 10. Stand 12.03.26 – GELÖST (Fehleranalyse abgeschlossen)

**Symptom (wiederholt):** Admin iframe – beim Speichern eines Werks verschwindet das Bild eines anderen; „Bilder unter Nr. 30“ weg oder nur in Bearbeiten sichtbar; Liste zeigte „Kein Bild“, Klick auf Bearbeiten zeigte das Bild.

**Ursachen (mehrere zusammen):**

1. **iframe Strip:** data:-URLs werden gestrippt → State hat `imageUrl: ''` für alle, die vom Resolve data: bekamen. Beim nächsten setState (z. B. nach Speichern) war `prev` auch gestrippt → kein Bild sichtbar.
2. **Liste verwarf blob:-URLs:** In der Werkkarten-Liste (filtered.map) wurde `if (rawSrc.startsWith('blob:')) rawSrc = ''` gesetzt („nach Reload ungültig“). Dadurch: Daten hatten blob-URL, Liste zeigte Platzhalter; Bearbeiten-Modal nutzte dieselbe blob-URL → Bild dort sichtbar.
3. **Conversion nur im Save-Pfad:** data:→blob nur nach Speichern; Initial-Load und artworks-updated strippten weiter → unter 30 und andere zeigten in der Liste kein Bild.

**Lösung (verbindlich):**

1. **convertDataUrlsToBlobUrlsInList** in iframe überall einsetzen, wo die Werkliste gesetzt wird: **Initial-Load**, **artworks-updated**, **nach Speichern** (patchedWithRefs + againWithRefs). So hat der State blob:-URLs statt data:; Strip entfernt nur data:, blob bleibt.
2. **Liste:** blob:-URLs **nicht** mehr verwerfen. Zeile `if (rawSrc.startsWith('blob:')) rawSrc = ''` entfernt. Nach Reload sind Blobs ungültig → bestehender **onError** auf dem `<img>` zeigt Platzhalter.
3. **Absicherung:** ANALYSE-ADMIN-BILD-VERSCHWINDET-BEI-SPEICHERN.md (diese Datei), BUG-033 in GELOESTE-BUGS.md, Fehleranalyseprotokoll-Eintrag.

**Betroffene Dateien:** `components/ScreenshotExportAdmin.tsx` (convertDataUrlsToBlobUrlsInList, setAllArtworksSafe-Aufrufer, Liste rawSrc/blob), `docs/ANALYSE-ADMIN-BILD-VERSCHWINDET-BEI-SPEICHERN.md`.

**Wo die Bugs waren (Fehleranalyse – Code-Stellen):**

| # | Bug | Datei | Stelle / was falsch war |
|---|-----|--------|-------------------------|
| 1 | iframe Strip löscht alle Bilder | ScreenshotExportAdmin.tsx | **setAllArtworksSafe** bzw. Aufrufer: Liste kam von loadArtworksWithResolvedImages mit **data:**-URLs; **stripArtworkImagesForPreview** (iframe) setzt data: → '' → alle Werke ohne imageUrl im State. Kein Aufruf von **convertDataUrlsToBlobUrlsInList** vor setState beim **Initial-Load** und im **artworks-updated**-Handler. |
| 2 | Liste verwarf blob:-URLs | ScreenshotExportAdmin.tsx | In der **Werkkarten-Liste** (filtered.map, Anzeige pro Werk): Zeile `if (rawSrc.startsWith('blob:')) rawSrc = ''` – dadurch zeigte jede Karte „Kein Bild“, obwohl im Objekt eine gültige blob:-URL war. Bearbeiten-Modal nutzte dieselbe URL → Bild nur dort sichtbar. |
| 3 | data:→blob nur nach Speichern | ScreenshotExportAdmin.tsx | **convertDataUrlsToBlobUrlsInList** war nur im **Save-Pfad** (patchedWithRefs, againWithRefs) aufgerufen. Beim **ersten Laden** und bei **artworks-updated** fehlte die Conversion → dort weiter Strip → „Bilder unter 30“ und andere ohne Bild in der Liste. |

**Ergebnis:** Georg bestätigt: „Hurra gelöst“ – alle Bilder wieder da, Bearbeiten getestet.
