#!/bin/bash
# Einfaches Script zum Starten von K2

echo "🚀 Starte K2..."

cd "$HOME/k2Galerie" || {
    echo "❌ Fehler: Projektordner nicht gefunden"
    exit 1
}

export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

echo "📡 Prüfe ob Server läuft..."

# Prüfe Ports
for port in 5177 5176 5175; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft bereits auf Port $port"
        echo "🌐 Öffne Browser..."
        open "http://localhost:$port/"
        exit 0
    fi
done

echo "📡 Starte Server..."
echo "⏳ Bitte warten..."

npm run dev
