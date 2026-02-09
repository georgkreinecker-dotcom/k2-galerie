# 🔧 Freigabezeile fehlt - Lösungen

## ⚠️ Problem: Zweiter Mac sichtbar, aber keine Freigabezeile

### ✅ Lösung 1: Rechtsklick → "Bildschirmfreigabe"

**Auf diesem MAC:**

1. **Finder** → **"Netzwerk"**
2. **Rechtsklick** auf den zweiten Mac
3. **"Bildschirmfreigabe"** wählen
4. Verbinden

---

### ✅ Lösung 2: Doppelklick → Menü oben

**Auf diesem MAC:**

1. **Finder** → **"Netzwerk"**
2. **Doppelklick** auf den zweiten Mac
3. Oben im Fenster sollte ein Menü sein
4. **"Bildschirmfreigabe"** oder **"Mit Bildschirmfreigabe verbinden"** wählen

---

### ✅ Lösung 3: Bildschirmfreigabe App direkt

**Auf diesem MAC:**

1. **Cmd + Leertaste** (Spotlight)
2. Tippe: **"Bildschirmfreigabe"**
3. App öffnen
4. IP-Adresse des zweiten Macs eingeben:
   - Z.B.: `192.168.0.100`
   - Oder Computer-Name: `mac2.local`
5. **Verbinden** klicken

---

### ✅ Lösung 4: Terminal-Befehl

**Auf diesem MAC Terminal öffnen:**

```bash
open /System/Library/CoreServices/Applications/Screen\ Sharing.app
```

Dann IP-Adresse eingeben.

---

## 💡 Empfehlung:

Versuche **Lösung 1** (Rechtsklick) oder **Lösung 3** (Bildschirmfreigabe App direkt)
