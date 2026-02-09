#!/bin/bash
# Setup für zweiten Mac - Schritt für Schritt

echo "🖥️  Zweiter Mac Setup"
echo ""

# 1. Prüfe aktuelle Netzwerk-Interfaces
echo "📡 Schritt 1: Netzwerk-Interfaces prüfen"
echo ""
echo "Aktuelle IP-Adressen:"
ifconfig | grep -A 2 "inet " | grep -v "127.0.0.1" | grep "inet " | awk '{print "   " $2 " (" $NF ")"}'
echo ""

# 2. Prüfe USB/Thunderbolt Verbindung
echo "🔌 Schritt 2: USB/Thunderbolt Verbindung prüfen"
USB_INTERFACE=$(ifconfig | grep -E "bridge|usb" | head -1 | awk '{print $1}' | tr -d ':')
if [ -n "$USB_INTERFACE" ]; then
    echo "   ✅ USB/Thunderbolt Interface gefunden: $USB_INTERFACE"
    USB_IP=$(ifconfig $USB_INTERFACE | grep "inet " | awk '{print $2}')
    if [ -n "$USB_IP" ]; then
        echo "   📍 IP-Adresse: $USB_IP"
        echo "   🔗 URL für zweiten Mac: http://$USB_IP:5177/"
    else
        echo "   ⚠️  Keine IP-Adresse gefunden - bitte Netzwerk manuell konfigurieren"
    fi
else
    echo "   ⚠️  Kein USB/Thunderbolt Interface gefunden"
    echo "   💡 Verbinde USB-C oder Thunderbolt Kabel zwischen beiden Macs"
fi
echo ""

# 3. Prüfe ob Server läuft
echo "🚀 Schritt 3: Server-Status prüfen"
if lsof -ti:5177 > /dev/null 2>&1; then
    echo "   ✅ Server läuft bereits auf Port 5177"
else
    echo "   ⚠️  Server läuft NICHT"
    echo "   💡 Starte Server mit: cd ~/k2Galerie && npm run dev"
fi
echo ""

# 4. Zeige Anleitung
echo "📋 Schritt 4: Verbindung einrichten"
echo ""
echo "Auf dem HAUPT-MAC (dieser Mac):"
echo "   1. Terminal öffnen"
echo "   2. Server starten: cd ~/k2Galerie && npm run dev"
echo "   3. Warte bis Server läuft"
echo ""
echo "Auf dem ZWEITEN MAC:"
echo "   1. Öffne Browser (Safari/Chrome)"
echo "   2. Gehe zu: http://[IP-ADRESSE]:5177/"
echo "   3. IP-Adresse findest du oben ⬆️"
echo ""
echo "💡 Falls USB-IP nicht gefunden wurde:"
echo "   - Prüfe Systemeinstellungen → Netzwerk"
echo "   - Füge 'USB 10/100 LAN' oder 'Thunderbolt Bridge' hinzu"
echo ""
