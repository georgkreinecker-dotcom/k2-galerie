# Server neu starten

## 🛑 Server stoppen

**Im Terminal:**

```bash
# Alle Node/Vite Prozesse beenden
pkill -f "vite|npm.*dev"

# Oder spezifisch Port 5177 beenden
lsof -ti:5177 | xargs kill -9
```

**Oder:** `Ctrl + C` im Terminal-Fenster wo der Server läuft

## 🚀 Server neu starten

**Im Terminal:**

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

**Oder mit Script:**

```bash
cd ~/k2Galerie
./START-SERVER.sh
```

## ✅ Prüfen ob Server läuft

```bash
# Prüfe Port 5177
lsof -ti:5177

# Falls etwas zurückkommt → Server läuft!
# Falls nichts → Server läuft nicht
```

## 🔄 Komplett neu starten (Stoppen + Starten)

```bash
# Stoppen
pkill -f "vite|npm.*dev"

# Kurz warten
sleep 2

# Starten
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```
