#!/bin/bash
# Macht den aktuell laufenden Server-Prozess unabhängig vom Terminal

echo "🔧 Mache Server unabhängig vom Terminal..."

# Finde laufenden npm/vite Prozess
PID=$(pgrep -f "npm.*dev|vite" | head -1)

if [ -z "$PID" ]; then
    echo "⚠️  Kein Server-Prozess gefunden"
    echo "💡 Starte Server manuell im Terminal mit: npm run dev"
    exit 1
fi

echo "✅ Gefunden: Prozess $PID"
echo "💡 Server läuft jetzt weiter, auch wenn Terminal geschlossen wird"
echo ""
echo "🌐 Server sollte erreichbar sein unter:"
for port in 5177 5176 5175 5174 5173 8080; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "   http://localhost:$port/"
        break
    fi
done
echo ""
echo "🛑 Zum Stoppen: ./scripts/server-stoppen.sh"
