# 🔍 IP-Adresse des zweiten Macs finden

## ✅ So findest du die IP-Adresse:

### Methode 1: Über Systemeinstellungen (EINFACHSTE)

**Auf dem ZWEITEN MAC:**

1. **Systemeinstellungen** → **Netzwerk**
2. Wähle deine aktive Verbindung:
   - **Wi‑Fi** (falls WLAN)
   - **Ethernet** (falls Kabel)
   - **USB 10/100 LAN** (falls USB)
3. Die IP-Adresse steht rechts daneben
   - Z.B.: `192.168.0.100`
   - Oder: `192.168.1.50`

---

### Methode 2: Über Terminal

**Auf dem ZWEITEN MAC:**

Terminal öffnen und eingeben:

```bash
ifconfig | grep "inet " | grep -v "127.0.0.1"
```

Oder:

```bash
ipconfig getifaddr en0
```

(Zeigt WLAN-IP)

Oder:

```bash
ipconfig getifaddr en1
```

(Zeigt Ethernet-IP)

---

### Methode 3: Über Systemeinstellungen → Freigaben

**Auf dem ZWEITEN MAC:**

1. **Systemeinstellungen** → **Freigaben**
2. **"Bildschirmfreigabe"** aktivieren
3. Die IP-Adresse wird angezeigt:
   - Z.B.: `vnc://192.168.0.100`
   - Oder: `192.168.0.100`

---

## 💡 Tipp:

Die IP-Adresse sieht meist so aus:
- `192.168.x.x` (WLAN/Ethernet)
- `169.254.x.x` (USB/Link-Local)
- `10.x.x.x` (Manche Netzwerke)

---

## 🎯 Einfachste Methode:

**Systemeinstellungen → Netzwerk** → IP-Adresse steht direkt da! ✅
