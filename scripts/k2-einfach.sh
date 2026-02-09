#!/bin/bash
# K2 Plattform - EINFACHSTE VERSION die wirklich funktioniert

cd ~/k2Galerie
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

# Prüfe Server
if curl -s http://127.0.0.1:5177 > /dev/null 2>&1; then
    open http://127.0.0.1:5177/
    exit 0
fi

# Starte Server
echo "🚀 Starte Server..."
npm run dev > /dev/null 2>&1 &
sleep 8

# Öffne Browser
open http://127.0.0.1:5177/
