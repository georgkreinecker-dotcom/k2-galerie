#!/bin/bash
# Push zu main Branch und stelle sicher dass Vercel deployed

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
echo "${BOLD}${BLUE}  🚀 Push zu main Branch für Vercel Deployment${NC}${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Aktueller Branch
CURRENT_BRANCH=$(git branch --show-current)
echo "${CYAN}Aktueller Branch:${NC} ${CURRENT_BRANCH}"
echo ""

# Schritt 1: Alle Änderungen adden
echo "${CYAN}Schritt 1/5:${NC} 📦 git add..."
git add .
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Alle Änderungen zum Staging hinzugefügt${NC}"
else
    echo "${RED}❌ git add fehlgeschlagen${NC}"
    exit 1
fi
echo ""

# Schritt 2: Commit erstellen
echo "${CYAN}Schritt 2/5:${NC} 💾 git commit..."
git commit -m "Update: Mobile Synchronisation & GitHub Token Button"
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Commit erstellt${NC}"
else
    echo "${YELLOW}ℹ️  Keine Änderungen zu committen${NC}"
fi
echo ""

# Schritt 3: Prüfe ob main Branch existiert
echo "${CYAN}Schritt 3/5:${NC} 🔍 Prüfe Branches..."
if git show-ref --verify --quiet refs/heads/main; then
    echo "${GREEN}✅ main Branch existiert${NC}"
    MAIN_EXISTS=true
else
    echo "${YELLOW}⚠️  main Branch existiert nicht${NC}"
    MAIN_EXISTS=false
fi
echo ""

# Schritt 4: Merge oder Push
if [ "$CURRENT_BRANCH" != "main" ]; then
    if [ "$MAIN_EXISTS" = true ]; then
        echo "${CYAN}Schritt 4/5:${NC} 🔀 Merge zu main..."
        git checkout main
        if [ $? -eq 0 ]; then
            git merge $CURRENT_BRANCH --no-edit
            if [ $? -eq 0 ]; then
                echo "${GREEN}✅ Merge erfolgreich${NC}"
            else
                echo "${RED}❌ Merge fehlgeschlagen${NC}"
                git checkout $CURRENT_BRANCH
                exit 1
            fi
        else
            echo "${RED}❌ Branch-Wechsel fehlgeschlagen${NC}"
            exit 1
        fi
    else
        echo "${CYAN}Schritt 4/5:${NC} 🔀 Erstelle main Branch..."
        git checkout -b main
        if [ $? -eq 0 ]; then
            echo "${GREEN}✅ main Branch erstellt${NC}"
        else
            echo "${RED}❌ Branch-Erstellung fehlgeschlagen${NC}"
            exit 1
        fi
    fi
else
    echo "${CYAN}Schritt 4/5:${NC} ✅ Bereits auf main Branch"
fi
echo ""

# Schritt 5: Push zu main
echo "${CYAN}Schritt 5/5:${NC} 🚀 git push origin main..."
git push origin main
if [ $? -eq 0 ]; then
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
    exit 1
fi
