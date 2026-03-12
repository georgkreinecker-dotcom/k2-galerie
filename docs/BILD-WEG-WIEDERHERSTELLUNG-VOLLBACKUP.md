# Bild weg – Wiederherstellung aus Vollbackup (von gestern)

**Zweck:** Wenn die Bilder beim Speichern/Laden verschwinden und du **gestern ein Vollbackup** gemacht hast: Optionen verstehen, **ohne** andere zwischenzeitlich gelöste Probleme zurückzuholen.

**Wichtig:**  
- **Nur Backup-Datei wiederherstellen** = nur **Daten** (Werke, Stammdaten) werden ersetzt. Der **Code** bleibt der aktuelle – alle Code-Fixes (BUG-028, BUG-029, preserveStorageImageRefs, …) bleiben erhalten. Du verlierst nur Werke/Daten, die du **nach** dem Backup angelegt hast.  
- **Alten Code wiederherstellen** (z. B. git auf gestern) würde alle anderen Fixes rückgängig machen – **das machen wir nicht.** Wir suchen die Ursache im **aktuellen** Code und beheben nur die eine Stelle.

---

## 1. Wiederherstellung aus dem Vollbackup von gestern

1. **Backup-Datei finden**
   - Auf **backupmicro:** Laufwerk anstecken → Ordner **K2-Galerie-Backups** (oder KL2-Galerie-Backups) → **neuester Versionsordner** (z. B. von gestern) → darin z. B. **`k2-vollbackup.json`** oder **`gallery-data.json`**.
   - Oder: Falls du das Vollbackup **heruntergeladen** hast (Admin → Vollbackup herunterladen), die gespeicherte Datei z. B. in „K2 Backups“ oder im Download-Ordner suchen.

2. **In der App wiederherstellen**
   - **Admin** öffnen (K2) → **Einstellungen** → **Backup & Wiederherstellung**.
   - Auf **„📂 Aus Backup-Datei wiederherstellen“** klicken.
   - Die **Backup-Datei von gestern** auswählen (z. B. `k2-vollbackup.json` vom backupmicro oder deine heruntergeladene Datei).
   - Bestätigen → die App lädt Werke, Stammdaten, Events etc. aus dieser Datei.

3. **Danach**
   - Kurz prüfen: Zeigen die Werke wieder ihre Bilder wie gestern?
   - Wenn ja: Der **Datenstand** ist wieder der von gestern. Das Problem steckt dann im **aktuellen Code** (oder in einer bestimmten Aktion danach). Nächster Schritt: siehe Abschnitt 2.

---

## 2. Kein Rückschritt – Ursache im aktuellen Code finden (Logging)

Statt Daten oder Code zurückzudrehen, ist **eine Log-Zeile** eingebaut: direkt nach dem Speichern eines Werks schreibt die App in die **Browser-Konsole** (F12), wie viele Werke in der Liste **imageRef** bzw. **imageUrl** haben.

**So nutzen:** Wenn bei dir wieder ein Bild verschwindet: Admin öffnen, **F12** (Konsole), dann ein anderes Werk speichern oder bearbeiten. In der Konsole erscheint z. B.:
`📷 Nach Speichern Liste (vor setState): 70 Werke, 68 mit imageRef, 65 mit imageUrl`

- Wenn **„mit imageRef“** kleiner ist als die Gesamtzahl Werke → die Liste kommt schon **ohne** Ref an (Fehler liegt früher: Laden/Resolve/Speicher).
- Wenn **„mit imageRef“** = Gesamtzahl, aber das Bild fehlt trotzdem → Fehler liegt beim **Setzen/Anzeigen** (State oder iframe-Logik).

Damit können wir **genau eine Stelle** fixen – alle anderen Lösungen bleiben unberührt.

- **Analyse-Dokument:**  
  **docs/ANALYSE-ADMIN-BILD-VERSCHWINDET-BEI-SPEICHERN.md** – listet alle Schreib- und State-Pfade.

---

## 3. Kurzfassung

**Vollbackup von gestern** → Backup-Datei finden (backupmicro oder heruntergeladene Datei) → Admin → Einstellungen → **„Aus Backup-Datei wiederherstellen“** → Datei wählen → Stand von gestern wieder da. Danach können wir gezielt Code oder Verhalten untersuchen.
