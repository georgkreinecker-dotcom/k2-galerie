# 🚀 Supabase Setup - SUPER EINFACH

## 📝 Was du machen musst (nur 3 Schritte!)

### Schritt 1: Supabase-Konto erstellen (2 Minuten)

1. **Gehe zu:** https://supabase.com
2. **Klicke:** "Start your project" (oben rechts)
3. **Melde dich an** mit GitHub oder Email
4. **Klicke:** "New Project"
5. **Fülle aus:**
   - Name: `k2-galerie`
   - Datenbank-Passwort: **WICHTIG - notiere dir das!**
   - Region: `Frankfurt` (oder näheste)
6. **Klicke:** "Create new project"
7. **Warte 2 Minuten** bis Projekt fertig ist

### Schritt 2: Credentials kopieren (1 Minute)

1. **Im Supabase Dashboard** (sollte automatisch öffnen)
2. **Links in der Sidebar:** Klicke auf **"Settings"** (Zahnrad-Icon)
3. **Klicke:** **"API"** (in der Liste unter Settings)
4. **Kopiere diese 2 Werte:**

   **Project URL:**
   ```
   https://xxxxx.supabase.co
   ```
   (Kopiere die komplette URL)

   **anon public key:**
   ```
   eyJhbGc... (lange Zeichenkette)
   ```
   (Kopiere die komplette Zeichenkette)

### Schritt 3: In .env Datei eintragen (1 Minute)

1. **Öffne die Datei:** `.env` (im Projektordner)
2. **Ersetze diese Zeilen:**

   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   ```
   → Ersetze `https://xxxxx.supabase.co` mit deiner Project URL

   ```bash
   VITE_SUPABASE_ANON_KEY=dein-anon-key-hier
   ```
   → Ersetze `dein-anon-key-hier` mit deinem anon key

3. **Speichere** die Datei

### Schritt 4: Migration ausführen (1 Minute)

1. **Im Supabase Dashboard** (sollte noch offen sein)
2. **Links in der Sidebar:** Klicke auf **"SQL Editor"**
3. **Klicke:** "New Query" (oben rechts)
4. **Öffne diese Datei auf deinem Mac:**
   ```
   supabase/migrations/001_create_artworks_table.sql
   ```
5. **Markiere ALLES** (Cmd+A)
6. **Kopiere** (Cmd+C)
7. **Füge in den SQL Editor ein** (Cmd+V)
8. **Klicke:** "RUN" (oder drücke Cmd+Enter)
9. ✅ Sollte "Success" anzeigen

### Schritt 5: Edge Function deployen (1 Minute)

1. **Im Supabase Dashboard**
2. **Links in der Sidebar:** Klicke auf **"Edge Functions"**
3. **Klicke:** "Create a new function" (oben rechts)
4. **Name eingeben:** `artworks`
5. **Klicke:** "Create function"
6. **Öffne diese Datei auf deinem Mac:**
   ```
   supabase/functions/artworks/index.ts
   ```
7. **Markiere ALLES** (Cmd+A)
8. **Kopiere** (Cmd+C)
9. **Füge in den Editor ein** (Cmd+V)
10. **Klicke:** "Deploy" (oben rechts)
11. ✅ Sollte "Deployed" anzeigen

### Schritt 6: Vercel Environment-Variablen (für Production)

1. **Gehe zu:** https://vercel.com
2. **Wähle dein Projekt:** `k2-galerie`
3. **Klicke:** "Settings"
4. **Klicke:** "Environment Variables"
5. **Füge hinzu:**

   **Name:** `VITE_SUPABASE_URL`
   **Value:** Deine Project URL (aus Schritt 2)
   **Klicke:** "Add"

   **Name:** `VITE_SUPABASE_ANON_KEY`
   **Value:** Dein anon key (aus Schritt 2)
   **Klicke:** "Add"

6. **Klicke:** "Redeploy" (oben rechts)

## ✅ Fertig!

Jetzt funktioniert alles automatisch!

### Testen:

1. **App neu laden** im Browser
2. **Werk speichern** → sollte funktionieren
3. **Supabase Dashboard** → Table Editor → artworks → sollte Werk sehen

## 🆘 Hilfe

**Falls etwas nicht funktioniert:**

1. **Prüfe:** `.env` Datei ist ausgefüllt
2. **Prüfe:** Migration wurde ausgeführt (SQL Editor → sollte "Success" zeigen)
3. **Prüfe:** Edge Function wurde deployed (Edge Functions → sollte `artworks` sehen)

**Bei Problemen:** Siehe `docs/SETUP-ANLEITUNG.md`
