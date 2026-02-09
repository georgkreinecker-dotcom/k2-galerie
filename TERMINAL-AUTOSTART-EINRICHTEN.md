# 🚀 Terminal automatisch beim Neustart starten

## ✅ Was wurde eingerichtet:

**LaunchAgent erstellt:**
- Öffnet Terminal automatisch beim Mac-Start
- Startet K2 Server automatisch im Terminal
- Datei: `~/Library/LaunchAgents/com.k2galerie.terminal-server.plist`

---

## 🎯 So funktioniert es:

1. **Mac starten**
2. **Terminal öffnet sich automatisch**
3. **Server startet automatisch** im Terminal
4. **FERTIG!** ✅

---

## 🔧 LaunchAgent aktivieren:

**Falls nicht automatisch aktiviert:**

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.k2galerie.terminal-server.plist
```

**Oder mit alter Methode:**

```bash
launchctl load ~/Library/LaunchAgents/com.k2galerie.terminal-server.plist
```

---

## 🛑 LaunchAgent deaktivieren:

```bash
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.k2galerie.terminal-server.plist
```

**Oder:**

```bash
launchctl unload ~/Library/LaunchAgents/com.k2galerie.terminal-server.plist
```

---

## ✅ Prüfen ob aktiv:

```bash
launchctl list | grep k2galerie
```

---

## 💡 Vorteile:

- ✅ Terminal hat die richtigen Berechtigungen
- ✅ Server startet automatisch beim Neustart
- ✅ Kein manuelles Eingreifen nötig
- ✅ Terminal kann minimiert werden (Server läuft weiter)

---

## 🎯 Das war's!

Ab jetzt startet Terminal + Server automatisch beim Mac-Start! 💚
