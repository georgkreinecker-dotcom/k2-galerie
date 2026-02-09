# 🔧 Zweiter Mac - Verbindungsproblem lösen

## 🔍 Problem: Verbindung funktioniert nicht

### Mögliche Ursachen:

1. **Firewall blockiert Port 5177**
2. **USB-Netzwerk nicht richtig konfiguriert**
3. **Server läuft nicht auf allen Interfaces**

---

## ✅ Lösung 1: Firewall prüfen

**Auf dem HAUPT-MAC:**

1. **Systemeinstellungen** → **Sicherheit** → **Firewall**
2. Prüfe ob Firewall aktiviert ist
3. Falls ja: **Firewall-Optionen** → Port 5177 erlauben
4. Oder: Firewall temporär deaktivieren zum Testen

---

## ✅ Lösung 2: USB-Netzwerk prüfen

**Auf BEIDEN Macs:**

1. **Systemeinstellungen** → **Netzwerk**
2. Prüfe ob **"USB 10/100 LAN"** oder **"Thunderbolt Bridge"** vorhanden ist
3. Falls nicht: **"+"** → **"USB 10/100 LAN"** oder **"Thunderbolt Bridge"** hinzufügen
4. Beide Macs sollten jetzt verbunden sein

---

## ✅ Lösung 3: Server neu starten

**Auf dem HAUPT-MAC:**

1. Server stoppen: `Ctrl + C`
2. Server neu starten:
   ```bash
   cd ~/k2Galerie
   export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
   npm run dev
   ```
3. Prüfe ob alle Network-URLs angezeigt werden

---

## ✅ Lösung 4: WLAN verwenden (Alternative)

Falls USB nicht funktioniert:

**Auf dem zweiten Mac:**
- Verwende: `http://192.168.0.31:5177/` oder `http://192.168.0.27:5177/`
- Beide Macs müssen im selben WLAN sein

---

## 🔍 Debugging:

**Auf dem HAUPT-MAC prüfen:**

```bash
# Prüfe ob Server läuft
lsof -ti:5177

# Prüfe USB-Interface
ifconfig | grep -A 5 "169.254"

# Teste Verbindung
curl http://169.254.225.197:5177
```

---

## 💡 Tipp:

Falls nichts funktioniert:
- Verwende WLAN statt USB
- Beide Macs im selben Netzwerk
- URL: `http://192.168.0.31:5177/`
