# 🖥️ Zweiter Mac verbinden - mac2.local

## ✅ Computer-Name: mac2.local

### So verbindest du dich:

**Methode 1: Über Finder (EINFACHSTE)**

1. **Finder** öffnen
2. **"Gehe zu"** → **"Mit Server verbinden"** (oder `Cmd + K`)
3. Eingeben: `vnc://mac2.local`
4. **Verbinden** klicken
5. Zweiter Mac öffnet sich als Fenster

---

**Methode 2: Über Terminal**

```bash
open vnc://mac2.local
```

---

## ⚠️ WICHTIG:

**Auf dem zweiten Mac (mac2) muss aktiviert sein:**

1. **Systemeinstellungen** → **Freigaben**
2. **"Bildschirmfreigabe"** aktiviert (Häkchen)
3. Firewall deaktiviert (oder Bildschirmfreigabe erlaubt)

---

## 💡 Falls Verbindung nicht funktioniert:

1. Prüfe ob Bildschirmfreigabe aktiviert ist
2. Prüfe Firewall-Einstellungen
3. Versuche IP-Adresse: `vnc://169.254.123.114`
4. Prüfe ob beide Macs im selben Netzwerk sind

---

## ✅ Verbindung starten:

**Finder → "Gehe zu" → "Mit Server verbinden" → `vnc://mac2.local`**
