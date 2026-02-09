#!/bin/bash
# Startet den K2 Server im Hintergrund - Terminal kann geschlossen werden

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

echo "🚀 Starte K2 Server im Hintergrund..."
echo "💡 Du kannst das Terminal jetzt schließen!"

# Stoppe eventuell laufende Server
pkill -f "vite|npm.*dev" 2>/dev/null
sleep 1

# Starte Server im Hintergrund mit nohup (läuft weiter wenn Terminal geschlossen wird)
# Verwende disown damit Prozess nicht beendet wird wenn Terminal geschlossen wird
nohup npm run dev > "$HOME/k2Galerie/server.log" 2>&1 &
SERVER_PID=$!
disown $SERVER_PID 2>/dev/null || true

# Warte länger für Server-Start
sleep 6

# Prüfe ob Server läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft auf Port $port"
        echo "🌐 URL: http://localhost:$port/"
        echo "📝 Logs: $HOME/k2Galerie/server.log"
        echo ""
        echo "💡 Terminal kann jetzt geschlossen werden!"
        echo "🛑 Zum Stoppen: ./scripts/server-stoppen.sh"
        exit 0
    fi
done

echo "⚠️  Server gestartet, prüfe in ein paar Sekunden..."
echo "📝 Logs: $HOME/k2Galerie/server.log"
