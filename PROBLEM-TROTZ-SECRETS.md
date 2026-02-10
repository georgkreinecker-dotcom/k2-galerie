# 🔍 Problem: Keine Werke trotz vorhandener Secrets

## ✅ Was bereits funktioniert:

- ✅ Secrets sind gesetzt (SUPABASE_URL, SUPABASE_ANON_KEY, etc.)
- ✅ Edge Function ist deployed
- ✅ Migration wurde ausgeführt

## ❌ Problem:

- ❌ Keine Werke in Supabase Table Editor
- ❌ Werk wird gespeichert, aber verschwindet

---

## 🔍 Mögliche Ursachen:

### Problem 1: Edge Function wird nicht aufgerufen

**Prüfe:**
1. **Supabase Dashboard** → **Edge Functions** → **artworks**
2. **Tab:** **Logs**
3. **Werk speichern** in der App
4. **Kommt ein Request an?**

**Falls NEIN:**
- ❌ App kann Edge Function nicht erreichen
- **Lösung:** Prüfe .env URL

**Falls JA:**
- ✅ Edge Function wird aufgerufen
- Prüfe ob Fehler in Logs

---

### Problem 2: .env URL ist falsch

**Prüfe .env Datei:**
- `VITE_SUPABASE_URL` muss sein: `https://sjqyeqnibwyxtwzcqklj.supabase.co`
- **NICHT:** `https://sjayeqnibwyxtwzcqklj.supabase.co` (falsch!)

**WICHTIG:** Die URL muss GENAU mit deinem Supabase-Projekt übereinstimmen!

**Prüfe im Supabase Dashboard:**
- **Settings** → **API**
- **Project URL:** Kopiere diese URL
- **Vergleiche:** Ist sie identisch mit .env?

---

### Problem 3: Edge Function hat Fehler

**Prüfe:**
1. **Supabase Dashboard** → **Edge Functions** → **artworks**
2. **Tab:** **Logs**
3. **Siehst du Fehler?**

**Häufige Fehler:**
- `❌ Supabase Umgebungsvariablen fehlen`
- `❌ Database error`
- `❌ Permission denied`

---

### Problem 4: App läuft nicht mit .env

**Prüfe:**
- Wurde die App **neu gestartet** nach .env Änderung?
- Läuft die App lokal oder auf Vercel?

**Lokal:**
- `.env` Datei muss ausgefüllt sein
- App muss neu gestartet werden (`npm run dev`)

**Vercel:**
- Environment-Variablen müssen in Vercel gesetzt sein
- Redeploy muss ausgeführt werden

---

## 🔧 Lösung Schritt-für-Schritt:

### Schritt 1: .env URL prüfen

1. **Öffne:** `.env` Datei
2. **Prüfe:** `VITE_SUPABASE_URL`
3. **Vergleiche:** Mit Supabase Dashboard → Settings → API → Project URL
4. **Müssen identisch sein!**

---

### Schritt 2: Edge Function Logs prüfen

1. **Supabase Dashboard** → **Edge Functions** → **artworks**
2. **Tab:** **Logs**
3. **Werk speichern** in App
4. **Was siehst du?**

**Erwartet:**
- ✅ POST Request zu `/functions/v1/artworks`
- ✅ Status 200 oder 201

**Falls Fehler:**
- ❌ Kopiere Fehlermeldung!

---

### Schritt 3: Edge Function testen

1. **Supabase Dashboard** → **Edge Functions** → **artworks**
2. **Tab:** **Test** oder **Invoke**
3. **Test ausführen**
4. **Funktioniert es?**

---

## 📋 Bitte prüfe:

1. **.env URL:** Ist sie korrekt? (Vergleiche mit Supabase Dashboard)
2. **Edge Function Logs:** Kommt Request an? (Ja/Nein)
3. **Edge Function Logs:** Siehst du Fehler? (Ja/Nein - wenn Ja: welche?)

Mit diesen Infos kann ich gezielt helfen!
