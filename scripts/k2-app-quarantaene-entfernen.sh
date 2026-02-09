#!/bin/bash
# Entfernt Quarantäne von K2 Start App damit sie funktioniert

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
APP_PATH="$REAL_DESKTOP/${APP_NAME}.app"

echo "🔓 Entferne Quarantäne von K2 Start App..."

# Prüfe ob App existiert
if [ ! -d "$APP_PATH" ]; then
    echo "❌ App nicht gefunden!"
    echo "💡 Erstelle sie neu..."
    cd "$HOME/k2Galerie" || exit 1
    ./scripts/k2-schoenen-button-erstellen.sh
    APP_PATH="$REAL_DESKTOP/${APP_NAME}.app"
fi

# Entferne ALLE extended attributes (wichtig!)
echo "🧹 Entferne alle extended attributes..."
xattr -cr "$APP_PATH" 2>/dev/null
xattr -d com.apple.quarantine "$APP_PATH" 2>/dev/null
xattr -d com.apple.metadata:kMDItemWhereFroms "$APP_PATH" 2>/dev/null
xattr -d com.apple.FinderInfo "$APP_PATH" 2>/dev/null

# Entferne auch von allen Unterdateien
find "$APP_PATH" -exec xattr -cr {} \; 2>/dev/null
find "$APP_PATH" -exec xattr -d com.apple.quarantine {} \; 2>/dev/null

# Stelle sicher dass Script ausführbar ist
chmod +x "$APP_PATH/Contents/MacOS/K2-Start" 2>/dev/null

# Öffne App über AppleScript (umgeht Quarantäne-Dialog)
echo "🚀 Teste App-Öffnung..."
osascript <<APPLESCRIPT
tell application "Finder"
    set appPath to POSIX file "$APP_PATH"
    try
        open appPath
        display dialog "✅ App sollte jetzt geöffnet werden!" buttons {"OK"} default button 1
    on error errMsg
        display dialog "⚠️ Fehler beim Öffnen: " & errMsg buttons {"OK"} default button 1
    end try
end tell
APPLESCRIPT

echo ""
echo "✅ Quarantäne entfernt!"
echo ""
echo "💡 Falls macOS immer noch fragt:"
echo "   1. Rechtsklick auf 'K2 Start.app'"
echo "   2. 'Öffnen' wählen"
echo "   3. 'Öffnen' bestätigen"
echo ""
echo "📌 Nach dem ersten Öffnen funktioniert es dann immer!"
