#!/bin/bash
# Fix für K2 Start.app - macht sie funktionsfähig

APP_PATH="/Users/georgkreinecker/Desktop/K2 Start.app"
SCRIPT_PATH="$APP_PATH/Contents/MacOS/K2-Start"

echo "🔧 Fixe K2 Start.app..."

# Prüfe ob App existiert
if [ ! -d "$APP_PATH" ]; then
    echo "❌ App nicht gefunden: $APP_PATH"
    echo "💡 Kopiere App vom Projektordner..."
    cp -R "$HOME/k2Galerie/K2 Start.app" "$APP_PATH" 2>/dev/null
fi

# Entferne extended attributes (iCloud-Probleme)
xattr -cr "$APP_PATH" 2>/dev/null

# Stelle sicher dass Script ausführbar ist
if [ -f "$SCRIPT_PATH" ]; then
    chmod +x "$SCRIPT_PATH" 2>/dev/null
    echo "✅ Script-Berechtigungen gesetzt"
else
    echo "❌ Script nicht gefunden"
    exit 1
fi

echo "✅ App sollte jetzt funktionieren!"
echo "💡 Doppelklick zum Testen"
