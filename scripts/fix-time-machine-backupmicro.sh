#!/usr/bin/env bash
# Time Machine auf BACKUPMICRO reparieren: fehlgeschlagenes Backup löschen, Platz schaffen, neu starten.
#
# Am besten in der App „Terminal“ (nicht Cursor):
#   cd ~/k2Galerie && bash scripts/fix-time-machine-backupmicro.sh
#
# Falls „Full Disk Access“: Systemeinstellungen → Datenschutz & Sicherheit
# → Vollständiger Festplattenzugriff → Terminal (und ggf. Cursor) aktivieren.

set -e
VOL="/Volumes/BACKUPMICRO"
MACHINE_DIR="$VOL/Backups.backupdb/Georgs iMac"
PROJECT="$HOME/k2Galerie"

if [ ! -d "$VOL" ]; then
  echo "❌ BACKUPMICRO nicht angeschlossen. Bitte USB/Festplatte einstecken und erneut starten."
  exit 1
fi

echo "=== Vorher ==="
df -h "$VOL"
echo ""

run_admin() {
  local tmp
  tmp=$(mktemp /tmp/tmfix-admin.XXXXXX.sh)
  printf '%s\n' "$@" >"$tmp"
  chmod 700 "$tmp"
  /usr/bin/osascript -e "do shell script \"bash $(printf '%q' "$tmp")\" with administrator privileges"
  rm -f "$tmp"
}

echo "1/4 Time Machine anhalten …"
tmutil stopbackup 2>/dev/null || true

if [ -d "$MACHINE_DIR/2026-05-21-084744.inProgress" ] || ls -d "$MACHINE_DIR"/*.inProgress 2>/dev/null; then
  echo "2/4 Fehlgeschlagenes Backup (.inProgress) löschen …"
  run_admin "/usr/bin/tmutil deleteinprogress $(printf '%q' "$MACHINE_DIR")"
else
  echo "2/4 Kein .inProgress-Ordner – übersprungen."
fi

echo "3/4 Lokale Time-Machine-Schnappschüsse auf dem Mac löschen (weniger Daten beim nächsten Backup) …"
for snap in $(tmutil listlocalsnapshots / 2>/dev/null | sed 's/com.apple.TimeMachine.//'); do
  run_admin "/usr/bin/tmutil deletelocalsnapshots ${snap}" || true
done

echo "4/4 Schwere Projekt-Ordner von Time Machine ausschließen (optional, spart viel Platz) …"
if [ -d "$PROJECT/node_modules" ]; then
  tmutil addexclusion "$PROJECT/node_modules" 2>/dev/null || true
fi
if [ -d "$PROJECT/dist" ]; then
  tmutil addexclusion "$PROJECT/dist" 2>/dev/null || true
fi
if [ -d "$HOME/.cursor" ]; then
  tmutil addexclusion "$HOME/.cursor" 2>/dev/null || true
fi

echo ""
echo "=== Nachher ==="
df -h "$VOL"
echo ""
echo "✅ Fertig. Jetzt: Systemeinstellungen → Time Machine → „Jetzt sichern“ (oder warten bis automatisch)."
echo "   K2-Projekt-Backups (KL2-Galerie-Backups) auf der Platte – unberührt."
echo ""
echo "Falls der Admin-Schritt scheitert: nur dieser eine Befehl in Terminal.app:"
echo "  sudo tmutil deleteinprogress $(printf '%q' "$MACHINE_DIR")"
