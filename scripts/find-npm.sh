#!/bin/bash
# Finde npm und führe Build aus

echo "🔍 Suche npm..."

# Mögliche npm-Pfade prüfen
NPM_PATHS=(
  "/usr/local/bin/npm"
  "/opt/homebrew/bin/npm"
  "$HOME/.nvm/versions/node/*/bin/npm"
  "/usr/bin/npm"
  "$(which npm 2>/dev/null)"
)

NPM_FOUND=""

for path in "${NPM_PATHS[@]}"; do
  if [ -f "$path" ] || command -v "$path" >/dev/null 2>&1; then
    NPM_FOUND="$path"
    echo "✅ npm gefunden: $NPM_FOUND"
    break
  fi
done

# Wenn nicht gefunden, versuche node zu finden (npm ist normalerweise dabei)
if [ -z "$NPM_FOUND" ]; then
  echo "⚠️  npm nicht gefunden, suche node..."
  NODE_PATHS=(
    "/usr/local/bin/node"
    "/opt/homebrew/bin/node"
    "$HOME/.nvm/versions/node/*/bin/node"
    "/usr/bin/node"
  )
  
  for path in "${NODE_PATHS[@]}"; do
    if [ -f "$path" ]; then
      NPM_FOUND="${path%node}npm"
      if [ -f "$NPM_FOUND" ]; then
        echo "✅ npm gefunden neben node: $NPM_FOUND"
        break
      fi
    fi
  done
fi

if [ -z "$NPM_FOUND" ]; then
  echo ""
  echo "❌ npm nicht gefunden!"
  echo ""
  echo "💡 Mögliche Lösungen:"
  echo "1. Node.js installieren: https://nodejs.org/"
  echo "2. Oder mit Homebrew: brew install node"
  echo "3. Oder mit nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
  echo ""
  echo "📋 Prüfe ob node installiert ist:"
  echo "   node --version"
  echo ""
  exit 1
fi

# npm gefunden - führe Build aus
echo ""
echo "🚀 Starte Build mit: $NPM_FOUND"
echo ""

cd /Users/georgkreinecker/k2Galerie || exit 1
"$NPM_FOUND" run build
