#!/bin/bash
# Öffnet die K2 Plattform - prüft Server und öffnet Browser

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft auf Port $port"
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Falls kein Server läuft, starte einen
echo "🚀 Starte Server..."
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!

# Warte auf Server-Start
for i in {1..10}; do
    sleep 1
    for port in 5177 5176 5175 5174 5173; do
        if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
            echo "✅ Server gestartet auf Port $port"
            open "http://127.0.0.1:$port/"
            exit 0
        fi
    fi
done

echo "⚠️ Server konnte nicht gestartet werden"
echo "💡 Bitte manuell starten: cd ~/k2Galerie && npm run dev"
