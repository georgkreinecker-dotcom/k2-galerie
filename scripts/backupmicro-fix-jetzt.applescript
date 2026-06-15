-- BACKUPMICRO-FIX-JETZT – eine App, klare Meldung am Ende
on run
	set volPath to "/Volumes/BACKUPMICRO"
	set machineDir to volPath & "/Backups.backupdb/Georgs iMac"
	set logFile to (path to desktop folder as text) & "BACKUPMICRO-Ergebnis.txt"

	try
		do shell script "[ -d " & quoted form of volPath & " ]"
	on error
		display dialog "BACKUPMICRO nicht angeschlossen." buttons {"OK"} with icon stop
		return
	end try

	set shellCmd to "
export PATH=/usr/bin:/bin:/sbin
VOL=" & quoted form of volPath & "
MD=" & quoted form of machineDir & "
LOG=" & quoted form of POSIX path of logFile & "

echo \"=== BACKUPMICRO Fix \" $(date) \"===\" > \"$LOG\"

/usr/bin/tmutil stopbackup 2>/dev/null || true
sleep 2
/usr/sbin/pkill -9 backupd 2>/dev/null || true
sleep 2

IP=$(/bin/ls -d \"$MD\"/*.inProgress 2>/dev/null | /usr/bin/head -1 || true)
if [ -n \"$IP\" ]; then
  echo \"Loesche: $IP\" >> \"$LOG\"
  /bin/rm -rf \"$IP\"
fi

OLDEST=$(/usr/bin/tmutil listbackups 2>/dev/null | /usr/bin/head -1 || true)
FREE=$(/bin/df -g \"$VOL\" | /usr/bin/awk 'NR==2 {print $4}')
if [ -n \"$OLDEST\" ] && [ \"$FREE\" -lt 80 ] 2>/dev/null; then
  echo \"Loesche altes Backup: $OLDEST\" >> \"$LOG\"
  /usr/bin/tmutil delete \"$OLDEST\" 2>/dev/null || /bin/rm -rf \"$OLDEST\"
fi

IP2=$(/bin/ls -d \"$MD\"/*.inProgress 2>/dev/null | /usr/bin/head -1 || true)
FREE2=$(/bin/df -g \"$VOL\" | /usr/bin/awk 'NR==2 {print $4}')
echo \"FREE_GB=$FREE2\" >> \"$LOG\"
if [ -n \"$IP2\" ]; then echo \"INPROGRESS=JA\" >> \"$LOG\"; else echo \"INPROGRESS=NEIN\" >> \"$LOG\"; fi

if [ -z \"$IP2\" ] && [ \"$FREE2\" -ge 40 ] 2>/dev/null; then
  /usr/bin/tmutil startbackup --auto 2>/dev/null || true
  echo \"BACKUP_GESTARTET=JA\" >> \"$LOG\"
else
  echo \"BACKUP_GESTARTET=NEIN\" >> \"$LOG\"
fi

echo \"FREE_GB=$FREE2\"
if [ -n \"$IP2\" ]; then echo \"INPROGRESS=JA\"; else echo \"INPROGRESS=NEIN\"; fi
"

	try
		set result to do shell script shellCmd with administrator privileges
	on error errMsg number errNum
		if errNum is -128 then
			display dialog "Abgebrochen (kein Passwort)." buttons {"OK"}
		else
			display dialog "Fehler:" & return & return & errMsg & return & return & "Falls „Operation not permitted“: Systemeinstellungen → Vollständiger Festplattenzugriff → BACKUPMICRO-FIX-JETZT einschalten → App nochmal starten." buttons {"OK"} with icon stop
		end if
		return
	end try

	set freeGb to "?"
	set inProg to "?"
	repeat with ln in paragraphs of result
		if ln starts with "FREE_GB=" then set freeGb to text 9 thru -1 of ln
		if ln starts with "INPROGRESS=" then set inProg to text 12 thru -1 of ln
	end repeat

	if inProg is "NEIN" then
		display dialog "✅ Erledigt!" & return & return & "Hängendes Backup: weg" & return & "Frei auf BACKUPMICRO: ca. " & freeGb & " GB" & return & return & "Time Machine startet im Hintergrund." & return & "(Details: BACKUPMICRO-Ergebnis.txt auf dem Schreibtisch)" buttons {"OK"} default button 1 with icon note
	else
		display dialog "❌ Noch nicht geklappt." & return & return & "Hängendes Backup ist noch da." & return & "Frei: ca. " & freeGb & " GB" & return & return & "Bitte: Systemeinstellungen → Vollständiger Festplattenzugriff → BACKUPMICRO-FIX-JETZT einschalten → diese App nochmal doppelklicken." buttons {"Einstellungen öffnen", "OK"} default button 1 with icon stop
		try
			do shell script "open 'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles'"
		end try
	end if
end run
