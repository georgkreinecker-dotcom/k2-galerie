# 🔄 Supabase-Setup für Echtzeit-Synchronisation

## 🎯 Was wurde implementiert?

Die K2 Galerie verwendet jetzt **Supabase KV Store** für die Echtzeit-Synchronisation der Werke zwischen allen Geräten.

**Vorteile:**
- ✅ Werke sind sofort auf allen Geräten verfügbar
- ✅ Änderungen werden automatisch synchronisiert
- ✅ Auto-Refresh alle 3 Sekunden
- ✅ Fallback zu localStorage wenn Supabase nicht konfiguriert ist

## ⚙️ Setup

### 1. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Notiere die **Project URL** und **anon key**

### 2. Environment-Variablen setzen

Erstelle eine `.env` Datei im Projekt-Root:

```bash
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

### 3. Supabase Edge Function erstellen

Erstelle eine Edge Function für den KV Store:

**`supabase/functions/kv_store/index.ts`:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { key, value } = await req.json()
  
  // Hier würde normalerweise Supabase KV Store verwendet werden
  // Für jetzt: Einfache Implementierung mit Supabase Database
  
  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/rest/v1/kv_store`,
    {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_ANON_KEY')!,
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      },
      body: req.method === 'POST' ? JSON.stringify({ key, value }) : undefined,
    }
  )
  
  return new Response(JSON.stringify(await response.json()), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 4. Alternative: Ohne Supabase (nur localStorage)

Wenn Supabase nicht konfiguriert ist, funktioniert die App weiterhin mit localStorage. Die Daten sind dann aber nur lokal auf dem jeweiligen Gerät verfügbar.

## 🔄 Wie es funktioniert

1. **Speichern:** Wenn ein Werk gespeichert wird, wird es sowohl in Supabase als auch in localStorage gespeichert
2. **Laden:** Die App lädt zuerst aus Supabase, falls verfügbar, sonst aus localStorage
3. **Auto-Refresh:** Alle 3 Sekunden werden die Daten automatisch aktualisiert
4. **Events:** Bei Änderungen wird ein `artworks-updated` Event ausgelöst

## 📝 Code-Änderungen

- ✅ `src/utils/supabaseClient.ts` - Supabase-Client-Utility
- ✅ `components/ScreenshotExportAdmin.tsx` - Speichert in Supabase
- ✅ `src/pages/GalerieVorschauPage.tsx` - Lädt aus Supabase mit Auto-Refresh

## 🚀 Nächste Schritte

1. Supabase-Projekt erstellen
2. Environment-Variablen setzen
3. Edge Function deployen (optional, für bessere Performance)
4. Testen: Werk auf Handy anlegen → sollte sofort auf Mac sichtbar sein
