#!/bin/bash
# Stoppt alle K2 Server-Prozesse und startet neu

echo "🛑 Stoppe alle K2 Server-Prozesse..."

# Stoppe alle Vite/npm dev Prozesse
pkill -f "vite" 2>/dev/null
pkill -f "npm.*dev" 2>/dev/null
pkill -f "node.*vite" 2>/dev/null

# Warte kurz
sleep 2

# Prüfe ob noch Prozesse laufen
if lsof -ti:5177,5176,5175,5174,5173 > /dev/null 2>&1; then
    echo "⚠️  Einige Prozesse laufen noch, stoppe sie..."
    lsof -ti:5177,5176,5175,5174,5173 | xargs kill -9 2>/dev/null
    sleep 1
fi

echo "✅ Server gestoppt"
echo ""
echo "🚀 Starte Server neu..."

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

npm run dev
