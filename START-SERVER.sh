#!/bin/bash

# START-SERVER.sh - Startet den Dev-Server für K2 Galerie
# Verwendet verschiedene Methoden um Node.js zu finden

echo "🚀 Starte K2 Galerie Dev-Server..."
echo ""

# Methode 1: Prüfe ob nvm installiert ist
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo "📦 Verwende nvm..."
    source "$HOME/.nvm/nvm.sh"
    nvm use default 2>/dev/null || nvm use node 2>/dev/null
fi

# Methode 2: Prüfe verschiedene Node-Pfade
NODE_PATHS=(
    "/usr/local/bin/node"
    "/opt/homebrew/bin/node"
    "$HOME/.nvm/versions/node/*/bin/node"
    "/Applications/Cursor.app/Contents/Resources/app/node"
)

for NODE_PATH in "${NODE_PATHS[@]}"; do
    if [ -f "$NODE_PATH" ] || ls $NODE_PATH 2>/dev/null | head -1; then
        export PATH="$(dirname $NODE_PATH):$PATH"
        echo "✅ Node gefunden: $NODE_PATH"
        break
    fi
done

# Methode 3: Verwende which wenn jetzt verfügbar
if command -v node &> /dev/null; then
    echo "✅ Node Version: $(node --version)"
    echo "✅ npm Version: $(npm --version)"
    echo ""
    echo "🚀 Starte Server auf Port 5177..."
    echo ""
    cd /Users/georgkreinecker/k2Galerie
    npm run dev
else
    echo "❌ Node.js nicht gefunden!"
    echo ""
    echo "💡 Lösungen:"
    echo "1. Node.js installieren: https://nodejs.org/"
    echo "2. Oder nvm installieren: https://github.com/nvm-sh/nvm"
    echo "3. Oder: Server läuft bereits im Hintergrund (Cursor)"
    echo ""
    echo "🌐 Versuche Browser zu öffnen: http://localhost:5177"
fi
