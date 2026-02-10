# 🚀 Edge Function deployen - Schritt für Schritt

## 📍 Du bist jetzt bei "Edge Functions" - perfekt!

Du siehst drei Optionen:
1. **Via Editor** ← **DIESE WÄHLEN!** (Einfachste Methode)
2. AI Assistant
3. Via CLI

---

## ✅ Schritt-für-Schritt:

### Schritt 1: Editor öffnen

1. **Klicke auf:** **"Open Editor"** Button (bei "Via Editor")
   - Oder: Oben rechts **"Deploy a new function"** → **"Via Editor"**

2. **Ein neues Fenster/Tab öffnet sich** mit einem Code-Editor

---

### Schritt 2: Funktion erstellen

1. **Im Editor siehst du:** Ein Template-Code (Hello World)
2. **Name der Funktion:** Oben im Editor sollte ein Feld sein für den Namen
   - **Name eingeben:** `artworks` (genau so, klein geschrieben)
   - Falls kein Name-Feld: Wird beim Speichern abgefragt

---

### Schritt 3: Code kopieren

1. **Öffne auf deinem Mac:** `supabase/functions/artworks/index.ts`
   - In Cursor: Links → `supabase` → `functions` → `artworks` → `index.ts`

2. **Alles kopieren:**
   - Alles markieren (Cmd+A)
   - Kopieren (Cmd+C)

---

### Schritt 4: Code einfügen

1. **Zurück zu Supabase Editor:**
   - **Alles löschen** was da steht (Template-Code)
   - Einfügen (Cmd+V)
   - Du solltest jetzt den TypeScript-Code sehen

---

### Schritt 5: Deployen

1. **Oben rechts:** **"Deploy"** Button klicken
   - Oder: **"Save and Deploy"**

2. **Warten:** Funktion wird deployed (einige Sekunden)

3. **✅ Sollte "Deployed" oder "Success" anzeigen!**

---

## 🎯 Was du sehen solltest:

**Nach dem Einfügen:**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
...
```

**Nicht:**
```
Hello World Template Code
```

---

## 💡 Tipp:

**Falls "Open Editor" nicht funktioniert:**
- Versuche: Oben rechts "Deploy a new function" → "Via Editor"
- Oder: Seite neu laden (Cmd+R)

**Falls Name-Feld fehlt:**
- Wird beim Deployen abgefragt
- Name: `artworks` (klein geschrieben)

---

## ✅ Nach erfolgreichem Deploy:

Die Edge Function ist jetzt aktiv!
→ Nächster Schritt: Vercel Environment-Variablen setzen
