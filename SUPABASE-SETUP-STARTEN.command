#!/bin/bash

# Öffnet die Supabase Setup-Anleitung im Browser

echo "🚀 Öffne Supabase Setup-Anleitung..."
echo ""

# Finde den Projektordner
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SETUP_HTML="$SCRIPT_DIR/public/supabase-setup.html"

if [ -f "$SETUP_HTML" ]; then
    open "$SETUP_HTML"
    echo "✅ Setup-Anleitung geöffnet!"
    echo ""
    echo "📝 Folge einfach den Schritten in der Anleitung"
else
    echo "❌ Setup-Datei nicht gefunden: $SETUP_HTML"
    exit 1
fi
