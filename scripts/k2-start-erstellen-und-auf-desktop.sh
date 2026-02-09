#!/bin/bash
# Erstellt K2-Start.command und legt es auf Desktop

K2_DIR="$HOME/k2Galerie"
SOURCE="$K2_DIR/K2-Start.command"
DESKTOP="$HOME/Desktop/K2-Start.command"

echo "🔨 Erstelle K2-Start.command..."

# Erstelle die Datei falls sie nicht existiert
if [ ! -f "$SOURCE" ]; then
    cat > "$SOURCE" <<'EOF'
#!/bin/bash
# K2 Start - Desktop-Befehl
# Ruft START-K2.sh auf

cd "$HOME/k2Galerie" || exit 1
./START-K2.sh
EOF
    chmod +x "$SOURCE"
    echo "✅ K2-Start.command erstellt"
else
    echo "✅ K2-Start.command existiert bereits"
fi

# Entferne extended attributes
xattr -cr "$SOURCE" 2>/dev/null

# Kopiere auf Desktop
echo "📋 Kopiere auf Desktop..."
cp "$SOURCE" "$DESKTOP" 2>/dev/null || {
    echo "⚠️  Konnte nicht auf Desktop kopieren"
    echo "💡 Bitte manuell kopieren:"
    echo "   Finder → $K2_DIR → K2-Start.command → Desktop ziehen"
    exit 1
}

chmod +x "$DESKTOP"
xattr -cr "$DESKTOP" 2>/dev/null
xattr -d com.apple.quarantine "$DESKTOP" 2>/dev/null

# Öffne Finder mit Desktop
open "$HOME/Desktop"

echo ""
echo "✅ Fertig!"
echo ""
echo "📌 K2-Start.command ist jetzt:"
echo "   - Im Projektordner: $SOURCE"
echo "   - Auf Desktop: $DESKTOP"
echo ""
echo "💡 Du kannst es jetzt:"
echo "   - Doppelklicken zum Starten"
echo "   - Ins Dock ziehen"
