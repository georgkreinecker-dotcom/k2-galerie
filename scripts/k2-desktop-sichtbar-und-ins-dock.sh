#!/bin/bash
# Macht Desktop sichtbar und legt K2 Start direkt ins Dock

APP_NAME="K2 Start"
REAL_DESKTOP="$HOME/Desktop"
ICLOUD_DESKTOP="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Desktop"

echo "🔧 Mache Desktop sichtbar und lege App ins Dock..."

# Finde App
APP_PATH=""
for location in "$REAL_DESKTOP/${APP_NAME}.app" "$ICLOUD_DESKTOP/${APP_NAME}.app"; do
    if [ -d "$location" ]; then
        APP_PATH="$location"
        break
    fi
done

# Falls nicht gefunden, erstelle sie
if [ -z "$APP_PATH" ]; then
    echo "📦 App nicht gefunden, erstelle sie..."
    cd "$HOME/k2Galerie" || exit 1
    ./scripts/k2-schoenen-button-erstellen.sh
    APP_PATH="$REAL_DESKTOP/${APP_NAME}.app"
fi

# Stelle sicher dass auf echtem Desktop
if [[ "$APP_PATH" != "$REAL_DESKTOP"* ]]; then
    echo "📦 Verschiebe auf echten Desktop..."
    mv "$APP_PATH" "$REAL_DESKTOP/${APP_NAME}.app" 2>/dev/null || {
        cp -R "$APP_PATH" "$REAL_DESKTOP/${APP_NAME}.app" 2>/dev/null
        rm -rf "$APP_PATH" 2>/dev/null
    }
    APP_PATH="$REAL_DESKTOP/${APP_NAME}.app"
fi

# Entferne extended attributes
xattr -cr "$APP_PATH" 2>/dev/null
xattr -d com.apple.quarantine "$APP_PATH" 2>/dev/null

# Mache Desktop sichtbar über AppleScript
osascript <<'APPLESCRIPT'
tell application "Finder"
    -- Aktiviere Finder
    activate
    
    -- Öffne Desktop-Fenster
    set desktopFolder to folder "Desktop" of home
    open desktopFolder
    
    -- Stelle sicher dass Desktop sichtbar ist
    tell application "System Events"
        tell process "Finder"
            -- Zeige Desktop
            try
                keystroke "d" using {command down, shift down}
            end try
        end tell
    end tell
end tell

-- Warte kurz
delay 1

-- Füge App ins Dock hinzu (macOS macht das automatisch wenn man Datei ins Dock zieht)
-- Aber wir können auch einen Alias erstellen
tell application "System Events"
    -- Erstelle Dock-Alias
    try
        set appPath to POSIX file (POSIX path of (path to home folder) & "Desktop/K2 Start.app")
        
        -- Zeige Dialog mit Anleitung
        display dialog "✅ Desktop ist jetzt sichtbar!" & return & return & "📌 So legst du K2 Start ins Dock:" & return & return & "1. Ziehe 'K2 Start.app' vom Desktop ins Dock" & return & "2. Falls macOS fragt: 'Öffnen' klicken" & return & return & "💡 Die App liegt jetzt auf dem Desktop!" buttons {"OK"} default button 1 with icon note
    end try
end tell
APPLESCRIPT

# Öffne auch Terminal-Befehl für Dock
echo ""
echo "✅ Desktop ist jetzt sichtbar!"
echo ""
echo "📌 Die App liegt hier: $APP_PATH"
echo ""
echo "💡 So legst du sie ins Dock:"
echo "   1. Finder öffnen (sollte jetzt Desktop zeigen)"
echo "   2. Ziehe 'K2 Start.app' vom Desktop ins Dock"
echo "   3. Falls macOS fragt: 'Öffnen' klicken"
echo ""
echo "🎯 Oder verwende diesen Befehl für Dock-Alias:"
echo "   defaults write com.apple.dock persistent-apps -array-add '<dict><key>tile-data</key><dict><key>file-data</key><dict><key>_CFURLString</key><string>$APP_PATH</string><key>_CFURLStringType</key><integer>0</integer></dict></dict></dict>'"
echo "   killall Dock"
