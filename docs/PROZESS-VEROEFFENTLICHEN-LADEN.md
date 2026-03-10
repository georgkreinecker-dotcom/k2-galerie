# Prozess: Veröffentlichen & „Bilder vom Server laden“ (Sportwagenmodus)

**Eine Quelle, ein Ablauf.** Damit Bilder nicht mehr „irgendwann weg“ sind und der Ablauf überall gleich ist.

---

## 1. Veröffentlichen (Server = Ziel)

**Ein Standard:** `publishGalleryDataToServer(artworks)` in `src/utils/publishGalleryData.ts`.

| Schritt | Was passiert |
|--------|----------------|
| 1 | **Bild-URLs auflösen:** `resolveArtworkImageUrlsForExport(artworks)` – imageRef/Base64 → Upload (Supabase Storage) → https-URL. Ohne Auflösung käme beim Server nur '' für Bilder → andere Geräte sehen Platzhalter. |
| 2 | **Export-Format:** `artworksForExport(...)` – Base64 aus Payload entfernen (kleiner JSON), URLs bleiben. |
| 3 | **Payload:** Stammdaten, Events, Documents, Design, pageTexts aus localStorage; gallery-Bilder aus getPageContentGalerie(). |
| 4 | **POST** `GALLERY_DATA_BASE_URL/api/write-gallery-data` (immer Vercel-URL) – schreibt in Vercel Blob. So landen Mobil und Mac bei derselben Quelle; relative URL würde bei localhost an den Dev-Server gehen. |

**Aufrufer (dürfen nur diese eine Funktion nutzen):**

- **DevViewPage** (Button „Veröffentlichen“ / Speichern): Nach Supabase-Merge → `publishGalleryDataToServer(artworks)`.
- **GalerieVorschauPage** (nach Speichern/Bearbeiten, neues Werk): `publishGalleryDataToServer(loadArtworks())`.
- **ScreenshotExportAdmin (K2):** Vor dem Aufruf State in localStorage flushen, dann `publishGalleryDataToServer(readArtworksRawByKey('k2-artworks'))`. Kein eigener Fetch zu write-gallery-data mehr für K2.

**Regel:** Kein eigener Fetch zu write-gallery-data, kein eigener Aufruf von resolveArtworkImageUrlsForExport + artworksForExport an anderer Stelle. Immer `publishGalleryDataToServer`.

---

## 2. „Bilder vom Server laden“ (Server = Quelle)

**Ein Standard:** Merge mit `mergeServerWithLocal`, dann **immer** `preserveLocalImageData` vor dem Speichern.

| Schritt | Was passiert |
|--------|----------------|
| 1 | Daten holen: API `/api/gallery-data?tenantId=k2` (Vercel Blob), bei Fehler statische `/gallery-data.json`. Bei wenigen Werken (≤15): Few-Works-Fallback (statische Datei nutzen wenn mehr Werke). |
| 2 | **Merge:** `mergeServerWithLocal(serverArtworks, localArtworks, { onlyAddLocalIfMobileAndVeryNew: true })` – Server = Quelle, lokale ohne Server-Eintrag geschützt. |
| 3 | **Bilder bewahren:** `preserveLocalImageData(merged, localArtworks)` – wenn lokal ein Bild existiert und Server keins hat, bleibt das lokale Bild. Nie gutes Lokal durch leeren Server ersetzen. |
| 4 | Speichern nur wenn `merged.length >= localCount` (allowReduce: false). |

**Ein Einstieg (optional):** `applyServerDataToLocal(serverList, localList, options)` in `src/utils/syncMerge.ts` – führt mergeServerWithLocal und preserveLocalImageData in der verbindlichen Reihenfolge aus. Nutzen: GaleriePage loadData, GalerieVorschauPage handleRefresh, alle künftigen Lade-Pfade.

**Aufrufer:** GaleriePage (loadData), GalerieVorschauPage (handleRefresh). Beide nutzen dieselbe Logik (mergeServerWithLocal → preserveLocalImageData → save).

---

## 3. Automatische Speicherung und Laden (Stand-Aktualisierung)

**Derselbe Prozess gilt auch hier.** Kein zweiter Ablauf.

### 3a. Automatische Speicherung (Auto-Save)

- **Auto-Save** (`src/utils/autoSave.ts`) schreibt nur in **localStorage** (Stammdaten, Werke, Events, Dokumente, Design, Seitentexte).
- Auto-Save löst **kein** Veröffentlichen aus. Damit andere Geräte den Stand sehen, muss explizit **„Veröffentlichen“** genutzt werden (oder der automatische Publish nach Speichern im Admin).
- **Automatisches Veröffentlichen** (z. B. nach Speichern im Admin: `publishMobile({ silent: true })`) muss denselben **logischen** Ablauf nutzen: Bild-URLs auflösen → Export-Format → POST. Im Admin (ScreenshotExportAdmin) gilt für K2/ök2/VK2 derselbe Prozess; für K2 soll langfristig dieselbe zentrale Logik (Auflösung + Export) genutzt werden wie bei `publishGalleryDataToServer`.

### 3b. Laden durch Stand-Aktualisierung

- **Stand-Badge tippen**, **„Stand & Daten“**, **QR-Scan** oder **Seiten-Reload** nach Build-Update: Überall derselbe Lade-Ablauf.
- **Kein zweiter Pfad:** Immer `loadData` (GaleriePage) bzw. `handleRefresh` (GalerieVorschauPage) → API/statisch → **mergeServerWithLocal** → **preserveLocalImageData** → Speichern. Nie „einfach Server-Daten überschreiben“ ohne Merge und ohne Bewahren lokaler Bilder.

---

## 4. Kritische Fehlerquellen (behoben)

- **API-Fehler → statische Datei:** Wenn „Vom Server laden“ die API nicht erreichte, wurde vorher die statische `gallery-data.json` (Build-Stand) geladen und hat lokale Daten überschrieben → am Mac kam „nichts an“ oder alter Stand. **Behoben:** Bei API-Fehler wird keine statische Datei mehr geladen; es wird eine Fehlermeldung angezeigt und die lokalen Werke bleiben unverändert.
- **Veröffentlichen ohne Rückmeldung:** Fehlgeschlagenes Veröffentlichen war nur in der Konsole sichtbar. **Behoben:** Nach Speichern (Bearbeiten/Neues Werk) erscheint sichtbar „✅ Veröffentlicht (N Werke)“ oder „❌ Veröffentlichen fehlgeschlagen: …“.
- **Few-Works-Fallback (Sync iPad ↔ Mac):** Wenn die API 200 mit wenigen Werken (≤15) lieferte, wurde die Antwort durch die **statische** Build-Datei ersetzt, sobald die mehr Werke hatte. Dadurch konnte der **frisch vom iPad veröffentlichte** Blob-Stand durch den **Build-Stand** überschrieben werden → Mac sah nach „Vom Server laden“ nicht das, was das iPad gerade veröffentlicht hatte. **Behoben (10.03.26):** API (Blob) ist die **einzige** Quelle; kein Ersetzen durch statische Datei mehr. GaleriePage und GalerieVorschauPage nutzen nur noch die API-Antwort.

---

## 5. Warum dann trotzdem Platzhalter? (Bildspeicher/Ladeproblem)

- **Nach App-Löschen:** Lokal ist leer → es gibt nichts zu „bewahren“. Server liefert, was er hat. Hat der Server keine Bild-URLs (weil letztes Veröffentlichen ohne Auflösung oder von Gerät ohne Bilder war), kommen Platzhalter.
- **„70 Werke, Karten da, Bilder fehlen“:** Die Werke kommen vom Server, aber die **Bilder** nicht. Lösung: **Zuerst vom Gerät, auf dem die Fotos gemacht wurden** (z. B. iPad, wo alles richtig liegt) **„An Server senden“** klicken – dann werden alle Bild-URLs aus IndexedDB aufgelöst und mitgeschickt. Danach auf den anderen Geräten **„Aktuellen Stand holen“** / „Vom Server laden“.
- **Sicherheit:** Immer von dem Gerät **veröffentlichen**, das die vollen Daten (inkl. Bilder) hat (z. B. iPad wenn die Fotos dort gemacht wurden). Dann hat der Server die URLs; andere Geräte holen sie mit „Bilder vom Server laden“.

### 5a. 18 Bilder senden/empfangen – was wir gemacht haben (10.03.26)

- **Upload nicht mehr alle parallel:** Beim Veröffentlichen werden Bild-Uploads nach Supabase Storage in **kleinen Batches** (4 nacheinander) ausgeführt, damit keine Timeouts oder Rate-Limits entstehen.
- **Rückmeldung nach dem Senden (iPad/Galerie-Vorschau):** Es erscheint z. B. „Veröffentlicht (48 Werke, 30 mit Bild) um 19:25 …“. Wenn **weniger mit Bild** als Werke: Hinweis „Bei einigen Werken fehlt auf diesem Gerät das Bild – vom Gerät mit den Fotos erneut senden.“
- **Supabase-Fallback:** Wenn ein Werk auf diesem Gerät kein Bild in IndexedDB hat, aber schon in Supabase (vom iPad) gespeichert ist, wird die URL aus der Supabase-Datenbank übernommen (inkl. Abgleich mit Kurznummer 0030 etc.).
- **Wenn weiterhin Bilder fehlen:** (1) Supabase Dashboard → Storage → Bucket `artwork-images` → Policies prüfen: **öffentlicher Lese-Zugriff** und **Upload mit Anon-Key** erlauben. (2) Auf dem **iPad** prüfen: Zeigen die Werke 30–48 in der Galerie-Vorschau **Bilder** (keine Platzhalter)? Nur dann sind sie in IndexedDB und können mitgesendet werden. (3) Nach „An Server senden“ die Meldung lesen: „X mit Bild“ – wenn X kleiner als Werkeanzahl, fehlen auf diesem Gerät Bilder in der Datenquelle.

---

## 6. Sync-Kernregel („ein Fehler, alle Sync-Probleme“)

**Eine konsistente Merge- und Reload-Logik behebt sowohl Bereinigung als auch alle typischen Sync-Probleme:**

| Regel | Wo | Warum |
|-------|-----|--------|
| **preserveLocalImageData** | syncMerge.ts | Beim Merge: Wenn **lokal ein Bild** hat → lokales Bild übernehmen. Wenn **lokal bewusst kein Bild** (z. B. nach Bereinigung) → Merged-Item ebenfalls ohne Bild (`imageUrl/imageRef/previewUrl` leer). Sonst holt der Server beim nächsten Laden alte URLs zurück. |
| **Nach lokalem Schreiben: UI aus lokal refreshen** | GalerieVorschauPage handleArtworksUpdate | Wenn das Event von einer **lokalen Aktion** kommt (z. B. Bereinigung, Admin-Speichern), mit `detail: { fromBereinigung: true }` oder `fromGaleriePage: true` → Anzeige **nur aus localStorage** neu laden, **nicht** zuerst aus Supabase. Verhindert Race: alter Supabase-Stand überschreibt den gerade gespeicherten lokalen Stand. |
| **Eine Quelle pro Aktion** | Veröffentlichen / Laden | Immer dieselben Funktionen (publishGalleryDataToServer; mergeServerWithLocal + preserveLocalImageData). Kein zweiter Pfad. |

**Konsequenz:** Alle Stellen, die „nach Speichern/Bereinigung“ die Galerie aktualisieren, sollten entweder (a) `artworks-updated` mit einem Flag senden, das „aus lokal refreshen“ auslöst, oder (b) sicherstellen, dass die angezeigte Quelle (localStorage/Supabase) bereits den neuen Stand hat. Siehe BUG-024, FEHLERANALYSEPROTOKOLL.

---

## 7. Checkliste (Prozesssicherheit)

- [ ] Veröffentlichen: Nur über `publishGalleryDataToServer` (ein Aufruf, eine Implementierung).
- [ ] Laden: Immer mergeServerWithLocal, danach preserveLocalImageData vor save.
- [ ] Kein zweiter Ablauf für „Veröffentlichen“ (kein Copy-Paste von resolve + export + fetch).
- [ ] Neue Features: Gleichen Ablauf wiederverwenden, nicht neu erfinden.

---

**Verknüpfung:** .cursor/rules/ein-standard-problem.mdc, SYNC-REGEL.md, WERKE-SPEICHERUNG-CHECKLISTE.md, preserveLocalImageData (syncMerge.ts).
