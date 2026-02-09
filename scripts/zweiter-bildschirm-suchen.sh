#!/bin/bash
# Sucht automatisch nach dem zweiten Mac als Bildschirm

echo "🔍 Suche nach verfügbaren AirPlay-Displays..."
echo ""

# Prüfe ob AirPlay verfügbar ist
if command -v dns-sd &> /dev/null; then
    echo "✅ AirPlay-Suche gestartet..."
    echo ""
    echo "📡 Verfügbare Displays werden gesucht..."
    echo "💡 Stelle sicher dass auf dem zweiten Mac 'AirPlay Display' aktiviert ist"
    echo ""
    
    # Suche nach AirPlay-Displays
    dns-sd -B _airplay._tcp local. &
    DNS_PID=$!
    sleep 5
    kill $DNS_PID 2>/dev/null
    
    echo ""
    echo "✅ Suche abgeschlossen"
    echo ""
    echo "💡 Öffne jetzt das AirPlay-Menü in der Menüleiste (oben rechts)"
    echo "   Dort solltest du den zweiten Mac sehen"
    echo ""
else
    echo "⚠️ AirPlay-Tools nicht gefunden"
    echo ""
    echo "💡 Manuelle Methode:"
    echo "   1. Klicke auf das AirPlay-Symbol in der Menüleiste (oben rechts)"
    echo "   2. Wähle den zweiten Mac aus"
    echo ""
fi

# Alternative: Öffne Systemeinstellungen
echo "🔧 Öffne Systemeinstellungen → Displays..."
open "x-apple.systempreferences:com.apple.preference.displays"

echo ""
echo "✅ Systemeinstellungen geöffnet"
echo "💡 Dort kannst du den zweiten Bildschirm einrichten"
