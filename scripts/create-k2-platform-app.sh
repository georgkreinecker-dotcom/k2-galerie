#!/bin/bash
# Erstellt K2 Plattform App neu auf dem Desktop

APP_NAME="K2 Plattform"
DESKTOP="/Users/georgkreinecker/Desktop"
APP_DIR="$DESKTOP/${APP_NAME}.app"
CONTENTS="$APP_DIR/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

echo "🔨 Erstelle ${APP_NAME}.app neu..."

# Lösche alte App falls vorhanden
rm -rf "$APP_DIR" 2>/dev/null

# Erstelle App-Struktur
mkdir -p "$MACOS" "$RESOURCES"

# Info.plist
cat > "$CONTENTS/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleExecutable</key>
	<string>K2-Plattform</string>
	<key>CFBundleIdentifier</key>
	<string>at.k2galerie.plattform</string>
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
cat > "$MACOS/K2-Plattform" <<'EOFSCRIPT'
#!/bin/bash
cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe verschiedene Ports
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        open "http://localhost:$port/"
        exit 0
    fi
done

# Falls kein Server läuft, starte einen
npm run dev > /dev/null 2>&1 &
sleep 4
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        open "http://localhost:$port/"
        exit 0
    fi
done
EOFSCRIPT

chmod +x "$MACOS/K2-Plattform"

echo "✅ ${APP_NAME}.app erstellt in: $APP_DIR"
echo ""
echo "📌 Nächste Schritte:"
echo "1. App sollte jetzt auf dem Desktop sichtbar sein"
echo "2. Ziehe sie ins Dock für schnellen Zugriff"
echo "3. Doppelklick zum Öffnen"
