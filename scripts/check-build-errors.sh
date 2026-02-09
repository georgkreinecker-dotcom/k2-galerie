#!/bin/bash
# Prüfe Build-Fehler bevor Push zu Vercel

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
echo "${BOLD}${BLUE}  🔍 Build-Fehler Prüfung${NC}${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Schritt 1: Prüfe Export-Check
echo "${CYAN}Schritt 1/3:${NC} 📦 Prüfe Export-Check..."
if npm run check-exports 2>&1 | grep -q "❌"; then
    echo "${RED}❌ Export-Check fehlgeschlagen${NC}"
    npm run check-exports
    exit 1
else
    echo "${GREEN}✅ Export-Check erfolgreich${NC}"
fi
echo ""

# Schritt 2: Prüfe TypeScript
echo "${CYAN}Schritt 2/3:${NC} 📝 Prüfe TypeScript..."
if npx tsc --noEmit 2>&1 | grep -q "error"; then
    echo "${RED}❌ TypeScript-Fehler gefunden${NC}"
    npx tsc --noEmit 2>&1 | head -20
    exit 1
else
    echo "${GREEN}✅ TypeScript-Check erfolgreich${NC}"
fi
echo ""

# Schritt 3: Versuche Build
echo "${CYAN}Schritt 3/3:${NC} 🏗️  Versuche Build..."
if npm run build 2>&1 | tail -20 | grep -q "error\|Error\|failed\|Failed"; then
    echo "${RED}❌ Build fehlgeschlagen${NC}"
    npm run build 2>&1 | tail -30
    exit 1
else
    echo "${GREEN}✅ Build erfolgreich${NC}"
fi
echo ""

echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "${GREEN}✅✅✅ Alle Checks erfolgreich - Build sollte auf Vercel funktionieren${NC}"
echo "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
