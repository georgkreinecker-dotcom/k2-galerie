# 🔍 Debug: Werk speichern funktioniert nicht

## ❓ Was genau funktioniert nicht?

Bitte beschreibe genau:
1. **Wird das Werk gespeichert?** (Siehst du eine Erfolgsmeldung?)
2. **Wird das Werk angezeigt?** (Siehst du es in der Galerie?)
3. **Ist das Werk in Supabase?** (Supabase Dashboard → Table Editor → artworks)
4. **Gibt es Fehlermeldungen?** (Browser-Konsole öffnen: Cmd+Option+I)

---

## 🔍 Systematisches Debugging:

### Schritt 1: Browser-Konsole prüfen

1. **Browser öffnen:** Deine App-URL
2. **Konsole öffnen:** Cmd+Option+I (Mac) oder F12
3. **Tab:** "Console"
4. **Werk speichern** und schauen was passiert

**Was du sehen solltest:**
- ✅ `✅ Gespeichert: X Werke`
- ✅ `✅ X Werke in Supabase gespeichert`
- ❌ Falls Fehler: Kopiere die Fehlermeldung!

---

### Schritt 2: Supabase prüfen

1. **Supabase Dashboard öffnen**
2. **Table Editor** → **artworks**
3. **Prüfen:** Ist das Werk da?

**Falls Werk NICHT in Supabase:**
- Problem: Speichern funktioniert nicht
- Lösung: Edge Function prüfen

**Falls Werk IN Supabase:**
- Problem: Laden funktioniert nicht
- Lösung: Lade-Logik prüfen

---

### Schritt 3: Environment-Variablen prüfen

**Lokale Entwicklung (.env):**
- Prüfe: `.env` Datei ist ausgefüllt?
- Prüfe: App neu gestartet nach .env Änderung?

**Production (Vercel):**
- Prüfe: Environment-Variablen sind gesetzt?
- Prüfe: Redeploy wurde ausgeführt?

---

### Schritt 4: Edge Function prüfen

1. **Supabase Dashboard** → **Edge Functions** → **artworks**
2. **Tab:** "Logs"
3. **Werk speichern** und schauen ob Requests ankommen

**Was du sehen solltest:**
- ✅ POST Requests zu `/functions/v1/artworks`
- ❌ Falls keine Requests: App kann Edge Function nicht erreichen

---

## 🆘 Häufige Probleme:

### Problem 1: Werk wird gespeichert, aber nicht angezeigt

**Ursache:** Laden funktioniert nicht
**Lösung:** 
- Prüfe Browser-Konsole auf Fehler
- Prüfe ob `loadArtworksFromSupabase()` aufgerufen wird

### Problem 2: Werk wird nicht gespeichert

**Ursache:** Supabase nicht erreichbar oder Edge Function Fehler
**Lösung:**
- Prüfe Environment-Variablen
- Prüfe Edge Function Logs
- Prüfe Browser-Konsole

### Problem 3: Werk ist in Supabase, aber nicht in App

**Ursache:** Lade-Logik lädt nicht aus Supabase
**Lösung:**
- Prüfe ob `isSupabaseConfigured()` true zurückgibt
- Prüfe ob `loadArtworksFromSupabase()` aufgerufen wird

---

## 💡 Schnell-Check:

**Öffne Browser-Konsole und prüfe:**

```javascript
// Prüfe ob Supabase konfiguriert ist
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'gesetzt' : 'FEHLT')
```

**Falls Key fehlt:**
- .env Datei prüfen
- App neu starten
- Vercel Environment-Variablen prüfen

---

## 📋 Bitte gib mir:

1. **Was genau passiert?** (Werk speichern → was siehst du?)
2. **Fehlermeldungen?** (Browser-Konsole)
3. **Ist Werk in Supabase?** (Table Editor prüfen)
4. **Wird Werk angezeigt?** (In der Galerie sichtbar?)
