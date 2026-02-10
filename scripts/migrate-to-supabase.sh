#!/bin/bash

# Migration Script: localStorage → Supabase
# Migriert bestehende Daten automatisch zu Supabase

set -e

echo "🔄 K2 Galerie - Migration zu Supabase"
echo "======================================"
echo ""

# Prüfe ob Supabase konfiguriert ist
if [ ! -f .env ]; then
    echo "❌ .env Datei nicht gefunden!"
    echo "   Bitte führe zuerst setup-supabase.sh aus"
    exit 1
fi

source .env 2>/dev/null || true

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Supabase nicht konfiguriert!"
    echo "   Bitte fülle .env aus"
    exit 1
fi

echo "✅ Supabase konfiguriert"
echo ""

# Prüfe ob Supabase CLI verfügbar
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI nicht gefunden"
    echo "   Migration wird über API durchgeführt..."
    
    # Lade localStorage Daten (wenn verfügbar)
    echo "📝 Hinweis: Migration läuft automatisch beim ersten App-Start"
    echo "   Die App migriert localStorage → Supabase automatisch"
    exit 0
fi

echo "📊 Prüfe Datenbank..."
supabase db push

echo ""
echo "✅ Migration vorbereitet"
echo ""
echo "📝 Die App führt die Migration automatisch durch:"
echo "   1. Beim ersten Laden prüft die App Supabase"
echo "   2. Wenn Supabase leer ist, lädt sie localStorage"
echo "   3. Speichert automatisch in Supabase"
echo ""
echo "💡 Tipp: Öffne die App im Browser - Migration läuft automatisch!"
echo ""
