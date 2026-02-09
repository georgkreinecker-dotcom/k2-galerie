#!/bin/bash
# Fügt K2 Plattform App zum Dock hinzu

APP_PATH="/Users/georgkreinecker/Desktop/K2 Plattform.app"

if [ ! -d "$APP_PATH" ]; then
    echo "❌ App nicht gefunden: $APP_PATH"
    exit 1
fi

echo "📌 Füge K2 Plattform zum Dock hinzu..."

# macOS Dock-Eintrag hinzufügen
defaults write com.apple.dock persistent-apps -array-add "<dict><key>tile-data</key><dict><key>file-data</key><dict><key>_CFURLString</key><string>$APP_PATH</string><key>_CFURLStringType</key><integer>0</integer></dict></dict></dict>"

# Dock neu laden
killall Dock

echo "✅ App zum Dock hinzugefügt!"
echo "💡 Falls sie nicht erscheint, ziehe die App manuell ins Dock"
