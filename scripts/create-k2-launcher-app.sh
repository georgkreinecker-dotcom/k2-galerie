#!/bin/bash
# Erstellt eine macOS App die wirklich funktioniert

APP_NAME="K2 Plattform"
APP_PATH="$HOME/Desktop/${APP_NAME}.app"
SCRIPT_CONTENT='#!/bin/bash
cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Server läuft nicht - starte ihn
nohup npm run dev > "$HOME/k2Galerie/server.log" 2>&1 &
SERVER_PID=$!
disown $SERVER_PID 2>/dev/null || true

# Warte auf Server-Start
for i in {1..20}; do
    sleep 1
    for port in 5177 5176 5175 5174 5173; do
        if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
            open "http://127.0.0.1:$port/"
            exit 0
        fi
    fi
done

# Fallback: Öffne Browser trotzdem
open "http://127.0.0.1:5177/"
'

# Erstelle App-Struktur
mkdir -p "$APP_PATH/Contents/MacOS"
mkdir -p "$APP_PATH/Contents/Resources"

# Info.plist
cat > "$APP_PATH/Contents/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>K2-Plattform</string>
    <key>CFBundleIdentifier</key>
    <string>com.k2galerie.plattform</string>
    <key>CFBundleName</key>
    <string>K2 Plattform</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
</dict>
</plist>
EOF

# Executable Script
echo "$SCRIPT_CONTENT" > "$APP_PATH/Contents/MacOS/K2-Plattform"
chmod +x "$APP_PATH/Contents/MacOS/K2-Plattform"

echo "✅ App erstellt: $APP_PATH"
echo "💚 Doppelklick auf 'K2 Plattform.app' öffnet die Plattform"
