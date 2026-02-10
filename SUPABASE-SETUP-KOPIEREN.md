# 📋 Supabase Setup - ZUM KOPIEREN

## Schritt 1: Supabase-Konto
→ https://supabase.com
→ "Start your project"
→ Anmelden
→ "New Project"
→ Name: k2-galerie
→ Region: Frankfurt
→ Passwort notieren!
→ "Create new project"
→ Warten 2 Minuten

## Schritt 2: Credentials kopieren
→ Dashboard → Settings (Zahnrad)
→ API (linke Sidebar)
→ Kopiere Project URL
→ Kopiere anon public key

## Schritt 3: .env ausfüllen
→ Öffne .env Datei
→ Ersetze VITE_SUPABASE_URL mit deiner URL
→ Ersetze VITE_SUPABASE_ANON_KEY mit deinem Key
→ Speichern

## Schritt 4: Migration
→ Dashboard → SQL Editor
→ "New Query"
→ Öffne: supabase/migrations/001_create_artworks_table.sql
→ Alles kopieren (Cmd+A, Cmd+C)
→ In SQL Editor einfügen (Cmd+V)
→ "RUN" klicken
→ ✅ Success

## Schritt 5: Edge Function
→ Dashboard → Edge Functions
→ "Create a new function"
→ Name: artworks
→ Öffne: supabase/functions/artworks/index.ts
→ Alles kopieren (Cmd+A, Cmd+C)
→ In Editor einfügen (Cmd+V)
→ "Deploy" klicken
→ ✅ Deployed

## Schritt 6: Vercel
→ vercel.com
→ Projekt k2-galerie
→ Settings → Environment Variables
→ VITE_SUPABASE_URL hinzufügen
→ VITE_SUPABASE_ANON_KEY hinzufügen
→ Redeploy

## ✅ Fertig!
