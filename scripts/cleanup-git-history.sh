#!/bin/bash
# Git Historie bereinigen - Entfernt große Dateien aus der Historie

cd /Users/georgkreinecker/k2Galerie || exit 1

echo "🧹 Bereinige Git-Historie..."
echo ""

# 1. Git Garbage Collection
echo "Schritt 1/3: Git Garbage Collection..."
git gc --prune=now --aggressive
echo "✅ Fertig"
echo ""

# 2. Prüfe Größe
echo "Schritt 2/3: Prüfe Repository-Größe..."
SIZE=$(du -sh .git | awk '{print $1}')
echo "Git-Ordner Größe: $SIZE"
echo ""

# 3. Entferne große Dateien aus Historie (falls nötig)
echo "Schritt 3/3: Entferne große Dateien aus Historie..."
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .git.backup/* release/* *.app/* *.dmg *.zip' \
  --prune-empty --tag-name-filter cat -- --all 2>&1 | tail -5

echo ""
echo "✅ Bereinigung abgeschlossen!"
echo ""
echo "📊 Neue Größe:"
du -sh .git
echo ""
echo "💡 Jetzt kannst du versuchen: git push origin main --force"
