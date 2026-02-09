# ✅ Einfache Lösung: Script statt App

## ❌ Problem:

App reagiert nicht - macOS blockiert sie.

## ✅ Lösung: Script verwenden

**Das funktioniert garantiert:**

```bash
cd ~/k2Galerie
./scripts/k2-plattform-einfach.sh
```

**Was passiert:**
- ✅ Terminal öffnet sich
- ✅ Server startet automatisch
- ✅ Browser öffnet sich nach 8 Sekunden

---

## 💡 Script ins Dock ziehen:

1. **Finder öffnen**
2. **Navigiere zu:** `~/k2Galerie/scripts/`
3. **Finde:** `k2-plattform-einfach.sh`
4. **Ziehe ins Dock**

**Dann:** Einmal klicken = Server startet! ✅

---

## 🚀 Alternative: Terminal manuell

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

Dann Browser: `http://127.0.0.1:5177/`

---

## ✅ Zusammenfassung:

- ❌ App funktioniert nicht (macOS blockiert)
- ✅ Script funktioniert immer!
- ✅ Einfach Script verwenden statt App

**Script ist die beste Lösung!** 💚
