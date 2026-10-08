#!/bin/bash
# Status Backup-Platten – ohne Passwort. Joe darf das immer selbst ausführen.
set -e
echo "=== Volumes ==="
ls /Volumes 2>/dev/null | sed 's/^/  /'
echo ""
echo "=== Freier Platz ==="
df -h /Volumes/Backup /Volumes/BACKUPMICRO 2>/dev/null || df -h | grep -iE 'backup|Backup' || true
echo ""
echo "=== Time Machine Ziel ==="
tmutil destinationinfo 2>/dev/null || echo "(keine Info)"
echo ""
echo "=== BACKUPMICRO Snapshots ==="
ls -la "/Volumes/BACKUPMICRO/Backups.backupdb/Georgs iMac" 2>/dev/null || echo "(nicht erreichbar)"
echo ""
echo "=== Alte Maschine auf Backup (2016/17) ==="
if [[ -d "/Volumes/Backup/Backups.backupdb/Georg Kreineckers Computer" ]]; then
  n=$(ls "/Volumes/Backup/Backups.backupdb/Georg Kreineckers Computer" 2>/dev/null | wc -l | tr -d ' ')
  echo "  noch da – Einträge: $n"
else
  echo "  weg (gut)"
fi
echo ""
echo "=== Laufendes Löschen? ==="
pgrep -lf 'rm -rf.*Georg Kreineckers|alte-tm-backups' 2>/dev/null || echo "  nein"
