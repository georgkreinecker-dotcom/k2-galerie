# 🚀 Einfaches Deployment für k2-galerie.at

## ✅ Alles ist vorbereitet!

Ich habe ein automatisches Deployment-Script erstellt. Du hast 2 Optionen:

## Option 1: Automatisch (empfohlen)

**Im Terminal ausführen:**

```bash
cd ~/k2Galerie
./deploy-einfach.sh
```

Das Script:
- ✅ Prüft ob du bei Vercel angemeldet bist
- ✅ Führt dich durch die Anmeldung (falls nötig)
- ✅ Erstellt automatisch den Build
- ✅ Deployed automatisch auf Vercel
- ✅ Führt dich durch den Prozess

## Option 2: Manuell auf Vercel

### Schritt 1: Build erstellen

```bash
cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run build
```

### Schritt 2: Auf Vercel deployen

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke "New Project"
3. Wähle "Upload"
4. Ziehe den **dist**-Ordner hinein
5. Klicke "Deploy"

### Schritt 3: Domain verbinden

1. In Vercel: **Settings** → **Domains**
2. Domain hinzufügen: `k2-galerie.at`
3. DNS-Einstellungen kopieren
4. Bei Domain-Provider DNS-Einträge setzen
5. Fertig! ✅

## 📋 Was bereits konfiguriert ist:

✅ **vercel.json** - Deployment-Konfiguration
✅ **vite.config.ts** - Production-Build optimiert
✅ **Alle QR-Codes** - Verwenden automatisch die Domain
✅ **React Router** - Funktioniert mit Rewrites

## 🎯 Nach dem Deployment

Die Website läuft dann automatisch unter:
- `https://k2-galerie.at`
- `https://www.k2-galerie.at`

Alle QR-Codes und Links funktionieren automatisch! 💚
