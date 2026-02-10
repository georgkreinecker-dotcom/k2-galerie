# 🔄 Migration: localStorage → Supabase

## Übersicht

Diese Anleitung zeigt, wie bestehende Daten von localStorage zu Supabase migriert werden.

## Schritt 1: Supabase Setup

Siehe `SUPABASE-SETUP-PROFESSIONELL.md` für vollständiges Setup.

## Schritt 2: Bestehende Daten exportieren

### Option A: Automatisch beim ersten Laden

Die App lädt automatisch aus Supabase, wenn konfiguriert. Wenn Supabase leer ist, werden localStorage-Daten automatisch synchronisiert.

### Option B: Manueller Export

```javascript
// In Browser-Konsole ausführen:
const artworks = JSON.parse(localStorage.getItem('k2-artworks') || '[]')
console.log('Anzahl Werke:', artworks.length)
console.log('JSON:', JSON.stringify(artworks, null, 2))
```

## Schritt 3: Daten importieren

### Option A: Über die App

1. Supabase konfigurieren (`.env` Datei)
2. App neu laden
3. Die App synchronisiert automatisch localStorage → Supabase beim ersten Laden

### Option B: Direkt über Supabase Dashboard

1. Öffne Supabase Dashboard → SQL Editor
2. Führe aus:

```sql
-- Beispiel: Ein Werk einfügen
INSERT INTO artworks (
  number, title, category, image_url, price, description, location, in_shop
) VALUES (
  'K2-M-0001',
  'Mein erstes Werk',
  'malerei',
  'https://example.com/image.jpg',
  150.00,
  'Beschreibung',
  'Regal 1',
  true
);
```

### Option C: Über Edge Function API

```bash
curl -X POST https://dein-projekt.supabase.co/functions/v1/artworks \
  -H "Authorization: Bearer dein-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "artworks": [
      {
        "number": "K2-M-0001",
        "title": "Mein Werk",
        "category": "malerei",
        "image_url": "https://example.com/image.jpg"
      }
    ]
  }'
```

## Schritt 4: Verifizierung

1. Öffne Supabase Dashboard → Table Editor → artworks
2. Prüfe ob alle Werke vorhanden sind
3. Prüfe Anzahl: `SELECT COUNT(*) FROM artworks;`

## Schritt 5: Cleanup (optional)

Nach erfolgreicher Migration kannst du localStorage leeren:

```javascript
// In Browser-Konsole:
localStorage.removeItem('k2-artworks')
```

**WICHTIG:** Nur wenn Supabase funktioniert und alle Daten migriert sind!

## Troubleshooting

### Problem: Daten werden nicht synchronisiert

**Lösung:** Prüfe Supabase-Konfiguration und Edge Function

### Problem: Doppelte Einträge

**Lösung:** Die `number` Spalte ist UNIQUE - Duplikate werden automatisch überschrieben (UPSERT)

### Problem: Fehlende Felder

**Lösung:** Prüfe Datenbank-Schema - alle Felder sind optional außer `number`, `title`, `category`

## Automatische Migration

Die App führt automatisch eine Migration durch:

1. **Beim ersten Laden:** Lädt aus Supabase
2. **Wenn Supabase leer:** Lädt aus localStorage und speichert in Supabase
3. **Bei jedem Speichern:** Synchronisiert localStorage ↔ Supabase

Du musst nichts manuell machen - die App macht es automatisch! 🎉
