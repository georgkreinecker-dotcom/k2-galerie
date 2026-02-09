#!/bin/bash
# Stoppt den K2 Dev-Server - Führe dieses Script im Terminal aus

echo "🛑 Stoppe K2 Dev-Server..."

# Finde alle Prozesse auf Port 5177
PIDS=$(lsof -ti:5177 2>/dev/null)

if [ -z "$PIDS" ]; then
    echo "✅ Kein Server läuft auf Port 5177"
    exit 0
fi

echo "   Gefundene Prozesse: $PIDS"

# Stoppe alle Prozesse
for pid in $PIDS; do
    echo "   Stoppe Prozess $pid..."
    kill -9 $pid 2>/dev/null
done

sleep 1

# Prüfe nochmal
if lsof -ti:5177 >/dev/null 2>&1; then
    echo "⚠️  Port 5177 ist noch belegt - versuche force kill..."
    lsof -ti:5177 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -ti:5177 >/dev/null 2>&1; then
    echo "❌ Konnte Server nicht stoppen - bitte manuell in Activity Monitor beenden"
    echo "   Oder: killall node"
else
    echo "✅ Server erfolgreich gestoppt!"
fi
