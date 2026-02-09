# 🚀 K2 Plattform öffnen - EINFACHSTE LÖSUNG

## ✅ So funktioniert es garantiert:

### Schritt 1: Terminal öffnen
- Drücke `Cmd + Leertaste`
- Tippe: `Terminal`
- Drücke Enter

### Schritt 2: Server starten
Kopiere diesen Befehl und füge ihn im Terminal ein:

```bash
cd ~/k2Galerie && export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH" && npm run dev
```

Drücke Enter.

### Schritt 3: Browser öffnen
- Warte 5-10 Sekunden
- Öffne Safari/Chrome/Firefox
- Gehe zu: `http://127.0.0.1:5177/`

**FERTIG!** ✅

---

## 💡 Tipp: Terminal offen lassen

Das Terminal-Fenster muss offen bleiben, damit der Server läuft.

Wenn du das Terminal schließt, stoppt der Server.

---

## 🔄 Server stoppen

Im Terminal: `Ctrl + C`

---

## 🆘 Falls es nicht funktioniert:

1. **Prüfe ob Node.js installiert ist:**
   ```bash
   ~/.local/node-v20.19.0-darwin-x64/bin/node --version
   ```

2. **Prüfe ob Port 5177 frei ist:**
   ```bash
   lsof -ti:5177
   ```
   Falls etwas zurückkommt: Port ist belegt

3. **Starte Server auf anderem Port:**
   ```bash
   cd ~/k2Galerie
   export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
   PORT=5178 npm run dev
   ```
   Dann öffne: `http://127.0.0.1:5178/`
