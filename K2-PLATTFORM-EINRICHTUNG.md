# 🚀 K2 Plattform - Ein für alle Mal eingerichtet

## ✅ Was wurde erstellt:

### 1. **K2 Plattform.app** (auf Desktop)
   - Doppelklick öffnet die Plattform
   - Startet Server automatisch falls nötig
   - Funktioniert immer!

### 2. **LaunchAgent** (optional)
   - Startet Server automatisch beim Mac-Start
   - Datei: `~/Library/LaunchAgents/com.k2galerie.server.plist`
   - **NICHT aktiviert** (falls du es willst, sag Bescheid)

## 🎯 So öffnest du die Plattform:

**Einfach:**
- Doppelklick auf `K2 Plattform.app` auf dem Desktop
- Fertig! ✅

**Alternative:**
- Terminal öffnen
- `~/k2Galerie/scripts/k2-plattform-oeffnen.sh` ausführen

## 🔧 Server-Management:

**Server starten:**
```bash
cd ~/k2Galerie
npm run dev
```

**Server stoppen:**
```bash
pkill -f "vite|npm.*dev"
```

**Prüfen ob Server läuft:**
```bash
lsof -ti:5177 && echo "✅ Läuft" || echo "❌ Läuft nicht"
```

## 💡 Tipps:

- Die `.app` funktioniert auch wenn der Server nicht läuft (startet ihn automatisch)
- Falls macOS fragt: "Rechtsklick → Öffnen" beim ersten Mal
- Server-Logs: `~/k2Galerie/server.log`

## 🆘 Falls es nicht funktioniert:

1. Prüfe ob Node.js installiert ist:
   ```bash
   which node
   ```

2. Prüfe ob Server läuft:
   ```bash
   lsof -ti:5177
   ```

3. Starte Server manuell:
   ```bash
   cd ~/k2Galerie
   npm run dev
   ```

4. Öffne Browser manuell:
   ```
   http://127.0.0.1:5177/
   ```
