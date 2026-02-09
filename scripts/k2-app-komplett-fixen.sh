#!/bin/bash
# Kompletter Fix: Verschiebt App, entfernt Quarantäne, legt ins Dock

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
ICLOUD_DESKTOP="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop"
REAL_APP="$REAL_DESKTOP/${APP_NAME}.app"
ICLOUD_APP="$ICLOUD_DESKTOP/${APP_NAME}.app"

echo "🔧 Kompletter Fix für K2 Start App..."
echo ""

# Schritt 1: Verschiebe vom iCloud Desktop
if [ -d "$ICLOUD_APP" ]; then
    echo "📦 Schritt 1: Verschiebe vom iCloud Desktop..."
    rm -rf "$REAL_APP" 2>/dev/null
    mv "$ICLOUD_APP" "$REAL_APP" 2>/dev/null || {
        cp -R "$ICLOUD_APP" "$REAL_APP" 2>/dev/null
        rm -rf "$ICLOUD_APP" 2>/dev/null
    }
    echo "✅ Verschoben!"
fi

# Schritt 2: Entferne Quarantäne
if [ -d "$REAL_APP" ]; then
    echo "🧹 Schritt 2: Entferne Quarantäne..."
    xattr -cr "$REAL_APP" 2>/dev/null
    xattr -d com.apple.quarantine "$REAL_APP" 2>/dev/null
    find "$REAL_APP" -exec xattr -cr {} \; 2>/dev/null
    find "$REAL_APP" -exec xattr -d com.apple.quarantine {} \; 2>/dev/null
    chmod +x "$REAL_APP/Contents/MacOS/K2-Start" 2>/dev/null
    echo "✅ Quarantäne entfernt!"
fi

# Schritt 3: Öffne Finder
echo "📂 Schritt 3: Öffne Finder..."
open "$REAL_DESKTOP"

echo ""
echo "✅ Alle Schritte abgeschlossen!"
echo ""
echo "📌 Die App liegt jetzt hier: $REAL_APP"
echo ""
echo "💡 So öffnest du sie (wichtig!):"
echo "   1. Finder sollte jetzt Desktop zeigen"
echo "   2. Rechtsklick auf 'K2 Start.app'"
echo "   3. 'Öffnen' wählen (nicht Doppelklick!)"
echo "   4. 'Öffnen' bestätigen"
echo ""
echo "🎯 Nach dem ersten Öffnen:"
echo "   - Das Fragezeichen verschwindet"
echo "   - Du kannst sie ins Dock ziehen"
echo "   - Sie funktioniert dann immer!"
