# 🔧 USB-Netzwerk manuell hinzufügen

## ✅ USB-Netzwerk wird nicht automatisch erkannt - manuell hinzufügen:

### Auf dem ZWEITEN MAC:

1. **Systemeinstellungen** → **Netzwerk**
2. Klicke auf **"+"** (Plus-Button unten links)
3. Im Dropdown-Menü wählen:
   - **"USB 10/100 LAN"** (falls vorhanden)
   - Oder **"Thunderbolt Bridge"** (falls Thunderbolt-Kabel)
   - Oder **"USB Ethernet"**
4. Klicke **"Erstellen"**
5. Warte bis Verbindung aktiviert ist

### Auf diesem MAC (Haupt-Mac):

1. Gleiche Schritte wie oben
2. Beide Macs sollten jetzt verbunden sein

---

## 🔍 Falls "USB 10/100 LAN" nicht verfügbar ist:

### Mögliche Gründe:

1. **Falsches Kabel:** Nicht alle USB-C Kabel unterstützen Netzwerk
2. **Thunderbolt nötig:** Manche Macs brauchen Thunderbolt statt USB-C
3. **Treiber fehlt:** Ältere macOS-Versionen unterstützen USB-Netzwerk nicht

---

## 💡 Alternative Lösungen:

### Option 1: AirPlay Display (WLAN)

**Auf dem zweiten Mac:**
1. Systemeinstellungen → Displays
2. "AirPlay Display" aktivieren

**Auf diesem Mac:**
1. AirPlay-Menü (oben rechts) → zweiten Mac wählen

**Vorteil:** Funktioniert ohne Kabel!

---

### Option 2: Screen Sharing (WLAN)

**Auf dem zweiten Mac:**
1. Systemeinstellungen → Freigaben
2. "Bildschirmfreigabe" aktivieren

**Auf diesem Mac:**
1. Finder → "Gehe zu" → "Mit Server verbinden"
2. `vnc://[IP-Adresse-des-zweiten-Macs]` eingeben

---

### Option 3: Thunderbolt Bridge

Falls du ein Thunderbolt-Kabel hast:
1. Beide Macs: Systemeinstellungen → Netzwerk
2. "+" → "Thunderbolt Bridge" hinzufügen

---

## 🎯 Empfehlung:

**AirPlay Display** ist am einfachsten:
- Kein Kabel nötig
- Funktioniert über WLAN
- Einfach aktivieren
