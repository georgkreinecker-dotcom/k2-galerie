# 🚀 Code zu GitHub hochladen

## ✅ Schnellste Methode - Command Line:

**Führe diese Befehle im Terminal aus:**

```bash
cd ~/k2Galerie
git init
git add .
git commit -m "Initial commit - K2 Galerie"
git branch -M main
git remote add origin https://github.com/georgkreinecker-dotcom/k2-galerie.git
git push -u origin main
```

**Falls du nach Username/Password gefragt wirst:**
- Username: `georgkreinecker-dotcom`
- Password: Verwende ein **Personal Access Token** (nicht dein GitHub-Passwort)
  - Erstelle eins hier: [github.com/settings/tokens](https://github.com/settings/tokens)
  - Klicke "Generate new token" → "Generate new token (classic)"
  - Scopes: `repo` aktivieren
  - Kopiere den Token und verwende ihn als Password

---

## 🎯 Nach dem Upload:

**Dann bei Vercel:**

1. Gehe zu [vercel.com/new](https://vercel.com/new)
2. Klicke **"Import Git Repository"**
3. Wähle **"k2-galerie"** aus
4. Vercel erkennt automatisch:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Klicke **"Deploy"**
6. Fertig! ✅

---

## 📋 Alternative: Ich kann es für dich machen

Sag einfach "ja" und ich führe die Befehle für dich aus! 💚
