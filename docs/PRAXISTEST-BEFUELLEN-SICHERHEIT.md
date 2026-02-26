# Praxis-Test: Galerien befüllen & testen – Sicherheit & Backup

**Zweck:** Bevor die Galerie Eferding und die K2-Galerie mit Werken befüllt und der ganze Prozess getestet wird: klare Regeln (keine Datenvermischung, kein Datenverlust, nichts Unreparierbares) und **einmalig ein Vollbackup** als Schnittstelle **„Ab jetzt beginnt der Praxis-Test“**.

**Stand:** 26.02.26

---

## 🔒 Absolute Regeln während des Praxis-Tests

Während wir Galerien befüllen und testen, gilt **ohne Ausnahme**:

1. **Keine Daten durcheinanderbringen**  
   K2 ≠ Eferding ≠ ök2. Kontext/Mandant immer trennen; keine Keys oder Daten zwischen den Galerien mischen.

2. **Keine Daten verlieren**  
   Kein stilles Überschreiben, kein automatisches Löschen, kein Überschreiben mit leeren oder Server-Daten ohne Prüfung. Bestehende Regeln (niemals-kundendaten-loeschen, Datentrennung) bleiben unverändert.

3. **Nichts kaputtmachen, das nicht reparierbar ist**  
   Keine irreversiblen Änderungen ohne Absicherung. Bei Unsicherheit: nachfragen, nicht riskant ändern. Bei Code-Änderungen: bestehende Schutzregeln nicht lockern.

**Für die AI/Assistenten:** Bei jeder Änderung oder jedem Vorschlag in dieser Phase prüfen: Trennung gewahrt? Kein Datenverlust möglich? Reparierbar/Backup vorhanden? Sonst nicht umsetzen.

---

## ✅ Vor dem Praxis-Test: Vollbackup („Jetzt beginnt der Praxis-Test“)

**Einmalig ausführen**, bevor ihr mit dem Befüllen und Testen startet. Danach gilt: **Ab diesem Punkt beginnt der Praxis-Test.** Der folgende Stand ist der Wiederherstellungspunkt.

### 1. App-Vollbackup (Admin)

- Im **Admin** (K2): **Einstellungen** → **Backup & Wiederherstellung** → **„Vollbackup herunterladen“**.
- Datei sicher ablegen (z. B. Ordner „K2 Backups“ oder auf backupmicro).
- Optional (für Hard-Backup-Skript): Datei im Projekt als **`backup/k2-vollbackup-latest.json`** speichern (Ordner `backup/` anlegen falls nötig).

### 2. Git: Stand sichern + Tag „vor Praxis-Test“

- Im **Cursor-Terminal** (oder Mac-Terminal) im Projektordner:
  - Alle Änderungen committen und auf **main** pushen:
    ```bash
    git status
    git add .
    git commit -m "Stand vor Praxis-Test – Vollbackup-Punkt"
    git push
    ```
  - Tag setzen (Wiederherstellungspunkt):
    ```bash
    git tag -a vor-praxistest-2026-02-26 -m "Stand vor Praxis-Test: Befüllen Galerie Eferding + K2"
    git push origin vor-praxistest-2026-02-26
    ```
- **Bedeutung:** Der Commit + Tag **vor-praxistest-2026-02-26** (bzw. das von euch gewählte Datum) ist der Stand „vor Befüllen“. Bei Bedarf: `git checkout vor-praxistest-2026-02-26` (oder den konkreten Commit) wiederherstellen.

### 3. Vercel: Deployment = Snapshot „vor Praxis-Test“

- Nach dem Push baut Vercel automatisch.
- Sobald das Deployment **Ready** ist: Das ist der **Vercel-Snapshot „vor Praxis-Test“**.
- Optional: In Vercel unter **Deployments** diesen Deployment als „Production“ belassen und ggf. notieren (z. B. Screenshot oder Deployment-URL + Datum).

### 4. backupmicro: Hard-Backup (wenn Laufwerk angesteckt)

- **backupmicro** anstecken.
- Im Admin einmal **„Veröffentlichen“** klicken (damit `public/gallery-data.json` aktuell ist).
- Im **Terminal am Mac** (im Projektordner):
  ```bash
  bash scripts/hard-backup-to-backupmicro.sh
  ```
  (Mit eigenem Ordnernamen: `bash scripts/hard-backup-to-backupmicro.sh "K2-Galerie-Backups"`)
- Optional: Vorher „Vollbackup herunterladen“ und als `backup/k2-vollbackup-latest.json` gespeichert haben – dann nimmt das Skript diese Datei mit ins Hard-Backup.

---

## Ab jetzt beginnt der Praxis-Test

- **Nach** Abschluss von 1.–4. (mindestens 1, 2 und 3): Der **Praxis-Test** beginnt.
- Galerie Eferding und K2-Galerie mit Werken befüllen, ganzen Prozess testen – immer unter Einhaltung der drei Regeln oben (keine Vermischung, kein Datenverlust, nichts Unreparierbares).

---

## Wo was steht

| Thema | Datei / Ort |
|--------|-------------|
| Backup & Vollbackup (Handbuch) | **public/k2team-handbuch/13-BACKUP-VOLLBACKUP-K2-GALERIE.md** |
| Hard-Backup Skript | **scripts/hard-backup-to-backupmicro.sh** |
| Vor Veröffentlichung (Checkliste) | **docs/VOR-VEROEFFENTLICHUNG.md** |
| K2/ök2 Datentrennung | **docs/K2-OEK2-DATENTRENNUNG.md**, **.cursor/rules/k2-oek2-trennung.mdc** |
| Niemals Kundendaten löschen | **.cursor/rules/niemals-kundendaten-loeschen.mdc** |

---

*Erstellt: 26.02.26 – Vor dem Befüllen und Testen der Galerien durcharbeiten und Vollbackup ausführen.*
