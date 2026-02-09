#!/bin/bash
# Legt K2-Start.command automatisch ins Dock

SOURCE="$HOME/k2Galerie/K2-Start.command"
DESKTOP="$HOME/Desktop/K2-Start.command"

echo "🚀 Richte K2-Start im Dock ein..."

# Kopiere auf Desktop (falls nicht vorhanden)
if [ ! -f "$DESKTOP" ]; then
    cp "$SOURCE" "$DESKTOP" 2>/dev/null || {
        echo "⚠️  Bitte manuell kopieren: $SOURCE → Desktop"
        echo "   Dann dieses Skript nochmal ausführen"
        exit 1
    }
fi

chmod +x "$DESKTOP"
xattr -cr "$DESKTOP" 2>/dev/null

# Füge ins Dock hinzu über AppleScript
osascript <<'APPLESCRIPT'
tell application "System Events"
    -- Öffne Finder mit Desktop
    tell application "Finder"
        activate
        set desktopFolder to folder "Desktop" of home
        open desktopFolder
    end tell
    
    delay 1
    
    -- Füge K2-Start.command ins Dock hinzu
    try
        set dockItems to get every dock item
        set k2Path to POSIX file (POSIX path of (path to home folder) & "Desktop/K2-Start.command")
        
        -- Prüfe ob bereits im Dock
        repeat with item in dockItems
            try
                if path of item is k2Path then
                    display dialog "K2-Start ist bereits im Dock!" buttons {"OK"} default button 1
                    return
                end if
            end try
        end repeat
        
        -- Füge hinzu (macOS macht das automatisch wenn man Datei ins Dock zieht)
        display dialog "✅ K2-Start.command ist auf dem Desktop!" & return & return & "📌 Ziehe es jetzt ins Dock:" & return & "   1. Finder-Fenster ist geöffnet" & return & "   2. Ziehe 'K2-Start.command' ins Dock" & return & "   3. Fertig! 💚" buttons {"OK"} default button 1
        
    on error
        display dialog "✅ K2-Start.command ist auf dem Desktop!" & return & return & "📌 Ziehe es jetzt ins Dock:" & return & "   1. Finder-Fenster ist geöffnet" & return & "   2. Ziehe 'K2-Start.command' ins Dock" & return & "   3. Fertig! 💚" buttons {"OK"} default button 1
    end try
end tell
APPLESCRIPT

echo ""
echo "✅ Fertig!"
echo "💡 Die Datei ist auf dem Desktop - ziehe sie ins Dock!"
