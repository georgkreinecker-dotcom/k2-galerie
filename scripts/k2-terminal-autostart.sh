#!/bin/bash
# Startet Terminal und K2 Server automatisch

# Prüfe ob Server bereits läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        exit 0  # Server läuft bereits
    fi
done

# Öffne Terminal und starte Server
osascript <<APPLESCRIPT
tell application "Terminal"
    activate
    do script "cd ~/k2Galerie && export PATH=\"\$HOME/.local/node-v20.19.0-darwin-x64/bin:\$PATH\" && npm run dev"
end tell
APPLESCRIPT
