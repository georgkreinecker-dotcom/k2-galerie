# Bericht: Abläufe im Sportwagenmodus (06.03.26)

**Auftrag:** Alle Abläufe prüfen, ob „ein Standard – überall gleich“ umgesetzt ist.

---

## ✅ Bereits standardisiert (ein Ablauf, viele Aufrufer)

| Ablauf | Standard | Aufrufer / Nutzung |
|--------|----------|---------------------|
| **Bild einfügen / Bild übernehmen** | `runBildUebernehmen` (ScreenshotExportAdmin) | Design (Willkommen, Galerie-Karte, Virtual-Tour), VK2 Eingangskarten, VK2 Mitglieder (Foto + Werk), Dokument hochladen, Event-Dokument. Alle nutzen dieselbe Funktion. |
| **Dokument öffnen (Admin)** | `openDocumentInApp(html, title)` | Presse, Flyer, Event-Flyer, Plakat, Vita, gespeicherte Dokumente – alle über dieselbe Funktion, ein Viewer. |
| **Merge Server + lokal (Werke)** | `mergeServerWithLocal` (syncMerge.ts) | GaleriePage (2×), GalerieVorschauPage (handleRefresh), supabaseClient (loadArtworksFromSupabase). |
| **Bildkomprimierung** | `compressImageForStorage` (utils) | imageProcessingTool, autoSave, MarketingOek2Page, ScreenshotExportAdmin, githubImageUpload. |
| **Reload (sicher)** | `safeReload` (env.ts) | GaleriePage (Pull-to-Refresh), ErrorBoundary, Vk2GaleriePage, appBootstrap, index.html-Fallback. iframe-Check zentral. |
| **Artworks lesen/schreiben (Kern)** | `artworksStorage`: readArtworksRawForContext, saveArtworksForContext, readArtworksRawByKey, saveArtworksByKey | GaleriePage, GalerieVorschauPage, PlatzanordnungPage, **VirtuellerRundgangPage**, **ShopPage** nutzen die Schicht (readArtworksRawByKey('k2-artworks') bzw. Kontext-API). |
| **Zurück-Navigation** | `fromAdminTab` / `fromAdminContext` in location.state | GaleriePage, GalerieVorschauPage, Vk2GaleriePage, Vk2GalerieVorschauPage, ScreenshotExportAdmin setzen/lesen einheitlich (zurueck-woher-gekommen.mdc). |
| **Veröffentlichen / Vom Server laden (Admin)** | `apiGet` / `apiPost` (apiClient) | handleLoadFromServer, publishMobile (ScreenshotExportAdmin) nutzen apiClient. |

---

## ⚠️ Abweichungen / Nachbesserungsbedarf

### 1. ~~Artworks laden – direkter localStorage~~ ✅ erledigt (06.03.26)

VirtuellerRundgangPage und ShopPage nutzen jetzt `readArtworksRawByKey('k2-artworks')` aus artworksStorage.

### 2. API-Aufrufe (fetch) – nicht überall apiClient

**apiClient (apiGet/apiPost)** wird genutzt in: ScreenshotExportAdmin (handleLoadFromServer, publishMobile).

**Raw fetch** wird noch genutzt in u. a.:
- GaleriePage, GalerieVorschauPage (gallery-data.json, write-gallery-data)
- DevViewPage (gallery-data, write-gallery-data, build-info)
- LicencesPage (licence-data)
- PlatformStartPage, UebersichtBoardPage (visit, licence-data)
- MissionControlPage (backup, write-backup)
- Supabase/spezialisierte APIs (Supabase, GitHub, OpenAI, Stripe)

**Bewertung:** Für **gallery-data / write-gallery-data** wäre ein einheitlicher Weg über apiClient sinnvoll (Retry, Timeout, einheitliche Fehlerbehandlung). Andere (Supabase, GitHub, Stripe, Handbücher) sind fachlich andere APIs – dort kann raw fetch oder eigener Client sinnvoll bleiben. **Empfehlung:** Mindestens alle Aufrufe zu eigenen Backend-APIs (z. B. /api/gallery-data, /api/write-gallery-data, /api/licence-data, /api/visit) auf apiGet/apiPost umstellen, sofern noch nicht geschehen.

### 3. GalerieVorschauPage – Sync „vom Server“

Laut SYNC-REGEL.md nutzt GalerieVorschauPage bei syncFromGalleryData (Mobile-Polling) eine **andere Strategie** (Start mit Lokal, Server ergänzen) und **keine** mergeServerWithLocal. Optional später vereinheitlichen, wenn dieselbe Merge-Logik auch dort gewünscht ist.

---

## Kurzfassung

- **Stark standardisiert:** Bild einfügen, Dokument öffnen, Merge Werke, Komprimierung, Reload, Artworks-Schicht (GaleriePage, GalerieVorschauPage, Platzanordnung, VirtuellerRundgangPage, ShopPage), Zurück-Navigation, Admin „Vom Server laden“/Veröffentlichen.
- **Nachbesserung erledigt:** Artworks laden in VirtuellerRundgangPage + ShopPage auf artworksStorage umgestellt.
- **Optional:** API-Aufrufe (gallery-data, licence-data, visit) über apiClient bündeln.

---

**Stand:** 06.03.26 · Nächster Schritt: optional API-Bündelung (2) priorisieren.
