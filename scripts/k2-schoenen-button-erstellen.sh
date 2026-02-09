#!/bin/bash
# Erstellt einen schönen K2 Start Button als App

APP_NAME="K2 Start"

# Echter Desktop-Pfad (nicht iCloud Drive)
REAL_DESKTOP="$HOME/Desktop"
ICLOUD_DESKTOP="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop"

# Verwende echten Desktop
APP_DIR="$REAL_DESKTOP/${APP_NAME}.app"
CONTENTS="$APP_DIR/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

echo "🎨 Erstelle schönen K2 Start Button..."
echo "📌 Lege App auf ECHTEN Desktop (nicht iCloud)..."

# Lösche alte App falls vorhanden (sowohl von echtem als auch iCloud Desktop)
rm -rf "$APP_DIR" 2>/dev/null
rm -rf "$ICLOUD_DESKTOP/${APP_NAME}.app" 2>/dev/null

# Erstelle App-Struktur
mkdir -p "$MACOS" "$RESOURCES"

# Info.plist mit schönem Icon
cat > "$CONTENTS/Info.plist" <<EOF
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
	<string>k2-icon</string>
</dict>
</plist>
EOF

# Launcher-Script (ruft START-K2.sh auf)
cat > "$MACOS/K2-Start" <<'EOFSCRIPT'
#!/bin/bash
# K2 Start Button - Ruft START-K2.sh auf

# Logging für Debugging
LOG_FILE="$HOME/k2-start-app.log"
echo "$(date): K2 Start App wurde gestartet" >> "$LOG_FILE" 2>&1

# Wechsle ins Projektverzeichnis
cd "$HOME/k2Galerie" || {
    ERROR_MSG="Fehler: K2 Projektordner nicht gefunden!"
    echo "$(date): $ERROR_MSG" >> "$LOG_FILE" 2>&1
    osascript -e "display dialog \"$ERROR_MSG\" buttons {\"OK\"} default button 1" 2>&1
    exit 1
}

echo "$(date): Projektordner gefunden: $(pwd)" >> "$LOG_FILE" 2>&1

# Prüfe ob START-K2.sh existiert
if [ ! -f "./START-K2.sh" ]; then
    ERROR_MSG="Fehler: START-K2.sh nicht gefunden!"
    echo "$(date): $ERROR_MSG" >> "$LOG_FILE" 2>&1
    osascript -e "display dialog \"$ERROR_MSG\" buttons {\"OK\"} default button 1" 2>&1
    exit 1
fi

echo "$(date): START-K2.sh gefunden, starte..." >> "$LOG_FILE" 2>&1

# Führe START-K2.sh aus
exec bash "./START-K2.sh" >> "$LOG_FILE" 2>&1
EOFSCRIPT

chmod +x "$MACOS/K2-Start"

# Erstelle Icon mit verschiedenen Größen
ICON_SOURCE="$HOME/k2Galerie/public/icon-512.png"
if [ -f "$ICON_SOURCE" ]; then
    echo "📸 Erstelle Icon aus vorhandenem K2 Logo..."
    
    # Erstelle .iconset für verschiedene Größen
    ICONSET="$RESOURCES/k2-icon.iconset"
    mkdir -p "$ICONSET"
    
    if command -v sips >/dev/null 2>&1 && command -v iconutil >/dev/null 2>&1; then
        # Erstelle verschiedene Icon-Größen
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
        
        # Konvertiere zu .icns
        iconutil -c icns "$ICONSET" -o "$RESOURCES/k2-icon.icns" 2>/dev/null
        rm -rf "$ICONSET" 2>/dev/null
        
        # Aktualisiere Info.plist für .icns
        if [ -f "$RESOURCES/k2-icon.icns" ]; then
            sed -i '' 's/<string>k2-icon<\/string>/<string>k2-icon.icns<\/string>/g' "$CONTENTS/Info.plist" 2>/dev/null || true
        fi
    fi
    
    # Fallback: Kopiere PNG
    cp "$ICON_SOURCE" "$RESOURCES/k2-icon.png" 2>/dev/null
else
    echo "💡 Verwende Standard-Icon..."
fi

# Entferne extended attributes (wichtig für iCloud-Probleme)
xattr -cr "$APP_DIR" 2>/dev/null
xattr -d com.apple.quarantine "$APP_DIR" 2>/dev/null
xattr -d com.apple.metadata:kMDItemWhereFroms "$APP_DIR" 2>/dev/null

# Öffne Finder mit echtem Desktop
open "$REAL_DESKTOP"

echo ""
echo "✅ Schöner K2 Start Button erstellt!"
echo ""
echo "📌 Die App liegt jetzt auf dem ECHTEN Desktop: ${APP_NAME}.app"
echo "   Pfad: $APP_DIR"
echo ""
echo "💡 Du kannst sie jetzt:"
echo "   - Doppelklicken zum Starten"
echo "   - Ins Dock ziehen (vom echten Desktop, nicht iCloud)"
echo "   - Rechtsklick → 'Im Finder anzeigen' für weitere Optionen"
echo ""
echo "⚠️  Wichtig: Die App liegt auf dem lokalen Desktop, nicht im iCloud Drive"
echo "🎨 Die App sieht jetzt wie ein richtiger Button aus!"
