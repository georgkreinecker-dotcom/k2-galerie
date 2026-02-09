# 🚀 K2 automatisch beim Mac-Start öffnen

## ✅ Was wurde eingerichtet:

**LaunchAgent erstellt:**
- Startet Server automatisch beim Mac-Start
- Öffnet Browser automatisch mit K2
- Datei: `~/Library/LaunchAgents/com.k2galerie.server.plist`

---

## 🎯 So funktioniert es:

1. **Mac starten**
2. **Warten 15-20 Sekunden** (Server startet)
3. **Browser öffnet sich automatisch** mit K2 Plattform
4. **FERTIG!** ✅

---

## 🔧 Falls es nicht funktioniert:

### LaunchAgent manuell aktivieren:

**Terminal öffnen:**

```bash
launchctl load ~/Library/LaunchAgents/com.k2galerie.server.plist
```

### LaunchAgent deaktivieren:

```bash
launchctl unload ~/Library/LaunchAgents/com.k2galerie.server.plist
```

---

## 💡 Tipp:

Falls Browser nicht automatisch öffnet:
- Warte ein paar Sekunden länger
- Oder öffne manuell: `http://127.0.0.1:5177/`

---

## ✅ Das war's!

Ab jetzt öffnet sich K2 automatisch beim Mac-Start! 🎉
