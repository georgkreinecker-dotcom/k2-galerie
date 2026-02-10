# 🆓 Kostenloses Supabase-Projekt zum Testen

## ✅ Lösung: Neues Projekt in gleicher Organisation

Du kannst ein **neues Projekt** in deiner bestehenden Organisation erstellen - das gibt dir wieder **kostenloses Kontingent**!

---

## 📋 Schritt-für-Schritt:

### Schritt 1: Neues Projekt erstellen

1. **Im Supabase Dashboard:**
   - Du bist in: `georgkreinecker-dotcom!sOrg` ✅
   - Oben rechts: Klicke **"New Project"** (grüner Button)
   - **NICHT** "New Organization" - das wäre falsch!

2. **Projekt-Details ausfüllen:**
   - **Name:** `k2-galerie-test` (oder `k2-galerie-neu`)
   - **Database Password:** 
     - Wähle ein sicheres Passwort
     - **WICHTIG:** Notiere dir das Passwort! (Du brauchst es später)
   - **Region:** `Frankfurt` (oder nächstgelegene)
   - **Pricing Plan:** `Free` (sollte automatisch ausgewählt sein)

3. **Erstellen:**
   - Klicke **"Create new project"**
   - Warte **2-3 Minuten** bis Projekt fertig ist
   - ✅ Neues Projekt hat wieder kostenloses Kontingent!

---

### Schritt 2: API-Keys kopieren

1. **Im neuen Projekt-Dashboard:**
   - Links: **Settings** (Zahnrad-Icon)
   - Klicke: **API** (in der Liste)

2. **Kopiere diese 2 Werte:**

   **Project URL:**
   ```
   https://xxxxx.supabase.co
   ```
   (Kopiere die komplette URL - sieht aus wie: `https://abcdefghijklmnop.supabase.co`)

   **anon public key:**
   ```
   eyJhbGc... (lange Zeichenkette)
   ```
   (Kopiere die komplette Zeichenkette - beginnt mit `eyJ`)

---

### Schritt 3: .env Datei ausfüllen

1. **Öffne die Datei:** `.env` (im Projektordner k2Galerie)

2. **Ersetze diese Zeilen:**

   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   ```
   → Ersetze `https://xxxxx.supabase.co` mit deiner Project URL

   ```bash
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
   → Ersetze `eyJhbGc...` mit deinem anon key

3. **Speichere** die Datei (Cmd+S)

---

### Schritt 4: Migration ausführen

1. **Im Supabase Dashboard (neues Projekt):**
   - Links: **SQL Editor**
   - Klicke: **"New Query"** (oben rechts)

2. **Öffne diese Datei auf deinem Mac:**
   ```
   supabase/migrations/001_create_artworks_table.sql
   ```
   (Im Finder: k2Galerie → supabase → migrations → 001_create_artworks_table.sql)

3. **Kopiere alles:**
   - Markiere ALLES (Cmd+A)
   - Kopiere (Cmd+C)

4. **Füge in SQL Editor ein:**
   - In Supabase SQL Editor klicken
   - Einfügen (Cmd+V)
   - Du solltest den SQL-Code sehen

5. **Ausführen:**
   - Klicke **"RUN"** (oder drücke Cmd+Enter)
   - ✅ Sollte "Success" anzeigen
   - ✅ Tabelle `artworks` wurde erstellt!

---

### Schritt 5: Edge Function deployen

1. **Im Supabase Dashboard (neues Projekt):**
   - Links: **Edge Functions**
   - Klicke: **"Create a new function"** (oben rechts)
   - **Function Name:** `artworks` (genau so, klein geschrieben)
   - Klicke **"Create function"**

2. **Öffne diese Datei auf deinem Mac:**
   ```
   supabase/functions/artworks/index.ts
   ```
   (Im Finder: k2Galerie → supabase → functions → artworks → index.ts)

3. **Kopiere alles:**
   - Markiere ALLES (Cmd+A)
   - Kopiere (Cmd+C)

4. **Füge in Editor ein:**
   - In Supabase Edge Function Editor klicken
   - Einfügen (Cmd+V)
   - Du solltest den TypeScript-Code sehen

5. **Deployen:**
   - Klicke **"Deploy"** (oben rechts)
   - Warte kurz
   - ✅ Sollte "Deployed" anzeigen
   - ✅ Edge Function ist jetzt aktiv!

---

### Schritt 6: Vercel Environment-Variablen (für Production)

1. **Gehe zu:** https://vercel.com
2. **Wähle Projekt:** k2-galerie
3. **Settings** → **Environment Variables**
4. **Füge hinzu:**

   **Name:** `VITE_SUPABASE_URL`
   **Value:** Deine Project URL (aus Schritt 2)
   **Klicke:** "Add"

   **Name:** `VITE_SUPABASE_ANON_KEY`
   **Value:** Dein anon key (aus Schritt 2)
   **Klicke:** "Add"

5. **Redeploy:**
   - Oben rechts: **"Redeploy"** klicken
   - Warte bis Deployment fertig ist

---

## ✅ Fertig!

Jetzt funktioniert alles mit dem **kostenlosen Test-Projekt**!

### Testen:

1. **App neu laden** im Browser
2. **Werk speichern** → sollte funktionieren
3. **Supabase Dashboard** → Table Editor → artworks → sollte Werk sehen

---

## 💡 Wichtig:

- ✅ Neues Projekt = neues kostenloses Kontingent
- ✅ Bleibt in gleicher Organisation (`georgkreinecker-dotcom!sOrg`)
- ✅ Altes Projekt bleibt erhalten (kann später gelöscht werden)
- ⚠️ Daten aus altem Projekt sind nicht automatisch im neuen Projekt

---

## 🆘 Hilfe:

**Falls etwas nicht funktioniert:**

1. **Prüfe:** Neues Projekt wurde erstellt? (sollte in Dashboard sichtbar sein)
2. **Prüfe:** .env Datei ist ausgefüllt? (URL und Key eingetragen?)
3. **Prüfe:** Migration wurde ausgeführt? (SQL Editor → sollte "Success" zeigen)
4. **Prüfe:** Edge Function wurde deployed? (Edge Functions → sollte `artworks` sehen)

**Bei Problemen:** Siehe `SUPABASE-PROBLEM-LOESEN.md`
