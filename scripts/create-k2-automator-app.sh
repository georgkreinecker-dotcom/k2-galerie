#!/bin/bash
# Erstellt eine Automator-App die die K2 Plattform öffnet

APP_NAME="K2 Plattform"
APP_PATH="$HOME/Desktop/${APP_NAME}.app"
SCRIPT_PATH="$HOME/k2Galerie/scripts/k2-plattform-oeffnen.sh"

# Lösche alte App falls vorhanden
rm -rf "$APP_PATH"

# Erstelle App-Struktur
mkdir -p "$APP_PATH/Contents/MacOS"
mkdir -p "$APP_PATH/Contents/Resources"

# Erstelle Info.plist
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
</dict>
</plist>
EOF

# Erstelle ausführbares Script
cat > "$APP_PATH/Contents/MacOS/K2-Plattform" <<'EOF'
#!/bin/bash
cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Falls kein Server läuft, starte einen
npm run dev > /dev/null 2>&1 &
sleep 4

for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Falls nichts funktioniert, öffne Terminal mit Fehlermeldung
osascript -e 'display dialog "K2 Server konnte nicht gestartet werden. Bitte manuell starten: cd ~/k2Galerie && npm run dev" buttons {"OK"} default button "OK"'
EOF

chmod +x "$APP_PATH/Contents/MacOS/K2-Plattform"

echo "✅ Automator-App erstellt: $APP_PATH"
echo "💡 Doppelklick auf 'K2 Plattform.app' öffnet die Plattform"
