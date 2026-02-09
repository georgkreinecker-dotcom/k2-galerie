#!/bin/bash
# Repariert K2 Start App mit Logging für Debugging

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
APP_PATH="$REAL_DESKTOP/${APP_NAME}.app"
MACOS="$APP_PATH/Contents/MacOS"
SCRIPT="$MACOS/K2-Start"
LOG_FILE="$HOME/k2-start-app.log"

echo "🔧 Repariere K2 Start App mit Logging..."

# Prüfe ob App existiert
if [ ! -d "$APP_PATH" ]; then
    echo "❌ App nicht gefunden, erstelle sie neu..."
    cd "$HOME/k2Galerie" || exit 1
    ./scripts/k2-schoenen-button-erstellen.sh
fi

# Stelle sicher dass Verzeichnis existiert
mkdir -p "$MACOS"

# Erstelle Start-Skript mit Logging
cat > "$SCRIPT" <<'EOFSCRIPT'
#!/bin/bash
# K2 Start Button - Ruft START-K2.sh auf mit Logging

LOG_FILE="$HOME/k2-start-app.log"
echo "$(date): K2 Start App wurde gestartet" >> "$LOG_FILE"

cd "$HOME/k2Galerie" || {
    ERROR_MSG="Fehler: K2 Projektordner nicht gefunden!"
    echo "$(date): $ERROR_MSG" >> "$LOG_FILE"
    osascript -e "display dialog \"$ERROR_MSG\" buttons {\"OK\"} default button 1"
    exit 1
}

echo "$(date): Projektordner gefunden: $(pwd)" >> "$LOG_FILE"

# Prüfe ob START-K2.sh existiert
if [ ! -f "./START-K2.sh" ]; then
    ERROR_MSG="Fehler: START-K2.sh nicht gefunden!"
    echo "$(date): $ERROR_MSG" >> "$LOG_FILE"
    osascript -e "display dialog \"$ERROR_MSG\" buttons {\"OK\"} default button 1"
    exit 1
fi

echo "$(date): START-K2.sh gefunden, starte..." >> "$LOG_FILE"

# Führe START-K2.sh aus
exec ./START-K2.sh 2>&1 | tee -a "$LOG_FILE"
EOFSCRIPT

# Mache ausführbar
chmod +x "$SCRIPT"

# Entferne ALLE extended attributes
echo "🧹 Entferne extended attributes..."
xattr -cr "$APP_PATH" 2>/dev/null
xattr -d com.apple.quarantine "$APP_PATH" 2>/dev/null
xattr -d com.apple.metadata:kMDItemWhereFroms "$APP_PATH" 2>/dev/null

# Prüfe ob START-K2.sh existiert und ausführbar ist
if [ ! -f "$HOME/k2Galerie/START-K2.sh" ]; then
    echo "⚠️  START-K2.sh nicht gefunden!"
    exit 1
fi

chmod +x "$HOME/k2Galerie/START-K2.sh"

echo ""
echo "✅ App repariert mit Logging!"
echo ""
echo "📋 Log-Datei: $LOG_FILE"
echo ""
echo "💡 Teste die App jetzt:"
echo "   1. Klicke auf 'K2 Start' im Dock"
echo "   2. Falls nichts passiert, prüfe die Log-Datei:"
echo "      cat $LOG_FILE"
echo ""
echo "🔍 Die Log-Datei zeigt genau, was passiert"
