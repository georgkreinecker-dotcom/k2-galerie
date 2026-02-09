tell application "Terminal"
    activate
    do script "cd /Users/georgkreinecker/k2Galerie && export PATH=\"/Users/georgkreinecker/.local/node-v20.19.0-darwin-x64/bin:$PATH\" && (npm run dev > /dev/null 2>&1 &) && sleep 3 && open \"http://localhost:5177/\""
end tell
