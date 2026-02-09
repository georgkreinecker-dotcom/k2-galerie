#!/bin/bash
# Fix für iCloud Drive Probleme mit K2-Start.command

SOURCE="$HOME/k2Galerie/K2-Start.command"
ICLOUD_DESKTOP="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop"
REAL_DESKTOP="$HOME/Desktop"

echo "🔧 Fixe iCloud Drive Problem..."

# Entferne von iCloud Desktop falls vorhanden
if [ -f "$ICLOUD_DESKTOP/K2-Start.command" ]; then
    echo "🗑️  Entferne von iCloud Desktop..."
    rm -f "$ICLOUD_DESKTOP/K2-Start.command"
fi

# Entferne auch von echtem Desktop falls vorhanden (neu erstellen)
if [ -f "$REAL_DESKTOP/K2-Start.command" ]; then
    echo "🗑️  Entferne alte Version..."
    rm -f "$REAL_DESKTOP/K2-Start.command"
fi

# Kopiere auf echten Desktop
echo "📋 Kopiere auf echten Desktop..."
cp "$SOURCE" "$REAL_DESKTOP/K2-Start.command"
chmod +x "$REAL_DESKTOP/K2-Start.command"

# Entferne ALLE extended attributes
echo "🧹 Entferne extended attributes..."
xattr -cr "$REAL_DESKTOP/K2-Start.command" 2>/dev/null
xattr -d com.apple.quarantine "$REAL_DESKTOP/K2-Start.command" 2>/dev/null
xattr -d com.apple.metadata:kMDItemWhereFroms "$REAL_DESKTOP/K2-Start.command" 2>/dev/null

# Öffne Finder
open "$REAL_DESKTOP"

echo ""
echo "✅ Fertig!"
echo ""
echo "📌 Die Datei liegt jetzt auf dem ECHTEN Desktop (nicht iCloud)"
echo "💡 Du kannst sie jetzt:"
echo "   - Doppelklicken zum Starten"
echo "   - Ins Dock ziehen"
echo ""
echo "⚠️  Falls macOS fragt: 'Öffnen' klicken"
