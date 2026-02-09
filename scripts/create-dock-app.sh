#!/bin/bash
# Erstellt eine moderne macOS App für die K2 Plattform

APP_NAME="K2 Plattform"
APP_PATH="$HOME/Desktop/${APP_NAME}.app"
CONTENTS="$APP_PATH/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

# Erstelle App-Struktur
mkdir -p "$MACOS" "$RESOURCES"

# Info.plist mit modernem Design
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
    <key>CFBundleIconFile</key>
    <string>icon.icns</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSUIElement</key>
    <false/>
</dict>
</plist>
EOF

# Launcher-Script
cat > "$MACOS/K2-Plattform" <<'EOFSCRIPT'
#!/bin/bash
# Öffne K2 Plattform im Browser
URL="http://localhost:5177/"

# Prüfe ob Server läuft, sonst starte ihn
if ! curl -s "$URL" > /dev/null 2>&1; then
    # Starte Dev-Server im Hintergrund
    cd "$HOME/k2Galerie" 2>/dev/null || cd "/Users/georgkreinecker/k2Galerie" 2>/dev/null || exit 1
    export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
    nohup npm run dev > /dev/null 2>&1 &
    sleep 3
fi

# Öffne Browser
open "$URL"
EOFSCRIPT

chmod +x "$MACOS/K2-Plattform"

# Erstelle einfaches Icon (SVG zu PNG konvertieren)
# Für jetzt verwenden wir das Standard-Icon, aber die Struktur ist da

echo "✅ ${APP_NAME}.app erstellt in: $APP_PATH"
echo ""
echo "📌 Nächste Schritte:"
echo "1. Ziehe die App aus dem Applications-Ordner ins Dock"
echo "2. Oder: Rechtsklick → 'Im Dock behalten'"
echo ""
echo "Die App öffnet automatisch http://localhost:5177/"
