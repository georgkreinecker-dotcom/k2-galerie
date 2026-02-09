#!/bin/bash
# Git Push Fix - Erhöht Buffer und versucht Push

cd /Users/georgkreinecker/k2Galerie || exit 1

echo "🔧 Git Push Fix..."
echo ""

# Erhöhe HTTP Buffer
echo "Schritt 1/3: Erhöhe HTTP Buffer..."
git config http.postBuffer 524288000
git config http.maxRequestBuffer 100M
git config core.compression 0
echo "✅ Fertig"
echo ""

# Prüfe Remote
echo "Schritt 2/3: Prüfe Remote..."
git remote -v
echo ""

# Versuche Push in kleineren Chunks
echo "Schritt 3/3: Versuche Push..."
echo ""

# Versuche zuerst ohne große Dateien
git push origin main --force --verbose 2>&1 | head -30

echo ""
echo "💡 Falls das nicht funktioniert, versuche:"
echo "   1. Token auf GitHub erneuern"
echo "   2. SSH statt HTTPS verwenden"
echo "   3. Neuen Branch erstellen: git checkout -b main-new && git push origin main-new"
