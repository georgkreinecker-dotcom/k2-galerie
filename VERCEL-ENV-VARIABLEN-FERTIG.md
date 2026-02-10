# ✅ Vercel Environment-Variablen - Fast fertig!

## 🎯 Status:

✅ **VITE_SUPABASE_URL** ist bereits hinzugefügt!
⏳ **VITE_SUPABASE_ANON_KEY** muss noch hinzugefügt werden

---

## 📋 Schritt-für-Schritt: Zweite Variable hinzufügen

### Schritt 1: "Add Environment Variable" klicken

1. **Im Vercel Dashboard:**
   - Du bist bereits bei "Environment Variables"
   - Oben rechts: **"Add Environment Variable"** Button klicken

---

### Schritt 2: Variable ausfüllen

1. **Name eingeben:**
   - **Key:** `VITE_SUPABASE_ANON_KEY`
   - (Genau so, groß geschrieben mit Unterstrichen)

2. **Value eingeben:**
   - **Value:** `sb_publishable_fa6tMCbi4g40m9XiyVUpBA__tpyb9h4`
   - (Dein anon key aus Supabase)

3. **Environments auswählen:**
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
   - (Alle drei auswählen!)

4. **"Add"** oder **"Save"** klicken

---

### Schritt 3: Prüfen

Nach dem Hinzufügen solltest du sehen:

- ✅ `VITE_SUPABASE_URL` → `https://sjqyeqnibwyxtwzcqklj.supabase.co`
- ✅ `VITE_SUPABASE_ANON_KEY` → `sb_publishable_fa6tMCbi4g40m9XiyVUpBA__tpyb9h4`

---

### Schritt 4: Redeploy

1. **Oben rechts:** **"Redeploy"** Button klicken
   - Oder: Gehe zu **"Deployments"** Tab
   - Neuestes Deployment → **"Redeploy"**

2. **Warten:** Deployment wird ausgeführt (einige Minuten)

3. **✅ Fertig!**

---

## ✅ Nach dem Redeploy:

Die App funktioniert jetzt mit Supabase!

### Testen:

1. **App öffnen:** Deine Vercel-URL
2. **Werk speichern** → sollte funktionieren
3. **Supabase Dashboard** → Table Editor → artworks → sollte Werk sehen

---

## 🆘 Falls etwas nicht funktioniert:

**Prüfe:**
- ✅ Beide Environment-Variablen sind gesetzt?
- ✅ Alle Environments ausgewählt? (Production, Preview, Development)
- ✅ Redeploy wurde ausgeführt?
- ✅ Deployment ist erfolgreich?

---

## 💡 Zusammenfassung:

**Was fertig ist:**
- ✅ Supabase Projekt
- ✅ Migration (Tabelle)
- ✅ Edge Function
- ✅ VITE_SUPABASE_URL in Vercel

**Was noch zu tun ist:**
- ⏳ VITE_SUPABASE_ANON_KEY in Vercel hinzufügen
- ⏳ Redeploy
- ⏳ Testen!
