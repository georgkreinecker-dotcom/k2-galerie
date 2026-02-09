#!/bin/bash
# Stoppt alle K2 Server-Prozesse

echo "🛑 Stoppe alle K2 Server-Prozesse..."

# Stoppe alle Vite/npm dev Prozesse
pkill -f "vite" 2>/dev/null
pkill -f "npm.*dev" 2>/dev/null
pkill -f "node.*vite" 2>/dev/null

# Stoppe Prozesse auf den Ports
for port in 5177 5176 5175 5174 5173; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo "Stoppe Prozess auf Port $port (PID: $PID)..."
        kill -9 $PID 2>/dev/null
    fi
done

sleep 1

echo "✅ Server gestoppt"
