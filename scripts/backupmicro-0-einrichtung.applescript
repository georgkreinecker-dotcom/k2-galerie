-- Einmalig: Vollständiger Festplattenzugriff für BACKUPMICRO-1-Klick-Fix.app
on run
	display dialog "Einmalig einrichten (2 Minuten):" & return & return & "1. Gleich öffnen sich die Systemeinstellungen" & return & "2. Runterscrollen → „Vollständiger Festplattenzugriff“" & return & "3. Unten auf + klicken" & return & "4. Schreibtisch → BACKUPMICRO-1-Klick-Fix.app wählen" & return & "5. Häkchen muss an sein" & return & return & "Danach: BACKUPMICRO-1-Klick-Fix.app doppelklicken." buttons {"Einstellungen öffnen"} default button 1 with title "BACKUPMICRO – einmalig" with icon note
	try
		do shell script "open 'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles'"
	end try
end run
