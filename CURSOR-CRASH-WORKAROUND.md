# 🚨 CURSOR CRASH WORKAROUND

## Problem
Cursor IDE crasht ständig (Code 5) - das ist **NICHT** ein Problem mit deinem Code!

## ✅ SOFORT-LÖSUNG: Im Browser arbeiten

### 1. Dev-Server starten (im Terminal, NICHT in Cursor)
```bash
cd /Users/georgkreinecker/k2Galerie
npm run dev
```

### 2. Im Browser öffnen
- Öffne **Chrome/Safari/Firefox** (nicht Cursor Preview!)
- Gehe zu: `http://localhost:5177`
- **Funktioniert komplett unabhängig von Cursor!**

### 3. Admin-Bereich öffnen
- Im Browser: `http://localhost:5177/admin`
- Oder: `http://localhost:5177/?screenshot=admin`

## 🔧 CURSOR EINSTELLUNGEN (falls du trotzdem Cursor nutzen willst)

### Deaktiviere Preview
1. Cursor Settings (Cmd+,)
2. Suche nach "Preview"
3. Deaktiviere alle Preview-Features

### Reduziere Extensions
1. Cursor Settings → Extensions
2. Deaktiviere alle nicht-essentiellen Extensions
3. Besonders: Deaktiviere AI-Features die im Hintergrund laufen

### Reduziere Memory-Nutzung
1. Cursor Settings → Features
2. Deaktiviere "Auto-save"
3. Deaktiviere "Live Preview"
4. Reduziere "Max File Size"

## 💡 EMPFEHLUNG

**Arbeite im Browser statt in Cursor Preview!**
- App läuft stabil
- Keine Crashes
- Alle Features funktionieren
- Code-Änderungen werden automatisch geladen (Hot Reload)

## 📝 Code bearbeiten

Du kannst weiterhin Cursor zum Code-Schreiben nutzen, aber:
- **Öffne die App im Browser** (nicht Cursor Preview)
- **Teste im Browser**
- **Cursor nur zum Schreiben** verwenden

## ⚠️ WICHTIG

Die Crashes kommen von **Cursor IDE selbst**, nicht von deinem Code!
Dein Code ist stabil - das Problem ist die Cursor Preview/IDE.
