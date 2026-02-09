# 🖥️ Bildschirmfreigabe - IP-Adresse direkt eingeben

## ⚠️ Problem: URLs werden nicht unterstützt

### ✅ Lösung: IP-Adresse OHNE vnc:// eingeben

**In der Bildschirmfreigabe App:**

1. **Cmd + K** drücken
   - Oder: **"Datei"** → **"Mit Server verbinden"**

2. **NUR die IP-Adresse eingeben** (OHNE vnc://):
   ```
   192.168.0.72
   ```
   **NICHT:** `vnc://192.168.0.72` ❌
   **SONDERN:** `192.168.0.72` ✅

3. **Verbinden** klicken

---

## 💡 Alternative: Computer-Name verwenden

**Falls IP nicht funktioniert:**

1. **Cmd + K** drücken
2. Eingeben: `mac2.local`
   - (OHNE vnc://)
3. **Verbinden** klicken

---

## 🔧 Falls immer noch nicht funktioniert:

### Lösung 1: Über Finder → Netzwerk

1. **Finder** → **"Netzwerk"**
2. Zweiten Mac finden
3. **Rechtsklick** → **"Bildschirmfreigabe"**

### Lösung 2: Terminal-Befehl

```bash
open "vnc://192.168.0.72"
```

Falls das auch nicht funktioniert → Lösung 1 verwenden

---

## ✅ Wichtig:

- **NUR IP-Adresse** eingeben: `192.168.0.72`
- **KEIN** `vnc://` davor!
- **KEIN** `.local` dahinter (bei IP-Adresse)

---

## 🎯 So funktioniert es:

**Bildschirmfreigabe App → Cmd + K → `192.168.0.72` → Verbinden**
