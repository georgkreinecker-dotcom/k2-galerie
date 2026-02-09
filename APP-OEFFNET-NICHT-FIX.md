# App öffnet nicht - Fix

## ✅ Neue App erstellt!

Die **K2 Start.app** wurde neu erstellt und sollte jetzt funktionieren.

## 🚀 So funktioniert's:

**Doppelklick auf "K2 Start.app" auf dem Desktop:**

1. **Prüft ob Server läuft** (Ports 5177-5173)
   - Falls ja → Browser öffnet sich sofort

2. **Falls Server nicht läuft:**
   - Terminal öffnet sich automatisch
   - Server startet (`npm run dev`)
   - Nach 5 Sekunden öffnet sich Browser

## 🔧 Falls App immer noch nicht öffnet:

### Methode 1: Rechtsklick → Öffnen

1. **Rechtsklick** auf "K2 Start.app"
2. **"Öffnen"** wählen
3. Falls macOS fragt: **"Öffnen"** bestätigen

### Methode 2: Terminal öffnen

```bash
open ~/Desktop/K2\ Start.app
```

### Methode 3: Manuell starten

Falls die App nicht funktioniert, starte den Server manuell:

```bash
cd ~/k2Galerie
npm run dev
```

Dann Browser öffnen: `localhost:5177`

## 💡 Tipp:

Die App ist eine AppleScript-App und sollte jetzt funktionieren!
