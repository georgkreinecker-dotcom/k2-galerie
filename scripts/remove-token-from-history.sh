#!/bin/bash
# Entfernt Token aus Git-Historie

cd /Users/georgkreinecker/k2Galerie || exit 1

echo "🔧 Entferne Token aus Git-Historie..."
echo ""

# Entferne Token aus allen Commits
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch GITHUB-PUSH-FIX.md 2>/dev/null || true' \
  --prune-empty --tag-name-filter cat -- --all

# Ersetze Token in GITHUB-PUSH-FIX.md falls noch vorhanden
git filter-branch --force --tree-filter \
  'if [ -f GITHUB-PUSH-FIX.md ]; then
     sed -i "" "s/ghp_[a-zA-Z0-9]*/[DEIN-TOKEN]/g" GITHUB-PUSH-FIX.md 2>/dev/null || true
   fi' \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "✅ Historie bereinigt!"
echo ""
echo "💡 Jetzt versuche: git push origin main-new-clean"
