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

### 2. Automatisches Vollbackup (ein Slot)

- Bei jedem 5-Sekunden-Lauf wird zusätzlich ein **Vollbackup** in den localStorage geschrieben (Schlüssel `k2-full-backup`).
- Es gibt **einen** Backup-Slot: der jeweils letzte Stand überschreibt den vorherigen.
- Enthält: Stammdaten, Werke, Events, Dokumente, Seitentexte, Design.

**Wofür:** Wenn etwas schiefgeht (z. B. falscher Klick, kaputte Daten), kannst du im Admin auf **„Aus letztem Backup wiederherstellen“** klicken. Die Seite lädt neu und alle Daten kommen aus diesem Backup.

**Wenn Einstellungen, Eventplanung oder Stammdaten (E-Mail, Telefon) „weg“ sind:**
1. **Zuerst:** Im Admin oben auf **„Einstellungen“** klicken. Direkt darunter: Kasten **„💾 Backup & Wiederherstellung“** → **„Aus letztem Backup wiederherstellen“** klicken. Das Vollbackup enthält **Stammdaten (Martina, Georg, Galerie inkl. E-Mail/Telefon)**, Werke, Events, Dokumente. Nach der Wiederherstellung werden leere Kontaktfelder automatisch aus der Repo-Konfiguration (`K2_STAMMDATEN_DEFAULTS`) gefüllt.
2. **Falls kein Backup im Browser:** Vollbackup-Datei von backupmicro (oder Ordner „K2 Backups“) verwenden und im Admin „Aus Datei wiederherstellen“ (falls angeboten) nutzen.
3. Zusätzlich sind die K2-Kontaktdaten im Repo hinterlegt (`src/config/tenantConfig.ts` → `K2_STAMMDATEN_DEFAULTS`). Beim Laden und Speichern werden leere Felder nie überschrieben; es wird immer aus diesem Standard aufgefüllt, wenn etwas fehlt.

---

### 3. Manuelles Vollbackup (Datei)

- Button **„Vollbackup herunterladen“** im Admin legt eine JSON-Datei auf deinem Rechner ab.
- Enthält dieselben Daten wie das Auto-Backup.
- **Empfehlung:** Regelmäßig ausführen und die Datei sicher aufbewahren (z. B. Ordner „K2 Backups“). Dann hast du ein Backup außerhalb des Browsers.

### 4. Spiegelung auf backupmicro

- **backupmicro** = externer Speicher (liegt auf Georgs Schreibtisch).
- Alle Backups (z. B. Projektordner, Vollbackup-Dateien, gallery-data.json) sollen als **Spiegelung** auch auf backupmicro gesichert werden.

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

Du kannst dich darauf verlassen, dass **alle Änderungen lokal abgespeichert** werden und ein **automatisches Backup-System** (5-Sekunden-Intervall + Vollbackup-Slot + Sofort-Save beim Verlassen) aktiv ist.
