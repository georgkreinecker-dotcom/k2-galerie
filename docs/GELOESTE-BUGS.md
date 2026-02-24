# Gelöste Bugs – Nachschlagewerk für AI (PFLICHT lesen bei Session-Start)

> **Automatische Tests:** `npm run test` (oder `npm test`) – läuft 21 Tests.
> **Tests laufen bei jedem Build automatisch** (in `npm run build` integriert).
> Test-Dateien: `src/tests/datentrennung.test.ts`, `kundendaten-schutz.test.ts`, `bild-upload.test.ts`

**Zweck:** Damit kein Bug zweimal auftaucht. Vor jeder Änderung an betroffenen Stellen: hier nachschauen.

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
