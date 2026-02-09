#!/bin/bash
# Startet den K2 Server - wird von LaunchAgent verwendet

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server schon läuft
for port in 5177 5176 5175 5174 5173; do
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "✅ Server läuft bereits auf Port $port"
        exit 0
    fi
done

# Starte Server
npm run dev > "$HOME/k2Galerie/server.log" 2>&1 &
