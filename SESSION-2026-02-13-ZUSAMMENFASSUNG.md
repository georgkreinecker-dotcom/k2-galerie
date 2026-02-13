# Sitzung 13.02.2026 – Zusammenfassung aller Änderungen

## ✅ Erledigte Aufgaben

### 1. Vercel API für Veröffentlichen (iPad → alle Geräte)
- **Neue Datei:** `api/write-gallery-data.js` – Serverless Function
- **vercel.json:** Rewrite angepasst, damit `/api/*` funktioniert
- **Dokumentation:** `VERCEL-API-VEROEFFENTLICHUNG.md`
- **Benötigt:** GITHUB_TOKEN in Vercel Environment Variables

### 2. Server = Quelle der Wahrheit (Synchronisation)
- **GaleriePage, GalerieVorschauPage, ScreenshotExportAdmin:** Merge-Logik geändert
- Nach Veröffentlichung: Alle Geräte zeigen dieselben Werke
- Gelöschte Werke verschwinden überall
- **History:** Gelöschte Werke in `k2-artworks-history` archiviert (für Wiederherstellung)

### 3. Mobile Verbesserungen
- **Erfolgs-Modal:** Auf iPad/iPhone nur kurze Meldung + Schließen (kein Vercel-Button)
- **Banner entfernt:** „Auch aus anderem WLAN erreichbar“ / „K2 im Internet öffnen“ – nicht mehr auf Mobile
- **Root-Redirect:** Auf Mobile bei "/" direkt zur Galerie (kein APf/Überlagerung)

### 4. Fehlermeldung kopieren (Mobile → Cursor)
- Fehlermeldung in `textarea` – Text antippen, halten, Kopieren
- Fallback-Kopieren per `execCommand` für iPad/iPhone

### 5. Git-Push Skript
- **git-push-gallery-data.sh:** Stash vor Branch-Wechsel (verhindert Fehler bei `buildInfo.generated.ts`)

### 6. Strenge Regel
- **.cursorrules:** Stand SOFORT nach jeder Änderung aktualisieren

### 7. Hilfedatei
- **GEORG-PUSH-EINFACH.md:** Einfache Push-Anleitung (2 Befehle)

---

## 📁 Geänderte/Neue Dateien

| Datei | Änderung |
|-------|----------|
| `api/write-gallery-data.js` | NEU |
| `vercel.json` | Rewrite für /api |
| `src/utils/artworkHistory.ts` | NEU |
| `src/pages/GaleriePage.tsx` | Merge, Banner, appendToHistory |
| `src/pages/GalerieVorschauPage.tsx` | Merge, appendToHistory |
| `src/App.tsx` | MobileRootRedirect |
| `components/ScreenshotExportAdmin.tsx` | Merge, Modal, Kopieren |
| `scripts/git-push-gallery-data.sh` | Stash-Logik |
| `.cursorrules` | Stand-Regel |

---

## ök2 (Öffentliche Demo)

- **Unverändert:** ök2 nutzt MUSTER_ARTWORKS, keine echten Daten
- **Banner:** Wird auf Mobile ebenfalls ausgeblendet (gilt für beide)
- **Stand:** Gleicher Build wie K2

---

## Nächste Schritte

1. **Commit & Push** (siehe GEORG-PUSH-EINFACH.md)
2. Auf Vercel: GITHUB_TOKEN prüfen (falls noch nicht)
3. Nach Push: 1–2 Min warten, dann auf allen Geräten testen
