#!/bin/bash
# EINMALIG: Erlaubt Joe, die mac-admin-Skripte ohne jedes Mal Passwort zu starten.
# Du tippst das Mac-Passwort NUR bei diesem einen Setup. Danach nie wieder für diese Skripte.
# Im Mac-Terminal:
#   bash "/Users/georgkreinecker/k2Galerie/scripts/mac-admin/install-sudoers-mac-admin.sh"

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
USER_NAME="$(whoami)"
SUDOERS_FILE="/etc/sudoers.d/k2-mac-admin"

echo "Richte einmalige Freigabe für mac-admin-Skripte ein…"
echo "Benutzer: $USER_NAME"
echo "Ordner:   $SCRIPT_DIR"
echo ""

TMP=$(mktemp)
cat >"$TMP" <<EOF
# K2 Galerie – Joe darf System-Hilfsskripte ohne Passwort (nur dieser Ordner)
# Erzeugt: $(date '+%Y-%m-%d')
${USER_NAME} ALL=(root) NOPASSWD: ${SCRIPT_DIR}/alte-tm-backups-backup-volume-loeschen.sh
${USER_NAME} ALL=(root) NOPASSWD: /bin/bash ${SCRIPT_DIR}/alte-tm-backups-backup-volume-loeschen.sh *
EOF

echo "Inhalt der Freigabe:"
cat "$TMP"
echo ""

sudo cp "$TMP" "$SUDOERS_FILE"
sudo chmod 440 "$SUDOERS_FILE"
sudo chown root:wheel "$SUDOERS_FILE"
# Syntax prüfen
sudo visudo -cf "$SUDOERS_FILE"
rm -f "$TMP"

echo ""
echo "✅ Fertig. Ab jetzt kann Joe die Backup-Aufräum-Skripte selbst starten."
echo "Test (soll ohne Passwort gehen):"
echo "  sudo -n ${SCRIPT_DIR}/alte-tm-backups-backup-volume-loeschen.sh --yes"
