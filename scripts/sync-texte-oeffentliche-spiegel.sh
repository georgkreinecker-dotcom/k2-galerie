#!/usr/bin/env bash
# Texte & Kampagne: docs = einzige Bearbeitungs-Quelle, public/ = Auslieferung für die App.
# Nach Änderungen an KOMMUNIKATION-*.md, Kampagne-Index oder Georgs Notizen ausführen:
#   npm run sync:texte-oeffentlich
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
KAMP="$ROOT/public/kampagne-marketing-strategie"
NOTIZ="$ROOT/public/notizen-georg"

mkdir -p "$KAMP" "$NOTIZ/diverses"

cp "$ROOT/docs/KOMMUNIKATION-DOKUMENTE-STRUKTUR.md" "$KAMP/"
cp "$ROOT/docs/KOMMUNIKATION-VORLAGE-ANSPRACHE-KUENSTLER-VEREIN.md" "$KAMP/"
cp "$ROOT/docs/KOMMUNIKATION-FLYER-HANDOUT.md" "$KAMP/"
cp "$ROOT/docs/KOMMUNIKATION-EMAIL-VORLAGEN.md" "$KAMP/"
cp "$ROOT/docs/KOMMUNIKATION-FERTIGE-BEISPIELE.md" "$KAMP/"
cp "$ROOT/docs/AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md" "$KAMP/"
cp "$ROOT/docs/MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md" "$KAMP/"
cp "$ROOT/docs/kampagne-marketing-strategie/00-INDEX.md" "$KAMP/"

rsync -a --delete "$ROOT/docs/notizen-georg/" "$NOTIZ/"

mkdir -p "$ROOT/public/k2team-handbuch"
cp "$ROOT/k2team-handbuch/24-TEXTE-BRIEFE-KOMPASS.md" "$ROOT/public/k2team-handbuch/"

echo "OK: public-Spiegel aktualisiert (kampagne-marketing-strategie + notizen-georg + k2team-handbuch Kompass)."
