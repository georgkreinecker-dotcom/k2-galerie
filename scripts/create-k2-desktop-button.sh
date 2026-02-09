#!/bin/bash
# Erstellt funktionierenden K2 Desktop-Button

APP_NAME="K2 Start"
APP_DIR="$HOME/k2Galerie/${APP_NAME}.app"
CONTENTS="$APP_DIR/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

echo "🔨 Erstelle ${APP_NAME}.app..."

# Lösche alte App
rm -rf "$APP_DIR" 2>/dev/null

# Erstelle Struktur
mkdir -p "$MACOS" "$RESOURCES"

# Info.plist
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
</dict>
</plist>
EOF

# Launcher-Script
cat > "$MACOS/K2-Start" <<'EOFSCRIPT'
#!/bin/bash
cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        open "http://localhost:$port/"
        exit 0
    fi
done

# Falls kein Server läuft, öffne Terminal und starte Server
osascript <<APPLESCRIPT
tell application "Terminal"
    activate
    do script "cd ~/k2Galerie && export PATH=\"\$HOME/.local/node-v20.19.0-darwin-x64/bin:\$PATH\" && npm run dev"
end tell
delay 5
tell application "System Events"
    open location "http://localhost:5177/"
end tell
APPLESCRIPT

EOFSCRIPT

chmod +x "$MACOS/K2-Start"

echo "✅ ${APP_NAME}.app erstellt!"
echo "📌 App sollte jetzt auf dem Desktop sichtbar sein"
echo "💡 Doppelklick öffnet Terminal + Browser"
