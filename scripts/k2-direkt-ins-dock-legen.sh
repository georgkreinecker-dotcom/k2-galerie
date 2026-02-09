#!/bin/bash
# Legt K2 Start direkt ins Dock (ohne manuelles Ziehen)

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
APP_PATH="$REAL_DESKTOP/${APP_NAME}.app"

echo "🚀 Lege K2 Start direkt ins Dock..."

# Prüfe ob App existiert
if [ ! -d "$APP_PATH" ]; then
    echo "❌ App nicht gefunden, erstelle sie..."
    cd "$HOME/k2Galerie" || exit 1
    ./scripts/k2-schoenen-button-erstellen.sh
fi

# Entferne extended attributes
xattr -cr "$APP_PATH" 2>/dev/null
xattr -d com.apple.quarantine "$APP_PATH" 2>/dev/null

# Füge ins Dock hinzu über defaults
echo "📌 Füge App ins Dock hinzu..."

# Erstelle Dock-Eintrag
DOCK_ENTRY=$(cat <<EOF
<dict>
    <key>tile-data</key>
    <dict>
        <key>file-data</key>
        <dict>
            <key>_CFURLString</key>
            <string>file://$APP_PATH</string>
            <key>_CFURLStringType</key>
            <integer>0</integer>
        </dict>
    </dict>
</dict>
EOF
)

# Füge zum Dock hinzu
defaults write com.apple.dock persistent-apps -array-add "$DOCK_ENTRY"

# Starte Dock neu
killall Dock

echo ""
echo "✅ K2 Start wurde ins Dock gelegt!"
echo "💡 Du siehst es jetzt im Dock"
