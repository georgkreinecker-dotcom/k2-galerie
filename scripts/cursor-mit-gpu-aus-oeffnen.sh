#!/usr/bin/env bash
# Cursor mit deaktivierter GPU starten (reduziert Code-5-Crashes).
# Empfohlen vom Cursor-Forum (Staff). Einmal ausführen statt Cursor normal zu öffnen.

set -e
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

if command -v cursor &>/dev/null; then
  cursor --disable-gpu "$PROJECT_DIR"
elif [ -x "/Applications/Cursor.app/Contents/MacOS/Cursor" ]; then
  "/Applications/Cursor.app/Contents/MacOS/Cursor" --disable-gpu "$PROJECT_DIR"
else
  echo "Cursor nicht gefunden (weder 'cursor' im PATH noch /Applications/Cursor.app)."
  exit 1
fi
