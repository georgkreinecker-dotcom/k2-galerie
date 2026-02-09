# 🔧 App reagiert nicht - Fix

## ❌ Problem:

App reagiert nicht beim Doppelklick.

## ✅ Lösung:

**Option 1: Script direkt verwenden (funktioniert immer)**

```bash
cd ~/k2Galerie
./scripts/k2-plattform-einfach.sh
```

**Option 2: Terminal manuell**

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

Dann Browser öffnen: `http://127.0.0.1:5177/`

---

## 💡 Warum App nicht reagiert:

- macOS Berechtigungen blockieren die App
- AppleScript hat Syntax-Fehler
- App kann nicht richtig starten

**Lösung:** Script direkt verwenden statt App!

---

## ✅ Empfehlung:

**Verwende das Script:**
```bash
cd ~/k2Galerie
./scripts/k2-plattform-einfach.sh
```

**Das funktioniert garantiert!** 💚
