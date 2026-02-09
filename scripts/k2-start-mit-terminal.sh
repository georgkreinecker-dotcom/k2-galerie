#!/bin/bash
# Startet K2 Server über Terminal.app - umgeht macOS Berechtigungen

cd "$HOME/k2Galerie" || exit 1

# Prüfe ob Server bereits läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft bereits auf Port $port"
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Starte Server über Terminal.app (damit macOS Berechtigung gibt)
osascript <<'APPLESCRIPT'
tell application "Terminal"
    activate
    do script "cd ~/k2Galerie && export PATH=\"$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH\" && npm run dev"
end tell
APPLESCRIPT

# Warte auf Server-Start
echo "⏳ Warte auf Server-Start..."
for i in {1..20}; do
    sleep 1
    for port in 5177 5176 5175 5174 5173; do
        if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
            echo "✅ Server läuft jetzt auf Port $port"
            open "http://127.0.0.1:$port/"
            exit 0
        fi
    done
done

echo "⚠️  Server startet langsam..."
open "http://127.0.0.1:5177/"
