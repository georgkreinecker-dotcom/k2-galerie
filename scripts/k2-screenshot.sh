#!/bin/bash
# Macht einen Screenshot und speichert ihn im K2 Screenshot-Ordner

SCREENSHOT_DIR="$HOME/k2Galerie/screenshots"
mkdir -p "$SCREENSHOT_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="k2-screenshot-$TIMESTAMP.png"
FILEPATH="$SCREENSHOT_DIR/$FILENAME"

echo "📸 Mache Screenshot..."

# macOS Screenshot mit Auswahl
screencapture -i "$FILEPATH"

if [ -f "$FILEPATH" ]; then
    echo "✅ Screenshot gespeichert: $FILEPATH"
    echo "📋 Pfad kopiert in Zwischenablage"
    echo "$FILEPATH" | pbcopy
    
    # Öffne Finder-Fenster
    open "$SCREENSHOT_DIR"
else
    echo "❌ Screenshot abgebrochen"
fi
