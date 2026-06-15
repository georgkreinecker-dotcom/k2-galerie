-- BACKUPMICRO – ein Klick, ein Passwort-Fenster, hängendes Backup weg
-- Doppelklick auf BACKUPMICRO-1-Klick-Fix.app (Schreibtisch)

on run
	set volPath to "/Volumes/BACKUPMICRO"
	set machineDir to volPath & "/Backups.backupdb/Georgs iMac"

	try
		do shell script "[ -d " & quoted form of volPath & " ]" 
	on error
		display dialog "BACKUPMICRO ist nicht angeschlossen." & return & return & "USB/Festplatte einstecken und nochmal starten." buttons {"OK"} default button 1 with title "BACKUPMICRO" with icon stop
		return
	end try

	display dialog "Time Machine anhalten und hängendes Teil-Backup löschen." & return & return & "Gleich kommt das Passwort-Fenster:" & return & "→ Mac-Passwort eingeben" & return & "→ OK" buttons {"Abbrechen", "Weiter"} default button 2 with title "BACKUPMICRO – Schritt 1" with icon note

	set shellCmd to "
export PATH=/usr/bin:/bin:/sbin
VOL=" & quoted form of volPath & "
MD=" & quoted form of machineDir & "

/usr/bin/tmutil stopbackup 2>/dev/null || true
for n in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  sleep 2
  if /usr/bin/tmutil status 2>/dev/null | /usr/bin/grep -q 'Stopping = 0'; then
    if /usr/bin/tmutil status 2>/dev/null | /usr/bin/grep -q 'Running = 0'; then
      break
    fi
  fi
done
/usr/bin/tmutil stopbackup 2>/dev/null || true
sleep 3

IP=$(/bin/ls -d \"$MD\"/*.inProgress 2>/dev/null | /usr/bin/head -1 || true)
if [ -n \"$IP\" ]; then
  /bin/rm -rf \"$IP\"
  if [ -d \"$IP\" ]; then
    echo FEHLER:inProgress-noch-da
    exit 1
  fi
  echo OK:inProgress-geloescht
else
  echo OK:kein-inProgress
fi
/bin/df -g \"$VOL\" | /usr/bin/awk 'NR==2 {print \"FREE_GB=\" $4}'
"

	try
		set result to do shell script shellCmd with administrator privileges
	on error errMsg number errNum
		if errNum is -128 then
			display dialog "Abgebrochen – kein Passwort eingegeben." buttons {"OK"} default button 1 with title "BACKUPMICRO"
		else if errMsg contains "Full Disk Access" or errMsg contains "Operation not permitted" then
			display dialog "Einmalig „Vollständiger Festplattenzugriff“ nötig:" & return & return & "Schreibtisch → BACKUPMICRO-0-Einrichtung.app" & return & return & "Danach nochmal BACKUPMICRO-1-Klick-Fix.app." buttons {"OK"} default button 1 with title "BACKUPMICRO" with icon caution
			try
				do shell script "open 'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles'"
			end try
		else
			display dialog "Löschen fehlgeschlagen:" & return & return & errMsg buttons {"OK"} default button 1 with title "BACKUPMICRO" with icon stop
		end if
		return
	end try

	set freeGb to 0
	if result contains "FREE_GB=" then
		set AppleScript's text item delimiters to "FREE_GB="
		set freeGb to text item 2 of result as integer
	end if

	if freeGb < 80 then
		set oldest to do shell script "/usr/bin/tmutil listbackups 2>/dev/null | /usr/bin/head -1 || true"
		if oldest is not "" then
			set bn to do shell script "/usr/bin/basename " & quoted form of oldest
			set d to display dialog "Noch nur ca. " & freeGb & " GB frei." & return & return & "Altes Backup vom 5. Juni löschen?" & return & return & bn & return & return & "K2-Ordner auf der Platte bleiben unberührt." buttons {"Nein", "Ja, löschen"} default button 2 with title "BACKUPMICRO – Schritt 2" with icon caution
			if button returned of d is "Ja, löschen" then
				try
					do shell script "/usr/bin/tmutil delete " & quoted form of oldest & " 2>/dev/null || /bin/rm -rf " & quoted form of oldest with administrator privileges
				on error errMsg number errNum
					display dialog "Altes Backup konnte nicht gelöscht werden:" & return & return & errMsg buttons {"OK"} default button 1 with icon stop
					return
				end try
				set freeGb to do shell script "/bin/df -g " & quoted form of volPath & " | /usr/bin/awk 'NR==2 {print $4}'" as integer
			end if
		end if
	end if

	if freeGb ≥ 40 then
		try
			do shell script "/usr/bin/tmutil startbackup --auto" with administrator privileges
		end try
		display dialog "Erledigt." & return & return & "Ca. " & freeGb & " GB frei auf BACKUPMICRO." & return & "Time Machine-Backup wurde angestoßen." buttons {"OK"} default button 1 with title "BACKUPMICRO" with icon note
	else
		display dialog "Hängendes Backup ist weg, aber es sind noch zu wenig als 40 GB frei (" & freeGb & " GB)." & return & return & "Bitte nochmal starten und bei Schritt 2 „Ja, löschen“ wählen." buttons {"OK"} default button 1 with title "BACKUPMICRO" with icon caution
	end if
end run
