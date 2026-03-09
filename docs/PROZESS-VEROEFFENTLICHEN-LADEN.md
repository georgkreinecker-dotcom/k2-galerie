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
| 4 | **POST** `/api/write-gallery-data` – schreibt in Vercel Blob (und ggf. Repo). |

**Aufrufer (dürfen nur diese eine Funktion nutzen):**

- **DevViewPage** (Button „Veröffentlichen“ / Speichern): Nach Supabase-Merge → `publishGalleryDataToServer(artworks)`.
- **GalerieVorschauPage** (nach Speichern/Bearbeiten, neues Werk): `publishGalleryDataToServer(loadArtworks())`.

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

**Aufrufer:** GaleriePage (loadData), GalerieVorschauPage (handleRefresh). Beide nutzen dieselbe Logik (mergeServerWithLocal → preserveLocalImageData → save).

---

## 3. Warum dann trotzdem Platzhalter?

- **Nach App-Löschen:** Lokal ist leer → es gibt nichts zu „bewahren“. Server liefert, was er hat. Hat der Server keine Bild-URLs (weil letztes Veröffentlichen ohne Auflösung oder von Gerät ohne Bilder war), kommen Platzhalter.
- **Sicherheit:** Damit der Prozess stimmt: Immer von dem Gerät **veröffentlichen**, das die vollen Daten (inkl. Bilder) hat. Dann hat der Server die URLs; andere Geräte holen sie mit „Bilder vom Server laden“.

---

## 4. Checkliste (Prozesssicherheit)

- [ ] Veröffentlichen: Nur über `publishGalleryDataToServer` (ein Aufruf, eine Implementierung).
- [ ] Laden: Immer mergeServerWithLocal, danach preserveLocalImageData vor save.
- [ ] Kein zweiter Ablauf für „Veröffentlichen“ (kein Copy-Paste von resolve + export + fetch).
- [ ] Neue Features: Gleichen Ablauf wiederverwenden, nicht neu erfinden.

---

**Verknüpfung:** .cursor/rules/ein-standard-problem.mdc, SYNC-REGEL.md, WERKE-SPEICHERUNG-CHECKLISTE.md, preserveLocalImageData (syncMerge.ts).
