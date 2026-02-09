# 🚀 Automatisches Deployment für k2-galerie.at

## ✅ Alles ist vorbereitet!

Die Domain-Integration ist jetzt automatisch konfiguriert. Du musst nur noch:

### 1️⃣ Domain registrieren
- Gehe zu einem österreichischen Provider (z.B. nic.at, World4You)
- Registriere: **k2-galerie.at**
- Kosten: ca. 15-30€/Jahr

### 2️⃣ Auf Vercel deployen (5 Minuten)

**Option A: Mit GitHub (empfohlen)**
1. Code auf GitHub hochladen (falls noch nicht geschehen)
2. Gehe zu [vercel.com](https://vercel.com)
3. Klicke "New Project"
4. Verbinde dein GitHub Repository
5. Vercel erkennt automatisch die `vercel.json` Konfiguration
6. Klicke "Deploy"
7. Fertig! 🎉

**Option B: Manuell**
1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke "New Project"
3. Wähle "Upload"
4. Führe lokal aus: `npm run build`
5. Lade den `dist`-Ordner hoch
6. Klicke "Deploy"

### 3️⃣ Domain verbinden

1. In Vercel: **Settings** → **Domains**
2. Domain hinzufügen: `k2-galerie.at`
3. Vercel zeigt dir die DNS-Einstellungen
4. Bei deinem Domain-Provider:
   - **A-Record**: `@` → IP von Vercel
   - **CNAME**: `www` → `cname.vercel-dns.com`
5. Warte 5-10 Minuten (DNS-Propagierung)
6. Fertig! ✅

### 4️⃣ Website-URL aktualisieren

Nach erfolgreichem Deployment:
1. Öffne die Galerie-Website
2. Admin-Bereich öffnen (Passwort: k2Galerie2026)
3. Stammdaten → Galerie
4. Website-Feld auf `https://k2-galerie.at` setzen
5. Speichern

## 📦 Was wurde automatisch konfiguriert:

✅ **vercel.json** - Deployment-Konfiguration
✅ **vite.config.ts** - Optimierter Build für Production
✅ **index.html** - Meta-Tags für SEO
✅ **Alle URLs** - Bereit für Domain-Integration

## 🎯 Nach dem Deployment

- ✅ Website läuft unter `https://k2-galerie.at`
- ✅ Automatisches HTTPS (von Vercel)
- ✅ QR-Codes funktionieren automatisch
- ✅ PWA installierbar
- ✅ Schnell und zuverlässig

## 💡 Alternative: Netlify

Falls du Netlify bevorzugst:
1. Gehe zu [netlify.com](https://netlify.com)
2. Drag & Drop den `dist`-Ordner
3. Domain verbinden
4. Fertig!

Die App funktioniert mit beiden Hosting-Anbietern! 💚
