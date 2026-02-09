# 🖥️ Zweiter Mac verbinden - IP: 169.254.123.114

## ✅ IP-Adresse gefunden: 169.254.123.114

Das ist eine USB-Verbindung (Link-Local).

---

## 🔗 So verbindest du dich:

### Methode 1: Über Finder (EINFACHSTE)

1. **Finder** öffnen
2. **"Gehe zu"** → **"Mit Server verbinden"** (oder `Cmd + K`)
3. Eingeben: `vnc://169.254.123.114`
4. **Verbinden** klicken
5. Zweiter Mac öffnet sich als Fenster

---

### Methode 2: Über Terminal

```bash
open vnc://169.254.123.114
```

---

## ⚠️ WICHTIG:

**Auf dem zweiten Mac muss aktiviert sein:**
- Systemeinstellungen → Freigaben → **"Bildschirmfreigabe"** aktiviert

---

## 💡 Falls Verbindung nicht funktioniert:

1. Prüfe ob Bildschirmfreigabe aktiviert ist (zweiter Mac)
2. Prüfe Firewall-Einstellungen
3. Versuche Computer-Name statt IP:
   - Finder → "Mit Server verbinden"
   - `vnc://[Computer-Name].local`

---

## ✅ Verbindung starten:

**Finder → "Gehe zu" → "Mit Server verbinden" → `vnc://169.254.123.114`**
