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

# Lösche Bildschirm für bessere Sichtbarkeit
clear

echo ""
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${BOLD}${BLUE}  🚀 Git Push für gallery-data.json${NC}${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "${CYAN}Status wird unten angezeigt...${NC}"
echo ""

# Schritt 1: Prüfe ob Datei existiert
echo "${CYAN}Schritt 1/4:${NC} 📁 Prüfe Datei..."
show_progress 1 4 "📁 Prüfe Datei..."
sleep 0.5
if [ ! -f "public/gallery-data.json" ]; then
    echo ""
    echo "${RED}❌ Fehler: public/gallery-data.json nicht gefunden${NC}"
    exit 1
fi
FILE_SIZE=$(du -h "public/gallery-data.json" | cut -f1)
echo ""
echo "${GREEN}✅ Datei gefunden (${FILE_SIZE})${NC}"
echo ""

# Schritt 2: Git add
echo "${CYAN}Schritt 2/4:${NC} 📦 git add..."
show_progress 2 4 "📦 git add..."
sleep 0.5
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
echo "${CYAN}Schritt 3/4:${NC} 💾 git commit..."
show_progress 3 4 "💾 git commit..."
sleep 0.5
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

# Schritt 4: Git push
echo "${CYAN}Schritt 4/4:${NC} 🚀 git push..."
show_progress 4 4 "🚀 git push..."
echo ""
echo "${CYAN}📡 Verbinde mit GitHub...${NC}"
PUSH_OUTPUT=$(git push origin main 2>&1)
PUSH_STATUS=$?

if [ $PUSH_STATUS -eq 0 ]; then
    echo ""
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo "${GREEN}✅✅✅ Git Push erfolgreich!${NC}"
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "${CYAN}⏳ Vercel Deployment startet automatisch (1-2 Minuten)${NC}"
    echo "${CYAN}📱 Mobile: Nach Deployment QR-Code neu scannen${NC}"
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
    echo "   ${CYAN}git push origin main${NC}"
    echo ""
    echo "${RED}Fehler-Details:${NC}"
    echo "${RED}${PUSH_OUTPUT}${NC}"
    exit 1
fi
