#!/bin/bash
# Legt K2-Start.command auf den Desktop

SOURCE="$HOME/k2Galerie/K2-Start.command"
DESKTOP="$HOME/Desktop/K2-Start.command"

echo "📋 Kopiere K2-Start auf Desktop..."

# Kopiere auf Desktop
cp "$SOURCE" "$DESKTOP"
chmod +x "$DESKTOP"

# Entferne extended attributes (iCloud-Probleme)
xattr -cr "$DESKTOP" 2>/dev/null

echo "✅ K2-Start.command ist jetzt auf dem Desktop!"
echo "💡 Doppelklick zum Starten"
