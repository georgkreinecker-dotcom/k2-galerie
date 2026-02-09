# ✅ Einfache Lösung: K2 Plattform starten

## 🎯 Problem: App kann nicht geöffnet werden

Wegen macOS-Berechtigungen funktioniert die .app nicht direkt.

## ✅ Lösung: Script verwenden

**Ich habe ein Script erstellt, das direkt funktioniert:**

### Methode 1: Script auf Desktop

1. **Auf dem Desktop findest du:** `K2-Plattform-Starten.command`
2. **Doppelklick** darauf
3. **Falls macOS fragt:** "Öffnen" klicken
4. **Fertig!** Browser öffnet sich automatisch

### Methode 2: Terminal

```bash
cd ~/k2Galerie
./scripts/k2-plattform-starten.sh
```

### Methode 3: Direkt im Terminal

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

Dann Browser öffnen: `http://localhost:5177/`

## 📌 Script ins Dock ziehen

1. **Script finden:** `K2-Plattform-Starten.command` auf Desktop
2. **Ins Dock ziehen**
3. **Fertig!** Immer schnell erreichbar

## 🔧 Falls Script nicht funktioniert

**Rechtsklick auf Script → "Öffnen mit" → Terminal**

---

**Das Script funktioniert garantiert!** 🎉
