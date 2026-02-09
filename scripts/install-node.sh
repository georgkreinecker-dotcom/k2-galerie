#!/bin/bash
# Node.js Installation Script für macOS

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  📦 Node.js Installation für K2 Galerie"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Prüfe ob Homebrew installiert ist
if command -v brew >/dev/null 2>&1; then
    BREW_PATH=$(which brew)
    echo "${GREEN}✅ Homebrew gefunden: $BREW_PATH${NC}"
    echo ""
    echo "${CYAN}Option 1: Installation mit Homebrew (empfohlen)${NC}"
    echo ""
    echo "Führe aus:"
    echo "  ${BOLD}brew install node${NC}"
    echo ""
    echo "Dann Terminal neu starten oder:"
    echo "  ${BOLD}source ~/.zshrc${NC}"
    echo "  ${BOLD}source ~/.bash_profile${NC}"
    echo ""
else
    echo "${YELLOW}⚠️  Homebrew nicht gefunden${NC}"
    echo ""
fi

echo "${CYAN}Option 2: Offizieller Node.js Installer${NC}"
echo ""
echo "1. Gehe zu: ${BOLD}https://nodejs.org/${NC}"
echo "2. Lade die ${BOLD}LTS-Version${NC} herunter (.pkg Datei)"
echo "3. Öffne die .pkg Datei und folge der Installation"
echo "4. Terminal neu starten"
echo ""
echo "${CYAN}Option 3: nvm (Node Version Manager)${NC}"
echo ""
echo "Führe aus:"
echo "  ${BOLD}curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash${NC}"
echo ""
echo "Dann Terminal neu starten und:"
echo "  ${BOLD}nvm install --lts${NC}"
echo "  ${BOLD}nvm use --lts${NC}"
echo ""
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "${YELLOW}💡 Nach Installation prüfen:${NC}"
echo "  ${BOLD}node --version${NC}"
echo "  ${BOLD}npm --version${NC}"
echo ""
echo "${YELLOW}💡 Dann Build ausführen:${NC}"
echo "  ${BOLD}cd ~/k2Galerie${NC}"
echo "  ${BOLD}npm run build${NC}"
echo ""
