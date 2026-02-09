#!/bin/bash
# Startet K2 Server automatisch - umgeht macOS Berechtigungsprobleme

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server bereits läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft bereits auf Port $port"
        exit 0
    fi
done

# Stoppe eventuell hängende Prozesse
pkill -f "vite|npm.*dev" 2>/dev/null
sleep 1

# Starte Server im Hintergrund mit nohup
# Das umgeht das Berechtigungsproblem, da es über Shell läuft
nohup npm run dev > "$HOME/k2Galerie/server.log" 2>&1 &
SERVER_PID=$!
disown $SERVER_PID 2>/dev/null || true

echo "🚀 Server wird gestartet (PID: $SERVER_PID)"
echo "⏳ Warte auf Server-Start..."

# Warte auf Server-Start (max 30 Sekunden)
for i in {1..30}; do
    sleep 1
    for port in 5177 5176 5175 5174 5173; do
        if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
            echo "✅ Server läuft jetzt auf Port $port"
            echo "🌐 URL: http://localhost:$port/"
            exit 0
        fi
    fi
    # Zeige Fortschritt alle 5 Sekunden
    if [ $((i % 5)) -eq 0 ]; then
        echo "   ... noch $((30-i)) Sekunden ..."
    fi
done

# Falls Server nicht startet, zeige Logs
echo "⚠️  Server startet langsam..."
echo "📝 Prüfe Logs: tail -f $HOME/k2Galerie/server.log"
exit 1
