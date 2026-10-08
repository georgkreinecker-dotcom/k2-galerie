#!/bin/bash
# Mac-Admin (Sudoers-freigegeben):
#   --yes      Alte TM-Stände 2016/17 auf Platte „Backup“ löschen
#   --tm-fix   Hängendes TM stoppen, NIEMALS rm -rf auf TM-Ordner,
#              Ziel auf Partition mit Platz, Backup starten
#
# Joe: sudo -n …/alte-tm-backups-backup-volume-loeschen.sh --tm-fix
#
# WICHTIG: Time-Machine-Ordner (Hardlinks) NIEMALS mit rm -rf löschen –
# das kann Tage dauern. Nur tmutil delete oder Ziel wechseln.

set -e
MODE="${1:-}"
OLD="/Volumes/Backup/Backups.backupdb/Georg Kreineckers Computer"
TM_HOST_BACKUPMICRO="/Volumes/BACKUPMICRO/Backups.backupdb/Georgs iMac"
TM_HOST_BACKUP="/Volumes/Backup/Backups.backupdb/Georgs iMac"

if [[ "$(id -u)" -ne 0 ]]; then
  exec sudo -n "$0" "$@"
fi

free_gb() {
  df -g "$1" 2>/dev/null | awk 'NR==2 {print $4}'
}

stop_bad_deletes() {
  echo "Stoppe falsches rm/du auf Time-Machine-Ordnern…"
  pkill -9 -f "rm -rf /Volumes/BACKUPMICRO/Backups.backupdb" 2>/dev/null || true
  pkill -9 -f "rm -rf /Volumes/Backup/Backups.backupdb" 2>/dev/null || true
  pkill -9 -f "du -sh /Volumes/BACKUPMICRO" 2>/dev/null || true
  pkill -9 -f "du -sh /Volumes/Backup/Backups" 2>/dev/null || true
  sleep 1
}

# Kurzer Versuch mit tmutil – kein blockierendes rm
try_tmutil_delete_inprogress() {
  local dir="$1"
  [[ -d "$dir" ]] || return 0
  local d
  for d in "$dir"/*.inProgress; do
    [[ -e "$d" ]] || continue
    echo "tmutil delete (kurz): $d"
    # Hintergrund + Timeout: nicht wieder Tage hängen
    tmutil delete -path "$d" &
    local pid=$!
    local i=0
    while kill -0 "$pid" 2>/dev/null && [[ $i -lt 90 ]]; do
      sleep 2
      i=$((i + 1))
    done
    if kill -0 "$pid" 2>/dev/null; then
      echo "tmutil delete dauert zu lang → abgebrochen (Ordner kann liegen bleiben)."
      kill "$pid" 2>/dev/null || true
    else
      wait "$pid" 2>/dev/null || true
      echo "tmutil delete fertig oder Ordner weg."
    fi
  done
}

mode_tm_fix() {
  echo "=== Time Machine Fix (ohne rm -rf) ==="
  stop_bad_deletes

  tmutil stopbackup 2>/dev/null || true
  sleep 2

  # Nur kurzer tmutil-Versuch – kein rm
  try_tmutil_delete_inprogress "$TM_HOST_BACKUPMICRO"
  try_tmutil_delete_inprogress "$TM_HOST_BACKUP"

  echo ""
  echo "Platz:"
  df -h /Volumes/BACKUPMICRO /Volumes/Backup 2>/dev/null | grep -v Filesystem || true

  local free_micro free_backup
  free_micro=$(free_gb /Volumes/BACKUPMICRO || echo 0)
  free_backup=$(free_gb /Volumes/Backup || echo 0)
  echo "BACKUPMICRO frei: ${free_micro:-0} GB | Backup frei: ${free_backup:-0} GB"

  # Immer die Partition mit genug Platz – Backup hat typisch 500+ GB frei
  if [[ -d /Volumes/Backup ]] && [[ "${free_backup:-0}" -gt 80 ]]; then
    echo ""
    echo "→ Time-Machine-Ziel: /Volumes/Backup (genug Platz)"
    tmutil setdestination /Volumes/Backup 2>&1 \
      || tmutil setdestination -a /Volumes/Backup 2>&1 \
      || echo "Hinweis: setdestination Fehler"
  elif [[ "${free_micro:-0}" -gt 80 ]]; then
    echo "→ Ziel bleibt BACKUPMICRO"
    tmutil setdestination /Volumes/BACKUPMICRO 2>&1 || true
  else
    echo "WARNUNG: Beide Partitionen eng – starte trotzdem auf Backup falls gemountet."
    [[ -d /Volumes/Backup ]] && tmutil setdestination /Volumes/Backup 2>&1 || true
  fi

  echo ""
  tmutil destinationinfo 2>/dev/null || true
  echo ""
  echo "Starte Backup…"
  tmutil startbackup 2>&1 || true
  sleep 12
  echo "Status:"
  tmutil status 2>/dev/null || true
  echo ""
  echo "Latest (fertig = heutiges Datum):"
  readlink "$TM_HOST_BACKUPMICRO/Latest" 2>/dev/null | sed 's/^/  BACKUPMICRO: /' || true
  readlink "$TM_HOST_BACKUP/Latest" 2>/dev/null | sed 's/^/  Backup: /' || true
  ls -la "$TM_HOST_BACKUP" 2>/dev/null | sed 's/^/  /' || true
  echo ""
  echo "Angestoßen. Mac anlassen."
  echo "Fertig = DestinationMountPoint /Volumes/Backup und später Latest mit heutigem Datum."
  echo "Unfertiges auf BACKUPMICRO darf liegen bleiben – blockiert das neue Backup nicht."
}

mode_yes_old() {
  if [[ ! -d "$OLD" ]]; then
    echo "Nichts zu tun – Ordner 2016/17 schon weg."
    df -h /Volumes/Backup 2>/dev/null | tail -1 || true
    exit 0
  fi
  echo "Lösche alte Maschine (nicht Hardlink-TM-Alltag): $OLD"
  echo "Vorher:"; df -h /Volumes/Backup | tail -1
  (
    while kill -0 $$ 2>/dev/null; do
      sleep 60
      echo "[Fortschritt] $(date '+%H:%M:%S') $(df -h /Volumes/Backup | tail -1)"
    done
  ) &
  local PROG=$!
  rm -rf "$OLD"
  kill "$PROG" 2>/dev/null || true
  echo "Fertig."
  echo "Nachher:"; df -h /Volumes/Backup | tail -1
}

case "$MODE" in
  --tm-fix)
    mode_tm_fix
    ;;
  --yes)
    mode_yes_old
    ;;
  *)
    echo "Nutzung: $0 --yes | --tm-fix"
    exit 1
    ;;
esac
