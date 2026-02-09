#!/bin/bash
# Einfaches Deployment-Script für k2-galerie.at

echo "🚀 K2 Galerie - Einfaches Deployment"
echo "======================================"
echo ""

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob bereits eingeloggt
if vercel whoami &> /dev/null; then
    echo "✅ Bereits bei Vercel angemeldet!"
    echo ""
else
    echo "🔐 Vercel-Anmeldung erforderlich"
    echo "================================"
    echo ""
    echo "Bitte melde dich jetzt bei Vercel an:"
    echo "1. Ein Browser-Fenster öffnet sich automatisch"
    echo "2. Melde dich mit deinem Vercel-Account an"
    echo "3. Oder besuche: https://vercel.com/login"
    echo ""
    echo "Drücke Enter, um den Login zu starten..."
    read
    
    vercel login
fi

# Build erstellen
echo ""
echo "🔨 Erstelle Production-Build..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build fehlgeschlagen!"
    exit 1
fi

echo "✅ Build erfolgreich!"
echo ""
echo "🌐 Starte Deployment auf Vercel..."
echo ""

# Vercel Deployment
vercel --prod --yes

echo ""
echo "✅ Deployment abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Domain k2-galerie.at bei Vercel verbinden"
echo "2. DNS-Einstellungen bei deinem Domain-Provider setzen"
echo "3. Website-URL in Stammdaten auf https://k2-galerie.at setzen"
echo ""
