#!/bin/bash
# Startet K2 Plattform - Doppelklick oder Terminal ausführen

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

echo "🚀 Starte K2 Plattform..."

# Prüfe verschiedene Ports
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft auf Port $port"
        open "http://localhost:$port/"
        exit 0
    fi
done

# Falls kein Server läuft, starte einen
echo "📡 Starte Dev-Server..."
npm run dev > /dev/null 2>&1 &
sleep 4

for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        echo "✅ Server gestartet auf Port $port"
        open "http://localhost:$port/"
        exit 0
    fi
done

echo "⚠️ Server konnte nicht gestartet werden"
