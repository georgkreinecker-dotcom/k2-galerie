#!/bin/bash
# Verschiebt K2 Start App vom iCloud Desktop auf echten Desktop und entfernt Quarantäne

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
ICLOUD_DESKTOP="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop"

echo "🔧 Verschiebe App vom iCloud Desktop auf echten Desktop..."

# Suche App
ICLOUD_APP="$ICLOUD_DESKTOP/${APP_NAME}.app"
REAL_APP="$REAL_DESKTOP/${APP_NAME}.app"

# Entferne alte Version vom echten Desktop
if [ -d "$REAL_APP" ]; then
    echo "🗑️  Entferne alte Version vom echten Desktop..."
    rm -rf "$REAL_APP"
fi

# Prüfe ob App im iCloud Drive liegt
if [ -d "$ICLOUD_APP" ]; then
    echo "📦 Gefunden im iCloud Drive: $ICLOUD_APP"
    echo "📋 Verschiebe auf echten Desktop..."
    
    # Verschiebe (nicht kopiere!)
    mv "$ICLOUD_APP" "$REAL_APP" 2>/dev/null || {
        echo "⚠️  Verschieben fehlgeschlagen, kopiere..."
        cp -R "$ICLOUD_APP" "$REAL_APP" 2>/dev/null
        rm -rf "$ICLOUD_APP" 2>/dev/null
    }
    
    echo "✅ App verschoben!"
elif [ -d "$REAL_APP" ]; then
    echo "✅ App liegt bereits auf echtem Desktop"
else
    echo "❌ App nicht gefunden"
    echo "💡 Erstelle neue App..."
    cd "$HOME/k2Galerie" || exit 1
    ./scripts/k2-schoenen-button-erstellen.sh
    exit 0
fi

# Entferne ALLE extended attributes (Quarantäne!)
echo "🧹 Entferne Quarantäne..."
xattr -cr "$REAL_APP" 2>/dev/null
xattr -d com.apple.quarantine "$REAL_APP" 2>/dev/null
xattr -d com.apple.metadata:kMDItemWhereFroms "$REAL_APP" 2>/dev/null
xattr -d com.apple.FinderInfo "$REAL_APP" 2>/dev/null

# Entferne auch von allen Unterdateien
find "$REAL_APP" -exec xattr -cr {} \; 2>/dev/null
find "$REAL_APP" -exec xattr -d com.apple.quarantine {} \; 2>/dev/null

# Stelle sicher dass Script ausführbar ist
chmod +x "$REAL_APP/Contents/MacOS/K2-Start" 2>/dev/null

# Öffne Finder mit echtem Desktop
open "$REAL_DESKTOP"

echo ""
echo "✅ Fertig!"
echo ""
echo "📌 Die App liegt jetzt auf dem ECHTEN Desktop: $REAL_APP"
echo ""
echo "💡 So öffnest du sie:"
echo "   1. Rechtsklick auf 'K2 Start.app'"
echo "   2. 'Öffnen' wählen (nicht Doppelklick!)"
echo "   3. 'Öffnen' bestätigen"
echo ""
echo "🎯 Nach dem ersten Öffnen kannst du sie ins Dock ziehen!"
