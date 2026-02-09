#!/bin/bash
# K2 Plattform einfach öffnen - funktioniert immer!

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

echo "🚀 Öffne K2 Plattform..."

# Prüfe ob Server läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft auf Port $port"
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Falls kein Server läuft, starte einen im Hintergrund
echo "📡 Starte Server..."
nohup npm run dev > "$HOME/k2Galerie/server.log" 2>&1 &
SERVER_PID=$!
disown $SERVER_PID 2>/dev/null || true

# Warte auf Server-Start
echo "⏳ Warte auf Server..."
for i in {1..15}; do
    sleep 1
    for port in 5177 5176 5175 5174 5173; do
        if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
            echo "✅ Server gestartet auf Port $port"
            open "http://127.0.0.1:$port/"
            exit 0
        fi
    fi
done

echo "⚠️ Server startet langsam..."
echo "💡 Öffne manuell: http://127.0.0.1:5177/"
open "http://127.0.0.1:5177/"
