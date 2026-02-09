#!/bin/bash
# K2 Server starten - einfach START-K2.sh ausführen

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

echo "🚀 Starte K2 Server..."

# Prüfe ob Server bereits läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft bereits auf Port $port"
        open "http://localhost:$port/"
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
for i in {1..25}; do
    sleep 1
    for port in 5177 5176 5175 5174 5173; do
        if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
            echo "✅ Server läuft jetzt auf Port $port"
            open "http://localhost:$port/"
            exit 0
        fi
    done
    if [ $((i % 5)) -eq 0 ]; then
        echo "   ... noch $((25-i)) Sekunden ..."
    fi
done

# Falls Server nicht startet, öffne Browser trotzdem
echo "⚠️  Server startet langsam, öffne Browser..."
open "http://localhost:5177/"
