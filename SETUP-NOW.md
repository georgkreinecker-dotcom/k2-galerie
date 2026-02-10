# 🚀 Supabase Setup - JETZT LOSLEGEN

## ✅ Schritt 1: .env Datei ausfüllen

Die `.env` Datei wurde erstellt. Jetzt musst du sie ausfüllen:

1. **Öffne `.env`** im Projektordner
2. **Gehe zu [supabase.com](https://supabase.com)** und erstelle ein Projekt
3. **Kopiere deine Credentials:**
   - Dashboard → Settings → API
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## ✅ Schritt 2: Supabase CLI installieren (optional)

**Falls du die Scripts verwenden willst:**

```bash
# Im Terminal am Mac
npm install -g supabase
```

**Oder manuell ohne CLI** (siehe Schritt 3)

## ✅ Schritt 3: Migration ausführen

### Option A: Mit Script (wenn CLI installiert)
```bash
./scripts/setup-supabase.sh
```

### Option B: Manuell (einfacher, ohne CLI)

1. **Supabase Dashboard** → **SQL Editor**
2. **Klicke "New Query"**
3. **Öffne Datei:** `supabase/migrations/001_create_artworks_table.sql`
4. **Kopiere kompletten Inhalt**
5. **Füge in SQL Editor ein**
6. **Klicke RUN** (oder Cmd+Enter)

✅ Tabelle sollte jetzt erstellt sein!

## ✅ Schritt 4: Edge Function deployen

### Option A: Mit Script (wenn CLI installiert)
```bash
./scripts/deploy-supabase-function.sh
```

### Option B: Manuell (einfacher)

1. **Supabase Dashboard** → **Edge Functions**
2. **Klicke "Create a new function"**
3. **Name:** `artworks`
4. **Öffne Datei:** `supabase/functions/artworks/index.ts`
5. **Kopiere kompletten Inhalt**
6. **Füge in Editor ein**
7. **Klicke Deploy**

## ✅ Schritt 5: Testen

1. **App neu laden** im Browser
2. **Werk speichern** → sollte funktionieren
3. **Supabase Dashboard** → Table Editor → artworks → prüfen

## 🎉 Fertig!

Die App verwendet jetzt Supabase!

## 📝 Checkliste

- [ ] Supabase-Projekt erstellt
- [ ] `.env` ausgefüllt mit URL und Key
- [ ] Migration ausgeführt (SQL Editor)
- [ ] Edge Function deployed
- [ ] App getestet

## 🐛 Hilfe

- **Detailliert:** `docs/SETUP-ANLEITUNG.md`
- **Quick Start:** `SUPABASE-QUICK-START.md`
- **Troubleshooting:** Siehe Dokumentation
