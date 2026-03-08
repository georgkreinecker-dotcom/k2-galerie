# Vollbackup – prominent abgelegt, Zugriff bei Notfall

**Zweck:** Das Vollbackup der K2 Galerie ist so **prominent** abgelegt und dokumentiert, dass bei Abwesenheit oder Notfall ein **Zugriff möglich** ist (Vertrauensperson, Familie, Nachfolge).

**Stand:** 08.03.26

---

## Wo liegt das Vollbackup?

| Was | Wo |
|-----|-----|
| **Hauptablage (prominent)** | **Externer Speicher backupmicro** (physisch: z. B. Georgs Schreibtisch – genauer Ort von Georg/Team festhalten). |
| **Ordner auf backupmicro** | `K2-Galerie-Backups` oder `KL2-Galerie-Backups` (je nach Einrichtung). |
| **Versionsordner** | Jeder Lauf erzeugt einen Unterordner mit Versionsnummer und Datum, z. B. `v001--2026-02-15--18-20`, `v002--2026-03-08--…`. **Neueste Version** = Ordner mit höchster Nummer bzw. neuestem Datum. |
| **Dateien im Versionsordner** | `gallery-data.json` (Galerie-Daten), `MANIFEST.txt` (Version, Datum, Übersicht), optional `k2-vollbackup.json` (App-Vollbackup inkl. allem aus dem Admin). |

**Programmcode** (falls benötigt): Auf **GitHub** (Repository k2Galerie) und optional gespiegelt auf backupmicro über `scripts/backup-code-to-backupmicro.sh` (Ordner z. B. `K2-Galerie-Code-Backups`).

---

## Zugriff bei Notfall („sollte etwas mit mir sein“)

Damit eine Vertrauensperson (Familie, Partnerin, Nachfolge) Zugriff hat:

1. **Ort von backupmicro festhalten**  
   Wo liegt das Laufwerk „backupmicro“ physisch? (z. B. in einer Schublade, bei Person X, …) – **von Georg/Team einmal ausfüllen und aktuell halten.**

2. **Dieses Dokument zugänglich machen**  
   **docs/BACKUP-ZUGANG-NOTFALL.md** (diese Datei) und **Handbuch-Kapitel 13** (Backup & Vollbackup) sind die Stellen, an denen steht: wo das Backup liegt, wie es angelegt wird, wie man wiederherstellt.  
   **Empfehlung:** Eine **ausgedruckte Kurzfassung** (diese Seite oder Handbuch 13) an einem festen Ort hinterlegen (z. B. mit anderen wichtigen Unterlagen), damit im Notfall jemand weiß: „Vollbackup K2 Galerie liegt auf backupmicro, Ordner K2-Galerie-Backups, neueste Version = neuester Unterordner.“

3. **Wiederherstellung**  
   - **backupmicro** an einen Mac mit Projektordner (oder Zugang zu GitHub) anschließen.  
   - Neuesten Versionsordner öffnen.  
   - `gallery-data.json` oder `k2-vollbackup.json` verwenden: In der K2 Galerie App (Admin) → Einstellungen → **„Aus Backup-Datei wiederherstellen“** und diese Datei wählen.  
   - Ausführlich: **k2team-handbuch/13-BACKUP-VOLLBACKUP-K2-GALERIE.md** (Abschnitt „Wiederherstellung“).

---

## Regelmäßige Sicherung (damit das Backup aktuell bleibt)

- **Vollbackup aus der App:** Admin → Einstellungen → Backup & Wiederherstellung → **„Vollbackup herunterladen“** → Datei sicher aufbewahren (z. B. auf backupmicro oder in `backup/k2-vollbackup-latest.json` im Projekt).
- **Hard-Backup auf backupmicro (mit Versionsnummer):**  
  backupmicro anstecken → im Terminal am Mac (im Projektordner):  
  `bash scripts/hard-backup-to-backupmicro.sh`  
  → erzeugt neuen Versionsordner (v00x--Datum--Uhrzeit) **nur auf backupmicro**.  
- **Spiegelung auf backupmicro** ist verbindlich: Alle relevanten Backups (Vollbackup, gallery-data, ggf. Code) sollen auf backupmicro landen, damit ein einziger, prominenter Ort existiert.

---

## Verweise

| Thema | Wo |
|-------|-----|
| Backup & Vollbackup (Handbuch, druckbar) | **k2team-handbuch/13-BACKUP-VOLLBACKUP-K2-GALERIE.md** |
| Praxis-Test / Vor Befüllen (Vollbackup-Punkt) | docs/PRAXISTEST-BEFUELLEN-SICHERHEIT.md |
| Wartung (monatlich Backup prüfen) | docs/WARTUNG-PROJEKT.md § 2 |
| Hard-Backup-Skript | scripts/hard-backup-to-backupmicro.sh |

---

**Kurz:** Vollbackup = **backupmicro**, Ordner **K2-Galerie-Backups** (bzw. KL2-Galerie-Backups), neueste Version = neuester Unterordner. Dieses Dokument und Handbuch 13 halten das fest; mit gedruckter Kurzfassung an festem Ort ist der Zugriff bei Notfall möglich.
