#!/usr/bin/env bash
# BACKUPMICRO – hängendes Backup löschen + bei Bedarf altes Backup entfernen.
# Admin-Rechte über macOS-Dialog (nicht unsichtbares sudo im Terminal).
set -euo pipefail

VOL="/Volumes/BACKUPMICRO"
BACKUPDB="$VOL/Backups.backupdb"
MACHINE_DIR="$BACKUPDB/Georgs iMac"
TMUTIL="/usr/bin/tmutil"
MIN_FREE_GB="${MIN_FREE_GB:-80}"

if [ ! -d "$VOL" ]; then
  osascript -e 'display dialog "BACKUPMICRO nicht angeschlossen.\n\nBitte USB/Festplatte einstecken und nochmal doppelklicken." buttons {"OK"}' 2>/dev/null || true
  exit 1
fi

free_gb() {
  df -g "$VOL" 2>/dev/null | awk 'NR==2 {print $4}'
}

show_disk() {
  echo "=== Speicher BACKUPMICRO ==="
  df -h "$VOL"
  echo ""
}

# Admin-Befehle: sichtbares Passwort-Fenster (zuverlässiger als sudo im .command-Fenster)
run_as_admin_mode() {
  local mode="$1"
  local tmp err
  tmp=$(mktemp /tmp/bm-admin.XXXXXX.sh)
  chmod 700 "$tmp"
  cat > "$tmp" <<'INNER'
#!/bin/bash
set -e
export PATH=/usr/bin:/bin:/sbin
TM=/usr/bin/tmutil
INNER
  cat >> "$tmp" <<INNER
MACHINE_DIR=$(printf '%q' "$MACHINE_DIR")
OLDEST=$(printf '%q' "${OLDEST:-}")
MODE=$(printf '%q' "$mode")
INNER
  cat >> "$tmp" <<'INNER'

$TM stopbackup 2>/dev/null || true
for _w in $(seq 1 20); do
  sleep 2
  $TM status 2>/dev/null | grep -q 'Stopping = 0' && $TM status 2>/dev/null | grep -q 'Running = 0' && break
done
sleep 2

case "$MODE" in
  delete_inprogress)
    ip=$(ls -d "$MACHINE_DIR"/*.inProgress 2>/dev/null | head -1 || true)
    [ -z "$ip" ] && exit 0
    /bin/rm -rf "$ip"
    [ -d "$ip" ] && exit 1
    ;;
  delete_oldest)
    [ -n "$OLDEST" ] && [ -d "$OLDEST" ] || exit 1
    $TM delete "$OLDEST"
    ;;
  start_backup)
    $TM startbackup --auto --block || $TM startbackup --auto
    ;;
  *)
    exit 1
    ;;
esac
INNER

  if ! err=$(/usr/bin/osascript 2>&1 <<EOF
do shell script "/bin/bash '$tmp' '$mode'" with administrator privileges
EOF
); then
    rm -f "$tmp"
    echo "$err"
    if echo "$err" | grep -qiE 'User canceled|(-128)'; then
      osascript -e 'display dialog "Abgebrochen – kein Passwort eingegeben.\n\nBitte nochmal starten und im kleinen Fenster dein Mac-Passwort eingeben (OK)." buttons {"OK"} with title "BACKUPMICRO"' 2>/dev/null || true
    fi
    return 1
  fi
  rm -f "$tmp"
  [ -n "$err" ] && echo "$err"
  return 0
}

echo "=== BACKUPMICRO – Speicher freimachen ==="
show_disk

INPROGRESS=$(ls -d "$MACHINE_DIR"/*.inProgress 2>/dev/null | head -1 || true)

if [ -n "$INPROGRESS" ]; then
  echo "Hängendes Backup: $(basename "$INPROGRESS")"
  osascript -e 'display dialog "Als Nächstes kommt ein kleines Fenster:\n\n→ Mac-Anmeldepasswort eingeben\n→ OK klicken\n\n(Das entfernt das hängende Time-Machine-Teil-Backup.)" buttons {"OK"} default button 1 with title "BACKUPMICRO"' 2>/dev/null || true
  if run_as_admin_mode delete_inprogress; then
    echo "✅ Hängendes Backup entfernt."
  else
    echo "❌ .inProgress konnte nicht gelöscht werden."
    exit 1
  fi
else
  echo "Kein .inProgress – OK."
fi

show_disk
FREE=$(free_gb)

if [ "${FREE:-0}" -lt "$MIN_FREE_GB" ] 2>/dev/null; then
  OLDEST=$(tmutil listbackups 2>/dev/null | head -1 || true)
  if [ -n "$OLDEST" ]; then
    ANS=$(osascript 2>/dev/null <<EOF || echo "Nein"
set d to display dialog "Noch zu wenig freier Speicher (${FREE} GB).\n\nAltes Backup löschen?\n\n$(basename "$OLDEST")\n\nDanach startet ein frisches Backup. K2-Ordner auf der Platte bleiben unberührt." buttons {"Nein", "Ja, altes Backup löschen"} default button 2 with title "BACKUPMICRO" with icon caution
if button returned of d is "Ja, altes Backup löschen" then "Ja" else "Nein"
EOF
)
    if [ "$ANS" = "Ja" ]; then
      echo "Lösche: $OLDEST"
      if run_as_admin_mode delete_oldest; then
        echo "✅ Altes Backup gelöscht."
      else
        echo "❌ Altes Backup konnte nicht gelöscht werden."
        exit 1
      fi
    fi
  fi
fi

show_disk
FREE=$(free_gb)

if [ "${FREE:-0}" -ge 40 ] 2>/dev/null; then
  echo "Starte neues Backup …"
  osascript -e 'display dialog "Noch einmal Passwort eingeben – Time Machine startet danach." buttons {"OK"} with title "BACKUPMICRO"' 2>/dev/null || true
  run_as_admin_mode start_backup || true
  echo "✅ Backup gestartet."
else
  osascript -e 'display dialog "Immer noch weniger als 40 GB frei.\n\nBitte nochmal starten und „Ja, altes Backup löschen“ wählen." buttons {"OK"} with title "BACKUPMICRO"' 2>/dev/null || true
fi

echo ""
echo "✅ Fertig. K2-Ordner auf der Platte bleiben unberührt."
read -r -p "Enter zum Schließen …" _ 2>/dev/null || sleep 8
