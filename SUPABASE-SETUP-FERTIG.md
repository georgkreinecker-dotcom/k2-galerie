# ✅ Supabase Setup fast fertig!

## 🎉 Was bereits erledigt ist:

1. ✅ **Supabase Projekt erstellt:** `k2-galerie-test`
2. ✅ **.env Datei ausgefüllt:** URL und Key eingetragen
3. ✅ **Migration ausgeführt:** Tabelle `artworks` erstellt
4. ✅ **Edge Function deployed:** `artworks` Funktion ist aktiv!

---

## 🎯 Nächster Schritt: Vercel Environment-Variablen

Damit die App in Production (Vercel) funktioniert, musst du die Environment-Variablen in Vercel setzen:

### Schritt 1: Vercel öffnen

1. **Gehe zu:** https://vercel.com
2. **Melde dich an**
3. **Wähle Projekt:** `k2-galerie`

---

### Schritt 2: Environment-Variablen hinzufügen

1. **Im Vercel Dashboard:**
   - Klicke auf dein Projekt `k2-galerie`
   - Oben: **"Settings"** Tab
   - Links: **"Environment Variables"**

2. **Füge hinzu:**

   **Variable 1:**
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://sjqyeqnibwyxtwzcqklj.supabase.co`
   - **Environment:** Production, Preview, Development (alle auswählen)
   - **"Add"** klicken

   **Variable 2:**
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** `sb_publishable_fa6tMCbi4g40m9XiyVUpBA__tpyb9h4`
   - **Environment:** Production, Preview, Development (alle auswählen)
   - **"Add"** klicken

---

### Schritt 3: Redeploy

1. **Nach dem Hinzufügen:**
   - Oben rechts: **"Redeploy"** Button
   - Oder: **"Deployments"** Tab → Neuestes Deployment → **"Redeploy"**
   - Warte bis Deployment fertig ist

---

## ✅ Fertig!

Nach dem Redeploy funktioniert die App mit Supabase!

### Testen:

1. **App öffnen:** Deine Vercel-URL
2. **Werk speichern** → sollte funktionieren
3. **Supabase Dashboard** → Table Editor → artworks → sollte Werk sehen

---

## 🆘 Falls etwas nicht funktioniert:

**Prüfe:**
- ✅ .env Datei ist ausgefüllt? (für lokale Entwicklung)
- ✅ Vercel Environment-Variablen sind gesetzt? (für Production)
- ✅ Migration wurde ausgeführt? (SQL Editor → sollte "Success" zeigen)
- ✅ Edge Function wurde deployed? (Edge Functions → sollte `artworks` sehen)

---

## 💡 Zusammenfassung:

**Was funktioniert jetzt:**
- ✅ Datenbank (PostgreSQL)
- ✅ Edge Function API
- ✅ Frontend kann mit Supabase kommunizieren

**Was noch zu tun ist:**
- ⏳ Vercel Environment-Variablen setzen
- ⏳ Redeploy
- ⏳ Testen!
