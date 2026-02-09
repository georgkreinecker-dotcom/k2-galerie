tell application "Terminal"
	activate
	do script "cd ~/k2Galerie && npm run dev"
end tell
delay 5
tell application "System Events"
	open location "http://localhost:5177/"
end tell
