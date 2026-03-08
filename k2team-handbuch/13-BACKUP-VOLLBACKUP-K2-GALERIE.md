# Backup & Vollbackup K2 Galerie

**Erstellt:** 15. Februar 2026  
**Zweck:** Dokumentation des Speicherns, Backups und des Hard-Backups auf backupmicro (erste Version / Versionsnummern).

---

## 📋 Übersicht

Die K2 Galerie speichert automatisch im Browser und bietet manuell ein **Vollbackup** zum Herunterladen sowie ein **Hard-Backup mit Versionsnummer** nur auf dem externen Speicher **backupmicro**.

---

## Was läuft automatisch

### 1. Lokales Speichern (alle 5 Sekunden)

- Im Admin werden automatisch gespeichert: Stammdaten (Martina, Georg, Galerie), Werke, Eventplanung, Dokumente, Seitentexte, Design.
- **Speicherort:** nur im Browser (localStorage) auf dem Gerät, auf dem du den Admin geöffnet hast.
- Beim Schließen des Tabs oder Wechseln der App wird sofort eine komplette Speicherung ausgelöst.

### 2. Vollbackup – auf Speicherplatte reicht

- **Kein** automatisches Vollbackup mehr im Browser (localStorage). Das spart Speicher.
- **Empfehlung:** Regelmäßig **„Vollbackup herunterladen“** und Datei sicher aufbewahren (z. B. backupmicro). **Wiederherstellung:** Admin → **Einstellungen** → **„Aus Backup-Datei wiederherstellen“** und die gespeicherte Datei wählen.

---

## Manuelles Vollbackup (Datei)

- Button **„Vollbackup herunterladen“** im Admin (Einstellungen → Backup & Wiederherstellung) legt eine JSON-Datei auf deinem Rechner ab.
- Enthält: Stammdaten, Werke, Events, Dokumente, Seitentexte, Design.
- **Empfehlung:** Regelmäßig ausführen und die Datei sicher aufbewahren (z. B. Ordner „K2 Backups“ oder auf backupmicro).

---

## Hard-Backup auf backupmicro (Vollbackup mit Versionsnummer)

### Zweck

- Ein **vollständiges Backup mit Versionsnummer** anlegen – **nur auf backupmicro**, nicht auf dem Mac (Speicher schonen).
- Ideal für die **erste vollständige Version** der K2 Galerie und für spätere Versionen (v001, v002, v003, …).

### Inhalt

- **gallery-data.json** (Stammdaten, Werke, Events, Dokumente, Design, Seitentexte)
- **MANIFEST.txt** (Version, Datum, Anzahl Werke/Events/Dokumente)
- Optional: **k2-vollbackup.json** (wenn vorher „Vollbackup herunterladen“ als `backup/k2-vollbackup-latest.json` im Projekt gespeichert wurde)

### Wo wird gespeichert?

- Auf dem externen Speicher **backupmicro** (z. B. auf dem Schreibtisch).
- Ordner z. B.: `KL2-Galerie-Backups` oder `K2-Galerie-Backups`.
- Jedes Lauf erzeugt einen neuen Unterordner: **v001--2026-02-15--18-20**, **v002--…**, usw.
- Auf dem Mac wird durch das Skript **nichts** zusätzlich gespeichert.

### Voraussetzungen

1. **backupmicro** anstecken (sollte auf dem Desktop erscheinen, z. B. als „BACKUPMICRO“).
2. Einmal im Admin **„Veröffentlichen“** klicken, damit `public/gallery-data.json` existiert und aktuell ist.

### Ausführung (im Terminal am Mac)

```bash
cd /Users/georgkreinecker/k2Galerie
bash scripts/hard-backup-to-backupmicro.sh
```

- Wenn das Laufwerk anders heißt:  
  `BACKUPMICRO=/Volumes/DeinLaufwerk bash scripts/hard-backup-to-backupmicro.sh`
- Optional mit eigenem Ordnernamen:  
  `bash scripts/hard-backup-to-backupmicro.sh "KL2-Galerie-Backups"`

### Noch vollständiger (optional)

1. Im Admin **„Vollbackup herunterladen“** klicken.
2. Die Datei im Projektordner als **`backup/k2-vollbackup-latest.json`** speichern (Ordner `backup/` existiert bereits).
3. Anschließend das Skript ausführen wie oben. Dann wird diese Datei mit auf backupmicro kopiert (als **k2-vollbackup.json** im Versionsordner).

---

## Spiegelung auf backupmicro

- **backupmicro** = externer Speicher (Georgs Schreibtisch).
- Alle Backups (Projektordner, Vollbackup-Dateien, gallery-data.json, Hard-Backup-Versionen) sollen als **Spiegelung** auch auf backupmicro gesichert werden.

---

## Backup prominent – Zugriff bei Notfall („sollte etwas mit mir sein“)

Das Vollbackup ist so **prominent** abgelegt, dass ein **Zugriff möglich** sein muss – auch wenn etwas mit Georg ist (Vertrauensperson, Familie, Nachfolge).

- **Wo liegt es?** Auf dem externen Speicher **backupmicro** (physischer Ort: z. B. Georgs Schreibtisch – bitte festhalten). Ordner: **K2-Galerie-Backups** oder **KL2-Galerie-Backups**. Neueste Version = neuester Unterordner (v001--Datum, v002--…).
- **Was liegt drin?** Im Versionsordner: `gallery-data.json`, `MANIFEST.txt`, optional `k2-vollbackup.json`. Das reicht zur Wiederherstellung.
- **Zugriff sichern:** Dieses Kapitel (oder die Kurzfassung) **ausdrucken** und an einem festen Ort aufbewahren (z. B. mit anderen wichtigen Unterlagen), damit im Notfall jemand weiß: Vollbackup K2 Galerie = backupmicro, Ordner K2-Galerie-Backups, neuester Unterordner.
- **Wiederherstellung:** backupmicro an Mac anschließen → neuesten Ordner öffnen → in der App Admin → Einstellungen → „Aus Backup-Datei wiederherstellen“ → `gallery-data.json` oder `k2-vollbackup.json` wählen.

Ausführliche Doku (inkl. wo backupmicro liegt festhalten): **docs/BACKUP-ZUGANG-NOTFALL.md**.

---

## Kurzfassung

| Aktion | Was passiert |
|--------|----------------|
| Im Admin etwas ändern | Alle 5 Sek. automatisch in localStorage + 1 Vollbackup-Slot |
| Tab schließen / App wechseln | Sofort komplette Speicherung |
| „Vollbackup herunterladen“ | JSON-Datei auf deinen Rechner |
| „Aus letztem Backup wiederherstellen“ | Einstellungen → Backup & Wiederherstellung → letzten Auto-Backup-Stand laden (Seite lädt neu) |
| „Veröffentlichen“ | Schreibt alles in gallery-data.json (inkl. Events, Dokumente) |
| Hard-Backup auf backupmicro | Im Terminal: `bash scripts/hard-backup-to-backupmicro.sh` → erzeugt v001, v002, … nur auf backupmicro |

---

## Wiederherstellung

- **Aus letztem Backup:** Im Admin → Einstellungen → Backup & Wiederherstellung → „Aus letztem Backup wiederherstellen“.
- **Aus Hard-Backup:** `gallery-data.json` aus dem Versionsordner auf backupmicro ins Projekt unter `public/gallery-data.json` kopieren und erneut veröffentlichen (oder im Admin „Aus Datei wiederherstellen“, falls angeboten).
- **Leere Kontaktfelder:** Werden beim Laden automatisch aus der Repo-Konfiguration (`K2_STAMMDATEN_DEFAULTS`) aufgefüllt.

---

**Quelle im Projekt:** `BACKUP-SYSTEM.md` (ausführliche technische Beschreibung).
