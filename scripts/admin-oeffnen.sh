#!/bin/bash
# Öffnet die Admin-Seite automatisch im Browser
cd "$HOME/k2Galerie" || exit 1

# Prüfe ob Server läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft auf Port $port"
        open "http://127.0.0.1:$port/admin"
        exit 0
    fi
done

# Falls Server nicht läuft, öffne trotzdem
echo "⚠️ Server läuft möglicherweise nicht, öffne Browser trotzdem..."
open "http://127.0.0.1:5177/admin"
