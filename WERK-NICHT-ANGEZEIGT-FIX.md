# 🔍 Werk wird gespeichert, aber nicht angezeigt

## ✅ Was funktioniert:

- ✅ Werk wird gespeichert (K2-M-0009)
- ✅ Erfolgsmeldung erscheint
- ✅ Gesamt Werke: 6

## ❌ Problem:

- ❌ Werk erscheint nicht in der Liste

---

## 🔍 Mögliche Ursachen:

### Problem 1: Filter aktiv

**Prüfe:** Ist ein Filter aktiv?
- "Alle Werke" → sollte alles zeigen
- "Malerei" → sollte nur Malerei zeigen
- "Keramik" → sollte nur Keramik zeigen

**Lösung:** Klicke auf **"Alle Werke"** Filter

---

### Problem 2: Seite nicht neu geladen

**Prüfe:** Nach dem Speichern - wurde die Seite aktualisiert?

**Lösung:** 
- Seite neu laden (Cmd+R)
- Oder: Scroll nach oben/unten
- Oder: Filter wechseln (z.B. "Keramik" → "Alle Werke")

---

### Problem 3: Werk ist nicht in Supabase

**Prüfe:** 
1. Supabase Dashboard → Table Editor → artworks
2. Suche nach "K2-M-0009"
3. Ist es da?

**Falls NEIN:**
- Problem: Speichern funktioniert nicht richtig
- Lösung: Browser-Konsole prüfen (Cmd+Option+I)

**Falls JA:**
- Problem: Laden funktioniert nicht richtig
- Lösung: Seite neu laden

---

### Problem 4: Timing-Problem

**Problem:** Werk wird gespeichert, aber Anzeige aktualisiert sich nicht sofort

**Lösung:**
- Seite neu laden (Cmd+R)
- Oder: Warte 5 Sekunden und prüfe nochmal

---

## ✅ Schnell-Fix:

1. **Filter prüfen:** Klicke auf **"Alle Werke"**
2. **Seite neu laden:** Cmd+R
3. **Prüfen:** Siehst du jetzt K2-M-0009?

---

## 🔍 Browser-Konsole prüfen:

1. **Konsole öffnen:** Cmd+Option+I
2. **Tab:** "Console"
3. **Nach dem Speichern schauen:**
   - Siehst du `✅ Werk in Supabase gespeichert: K2-M-0009`?
   - Siehst du `✅ Werke aus Supabase geladen für Anzeige: X`?
   - Siehst du Fehler?

**Falls Fehler:** Kopiere die Fehlermeldung!

---

## 📋 Bitte prüfe:

1. **Filter:** Ist "Alle Werke" aktiv?
2. **Seite neu laden:** Cmd+R → Siehst du das Werk jetzt?
3. **Supabase:** Ist K2-M-0009 in Table Editor?
4. **Browser-Konsole:** Was steht da?

Mit diesen Infos kann ich gezielt helfen!
