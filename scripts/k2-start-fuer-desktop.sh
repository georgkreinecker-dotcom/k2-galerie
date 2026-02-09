#!/bin/bash
# K2 Start - Kopiere dieses Script auf den Desktop und mache es ausführbar

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

echo "🚀 Starte K2..."

# Prüfe ob Server läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft auf Port $port"
        echo "🌐 Öffne Browser..."
        open "http://localhost:$port/"
        exit 0
    fi
done

# Falls kein Server läuft, starte einen
echo "📡 Starte Server..."
npm run dev
