#!/bin/bash

# Supabase Setup Script für K2 Galerie
# Führt alle notwendigen Schritte für Supabase-Integration aus

set -e

echo "🚀 K2 Galerie - Supabase Setup"
echo "================================"
echo ""

# Prüfe ob Supabase CLI installiert ist
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI nicht gefunden"
    echo "📦 Installiere Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI gefunden"
echo ""

# Prüfe ob .env existiert
if [ ! -f .env ]; then
    echo "📝 Erstelle .env Datei..."
    cp .env.example .env
    echo ""
    echo "⚠️  WICHTIG: Bitte fülle .env mit deinen Supabase-Credentials aus!"
    echo "   1. Öffne .env"
    echo "   2. Setze VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY"
    echo ""
    read -p "Drücke Enter wenn .env ausgefüllt ist..."
fi

# Lade Environment-Variablen
source .env 2>/dev/null || true

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Fehler: VITE_SUPABASE_URL oder VITE_SUPABASE_ANON_KEY nicht gesetzt!"
    echo "   Bitte fülle .env aus!"
    exit 1
fi

echo "✅ Environment-Variablen gefunden"
echo ""

# Prüfe ob bereits verlinkt
if [ -f .supabase/config.toml ]; then
    echo "ℹ️  Projekt bereits verlinkt"
else
    echo "🔗 Linke Supabase-Projekt..."
    echo "   Bitte gib deinen Project Ref ein (aus Supabase Dashboard URL)"
    echo "   z.B. wenn URL ist: https://xxxxx.supabase.co"
    echo "   dann ist Project Ref: xxxxx"
    read -p "Project Ref: " PROJECT_REF
    
    if [ -z "$PROJECT_REF" ]; then
        echo "❌ Project Ref fehlt!"
        exit 1
    fi
    
    supabase link --project-ref "$PROJECT_REF"
fi

echo ""
echo "📊 Führe Migration aus..."
supabase db push

echo ""
echo "🚀 Deploye Edge Function..."
supabase functions deploy artworks

echo ""
echo "✅ Setup abgeschlossen!"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Prüfe Supabase Dashboard → Table Editor → artworks"
echo "   2. Teste App: Werk speichern → sollte in Supabase erscheinen"
echo "   3. Teste Mobile-Sync: Werk auf Mobile speichern → sollte auf Mac erscheinen"
echo ""
