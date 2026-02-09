#!/bin/bash
# Stoppt und startet den K2 Server neu

echo "🛑 Stoppe Server..."

# Stoppe alle Vite/npm dev Prozesse
pkill -f "vite|npm.*dev" 2>/dev/null

# Warte kurz
sleep 2

echo "🚀 Starte Server neu..."

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Starte Server im Hintergrund
npm run dev > /dev/null 2>&1 &

# Warte kurz und prüfe ob Server läuft
sleep 3

# Prüfe verschiedene Ports
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft auf Port $port"
        echo "🌐 URL: http://localhost:$port/"
        exit 0
    fi
done

echo "⚠️  Server gestartet, aber noch nicht erreichbar"
echo "💡 Prüfe in ein paar Sekunden: http://localhost:5177/"
