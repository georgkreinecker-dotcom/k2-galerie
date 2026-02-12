# 📤 Vercel Upload - Schritt für Schritt

## Wenn kein "Upload" Button sichtbar ist:

### Option 1: Git-Import verwenden (einfachste Methode)

1. **Auf Vercel:** Klicke auf "Add New..." → "Project"
2. **Wähle:** "Import Git Repository"
3. **Falls du GitHub/GitLab hast:**
   - Verbinde dein Repository
   - Oder: Erstelle ein neues Repository und pushe deinen Code

### Option 2: Drag & Drop direkt

1. **Gehe zu:** [vercel.com/new](https://vercel.com/new)
2. **Scroll nach unten** - manchmal ist "Upload" weiter unten
3. **Oder:** Ziehe den `dist/` Ordner direkt auf die Seite (auch ohne Button)

### Option 3: Vercel CLI verwenden (wenn Git verbunden)

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
vercel login
vercel --prod
```

### Option 4: GitHub Repository erstellen

1. **Erstelle ein GitHub Repository:**
   - Gehe zu [github.com/new](https://github.com/new)
   - Name: `k2-galerie`
   - Erstelle das Repository

2. **Push deinen Code:**
```bash
cd ~/k2Galerie
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/k2-galerie.git
git push -u origin main
```

3. **Bei Vercel:**
   - Import Git Repository
   - Wähle dein Repository
   - Root Directory: `/` (Standard)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Deploy!

---

## 🎯 Schnellste Lösung: Drag & Drop

**Auch ohne "Upload" Button:**

1. **Zuerst Build:** Im Terminal `npm run build` (im Ordner k2Galerie)
2. Öffne den **`dist/`** Ordner im Finder (nicht den ganzen Projektordner!)
3. Gehe zu [vercel.com/new](https://vercel.com/new)
4. **Ziehe den gesamten `dist/` Ordner** direkt auf die Vercel-Seite
5. Es sollte automatisch erkannt werden!

⚠️ **Nur Textseite nach Upload?** → Du hast wahrscheinlich den **Projektordner** statt **dist** hochgeladen. Siehe `UPLOAD-NUR-TEXTSEITE-FIX.md`.

---

## 📸 Screenshot-Hilfe

**Was siehst du genau auf der Vercel-Seite?**
- "Import Git Repository"?
- "Deploy from GitHub"?
- "Create Project"?
- Etwas anderes?

**Beschreibe mir, was du siehst, dann kann ich dir genau sagen, was du klicken sollst!** 💚
