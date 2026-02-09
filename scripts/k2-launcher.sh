#!/bin/bash
cd /Users/georgkreinecker/k2Galerie
export PATH="/Users/georgkreinecker/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe ob Server läuft
if ! curl -s http://localhost:5177 > /dev/null 2>&1; then
    # Starte Dev-Server im Hintergrund
    npm run dev > /dev/null 2>&1 &
    sleep 3
fi

# Öffne Browser
open "http://localhost:5177/"
