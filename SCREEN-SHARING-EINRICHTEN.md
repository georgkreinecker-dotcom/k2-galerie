# 🖥️ Zweiter Mac als Bildschirm - Screen Sharing (VNC)

## ✅ Screen Sharing funktioniert auf ALLEN Macs!

### Schritt 1: Auf dem ZWEITEN MAC einrichten

1. **Systemeinstellungen** → **Freigaben**
2. **"Bildschirmfreigabe"** aktivieren (Häkchen setzen)
3. Notiere die IP-Adresse die angezeigt wird
   - Z.B.: `192.168.0.100` oder ähnlich
   - Oder Computer-Name: `Georgs-Mac.local`

### Schritt 2: Auf diesem MAC verbinden

**Option A: Über Finder**

1. **Finder** öffnen
2. **"Gehe zu"** → **"Mit Server verbinden"** (oder `Cmd + K`)
3. Eingeben: `vnc://[IP-Adresse]`
   - Z.B.: `vnc://192.168.0.100`
   - Oder: `vnc://Georgs-Mac.local`
4. **Verbinden** klicken
5. Zweiter Mac erscheint als Fenster

**Option B: Über Terminal**

```bash
open vnc://[IP-Adresse]
```

Z.B.: `open vnc://192.168.0.100`

---

## 🎯 Vorteile Screen Sharing:

✅ Funktioniert auf allen Macs
✅ Keine spezielle Hardware nötig
✅ Funktioniert über WLAN
✅ Einfach einzurichten

---

## 💡 Tipp:

Falls Verbindung nicht funktioniert:
- Prüfe ob beide Macs im selben WLAN sind
- Prüfe Firewall-Einstellungen
- Versuche Computer-Name statt IP-Adresse
