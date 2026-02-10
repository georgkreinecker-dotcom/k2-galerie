# 🚀 Supabase Setup - Schritt für Schritt

## ⚡ Schnell-Setup (5 Minuten)

### Schritt 1: Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Klicke **"New Project"**
3. Wähle Organisation oder erstelle neue
4. Projektname: `k2-galerie`
5. Datenbank-Passwort: **SICHERES Passwort notieren!**
6. Region: `Frankfurt` (oder näheste)
7. Klicke **"Create new project"**
8. Warte ~2 Minuten bis Projekt erstellt ist

### Schritt 2: Credentials kopieren

1. Im Dashboard → **Settings** (Zahnrad oben rechts)
2. Klicke **API** (linke Sidebar)
3. Kopiere:
   - **Project URL** (z.B. `https://xxxxx.supabase.co`)
   - **anon public** key (lange Zeichenkette)

### Schritt 3: Environment-Variablen setzen

**Lokal (.env Datei):**
```bash
# Im Projektordner
cp .env.example .env

# Öffne .env und füge ein:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key-hier
```

**Vercel (Production):**
1. Vercel Dashboard → Dein Projekt
2. **Settings** → **Environment Variables**
3. Füge hinzu:
   - `VITE_SUPABASE_URL` = deine Project URL
   - `VITE_SUPABASE_ANON_KEY` = dein anon key
4. **Save**
5. **Redeploy** Projekt

### Schritt 4: Migration ausführen

**Option A: Im Supabase Dashboard (einfachste Methode)**

1. Supabase Dashboard → **SQL Editor** (linke Sidebar)
2. Klicke **"New Query"**
3. Öffne Datei: `supabase/migrations/001_create_artworks_table.sql`
4. Kopiere **kompletten Inhalt**
5. Füge in SQL Editor ein
6. Klicke **RUN** (oder Cmd+Enter)
7. ✅ Sollte "Success" anzeigen

**Option B: Mit Supabase CLI**

```bash
# CLI installieren (falls nicht vorhanden)
npm install -g supabase

# Login
supabase login

# Link zum Projekt
supabase link --project-ref dein-projekt-ref

# Migration ausführen
supabase db push
```

### Schritt 5: Edge Function deployen

**Option A: Mit Supabase CLI (empfohlen)**

```bash
# Im Projektordner
supabase functions deploy artworks
```

**Option B: Manuell im Dashboard**

1. Dashboard → **Edge Functions** (linke Sidebar)
2. Klicke **"Create a new function"**
3. Name: `artworks`
4. Öffne Datei: `supabase/functions/artworks/index.ts`
5. Kopiere **kompletten Inhalt**
6. Füge in Editor ein
7. Klicke **Deploy**

### Schritt 6: Testen

1. **App neu laden** im Browser
2. **Werk speichern** → sollte funktionieren
3. **Supabase Dashboard** → Table Editor → artworks → prüfen ob Werk da ist
4. **Mobile-Sync testen:**
   - Werk auf iPhone/iPad speichern
   - Warte 10 Sekunden
   - Auf Mac sollte Werk automatisch erscheinen

## ✅ Fertig!

Die App verwendet jetzt Supabase als Datenbank!

## 🐛 Troubleshooting

### Problem: "Supabase nicht konfiguriert"

**Lösung:**
1. Prüfe `.env` Datei existiert
2. Prüfe Environment-Variablen sind gesetzt
3. Prüfe Vercel Environment-Variablen (für Production)

### Problem: "Table does not exist"

**Lösung:**
1. Migration ausführen (Schritt 4)
2. Prüfe Supabase Dashboard → Table Editor → sollte `artworks` Tabelle sehen

### Problem: "Function not found"

**Lösung:**
1. Edge Function deployen (Schritt 5)
2. Prüfe Supabase Dashboard → Edge Functions → sollte `artworks` sehen

### Problem: "Permission denied"

**Lösung:**
1. Prüfe RLS Policies in Supabase Dashboard
2. Tabelle sollte öffentlich lesbar sein (siehe Migration)

## 📚 Weitere Hilfe

- Quick Start: `SUPABASE-QUICK-START.md`
- Detailliert: `docs/SUPABASE-SETUP-PROFESSIONELL.md`
- Mobile-Sync: `docs/MOBILE-SYNC-COMPLETE.md`
