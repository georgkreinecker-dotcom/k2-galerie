# 🔍 Problem-Erklärung: Warum der Server nicht automatisch startet

## ✅ Was wir haben:

**Interner Development-Server:**
- Läuft lokal auf deinem Mac
- Port: 5177
- Technologie: Vite (React Development Server)
- Zweck: Entwickelt die K2 Galerie App

## ❌ Das Problem:

**macOS blockiert automatisches Starten:**

Wenn wir versuchen, den Server **automatisch im Hintergrund** zu starten (über Cursor, Scripts, Apps), gibt macOS diesen Fehler:

```
Error: listen EPERM: operation not permitted
```

**Warum?**
- macOS hat seit Version 10.15 (Catalina) **strikte Sicherheitsregeln**
- Apps die im Hintergrund laufen haben **keine Netzwerk-Berechtigung**
- Nur **Terminal.app** hat die richtigen Berechtigungen für Netzwerk-Zugriff

## ✅ Was funktioniert:

**Im Terminal starten:**
```bash
cd ~/k2Galerie
npm run dev
```

**Warum funktioniert das?**
- Terminal.app hat **vollständige Netzwerk-Berechtigungen**
- macOS vertraut Terminal mehr als anderen Apps
- Der Server läuft dann normal weiter

## 🔧 Mögliche Lösungen:

### 1. **LaunchAgent** (macOS Service)
- Startet automatisch beim Mac-Start
- Hat mehr Berechtigungen als normale Apps
- **Problem:** Funktioniert bei dir nicht richtig

### 2. **Terminal.app verwenden** (aktuelle Lösung)
- Script öffnet Terminal automatisch
- Server startet dort
- **Nachteil:** Terminal-Fenster muss offen bleiben

### 3. **macOS Berechtigungen ändern**
- Systemeinstellungen → Sicherheit
- Terminal.app explizit erlauben
- **Problem:** Funktioniert nicht immer

## 💡 Fazit:

**Ja, du liegst richtig:**
- Wir haben einen internen Server
- Wir können ihn nicht automatisch im Hintergrund starten
- Grund: macOS Sicherheitsregeln blockieren Netzwerk-Zugriff für Hintergrund-Apps
- Lösung: Server über Terminal.app starten (hat die richtigen Berechtigungen)

## 🎯 Aktuelle Lösung:

**K2 Plattform.app** startet den Server automatisch über Terminal.app - das umgeht das Berechtigungsproblem!
