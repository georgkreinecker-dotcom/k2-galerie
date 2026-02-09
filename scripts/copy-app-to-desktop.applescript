tell application "Finder"
	set sourceApp to POSIX file "/Users/georgkreinecker/k2Galerie/K2 Plattform.app"
	set desktopFolder to desktop
	try
		-- Lösche alte App falls vorhanden
		if exists (desktopFolder as alias) then
			set oldApp to desktopFolder & "K2 Plattform.app"
			if exists oldApp then
				delete oldApp
			end if
		end if
		-- Kopiere App
		duplicate sourceApp to desktopFolder
		display notification "K2 Plattform.app wurde auf den Desktop kopiert!" with title "Erfolg"
	on error errMsg
		display dialog "Fehler: " & errMsg
	end try
end tell
