# 🚀 Supabase Quick Start - 5 Minuten Setup

## Schritt 1: Supabase-Projekt erstellen (2 Min)

1. Gehe zu [supabase.com](https://supabase.com)
2. Klicke "New Project"
3. Wähle Organisation oder erstelle neue
4. Gib Projektname ein: `k2-galerie`
5. Wähle Region (z.B. `Frankfurt`)
6. Warte bis Projekt erstellt ist (~2 Minuten)

## Schritt 2: Credentials kopieren (1 Min)

1. Im Dashboard → **Settings** → **API**
2. Kopiere:
   - **Project URL** (z.B. `https://xxxxx.supabase.co`)
   - **anon public key** (lange Zeichenkette)

## Schritt 3: Migration ausführen (1 Min)

1. Im Dashboard → **SQL Editor**
2. Klicke "New Query"
3. Öffne Datei: `supabase/migrations/001_create_artworks_table.sql`
4. Kopiere **kompletten Inhalt**
5. Füge in SQL Editor ein
6. Klicke **RUN** (oder Cmd+Enter)

✅ Tabelle sollte jetzt erstellt sein!

## Schritt 4: Edge Function deployen (1 Min)

**Option A: Mit Supabase CLI**
```bash
# CLI installieren (falls nicht vorhanden)
npm install -g supabase

# Login
supabase login

# Link zum Projekt
supabase link --project-ref dein-projekt-ref

# Function deployen
supabase functions deploy artworks
```

**Option B: Manuell im Dashboard**
1. Dashboard → **Edge Functions**
2. Klicke "Create a new function"
3. Name: `artworks`
4. Öffne Datei: `supabase/functions/artworks/index.ts`
5. Kopiere **kompletten Inhalt**
6. Füge in Editor ein
7. Klicke **Deploy**

## Schritt 5: Environment-Variablen setzen (1 Min)

### Lokal (.env Datei)
Erstelle `.env` im Projekt-Root:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

### Vercel (Production)
1. Vercel Dashboard → Dein Projekt
2. **Settings** → **Environment Variables**
3. Füge hinzu:
   - `VITE_SUPABASE_URL` = deine Project URL
   - `VITE_SUPABASE_ANON_KEY` = dein anon key
4. **Redeploy** Projekt

## ✅ Fertig!

Die App verwendet jetzt automatisch Supabase!

### Testen:
1. App neu laden
2. Werk speichern → sollte in Supabase erscheinen
3. Supabase Dashboard → Table Editor → artworks → prüfen

### Mobile-Sync testen:
1. Werk auf iPhone/iPad speichern
2. Warte 10 Sekunden
3. Auf Mac sollte Werk automatisch erscheinen

## 🐛 Troubleshooting

**Problem:** "Supabase nicht konfiguriert"
→ Prüfe `.env` Datei und Environment-Variablen

**Problem:** "Table does not exist"
→ Migration ausführen (Schritt 3)

**Problem:** "Function not found"
→ Edge Function deployen (Schritt 4)

**Problem:** "Permission denied"
→ Prüfe RLS Policies in Supabase Dashboard

## 📚 Weitere Hilfe

- Detailliertes Setup: `docs/SUPABASE-SETUP-PROFESSIONELL.md`
- Mobile-Sync: `docs/MOBILE-SYNC-COMPLETE.md`
- Vollständige Übersicht: `docs/IMPLEMENTATION-COMPLETE.md`
