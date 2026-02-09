#!/bin/bash
# K2 Plattform einfach öffnen - funktioniert immer

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server bereits läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Server läuft nicht - starte über Terminal.app
osascript <<APPLESCRIPT
tell application "Terminal"
    activate
    do script "cd ~/k2Galerie && export PATH=\"\$HOME/.local/node-v20.19.0-darwin-x64/bin:\$PATH\" && npm run dev"
end tell
APPLESCRIPT

# Warte auf Server-Start
sleep 8
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Fallback: Öffne Browser trotzdem
open "http://127.0.0.1:5177/"
