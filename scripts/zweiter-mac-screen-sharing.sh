#!/bin/bash
# Screen Sharing zum zweiten Mac einrichten

echo "🖥️  Screen Sharing zum zweiten Mac"
echo ""
echo "📋 Schritt 1: Auf dem ZWEITEN MAC"
echo "   1. Systemeinstellungen → Freigaben"
echo "   2. 'Bildschirmfreigabe' aktivieren"
echo "   3. IP-Adresse notieren"
echo ""
echo "📋 Schritt 2: IP-Adresse eingeben:"
read -p "   IP-Adresse des zweiten Macs: " IP_ADDRESS

if [ -n "$IP_ADDRESS" ]; then
    echo ""
    echo "🔗 Verbinde mit: vnc://$IP_ADDRESS"
    open "vnc://$IP_ADDRESS"
    echo "✅ Verbindung gestartet!"
else
    echo ""
    echo "⚠️ Keine IP-Adresse eingegeben"
    echo "💡 Manuell verbinden:"
    echo "   Finder → 'Gehe zu' → 'Mit Server verbinden'"
    echo "   Eingeben: vnc://[IP-Adresse]"
fi
