#!/usr/bin/env bash
# K2 Galerie – Programmcode auf backupmicro spiegeln (nicht Galeriedaten – die macht hard-backup-to-backupmicro.sh)
# Der Code ist das wertvollste; diese Spiegelung sichert src/, public/, docs/, Skripte, Konfiguration, .cursor/rules usw.
# Nutzung: backupmicro anstecken, dann im Terminal: bash scripts/backup-code-to-backupmicro.sh
#
# Automatisches Aufräumen: nur die jüngsten N Code-Spiegelungen (Ordnername mit Zeitstempel).
#   KEEP_CODE_BACKUPS=20 (Standard), Minimum 3. Abschalten: PRUNE_CODE_BACKUPS=0

set -e
cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"

# Alte k2-galerie-code--*- Ordner löschen (lexikographische Sortierung = chronologisch bei ISO-Datum im Namen)
prune_old_code_backups() {
  local base="$1"
  local keep="${KEEP_CODE_BACKUPS:-20}"
  case "${PRUNE_CODE_BACKUPS:-1}" in
    0|false|FALSE|no|NO) return 0 ;;
  esac
  case "$keep" in ''|*[!0-9]*) keep=20 ;; esac
  if [ "$keep" -lt 3 ] 2>/dev/null; then keep=3; fi
  local tmp
  tmp=$(mktemp)
  find "$base" -maxdepth 1 -type d -name 'k2-galerie-code--*' 2>/dev/null | sort >"$tmp" || true
  local total
  total=$(wc -l <"$tmp" | tr -d ' ')
  if [ "${total:-0}" -le "$keep" ] 2>/dev/null; then
    rm -f "$tmp"
    return 0
  fi
  local del=$((total - keep))
  local i=0
  while IFS= read -r d; do
    [ "$i" -ge "$del" ] && break
    if [ -n "$d" ] && [ -d "$d" ]; then
      echo "🗑️  Entferne alte Code-Spiegelung (Rotation): $(basename "$d")"
      rm -rf "$d"
    fi
    i=$((i + 1))
  done <"$tmp"
  rm -f "$tmp"
}

BACKUPMICRO="${BACKUPMICRO:-/Volumes/BACKUPMICRO}"

if [ ! -d "$BACKUPMICRO" ]; then
  echo "❌ BACKUPMICRO nicht gefunden: $BACKUPMICRO"
  echo "   Externen Speicher anstecken, dann erneut ausführen."
  exit 1
fi

# Wie hard-backup-to-backupmicro.sh: beschreibbarer Ordner (Volume-Root ist oft root-only → mkdir dort scheitert)
if [ -n "$1" ]; then
  CODE_BASE="${BACKUPMICRO}/$1"
else
  if [ -d "${BACKUPMICRO}/KL2-Galerie-Backups" ]; then
    BACKUP_BASE="${BACKUPMICRO}/KL2-Galerie-Backups"
  elif [ -d "${BACKUPMICRO}/KL2-Galerie-Backups " ]; then
    BACKUP_BASE="${BACKUPMICRO}/KL2-Galerie-Backups "
  elif [ -d "${BACKUPMICRO}/K2-Galerie-Backups" ]; then
    BACKUP_BASE="${BACKUPMICRO}/K2-Galerie-Backups"
  elif [ -d "${BACKUPMICRO}/Neuer Ordner" ]; then
    BACKUP_BASE="${BACKUPMICRO}/Neuer Ordner"
  else
    BACKUP_BASE="${BACKUPMICRO}/K2-Galerie-Backups"
  fi
  CODE_BASE="${BACKUP_BASE}/K2-Galerie-Code-Backups"
fi

if [ -z "$1" ] && [ ! -d "$BACKUP_BASE" ]; then
  echo "❌ Kein Galerie-Backup-Ordner auf $BACKUPMICRO (wie bei hard-backup)."
  echo "   Ordner anlegen oder: bash scripts/backup-code-to-backupmicro.sh MeinUnterordner"
  exit 1
fi

mkdir -p "$CODE_BASE"
TIMESTAMP=$(date +%Y-%m-%d--%H-%M)
TARGET="${CODE_BASE}/k2-galerie-code--${TIMESTAMP}"

echo "► Spiegele Programmcode nach backupmicro …"
echo "   Ziel: $TARGET"
echo ""

# Kopieren, node_modules und dist auslassen (spart Platz; npm install / build wiederherstellen)
rsync -a --delete \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.vite' \
  --exclude '*.log' \
  --exclude '.env.local' \
  --exclude '.env.*.local' \
  "$PROJECT_ROOT/" "$TARGET/" 2>/dev/null || {
  # Fallback ohne rsync (z. B. macOS ohne rsync): tar + cp
  echo "   (rsync nicht verfügbar, nutze tar …)"
  mkdir -p "$TARGET"
  tar cf - \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.vite' \
    --exclude='*.log' \
    --exclude='.env.local' \
    --exclude='.env.*.local' \
    -C "$PROJECT_ROOT" . 2>/dev/null | tar xf - -C "$TARGET"
}

prune_old_code_backups "$CODE_BASE"

echo "✅ Code-Backup erstellt: $TARGET"
echo "   Enthält: .git (Verlauf), src/, public/, docs/, scripts/, .cursor/rules, Konfiguration."
echo "   Nicht enthalten: node_modules, dist (nach Restore: npm install, npm run build)."
if [ "${PRUNE_CODE_BACKUPS:-1}" != "0" ] && [ "${PRUNE_CODE_BACKUPS:-1}" != "false" ]; then
  echo "   (Rotation: es bleiben die letzten ${KEEP_CODE_BACKUPS:-20} Code-Ordner auf backupmicro.)"
fi
echo ""
