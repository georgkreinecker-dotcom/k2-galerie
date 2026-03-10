# Analyse: Datenmengen in den Werken – wo doppelt, wo unnötig

Stand: 10.03.26

---

## 1. Wo liegen Werkdaten aktuell?

| Ort | Inhalt | Zweck |
|-----|--------|--------|
| **localStorage** `k2-artworks` | JSON-Liste aller Werke (Metadaten + imageRef, ggf. imageUrl/previewUrl) | Schneller Zugriff, eine Quelle pro Gerät |
| **IndexedDB** `k2-artwork-images` | Ein Bild pro `imageRef` (data-URL) | Große Daten ausgelagert, localStorage bleibt klein |
| **Supabase** (KV/Storage) | Metadaten + `image_url` (URL nach Upload) | Sync zwischen Geräten |
| **Vercel** (gallery-data.json / Blob) | Export: nur URLs, kein Base64 | Öffentliche Galerie, „Vom Server laden“ |

---

## 2. Wo ist was doppelt oder unnötig?

### 2.1 Bild zweimal: Liste + IndexedDB (vermeidbar)

**Soll:** Nur **imageRef** in der Liste, Bild nur in IndexedDB.

**Problem:** Wenn ein Schreibpfad **ohne** `prepareArtworksForStorage` / ohne `saveArtworksByKeyWithImageStore` schreibt, kann **imageUrl** als lange Base64-URL in der Liste landen. Dann haben wir:
- dieselben Bildbytes in **localStorage** (im JSON-String) und
- dieselben Bildbytes in **IndexedDB** (wenn vorher mal mit ImageStore gespeichert wurde)

oder nur in localStorage (wenn nie ImageStore genutzt wurde) → Speicher voll.

**Betroffene Schreibpfade (ohne ImageStore):**

| Datei | Aufruf | Risiko |
|-------|--------|--------|
| **PlatzanordnungPage** | `saveArtworksByKey('k2-artworks', updatedArtworks, …)` | Liste kann imageUrl/previewUrl als Base64 enthalten → direkt in localStorage |
| **GaleriePage** | `saveArtworksForContext(…, mergedWithImages/localArtworks)` | mergedWithImages kann Base64 von preserveLocalImageData haben → wird so geschrieben |
| **GalerieVorschauPage** | `saveArtworksForContext` / `saveArtworksStorage(toSave)` an mehreren Stellen | toSave kann aus State mit aufgelösten Bildern (imageUrl = data:) kommen |
| **ScreenshotExportAdmin** | `saveArtworksByKey(…, allArtworks/updated, …)` an einigen Stellen (z. B. 2356, 13306, 14698) | State kann Base64 enthalten |

**Bereits abgesichert:** „Vom Server laden“ / „Nur Server-Stand“ / „Werke vom Server zurückholen“ nutzen jetzt `stripBase64FromArtworks` vor dem Speichern. Admin `saveArtworks(tenant, …)` nutzt `saveArtworksByKeyWithImageStore`.

---

### 2.2 previewUrl als Base64 in der Liste (Lücke)

**prepareArtworksForStorage** (artworkImageStore.ts) lagert nur **imageUrl** (data:image) in IndexedDB aus. **previewUrl** wird nicht angefasst.

- Wenn **previewUrl** als Base64 gespeichert wird, bleibt es in der Werkliste → **unnötig großer JSON-String** in localStorage.
- Oft ist previewUrl ein Duplikat oder eine Variante von imageUrl (z. B. Thumbnail) → **doppelte Datenmenge** für dasselbe Werk.

**Empfehlung:** In `prepareArtworksForStorage` auch **previewUrl** prüfen: Wenn data:image → auslagern (z. B. unter `ref + '-preview'`) oder auf '' setzen und bei Anzeige aus imageRef ableiten. Oder mindestens: Base64-previewUrl vor dem Schreiben auf '' setzen, wenn imageRef gesetzt ist (Anzeige nutzt dann imageUrl aus resolveArtworkImages).

---

### 2.3 Keine Dopplung (by design)

- **IndexedDB:** Ein Bild pro Ref, keine Duplikate.
- **Supabase:** URL nach Upload; Sync-Zweck, nicht „doppelt“ im Sinne von vermeidbar.
- **Export (gallery-data.json):** artworksForExport entfernt Base64, nur URLs → klein.

---

## 3. Größenordnung (typisch)

- **Ein Werk (nur Metadaten + imageRef):** ca. 0,5–2 KB.
- **Ein Werk mit imageUrl = Base64 (mittel komprimiert):** 100–600 KB.
- **70 Werke:** Mit Base64 in der Liste leicht 7–40 MB → localStorage-Limit (5–10 MB) überschritten. Mit imageRef nur: ca. 35–140 KB.

---

## 4. Nächste Schritte (Priorität)

1. **previewUrl in prepareArtworksForStorage:** ✅ Erledigt – Base64 aus previewUrl wird geleert (Zeile 156 in artworkImageStore.ts).
2. **Schreibpfade vereinheitlichen:** ✅ Erledigt (10.03.26): GaleriePage Merge-Schreiben → `await saveArtworksForContextWithImageStore`; DevViewPage beide saveArtworksByKey → `saveArtworksByKeyWithImageStore`. PlatzanordnungPage, GalerieVorschauPage, Admin nutzten bereits ImageStore.
3. **Optional:** Beim Laden von Server-Daten (bereits umgesetzt) stripBase64FromArtworks – bleibt so.

---

**Verknüpfung:** .cursor/rules/komprimierung-fotos-videos.mdc, .cursor/rules/werke-bilder-immer-imagestore.mdc, docs/WERKE-SPEICHERUNG-CHECKLISTE.md, FEHLERANALYSEPROTOKOLL (Fehlerklasse Datenmenge/Komprimierung).
