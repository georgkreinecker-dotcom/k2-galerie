#!/bin/bash
# Git Push für gallery-data.json - Mit Status-Balken

cd /Users/georgkreinecker/k2Galerie || exit 1

# Stelle sicher dass Ausgabe sofort angezeigt wird
exec > >(tee -a /dev/tty)
exec 2>&1

# Farben für Terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Status-Balken Funktion - verbessert für bessere Sichtbarkeit
show_progress() {
    local current=$1
    local total=$2
    local step=$3
    local width=50
    local filled=$((current * width / total))
    local empty=$((width - filled))
    local percent=$((current * 100 / total))
    
    # Lösche vorherige Zeile und zeige neuen Status
    printf "\r\033[K"
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

# Lösche Bildschirm für bessere Sichtbarkeit
clear

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
    # Prüfe mit Python ob JSON gültig ist und Werke enthält
    ARTWORKS_COUNT=$(python3 -c "
import json
import sys
try:
    with open('public/gallery-data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    artworks = data.get('artworks', [])
    print(len(artworks))
except Exception as e:
    print('0')
    sys.exit(1)
" 2>/dev/null || echo "0")
    
    if [ "$ARTWORKS_COUNT" = "0" ]; then
        echo ""
        echo "${RED}❌ WARNUNG: Datei enthält keine Werke!${NC}"
        echo "${YELLOW}💡 Datei wurde geschrieben aber ist leer oder ungültig${NC}"
        echo "${YELLOW}💡 Bitte Werk speichern und erneut veröffentlichen${NC}"
        exit 1
    else
        echo "${GREEN}✅ Datei enthält ${ARTWORKS_COUNT} Werke${NC}"
    fi
elif command -v node &> /dev/null; then
    # Prüfe mit Node.js ob JSON gültig ist und Werke enthält
    ARTWORKS_COUNT=$(node -e "
try {
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('public/gallery-data.json', 'utf8'));
    const artworks = data.artworks || [];
    console.log(artworks.length);
} catch(e) {
    console.log('0');
    process.exit(1);
}" 2>/dev/null || echo "0")
    
    if [ "$ARTWORKS_COUNT" = "0" ]; then
        echo ""
        echo "${RED}❌ WARNUNG: Datei enthält keine Werke!${NC}"
        echo "${YELLOW}💡 Datei wurde geschrieben aber ist leer oder ungültig${NC}"
        echo "${YELLOW}💡 Bitte Werk speichern und erneut veröffentlichen${NC}"
        exit 1
    else
        echo "${GREEN}✅ Datei enthält ${ARTWORKS_COUNT} Werke${NC}"
    fi
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
# Aber die Datei muss auf main-fresh committed werden, dann zu main pushen
if [ "$CURRENT_BRANCH" = "main-fresh" ]; then
    echo ""
    echo "${YELLOW}ℹ️  Wir sind auf main-fresh${NC}"
    echo "${CYAN}Schritt 5/5:${NC} 🔄 Merge zu main und Push..."
    show_progress 5 5 "🔄 Merge zu main..."
    
    # Stelle sicher dass main Branch existiert
    if ! git show-ref --verify --quiet refs/heads/main; then
        echo "${CYAN}Erstelle main Branch von main-fresh...${NC}"
        git checkout -b main 2>/dev/null || git checkout main
        git reset --hard main-fresh
    else
        # Wechsle zu main und merge main-fresh
        git checkout main
        git merge main-fresh --no-edit
    fi
    
    # Pushe zu origin/main
    echo ""
    echo "${CYAN}📡 Pushe zu origin/main...${NC}"
    PUSH_OUTPUT=$(git push origin main --force-with-lease 2>&1)
    PUSH_STATUS=$?
    
    # Zurück zu main-fresh
    git checkout main-fresh
    
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
        if [ "$CURRENT_BRANCH_AFTER" != "main-fresh" ] && [ "$CURRENT_BRANCH_AFTER" != "main" ]; then
            echo "${YELLOW}⚠️  Unerwarteter Branch nach Push: ${CURRENT_BRANCH_AFTER}${NC}"
            echo "${CYAN}Wechsle zurück zu main-fresh...${NC}"
            git checkout main-fresh 2>/dev/null || true
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
    echo "${RED}❌ Git Push fehlgeschlagen${NC}"
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "${YELLOW}💡 Bitte manuell pushen:${NC}"
    echo "   ${CYAN}git add public/gallery-data.json${NC}"
    echo "   ${CYAN}git commit -m 'Update gallery-data.json'${NC}"
    if [ "$CURRENT_BRANCH" = "main-fresh" ]; then
        echo "   ${CYAN}git checkout main${NC}"
        echo "   ${CYAN}git merge main-fresh${NC}"
        echo "   ${CYAN}git push origin main${NC}"
        echo "   ${CYAN}git checkout main-fresh${NC}"
    else
        echo "   ${CYAN}git push origin main${NC}"
    fi
    echo ""
    echo "${RED}Fehler-Details:${NC}"
    echo "${RED}${PUSH_OUTPUT}${NC}"
    exit 1
fi
