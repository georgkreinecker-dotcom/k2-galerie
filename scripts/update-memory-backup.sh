#!/bin/bash

# Update Memory Backup Script
# Aktualisiert das AI Memory Backup mit aktuellen Informationen

BACKUP_FILE="./backup/k2-ai-memory-backup.json"

echo "🔄 Aktualisiere AI Memory Backup..."

# Aktualisiere Timestamp
if [ -f "$BACKUP_FILE" ]; then
  # Verwende jq falls verfügbar, sonst sed
  if command -v jq &> /dev/null; then
    jq ".lastUpdated = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" "$BACKUP_FILE" > "$BACKUP_FILE.tmp" && mv "$BACKUP_FILE.tmp" "$BACKUP_FILE"
  else
    # Fallback: sed
    sed -i '' "s/\"lastUpdated\": \".*\"/\"lastUpdated\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"/" "$BACKUP_FILE"
  fi
  echo "✅ Backup aktualisiert: $BACKUP_FILE"
  echo "📋 Nächste Schritte:"
  echo "   1. Backup auf Server hochladen"
  echo "   2. Bei Cursor-Neustart: Backup wieder hochladen"
else
  echo "⚠️ Backup-Datei nicht gefunden: $BACKUP_FILE"
fi
