#!/bin/bash
# Automatisches Deployment-Script für k2-galerie.at

echo "🚀 K2 Galerie - Automatisches Deployment"
echo "=========================================="
echo ""

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Vercel CLI installiert ist
if ! command -v vercel &> /dev/null; then
    echo "📦 Installiere Vercel CLI..."
    npm install -g vercel
fi

# Build erstellen
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
echo "✅ Deployment gestartet!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Domain k2-galerie.at bei Vercel verbinden"
echo "2. DNS-Einstellungen bei deinem Domain-Provider setzen"
echo "3. Website-URL in Stammdaten auf https://k2-galerie.at setzen"
echo ""
