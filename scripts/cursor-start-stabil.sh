
#!/bin/bash
# Cursor mit GPU aus starten – reduziert Code-5-Crashes (Lösung aus Cursor-Forum).
#
# Nutzung (von überall):
#   bash /Users/georgkreinecker/k2Galerie/scripts/cursor-start-stabil.sh
# Oder zuerst in den Projektordner wechseln, dann:
#   cd /Users/georgkreinecker/k2Galerie
#   bash scripts/cursor-start-stabil.sh

REPO="$(cd "$(dirname "$0")/.." && pwd)"
open -a Cursor --args --disable-gpu "$REPO"
