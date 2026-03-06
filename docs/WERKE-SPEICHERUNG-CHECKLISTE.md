# Werke-Speicherung – Checkliste (bombensicher)

**Schlüsselfunktion:** Ohne zuverlässige Werke-Speicherung ist die App wertlos. Jede Änderung an Lade-/Schreib-Pfaden muss diese Regeln einhalten.

Stand: 05.03.26

---

## 1. Niemals mit weniger Werken überschreiben (Datenverlust)

- **Sportwagen: allowReduce default false.** In `saveArtworksForContext`, `saveArtworksForContextWithImageStore`, `saveArtworksOnly` ist der Default **allowReduce: false**. Nur wo bewusst weniger geschrieben wird (Backup-Restore, User hat gelöscht, AutoSave), explizit **allowReduce: true** übergeben.
- **saveArtworksByKey:** Wenn `list.length < currentCount` und **nicht** `allowReduce: true` → Speichern **ablehnen** (return false). Bereits in `artworksStorage.ts` umgesetzt.
- **Server-Daten in localStorage schreiben:** Immer nur, wenn `merged.length >= localCount` (bzw. `serverList.length >= currentCount`). Wenn weniger → **localStorage unverändert lassen**, nur Anzeige aus Server optional.
- **Mobile-Update (checkMobileUpdates):** Nur schreiben, wenn `artworks.length >= lokalAnzahl` und mit **allowReduce: false**. Siehe GalerieVorschauPage.
- **loadArtworksFromSupabase:** Nur dann in localStorage schreiben, wenn `merged.length >= localList.length`, und mit **allowReduce: false**.
- **allowReduce: true nur erlaubt bei:** Backup-Wiederherstellung, explizites User-Speichern (Admin, ggf. nach Löschen), AutoSave (aktueller State), Supabase-Fallback/Success (filterK2Only kann weniger ergeben).

## 2. Kein Filter-and-Write, das Kundendaten löscht

- **Verboten:** Liste filtern und das Ergebnis in `k2-artworks` (oder anderen geschützten Keys) zurückschreiben, ohne explizite User-Aktion (z. B. „Werk löschen“). Regel: `.cursor/rules/datentrennung-localstorage-niemals-loeschen.mdc`, `.cursor/rules/niemals-kundendaten-loeschen.mdc`.
- **Erlaubt:** Beim **expliziten Löschen** (User klickt „Werk löschen“) die neue Liste ohne das gelöschte Werk speichern (dann allowReduce erlaubt).

## 3. Kontext trennen (K2 / ök2 / VK2)

- **K2:** Key `k2-artworks`; Schreiben nur über saveArtworksForContext(false, false, …) oder saveArtworksByKey('k2-artworks', …).
- **ök2:** Key `k2-oeffentlich-artworks`; niemals in `k2-artworks` schreiben, wenn Kontext ök2.
- **VK2:** Kein Artwork-Key; saveArtworksForContext(false, true, …) ist No-Op.

## 4. Supabase: Schreiben

- **saveArtworksToSupabase:** Nur gültige Werke (mit `number` oder `id`) senden; ungültige vorher filtern und warnen.
- **Bild-URL-Auflösung:** Einzelfehler (z. B. IndexedDB/Storage) dürfen den gesamten Batch nicht abbrechen (try/catch pro Werk).
- **Bei Fehler:** Fallback `saveToLocalStorage(validArtworks)`; niemals leere Liste schreiben.

## 5. Supabase: Lesen

- **loadArtworksFromSupabase:** Nach Merge nur schreiben, wenn `merged.length >= localList.length`, mit **allowReduce: false**. Sonst nur `return merged` ohne localStorage-Schreibzugriff.
- **Merge-Regel:** mergeServerWithLocal (syncMerge.ts); Server = Basis, lokale nur hinzufügen/überschreiben nach Konfliktregel.

## 6. Bild-Speichermix (IndexedDB + localStorage)

- **prepareArtworksForStorage:** Große data-URLs in IndexedDB auslagern; bei Fehler **nicht** das Werk verwerfen, sondern mit Original-Bild in der Liste lassen (out.push(a)).
- **resolveArtworkImages:** Nur lesen aus IndexedDB; nie in localStorage zurückschreiben.

## 7. Backup vor kritischen Aktionen

- Vor Überschreiben aus Server/Fetch (z. B. „Bilder vom Server laden“, Merge): Backup in `k2-artworks-backup` oder Vollbackup. Bei Fehler oder „weniger Werke“: Backup wiederherstellen anbieten bzw. nicht überschreiben.

## 8. Betroffene Dateien (bei Änderungen prüfen)

| Bereich | Dateien |
|--------|--------|
| Schicht | `src/utils/artworksStorage.ts` (saveArtworksByKey, saveArtworksForContext, mergeAndMaybeWrite) |
| Supabase | `src/utils/supabaseClient.ts` (saveArtworksToSupabase, loadArtworksFromSupabase) |
| Merge | `src/utils/syncMerge.ts` (mergeServerWithLocal, preserveLocalImageData) |
| Bilder | `src/utils/artworkImageStore.ts` (prepareArtworksForStorage, resolveArtworkImages) |
| Aufrufer | GalerieVorschauPage, GaleriePage, ScreenshotExportAdmin, DevViewPage, autoSave.ts |

## 9. Vor jedem Commit (Werke-Speicherung geändert?)

- [ ] Wird irgendwo mit **weniger** Werken als aktuell in localStorage geschrieben, ohne dass der User explizit gelöscht hat? → Verboten.
- [ ] Wird ein **Filter** auf eine Liste angewendet und das Ergebnis in `k2-artworks` (oder ök2-Key) geschrieben? → Nur wenn explizite User-Aktion (z. B. Löschen).
- [ ] **allowReduce:** Default in der Schicht ist false. Ist **allowReduce: true** nur dort, wo bewusst weniger erlaubt ist (Backup-Restore, User-Löschung, AutoSave, Supabase-Fallback)?
- [ ] Kontext (K2 vs. ök2): Wird in den richtigen Key geschrieben?

---

**Verknüpfung:** `.cursor/rules/niemals-kundendaten-loeschen.mdc`, `.cursor/rules/datentrennung-localstorage-niemals-loeschen.mdc`, `docs/SYNC-REGEL.md`, `docs/K2-OEK2-DATENTRENNUNG.md`.
