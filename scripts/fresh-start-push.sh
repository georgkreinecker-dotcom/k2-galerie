#!/bin/bash
# Neuer Start - Erstellt Branch ohne problematische Historie

cd /Users/georgkreinecker/k2Galerie || exit 1

echo "🔄 Neuer Start - Erstelle Branch ohne problematische Historie..."
echo ""

# 1. Stelle sicher dass alle Änderungen committed sind
echo "Schritt 1/5: Prüfe uncommitted Änderungen..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted Änderungen gefunden - committe sie zuerst"
    git status --short
    exit 1
fi
echo "✅ Keine uncommitted Änderungen"
echo ""

# 2. Erstelle neuen Branch OHNE Historie
echo "Schritt 2/5: Erstelle neuen Branch ohne Historie..."
git checkout --orphan main-fresh
echo "✅ Branch erstellt"
echo ""

# 3. Entferne alle Dateien aus Staging
echo "Schritt 3/5: Bereinige Staging..."
git rm -rf --cached . 2>/dev/null || true
echo "✅ Staging bereinigt"
echo ""

# 4. Füge alle Dateien hinzu (außer .git)
echo "Schritt 4/5: Füge Dateien hinzu..."
git add .
echo "✅ Dateien hinzugefügt"
echo ""

# 5. Erstelle neuen Commit
echo "Schritt 5/5: Erstelle Commit..."
git commit -m "Initial commit: Neue Features (SmartPanel, Sync-Status, QR-Code Fix)"
echo "✅ Commit erstellt"
echo ""

echo "🚀 Bereit zum Pushen!"
echo ""
echo "💡 Jetzt ausführen:"
echo "   git push origin main-fresh --force"
echo ""
echo "⚠️  WICHTIG: Auf GitHub dann 'main-fresh' als Standard-Branch setzen!"
