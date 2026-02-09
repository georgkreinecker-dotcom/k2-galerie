# 🚨 CURSOR CRASH PROBLEM - SOFORT-LÖSUNGEN

## ⚠️ WICHTIG: Das ist ein CURSOR IDE Problem, nicht dein Code!

Cursor crasht ständig (Code 5) - das kann ich **NICHT** durch Code-Fixes lösen.

## ✅ SOFORT-LÖSUNGEN (in Reihenfolge):

### 1. Cursor komplett neu installieren
```bash
# Cursor komplett schließen
# Dann im Terminal:
rm -rf ~/Library/Application\ Support/Cursor
# Cursor neu starten
```

### 2. Cursor-Einstellungen zurücksetzen
1. Cursor Settings (Cmd+,)
2. Suche nach "Reset"
3. "Reset All Settings" klicken

### 3. Preview komplett deaktivieren
1. Cursor Settings → Features
2. Suche nach "Preview"
3. **ALLE** Preview-Features deaktivieren
4. "Live Preview" deaktivieren
5. "Auto Preview" deaktivieren

### 4. Extensions deaktivieren
1. Cursor Settings → Extensions
2. **ALLE** Extensions deaktivieren
3. Nur die wichtigsten wieder aktivieren

### 5. Memory-Limit erhöhen
1. Cursor Settings → Performance
2. "Max Memory" auf Maximum setzen
3. "Max File Size" erhöhen

### 6. Alternative: VS Code verwenden
- VS Code installieren
- Projekt dort öffnen
- Gleiche Features, aber stabiler

## 🔧 WORKAROUND: Code ohne Preview bearbeiten

1. **Code schreiben**: In Cursor (aber Preview AUS)
2. **Terminal öffnen**: `npm run dev`
3. **Browser öffnen**: `http://localhost:5177`
4. **Testen**: Im Browser, nicht in Cursor Preview

## 💡 EMPFEHLUNG

**Kontaktiere Cursor Support:**
- Das ist ein bekanntes Problem (Code 5 Crashes)
- Sie können dir helfen oder ein Update bereitstellen
- Support: support@cursor.com

## ⚠️ WICHTIG

**Ich kann Cursor-Crashes NICHT durch Code-Fixes lösen!**
Das ist ein fundamentales Problem mit Cursor IDE selbst.
