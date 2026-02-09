#!/bin/bash
# Öffnet die Admin-Seite automatisch im Standard-Browser
cd "$HOME/k2Galerie" || exit 1

# Warte kurz, damit der Server bereit ist
sleep 2

# Öffne die Admin-Seite
open "http://localhost:5177/admin" 2>/dev/null || \
python3 -c "import webbrowser; webbrowser.open('http://localhost:5177/admin')" 2>/dev/null || \
echo "Bitte öffne manuell: http://localhost:5177/admin"
