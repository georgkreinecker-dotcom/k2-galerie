# Zweiter Mac via USB/Thunderbolt verbinden

## ✅ Kein Internet nötig!

Du kannst den zweiten Mac **direkt per USB-C oder Thunderbolt** verbinden - **ohne Internet/WLAN**.

## 🔌 USB-Verbindung einrichten

### Schritt 1: Kabel verbinden
- **USB-C zu USB-C** Kabel zwischen beiden Macs
- Oder **Thunderbolt 3/4** Kabel
- Beide Macs müssen USB-C/Thunderbolt Ports haben

### Schritt 2: Netzwerk-Verbindung aktivieren

**Auf dem Haupt-Mac (wo K2 läuft):**

1. **Systemeinstellungen** → **Netzwerk**
2. Klicke auf **"+"** (Plus-Button unten)
3. Wähle **"USB 10/100 LAN"** oder **"Thunderbolt Bridge"**
4. Klicke **"Erstellen"**

**Auf dem zweiten Mac:**

1. **Systemeinstellungen** → **Netzwerk**
2. Gleiche Schritte wie oben
3. Beide Macs sollten jetzt eine direkte Verbindung haben

### Schritt 3: IP-Adresse finden

**Auf dem Haupt-Mac:**

```bash
# Prüfe USB/Thunderbolt Interface
ifconfig | grep -A 5 "bridge\|usb"
```

Die IP-Adresse sollte etwa so aussehen:
- `169.254.x.x` (Link-Local)
- Oder `192.168.x.x` wenn manuell konfiguriert

### Schritt 4: K2 Server starten

**Auf dem Haupt-Mac:**

```bash
cd ~/k2Galerie
export PATH="/Users/georgkreinecker/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Server im Netzwerk-Modus starten
npm run dev
```

Der Server sollte auf beiden Interfaces laufen:
- `http://localhost:5177/` (lokal)
- `http://[USB-IP]:5177/` (für zweiten Mac)

### Schritt 5: Auf dem zweiten Mac öffnen

**Im Browser des zweiten Macs:**

```
http://[USB-IP-Adresse]:5177/
```

Z.B.:
```
http://169.254.123.45:5177/
```

## 🎯 Vorteile USB-Verbindung

✅ **Kein Internet nötig**
✅ **Schneller** (direkte Verbindung)
✅ **Stabiler** (keine WLAN-Probleme)
✅ **Sicherer** (nicht im Netzwerk sichtbar)

## 🔧 Troubleshooting

**Problem: Keine Verbindung**

1. Prüfe ob Kabel richtig verbunden ist
2. Prüfe Netzwerk-Einstellungen auf beiden Macs
3. Versuche manuelle IP-Konfiguration:
   - Haupt-Mac: `192.168.1.1`
   - Zweiter Mac: `192.168.1.2`
   - Subnetz: `255.255.255.0`

**Problem: Server nicht erreichbar**

1. Prüfe Firewall-Einstellungen
2. Stelle sicher dass Server auf `0.0.0.0` läuft (nicht nur `127.0.0.1`)
3. Prüfe `vite.config.ts` - `host` sollte `'0.0.0.0'` sein

## 📋 Alternative: Thunderbolt Bridge

Falls USB nicht funktioniert, versuche **Thunderbolt Bridge**:

1. **Systemeinstellungen** → **Netzwerk**
2. **"+"** → **"Thunderbolt Bridge"**
3. Gleiche Schritte wie oben

## 💡 Tipp

Für einfachere Nutzung kannst du auch ein **Script** erstellen, das automatisch die USB-IP findet:

```bash
#!/bin/bash
USB_IP=$(ifconfig | grep -A 5 "bridge\|usb" | grep "inet " | awk '{print $2}' | head -1)
echo "🌐 USB-IP: $USB_IP"
echo "🔗 URL für zweiten Mac: http://$USB_IP:5177/"
```
