# 🖥️ Zweiter Mac einrichten - Schritt für Schritt

## ✅ Was wurde vorbereitet:

1. **Server konfiguriert** → Läuft jetzt auf `0.0.0.0` (Netzwerk-Zugriff)
2. **Setup-Script erstellt** → `scripts/zweiter-mac-setup.sh`

---

## 🔌 Option 1: USB-C / Thunderbolt Verbindung (OHNE Internet)

### Schritt 1: Kabel verbinden
- **USB-C zu USB-C** Kabel zwischen beiden Macs
- Oder **Thunderbolt 3/4** Kabel

### Schritt 2: Netzwerk aktivieren

**Auf dem HAUPT-MAC (dieser Mac):**
1. **Systemeinstellungen** → **Netzwerk**
2. Klicke auf **"+"** (Plus-Button unten)
3. Wähle **"USB 10/100 LAN"** oder **"Thunderbolt Bridge"**
4. Klicke **"Erstellen"**

**Auf dem ZWEITEN MAC:**
1. Gleiche Schritte wie oben
2. Beide Macs sollten jetzt verbunden sein

### Schritt 3: IP-Adresse finden

**Auf dem HAUPT-MAC:**
```bash
cd ~/k2Galerie
bash scripts/zweiter-mac-setup.sh
```

Das Script zeigt dir die IP-Adresse!

### Schritt 4: Server starten

**Auf dem HAUPT-MAC:**
```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

**Wichtig:** Terminal muss offen bleiben!

### Schritt 5: Auf dem zweiten Mac öffnen

**Im Browser des zweiten Macs:**
```
http://[IP-ADRESSE]:5177/
```

Z.B.: `http://169.254.123.45:5177/`

---

## 📡 Option 2: WLAN Verbindung (MIT Internet)

### Schritt 1: Beide Macs im selben WLAN

### Schritt 2: IP-Adresse finden

**Auf dem HAUPT-MAC:**
```bash
ifconfig | grep "inet " | grep -v "127.0.0.1"
```

Oder:
```bash
ipconfig getifaddr en0
```

### Schritt 3: Server starten

**Auf dem HAUPT-MAC:**
```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

### Schritt 4: Auf dem zweiten Mac öffnen

**Im Browser:**
```
http://[WLAN-IP]:5177/
```

Z.B.: `http://192.168.1.100:5177/`

---

## 🎯 Schnell-Check

**Prüfe ob alles funktioniert:**

```bash
cd ~/k2Galerie
bash scripts/zweiter-mac-setup.sh
```

Das Script zeigt dir:
- ✅ Aktuelle IP-Adressen
- ✅ USB/Thunderbolt Status
- ✅ Server-Status
- ✅ URL für zweiten Mac

---

## 🔧 Troubleshooting

**Problem: Zweiter Mac kann nicht verbinden**

1. **Prüfe Firewall:**
   - Systemeinstellungen → Sicherheit → Firewall
   - Stelle sicher dass Port 5177 erlaubt ist

2. **Prüfe Server-Status:**
   ```bash
   lsof -ti:5177
   ```
   Falls nichts zurückkommt → Server läuft nicht

3. **Prüfe IP-Adresse:**
   ```bash
   ifconfig | grep "inet "
   ```

4. **Manuelle IP-Konfiguration (USB):**
   - Haupt-Mac: `192.168.1.1`
   - Zweiter Mac: `192.168.1.2`
   - Subnetz: `255.255.255.0`

**Problem: Server läuft nicht**

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
```

---

## 💡 Tipps

- **USB-Verbindung:** Schneller, stabiler, kein Internet nötig
- **WLAN-Verbindung:** Flexibler, beide Macs können sich bewegen
- **Terminal offen lassen:** Server stoppt wenn Terminal geschlossen wird

---

## ✅ Checkliste

- [ ] Kabel verbunden (USB-C oder Thunderbolt)
- [ ] Netzwerk aktiviert auf beiden Macs
- [ ] IP-Adresse gefunden
- [ ] Server gestartet auf Haupt-Mac
- [ ] Browser geöffnet auf zweitem Mac
- [ ] URL eingegeben: `http://[IP]:5177/`
- [ ] K2 Plattform läuft! 🎉
