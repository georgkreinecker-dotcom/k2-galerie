-- K2 Plattform öffnen - AppleScript Version
tell application "Terminal"
    activate
    do script "cd ~/k2Galerie && export PATH=\"$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH\" && bash scripts/k2-einfach-oeffnen.sh"
end tell
