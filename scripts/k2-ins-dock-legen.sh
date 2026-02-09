#!/bin/bash
# Legt K2-Start.command auf Desktop und öffnet Finder für Dock-Zugriff

SOURCE="$HOME/k2Galerie/K2-Start.command"
DESKTOP="$HOME/Desktop/K2-Start.command"

echo "📋 Lege K2-Start auf Desktop..."

# Kopiere auf Desktop
cp "$SOURCE" "$DESKTOP" 2>/dev/null || {
    echo "⚠️  Konnte nicht auf Desktop kopieren (Berechtigung?)"
    echo "💡 Bitte manuell kopieren: $SOURCE → Desktop"
}

# Stelle sicher dass ausführbar
chmod +x "$DESKTOP" 2>/dev/null

# Entferne extended attributes (iCloud-Probleme)
xattr -cr "$DESKTOP" 2>/dev/null

# Öffne Finder mit Desktop
open "$HOME/Desktop"

echo ""
echo "✅ K2-Start.command ist jetzt auf dem Desktop!"
echo ""
echo "📌 So legst du es ins Dock:"
echo "   1. Ziehe 'K2-Start.command' vom Desktop ins Dock"
echo "   2. Fertig! 💚"
echo ""
echo "💡 Tipp: Du kannst es auch direkt vom Desktop starten (Doppelklick)"
