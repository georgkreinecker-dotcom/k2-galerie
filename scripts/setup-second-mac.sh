#!/bin/bash
# Setup für zweiten Mac als Display/Hilfsrechner

echo "🖥️  Setup für zweiten Mac als Display/Hilfsrechner"
echo ""
echo "Optionen:"
echo ""
echo "1️⃣  AirPlay Display (wenn beide Macs im selben Netzwerk):"
echo "   - Auf dem zweiten Mac: Systemeinstellungen → Displays → AirPlay Display aktivieren"
echo "   - Auf diesem Mac: AirPlay-Menü → zweiten Mac auswählen"
echo ""
echo "2️⃣  Sidecar (wenn einer ein iPad/Mac ist):"
echo "   - Systemeinstellungen → Displays → Sidecar"
echo ""
echo "3️⃣  Physische Verbindung (Thunderbolt/USB-C):"
echo "   - Kabel verbinden → Systemeinstellungen → Displays → Arrangement"
echo ""
echo "4️⃣  Screen Sharing (Remote-Zugriff):"
echo "   - Auf dem zweiten Mac: Systemeinstellungen → Freigaben → Bildschirmfreigabe aktivieren"
echo "   - Auf diesem Mac: Finder → Gehe zu → Mit Server verbinden → vnc://[IP-Adresse]"
echo ""

# Prüfe ob AirPlay verfügbar ist
if system_profiler SPDisplaysDataType | grep -q "AirPlay"; then
    echo "✅ AirPlay Display ist verfügbar"
else
    echo "⚠️  AirPlay Display nicht verfügbar (möglicherweise nicht unterstützt)"
fi

# Prüfe Netzwerk
echo ""
echo "📡 Netzwerk-Info:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -3

echo ""
echo "💡 Tipp: Für K2-Projekt kannst du den zweiten Mac als:"
echo "   - Zweiten Bildschirm für mehr Übersicht nutzen"
echo "   - Dedizierten Server für Dev-Server verwenden"
echo "   - Test-Gerät für Mobile-Connect nutzen"
