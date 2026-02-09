#!/bin/bash
# Automatisches Setup für zweiten Mac-Verbindung

echo "🔗 Verbinde zweiten Mac..."
echo ""

# 1. Zeige Netzwerk-Info
echo "📡 Netzwerk-Informationen:"
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || ipconfig getifaddr en2 2>/dev/null || echo "Nicht gefunden")
echo "   Lokale IP: $LOCAL_IP"
echo ""

# 2. Prüfe Screen Sharing Status
echo "🖥️  Screen Sharing:"
if [ -f /System/Library/CoreServices/RemoteManagement.app ]; then
    echo "   Verfügbar - aktiviere..."
    sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart -activate -configure -access -on -restart -agent -privs -all 2>/dev/null || echo "   Bitte manuell aktivieren: Systemeinstellungen → Freigaben → Bildschirmfreigabe"
else
    echo "   Nicht verfügbar"
fi
echo ""

# 3. Prüfe AirPlay
echo "📺 AirPlay Display:"
defaults read com.apple.controlcenter.plist AirplayRecieverEnabled 2>/dev/null && echo "   Aktiviert" || echo "   Bitte aktivieren: Systemeinstellungen → Displays → AirPlay Display"
echo ""

# 4. Dev-Server Info
echo "🚀 K2 Dev-Server:"
echo "   Läuft auf: http://$LOCAL_IP:5177/"
echo "   Auf dem zweiten Mac öffnen: http://$LOCAL_IP:5177/"
echo ""

# 5. VNC Zugriff
echo "🔐 VNC Zugriff:"
echo "   Auf dem zweiten Mac: Finder → Gehe zu → Mit Server verbinden"
echo "   URL: vnc://$LOCAL_IP"
echo ""

# 6. Firewall prüfen
echo "🔥 Firewall:"
FIREWALL_STATUS=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null | grep -i "enabled" || echo "Unbekannt")
echo "   Status: $FIREWALL_STATUS"
echo ""

echo "✅ Setup abgeschlossen!"
echo ""
echo "📌 Nächste Schritte:"
echo "1. Auf dem zweiten Mac: Systemeinstellungen → Displays → AirPlay Display aktivieren"
echo "2. Oder: VNC mit vnc://$LOCAL_IP verbinden"
echo "3. K2 öffnen: http://$LOCAL_IP:5177/"
