#!/bin/bash
# Repariert Dock-Icon: Entfernt Fragezeichen und stellt Icon richtig dar

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
APP_PATH="$REAL_DESKTOP/${APP_NAME}.app"

echo "🔧 Repariere Dock-Icon..."

# Prüfe ob App existiert
if [ ! -d "$APP_PATH" ]; then
    echo "❌ App nicht gefunden!"
    exit 1
fi

# Entferne App aus Dock (falls vorhanden)
echo "🗑️  Entferne alte App aus Dock..."
defaults delete com.apple.dock persistent-apps 2>/dev/null || true
killall Dock
sleep 2

# Entferne ALLE Quarantäne-Attribute
echo "🧹 Entferne Quarantäne komplett..."
xattr -cr "$APP_PATH" 2>/dev/null
xattr -d com.apple.quarantine "$APP_PATH" 2>/dev/null
find "$APP_PATH" -exec xattr -cr {} \; 2>/dev/null
find "$APP_PATH" -exec xattr -d com.apple.quarantine {} \; 2>/dev/null

# Stelle sicher dass Icon vorhanden ist
ICON_SOURCE="$HOME/k2Galerie/public/icon-512.png"
RESOURCES="$APP_PATH/Contents/Resources"

if [ -f "$ICON_SOURCE" ] && [ ! -f "$RESOURCES/k2-icon.icns" ]; then
    echo "📸 Erstelle Icon neu..."
    ICONSET="$RESOURCES/k2-icon.iconset"
    mkdir -p "$ICONSET"
    
    if command -v sips >/dev/null 2>&1 && command -v iconutil >/dev/null 2>&1; then
        sips -z 16 16 "$ICON_SOURCE" --out "$ICONSET/icon_16x16.png" 2>/dev/null
        sips -z 32 32 "$ICON_SOURCE" --out "$ICONSET/icon_16x16@2x.png" 2>/dev/null
        sips -z 32 32 "$ICON_SOURCE" --out "$ICONSET/icon_32x32.png" 2>/dev/null
        sips -z 64 64 "$ICON_SOURCE" --out "$ICONSET/icon_32x32@2x.png" 2>/dev/null
        sips -z 128 128 "$ICON_SOURCE" --out "$ICONSET/icon_128x128.png" 2>/dev/null
        sips -z 256 256 "$ICON_SOURCE" --out "$ICONSET/icon_128x128@2x.png" 2>/dev/null
        sips -z 256 256 "$ICON_SOURCE" --out "$ICONSET/icon_256x256.png" 2>/dev/null
        sips -z 512 512 "$ICON_SOURCE" --out "$ICONSET/icon_256x256@2x.png" 2>/dev/null
        sips -z 512 512 "$ICON_SOURCE" --out "$ICONSET/icon_512x512.png" 2>/dev/null
        sips -z 1024 1024 "$ICON_SOURCE" --out "$ICONSET/icon_512x512@2x.png" 2>/dev/null
        
        iconutil -c icns "$ICONSET" -o "$RESOURCES/k2-icon.icns" 2>/dev/null
        rm -rf "$ICONSET" 2>/dev/null
    fi
fi

# Aktualisiere Info.plist für Icon
if [ -f "$RESOURCES/k2-icon.icns" ]; then
    sed -i '' 's/<string>k2-icon<\/string>/<string>k2-icon.icns<\/string>/g' "$APP_PATH/Contents/Info.plist" 2>/dev/null || true
fi

# Lege App neu ins Dock
echo "📌 Lege App neu ins Dock..."
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

defaults write com.apple.dock persistent-apps -array-add "$DOCK_ENTRY"

# Starte Dock neu
killall Dock

echo ""
echo "✅ Dock-Icon repariert!"
echo ""
echo "💡 Die App sollte jetzt:"
echo "   - Kein Fragezeichen mehr haben"
echo "   - Das richtige K2-Icon zeigen"
echo "   - Funktioniert beim Klick"
echo ""
echo "⏳ Warte 2 Sekunden bis Dock neu geladen ist..."
