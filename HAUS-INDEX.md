# Haus-Index – K2 Galerie Projekt
**Vom Keller bis zum Dachboden: Wo liegt was (Stand 17.02.26)**  
Nichts wurde weggeschmissen oder verlegt – nur diese Übersicht zum Wiederfinden.

---

## Keller (Backend, Skripte, Daten)

| Ort | Inhalt | Wofür |
|-----|--------|--------|
| **scripts/** | Build-, Backup-, Git-, Öffnen-Skripte | `write-build-info.js`, `git-push-gallery-data.sh`, `hard-backup-to-backupmicro.sh` usw. |
| **supabase/** | Datenbank, Edge Functions, Migrations | Backend (KV, Auth). Nicht löschen. |
| **backup/** | Lokale Backup-Ablage | Falls du Backups hier ablegst. |
| **public/api** | API-Stubs/Statik | Falls verwendet. |

---

## Erdgeschoss (App, Quellcode)

| Ort | Inhalt | Wofür |
|-----|--------|--------|
| **src/** | React-App (Seiten, Config, Utils) | Hauptcode: `App.tsx`, `pages/`, `config/`, `utils/`. |
| **src/pages/** | Alle Routen (Galerie, Shop, Admin-Einstieg, Willkommen, …) | Einstieg: `GaleriePage`, `ShopPage`, `DevViewPage`, `WillkommenPage`. |
| **src/config/** | Navigation, Tenant, Texte, Seitengestaltung | `navigation.ts`, `tenantConfig.ts`, `pageContentGalerie.ts`. |
| **components/** | ScreenshotExportAdmin (Admin-UI), SafeMode, GalerieAssistent | Admin = `ScreenshotExportAdmin.tsx`. |
| **public/** | Statische Assets, Handbuch-Kopie, Flyer, `build-info.json` | Build-Ausgabe, Icons, Handbuch für App. |
| **index.html** | Einstiegs-HTML der App | Vite/React-Einstieg. |

---

## Obergeschoss (Dokumentation, Handbuch)

| Ort | Inhalt | Wofür |
|-----|--------|--------|
| **docs/** | Projekt-Doku (K2/ök2, Vercel, Supabase, Crash-Fixes, Marketing) | Siehe **docs/00-INDEX.md** – dort alle Docs mit Kurzbeschreibung. |
| **k2team-handbuch/** | Team-Handbuch (00–13) | **00-INDEX.md** = Inhaltsverzeichnis. Spiegel in `public/k2team-handbuch/` für App. |
| **docs/CRASH-FIXES-STAND-17-02-26.md** | Crash-Fixes (Admin, Safe-Mode, Verzögerungen) | Was wir für Stabilität geändert haben. |
| **docs/K2-OEK2-DATENTRENNUNG.md** | K2 vs. ök2 Regeln | Pflicht bei Änderungen an Daten/Keys. |

---

## Dachboden (Root: Anleitungen, Fix-Notizen, HTML)

Viele Dateien liegen im **Projektroot** – absichtlich nicht verlegt, damit du sie findest.

### HTML-Dateien (Root)
Standalone-Seiten (Print-Bridge, Anleitungen, Tests). Alle behalten.

- `K2-ProjectManager-Launcher.html` – Launcher
- `k2-print-bridge.html` / `k2-print-bridge-simple.html` – Druck-Bridge
- `print-bridge-anleitung.html`, `ipad-anleitung.html`, `einfache-anleitung.html`, `video-anleitung.html` – Anleitungen
- `deployment-hilfe.html` – Deployment-Hilfe
- `auto-fix.html`, `check-status.html`, `debug-galerie.html`, `debug-settings.html` – Debug/Status
- `fix-database.html`, `fix-db-permissions.html` – DB-Fix-Seiten
- `test-connection.html`, `test-database-fix.html`, `test-kv-direct.html` – Tests

### Markdown-Dateien (Root)
Anleitungen und Sitzungs-/Fix-Notizen. Nichts gelöscht – nur hier gelistet.

- **Einstieg:** `START_HIER.md`, `START-HIER-SUPABASE.md`, `README.md`
- **Backup:** `BACKUP-SYSTEM.md`, `BACKUP-ANLEITUNG.md`, `K2-Backup-Automator-Anleitung.md`
- **Deployment/Vercel:** `VERCEL_ANLEITUNG_DEUTSCH.md`, `VERCEL_DEPLOYMENT.md`, `DEPLOYMENT_ANLEITUNG.md`, `EINFACHES_DEPLOYMENT.md` + viele VERCEL-*.md
- **Supabase:** `README-SUPABASE.md`, `SUPABASE-*.md` (Setup, Fixes, Prüfen)
- **Cursor/Stabilität:** `CRASH-FIX*.md`, `CURSOR-CRASH-WORKAROUND*.md`, `CURSOR-STABILITAET-FIX.md`, `ABSTURZ-CHECK.md`
- **K2 Start/APf:** `K2-EINFACH-OEFFNEN.md`, `K2-PLATTFORM-EINRICHTUNG.md`, `ANLEITUNG-ARBEITSPLATTFORM.md`, `AUTOSTART-*.md`
- **Git/GitHub:** `GITHUB_SETUP_ANLEITUNG.md`, `GITHUB-TOKEN-*.md`, `GITHUB-PUSH-*.md`
- **Drucker:** `BROTHER-PRINT-SERVER-README.md`, `MOBILE-PRINT-ANLEITUNG.md`, `PRINT-BRIDGE-SCHNELLSTART.md`
- **Sonstiges:** `REGELN.md`, `QUALITAETS-CHECKLISTE.md`, Handy, Kassensummen, Social Media, Domain, zweiter Mac, etc.

Wenn du etwas Bestimmtes suchst: Suche im Root nach dem Stichwort (z. B. „Backup“, „Vercel“, „Crash“) – die Dateinamen sind sprechend.

---

## Ähnliche / mehrfache Themen (nur Hinweis – nichts gelöscht)

Manche Themen haben **mehrere Dateien** (z. B. Backup, Vercel, Crash). Das ist absichtlich so geblieben – unterschiedliche Entstehungszeiten oder Detail-Tiefe. Wenn du etwas suchst:

- **Backup:** Root `BACKUP-*.md`, `K2-Backup-*.md`; Handbuch **k2team-handbuch/13-*.md**; Skript **scripts/hard-backup-to-backupmicro.sh**.
- **Vercel/Stand:** Root `VERCEL-*.md`, `DEPLOYMENT-*.md`; **docs/VERCEL-STAND-HANDY.md**, **docs/STAND-QR-SO-BLEIBT-ES.md**.
- **Crash/Stabilität:** Root `CRASH-*.md`, `CURSOR-*.md`; **docs/CRASH-FIXES-STAND-17-02-26.md**.

Nichts davon wurde zusammengelegt oder gelöscht – alles auffindbar über Suche/Index.

---

## Bereits entfernte Doppelte (Stand 17.02.26)

Diese Dateien waren eindeutig doppelt oder von einer neueren Doku ersetzt und wurden gelöscht:

- **public/mission-control/CURSOR-FEEDBACK-VORLAGE.md** – identisch mit `mission-control/CURSOR-FEEDBACK-VORLAGE.md` (Quelle bleibt)
- **CRASH-FIXES.md**, **CRASH-FIX-STABIL.md** (Root) – Inhalt in **docs/CRASH-FIXES-STAND-17-02-26.md**
- **CURSOR-CRASH-WORKAROUND.md** (Root) – ersetzt durch **CURSOR-CRASH-WORKAROUND-FINAL.md**

Alle anderen Dateien bleiben; bei Unsicherheit wurde nichts gelöscht.

---

## Was wir nicht gemacht haben

- **Nichts verlegt** – Dateien liegen wie zuvor (außer gelöschte Doppelte).
- **Kein Code geändert** – nur Doku/Übersicht und Doppelte entfernt.

---

## Schnellfinder

- **App starten:** `npm run dev` (siehe README.md / START_HIER.md)
- **Stand aktualisieren:** `node scripts/write-build-info.js`
- **Vor Veröffentlichung:** `docs/VOR-VEROEFFENTLICHUNG.md` – Checkliste vor Go-Live (nicht vergessen).
- **Admin-Auth einrichten:** `docs/ADMIN-AUTH-SETUP.md`
- **Crash-Fixes:** `docs/CRASH-FIXES-STAND-17-02-26.md`
- **K2 vs. ök2:** `docs/K2-OEK2-DATENTRENNUNG.md`
- **Ein Standard pro Problemstellung:** Gleiche Aufgabe = eine Lösung (verschiedene Standards = Fehlerquellen). Regel: `.cursor/rules/ein-standard-problem.mdc`; Doku: `docs/STRUKTUR-HANDELN-QUELLEN.md`, `docs/00-INDEX.md`.
- **Handbuch-Inhalt:** `k2team-handbuch/00-INDEX.md`
- **Docs-Liste:** `docs/00-INDEX.md`
