# 🔧 Fix: Werk verschwindet nach Speichern

## 🚨 Problem:

1. ✅ Werk wird gespeichert (K2-M-0009)
2. ❌ Werk verschwindet aus Galerie
3. ❌ Werk verschwindet aus Admin
4. ❌ Gleiche Nummer wird wieder generiert

## 🔍 Ursache:

Das Werk wird möglicherweise **nicht korrekt in Supabase gespeichert** oder **nicht korrekt geladen**.

---

## ✅ Lösung:

### Schritt 1: Prüfe ob Werk in Supabase ist

1. **Supabase Dashboard** → **Table Editor** → **artworks**
2. **Suche nach:** K2-M-0009
3. **Ist es da?**

**Falls NEIN:**
- Problem: Speichern funktioniert nicht
- Lösung: Browser-Konsole prüfen (Cmd+Option+I)

**Falls JA:**
- Problem: Laden funktioniert nicht
- Lösung: Seite neu laden sollte helfen

---

### Schritt 2: Browser-Konsole prüfen

1. **Konsole öffnen:** Cmd+Option+I
2. **Tab:** "Console"
3. **Werk speichern** und schauen:

**Was du sehen solltest:**
- ✅ `✅ Werk in Supabase gespeichert: K2-M-0009`
- ✅ `✅ Werke aus Supabase geladen für Anzeige: X`
- ✅ `✅ X Werke aus Supabase geladen`

**Falls Fehler:**
- ❌ `❌ Supabase Save Error: ...`
- ❌ `❌ Fehler beim Speichern in Supabase: ...`
- → Kopiere die Fehlermeldung!

---

### Schritt 3: Manuell prüfen

**Im Browser-Konsole eingeben:**

```javascript
// Prüfe ob Supabase konfiguriert ist
console.log('URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'gesetzt' : 'FEHLT')
```

**Falls Key fehlt:**
- Lokal: `.env` Datei prüfen + App neu starten
- Production: Vercel Environment-Variablen prüfen + Redeploy

---

## 🔧 Mögliche Fixes:

### Fix 1: Seite nach Speichern neu laden

Nach dem Speichern:
- **Cmd+R** drücken
- Werk sollte jetzt sichtbar sein

### Fix 2: Supabase Table Editor prüfen

1. **Supabase Dashboard** → **Table Editor** → **artworks**
2. **Ist K2-M-0009 da?**
3. **Falls NEIN:** Werk wurde nicht gespeichert → Browser-Konsole prüfen
4. **Falls JA:** Werk wurde gespeichert → Problem beim Laden

### Fix 3: localStorage leeren und neu laden

**Im Browser-Konsole:**

```javascript
// localStorage leeren
localStorage.removeItem('k2-artworks')
// Seite neu laden
location.reload()
```

Dann sollte aus Supabase geladen werden.

---

## 📋 Bitte gib mir:

1. **Ist K2-M-0009 in Supabase?** (Table Editor prüfen)
2. **Browser-Konsole:** Was steht da? (Screenshot oder kopieren)
3. **Environment-Variablen:** Sind sie gesetzt? (Check 3)

Mit diesen Infos kann ich gezielt helfen!
