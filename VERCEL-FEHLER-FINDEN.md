# 🔍 Vercel Deployment-Fehler finden und beheben

## 📋 Schritt 1: Vercel-Logs öffnen

1. Gehe zu: https://vercel.com/dashboard
2. Klicke auf dein Projekt: **k2-galerie**
3. Klicke auf das **fehlgeschlagene Deployment** (rot, "Error")
4. Klicke auf **"Build Logs"** oder **"Function Logs"**
5. Kopiere die **Fehlermeldung** (besonders die roten Zeilen)

## 🔧 Schritt 2: Lokal testen

**Im Terminal am Mac:**

```bash
cd /Users/georgkreinecker/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run build
```

**Was du sehen solltest:**
- ✅ `vite build` erfolgreich
- ✅ Keine Fehler

**Falls Fehler:**
- Kopiere die Fehlermeldung
- Besonders wichtig: TypeScript-Fehler oder Export-Fehler

## 🐛 Häufige Probleme:

### Problem 1: TypeScript-Fehler
**Symptom:** `error TS2307: Cannot find module`
**Lösung:** Fehlende Imports oder falsche Pfade

### Problem 2: Export-Check schlägt fehl
**Symptom:** `❌ Doppelte Exports gefunden`
**Lösung:** Doppelte `export default` oder `export { }` entfernen

### Problem 3: gallery-data.json zu groß
**Symptom:** Build-Timeout oder Memory-Fehler
**Lösung:** Datei komprimieren oder aufteilen

### Problem 4: Node-Version
**Symptom:** `Unsupported Node version`
**Lösung:** `.nvmrc` oder `package.json` engines anpassen

## 💡 Schnell-Fix:

Falls du die Fehlermeldung nicht findest, führe aus:

```bash
cd /Users/georgkreinecker/k2Galerie
bash scripts/check-build-errors.sh
```

Das zeigt dir alle Build-Fehler lokal.
