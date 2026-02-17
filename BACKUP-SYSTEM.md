# K2 Galerie – Lokales Speichern & automatisches Backup

**Stand:** Februar 2026

---

## Was läuft automatisch (du kannst dich darauf verlassen)

### 1. Lokales Speichern – alle Änderungen

- **Alle 5 Sekunden** werden im Admin automatisch gespeichert:
  - Stammdaten (Martina, Georg, Galerie)
  - Werke
  - **Eventplanung (Events)**
  - **Öffentlichkeitsarbeit (Dokumente)**
  - Seitentexte
  - Design-Einstellungen

- **Beim Schließen des Tabs / Wechseln der App** wird sofort eine komplette Speicherung ausgelöst (alle genannten Daten).

- **Speicherort:** nur im Browser (localStorage) auf dem Gerät, auf dem du den Admin geöffnet hast.

---

### 2. Vollbackup – auf Speicherplatte reicht

- **Kein** automatisches Vollbackup mehr im Browser (localStorage). Das spart Speicher und beugt „Speicher voll“ vor.
- **Empfehlung:** Vollbackup regelmäßig mit **„Vollbackup herunterladen“** erstellen und die Datei sicher aufbewahren (z. B. Ordner „K2 Backups“, backupmicro).
- Enthält: Stammdaten, Werke, Events, Dokumente, Seitentexte, Design.

**Wenn Einstellungen, Eventplanung oder Stammdaten (E-Mail, Telefon) „weg“ sind:**
1. **Zuerst:** Vollbackup-Datei von backupmicro (oder „K2 Backups“) verwenden → Admin → **Einstellungen** → **„💾 Backup & Wiederherstellung“** → **„Aus Backup-Datei wiederherstellen“**.
2. Falls du zuvor im selben Browser **„Aus letztem Backup wiederherstellen“** genutzt hattest (selten): Dann existiert noch ein älteres Backup im Browser – sonst zeigt die App „Kein Backup im Browser“ und verweist auf die Datei-Wiederherstellung.
3. Zusätzlich sind die K2-Kontaktdaten im Repo hinterlegt (`src/config/tenantConfig.ts` → `K2_STAMMDATEN_DEFAULTS`). Beim Laden und Speichern werden leere Felder nie überschrieben; es wird immer aus diesem Standard aufgefüllt, wenn etwas fehlt.

---

### 3. Manuelles Vollbackup (Datei)

- Button **„Vollbackup herunterladen“** im Admin legt eine JSON-Datei auf deinem Rechner ab.
- Enthält dieselben Daten wie das Auto-Backup.
- **Empfehlung:** Regelmäßig ausführen und die Datei sicher aufbewahren (z. B. Ordner „K2 Backups“). Dann hast du ein Backup außerhalb des Browsers.

### 4. Spiegelung auf backupmicro

- **backupmicro** = externer Speicher (liegt auf Georgs Schreibtisch).
- Alle Backups (z. B. Projektordner, Vollbackup-Dateien, gallery-data.json) sollen als **Spiegelung** auch auf backupmicro gesichert werden.

### 5. Hard-Backup auf backupmicro (erste vollständige Version + Versionsnummer)

- **Zweck:** Einmalig (und bei Bedarf wiederholt) ein **vollständiges Backup mit Versionsnummer** anlegen – **nur auf backupmicro**, nicht auf dem Mac (Speicher schonen).
- **Inhalt:** `gallery-data.json` (Stammdaten, Werke, Events, Dokumente, Design, Seitentexte) + MANIFEST mit Version und Datum.
- **Versionslogik:** Jedes Lauf erzeugt eine neue Version (v001, v002, v003, …). Ordner heißen z. B. `v001--2026-02-15--17-30`.
- **Wo:** Auf backupmicro unter `K2-Galerie-Backups/`. Auf dem Mac wird nichts zusätzlich gespeichert.
- **Ausführung (im Terminal am Mac):**
  ```bash
  cd /Users/georgkreinecker/k2Galerie
  bash scripts/hard-backup-to-backupmicro.sh
  ```
  Vorher: **BACKUPMICRO** anstecken (externer Speicher, wie auf dem Desktop). Standard-Pfad: `/Volumes/BACKUPMICRO`. Wenn das Laufwerk anders heißt: `BACKUPMICRO=/Volumes/DeinLaufwerk bash scripts/hard-backup-to-backupmicro.sh`
- **Vor dem ersten Mal:** Einmal im Admin **„Veröffentlichen“** klicken, damit `public/gallery-data.json` existiert. Dann Skript ausführen – das ist deine erste vollständige Version (v001).
- **Noch vollständiger (optional):** Im Admin **„Vollbackup herunterladen“** (Einstellungen → Backup & Wiederherstellung) klicken, die Datei im Projektordner als `backup/k2-vollbackup-latest.json` speichern. Beim nächsten Skript-Lauf wird diese Datei mit auf backupmicro kopiert (als `k2-vollbackup.json` im Versionsordner). So hast du neben `gallery-data.json` auch den kompletten App-Vollbackup in der Version.

---

## Was du beachten solltest

- **localStorage** ist pro Gerät und pro Browser. Am Mac gespeichert = nur am Mac in diesem Browser sichtbar.
- **„Veröffentlichen“** schreibt die Daten in die Datei `gallery-data.json` und (mit Git Push) auf Vercel. Dann können andere Geräte (z. B. Handy) nach Aktualisieren die gleichen Daten sehen.
- Wenn du den Browser-Daten löschst (z. B. „Website-Daten löschen“), ist localStorage weg. Dann hilft nur: Vollbackup-Datei wiederherstellen (Funktion „Aus Datei wiederherstellen“, falls eingebaut) oder Daten neu anlegen und erneut veröffentlichen.

---

## Kurzfassung

| Aktion | Was passiert |
|--------|----------------|
| Im Admin etwas ändern | Alle 5 Sek. automatisch in localStorage + 1 Vollbackup-Slot |
| Tab schließen / App wechseln | Sofort komplette Speicherung |
| „Vollbackup herunterladen“ | JSON-Datei auf deinen Rechner |
| „Aus letztem Backup wiederherstellen“ | Im Admin: **Einstellungen** → Kasten „Backup & Wiederherstellung“. Lädt den letzten Auto-Backup-Stand (Seite lädt neu). |
| „Veröffentlichen“ | Schreibt alles in gallery-data.json (inkl. Events, Dokumente) |
| Hard-Backup auf backupmicro | Im Terminal: `bash scripts/hard-backup-to-backupmicro.sh` → erzeugt v001, v002, … nur auf backupmicro |

Du kannst dich darauf verlassen, dass **alle Änderungen lokal abgespeichert** werden und ein **automatisches Backup-System** (5-Sekunden-Intervall + Vollbackup-Slot + Sofort-Save beim Verlassen) aktiv ist.
