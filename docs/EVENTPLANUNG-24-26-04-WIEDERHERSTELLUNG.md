# Eventplanung 24.04.–26.04. (Eröffnung) – Wiederherstellung

**Stand:** 16.03.26

## Wo die Eventplanung und Öffentlichkeitsarbeit stecken

- **K2-Veranstaltungen** (inkl. Eröffnung 24.04.–26.04.) und **zugehörige Dokumente** (Flyer, Presse, Einladungen, etc.) liegen im Browser-Speicher (localStorage) unter:
  - **Events:** Key `k2-events`
  - **Dokumente (PR, Öffentlichkeitsarbeit):** Key `k2-documents`

## Wenn die Eröffnung / Eventplanung „weg“ ist

Die Daten sind **nicht im Code** – sie waren in deinem Browser (Mac) in `k2-events` und `k2-documents` gespeichert. Wenn sie überschrieben oder vermischt wurden, kommen sie nur aus einem **Backup** zurück.

### 1. Vollbackup-Datei (sicherste Quelle)

- **Hast du jemals „Vollbackup herunterladen“ gemacht** und die Datei abgelegt (z. B. auf backupmicro, in „K2 Backups“, auf dem Mac)?
- **Dann:** Admin → **Einstellungen** → **Backup & Wiederherstellung** → **„📂 Aus Backup-Datei wiederherstellen“** → diese Datei wählen.
- In der Datei sind **Stammdaten, Werke, Events, Dokumente** (inkl. aller PR/Öffentlichkeitsarbeit). Nach der Wiederherstellung sind `k2-events` und `k2-documents` wieder der Stand aus der Backup-Datei.

### 2. backupmicro (Spiegelung)

- Wenn du Backups auf **backupmicro** gespiegelt hast (z. B. mit `scripts/hard-backup-to-backupmicro.sh` oder manuell abgelegte Vollbackup-Dateien):
  - backupmicro an den Mac anschließen → neuesten Ordner / neueste K2-Backup-Datei suchen.
  - In der App: **Einstellungen** → **„Aus Backup-Datei wiederherstellen“** → diese Datei wählen.

### 3. „Aus letztem Backup wiederherstellen“

- Nutzt den Key `k2-full-backup` im **gleichen Browser** (wird nicht mehr laufend geschrieben, um Speicher zu sparen).
- Nur sinnvoll, wenn dort noch ein **älterer** Stand mit Events/Dokumenten liegt (z. B. von vor der Vermischung). Sonst: Vollbackup-Datei nutzen.

## Was die Reparatur im Code macht (seit 16.03.26)

- Beim **Laden** von `k2-events` (K2-Galerie, Admin K2) werden nur solche Einträge **entfernt**, die **dieselbe Event-ID** wie ein Eintrag in `k2-vk2-events` haben (Vermischung VK2 → K2 rückgängig).
- Es wird **kein** K2-Event gelöscht, das eine **eigene, nur in K2 vorkommende ID** hat.
- Wenn die Eröffnung 24.04.–26.04. **schon vorher** aus `k2-events` verschwunden war (z. B. weil der Speicher einmal komplett mit VK2-Daten überschrieben wurde), kann die Reparatur sie **nicht** zurückholen – dafür brauchst du ein **Backup** (siehe oben).

## Kurzfassung

- **Eventplanung und Öffentlichkeitsarbeit wiederherstellen:** Nur über **Backup-Datei** (Vollbackup herunterladen) oder **backupmicro**.
- **Wo suchen:** Alte K2-Backup-Dateien (z. B. `k2-backup-*.json`), backupmicro-Ordner, ggf. Download-Ordner / Desktop, wenn du früher Vollbackups abgelegt hast.
- **Nach Wiederherstellung:** Events und Dokumente wieder im Admin unter Eventplanung sichtbar; danach keine erneute Vermischung mit VK2 (Reparatur verhindert das).
