#!/bin/bash
# Deaktiviert K2 Terminal-Autostart Login-Item

SCRIPT_PATH="$HOME/k2Galerie/scripts/k2-terminal-autostart.sh"

echo "🛑 Deaktiviere K2 Terminal-Autostart..."
echo ""

APPLESCRIPT=$(cat <<EOF
tell application "System Events"
    set loginItems to login items
    set scriptPath to POSIX file "$SCRIPT_PATH"
    repeat with item in loginItems
        try
            if path of item is scriptPath then
                delete item
                display dialog "✅ K2 Terminal Autostart wurde deaktiviert!" buttons {"OK"} default button 1
                return
            end if
        end try
    end repeat
    display dialog "⚠️ K2 Terminal Autostart wurde nicht gefunden." buttons {"OK"} default button 1
end tell
EOF
)

osascript -e "$APPLESCRIPT"

echo ""
echo "✅ Fertig!"
echo ""
echo "💡 Terminal + Server starten NICHT mehr automatisch beim Login"
echo "🔧 Zum Aktivieren: ./scripts/k2-autostart-einrichten.sh"
