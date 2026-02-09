#!/bin/bash
# Deaktiviert alle K2 LaunchAgents

echo "🛑 Deaktiviere K2 LaunchAgents..."
echo ""

# Deaktiviere alle K2 LaunchAgents
for plist in ~/Library/LaunchAgents/com.k2galerie.*.plist; do
    if [ -f "$plist" ]; then
        echo "Deaktiviere: $(basename $plist)"
        launchctl bootout gui/$(id -u) "$plist" 2>/dev/null || launchctl unload "$plist" 2>/dev/null || true
    fi
done

echo ""
echo "✅ Alle K2 LaunchAgents deaktiviert!"
echo ""
echo "💡 LaunchAgents werden NICHT mehr beim Start ausgeführt"
echo "🔧 Zum Aktivieren: launchctl load ~/Library/LaunchAgents/com.k2galerie.*.plist"
