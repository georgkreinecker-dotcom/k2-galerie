#!/bin/bash

# Prüft ob Supabase korrekt konfiguriert ist

echo "🔍 K2 Galerie - Supabase Setup Check"
echo "====================================="
echo ""

# Prüfe .env Datei
if [ ! -f .env ]; then
    echo "❌ .env Datei nicht gefunden"
    echo "   Erstelle: cp .env.example .env"
    exit 1
fi

echo "✅ .env Datei gefunden"

# Lade Environment-Variablen
source .env 2>/dev/null || true

# Prüfe VITE_SUPABASE_URL
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ VITE_SUPABASE_URL nicht gesetzt"
    exit 1
fi

if [[ ! "$VITE_SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
    echo "⚠️  VITE_SUPABASE_URL sieht nicht korrekt aus"
    echo "   Sollte sein: https://xxxxx.supabase.co"
else
    echo "✅ VITE_SUPABASE_URL gesetzt: $VITE_SUPABASE_URL"
fi

# Prüfe VITE_SUPABASE_ANON_KEY
if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ VITE_SUPABASE_ANON_KEY nicht gesetzt"
    exit 1
fi

if [ ${#VITE_SUPABASE_ANON_KEY} -lt 50 ]; then
    echo "⚠️  VITE_SUPABASE_ANON_KEY sieht zu kurz aus"
else
    echo "✅ VITE_SUPABASE_ANON_KEY gesetzt (${#VITE_SUPABASE_ANON_KEY} Zeichen)"
fi

# Prüfe Migration
if [ ! -f "supabase/migrations/001_create_artworks_table.sql" ]; then
    echo "❌ Migration-Datei nicht gefunden"
    exit 1
fi

echo "✅ Migration-Datei gefunden"

# Prüfe Edge Function
if [ ! -f "supabase/functions/artworks/index.ts" ]; then
    echo "❌ Edge Function nicht gefunden"
    exit 1
fi

echo "✅ Edge Function gefunden"

# Prüfe Supabase Client
if [ ! -f "src/utils/supabaseClient.ts" ]; then
    echo "❌ Supabase Client nicht gefunden"
    exit 1
fi

echo "✅ Supabase Client gefunden"

echo ""
echo "✅ Setup sieht korrekt aus!"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Migration ausführen (Supabase Dashboard → SQL Editor)"
echo "   2. Edge Function deployen (supabase functions deploy artworks)"
echo "   3. App testen"
echo ""
