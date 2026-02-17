#!/usr/bin/env bash
# K2 Galerie – Hard-Backup mit Versionsnummer auf backupmicro (externer Speicher)
# Nur auf backupmicro ablegen, nicht auf dem Mac (Speicher schonen).
# Nutzung: Im Terminal am Mac (im Projektordner): bash scripts/hard-backup-to-backupmicro.sh

set -e
cd "$(dirname "$0")/.."
PROJECT_ROOT="$(pwd)"

# Laufwerk wie auf dem Desktop: „BACKUPMICRO“ → /Volumes/BACKUPMICRO
BACKUPMICRO="${BACKUPMICRO:-/Volumes/BACKUPMICRO}"
# Ordner: 1. Argument (einfach: bash script.sh KL2-Galerie-Backups), 2. BACKUP_ORDNER, 3. Auto
if [ -n "$1" ]; then
  BACKUP_BASE="${BACKUPMICRO}/$1"
elif [ -n "$BACKUP_ORDNER" ]; then
  BACKUP_BASE="${BACKUPMICRO}/${BACKUP_ORDNER}"
elif [ -d "${BACKUPMICRO}/KL2-Galerie-Backups" ]; then
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
VERSION_FILE="${BACKUP_BASE}/LATEST_VERSION"
GALLERY_JSON="${PROJECT_ROOT}/public/gallery-data.json"
VOLLBACKUP_OPTIONAL="${PROJECT_ROOT}/backup/k2-vollbackup-latest.json"

if [ ! -d "$BACKUPMICRO" ]; then
  echo "❌ BACKUPMICRO nicht gefunden: $BACKUPMICRO"
  echo "   Bitte externen Speicher BACKUPMICRO anstecken (sollte auf dem Desktop erscheinen)."
  echo "   Oder: BACKUPMICRO=/Pfad/zum/Laufwerk bash scripts/hard-backup-to-backupmicro.sh"
  exit 1
fi

# Hauptordner muss im Finder existieren – Terminal darf auf BACKUPMICRO oft keinen Ordner anlegen
if [ ! -d "$BACKUP_BASE" ]; then
  echo "❌ Kein Backup-Ordner gefunden auf: $BACKUPMICRO"
  echo ""
  echo "   Inhalt von BACKUPMICRO (damit du den exakten Ordnernamen siehst):"
  ls -la "$BACKUPMICRO" 2>/dev/null || echo "   (Konnte Verzeichnis nicht lesen)"
  echo ""
  echo "   Mit Ordner-Namen starten (alles in eine Zeile kopieren):"
  echo "   bash scripts/hard-backup-to-backupmicro.sh KL2-Galerie-Backups"
  echo ""
  echo "   Oder anderen Ordnernamen eintippen statt KL2-Galerie-Backups."
  echo ""
  exit 1
fi

if [ ! -f "$GALLERY_JSON" ]; then
  echo "❌ Datei nicht gefunden: $GALLERY_JSON"
  echo "   Zuerst im Admin einmal „Veröffentlichen“ ausführen, damit gallery-data.json existiert."
  exit 1
fi

mkdir -p "$BACKUP_BASE"

# Nächste Versionsnummer: LATEST_VERSION lesen oder aus Ordnern v001, v002, ... ermitteln
NEXT=1
if [ -f "$VERSION_FILE" ]; then
  NEXT=$(($(cat "$VERSION_FILE") + 1))
fi
for d in "${BACKUP_BASE}"/v[0-9][0-9][0-9]*; do
  [ -d "$d" ] || continue
  n="${d##*v}"
  n="${n%%--*}"
  if [ -n "$n" ] && [ "$n" -ge "$NEXT" ] 2>/dev/null; then
    NEXT=$((n + 1))
  fi
done

VERSION_LABEL=$(printf "v%03d" "$NEXT")
TIMESTAMP=$(date +%Y-%m-%d--%H-%M)
BACKUP_DIR="${BACKUP_BASE}/${VERSION_LABEL}--${TIMESTAMP}"
if ! mkdir -p "$BACKUP_DIR" 2>/dev/null; then
  echo "❌ Konnte Unterordner nicht anlegen: $BACKUP_DIR"
  echo "   Bitte prüfen: Ist BACKUPMICRO beschreibbar? Im Finder einen Testordner anlegen."
  exit 1
fi

cp "$GALLERY_JSON" "${BACKUP_DIR}/gallery-data.json"
if [ -f "$VOLLBACKUP_OPTIONAL" ]; then
  cp "$VOLLBACKUP_OPTIONAL" "${BACKUP_DIR}/k2-vollbackup.json"
fi

# Kurzinfo aus gallery-data.json (Anzahl Werke etc.) – aus Projektdatei vor dem Kopieren
ARTWORKS_COUNT=0
EVENTS_COUNT=0
DOCS_COUNT=0
if command -v node >/dev/null 2>&1; then
  ARTWORKS_COUNT=$(node -e "try { const fs=require('fs'); const d=JSON.parse(fs.readFileSync('${GALLERY_JSON}','utf8')); console.log(Array.isArray(d.artworks)?d.artworks.length:0) } catch(e){ console.log(0) }" 2>/dev/null || echo "0")
  EVENTS_COUNT=$(node -e "try { const fs=require('fs'); const d=JSON.parse(fs.readFileSync('${GALLERY_JSON}','utf8')); console.log(Array.isArray(d.events)?d.events.length:0) } catch(e){ console.log(0) }" 2>/dev/null || echo "0")
  DOCS_COUNT=$(node -e "try { const fs=require('fs'); const d=JSON.parse(fs.readFileSync('${GALLERY_JSON}','utf8')); console.log(Array.isArray(d.documents)?d.documents.length:0) } catch(e){ console.log(0) }" 2>/dev/null || echo "0")
fi

FIRST_VERSION_NOTE=""
[ "$NEXT" = "1" ] && FIRST_VERSION_NOTE="
► Erste vollständige Version K2 Galerie (Vollbackup)"

cat > "${BACKUP_DIR}/MANIFEST.txt" << EOF
K2 Galerie – Hard-Backup (Vollbackup)
Version: ${VERSION_LABEL}
Datum:   $(date +%Y-%m-%d\ %H:%M)
Speicher: backupmicro (extern)
${FIRST_VERSION_NOTE}

Inhalt:
  gallery-data.json (Stammdaten, Werke, Events, Dokumente, Design, Seitentexte)
  $( [ -f "$VOLLBACKUP_OPTIONAL" ] && echo "  k2-vollbackup.json (App-Vollbackup)" )
  Werke: ${ARTWORKS_COUNT}
  Events: ${EVENTS_COUNT}
  Dokumente: ${DOCS_COUNT}

Wiederherstellung: Im Admin → Einstellungen → Backup & Wiederherstellung
oder gallery-data.json ins Projekt public/ kopieren und erneut veröffentlichen.
EOF

echo "$NEXT" > "$VERSION_FILE"
echo "✅ Hard-Backup erstellt: ${VERSION_LABEL}"
echo "   Speicherort: ${BACKUP_DIR}"
echo "   (nur auf backupmicro, nicht auf dem Mac)"
echo ""
echo "Nächste Version wird: v$(printf '%03d' $((NEXT + 1)))"
