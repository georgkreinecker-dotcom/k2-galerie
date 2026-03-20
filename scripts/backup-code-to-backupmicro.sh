#!/usr/bin/env bash
# K2 Galerie – Programmcode auf backupmicro spiegeln (nicht Galeriedaten – die macht hard-backup-to-backupmicro.sh)
# Der Code ist das wertvollste; diese Spiegelung sichert src/, public/, docs/, Skripte, Konfiguration, .cursor/rules usw.
# Nutzung: backupmicro anstecken, dann im Terminal: bash scripts/backup-code-to-backupmicro.sh

set -e
cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"

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

echo "✅ Code-Backup erstellt: $TARGET"
echo "   Enthält: .git (Verlauf), src/, public/, docs/, scripts/, .cursor/rules, Konfiguration."
echo "   Nicht enthalten: node_modules, dist (nach Restore: npm install, npm run build)."
echo ""
