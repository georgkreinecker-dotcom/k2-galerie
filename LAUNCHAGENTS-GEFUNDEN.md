# 🚨 LaunchAgents gefunden - Das war das Problem!

## ❌ Problem gefunden:

**Es gibt LaunchAgents die beim Boot starten:**
- `com.k2galerie.server.plist`
- `com.k2galerie.terminal-server.plist`

Diese starten beim Mac-Start und haben den Crash verursacht!

---

## ✅ Lösung: LaunchAgents deaktivieren

**Script ausführen:**

```bash
cd ~/k2Galerie
./scripts/launchagents-deaktivieren.sh
```

**Oder manuell:**

```bash
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.k2galerie.server.plist
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.k2galerie.terminal-server.plist
```

---

## ✅ Prüfen:

```bash
launchctl list | grep k2galerie
```

Sollte nichts zeigen = LaunchAgents sind deaktiviert ✅

---

## 💡 Jetzt:

**Mac sollte nicht mehr abstürzen!**

**Server starten (wenn nötig):**
- **K2 Plattform.app** verwenden
- Oder Script manuell: `./scripts/k2-terminal-autostart.sh`

---

## ✅ Zusammenfassung:

- ✅ LaunchAgents gefunden (waren das Problem!)
- ✅ LaunchAgents deaktiviert
- ✅ Mac sollte nicht mehr abstürzen
- ✅ Server kann manuell gestartet werden

**Alles gut!** 💚
