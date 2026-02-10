# 🔧 Fix: Werke werden nicht in Supabase gespeichert

## 🚨 Problem:

- ❌ Keine Werke in Supabase Table Editor
- ❌ Werk wird gespeichert, aber verschwindet
- ❌ Gleiche Nummer wird wieder generiert

**Ursache:** Speichern funktioniert nicht!

---

## 🔍 Schritt-für-Schritt Debugging:

### Schritt 1: Edge Function Logs prüfen

1. **Supabase Dashboard** → **Edge Functions** → **artworks**
2. **Tab:** **Logs**
3. **Werk speichern** in der App
4. **Prüfen:** Kommt ein Request an?

**Falls JA:**
- ✅ Edge Function wird aufgerufen
- Prüfe ob Fehler in Logs

**Falls NEIN:**
- ❌ Edge Function wird nicht aufgerufen
- Problem: App kann Edge Function nicht erreichen

---

### Schritt 2: Edge Function URL prüfen

**Im Supabase Dashboard:**
- **Edge Functions** → **artworks** → **Details**
- **Endpoint URL:** Kopiere die URL
- **Sollte sein:** `https://sjqyeqnibwyxtwzcqklj.supabase.co/functions/v1/artworks`

**Prüfe in .env:**
- `VITE_SUPABASE_URL` sollte sein: `https://sjqyeqnibwyxtwzcqklj.supabase.co`
- **NICHT:** `https://sjayeqnibwyxtwzcqklj.supabase.co` (falsch!)

**WICHTIG:** Die URL in .env muss GENAU mit der Edge Function URL übereinstimmen!

---

### Schritt 3: Edge Function Environment-Variablen prüfen

**Im Supabase Dashboard:**
- **Edge Functions** → **artworks** → **Settings**
- **Secrets:** Prüfe ob `SUPABASE_URL` und `SUPABASE_ANON_KEY` gesetzt sind

**Falls NEIN:**
- Edge Function kann nicht auf Datenbank zugreifen!
- Lösung: Secrets hinzufügen

---

## 🔧 Mögliche Fixes:

### Fix 1: Edge Function Secrets setzen

1. **Supabase Dashboard** → **Edge Functions** → **artworks** → **Settings**
2. **Secrets** → **Add Secret**
3. **Füge hinzu:**

   **Name:** `SUPABASE_URL`
   **Value:** `https://sjqyeqnibwyxtwzcqklj.supabase.co`
   **Add**

   **Name:** `SUPABASE_ANON_KEY`
   **Value:** `sb_publishable_fa6tMCbi4g40m9XiyVUpBA__tpyb9h4`
   **Add**

4. **Redeploy:** Edge Function → **Deploy**

---

### Fix 2: .env URL prüfen

**Prüfe .env Datei:**
- `VITE_SUPABASE_URL` muss GENAU sein: `https://sjqyeqnibwyxtwzcqklj.supabase.co`
- **NICHT:** `https://sjayeqnibwyxtwzcqklj.supabase.co` (falsch!)

**Falls falsch:**
- Korrigiere in .env
- App neu starten

---

### Fix 3: Edge Function neu deployen

1. **Supabase Dashboard** → **Edge Functions** → **artworks**
2. **Tab:** **Code**
3. **Prüfe:** Ist der Code korrekt?
4. **Deploy** klicken
5. **Warten** bis deployed

---

## 📋 Bitte prüfe:

1. **Edge Function Logs:** Kommt Request an? (Ja/Nein)
2. **Edge Function Secrets:** Sind SUPABASE_URL und SUPABASE_ANON_KEY gesetzt? (Ja/Nein)
3. **.env URL:** Ist sie korrekt? (`https://sjqyeqnibwyxtwzcqklj.supabase.co`)

Mit diesen Infos kann ich gezielt helfen!
