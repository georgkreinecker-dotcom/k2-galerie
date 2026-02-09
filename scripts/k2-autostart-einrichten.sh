#!/bin/bash
# Richtet K2 Terminal-Autostart als Login-Item ein

SCRIPT_PATH="$HOME/k2Galerie/scripts/k2-terminal-autostart.sh"

echo "🔧 Richte K2 Terminal-Autostart ein..."
echo ""

# Prüfe ob Script existiert
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Fehler: Script nicht gefunden: $SCRIPT_PATH"
    exit 1
fi

# Erstelle AppleScript das das Script ausführt
APPLESCRIPT=$(cat <<EOF
tell application "System Events"
    -- Prüfe ob Login-Item bereits existiert
    set loginItems to login items
    set scriptPath to POSIX file "$SCRIPT_PATH"
    repeat with item in loginItems
        try
            if path of item is scriptPath then
                display dialog "K2 Terminal Autostart ist bereits eingerichtet!" buttons {"OK"} default button 1
                return
            end if
        end try
    end repeat
    
    -- Füge Login-Item hinzu
    make login item at end with properties {path:scriptPath, hidden:false}
    display dialog "✅ K2 Terminal Autostart wurde eingerichtet!" & return & return & "Terminal + Server starten jetzt automatisch beim Login." buttons {"OK"} default button 1
end tell
EOF
)

# Führe AppleScript aus
osascript -e "$APPLESCRIPT"

echo ""
echo "✅ Fertig!"
echo ""
echo "💡 Terminal + Server starten jetzt automatisch beim Mac-Login"
echo "🛑 Zum Deaktivieren: Systemeinstellungen → Benutzer → Login-Items"
