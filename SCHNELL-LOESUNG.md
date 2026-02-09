# ✅ Schnelle Lösung: Server starten

## 🎯 Problem: Keine Verbindung zum Server

**K2 Start.app** kann sich nicht verbinden, weil der Server nicht läuft.

## ✅ Lösung in 3 Schritten:

### 1. Terminal öffnen

`Cmd + Leertaste` → "Terminal" → Enter

### 2. Server starten

Kopiere und füge ein:

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

### 3. Warten bis Server läuft

Du siehst dann:
```
  ➜  Local:   http://localhost:5177/
```

### 4. Browser öffnen

- **Manuell:** `http://localhost:5177/` im Browser eingeben
- **Oder:** K2 Start.app öffnen (sollte jetzt funktionieren)

## 🔧 Falls es nicht funktioniert:

**Prüfe ob Server läuft:**
```bash
lsof -ti:5177
```

Falls nichts kommt → Server läuft nicht, starte nochmal.

---

**Die K2 Start.app wurde aktualisiert** und prüft jetzt Port 5177 zuerst! ✅
