#!/usr/bin/env bash
# Time Machine auf BACKUPMICRO reparieren: hängendes Backup löschen, Platz schaffen, neu starten.
#
# Schreibtisch: BACKUPMICRO-Time-Machine-reparieren.command (Doppelklick)
#
# Einmalig: Systemeinstellungen → Datenschutz & Sicherheit → Vollständiger Festplattenzugriff
# → Terminal einschalten → Terminal mit Cmd+Q beenden → Schreibtisch-Datei nochmal doppelklicken.

set -e
rm -f /tmp/tmfix-admin.XXXXXX.sh 2>/dev/null || true

TMUTIL="/usr/bin/tmutil"

VOL="/Volumes/BACKUPMICRO"
PROJECT="${PROJECT:-$HOME/k2Galerie}"
BACKUPDB="$VOL/Backups.backupdb"
MIN_FREE_GB="${MIN_FREE_GB:-80}"

if [ ! -d "$VOL" ]; then
  echo "❌ BACKUPMICRO nicht angeschlossen. Bitte USB/Festplatte einstecken und erneut starten."
  exit 1
fi

MACHINE_NAME=""
if [ -d "$BACKUPDB" ]; then
  for d in "$BACKUPDB"/*; do
    [ -d "$d" ] || continue
    bn=$(basename "$d")
    case "$bn" in .*) continue ;; esac
    if [ -d "$d" ] && [ "$bn" != "Neuer Ordner" ]; then
      MACHINE_NAME="$bn"
      break
    fi
  done
fi
MACHINE_DIR="${MACHINE_DIR:-$BACKUPDB/$MACHINE_NAME}"
INPROGRESS=""

free_gb() {
  df -g "$VOL" 2>/dev/null | awk 'NR==2 {print $4}'
}

show_disk() {
  echo "=== Speicher BACKUPMICRO ==="
  df -h "$VOL"
  echo ""
}

open_fda_settings() {
  open "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles" 2>/dev/null || \
    open "/System/Library/PreferencePanes/Security.prefPane" 2>/dev/null || true
}

show_fda_hilfe() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  Terminal braucht „Vollständiger Festplattenzugriff“"
  echo ""
  echo "  1. Systemeinstellungen öffnen sich gleich"
  echo "  2. Unten links Schloss → Passwort"
  echo "  3. Terminal einschalten (Häkchen)"
  echo "  4. Terminal mit Cmd+Q komplett beenden"
  echo "  5. Schreibtisch-Datei nochmal doppelklicken"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  open_fda_settings
  /usr/bin/osascript -e 'display dialog "Terminal unter „Vollständiger Festplattenzugriff“ einschalten.\n\nDann Terminal mit Cmd+Q beenden und die Schreibtisch-Datei nochmal doppelklicken." buttons {"OK"} default button 1 with title "BACKUPMICRO – einmalig"' 2>/dev/null || true
}

sudo_tmutil() {
  local err tmp
  tmp=$(mktemp /tmp/tmfix-admin.XXXXXX.sh)
  chmod 700 "$tmp"
  printf '#!/bin/bash\nset -e\nexport PATH=/usr/bin:/bin:/sbin\n%s %s\n' "$TMUTIL" "$(printf '%q ' "$@")" > "$tmp"
  if ! err=$(/usr/bin/osascript 2>&1 <<EOF
do shell script "/bin/bash '$tmp'" with administrator privileges
EOF
); then
    rm -f "$tmp"
    echo "$err"
    if echo "$err" | grep -qiE 'User canceled|(-128)'; then
      /usr/bin/osascript -e 'display dialog "Passwort abgebrochen.\n\nBitte nochmal starten – im kleinen Fenster Mac-Passwort eingeben." buttons {"OK"} with title "BACKUPMICRO"' 2>/dev/null || true
    elif echo "$err" | grep -qi "Full Disk Access"; then
      show_fda_hilfe
      exit 2
    fi
    return 1
  fi
  rm -f "$tmp"
  [ -n "$err" ] && echo "$err"
  return 0
}

confirm_delete_old_backup() {
  local oldest="$1"
  local ans
  ans=$(/usr/bin/osascript 2>/dev/null <<EOF || echo "Nein"
set d to display dialog "BACKUPMICRO ist zu voll für das nächste Time-Machine-Backup.\n\nSoll das älteste gespeicherte Backup gelöscht werden?\n\n$(basename "$oldest")\n\nDanach startet ein frisches Backup. K2-Ordner auf der Platte (falls vorhanden) bleiben unberührt." buttons {"Abbrechen", "Altes Backup löschen"} default button 2 with title "BACKUPMICRO – Speicher freimachen" with icon caution
if button returned of d is "Altes Backup löschen" then
  return "Ja"
else
  return "Nein"
end if
EOF
)
  [ "$ans" = "Ja" ]
}

echo "=== BACKUPMICRO – Time Machine reparieren ==="
echo ""
show_disk

FREE=$(free_gb)
if [ "${FREE:-0}" -lt "$MIN_FREE_GB" ] 2>/dev/null; then
  echo "⚠️  Nur ca. ${FREE} GB frei – Time Machine braucht mehr Platz."
  echo "    (Typische Meldung: Backup bricht bei ~37 % ab – Platte fast voll.)"
  echo ""
fi

if [ -z "$MACHINE_NAME" ] || [ ! -d "$MACHINE_DIR" ]; then
  echo "⚠️  Kein Time-Machine-Ordner unter $BACKUPDB gefunden."
else
  echo "Mac-Backup-Ordner: $MACHINE_DIR"
  INPROGRESS=$(ls -d "$MACHINE_DIR"/*.inProgress 2>/dev/null | head -1 || true)
  if [ -n "$INPROGRESS" ]; then
    echo "⚠️  Hängendes Teil-Backup (blockiert Speicher): $(basename "$INPROGRESS")"
  fi
  echo ""
  echo "Gespeicherte Backups:"
  tmutil listbackups 2>/dev/null || echo "   (Liste nur mit Admin-Rechten)"
fi
echo ""

echo "1/6 Schwere Ordner von Time Machine ausschließen …"
for path in \
  "$PROJECT/node_modules" \
  "$PROJECT/dist" \
  "$PROJECT/.vite" \
  "$HOME/.cursor" \
  "$HOME/Library/Caches" \
  "$HOME/Library/Developer" \
  "$HOME/Library/Application Support/Cursor" \
  "$HOME/Downloads"; do
  if [ -e "$path" ]; then
    tmutil addexclusion "$path" 2>/dev/null || true
  fi
done
echo "   ✅ Ausschlüsse gesetzt (node_modules, Caches, Cursor, Downloads …)"
echo ""

echo "2/6 Time Machine anhalten …"
tmutil stopbackup 2>/dev/null || true
for _w in $(seq 1 20); do
  sleep 2
  if tmutil status 2>/dev/null | grep -q 'Stopping = 0' && tmutil status 2>/dev/null | grep -q 'Running = 0'; then
    break
  fi
  echo "   … warte bis Time Machine wirklich stoppt ($_w/20)"
done
sleep 2
echo ""

if [ -n "$INPROGRESS" ] && [ -d "$MACHINE_DIR" ]; then
  echo "3/6 Fehlgeschlagenes Teil-Backup (.inProgress) löschen …"
  echo "   (Ein Passwort-Fenster – kein Festplattenzugriff in Einstellungen nötig)"
  DELETED=0
  if [ -d "$INPROGRESS" ]; then
    tmp=$(mktemp /tmp/tmfix-rm.XXXXXX.sh)
    printf '#!/bin/bash\nexport PATH=/usr/bin:/bin:/sbin\n/usr/bin/tmutil stopbackup 2>/dev/null || true\nsleep 3\n/bin/rm -rf %q\n' "$INPROGRESS" > "$tmp"
    chmod 700 "$tmp"
    if /usr/bin/osascript 2>/dev/null <<EOF
do shell script "/bin/bash '$tmp'" with administrator privileges
EOF
    then
      [ ! -d "$INPROGRESS" ] && DELETED=1
    fi
    rm -f "$tmp"
  fi
  if [ "$DELETED" -eq 1 ]; then
    echo "   ✅ Hängendes Backup entfernt – Speicher sollte wieder frei sein"
  else
    echo "   ❌ .inProgress ist NOCH DA."
    /usr/bin/osascript -e 'display dialog "Bitte NICHT die Terminal-Datei (.command) nutzen.\n\n1. Schreibtisch → BACKUPMICRO-0-Einrichtung.app (einmalig)\n2. Dann → BACKUPMICRO-1-Klick-Fix.app\n\nBei Schritt 2: „Ja, löschen“ wählen." buttons {"OK"} default button 1 with title "BACKUPMICRO" with icon caution' 2>/dev/null || true
  fi
else
  echo "3/6 Kein .inProgress-Ordner – übersprungen."
fi
echo ""

show_disk
FREE=$(free_gb)

if [ "${FREE:-0}" -lt "$MIN_FREE_GB" ] 2>/dev/null && [ -d "$MACHINE_DIR" ]; then
  OLDEST=$(tmutil listbackups 2>/dev/null | head -1 || true)
  if [ -n "$OLDEST" ] && [ -d "$OLDEST" ]; then
    echo "4/6 Noch zu wenig frei (${FREE} GB) – optionale Bereinigung …"
    if confirm_delete_old_backup "$OLDEST"; then
      echo "   Lösche ältestes Backup: $(basename "$OLDEST") …"
      if sudo_tmutil delete "$OLDEST"; then
        echo "   ✅ Altes Backup entfernt"
      else
        echo "   ❌ Löschen fehlgeschlagen"
      fi
    else
      echo "4/6 Altes Backup behalten (abgebrochen)."
    fi
  else
    echo "4/6 Noch zu wenig frei – kein älteres Backup zum Löschen gefunden."
  fi
else
  echo "4/6 Genug freier Speicher (${FREE:-?} GB) – altes Backup behalten."
fi
echo ""

echo "5/6 Lokale Schnappschüsse auf dem Mac löschen …"
SNAP_LIST=$(tmutil listlocalsnapshots / 2>/dev/null | sed 's/com.apple.TimeMachine.//' | tr '\n' ' ')
if [ -n "$SNAP_LIST" ]; then
  tmp=$(mktemp /tmp/tmfix-snaps.XXXXXX.sh)
  {
    echo '#!/bin/bash'
    echo 'set -e'
    echo 'export PATH=/usr/bin:/bin:/sbin'
    for snap in $SNAP_LIST; do
      [ -z "$snap" ] && continue
      printf '%s deletelocalsnapshots %q || true\n' "$TMUTIL" "$snap"
    done
  } > "$tmp"
  chmod 700 "$tmp"
  /usr/bin/osascript 2>/dev/null <<EOF || true
do shell script "/bin/bash '$tmp'" with administrator privileges
EOF
  rm -f "$tmp"
fi
echo "   ✅ Lokale Schnappschüsse bereinigt"
echo ""

show_disk
FREE=$(free_gb)

echo "6/6 Neues Backup anstoßen …"
if [ "${FREE:-0}" -lt 40 ] 2>/dev/null; then
  echo "   ⚠️  Immer noch weniger als 40 GB frei – automatischer Start übersprungen."
  echo "   Bitte: Schritt 4 nochmal (altes Backup löschen) oder Daten von BACKUPMICRO verschieben."
  /usr/bin/osascript -e 'display dialog "BACKUPMICRO hat noch zu wenig freien Speicher.\n\nBitte die Reparatur nochmal starten und „Altes Backup löschen“ bestätigen – oder große Dateien von der Platte entfernen." buttons {"OK"} default button 1 with title "Time Machine – Speicher knapp"' 2>/dev/null || true
else
  if sudo_tmutil startbackup --auto --block; then
    echo "   ✅ Backup durchgelaufen"
  else
    echo "   ℹ️  Bitte: Systemeinstellungen → Time Machine → „Jetzt sichern“"
  fi
fi
echo ""

show_disk
INPROGRESS_NOW=$(ls -d "$MACHINE_DIR"/*.inProgress 2>/dev/null | head -1 || true)
FREE=$(free_gb)
if [ -n "$INPROGRESS_NOW" ]; then
  echo ""
  echo "❌ FEHLGESCHLAGEN – hängendes Backup ist noch da."
  echo "   → Schreibtisch: BACKUPMICRO-1-Klick-Fix.app (Doppelklick, Passwort-Fenster)"
  /usr/bin/osascript -e 'display dialog "Das hängende Backup konnte nicht gelöscht werden.\n\nBitte auf dem Schreibtisch doppelklicken:\n\nBACKUPMICRO-1-Klick-Fix.app\n\nDort Passwort eingeben → OK.\nBei Schritt 2: „Ja, löschen“." buttons {"OK"} default button 1 with title "BACKUPMICRO – bitte 1-Klick-Fix" with icon stop' 2>/dev/null || true
  exit 1
fi
echo ""
echo "✅ Fertig. K2-Ordner auf der Platte (z. B. K2-Galerie-Backups) bleiben unberührt."
if [ "${FREE:-0}" -lt "$MIN_FREE_GB" ] 2>/dev/null; then
  echo "⚠️  Weniger als ${MIN_FREE_GB} GB frei – BACKUPMICRO-1-Klick-Fix.app und „Ja, löschen“ wählen."
fi
