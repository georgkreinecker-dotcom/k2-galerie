#!/bin/bash
# Setup für automatische Screenshots für K2 Projekt

SCREENSHOT_DIR="$HOME/k2Galerie/screenshots"
DESKTOP_SCREENSHOT_DIR="$HOME/Desktop/K2-Screenshots"

echo "📸 Setup Screenshot-Funktion für K2..."

# Erstelle Screenshot-Ordner
mkdir -p "$SCREENSHOT_DIR"
mkdir -p "$DESKTOP_SCREENSHOT_DIR"

# Erstelle Symlink auf Desktop für schnellen Zugriff
ln -sf "$SCREENSHOT_DIR" "$DESKTOP_SCREENSHOT_DIR" 2>/dev/null

echo "✅ Screenshot-Ordner erstellt:"
echo "   - Projekt: $SCREENSHOT_DIR"
echo "   - Desktop: $DESKTOP_SCREENSHOT_DIR"
echo ""
echo "📌 Screenshots werden automatisch hier gespeichert!"
echo ""
echo "💡 Tipps:"
echo "   - Cmd+Shift+3 = Gesamter Bildschirm"
echo "   - Cmd+Shift+4 = Auswahl"
echo "   - Cmd+Shift+4 + Leertaste = Fenster"
echo ""
echo "   Screenshots werden standardmäßig auf dem Desktop gespeichert"
echo "   Du kannst sie dann hier einfügen (Cmd+V im Chat)"
