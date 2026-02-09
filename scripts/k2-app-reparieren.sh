#!/bin/bash
# Repariert K2 Start App damit sie funktioniert

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
APP_PATH="$REAL_DESKTOP/${APP_NAME}.app"
MACOS="$APP_PATH/Contents/MacOS"
SCRIPT="$MACOS/K2-Start"

echo "🔧 Repariere K2 Start App..."

# Prüfe ob App existiert
if [ ! -d "$APP_PATH" ]; then
    echo "❌ App nicht gefunden, erstelle sie neu..."
    cd "$HOME/k2Galerie" || exit 1
    ./scripts/k2-schoenen-button-erstellen.sh
    exit 0
fi

# Stelle sicher dass Verzeichnis existiert
mkdir -p "$MACOS"

# Erstelle/Repariere das Start-Skript
cat > "$SCRIPT" <<'EOFSCRIPT'
#!/bin/bash
# K2 Start Button - Ruft START-K2.sh auf

cd "$HOME/k2Galerie" || {
    osascript -e 'display dialog "Fehler: K2 Projektordner nicht gefunden!" buttons {"OK"} default button 1'
    exit 1
}

# Führe START-K2.sh aus
./START-K2.sh
EOFSCRIPT

# Mache ausführbar
chmod +x "$SCRIPT"

# Entferne ALLE extended attributes
echo "🧹 Entferne extended attributes..."
xattr -cr "$APP_PATH" 2>/dev/null
xattr -d com.apple.quarantine "$APP_PATH" 2>/dev/null
xattr -d com.apple.metadata:kMDItemWhereFroms "$APP_PATH" 2>/dev/null

# Prüfe ob START-K2.sh existiert
if [ ! -f "$HOME/k2Galerie/START-K2.sh" ]; then
    echo "⚠️  START-K2.sh nicht gefunden!"
    exit 1
fi

# Mache START-K2.sh ausführbar
chmod +x "$HOME/k2Galerie/START-K2.sh"

echo ""
echo "✅ App repariert!"
echo ""
echo "📌 Die App sollte jetzt funktionieren"
echo "💡 Teste sie: Doppelklick auf 'K2 Start.app' im Dock"

# Teste ob App funktioniert
echo ""
read -p "App jetzt testen? (j/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Jj]$ ]]; then
    open "$APP_PATH"
fi
