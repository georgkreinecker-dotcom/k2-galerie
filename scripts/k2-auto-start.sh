#!/bin/bash
# K2 Plattform öffnen - Server startet AUTOMATISCH

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

echo "🚀 Öffne K2 Plattform..."

# Prüfe ob Server läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft bereits auf Port $port"
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Server läuft nicht - starte ihn automatisch im Hintergrund
echo "📡 Server läuft nicht - starte automatisch..."
nohup npm run dev > "$HOME/k2Galerie/server.log" 2>&1 &
SERVER_PID=$!
disown $SERVER_PID 2>/dev/null || true

echo "⏳ Warte auf Server-Start..."
# Warte auf Server-Start (max 25 Sekunden)
for i in {1..25}; do
    sleep 1
    for port in 5177 5176 5175 5174 5173; do
        if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
            echo "✅ Server gestartet auf Port $port"
            open "http://127.0.0.1:$port/"
            exit 0
        fi
    fi
    # Zeige Fortschritt alle 5 Sekunden
    if [ $((i % 5)) -eq 0 ]; then
        echo "   ... noch $((25-i)) Sekunden ..."
    fi
done

# Falls Server nicht startet, öffne Browser trotzdem
echo "⚠️ Server startet langsam, öffne Browser..."
open "http://127.0.0.1:5177/"
