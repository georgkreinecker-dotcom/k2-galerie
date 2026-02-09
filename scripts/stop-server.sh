#!/bin/bash
# Stoppt den K2 Dev-Server

echo "🛑 Stoppe K2 Dev-Server..."

# Finde und stoppe Prozesse auf Port 5177
for pid in $(lsof -ti:5177 2>/dev/null); do
    echo "   Stoppe Prozess $pid..."
    kill $pid 2>/dev/null
done

# Warte kurz
sleep 1

# Falls noch aktiv, force kill
for pid in $(lsof -ti:5177 2>/dev/null); do
    echo "   Force kill Prozess $pid..."
    kill -9 $pid 2>/dev/null
done

# Prüfe ob noch aktiv
if lsof -ti:5177 >/dev/null 2>&1; then
    echo "⚠️  Port 5177 ist noch belegt"
else
    echo "✅ Server gestoppt"
fi
