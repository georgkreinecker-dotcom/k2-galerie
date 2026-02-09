#!/bin/bash
# Öffnet K2 Plattform im Browser

echo "🌐 Öffne K2 Plattform..."

# Prüfe verschiedene Ports
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft auf Port $port"
        echo "🚀 Öffne Browser..."
        open "http://localhost:$port/"
        exit 0
    fi
done

# Falls kein Server läuft, starte einen
echo "📡 Kein Server gefunden, starte Server..."
cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

npm run dev > /dev/null 2>&1 &
sleep 5

# Prüfe nochmal
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server gestartet auf Port $port"
        echo "🚀 Öffne Browser..."
        open "http://localhost:$port/"
        exit 0
    fi
done

echo "❌ Server konnte nicht gestartet werden"
echo "💡 Bitte manuell starten: cd ~/k2Galerie && npm run dev"
