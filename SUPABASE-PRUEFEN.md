# ✅ Supabase prüfen - Sind die Werke da?

## 🎯 Was ich sehe:

Die Galerie zeigt bereits Werke:
- ✅ K2-0004 "aha" (Malerei)
- ✅ K2-0005 "Teller" (Keramik)
- ✅ K2-0006 "Skulptur" (Keramik)
- ✅ K2-0007 "Vase" (Keramik)

**Das ist gut!** Die App funktioniert grundsätzlich.

---

## ❓ Was genau funktioniert nicht?

Bitte beschreibe genau:

1. **Werden neue Werke gespeichert?**
   - Versuche ein neues Werk zu speichern
   - Siehst du eine Erfolgsmeldung?
   - Oder Fehlermeldung?

2. **Werden neue Werke angezeigt?**
   - Nach dem Speichern: Siehst du das neue Werk in der Galerie?
   - Oder verschwindet es wieder?

3. **Sind die Werke in Supabase?**
   - Supabase Dashboard → Table Editor → artworks
   - Siehst du die Werke dort?

---

## 🔍 Schnell-Check: Supabase prüfen

### Schritt 1: Supabase Dashboard öffnen

1. **Gehe zu:** https://supabase.com
2. **Melde dich an**
3. **Wähle Projekt:** `k2-galerie-test`

### Schritt 2: Table Editor öffnen

1. **Links:** **Table Editor**
2. **Tabelle:** **artworks**
3. **Prüfen:** Siehst du die Werke?

**Falls JA:**
- ✅ Supabase funktioniert!
- Problem liegt wahrscheinlich beim Laden/Anzeigen

**Falls NEIN:**
- ❌ Werke werden nicht in Supabase gespeichert
- Problem liegt beim Speichern

---

## 🔍 Browser-Konsole prüfen

1. **Konsole öffnen:** Cmd+Option+I
2. **Tab:** "Console"
3. **Neues Werk speichern**
4. **Was siehst du?**

**Erwartet:**
- ✅ `✅ Gespeichert: X Werke`
- ✅ `✅ X Werke in Supabase gespeichert`
- ✅ `✅ X Werke aus Supabase geladen`

**Falls Fehler:**
- ❌ Kopiere die Fehlermeldung!

---

## 💡 Mögliche Probleme:

### Problem 1: Werke werden gespeichert, aber nicht angezeigt

**Ursache:** Laden funktioniert nicht richtig
**Lösung:** Prüfe Browser-Konsole auf Fehler beim Laden

### Problem 2: Werke werden nicht in Supabase gespeichert

**Ursache:** Edge Function nicht erreichbar oder Fehler
**Lösung:** 
- Prüfe Edge Function Logs (Supabase → Edge Functions → artworks → Logs)
- Prüfe Browser-Konsole auf Fehler

### Problem 3: Werke verschwinden nach Reload

**Ursache:** Werden nur in localStorage gespeichert, nicht in Supabase
**Lösung:** Prüfe ob Supabase konfiguriert ist (Environment-Variablen)

---

## 📋 Bitte gib mir:

1. **Sind die Werke in Supabase?** (Table Editor prüfen)
2. **Was passiert beim Speichern?** (Browser-Konsole)
3. **Was genau funktioniert nicht?** (Beschreibung)

Mit diesen Infos kann ich gezielt helfen!
