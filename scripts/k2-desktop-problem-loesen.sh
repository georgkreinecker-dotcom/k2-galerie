#!/bin/bash
# Löst Desktop/iCloud Drive Problem - findet App und legt sie richtig hin

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
ICLOUD_DESKTOP="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop"

echo "🔍 Suche nach K2 Start App..."

# Suche an verschiedenen Orten
LOCATIONS=(
    "$REAL_DESKTOP/${APP_NAME}.app"
    "$ICLOUD_DESKTOP/${APP_NAME}.app"
    "$HOME/Desktop/${APP_NAME}.app"
)

FOUND_APP=""

for location in "${LOCATIONS[@]}"; do
    if [ -d "$location" ]; then
        echo "✅ Gefunden: $location"
        FOUND_APP="$location"
        break
    fi
done

if [ -z "$FOUND_APP" ]; then
    echo "❌ App nicht gefunden"
    echo "💡 Erstelle neue App..."
    cd "$HOME/k2Galerie" || exit 1
    ./scripts/k2-schoenen-button-erstellen.sh
    exit 0
fi

# Prüfe ob auf echtem Desktop
if [[ "$FOUND_APP" == "$REAL_DESKTOP"* ]]; then
    echo "✅ App liegt bereits auf echtem Desktop"
    TARGET="$REAL_DESKTOP/${APP_NAME}.app"
else
    echo "📦 App liegt im iCloud Drive, verschiebe auf echten Desktop..."
    TARGET="$REAL_DESKTOP/${APP_NAME}.app"
    
    # Entferne alte Version falls vorhanden
    rm -rf "$TARGET" 2>/dev/null
    
    # Verschiebe
    mv "$FOUND_APP" "$TARGET" 2>/dev/null || {
        echo "⚠️  Verschieben fehlgeschlagen, kopiere..."
        cp -R "$FOUND_APP" "$TARGET" 2>/dev/null
        rm -rf "$FOUND_APP" 2>/dev/null
    }
fi

# Entferne extended attributes
echo "🧹 Entferne extended attributes..."
xattr -cr "$TARGET" 2>/dev/null
xattr -d com.apple.quarantine "$TARGET" 2>/dev/null
xattr -d com.apple.metadata:kMDItemWhereFroms "$TARGET" 2>/dev/null

# Stelle sicher dass ausführbar
chmod +x "$TARGET/Contents/MacOS/K2-Start" 2>/dev/null

# Öffne Finder mit echtem Desktop
open "$REAL_DESKTOP"

echo ""
echo "✅ Fertig!"
echo ""
echo "📌 Die App liegt jetzt hier: $TARGET"
echo ""
echo "💡 So findest du sie:"
echo "   1. Finder öffnen"
echo "   2. Im Seitenleiste: 'Desktop' klicken (nicht iCloud Drive)"
echo "   3. Oder: Cmd+Shift+D für Desktop-Ordner"
echo ""
echo "🎯 Du kannst sie jetzt ins Dock ziehen!"
