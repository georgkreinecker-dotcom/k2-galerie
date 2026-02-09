#!/bin/bash
# Legt K2-Start.command auf den ECHTEN Desktop (nicht iCloud Drive)

SOURCE="$HOME/k2Galerie/K2-Start.command"

# Echter Desktop-Pfad (nicht iCloud Drive)
DESKTOP_PATH="$HOME/Desktop"
DESKTOP_FILE="$DESKTOP_PATH/K2-Start.command"

echo "📋 Lege K2-Start auf echten Desktop..."

# Entferne alte Datei falls vorhanden
rm -f "$DESKTOP_FILE" 2>/dev/null
rm -f "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop/K2-Start.command" 2>/dev/null

# Kopiere auf echten Desktop
cp "$SOURCE" "$DESKTOP_FILE"
chmod +x "$DESKTOP_FILE"

# Entferne ALLE extended attributes (wichtig für iCloud-Probleme)
xattr -cr "$DESKTOP_FILE" 2>/dev/null
xattr -d com.apple.quarantine "$DESKTOP_FILE" 2>/dev/null

# Öffne Finder mit Desktop
open "$DESKTOP_PATH"

echo ""
echo "✅ K2-Start.command ist jetzt auf dem echten Desktop!"
echo ""
echo "📌 So legst du es ins Dock:"
echo "   1. Ziehe 'K2-Start.command' vom Desktop ins Dock"
echo "   2. Falls macOS fragt: 'Öffnen' klicken"
echo "   3. Fertig! 💚"
echo ""
echo "💡 Die Datei sollte jetzt funktionieren!"
