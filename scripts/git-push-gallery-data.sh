#!/bin/bash
# Git Push für gallery-data.json - Mit Status-Balken

cd /Users/georgkreinecker/k2Galerie || exit 1

# WICHTIG: Stelle sicher dass Fehler IMMER ausgegeben werden
# Verwende exec um stdout/stderr zu erfassen, aber zeige auch auf Terminal
set -e  # Stoppe bei Fehlern
set -o pipefail  # Erfasse Fehler in Pipes

# Farben für Terminal - NUR wenn Ausgabe an Terminal geht (nicht bei API-Aufruf)
# Bei execSync/pipe ist stdout kein TTY → keine Farben = saubere Fehlermeldungen
if [ -t 1 ]; then
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  RED='\033[0;31m'
  BLUE='\033[0;34m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  NC='\033[0m'
else
  GREEN=''; YELLOW=''; RED=''; BLUE=''; CYAN=''; BOLD=''; NC=''
fi

# Status-Balken Funktion - verbessert für bessere Sichtbarkeit
show_progress() {
    local current=$1
    local total=$2
    local step=$3
    local width=50
    local filled=$((current * width / total))
    local empty=$((width - filled))
    local percent=$((current * 100 / total))
    
    # Lösche vorherige Zeile - nur bei Terminal (bei API: keine Control-Sequenzen)
    [ -t 1 ] && printf "\r\033[K"
    printf "${BOLD}${CYAN}["
    # Fülle Balken
    for ((i=0; i<filled; i++)); do
        printf "█"
    done
    # Leere Teile
    for ((i=0; i<empty; i++)); do
        printf "░"
    done
    printf "] ${percent}%% ${step}${NC}"
    # Wichtig: Flush Output sofort damit es sichtbar ist
    tput flush 2>/dev/null || true
}

# Backup-Funktion: Erstelle Backup der Datei vor Git-Operationen
backup_file() {
    local file=$1
    if [ -f "$file" ]; then
        local backup="${file}.backup.$(date +%s)"
        cp "$file" "$backup"
        echo "${CYAN}💾 Backup erstellt: ${backup}${NC}"
    fi
}

# Restore-Funktion: Stelle Datei wieder her falls sie verloren geht
restore_file() {
    local file=$1
    local backup=$(ls -t "${file}.backup."* 2>/dev/null | head -1)
    if [ -n "$backup" ] && [ ! -f "$file" ]; then
        cp "$backup" "$file"
        echo "${GREEN}✅ Datei wiederhergestellt aus Backup${NC}"
    fi
}

# Lösche Bildschirm - nur bei Terminal (bei API: nichts ausgeben)
[ -t 1 ] && clear

echo ""
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${BOLD}${BLUE}  🚀 Git Push für gallery-data.json${NC}${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "${CYAN}Status wird unten angezeigt...${NC}"
echo ""

# Schritt 1: Prüfe ob Datei existiert und erstelle Backup
echo "${CYAN}Schritt 1/5:${NC} 📁 Prüfe Datei..."
show_progress 1 5 "📁 Prüfe Datei..."
sleep 0.5

# Prüfe ob Datei existiert
if [ ! -f "public/gallery-data.json" ]; then
    echo ""
    echo "${RED}❌ Fehler: public/gallery-data.json nicht gefunden${NC}"
    echo "${YELLOW}💡 Prüfe ob Datei existiert:${NC}"
    echo "   ${CYAN}ls -la public/gallery-data.json${NC}"
    echo ""
    echo "${YELLOW}💡 Falls Datei fehlt:${NC}"
    echo "   1. Werk speichern → automatische Veröffentlichung"
    echo "   2. Oder manuell: Button '📦 Für Mobile veröffentlichen' klicken"
    exit 1
fi

FILE_SIZE=$(du -h "public/gallery-data.json" | cut -f1)
FILE_SIZE_BYTES=$(stat -f%z "public/gallery-data.json" 2>/dev/null || stat -c%s "public/gallery-data.json" 2>/dev/null || echo "0")

echo ""
echo "${GREEN}✅ Datei gefunden (${FILE_SIZE})${NC}"

# WICHTIG: Prüfe ob Datei leer ist
if [ "$FILE_SIZE_BYTES" -eq 0 ]; then
    echo ""
    echo "${RED}❌ WARNUNG: Datei ist leer!${NC}"
    echo "${YELLOW}💡 Datei wurde nicht richtig geschrieben${NC}"
    exit 1
fi

# WICHTIG: Prüfe ob Datei gültiges JSON ist und Werke enthält
echo ""
echo "${CYAN}🔍 Prüfe Datei-Inhalt...${NC}"
if command -v python3 &> /dev/null; then
    # Prüfe mit Python: Werke-Anzahl und ob Bilddaten (imageUrl) enthalten sind
    ARTWORKS_CHECK=$(python3 -c "
import json
import sys
try:
    with open('public/gallery-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    artworks = data.get('artworks', [])
    count = len(artworks)
    with_images = sum(1 for a in artworks if (a.get('imageUrl') or a.get('previewUrl')) and len(str(a.get('imageUrl') or a.get('previewUrl') or '')) > 50)
    gallery = data.get('gallery', {})
    has_gallery_images = bool(gallery.get('welcomeImage') or gallery.get('galerieCardImage') or gallery.get('virtualTourImage'))
    print(count, with_images, 1 if has_gallery_images else 0)
except Exception as e:
    print('0', '0', '0')
    sys.exit(1)
" 2>/dev/null || echo "0 0 0")
    ARTWORKS_COUNT=$(echo "$ARTWORKS_CHECK" | cut -d' ' -f1)
    WITH_IMAGES=$(echo "$ARTWORKS_CHECK" | cut -d' ' -f2)
    HAS_GALLERY_IMAGES=$(echo "$ARTWORKS_CHECK" | cut -d' ' -f3)
    
    if [ "$ARTWORKS_COUNT" = "0" ]; then
        echo ""
        echo "${RED}❌ WARNUNG: Datei enthält keine Werke!${NC}"
        echo "${YELLOW}💡 Bitte zuerst „Daten veröffentlichen“ klicken${NC}"
        exit 1
    fi
    if [ "$WITH_IMAGES" = "0" ] && [ "$HAS_GALLERY_IMAGES" = "0" ]; then
        echo ""
        echo "${RED}❌ WARNUNG: Keine Bilddaten in der Datei!${NC}"
        echo "${YELLOW}💡 Damit Bilder (Werke, Willkommen) auf Vercel/Handy ankommen:${NC}"
        echo "${YELLOW}   Zuerst „📁 Daten veröffentlichen“ klicken, dann erneut Code-Update.${NC}"
        exit 1
    fi
    echo "${GREEN}✅ ${ARTWORKS_COUNT} Werke, davon ${WITH_IMAGES} mit Bilddaten${NC}"
elif command -v node &> /dev/null; then
    ARTWORKS_CHECK=$(node -e "
try {
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('public/gallery-data.json', 'utf8'));
    const artworks = data.artworks || [];
    const withImages = artworks.filter(a => {
        const url = a.imageUrl || a.previewUrl || '';
        return url.length > 50;
    }).length;
    const g = data.gallery || {};
    const hasGalleryImages = !!(g.welcomeImage || g.galerieCardImage || g.virtualTourImage);
    console.log(artworks.length, withImages, hasGalleryImages ? 1 : 0);
} catch(e) {
    console.log('0', '0', '0');
    process.exit(1);
}" 2>/dev/null || echo "0 0 0")
    ARTWORKS_COUNT=$(echo "$ARTWORKS_CHECK" | cut -d' ' -f1)
    WITH_IMAGES=$(echo "$ARTWORKS_CHECK" | cut -d' ' -f2)
    HAS_GALLERY_IMAGES=$(echo "$ARTWORKS_CHECK" | cut -d' ' -f3)
    
    if [ "$ARTWORKS_COUNT" = "0" ]; then
        echo ""
        echo "${RED}❌ WARNUNG: Datei enthält keine Werke!${NC}"
        echo "${YELLOW}💡 Bitte zuerst „Daten veröffentlichen“ klicken${NC}"
        exit 1
    fi
    if [ "$WITH_IMAGES" = "0" ] && [ "$HAS_GALLERY_IMAGES" = "0" ]; then
        echo ""
        echo "${RED}❌ WARNUNG: Keine Bilddaten in der Datei!${NC}"
        echo "${YELLOW}💡 Zuerst „📁 Daten veröffentlichen“ klicken, dann erneut Code-Update.${NC}"
        exit 1
    fi
    echo "${GREEN}✅ ${ARTWORKS_COUNT} Werke, davon ${WITH_IMAGES} mit Bilddaten${NC}"
else
    echo "${YELLOW}⚠️  Kann Datei-Inhalt nicht prüfen (Python/Node nicht verfügbar)${NC}"
    echo "${CYAN}💡 Datei wird trotzdem gepusht...${NC}"
fi

# WICHTIG: Erstelle Backup bevor wir Git-Operationen durchführen
backup_file "public/gallery-data.json"
echo ""

# Schritt 2: Git add
echo "${CYAN}Schritt 2/5:${NC} 📦 git add..."
show_progress 2 5 "📦 git add..."
sleep 0.5

# Stelle sicher dass Datei noch existiert vor git add
if [ ! -f "public/gallery-data.json" ]; then
    echo ""
    echo "${RED}❌ Datei verschwunden vor git add! Stelle wieder her...${NC}"
    restore_file "public/gallery-data.json"
    if [ ! -f "public/gallery-data.json" ]; then
        echo "${RED}❌ Wiederherstellung fehlgeschlagen${NC}"
        exit 1
    fi
fi

git add public/gallery-data.json
if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}✅ Datei zum Staging hinzugefügt${NC}"
else
    echo ""
    echo "${RED}❌ git add fehlgeschlagen${NC}"
    exit 1
fi
echo ""

# Schritt 3: Git commit
echo "${CYAN}Schritt 3/5:${NC} 💾 git commit..."
show_progress 3 5 "💾 git commit..."
sleep 0.5

# Stelle sicher dass Datei noch existiert vor git commit
if [ ! -f "public/gallery-data.json" ]; then
    echo ""
    echo "${RED}❌ Datei verschwunden vor git commit! Stelle wieder her...${NC}"
    restore_file "public/gallery-data.json"
    if [ ! -f "public/gallery-data.json" ]; then
        echo "${RED}❌ Wiederherstellung fehlgeschlagen${NC}"
        exit 1
    fi
    # Datei nochmal adden
    git add public/gallery-data.json
fi

COMMIT_OUTPUT=$(git commit -m "Update gallery-data.json" 2>&1)
COMMIT_STATUS=$?

if [ $COMMIT_STATUS -eq 0 ]; then
    echo ""
    echo "${GREEN}✅ Commit erstellt${NC}"
elif [ $COMMIT_STATUS -eq 1 ]; then
    echo ""
    echo "${YELLOW}ℹ️  Keine Änderungen zu committen (Datei unverändert)${NC}"
    echo ""
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo "${GREEN}✅ Fertig - Keine Änderungen vorhanden${NC}"
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    exit 0
else
    echo ""
    echo "${RED}❌ git commit fehlgeschlagen${NC}"
    echo "${RED}Fehler: ${COMMIT_OUTPUT}${NC}"
    exit 1
fi
echo ""

# Schritt 4: Prüfe aktuellen Branch und pushe zu main
echo "${CYAN}Schritt 4/5:${NC} 🔍 Prüfe Branch..."
show_progress 4 5 "🔍 Prüfe Branch..."
sleep 0.5
CURRENT_BRANCH=$(git branch --show-current)
echo ""
echo "${CYAN}Aktueller Branch:${NC} ${CURRENT_BRANCH}"

# WICHTIG: Wenn wir auf main-fresh sind, müssen wir zu main pushen
# set +e damit wir bei Fehlern die Meldung ausgeben können (nicht sofort mit set -e beenden)
set +e
if [ "$CURRENT_BRANCH" = "main-fresh" ]; then
    echo ""
    echo "${YELLOW}ℹ️  Wir sind auf main-fresh${NC}"
    echo "${CYAN}Schritt 5/5:${NC} 🔄 Merge zu main und Push..."
    show_progress 5 5 "🔄 Merge zu main..."
    
    # Uncommitted Änderungen (z.B. buildInfo.generated.ts) zwischenspeichern
    STASHED=0
    if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
        echo ""
        echo "${CYAN}📦 Speichere lokale Änderungen temporär (stash)...${NC}"
        git stash push -m "gallery-push-temp" 2>/dev/null && STASHED=1 || true
    fi
    
    if ! git show-ref --verify --quiet refs/heads/main; then
        echo "${CYAN}Erstelle main Branch von main-fresh...${NC}"
        git checkout -b main 2>/dev/null || git checkout main
        git reset --hard main-fresh
    else
        git checkout main 2>&1
        CHECKOUT_OK=$?
        if [ $CHECKOUT_OK -ne 0 ]; then
            echo ""
            echo "${RED}❌ git checkout main fehlgeschlagen.${NC}"
            echo "${YELLOW}💡 Im Mac-Terminal ausführen: cd $(pwd) && bash scripts/git-push-gallery-data.sh${NC}"
            set -e
            exit 1
        fi
        git merge main-fresh --no-edit 2>&1
        MERGE_OK=$?
        if [ $MERGE_OK -ne 0 ]; then
            echo ""
            echo "${RED}❌ git merge fehlgeschlagen.${NC}"
            echo "${YELLOW}💡 Im Mac-Terminal ausführen: cd $(pwd) && bash scripts/git-push-gallery-data.sh${NC}"
            git checkout main-fresh 2>/dev/null || true
            set -e
            exit 1
        fi
    fi
    
    echo ""
    echo "${CYAN}📡 Pushe zu origin/main...${NC}"
    PUSH_OUTPUT=$(git push origin main --force-with-lease 2>&1)
    PUSH_STATUS=$?
    
    # Auf main bleiben (nicht zurück zu main-fresh) – ein Branch, dann funktioniert es immer
    if [ "$STASHED" = "1" ]; then
        echo ""
        echo "${CYAN}📦 Stelle lokale Änderungen wieder her...${NC}"
        git stash pop 2>/dev/null || true
    fi
    
elif [ "$CURRENT_BRANCH" = "main" ]; then
    echo ""
    echo "${CYAN}Schritt 5/5:${NC} 🚀 git push..."
    show_progress 5 5 "🚀 git push..."
    echo ""
    echo "${CYAN}📡 Verbinde mit GitHub...${NC}"
    PUSH_OUTPUT=$(git push origin main 2>&1)
    PUSH_STATUS=$?
else
    echo ""
    echo "${YELLOW}⚠️  Unerwarteter Branch: ${CURRENT_BRANCH}${NC}"
    echo "${CYAN}Versuche Push zu origin/main...${NC}"
    PUSH_OUTPUT=$(git push origin main 2>&1)
    PUSH_STATUS=$?
fi
set -e

# Prüfe ob Datei nach Push noch existiert UND Werke enthält
echo ""
echo "${CYAN}🔍 Prüfe ob Datei nach Push noch existiert...${NC}"
if [ -f "public/gallery-data.json" ]; then
    FILE_SIZE_AFTER=$(du -h "public/gallery-data.json" | cut -f1)
    FILE_SIZE_BYTES_AFTER=$(stat -f%z "public/gallery-data.json" 2>/dev/null || stat -c%s "public/gallery-data.json" 2>/dev/null || echo "0")
    
    echo "${GREEN}✅ Datei existiert noch (${FILE_SIZE_AFTER})${NC}"
    
    # Prüfe nochmal ob Werke vorhanden sind
    if command -v python3 &> /dev/null; then
        ARTWORKS_COUNT_AFTER=$(python3 -c "
import json
try:
    with open('public/gallery-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    artworks = data.get('artworks', [])
    print(len(artworks))
except:
    print('0')
" 2>/dev/null || echo "0")
        
        if [ "$ARTWORKS_COUNT_AFTER" = "0" ]; then
            echo "${RED}❌ WARNUNG: Datei existiert aber enthält keine Werke!${NC}"
            echo "${YELLOW}💡 Stelle Datei aus Backup wieder her...${NC}"
            restore_file "public/gallery-data.json"
        else
            echo "${GREEN}✅ Datei enthält noch ${ARTWORKS_COUNT_AFTER} Werke${NC}"
        fi
    elif command -v node &> /dev/null; then
        ARTWORKS_COUNT_AFTER=$(node -e "
try {
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('public/gallery-data.json', 'utf8'));
    const artworks = data.artworks || [];
    console.log(artworks.length);
} catch(e) {
    console.log('0');
}" 2>/dev/null || echo "0")
        
        if [ "$ARTWORKS_COUNT_AFTER" = "0" ]; then
            echo "${RED}❌ WARNUNG: Datei existiert aber enthält keine Werke!${NC}"
            echo "${YELLOW}💡 Stelle Datei aus Backup wieder her...${NC}"
            restore_file "public/gallery-data.json"
        else
            echo "${GREEN}✅ Datei enthält noch ${ARTWORKS_COUNT_AFTER} Werke${NC}"
        fi
    fi
    
    # Prüfe ob Datei leer wurde
    if [ "$FILE_SIZE_BYTES_AFTER" -eq 0 ]; then
        echo "${RED}❌ WARNUNG: Datei ist leer nach Push!${NC}"
        echo "${YELLOW}💡 Stelle Datei aus Backup wieder her...${NC}"
        restore_file "public/gallery-data.json"
    fi
else
    echo "${RED}❌ WARNUNG: Datei existiert nicht mehr nach Push!${NC}"
    echo "${YELLOW}💡 Stelle Datei aus Backup wieder her...${NC}"
    restore_file "public/gallery-data.json"
    if [ -f "public/gallery-data.json" ]; then
        echo "${GREEN}✅ Datei wiederhergestellt${NC}"
        # Stelle sicher dass wir auf dem richtigen Branch sind
        CURRENT_BRANCH_AFTER=$(git branch --show-current)
        if [ "$CURRENT_BRANCH_AFTER" != "main" ]; then
            echo "${YELLOW}⚠️  Branch nach Push: ${CURRENT_BRANCH_AFTER}${NC}"
            echo "${CYAN}Wechsle zu main (einziger Production-Branch)...${NC}"
            git checkout main 2>/dev/null || true
        fi
    else
        echo "${RED}❌ Wiederherstellung fehlgeschlagen${NC}"
        echo "${YELLOW}💡 Bitte Datei manuell wiederherstellen oder neu erstellen${NC}"
    fi
fi

if [ $PUSH_STATUS -eq 0 ]; then
    echo ""
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo "${GREEN}✅✅✅ Git Push erfolgreich!${NC}"
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    if [ "$CURRENT_BRANCH" = "main-fresh" ]; then
        echo "${GREEN}💚 Du bist jetzt auf main. Nur main verwenden – dann stimmt der Stand immer.${NC}"
        echo ""
    fi
    echo "${CYAN}⏳ Vercel Deployment startet automatisch (1-2 Minuten)${NC}"
    echo "${CYAN}📱 Mobile: Nach Deployment QR-Code neu scannen${NC}"
    echo ""
    echo "${YELLOW}💡 Falls Vercel Error:${NC}"
    echo "   1. Prüfe Build-Logs in Vercel Dashboard"
    echo "   2. Lokaler Build testen: npm run build"
    echo "   3. TypeScript-Fehler beheben falls vorhanden"
    echo ""
else
    echo ""
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo "${RED}❌ Git Push fehlgeschlagen (Exit Code: ${PUSH_STATUS})${NC}"
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "${YELLOW}💡 Bitte manuell pushen:${NC}"
    echo "   ${CYAN}git add public/gallery-data.json${NC}"
    echo "   ${CYAN}git commit -m 'Update gallery-data.json'${NC}"
    if [ "$CURRENT_BRANCH" != "main" ]; then
        echo "   ${CYAN}git checkout main${NC}"
        echo "   ${CYAN}git merge ${CURRENT_BRANCH}${NC}"
        echo "   ${CYAN}git push origin main${NC}"
    else
        echo "   ${CYAN}git push origin main${NC}"
    fi
    echo ""
    echo "${RED}═══════════════════════════════════════════════════════════${NC}"
    echo "${RED}FEHLER-DETAILS:${NC}"
    echo "${RED}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "${RED}Exit Code: ${PUSH_STATUS}${NC}"
    echo ""
    echo "${RED}Git Push Output:${NC}"
    echo "${RED}${PUSH_OUTPUT}${NC}"
    echo ""
    echo "${YELLOW}Mögliche Ursachen:${NC}"
    echo "   - Netzwerk-Problem"
    echo "   - GitHub Authentifizierung fehlgeschlagen"
    echo "   - Branch-Konflikt"
    echo "   - Repository nicht gefunden"
    echo ""
    echo "${CYAN}Debug-Info:${NC}"
    echo "   Branch: ${CURRENT_BRANCH}"
    echo "   Datei: public/gallery-data.json"
    echo "   Dateigröße: $(du -h public/gallery-data.json 2>/dev/null | cut -f1 || echo 'unbekannt')"
    echo ""
    exit 1
fi
