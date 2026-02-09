#!/bin/bash
# Startet K2 Server dauerhaft - umgeht macOS Berechtigungen durch Terminal.app

cd "$HOME/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server bereits läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        echo "✅ Server läuft bereits auf Port $port"
        open "http://127.0.0.1:$port/"
        exit 0
    fi
done

# Stoppe eventuell hängende Prozesse
pkill -f "vite|npm.*dev" 2>/dev/null
sleep 1

# Starte Server über Terminal.app (umgeht macOS Berechtigungen)
# Erstelle temporäres Script das Terminal ausführt
TEMP_SCRIPT=$(mktemp)
cat > "$TEMP_SCRIPT" <<'EOFSCRIPT'
#!/bin/bash
cd "$HOME/k2Galerie"
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
npm run dev
EOFSCRIPT
chmod +x "$TEMP_SCRIPT"

# Öffne Terminal und führe Script aus
osascript <<APPLESCRIPT
tell application "Terminal"
    activate
    do script "$TEMP_SCRIPT"
end tell
APPLESCRIPT

echo "🚀 Server wird im Terminal gestartet..."
echo "⏳ Warte auf Server-Start..."

# Warte auf Server-Start
for i in {1..25}; do
    sleep 1
    for port in 5177 5176 5175 5174 5173; do
        if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
            echo "✅ Server läuft jetzt auf Port $port"
            open "http://127.0.0.1:$port/"
            rm -f "$TEMP_SCRIPT"
            exit 0
        fi
    done
    if [ $((i % 5)) -eq 0 ]; then
        echo "   ... noch $((25-i)) Sekunden ..."
    fi
done

echo "⚠️  Server startet langsam..."
open "http://127.0.0.1:5177/"
rm -f "$TEMP_SCRIPT"
