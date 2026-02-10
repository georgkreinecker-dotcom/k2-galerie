# ⚠️ Falscher Funktionsname!

## 🚨 Problem:

Du hast eine Funktion namens **"quick-task"** erstellt - das ist falsch!

Die Funktion muss **"artworks"** heißen (genau so, klein geschrieben).

---

## ✅ Lösung: Neue Funktion erstellen

### Option 1: Neue Funktion "artworks" erstellen (empfohlen)

1. **Im Supabase Dashboard:**
   - Links: **Edge Functions**
   - Oben rechts: **"Deploy a new function"** klicken
   - Oder: **"Create a new function"** Button

2. **Name eingeben:**
   - **WICHTIG:** Name muss genau **"artworks"** sein (klein geschrieben)
   - Nicht "quick-task" oder "artworks-test" oder ähnlich
   - Genau: **`artworks`**

3. **"Create function"** oder **"Deploy"** klicken

4. **Code einfügen:**
   - Editor öffnet sich
   - Alles löschen (Template-Code)
   - Code aus `supabase/functions/artworks/index.ts` kopieren
   - Einfügen (Cmd+V)

5. **Deployen:**
   - "Deploy" Button klicken
   - ✅ Funktion "artworks" ist jetzt deployed!

---

### Option 2: "quick-task" umbenennen (falls möglich)

1. **Im Supabase Dashboard:**
   - Öffne Funktion "quick-task"
   - Tab: **"Details"**
   - Rechts: **"Name"** Feld
   - Ändere zu: **`artworks`**
   - **"Save changes"** klicken

**Hinweis:** Nicht alle Supabase-Versionen erlauben Umbenennung. Besser: Neue Funktion erstellen!

---

## 🎯 Wichtig:

**Die Funktion MUSS genau "artworks" heißen!**

- ✅ RICHTIG: `artworks`
- ❌ FALSCH: `quick-task`
- ❌ FALSCH: `artworks-test`
- ❌ FALSCH: `Artworks` (groß geschrieben)

**Warum?**
- Die App erwartet die Funktion unter `/functions/v1/artworks`
- Andere Namen funktionieren nicht!

---

## 📋 Nach dem Erstellen:

1. ✅ Funktion "artworks" erstellt
2. ✅ Code eingefügt
3. ✅ Deployed
4. ✅ Nächster Schritt: Vercel Environment-Variablen setzen

---

## 💡 Tipp:

**"quick-task" kannst du später löschen:**
- Edge Functions → "quick-task" öffnen
- Settings → Delete Function
- Oder einfach ignorieren (stört nicht)
