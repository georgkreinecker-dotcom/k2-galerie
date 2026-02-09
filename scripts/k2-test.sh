#!/bin/bash
# Test Script - zeigt was passiert

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

echo "🔍 Teste K2 Auto-Start..."
echo ""

# Prüfe ob Server läuft
echo "1️⃣ Prüfe ob Server läuft..."
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "   ✅ Server läuft auf Port $port"
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done
echo "   ❌ Server läuft nicht"

# Starte Server
echo ""
echo "2️⃣ Starte Server..."
nohup npm run dev > "$HOME/k2Galerie/server.log" 2>&1 &
SERVER_PID=$!
disown $SERVER_PID 2>/dev/null || true
echo "   ✅ Server gestartet (PID: $SERVER_PID)"

# Warte auf Server
echo ""
echo "3️⃣ Warte auf Server-Start..."
for i in {1..25}; do
    sleep 1
    for port in 5177 5176 5175 5174 5173; do
        if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
            echo "   ✅ Server läuft jetzt auf Port $port"
            echo ""
            echo "4️⃣ Öffne Browser..."
            open "http://127.0.0.1:$port/"
            echo "   ✅ Browser sollte sich öffnen!"
            exit 0
        fi
    fi
    if [ $((i % 5)) -eq 0 ]; then
        echo "   ⏳ ... noch $((25-i)) Sekunden ..."
    fi
done

echo ""
echo "⚠️ Server startet langsam..."
echo "💡 Öffne manuell: http://127.0.0.1:5177/"
open "http://127.0.0.1:5177/"
