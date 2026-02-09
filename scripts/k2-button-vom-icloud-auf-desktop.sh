#!/bin/bash
# Verschiebt K2 Start App vom iCloud Drive auf echten Desktop

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
ICLOUD_DESKTOP="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop"

echo "🔧 Verschiebe K2 Start App vom iCloud Drive auf echten Desktop..."

# Prüfe ob App im iCloud Drive liegt
ICLOUD_APP="$ICLOUD_DESKTOP/${APP_NAME}.app"
REAL_APP="$REAL_DESKTOP/${APP_NAME}.app"

if [ -d "$ICLOUD_APP" ]; then
    echo "📦 Gefunden im iCloud Drive: $ICLOUD_APP"
    
    # Entferne von echtem Desktop falls vorhanden
    rm -rf "$REAL_APP" 2>/dev/null
    
    # Verschiebe auf echten Desktop
    echo "📋 Verschiebe auf echten Desktop..."
    mv "$ICLOUD_APP" "$REAL_APP" 2>/dev/null || {
        echo "⚠️  Verschieben fehlgeschlagen, versuche kopieren..."
        cp -R "$ICLOUD_APP" "$REAL_APP" 2>/dev/null
        rm -rf "$ICLOUD_APP" 2>/dev/null
    }
    
    # Entferne extended attributes
    xattr -cr "$REAL_APP" 2>/dev/null
    xattr -d com.apple.quarantine "$REAL_APP" 2>/dev/null
    
    echo "✅ App verschoben!"
elif [ -d "$REAL_APP" ]; then
    echo "✅ App liegt bereits auf echtem Desktop"
else
    echo "❌ App nicht gefunden"
    echo "💡 Erstelle neue App mit: ./scripts/k2-schoenen-button-erstellen.sh"
    exit 1
fi

# Öffne Finder mit echtem Desktop
open "$REAL_DESKTOP"

echo ""
echo "✅ Fertig!"
echo "📌 Die App liegt jetzt auf dem echten Desktop"
echo "💡 Du kannst sie jetzt ins Dock ziehen!"
