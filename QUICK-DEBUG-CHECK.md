# 🔍 Quick Debug Check

## ❓ Was genau bedeutet "funktioniert aber trotzdem nicht"?

Bitte prüfe diese 3 Dinge:

---

## ✅ Check 1: Browser-Konsole

1. **Browser öffnen:** Deine App-URL
2. **Konsole öffnen:** Cmd+Option+I (Mac) oder F12
3. **Tab:** "Console"
4. **Werk speichern**
5. **Was siehst du?**

**Erwartet:**
- ✅ `✅ Gespeichert: X Werke`
- ✅ `✅ X Werke in Supabase gespeichert`
- ✅ `✅ X Werke aus Supabase geladen`

**Falls Fehler:**
- ❌ Kopiere die Fehlermeldung!

---

## ✅ Check 2: Supabase Table Editor

1. **Supabase Dashboard öffnen**
2. **Table Editor** → **artworks**
3. **Ist das Werk da?**

**Falls JA:** Problem beim Laden
**Falls NEIN:** Problem beim Speichern

---

## ✅ Check 3: Environment-Variablen

**Im Browser-Konsole eingeben:**

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'gesetzt' : 'FEHLT')
```

**Falls Key fehlt:**
- Lokal: `.env` Datei prüfen + App neu starten
- Production: Vercel Environment-Variablen prüfen + Redeploy

---

## 🆘 Häufige Probleme:

### Problem: "Werk wird gespeichert, verschwindet aber wieder"

**Ursache:** Laden funktioniert nicht
**Lösung:** Prüfe Browser-Konsole auf Fehler beim Laden

### Problem: "Werk wird nicht gespeichert"

**Ursache:** Supabase nicht erreichbar
**Lösung:** Prüfe Environment-Variablen + Edge Function Logs

### Problem: "Werk ist in Supabase, aber nicht sichtbar"

**Ursache:** Lade-Logik lädt nicht aus Supabase
**Lösung:** Prüfe ob `isSupabaseConfigured()` true ist

---

## 📋 Bitte gib mir:

1. **Browser-Konsole:** Was steht da? (Screenshot oder kopieren)
2. **Supabase Table Editor:** Ist Werk da? (Ja/Nein)
3. **Environment-Variablen:** Sind sie gesetzt? (Check 3)
