#!/usr/bin/env bash
# Einmal ausführen → pusht aktuellen Stand zu main, Vercel baut dann die Production-Version.
# Im Cursor-Terminal: bash scripts/vercel-production-push.sh
set -e
cd "$(dirname "$0")/.."
echo "Push zu main (Vercel Production) …"
git push origin main
echo "✅ Fertig. Vercel baut jetzt; in 1–2 Min. QR-Code scannen → aktueller Stand."
