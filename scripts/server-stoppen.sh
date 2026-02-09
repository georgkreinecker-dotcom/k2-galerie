#!/bin/bash
# Stoppt den K2 Server

echo "🛑 Stoppe K2 Server..."

# Stoppe alle Vite/npm dev Prozesse
pkill -f "vite|npm.*dev" 2>/dev/null

sleep 1

# Prüfe ob noch Prozesse laufen
if pgrep -f "vite|npm.*dev" > /dev/null; then
    echo "⚠️  Einige Prozesse laufen noch, versuche force-kill..."
    pkill -9 -f "vite|npm.*dev" 2>/dev/null
fi

echo "✅ Server gestoppt"
