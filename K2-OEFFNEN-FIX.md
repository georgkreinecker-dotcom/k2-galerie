# K2 öffnen - Fix

## 🔧 Problem: K2 kann nicht geöffnet werden

Der Server startet, aber ist nicht erreichbar wegen macOS-Berechtigungen.

## ✅ Lösung: Server manuell starten

**Im Terminal:**

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

**Warte bis du siehst:**
```
  ➜  Local:   http://localhost:5177/
```

**Dann:**

1. **Browser öffnen:** `http://localhost:5177/`
2. **Oder:** K2 Start.app öffnen
3. **Oder:** Script verwenden: `./scripts/k2-oeffnen.sh`

## 🚀 Schnell-Script

```bash
cd ~/k2Galerie
./scripts/k2-oeffnen.sh
```

Das Script:
- Prüft ob Server läuft
- Startet Server falls nötig
- Öffnet Browser automatisch

## ⚠️ Wichtig

Der Server **muss** im Terminal gestartet werden (nicht im Hintergrund), damit macOS die Berechtigungen gibt.
