#!/bin/bash
# Git Push für ALLE Änderungen - Mit Status-Balken

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

# Status-Balken Funktion
show_progress() {
    local current=$1
    local total=$2
    local step=$3
    local width=50
    local filled=$((current * width / total))
    local empty=$((width - filled))
    local percent=$((current * 100 / total))
    
    printf "\r\033[K"
    printf "${BOLD}${CYAN}["
    for ((i=0; i<filled; i++)); do
        printf "█"
    done
    for ((i=0; i<empty; i++)); do
        printf "░"
    done
    printf "] ${percent}%% ${step}${NC}"
    tput flush 2>/dev/null || true
}

clear

echo ""
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${BOLD}${BLUE}  🚀 Git Push für ALLE Änderungen${NC}${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Schritt 1: Prüfe ob es Änderungen gibt
echo "${CYAN}Schritt 1/4:${NC} 📁 Prüfe Änderungen..."
show_progress 1 4 "📁 Prüfe Änderungen..."
sleep 0.5

CHANGED_FILES=$(git status --short | wc -l | tr -d ' ')
if [ "$CHANGED_FILES" -eq 0 ]; then
    echo ""
    echo "${YELLOW}ℹ️  Keine Änderungen vorhanden${NC}"
    exit 0
fi

echo ""
echo "${GREEN}✅ ${CHANGED_FILES} Dateien geändert${NC}"
echo ""

# Schritt 2: Git add alle Änderungen
echo "${CYAN}Schritt 2/4:${NC} 📦 git add..."
show_progress 2 4 "📦 git add..."
sleep 0.5

git add .
if [ $? -eq 0 ]; then
    echo ""
    echo "${GREEN}✅ Alle Dateien zum Staging hinzugefügt${NC}"
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

COMMIT_MESSAGE="Update: Neue Features (SmartPanel, Sync-Status, QR-Code Fix)"
git commit -m "$COMMIT_MESSAGE"
COMMIT_STATUS=$?

if [ $COMMIT_STATUS -eq 0 ]; then
    echo ""
    echo "${GREEN}✅ Commit erstellt${NC}"
else
    echo ""
    echo "${RED}❌ git commit fehlgeschlagen${NC}"
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
    echo "${CYAN}🌐 Browser: Cache leeren (Cmd+Shift+R)${NC}"
    echo ""
else
    echo ""
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo "${RED}❌ Git Push fehlgeschlagen${NC}"
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "${RED}Fehler-Details:${NC}"
    echo "${RED}${PUSH_OUTPUT}${NC}"
    exit 1
fi
