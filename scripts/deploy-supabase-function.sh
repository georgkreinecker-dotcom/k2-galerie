#!/bin/bash

# Deploy Supabase Edge Function
# Einfaches Script zum Deployen der artworks Function

set -e

echo "🚀 Deploye Supabase Edge Function: artworks"
echo "============================================"
echo ""

# Prüfe ob Supabase CLI installiert ist
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI nicht gefunden!"
    echo "   Installiere mit: npm install -g supabase"
    exit 1
fi

# Prüfe ob Function existiert
if [ ! -f "supabase/functions/artworks/index.ts" ]; then
    echo "❌ Edge Function nicht gefunden!"
    echo "   Pfad: supabase/functions/artworks/index.ts"
    exit 1
fi

echo "✅ Edge Function gefunden"
echo ""

# Prüfe ob verlinkt
if [ ! -f .supabase/config.toml ]; then
    echo "⚠️  Projekt nicht verlinkt"
    echo "   Führe zuerst aus: supabase link --project-ref dein-projekt-ref"
    echo ""
    read -p "Drücke Enter zum Fortfahren oder Ctrl+C zum Abbrechen..."
fi

echo "📦 Deploye Function..."
supabase functions deploy artworks

echo ""
echo "✅ Function deployed!"
echo ""
echo "📝 Testen:"
echo "   curl -X GET https://dein-projekt.supabase.co/functions/v1/artworks \\"
echo "     -H 'Authorization: Bearer dein-anon-key'"
echo ""
