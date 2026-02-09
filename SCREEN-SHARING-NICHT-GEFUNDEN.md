# 🔍 Screen Sharing nicht gefunden - Alternativen

## ⚠️ Problem: Bildschirmfreigabe nicht in Dienstprogrammen

### ✅ Lösung 1: Finder → Netzwerk (EINFACHSTE)

**Auf diesem MAC:**

1. **Finder** öffnen
2. Links in der Sidebar: **"Netzwerk"** klicken
3. Zweiten Mac sollte dort erscheinen (`192.168.0.72`)
4. **Rechtsklick** auf den zweiten Mac
5. **"Bildschirmfreigabe"** oder **"Mit Bildschirmfreigabe verbinden"** wählen
6. Verbinden

**Das umgeht die App komplett!**

---

### ✅ Lösung 2: Spotlight (auf Englisch)

1. **Cmd + Leertaste** drücken
2. Tippe: **"Screen Sharing"** (auf Englisch)
3. Oder: **"Remote Desktop"**
4. App öffnen
5. Verbinden mit: `192.168.0.72`

---

### ✅ Lösung 3: Terminal-Befehl

**Terminal öffnen:**

```bash
open vnc://192.168.0.72
```

Falls das nicht funktioniert → Lösung 1 verwenden

---

### ✅ Lösung 4: Systemeinstellungen → Freigaben

**Auf diesem MAC:**

1. **Systemeinstellungen** → **Freigaben**
2. Links: **"Bildschirmfreigabe"** wählen
3. Rechts sollte eine Option sein zum Verbinden
4. Oder: **"Computer im Netzwerk finden"**

---

## 💡 Empfehlung:

**Lösung 1** (Finder → Netzwerk → Rechtsklick) ist am einfachsten!

---

## 🎯 So funktioniert es:

**Finder → Netzwerk → Rechtsklick auf zweiten Mac → Bildschirmfreigabe**

Das funktioniert immer, auch wenn die App nicht gefunden wird!
