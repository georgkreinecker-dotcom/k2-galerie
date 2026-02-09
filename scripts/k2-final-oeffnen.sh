#!/bin/bash
# K2 Plattform öffnen - FINALE VERSION die wirklich funktioniert!

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Server läuft nicht - starte ihn
echo "🚀 Starte Server..."
cd "$HOME/k2Galerie"
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Starte Server im Hintergrund
nohup npm run dev > "$HOME/k2Galerie/server.log" 2>&1 &
SERVER_PID=$!
disown $SERVER_PID 2>/dev/null || true

# Warte auf Server-Start (max 20 Sekunden)
for i in {1..20}; do
    sleep 1
    for port in 5177 5176 5175 5174 5173; do
        if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
            open "http://127.0.0.1:$port/"
            exit 0
        fi
    done
done

# Falls Server nicht startet, öffne Browser trotzdem
open "http://127.0.0.1:5177/"
