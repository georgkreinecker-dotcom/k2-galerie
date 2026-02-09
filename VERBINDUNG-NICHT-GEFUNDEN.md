# 🔧 Verbindung nicht gefunden - Lösungen

## ⚠️ Problem: mac2.local wird nicht gefunden

### Mögliche Ursachen:

1. **Netzwerk-Verbindung funktioniert nicht** (USB)
2. **Computer-Name wird nicht aufgelöst**
3. **VNC-Server läuft nicht richtig**
4. **Beide Macs nicht im selben Netzwerk**

---

## ✅ Lösung 1: IP-Adresse verwenden (statt Computer-Name)

**Auf diesem MAC:**

Finder → "Mit Server verbinden" → `vnc://169.254.123.114`

(Direkte IP-Adresse statt Computer-Name)

---

## ✅ Lösung 2: Netzwerk-Verbindung prüfen

**Auf BEIDEN Macs:**

1. **Systemeinstellungen** → **Netzwerk**
2. Prüfe ob USB-Verbindung aktiv ist:
   - Sollte "Verbunden" zeigen
   - IP-Adresse sollte sichtbar sein (169.254.x.x)
3. Falls nicht → USB-Netzwerk manuell hinzufügen:
   - "+" → "USB 10/100 LAN" oder "Thunderbolt Bridge"

---

## ✅ Lösung 3: VNC-Server neu starten

**Auf dem ZWEITEN MAC (mac2):**

Terminal öffnen:

```bash
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart -activate -configure -access -on -restart -agent -privs -all
```

Oder manuell:
1. Systemeinstellungen → Freigaben
2. Bildschirmfreigabe deaktivieren
3. Warten 10 Sekunden
4. Bildschirmfreigabe wieder aktivieren

---

## ✅ Lösung 4: WLAN verwenden (statt USB)

Falls USB nicht funktioniert:

**Auf dem ZWEITEN MAC:**

1. Systemeinstellungen → Netzwerk
2. WLAN-IP-Adresse finden (192.168.x.x)
3. Diese IP verwenden

**Auf diesem MAC:**

Finder → "Mit Server verbinden" → `vnc://[WLAN-IP]`

---

## ✅ Lösung 5: Ping-Test

**Auf diesem MAC Terminal öffnen:**

```bash
ping 169.254.123.114
```

Falls Antwort kommt → Netzwerk funktioniert
Falls keine Antwort → Netzwerk-Problem

---

## 💡 Empfehlung:

Versuche zuerst **Lösung 1** (IP-Adresse statt Computer-Name):
- `vnc://169.254.123.114`

Falls das nicht funktioniert → **Lösung 4** (WLAN statt USB)
