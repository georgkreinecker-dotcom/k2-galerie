# 🖥️ Screen Sharing - Alternative Methode

## ⚠️ vnc:// URLs werden nicht unterstützt

### ✅ Alternative Methode 1: Screen Sharing App direkt öffnen

**Auf diesem MAC:**

1. **Finder** öffnen
2. **"Programme"** → **"Dienstprogramme"**
3. **"Bildschirmfreigabe"** öffnen
4. IP-Adresse oder Computer-Name eingeben:
   - Z.B.: `192.168.0.100`
   - Oder: `mac2.local`
5. **Verbinden** klicken

---

### ✅ Alternative Methode 2: Über Spotlight

**Auf diesem MAC:**

1. **Cmd + Leertaste** drücken (Spotlight)
2. Tippe: **"Bildschirmfreigabe"**
3. App öffnen
4. IP-Adresse eingeben
5. Verbinden

---

### ✅ Alternative Methode 3: Terminal-Befehl

**Auf diesem MAC Terminal öffnen:**

```bash
open -a "Bildschirmfreigabe" vnc://[IP-ADRESSE]
```

Oder direkt die App öffnen:

```bash
open -a "Bildschirmfreigabe"
```

Dann IP-Adresse manuell eingeben.

---

### ✅ Alternative Methode 4: Finder → Netzwerk

**Auf diesem MAC:**

1. **Finder** öffnen
2. Links in der Sidebar: **"Netzwerk"** klicken
3. Zweiten Mac sollte dort erscheinen
4. Doppelklick auf den zweiten Mac
5. **"Bildschirmfreigabe"** wählen

---

## 💡 Empfehlung:

**Methode 1** (Bildschirmfreigabe App direkt) ist am einfachsten!
