# 🚀 Schnelles Deployment für k2-galerie.at

## ✅ Build ist bereits fertig!

Der Production-Build wurde erfolgreich erstellt und liegt im `dist/` Ordner.

## Option 1: Vercel Web-Interface (EINFACHSTE Methode) 💚

1. **Gehe zu [vercel.com](https://vercel.com)** und melde dich an (kostenlos mit GitHub/Email)

2. **Klicke auf "New Project"**

3. **Wähle "Upload"** (nicht Git-Import)

4. **Ziehe den gesamten `dist/` Ordner** in das Upload-Feld

5. **Klicke "Deploy"**

6. **Fertig!** ✅ Deine Website läuft dann unter einer `*.vercel.app` URL

7. **Domain hinzufügen:**
   - In Vercel: **Settings** → **Domains**
   - Domain hinzufügen: `k2-galerie.at`
   - DNS-Einstellungen kopieren und bei deinem Domain-Provider setzen

## Option 2: Vercel CLI (wenn bereits angemeldet)

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
vercel --prod --yes
```

## 📋 Was bereits vorbereitet ist:

✅ **vercel.json** - Deployment-Konfiguration  
✅ **vite.config.ts** - Production-Build optimiert  
✅ **dist/** - Fertiger Build liegt bereit  
✅ **Alle QR-Codes** - Verwenden automatisch die Domain  
✅ **React Router** - Funktioniert mit Rewrites  

## 🎯 Nach dem Deployment

Die Website läuft dann automatisch unter:
- `https://k2-galerie.at`
- `https://www.k2-galerie.at`

Alle QR-Codes und Links funktionieren automatisch! 💚
