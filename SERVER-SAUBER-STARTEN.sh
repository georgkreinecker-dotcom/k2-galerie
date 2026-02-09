#!/bin/bash

# SERVER-SAUBER-STARTEN.sh
# Stoppt alle Server und startet einen sauberen Server auf Port 5177

echo "🛑 Stoppe alle Server..."

# Stoppe alle Vite/npm dev Prozesse
pkill -9 -f "vite|npm.*dev" 2>/dev/null

# Warte bis Ports frei sind
echo "⏳ Warte 3 Sekunden..."
sleep 3

echo "🚀 Starte Server neu auf Port 5177..."

cd /Users/georgkreinecker/k2Galerie || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Starte Server
npm run dev
