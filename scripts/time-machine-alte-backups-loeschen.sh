#!/bin/bash
# Alte Time-Machine-Stände 2016/2017 auf Platte „Backup“ löschen
# (Finder darf das nicht – geschützt.)
# Im Mac-Terminal ausführen. Passwort tippst DU bei sudo selbst ein – nie im Chat.

set -e
OLD="/Volumes/Backup/Backups.backupdb/Georg Kreineckers Computer"

if [[ ! -d "$OLD" ]]; then
  echo "Ordner nicht gefunden: $OLD"
  echo "Ist die Platte „Backup“ eingehängt?"
  exit 1
fi

echo "============================================"
echo "Lösche alte Backups (2016/2017):"
echo "  $OLD"
echo "Das kann lange dauern. BACKUPMICRO wird nicht angefasst."
echo "============================================"
df -h /Volumes/Backup | tail -1
echo ""
read -r -p "Wirklich löschen? Tippe ja und Enter: " ANSWER
if [[ "$ANSWER" != "ja" ]]; then
  echo "Abgebrochen."
  exit 0
fi

# Ganzes Maschinen-Verzeichnis der alten Backups entfernen
sudo rm -rf "$OLD"

echo ""
echo "Fertig. Freier Platz jetzt:"
df -h /Volumes/Backup | tail -1
echo ""
echo "Als Nächstes: Systemeinstellungen → Time Machine → Jetzt sichern"
echo "(Ziel: BACKUPMICRO)"
