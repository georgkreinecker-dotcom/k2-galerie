-- Aktualisiert K2 Start.app mit der richtigen URL
set appPath to POSIX file "/Users/georgkreinecker/Desktop/K2 Start.app"
set scriptPath to POSIX file "/Users/georgkreinecker/Desktop/K2 Start.app/Contents/Resources/Scripts/main.scpt"

-- Neues AppleScript
set newScript to "on run
	try
		-- Prüfe verschiedene Ports
		repeat with port in {5177, 5176, 5175, 5174, 5173}
			try
				set urlString to \"http://127.0.0.1:\" & port & \"/\"
				do shell script \"curl -s \" & quoted form of urlString & \" > /dev/null 2>&1\"
				tell application \"System Events\"
					open location urlString
				end tell
				return
			end try
		end repeat
		
		-- Falls kein Server läuft, starte einen
		do shell script \"cd ~/k2Galerie && export PATH=\\\"$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH\\\" && npm run dev > /dev/null 2>&1 &\"
		delay 4
		
		repeat with port in {5177, 5176, 5175, 5174, 5173}
			try
				set urlString to \"http://127.0.0.1:\" & port & \"/\"
				do shell script \"curl -s \" & quoted form of urlString & \" > /dev/null 2>&1\"
				tell application \"System Events\"
					open location urlString
				end tell
				return
			end try
		end repeat
		
		display dialog \"Server konnte nicht gestartet werden\" buttons {\"OK\"} default button \"OK\"
	on error errMsg
		display dialog \"Fehler: \" & errMsg buttons {\"OK\"} default button \"OK\"
	end try
end run"

-- Kompiliere und speichere
set compiledScript to compile newScript
set fileRef to open for access scriptPath with write permission
write compiledScript to fileRef
close access fileRef
