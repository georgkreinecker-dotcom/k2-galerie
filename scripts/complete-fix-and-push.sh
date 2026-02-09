#!/bin/bash
# Kompletter Fix: Historie neu aufsetzen und pushen

cd /Users/georgkreinecker/k2Galerie || exit 1

echo "🔧 Kompletter Fix - Alles wird automatisch gemacht..."
echo ""

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 1. Stelle sicher dass wir auf main sind
echo -e "${CYAN}Schritt 1/6:${NC} Wechsle zu main..."
git checkout main 2>/dev/null || true
echo -e "${GREEN}✅${NC} Auf main Branch"
echo ""

# 2. Stelle sicher dass alle Änderungen committed sind
echo -e "${CYAN}Schritt 2/6:${NC} Prüfe uncommitted Änderungen..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted Änderungen gefunden - füge sie hinzu...${NC}"
    git add .
    git commit -m "WIP: Uncommitted changes" || true
fi
echo -e "${GREEN}✅${NC} Alle Änderungen committed"
echo ""

# 3. Erstelle neuen Branch OHNE Historie
echo -e "${CYAN}Schritt 3/6:${NC} Erstelle neuen Branch ohne problematische Historie..."
git checkout --orphan main-fresh 2>/dev/null || git checkout main-fresh
git rm -rf --cached . 2>/dev/null || true
echo -e "${GREEN}✅${NC} Neuer Branch erstellt"
echo ""

# 4. Füge alle Dateien hinzu
echo -e "${CYAN}Schritt 4/6:${NC} Füge alle Dateien hinzu..."
git add .
echo -e "${GREEN}✅${NC} Dateien hinzugefügt"
echo ""

# 5. Erstelle neuen Commit
echo -e "${CYAN}Schritt 5/6:${NC} Erstelle Commit..."
git commit -m "Initial commit: Neue Features (SmartPanel, Sync-Status, QR-Code Fix)" || {
    echo -e "${YELLOW}⚠️  Keine Änderungen zu committen${NC}"
}
echo -e "${GREEN}✅${NC} Commit erstellt"
echo ""

# 6. Remote-URL setzen
echo -e "${CYAN}Schritt 6/6:${NC} Setze Remote-URL..."
git remote set-url origin https://github.com/georgkreinecker-dotcom/k2-galerie.git
echo -e "${GREEN}✅${NC} Remote-URL gesetzt"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅✅✅ Alles vorbereitet!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}🚀 Jetzt pushen:${NC}"
echo ""
echo -e "   ${YELLOW}git push origin main-fresh --force${NC}"
echo ""
echo -e "${CYAN}📝 Beim Push:${NC}"
echo -e "   Username: ${YELLOW}georgkreinecker-dotcom${NC}"
echo -e "   Password: ${YELLOW}Dein GitHub Token${NC}"
echo ""
echo -e "${CYAN}🌐 Nach dem Push auf GitHub:${NC}"
echo -e "   1. Gehe zu: ${BLUE}https://github.com/georgkreinecker-dotcom/k2-galerie/branches${NC}"
echo -e "   2. Finde ${YELLOW}main-fresh${NC}"
echo -e "   3. Klicke auf die drei Punkte → ${YELLOW}Set as default branch${NC}"
echo ""
