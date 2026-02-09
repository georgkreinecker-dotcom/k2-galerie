#!/bin/bash
# Einfache Lösung: Push main-fresh zu main (für Vercel)

cd /Users/georgkreinecker/k2Galerie || exit 1

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${BOLD}${BLUE}  🚀 Push main-fresh zu main für Vercel${NC}${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Schritt 1: Stelle sicher dass wir auf main-fresh sind
CURRENT_BRANCH=$(git branch --show-current)
echo "${CYAN}Aktueller Branch:${NC} ${CURRENT_BRANCH}"

if [ "$CURRENT_BRANCH" != "main-fresh" ]; then
    echo "${YELLOW}⚠️  Wechsle zu main-fresh...${NC}"
    git checkout main-fresh
    if [ $? -ne 0 ]; then
        echo "${RED}❌ Branch-Wechsel fehlgeschlagen${NC}"
        exit 1
    fi
fi
echo ""

# Schritt 2: Alle Änderungen adden und committen
echo "${CYAN}Schritt 1/3:${NC} 📦 git add..."
git add .
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Änderungen zum Staging hinzugefügt${NC}"
else
    echo "${RED}❌ git add fehlgeschlagen${NC}"
    exit 1
fi
echo ""

echo "${CYAN}Schritt 2/3:${NC} 💾 git commit..."
git commit -m "Update: Mobile Synchronisation & GitHub Token Button" 2>&1
COMMIT_STATUS=$?
if [ $COMMIT_STATUS -eq 0 ]; then
    echo "${GREEN}✅ Commit erstellt${NC}"
elif [ $COMMIT_STATUS -eq 1 ]; then
    echo "${YELLOW}ℹ️  Keine Änderungen zu committen${NC}"
else
    echo "${RED}❌ git commit fehlgeschlagen${NC}"
    exit 1
fi
echo ""

# Schritt 3: Push main-fresh zu main (force wenn nötig)
echo "${CYAN}Schritt 3/3:${NC} 🚀 Push zu main..."
echo "${YELLOW}💡 Hinweis: main-fresh wird zu main gepusht${NC}"
echo ""

# Prüfe ob main Branch lokal existiert
if git show-ref --verify --quiet refs/heads/main; then
    echo "${CYAN}Lösche lokalen main Branch...${NC}"
    git branch -D main 2>/dev/null
fi

# Erstelle main Branch von main-fresh
echo "${CYAN}Erstelle main Branch von main-fresh...${NC}"
git checkout -b main 2>/dev/null || git checkout main
git reset --hard main-fresh
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ main Branch erstellt/aktualisiert${NC}"
else
    echo "${RED}❌ Branch-Erstellung fehlgeschlagen${NC}"
    exit 1
fi
echo ""

# Push zu origin/main
echo "${CYAN}Push zu origin/main...${NC}"
git push origin main --force-with-lease
PUSH_STATUS=$?

if [ $PUSH_STATUS -eq 0 ]; then
    echo ""
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo "${GREEN}✅✅✅ Push zu main erfolgreich!${NC}"
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "${CYAN}⏳ Vercel Deployment startet automatisch (1-2 Minuten)${NC}"
    echo "${CYAN}📱 Mobile: Nach Deployment QR-Code neu scannen${NC}"
    echo ""
    echo "${YELLOW}💡 Prüfe Deployment Status:${NC}"
    echo "   ${CYAN}https://vercel.com/dashboard${NC}"
    echo ""
    
    # Zurück zu main-fresh
    git checkout main-fresh
    echo "${CYAN}Zurück zu main-fresh Branch${NC}"
else
    echo ""
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo "${RED}❌ Git Push fehlgeschlagen${NC}"
    echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "${YELLOW}💡 Mögliche Ursachen:${NC}"
    echo "   - GitHub Token fehlt oder ist falsch"
    echo "   - Keine Berechtigung für Push"
    echo "   - Netzwerk-Problem"
    echo ""
    echo "${YELLOW}💡 Prüfe Token:${NC}"
    echo "   ${CYAN}https://github.com/settings/tokens${NC}"
    echo ""
    
    # Zurück zu main-fresh
    git checkout main-fresh
    exit 1
fi
