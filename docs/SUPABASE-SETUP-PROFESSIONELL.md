# 🗄️ Supabase Setup - Professionelle Datenbank-Integration

## ✅ Was wurde implementiert

### 1. Datenbank-Schema
- **Tabelle:** `artworks` mit allen notwendigen Feldern
- **Indexes:** Für schnelle Suche nach number, category, tenant
- **RLS:** Row Level Security für öffentliche Leserechte
- **Triggers:** Automatische `updated_at` Aktualisierung

### 2. Edge Function
- **REST API:** `/functions/v1/artworks`
- **Endpoints:** GET, POST, PUT, DELETE
- **CORS:** Konfiguriert für alle Origins
- **Error Handling:** Professionelles Error Handling

### 3. Client-Integration
- **TypeScript:** Vollständig typisiert
- **Fallback:** localStorage als Backup
- **Synchronisation:** Mobile ↔ Mac Sync
- **Bulk Operations:** Effiziente Batch-Operationen

## 🚀 Setup-Schritte

### Schritt 1: Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Notiere:
   - **Project URL** (z.B. `https://xxxxx.supabase.co`)
   - **anon key** (aus Settings → API)

### Schritt 2: Datenbank-Migration ausführen

1. Öffne Supabase Dashboard
2. Gehe zu **SQL Editor**
3. Kopiere den Inhalt von `supabase/migrations/001_create_artworks_table.sql`
4. Führe die Migration aus (RUN)

### Schritt 3: Edge Function deployen

**Option A: Mit Supabase CLI (empfohlen)**

```bash
# Supabase CLI installieren
npm install -g supabase

# Login
supabase login

# Link zum Projekt
supabase link --project-ref dein-projekt-ref

# Function deployen
supabase functions deploy artworks
```

**Option B: Manuell im Dashboard**

1. Gehe zu **Edge Functions** im Dashboard
2. Erstelle neue Function: `artworks`
3. Kopiere den Inhalt von `supabase/functions/artworks/index.ts`
4. Deploy

### Schritt 4: Environment-Variablen setzen

Erstelle `.env` Datei im Projekt-Root:

```bash
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

**WICHTIG:** `.env` ist in `.gitignore` - niemals committen!

### Schritt 5: Vercel Environment-Variablen

Für Production auf Vercel:

1. Gehe zu Vercel Dashboard → Project → Settings → Environment Variables
2. Füge hinzu:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Redeploy

## 🔄 Datenfluss

```
Frontend (React)
    ↓
Supabase Client (supabaseClient.ts)
    ↓
Supabase Edge Function (/functions/v1/artworks)
    ↓
PostgreSQL Datenbank (artworks Tabelle)
    ↓
RLS Policies (Sicherheit)
```

## 📊 Datenbank-Struktur

### Tabelle: artworks

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| id | UUID | Primärschlüssel |
| number | TEXT | Eindeutige Nummer (z.B. "K2-M-0001") |
| title | TEXT | Titel des Werks |
| category | TEXT | 'malerei' oder 'keramik' |
| image_url | TEXT | URL zum Bild |
| preview_url | TEXT | URL zum Vorschaubild |
| price | DECIMAL | Preis |
| description | TEXT | Beschreibung |
| location | TEXT | Standort (z.B. "Regal 1") |
| in_shop | BOOLEAN | Im Shop verfügbar |
| created_at | TIMESTAMPTZ | Erstellungsdatum |
| updated_at | TIMESTAMPTZ | Letzte Änderung |
| created_on_mobile | BOOLEAN | Auf Mobile erstellt |
| updated_on_mobile | BOOLEAN | Auf Mobile aktualisiert |
| tenant_id | TEXT | Multi-Tenant Support |

## 🔒 Sicherheit

- **RLS aktiviert:** Row Level Security für alle Tabellen
- **Public Read:** Alle können Werke lesen (öffentliche Galerie)
- **Write:** Aktuell für alle (später mit Auth erweitern)
- **CORS:** Konfiguriert für sichere Cross-Origin Requests

## 🧪 Testing

### Test 1: Datenbank-Verbindung

```typescript
import { isSupabaseConfigured } from './utils/supabaseClient'

console.log('Supabase konfiguriert:', isSupabaseConfigured())
```

### Test 2: Werke laden

```typescript
import { loadArtworksFromSupabase } from './utils/supabaseClient'

const artworks = await loadArtworksFromSupabase()
console.log('Geladene Werke:', artworks.length)
```

### Test 3: Werk speichern

```typescript
import { saveArtworkToSupabase } from './utils/supabaseClient'

const artwork = {
  number: 'K2-M-0001',
  title: 'Test Werk',
  category: 'malerei',
  imageUrl: 'https://example.com/image.jpg'
}

await saveArtworkToSupabase(artwork)
```

## 🐛 Troubleshooting

### Problem: "Supabase nicht konfiguriert"

**Lösung:** Prüfe `.env` Datei und Environment-Variablen

### Problem: "Permission denied"

**Lösung:** Prüfe RLS Policies in Supabase Dashboard

### Problem: "Function not found"

**Lösung:** Edge Function deployen (siehe Schritt 3)

### Problem: "Table does not exist"

**Lösung:** Migration ausführen (siehe Schritt 2)

## 📝 Nächste Schritte

1. ✅ Datenbank-Schema erstellt
2. ✅ Edge Function implementiert
3. ✅ Client-Integration fertig
4. ⏳ Frontend-Code anpassen (läuft automatisch)
5. ⏳ Migration von localStorage zu Supabase
6. ⏳ Testing & Deployment

## 💡 Vorteile dieser Lösung

- ✅ **Professionell:** Echte Datenbank statt JSON-Dateien
- ✅ **Skalierbar:** PostgreSQL kann Millionen von Werken handhaben
- ✅ **Sicher:** RLS für Zugriffskontrolle
- ✅ **Schnell:** Indexes für optimale Performance
- ✅ **Multi-Tenant:** Bereit für mehrere Galerien
- ✅ **Real-time:** Supabase unterstützt Real-time Subscriptions (später)
