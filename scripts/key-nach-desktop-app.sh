#!/bin/bash
# Kopiert openai-key.txt aus Downloads nach ~/.k2-galerie/ (für K2 Dialog Desktop-App)
DOWNLOADS="$HOME/Downloads"
TARGET="$HOME/.k2-galerie/openai-key.txt"
mkdir -p "$HOME/.k2-galerie"
if [[ -f "$DOWNLOADS/openai-key.txt" ]]; then
  cp "$DOWNLOADS/openai-key.txt" "$TARGET"
  echo "Key nach ~/.k2-galerie/openai-key.txt kopiert. K2 Dialog (Desktop) kann ihn jetzt nutzen."
else
  echo "Nicht gefunden: $DOWNLOADS/openai-key.txt"
  echo "Bitte zuerst im Control Studio auf „Key für K2 Dialog (Desktop) herunterladen“ klicken."
  exit 1
fi
