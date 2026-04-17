# Hard-Backup auf backupmicro – vollständiger Wiederherstellungs-Stand

## Ziel

Nach **Datenverlust** soll ein **einzelner Versionsordner** auf backupmicro reichen: darin liegen **`gallery-data.json`** (veröffentlichter Vercel-Stand) und – wenn du den Schritt unten machst – **`k2-vollbackup.json`** (kompletter K2-App-Stand aus dem Browser-Speicher).

## Was das Skript immer mitkopiert

- `public/gallery-data.json` → im Versionsordner als `gallery-data.json`
- `MANIFEST.txt` (Version, Datum)

## Vollständiger K2-Stand im gleichen Ordner (empfohlen)

1. Im **Browser** (nicht Cursor): **Admin → Einstellungen → Backup & Wiederherstellung → Vollbackup herunterladen (K2)**.
2. Die heruntergeladene JSON-Datei **hier im Projekt** speichern als **`backup/k2-vollbackup-latest.json`** (Ordner `backup/` anlegen, falls er fehlt; der Dateiname muss exakt so heißen).
3. **Im Cursor-Terminal** (Projektordner):  
   `npm run backup:hard`  
   (entspricht `bash scripts/hard-backup-to-backupmicro.sh`)

Das Skript legt einen neuen Ordner `v00x--Datum--Uhrzeit` auf backupmicro an und kopiert **`k2-vollbackup.json`** mit hinein, sobald `k2-vollbackup-latest.json` existiert.

## Wiederherstellung

- **Alles aus einem Ordner:** Admin → Einstellungen → **Aus Backup-Datei wiederherstellen** → **`k2-vollbackup.json`** aus dem gewünschten Versionsordner wählen (voller K2-Stand).
- Nur **öffentlicher Galerie-Stand:** dieselbe Funktion mit **`gallery-data.json`** aus dem Versionsordner (ohne lokalen Speicher-Rest).

## Kurz

| Schritt | Wer |
|--------|-----|
| Vollbackup-JSON erzeugen | Browser / Admin (einmal pro Sicherung) |
| Datei als `backup/k2-vollbackup-latest.json` | Du (Speichern unter festem Namen) |
| Alles auf backupmicro packen | `npm run backup:hard` |

Ohne Schritt „Vollbackup-Datei ins Projekt“ ist im Versionsordner **nur** `gallery-data.json` – das reicht nicht für den **kompletten** App-Stand bei totalem Datenverlust auf dem Mac.
