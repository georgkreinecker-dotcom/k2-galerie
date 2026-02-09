#!/bin/bash
# Git Push über neuen Branch - Umgeht Force Push Probleme

cd /Users/georgkreinecker/k2Galerie || exit 1

echo "🚀 Git Push über neuen Branch..."
echo ""

# Erhöhe HTTP Buffer
git config http.postBuffer 524288000
git config http.maxRequestBuffer 100M

# Neuen Branch erstellen
BRANCH_NAME="main-$(date +%Y%m%d-%H%M%S)"
echo "Schritt 1/3: Erstelle neuen Branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"
echo "✅ Branch erstellt"
echo ""

# Push versuchen
echo "Schritt 2/3: Pushe neuen Branch..."
git push origin "$BRANCH_NAME"
PUSH_STATUS=$?

if [ $PUSH_STATUS -eq 0 ]; then
    echo ""
    echo "✅✅✅ Push erfolgreich!"
    echo ""
    echo "📌 Nächste Schritte:"
    echo "   1. Gehe zu: https://github.com/georgkreinecker-dotcom/k2-galerie"
    echo "   2. Klicke auf 'branches'"
    echo "   3. Setze '$BRANCH_NAME' als Standard-Branch"
    echo "   4. Oder merge den Branch in main"
    echo ""
else
    echo ""
    echo "❌ Push fehlgeschlagen"
    echo ""
    echo "💡 Alternative Lösungen:"
    echo "   1. GitHub Token erneuern"
    echo "   2. SSH statt HTTPS verwenden"
    echo "   3. Manuell auf GitHub hochladen"
    echo ""
fi

# Zurück zu main
git checkout main
echo ""
echo "✅ Zurück zu main Branch"
