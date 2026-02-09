# 🚀 K2 einfach starten - Automatisch!

## ✅ Lösung: Doppelklick auf "K2 Plattform.app"

**Das ist alles!** Die App startet den Server automatisch über Terminal.app, damit macOS die Berechtigung gibt.

---

## 🎯 So funktioniert es:

1. **Doppelklick** auf `K2 Plattform.app` (auf Desktop oder im Finder)
2. **Terminal öffnet sich** automatisch (Server startet)
3. **Browser öffnet sich** automatisch mit K2
4. **FERTIG!** ✅

---

## 🔧 Alternative: Script verwenden

Falls die App nicht funktioniert:

```bash
cd ~/k2Galerie
./scripts/k2-start-mit-terminal.sh
```

---

## 💡 Warum funktioniert das?

- macOS blockiert Netzwerk-Zugriff wenn Apps im Hintergrund laufen
- Terminal.app hat die richtigen Berechtigungen
- Server läuft dann normal weiter

---

## 🛑 Server stoppen

**Im Terminal-Fenster:**
- `Ctrl + C` drücken

**Oder:**
```bash
pkill -f "vite|npm.*dev"
```

---

## ✅ Das war's!

Ab jetzt einfach **K2 Plattform.app** öffnen - alles automatisch! 💚
