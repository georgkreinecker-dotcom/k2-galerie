#!/bin/bash
# Vollständiges Setup für zweiten Mac-Verbindung

echo "🔗 Vollständiges Setup für zweiten Mac"
echo "========================================"
echo ""

# IP-Adresse finden
LOCAL_IP="192.168.0.27"  # Aus Dev-Server Output
echo "📡 Deine IP-Adresse: $LOCAL_IP"
echo ""

echo "✅ Was bereits läuft:"
echo "   - K2 Dev-Server: http://$LOCAL_IP:5177/"
echo "   - Erreichbar von anderen Geräten im Netzwerk"
echo ""

echo "📋 Manuelle Schritte (die ich nicht automatisch machen kann):"
echo ""
echo "1️⃣  AIRPLAY DISPLAY (Empfohlen für zweiten Bildschirm):"
echo "   Auf dem zweiten Mac:"
echo "   → Systemeinstellungen → Displays"
echo "   → 'AirPlay Display' aktivieren"
echo "   → Optional: 'Code erforderlich' für Sicherheit"
echo ""
echo "   Auf diesem Mac:"
echo "   → AirPlay-Menü (oben rechts in der Menüleiste) öffnen"
echo "   → Zweiten Mac auswählen"
echo "   → Fertig! Zweiter Bildschirm aktiv"
echo ""

echo "2️⃣  SCREEN SHARING (Remote-Zugriff):"
echo "   Auf dem zweiten Mac:"
echo "   → Systemeinstellungen → Freigaben"
echo "   → 'Bildschirmfreigabe' aktivieren"
echo "   → IP-Adresse notieren"
echo ""
echo "   Auf diesem Mac:"
echo "   → Finder → 'Gehe zu' → 'Mit Server verbinden'"
echo "   → Eingeben: vnc://[IP-des-zweiten-Macs]"
echo "   → Verbinden"
echo ""

echo "3️⃣  K2 PLATTFORM AUF ZWEITEM MAC ÖFFNEN:"
echo "   → Browser auf dem zweiten Mac öffnen"
echo "   → URL eingeben: http://$LOCAL_IP:5177/"
echo "   → K2 Plattform sollte sich öffnen"
echo ""

echo "4️⃣  MOBILE-CONNECT FÜR ZWEITEN MAC:"
echo "   → Auf diesem Mac: Mobile-Connect Seite öffnen"
echo "   → URL ändern zu: http://$LOCAL_IP:5177/"
echo "   → QR-Code scannen mit dem zweiten Mac (oder iPhone/iPad)"
echo ""

echo "💡 Tipps:"
echo "   - AirPlay Display = zweiter Bildschirm (wie physischer Monitor)"
echo "   - Screen Sharing = Remote-Zugriff (wie TeamViewer)"
echo "   - Beide können gleichzeitig genutzt werden!"
echo ""

echo "🔧 Troubleshooting:"
echo "   Falls Verbindung nicht funktioniert:"
echo "   - Beide Macs im selben WLAN?"
echo "   - Firewall blockiert? Systemeinstellungen → Sicherheit → Firewall"
echo "   - Port 5177 freigegeben? (Vite läuft bereits im Netzwerk-Modus)"
echo ""
