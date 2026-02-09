#!/bin/bash
# Repariert App-Icon und Dock: Entfernt Fragezeichen, zeigt richtiges Icon

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
APP_PATH="$REAL_DESKTOP/${APP_NAME}.app"
CONTENTS="$APP_PATH/Contents"
RESOURCES="$CONTENTS/Resources"
INFO_PLIST="$CONTENTS/Info.plist"

echo "🔧 Repariere App-Icon und Dock..."

# Prüfe ob App existiert
if [ ! -d "$APP_PATH" ]; then
    echo "❌ App nicht gefunden!"
    exit 1
fi

# Stelle sicher dass Resources existiert
mkdir -p "$RESOURCES"

# Erstelle Icon falls nicht vorhanden
ICON_SOURCE="$HOME/k2Galerie/public/icon-512.png"
if [ -f "$ICON_SOURCE" ]; then
    echo "📸 Erstelle Icon..."
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
        
        if [ -f "$RESOURCES/k2-icon.icns" ]; then
            echo "✅ Icon erstellt: k2-icon.icns"
        fi
    fi
fi

# Aktualisiere Info.plist mit Icon
echo "📝 Aktualisiere Info.plist..."
if [ -f "$RESOURCES/k2-icon.icns" ]; then
    # Füge CFBundleIconFile hinzu falls nicht vorhanden
    if ! grep -q "CFBundleIconFile" "$INFO_PLIST" 2>/dev/null; then
        # Füge vor </dict> ein
        sed -i '' '/<\/dict>/i\
	<key>CFBundleIconFile</key>\
	<string>k2-icon.icns</string>
' "$INFO_PLIST" 2>/dev/null || {
            # Fallback: Erstelle neue Info.plist
            cat > "$INFO_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleExecutable</key>
	<string>K2-Start</string>
	<key>CFBundleIdentifier</key>
	<string>at.k2galerie.start</string>
	<key>CFBundleName</key>
	<string>${APP_NAME}</string>
	<key>CFBundleVersion</key>
	<string>1.0.0</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>LSMinimumSystemVersion</key>
	<string>10.15</string>
	<key>NSHighResolutionCapable</key>
	<true/>
	<key>CFBundleIconFile</key>
	<string>k2-icon.icns</string>
</dict>
</plist>
EOF
        }
    else
        # Aktualisiere vorhandenes Icon
        sed -i '' 's/<string>k2-icon[^<]*<\/string>/<string>k2-icon.icns<\/string>/g' "$INFO_PLIST" 2>/dev/null || true
    fi
fi

# Entferne Quarantäne komplett
echo "🧹 Entferne Quarantäne..."
xattr -cr "$APP_PATH" 2>/dev/null
xattr -d com.apple.quarantine "$APP_PATH" 2>/dev/null
find "$APP_PATH" -exec xattr -cr {} \; 2>/dev/null
find "$APP_PATH" -exec xattr -d com.apple.quarantine {} \; 2>/dev/null

# Entferne App aus Dock
echo "🗑️  Entferne App aus Dock..."
defaults delete com.apple.dock persistent-apps 2>/dev/null || true
killall Dock
sleep 2

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

# Aktualisiere Finder-Cache für Icon
touch "$APP_PATH"
killall Finder 2>/dev/null || true

echo ""
echo "✅ App-Icon und Dock repariert!"
echo ""
echo "💡 Die App sollte jetzt:"
echo "   - Kein Fragezeichen mehr haben"
echo "   - Das richtige K2-Icon zeigen (nicht Shell)"
echo "   - Funktioniert beim Klick"
echo ""
echo "⏳ Warte 3 Sekunden bis Dock neu geladen ist..."
