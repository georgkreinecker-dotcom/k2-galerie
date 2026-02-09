#!/bin/bash
# Startet Terminal und K2 Server automatisch - SICHERE VERSION
# Wartet bis alles bereit ist

# Warte bis System bereit ist (max 30 Sekunden)
for i in {1..30}; do
    # Prüfe ob Terminal verfügbar ist
    if osascript -e 'tell application "System Events" to get name of processes' > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Warte zusätzlich 5 Sekunden für vollständiges System-Start
sleep 5

# Prüfe ob Server bereits läuft
for port in 5177 5176 5175 5174 5173; do
    if curl -s "http://127.0.0.1:$port" > /dev/null 2>&1; then
        exit 0  # Server läuft bereits
    fi
done

# Prüfe ob Node.js verfügbar ist
if ! command -v node > /dev/null 2>&1; then
    # Versuche PATH zu setzen
    export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"
    if ! command -v node > /dev/null 2>&1; then
        # Node.js nicht verfügbar - beende ohne Fehler
        exit 0
    fi
done

# Öffne Terminal und starte Server (mit Fehlerbehandlung)
osascript <<APPLESCRIPT || exit 0
tell application "Terminal"
    try
        activate
        do script "cd ~/k2Galerie && export PATH=\"\$HOME/.local/node-v20.19.0-darwin-x64/bin:\$PATH\" && npm run dev"
    on error
        -- Fehler beim Öffnen von Terminal - beende ohne Fehler
        return
    end try
end tell
APPLESCRIPT
