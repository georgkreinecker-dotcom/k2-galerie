# 📸 Screenshots einfügen - Anleitung

## 🎯 Screenshots hier im Chat einfügen

**Einfachste Methode:**

1. **Screenshot machen:**
   - `Cmd + Shift + 3` = Gesamter Bildschirm
   - `Cmd + Shift + 4` = Auswahl (empfohlen)
   - `Cmd + Shift + 4 + Leertaste` = Fenster

2. **Screenshot einfügen:**
   - Screenshot wird automatisch auf Desktop gespeichert
   - **Hier im Chat:** `Cmd + V` drücken
   - Oder: Screenshot-Datei hierher ziehen

## 🤖 Automatische Screenshot-Funktion

**Setup einmalig ausführen:**

```bash
cd ~/k2Galerie
./scripts/screenshot-setup.sh
```

**Dann Screenshot machen:**

```bash
./scripts/k2-screenshot.sh
```

- Öffnet Auswahl-Tool
- Speichert in `~/k2Galerie/screenshots/`
- Kopiert Pfad in Zwischenablage

## 📁 Screenshot-Ordner

- **Projekt:** `~/k2Galerie/screenshots/`
- **Desktop:** `~/Desktop/K2-Screenshots/` (Symlink)

## 💡 Tipps

- Screenshots werden automatisch mit Zeitstempel benannt
- Du kannst Screenshots direkt hier einfügen (Cmd+V)
- Oder Dateien hierher ziehen
