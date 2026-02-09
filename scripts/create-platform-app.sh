#!/bin/bash
# Erstellt moderne K2 Plattform App für Dock

APP_NAME="K2 Plattform"
APP_DIR="$HOME/k2Galerie/${APP_NAME}.app"
DESKTOP="$HOME/Desktop"

# Erstelle App-Struktur
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources"

# Info.plist
cat > "${APP_DIR}/Contents/Info.plist" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleExecutable</key>
	<string>K2-Plattform</string>
	<key>CFBundleIdentifier</key>
	<string>at.k2galerie.plattform</string>
	<key>CFBundleName</key>
	<string>K2 Plattform</string>
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
cat > "${APP_DIR}/Contents/MacOS/K2-Plattform" <<'EOFSCRIPT'
#!/bin/bash
cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server läuft
if ! curl -s http://localhost:5177 > /dev/null 2>&1; then
    npm run dev > /dev/null 2>&1 &
    sleep 3
fi

# Öffne Browser
open "http://localhost:5177/"
EOFSCRIPT

chmod +x "${APP_DIR}/Contents/MacOS/K2-Plattform"

# Kopiere auf Desktop (falls möglich)
if [ -w "$DESKTOP" ]; then
    cp -R "${APP_DIR}" "${DESKTOP}/" 2>/dev/null && echo "✅ App auf Desktop kopiert"
else
    echo "⚠️  App erstellt in: $APP_DIR"
    echo "   Bitte manuell auf Desktop kopieren"
fi

echo ""
echo "✅ ${APP_NAME}.app erstellt!"
echo "📌 Ziehe die App ins Dock, um sie dort zu behalten"
