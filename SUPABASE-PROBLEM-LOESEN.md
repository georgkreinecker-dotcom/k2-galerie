# 🚨 Supabase Usage-Limit Problem lösen

## ⚠️ Problem: "EXCEEDING USAGE LIMITS"

Dein Supabase-Projekt kann im Moment keine Anfragen bearbeiten, weil das kostenlose Kontingent aufgebraucht ist.

## ✅ Lösung - 2 Optionen:

### Option 1: Upgrade auf bezahlten Plan (empfohlen für Produktion)

1. **Im Supabase Dashboard:**
   - Klicke auf die rote Warnung "EXCEEDING USAGE LIMITS"
   - Oder: Settings → Billing
   - Wähle einen Plan (z.B. Pro Plan für $25/Monat)
   - Bezahle mit Kreditkarte
   - ✅ Sofort aktiv

### Option 2: Neues kostenloses Projekt erstellen

1. **Im Supabase Dashboard:**
   - Klicke oben links auf deinen Organisations-Namen
   - Klicke "New Project"
   - Name: `k2-galerie-neu` (oder ähnlich)
   - Region: Frankfurt
   - Passwort notieren!
   - "Create new project"
   - Warte 2 Minuten

2. **Dann:** Folge den nächsten Schritten mit dem NEUEN Projekt

---

## 📋 Nächste Schritte (nachdem Limit-Problem gelöst ist):

### Schritt 1: API-Keys kopieren

1. **Im Supabase Dashboard:**
   - Links: **Settings** (Zahnrad-Icon)
   - Klicke: **API** (in der Liste)
   
2. **Kopiere diese 2 Werte:**

   **Project URL:**
   ```
   https://siesbmzrnfshdxefqvib.supabase.co
   ```
   (Deine URL ist wahrscheinlich ähnlich)

   **anon public key:**
   ```
   eyJhbGc... (lange Zeichenkette)
   ```
   (Kopiere die komplette Zeichenkette)

### Schritt 2: .env Datei ausfüllen

1. **Öffne die Datei:** `.env` (im Projektordner k2Galerie)

2. **Ersetze diese Zeilen:**

   ```bash
   VITE_SUPABASE_URL=https://siesbmzrnfshdxefqvib.supabase.co
   ```
   → Ersetze mit deiner Project URL

   ```bash
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
   → Ersetze mit deinem anon key

3. **Speichere** die Datei (Cmd+S)

### Schritt 3: Migration ausführen

1. **Im Supabase Dashboard:**
   - Links: **SQL Editor**
   - Klicke: **"New Query"** (oben rechts)

2. **Öffne diese Datei auf deinem Mac:**
   ```
   supabase/migrations/001_create_artworks_table.sql
   ```

3. **Kopiere alles:**
   - Markiere ALLES (Cmd+A)
   - Kopiere (Cmd+C)

4. **Füge in SQL Editor ein:**
   - In Supabase SQL Editor klicken
   - Einfügen (Cmd+V)

5. **Ausführen:**
   - Klicke **"RUN"** (oder drücke Cmd+Enter)
   - ✅ Sollte "Success" anzeigen

### Schritt 4: Edge Function deployen

1. **Im Supabase Dashboard:**
   - Links: **Edge Functions**
   - Klicke: **"Create a new function"**
   - Name: `artworks`
   - Klicke "Create function"

2. **Öffne diese Datei auf deinem Mac:**
   ```
   supabase/functions/artworks/index.ts
   ```

3. **Kopiere alles:**
   - Markiere ALLES (Cmd+A)
   - Kopiere (Cmd+C)

4. **Füge in Editor ein:**
   - In Supabase Edge Function Editor klicken
   - Einfügen (Cmd+V)

5. **Deployen:**
   - Klicke **"Deploy"** (oben rechts)
   - ✅ Sollte "Deployed" anzeigen

### Schritt 5: Vercel Environment-Variablen (für Production)

1. **Gehe zu:** https://vercel.com
2. **Wähle Projekt:** k2-galerie
3. **Settings** → **Environment Variables**
4. **Füge hinzu:**
   - `VITE_SUPABASE_URL` = deine Project URL
   - `VITE_SUPABASE_ANON_KEY` = dein anon key
5. **Klicke:** "Redeploy"

---

## ✅ Fertig!

Nach diesen Schritten funktioniert alles automatisch!

### Testen:

1. **App neu laden** im Browser
2. **Werk speichern** → sollte funktionieren
3. **Supabase Dashboard** → Table Editor → artworks → sollte Werk sehen

---

## 🆘 Hilfe

**Falls etwas nicht funktioniert:**

1. **Prüfe:** Usage-Limit-Problem gelöst? (Projekt muss aktiv sein)
2. **Prüfe:** .env Datei ist ausgefüllt?
3. **Prüfe:** Migration wurde ausgeführt? (SQL Editor → sollte "Success" zeigen)
4. **Prüfe:** Edge Function wurde deployed? (Edge Functions → sollte `artworks` sehen)
