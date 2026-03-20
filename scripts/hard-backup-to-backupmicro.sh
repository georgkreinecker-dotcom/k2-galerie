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
GALLERY_BYTES=$(wc -c < "$GALLERY_JSON" | tr -d ' ' || echo "0")
if command -v node >/dev/null 2>&1; then
  ARTWORKS_COUNT=$(node -e "try { const fs=require('fs'); const d=JSON.parse(fs.readFileSync('${GALLERY_JSON}','utf8')); console.log(Array.isArray(d.artworks)?d.artworks.length:0) } catch(e){ console.log(0) }" 2>/dev/null || echo "0")
  EVENTS_COUNT=$(node -e "try { const fs=require('fs'); const d=JSON.parse(fs.readFileSync('${GALLERY_JSON}','utf8')); console.log(Array.isArray(d.events)?d.events.length:0) } catch(e){ console.log(0) }" 2>/dev/null || echo "0")
  DOCS_COUNT=$(node -e "try { const fs=require('fs'); const d=JSON.parse(fs.readFileSync('${GALLERY_JSON}','utf8')); console.log(Array.isArray(d.documents)?d.documents.length:0) } catch(e){ console.log(0) }" 2>/dev/null || echo "0")
fi
VOLLBACKUP_HINWEIS="(nicht dabei – siehe unten „Mehr Daten“)"
if [ -f "$VOLLBACKUP_OPTIONAL" ]; then
  VOLL_BYTES=$(wc -c < "$VOLLBACKUP_OPTIONAL" | tr -d ' ' || echo "0")
  VOLLBACKUP_HINWEIS="ja, ${VOLL_BYTES} Bytes als k2-vollbackup.json"
fi

FIRST_VERSION_NOTE=""
[ "$NEXT" = "1" ] && FIRST_VERSION_NOTE="
► Erste vollständige Version K2 Galerie (Vollbackup)"

cat > "${BACKUP_DIR}/MANIFEST.txt" << EOF
K2 Galerie – Hard-Backup (Versionsordner auf backupmicro)
Version: ${VERSION_LABEL}
Datum:   $(date +%Y-%m-%d\ %H:%M)
Speicher: backupmicro (extern)
${FIRST_VERSION_NOTE}

Dateien in diesem Ordner:
  gallery-data.json  (${GALLERY_BYTES} Bytes) = veröffentlichter Stand wie für Vercel
  $( [ -f "$VOLLBACKUP_OPTIONAL" ] && echo "k2-vollbackup.json  = App-Vollbackup (localStorage K2, aus Admin exportiert)" || echo "(kein k2-vollbackup.json – nur wenn du backup/k2-vollbackup-latest.json im Projekt legst)" )
  MANIFEST.txt       = diese Erklärung

Inhalt gallery-data (Auszug):
  Werke: ${ARTWORKS_COUNT}   Events: ${EVENTS_COUNT}   Dokumente: ${DOCS_COUNT}

Warum die JSON oft „klein“ wirkt (z. B. unter 100 KB):
  Beim Veröffentlichen werden Bilder nicht als riesige Base64 mitgeschickt, sondern
  meist als Pfade (/img/k2/…). Das ist gewollt – gleicher Stand wie online, wenig MB.

App-Vollbackup dazu (${VOLLBACKUP_HINWEIS}):
  Admin → Einstellungen → Backup → „Vollbackup herunterladen“ → die Datei im Projekt als
  backup/k2-vollbackup-latest.json speichern → Hard-Backup erneut ausführen → dann liegt
  k2-vollbackup.json zusätzlich in diesem Versionsordner.

Programmcode separat (ganzes Repo mit .git):
  Im Projekt: bash scripts/backup-code-to-backupmicro.sh
  (eigener Ordner K2-Galerie-Code-Backups auf backupmicro)

Wiederherstellung Galerie-Daten:
  Admin → Backup & Wiederherstellung  oder  gallery-data.json nach public/ und veröffentlichen.
EOF

echo "$NEXT" > "$VERSION_FILE"
echo "✅ Hard-Backup erstellt: ${VERSION_LABEL}"
echo "   Speicherort: ${BACKUP_DIR}"
echo "   gallery-data.json: ${GALLERY_BYTES} Bytes (veröffentlichter Stand – klein ist normal)"
echo "   (nur auf backupmicro, nicht auf dem Mac)"
if [ ! -f "$VOLLBACKUP_OPTIONAL" ]; then
  echo ""
  echo "ℹ️  Mehr Daten auf backupmicro:"
  echo "   • App-Vollbackup: Admin → Vollbackup laden → als backup/k2-vollbackup-latest.json ins Projekt → Skript nochmal."
  echo "   • Code: bash scripts/backup-code-to-backupmicro.sh"
fi
echo ""
echo "Nächste Version wird: v$(printf '%03d' $((NEXT + 1)))"
