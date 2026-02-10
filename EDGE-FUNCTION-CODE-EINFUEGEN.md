# 🔧 Edge Function Code richtig einfügen

## 🚨 Problem:

Du siehst noch den Template-Code ("Hello World") und am Ende steht "artworks" - das ist falsch!

Du musst den **kompletten Code** aus der Datei einfügen.

---

## ✅ Lösung Schritt-für-Schritt:

### Schritt 1: Alles löschen

1. **Im Supabase Editor:**
   - Alles markieren (Cmd+A)
   - Löschen (Backspace oder Delete)
   - Editor sollte komplett leer sein

---

### Schritt 2: Code kopieren

1. **In Cursor:**
   - Öffne: `supabase/functions/artworks/index.ts`
   - Links in Sidebar: `supabase` → `functions` → `artworks` → `index.ts`
   - Klicke darauf

2. **Alles kopieren:**
   - Alles markieren (Cmd+A)
   - Kopieren (Cmd+C)
   - Du solltest viel Code sehen (über 200 Zeilen)

---

### Schritt 3: Code einfügen

1. **Zurück zu Supabase Editor:**
   - In den Editor klicken (sollte leer sein)
   - Einfügen (Cmd+V)
   - Du solltest jetzt den kompletten TypeScript-Code sehen

---

### Schritt 4: Funktion benennen

1. **Oben im Editor:**
   - Suche nach einem Feld für den Funktionsnamen
   - Oder: Links oben sollte ein Feld sein
   - **Name eingeben:** `artworks` (klein geschrieben)
   - Falls kein Name-Feld: Wird beim Deployen abgefragt

---

### Schritt 5: Deployen

1. **Oben rechts:**
   - **"Deploy"** Button klicken
   - Oder: **"Save and Deploy"**

2. **Warten:** Funktion wird deployed (einige Sekunden)

3. **✅ Sollte "Deployed" oder "Success" anzeigen!**

---

## 🎯 Was du sehen solltest:

**RICHTIG** (nach dem Einfügen):
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  ...
```

**FALSCH:**
```
Hello World Template Code
artworks
```

---

## 💡 Tipp:

**Falls Code nicht einfügbar ist:**
- Prüfe: Ist Editor leer? (Alles löschen!)
- Prüfe: Hast du wirklich alles kopiert? (Sollte über 200 Zeilen sein)
- Versuche: Seite neu laden (Cmd+R) und nochmal

**Falls Name-Feld fehlt:**
- Wird beim Deployen abgefragt
- Name: `artworks` (klein geschrieben)
