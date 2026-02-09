# K2 Start App Fix

## 🔧 Problem: App baut keine Verbindung auf

Die K2 Start.app verwendet möglicherweise eine alte URL oder der Server läuft nicht.

## ✅ Lösung:

### 1. Server manuell starten

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

### 2. Browser direkt öffnen

Während der Server läuft:
- `http://localhost:5177/` oder
- `http://127.0.0.1:5177/`

### 3. K2 Start.app testen

Nachdem der Server läuft, sollte K2 Start.app funktionieren.

## 🔍 Prüfe ob Server läuft:

```bash
lsof -ti:5177
```

Falls etwas zurückkommt → Server läuft!
