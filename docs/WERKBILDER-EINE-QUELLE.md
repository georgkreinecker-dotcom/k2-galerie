# Werkbilder – eine Quelle (Sportwagenmodus)

**Grundsatz:** Fertige, standardisierte Lösungen verwenden statt stundenlang Fehler im Eigenbau zu suchen. Siehe **profi-statt-dilettant-rad-nicht-zweimal.mdc** und **SPORTWAGEN-ROADMAP.md** Phase 4.3.

**Umsetzung:** 06.03.26 – Supabase = Standard beim Speichern (imageUrl + imageRef = Storage-URL); GitHub-Upload nur Fallback wenn Supabase nicht konfiguriert.

---

## Warum umstellen?

- **Aktuell:** Mix aus IndexedDB (lokal), GitHub-Upload (Vercel), optional Supabase. imageRef mal `k2-img-xxx`, mal URL. Folge: „Kein Bild“, Auflösungslogik, Sync-Probleme, Debug-Aufwand.
- **Standard am Markt:** Eine Cloud-Quelle (Supabase, S3, Cloudinary) → Upload → **eine URL** in den Daten → überall dieselbe URL. Kein gerätespezifischer Speicher.

---

## Ziel: Eine Quelle = Supabase Storage

- **Werkbilder** = nur noch **Supabase Storage** (bereits im Projekt: `uploadArtworkImageToStorage` in `src/utils/supabaseStorage.ts`).
- Ablauf: Bild speichern → Upload zu Supabase → **öffentliche URL** → diese URL in `imageUrl` und `imageRef` speichern.
- Kein IndexedDB für Werkbilder (langfristig), kein zweiter Upload-Pfad (GitHub) für Werkbilder. GitHub bleibt für **Seitenbilder** (Willkommen, Galerie-Karte, etc.).

---

## Konkrete Schritte (Reihenfolge)

1. **Supabase als einzige Upload-Ziel für Werkbilder**
   - In ScreenshotExportAdmin beim Speichern: Wenn Supabase konfiguriert → nur `uploadArtworkImageToStorage`, URL in `imageUrl` + `imageRef`. **Kein** nachfolgender GitHub-Upload für Werkbilder (Block „K2: Werk-Bild automatisch via GitHub hochladen“ entfernen oder nur ausführen wenn Supabase nicht konfiguriert).
   - So ist überall dieselbe URL, kein Überschreiben durch GitHub-URL.

2. **Fallback ohne Supabase**
   - Wenn Supabase nicht konfiguriert: weiterhin GitHub-Upload nutzen (oder klare Meldung „Supabase für Werkbilder konfigurieren“). Eine klare Regel: Entweder Supabase **oder** GitHub für Werkbilder, nicht beides parallel.

3. **Anzeige**
   - `resolveArtworkImages`: URL-Fall (imageRef/imageUrl mit `http(s)`) bleibt. IndexedDB-Zweig für Werkbilder wird obsolet, sobald alle Werkbilder nur noch URLs haben (kann schrittweise bleiben für Rückwärtskompatibilität).

4. **Export / Veröffentlichung**
   - gallery-data.json: Werke haben bereits imageUrl = Supabase-URL → kein resolveArtworkImageUrlsForExport nötig für Supabase-URLs (oder nur für Alt-Daten). Eine Quelle = weniger Sonderfälle.

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `components/ScreenshotExportAdmin.tsx` | Beim Speichern: Supabase-URL setzen; GitHub-Upload für Werkbilder nur Fallback oder entfernen. |
| `src/utils/supabaseStorage.ts` | Bleibt (bereits Upload + öffentliche URL). |
| `src/utils/artworkImageStore.ts` | resolveArtworkImages: URL-Fall beibehalten; IndexedDB optional für Übergang. |
| `src/utils/supabaseClient.ts` | resolveArtworkImageUrlsForExport: bei bereits vorhandener http(s)-URL nichts tun. |

---

## Kurzfassung

**Eine Quelle für Werkbilder = Supabase Storage. Upload → URL → URL in den Daten. Kein zweiter Pfad, kein IndexedDB für Werkbilder. Fertige Lösung statt Eigenbau.**
