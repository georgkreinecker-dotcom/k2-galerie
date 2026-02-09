# Zugriffsrechte-Fix für Desktop-Button

## 🔧 Problem: "Zugriffsrechte fehlen"

Das ist ein macOS/iCloud-Berechtigungsproblem.

## ✅ Lösung: Script manuell kopieren

### Schritt 1: Script finden

**Im Projektordner:** `~/k2Galerie/scripts/k2-start-fuer-desktop.sh`

### Schritt 2: Auf Desktop kopieren

**Im Terminal:**

```bash
cp ~/k2Galerie/scripts/k2-start-fuer-desktop.sh ~/Desktop/K2-Start.command
chmod +x ~/Desktop/K2-Start.command
```

### Schritt 3: Verwenden

**Doppelklick** auf `K2-Start.command` auf dem Desktop

## 🔄 Alternative: Im Terminal ausführen

**Falls Doppelklick nicht funktioniert:**

```bash
cd ~/Desktop
./K2-Start.command
```

## 💡 Noch einfacher: Script direkt verwenden

**Im Terminal:**

```bash
cd ~/k2Galerie
./scripts/k2-start-fuer-desktop.sh
```

Das funktioniert garantiert!

## 📌 Tipp:

Du kannst das Script auch **ins Dock ziehen** für schnellen Zugriff!
